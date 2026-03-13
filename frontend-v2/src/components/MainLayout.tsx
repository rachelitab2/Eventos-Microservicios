import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { PuraVidaLogo } from './PuraVidaLogo';

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
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '0.85rem 0',
        }}
      >
        {/* Animated gradient bottom line */}
        <div className="navbar-gradient-line" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />

        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '1rem'
          }}
        >

          {/* LOGO */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              justifySelf: 'start',
              transform: 'translateY(7px)'
            }}
          >
            <PuraVidaLogo variant="light" size="sm" animated={true} />
          </Link>

          {/* NAV LINKS */}
          <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifySelf: 'center' }}>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '2rem',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.95rem',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(18,60,68,0.1), rgba(108,164,169,0.08))'
                      : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(18,60,68,0.12)' : 'none',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(18,60,68,0.05)';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-muted)';
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* AUTH AREA */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative', justifySelf: 'end' }}>
            {session ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/my-events')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}
                >
                  <Bell size={20} />
                </motion.button>

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--color-surface)',
                    border: '1px solid rgba(18,60,68,0.15)',
                    padding: '0.4rem 1rem 0.4rem 0.5rem',
                    borderRadius: '2rem', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.9rem',
                    color: 'var(--color-primary)',
                    boxShadow: '0 2px 8px rgba(18,60,68,0.08)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(18,60,68,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(18,60,68,0.08)')}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
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
                      style={{
                        position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0,
                        background: 'white', borderRadius: '1rem',
                        border: '1px solid rgba(18,60,68,0.1)',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(18,60,68,0.05)',
                        minWidth: '200px', overflow: 'hidden', zIndex: 100,
                      }}
                    >
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', textDecoration: 'none', color: 'var(--color-text-dark)', fontSize: '0.95rem', transition: 'background 0.15s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(18,60,68,0.04)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
                      >
                        <User size={16} /> Mi Perfil
                      </Link>
                      <div style={{ borderTop: '1px solid #F3F4F6' }}>
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.95rem', fontWeight: 500, transition: 'background 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
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
                className="btn-shimmer"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                  color: 'white',
                  padding: '0.55rem 1.5rem',
                  borderRadius: '99px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 14px rgba(18,60,68,0.35)',
                  display: 'inline-block',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(18,60,68,0.5)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 14px rgba(18,60,68,0.35)')}
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
      <footer style={{ background: '#0B1929', color: 'white', padding: '4rem 0 2rem 0', position: 'relative', overflow: 'hidden' }}>
        {/* Aurora blobs */}
        <div className="aurora-blob" style={{ width: 400, height: 400, top: -120, left: -100, background: 'radial-gradient(circle, rgba(18,60,68,0.6) 0%, transparent 70%)', backgroundSize: '200% 200%' }} />
        <div className="aurora-blob" style={{ width: 300, height: 300, bottom: -80, right: -60, background: 'radial-gradient(circle, rgba(227,116,52,0.2) 0%, transparent 70%)', animationDelay: '3s', backgroundSize: '200% 200%' }} />

        {/* Animated top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #E37434, #F9C17E, #6CA4A9, #123C44, transparent)',
          backgroundSize: '200% auto',
          animation: 'textShimmer 4s linear infinite',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <PuraVidaLogo variant="dark" size="sm" animated={true} />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.7 }}>Eventos y experiencias con identidad caribeña para vivirte el Caribe con estilo.</p>
            {/* Social icons row */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem' }}>
              {['🌴', '🌊', '🎉'].map((emoji, i) => (
                <div key={i} className="float-decoration" style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', cursor: 'default',
                  animationDelay: `${i * 0.8}s`,
                }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.45 }}>Navegación</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {navLinks.map(l => (
                <Link key={l.path} to={l.path} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease, padding-left 0.2s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#E37434'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '0.35rem'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8'; (e.currentTarget as HTMLAnchorElement).style.paddingLeft = '0'; }}
                >
                  → {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.45 }}>Contacto</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.9 }}>
              📍 Punta Cana, Rep. Dominicana<br/>
              ✉️ eventos@puravidapc.com<br/>
              🕐 Soporte 24/7
            </p>
          </div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem', color: '#64748B' }}>
          <span>© 2026 Pura Vida PC. Todos los derechos reservados.</span>
          <span style={{ fontSize: '0.8rem' }}>Hecho con 🌴 en el Caribe</span>
        </div>
      </footer>
    </>
  );
}
