import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/hooks/useAuth';
import Input from '../../../shared/components/ui/Input';



const ROLES = [
  { role: 'ADMIN',     label: 'Administrator', icon: '🔑', desc: 'Full system access'        },
  { role: 'PRINCIPAL', label: 'Principal',      icon: '🎓', desc: 'Reports & oversight'       },
  { role: 'TEACHER',   label: 'Teacher',        icon: '📚', desc: 'Attendance & assessments'  },
];



export default function LoginPage() {
  const [form,       setForm]       = useState({ username: '', password: '' });
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.username, form.password);
      nav('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const selectRole = (r) => {
    setActiveRole(r.role);
    setForm(p => ({ ...p, username: r.role === 'ADMIN' ? 'admin' : r.role.toLowerCase() }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{ width: '100%', maxWidth: '760px' }}>
        <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>

          {/* Badge — from uploaded style */}
          <div className="badge" style={{ marginBottom: '24px' }}>
            <span className="dot" />
            IS316 Systems Implementation · PNG University of Technology
          </div>

          {/* School logo */}
          <div style={{ margin: '0 auto 24px', width: 120, height: 120 }}>
            <img
              src="/logo.jpeg"
              alt="Angoram Secondary School Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
                boxShadow: '0 0 0 3px rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4)',
              }}
            />
          </div>

          {/* Heading */}
          <h1 style={{ marginBottom: '18px' }}>
            Angoram Secondary School
          </h1>

          {/* Lead — from uploaded style */}
          <p className="lead" style={{ margin: '0 auto 30px' }}>
            Student Registration &amp; Management System for Grades 9–12.
            East Sepik Province, Papua New Guinea.
          </p>

          {/* Info grid — from uploaded style */}
          <div className="info" style={{ margin: '30px 0' }}>
            <div className="info-box">
              <h3>📊 System Features</h3>
              <p>Student enrolment, class assignment, fee payments, attendance marking, assessment recording, and year-end progression.</p>
            </div>
            <div className="info-box">
              <h3>🔐 Role-Based Access</h3>
              <p>Administrators manage everything. Principals oversee reports. Teachers record attendance and marks for their classes.</p>
            </div>
            <div className="info-box">
              <h3>📋 Academic Year 2026</h3>
              <p>Currently tracking registrations, terms, assessments, and fee collections for the 2026 academic year.</p>
            </div>
            <div className="info-box">
              <h3>📈 Reports & Export</h3>
              <p>Generate PDF class lists, student records, and Excel reports for the Department of Education and school board.</p>
            </div>
          </div>

          {/* Role selection — CP3: intuitive role selection mechanism */}
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select your role to continue
          </p>
          <div className="actions" style={{ marginBottom: '30px' }}>
            {ROLES.map(r => (
              <button
                key={r.role}
                onClick={() => selectRole(r)}
                className={activeRole === r.role ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ gap: '8px' }}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
                {activeRole === r.role && <span style={{ fontSize: '11px', opacity: 0.8 }}>✓</span>}
              </button>
            ))}
          </div>

          {/* Login form */}
          <form onSubmit={handle} style={{ maxWidth: '360px', margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                label="Username"
                id="username"
                type="text"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder={activeRole ? ROLES.find(r=>r.role===activeRole)?.role.toLowerCase() : 'username'}
                required
              />
              <Input
                label="Password"
                id="password"
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={{
                marginTop: '12px', padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)',
                color: '#f87171', fontSize: '13px',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '18px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          {/* Footer — from uploaded style */}
          <div className="footer" style={{ marginTop: '28px' }}>
            Angoram Secondary School ·{' '}
            <a href="https://www.unitech.ac.pg" target="_blank" rel="noreferrer">
              PNG University of Technology
            </a>{' '}
            · March 2026
          </div>
        </div>
      </div>
    </div>
  );
}