import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        const res = await api.post<any>('/auth/login', { email, password });
        login({ userId: res.userId, username: res.username, email: res.email });
        showToast('¡Bienvenido de vuelta!', 'success');
        navigate('/');
      } else {
        // Register Logic
        const res = await api.post<any>('/auth/register', { username, email, password });
        showToast('Registro exitoso. Iniciando sesión...', 'success');
        login({ userId: res.userId, username: res.username, email: res.email });
        navigate('/');
      }
    } catch (err: any) {
      showToast(err.message || 'Credenciales incorrectas o error en el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      
      {/* ══ LADO IZQUIERDO: VISUAL ══ */}
      <div style={{ 
        flex: 1, 
        background: 'url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'none',
        // In plain CSS module we would use a media query, here we simulate it via basic inline logic for 100vh split
      }} className="auth-visual-side">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(18,60,68,0.9), rgba(18,60,68,0.4))' }} />
        <div style={{ position: 'relative', zIndex: 10, padding: '4rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <h1 style={{ fontSize: '3.5rem', color: 'white', marginBottom: '1rem', lineHeight: 1.1 }}>
            Únete a la<br />Experiencia.
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '400px' }}>
            Accede a los eventos más exclusivos de Punta Cana con tu cuenta Pura Vida PC.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-visual-side { display: block !important; }
        }
      `}</style>


      {/* ══ LADO DERECHO: FORMULARIO ══ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)' }}>
        <div style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
               <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>PV</span>
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 600, marginLeft: '0.5rem', cursor: 'pointer' }}
              >
                {isLogin ? 'Regístrate aquí' : 'Ingresa aquí'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>Usuario</label>
                  <div style={{ position: 'relative' }}>
                    <User size={20} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      required={!isLogin}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej. juanperez"
                      style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              isLoading={loading}
              style={{ width: '100%', marginTop: '1rem' }}
              rightIcon={<ArrowRight size={18} />}
            >
              {isLogin ? 'Ingresar' : 'Crear Cuenta'}
            </Button>
            
          </form>
        </div>
      </div>
    </div>
  );
}
