import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

export function ProfilePage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  const handleLogout = () => {
    logout();
    showToast('Sesión cerrada correctamente', 'info');
    navigate('/');
  };

  if (!session) return null;

  return (
    <div className="page-wrapper container" style={{ paddingBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: '600px', marginTop: '3rem' }}
      >
        <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid #E5E7EB' }}>
          
          <div style={{ padding: '3rem 2rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', color: 'white', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.5)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={50} color="white" />
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>{session.username}</h1>
            <p style={{ opacity: 0.8 }}>Miembro Pura Vida PC</p>
          </div>

          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--color-primary)', borderBottom: '1px solid #E5E7EB', paddingBottom: '0.8rem' }}>Información de la Cuenta</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#F3F4F6', padding: '0.8rem', borderRadius: '50%', color: '#6B7280' }}>
                  <User size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.1rem' }}>Nombre de Usuario</p>
                  <p style={{ fontWeight: 500, color: 'var(--color-text-dark)' }}>@{session.username}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#F3F4F6', padding: '0.8rem', borderRadius: '50%', color: '#6B7280' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.1rem' }}>Correo Electrónico</p>
                  <p style={{ fontWeight: 500, color: 'var(--color-text-dark)' }}>{session.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#F3F4F6', padding: '0.8rem', borderRadius: '50%', color: '#6B7280' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.1rem' }}>ID de Cuenta Privado</p>
                  <p style={{ fontWeight: 500, color: 'var(--color-text-dark)' }}>#PV-{session.userId.toString().padStart(5, '0')}</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center' }}>
              <Button variant="ghost" onClick={handleLogout} style={{ color: '#EF4444' }} leftIcon={<LogOut size={18} />}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
