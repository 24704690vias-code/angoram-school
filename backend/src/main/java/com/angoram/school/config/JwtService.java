// ── JwtService.java ───────────────────────────────────────────
package com.angoram.school.config;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    @Value("${jwt.secret}") private String secret;
    @Value("${jwt.expiration}") private long expiry;
    private Key key(){ return Keys.hmacShaKeyFor(secret.getBytes()); }
    public String generate(String username){ return Jwts.builder().setSubject(username).setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis()+expiry)).signWith(key()).compact(); }
    public String extract(String token){ return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody().getSubject(); }
    public boolean valid(String token, UserDetails u){ try{ return extract(token).equals(u.getUsername())&&!Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody().getExpiration().before(new Date()); }catch(Exception e){ return false; } }
}
