package com.angoram.school.config;

import com.angoram.school.auth.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.cors.*;
import java.util.*;

// ── UserDetailsServiceImpl ────────────────────────────────────
@Component
class UserDetailsServiceImpl implements UserDetailsService {
    private final AppUserRepository repo;
    UserDetailsServiceImpl(AppUserRepository r) { repo = r; }

    @Override
    public UserDetails loadUserByUsername(String username) {
        var user = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }
}

// ── JwtAuthFilter ─────────────────────────────────────────────
@Component
class JwtAuthFilter extends org.springframework.web.filter.OncePerRequestFilter {
    private final JwtService jwt;
    private final UserDetailsService uds;

    JwtAuthFilter(JwtService j, UserDetailsService u) { jwt = j; uds = u; }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws java.io.IOException, jakarta.servlet.ServletException {
        String auth = req.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            try {
                String token    = auth.substring(7);
                String username = jwt.extract(token);
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails ud = uds.loadUserByUsername(username);
                    if (jwt.valid(token, ud)) {
                        var a = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                        a.setDetails(new org.springframework.security.web.authentication
                                .WebAuthenticationDetailsSource().buildDetails(req));
                        SecurityContextHolder.getContext().setAuthentication(a);
                    }
                }
            } catch (Exception ignored) {}
        }
        chain.doFilter(req, res);
    }
}

// ── AuthController ────────────────────────────────────────────
@RestController
@RequestMapping("/api/auth")
class AuthController {
    private final AuthenticationManager am;
    private final JwtService jwt;
    private final AppUserRepository userRepo;

    AuthController(AuthenticationManager a, JwtService j, AppUserRepository r) {
        am = a; jwt = j; userRepo = r;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        try {
            am.authenticate(new UsernamePasswordAuthenticationToken(
                    body.get("username"), body.get("password")));
            var user = userRepo.findByUsername(body.get("username")).orElseThrow();
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("token",    jwt.generate(user.getUsername()));
            resp.put("username", user.getUsername());
            resp.put("role",     user.getRole().name());
            resp.put("fullName", user.getFullName());
            return ResponseEntity.ok(resp);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }
}

// ── SecurityConfig ────────────────────────────────────────────
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {

    private final JwtAuthFilter     jwtFilter;
    private final UserDetailsService uds;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    SecurityConfig(JwtAuthFilter f, UserDetailsService u) { jwtFilter = f; uds = u; }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(frontendUrl, "http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http
                .csrf(c -> c.disable())
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(o -> o.disable())
                .formLogin(f -> f.disable())
                .httpBasic(b -> b.disable())
                .authenticationProvider(provider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean public DaoAuthenticationProvider provider() {
        var p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(encoder());
        return p;
    }

    @Bean public AuthenticationManager am(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }

    @Bean public PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }
}

// ── GlobalExceptionHandler ────────────────────────────────────
@org.springframework.web.bind.annotation.RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handle(RuntimeException e) {
        HttpStatus status = e.getMessage() != null && e.getMessage().contains("not found")
                ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "An error occurred",
                        "timestamp", java.time.LocalDateTime.now().toString()));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDupe(
            org.springframework.dao.DataIntegrityViolationException e) {
        String msg = e.getMostSpecificCause().getMessage();
        String friendly = msg.contains("student_number") ? "A student with that number already exists."
                : msg.contains("username")       ? "That username is already taken."
                  : "A duplicate record already exists.";
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", friendly));
    }
}