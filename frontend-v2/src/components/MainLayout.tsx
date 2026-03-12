import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isAuthPage = location.pathname === '/auth';

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/events', label: 'Explorar' },
    { path: '/my-events', label: 'Mis Eventos' },
  ];

  return (
    <>
      {/* ══ NAVBAR STICKY CON GLASSMORPHISM ══ */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '0.85rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* LOGO */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-heading)' }}>PV</span>
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>Pura Vida PC</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Punta Cana</p>
            </div>
          </Link>

          {/* NAV LINKS */}
          <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    background: isActive ? 'rgba(18, 60, 68, 0.08)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* AUTH AREA */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative' }}>
            {session ? (
              <>
                <button
                  onClick={() => navigate('/my-events')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}
                >
                  <Bell size={20} />
                </button>

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface)', border: '1px solid #E5E7EB', padding: '0.4rem 1rem 0.4rem 0.5rem', borderRadius: '2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary)' }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} color="white" />
                  </div>
                  {session.username}
                  <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{ position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0, background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', minWidth: '200px', overflow: 'hidden', zIndex: 100 }}
                    >
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', textDecoration: 'none', color: 'var(--color-text-dark)', fontSize: '0.95rem' }}>
                        <User size={16} /> Mi Perfil
                      </Link>
                      <div style={{ borderTop: '1px solid #F3F4F6' }}>
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.95rem', fontWeight: 500 }}>
                          <LogOut size={16} /> Cerrar Sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : !isAuthPage && (
              <Link
                to="/auth"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  padding: '0.55rem 1.5rem',
                  borderRadius: '99px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </motion.header>

      {/* ══ PAGE CONTENT ══ */}
      <main style={{ flexGrow: 1, paddingTop: '5rem', minHeight: 'calc(100vh - 8rem)' }}>
        <Outlet />
      </main>

      {/* ══ FOOTER ELEGANTE ══ */}
      <footer style={{ background: '#0F172A', color: 'white', padding: '4rem 0 2rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>PV</span>
              </div>
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Pura Vida PC</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7 }}>Eventos y experiencias con identidad caribeña para vivirte el Caribe con estilo.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Navegación</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {navLinks.map(l => <Link key={l.path} to={l.path} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem' }}>{l.label}</Link>)}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Contacto</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7 }}>Punta Cana, Rep. Dominicana<br/>eventos@puravidapc.com</p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
          © 2026 Pura Vida PC. Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}
