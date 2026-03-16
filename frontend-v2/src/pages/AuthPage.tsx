import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PuraVidaLogo } from '../components/PuraVidaLogo';
import { useServiceStatus } from '../components/ServiceStatusContext';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

/* ── Field validation helpers ── */
const validators = {
  email: (v: string) => {
    if (!v) return 'El correo es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Ingresa un correo válido';
    return '';
  },
  password: (v: string, isLogin: boolean) => {
    if (!v) return 'La contraseña es obligatoria';
    if (!isLogin && v.length < 8) return 'Mínimo 8 caracteres';
    if (!isLogin && !/[A-Z]/.test(v)) return 'Debe tener al menos una mayúscula';
    if (!isLogin && !/[0-9]/.test(v)) return 'Debe tener al menos un número';
    return '';
  },
  username: (v: string) => {
    if (!v) return 'El usuario es obligatorio';
    if (v.length < 3) return 'Mínimo 3 caracteres';
    if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Solo letras, números y guión bajo';
    return '';
  },
};

/* Password strength indicator */
function PasswordStrength({ pass }: { pass: string }) {
  const score = [
    pass.length >= 8,
    /[A-Z]/.test(pass),
    /[0-9]/.test(pass),
    /[^A-Za-z0-9]/.test(pass),
  ].filter(Boolean).length;

  const labels = ['', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
  const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#059669'];

  if (!pass) return null;
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= score ? colors[score] : '#E5E7EB', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: colors[score], fontWeight: 600 }}>{labels[score]}</span>
    </div>
  );
}

/* Field component with validation feedback */
function FormField({
  label, type = 'text', value, onChange, placeholder, icon: Icon, error, hint,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: React.ElementType; error?: string; hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const hasError = !!error;
  const isValid = value.length > 0 && !hasError;

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.4rem', color: '#374151' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: focused ? 'var(--color-primary)' : '#9CA3AF', transition: 'color 0.2s' }} />
        <input
          type={isPassword && showPass ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: '0.75rem 3rem', borderRadius: '0.75rem',
            border: `1.5px solid ${hasError ? '#EF4444' : isValid ? '#10B981' : focused ? 'var(--color-primary)' : '#E5E7EB'}`,
            outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s',
            background: hasError ? '#FFF5F5' : 'white',
          }}
        />
        {/* Status icon */}
        {value.length > 0 && (
          <div style={{ position: 'absolute', right: isPassword ? '2.75rem' : '1rem', top: '50%', transform: 'translateY(-50%)' }}>
            {hasError
              ? <XCircle size={16} color="#EF4444" />
              : <CheckCircle size={16} color="#10B981" />
            }
          </div>
        )}
        {/* Show/hide password toggle */}
        {isPassword && (
          <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {/* Error or hint */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '0.3rem', fontWeight: 500 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {hint && !hasError && <p style={{ fontSize: '0.76rem', color: '#9CA3AF', marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  );
}

/* ══════════════════════════════════════
   AUTH PAGE
══════════════════════════════════════ */
export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isServiceDown } = useServiceStatus();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false, username: false });

  const errors = {
    email: touched.email ? validators.email(email) : '',
    password: touched.password ? validators.password(password, isLogin) : '',
    username: (!isLogin && touched.username) ? validators.username(username) : '',
  };

  const isFormValid = !errors.email && !errors.password && !errors.username &&
    email && password && (isLogin || username);

  const touchAll = () => setTouched({ email: true, password: true, username: true });

  const switchMode = () => {
    setIsLogin(p => !p);
    setTouched({ email: false, password: false, username: false });
    setEmail(''); setPassword(''); setUsername('');
    setIsAdmin(false); setAdminSecret('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    touchAll();
    if (!isFormValid) return;
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post<{ userId: string; username: string; email: string; token: string; role: string }>('/auth/login', { email, password });
        login({ userId: res.userId, username: res.username, email: res.email, role: res.role }, res.token);
        showToast('¡Bienvenido de vuelta!', 'success');
        navigate(res.role === 'ADMIN' ? '/admin' : '/events');
      } else if (isAdmin) {
        const res = await api.post<{ userId: string; username: string; email: string; token: string; role: string }>(
          '/auth/register-admin',
          { username, email, password },
          { 'X-Admin-Secret': adminSecret }
        );
        showToast('¡Cuenta admin creada!', 'success');
        login({ userId: res.userId, username: res.username, email: res.email, role: res.role }, res.token);
        navigate('/admin');
      } else {
        const res = await api.post<{ userId: string; username: string; email: string; token: string; role: string }>('/auth/register', { username, email, password });
        showToast('¡Cuenta creada! Bienvenido', 'success');
        login({ userId: res.userId, username: res.username, email: res.email, role: res.role }, res.token);
        navigate('/events');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      showToast(msg.includes('401') || msg.toLowerCase().includes('credenciales') || msg.toLowerCase().includes('invalid')
        ? 'Correo o contraseña incorrectos'
        : msg.includes('409') || msg.toLowerCase().includes('exist')
          ? 'Ya existe una cuenta con ese correo'
          : msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isServiceDown('auth-service')) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ServiceUnavailable serviceName="Autenticación" message="El servicio de autenticación se encuentra temporalmente fuera de servicio. Por favor, contacta con el administrador." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── LEFT: Visual ── */}
      <div className="auth-visual-side" style={{
        flex: 1, position: 'relative', overflow: 'hidden', display: 'none',
        backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(12,36,42,0.92) 0%, rgba(18,60,68,0.65) 100%)' }} />
        <div style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', zIndex: 10 }}>
          <PuraVidaLogo variant="dark" size="sm" animated />
        </div>
        <div style={{ position: 'relative', zIndex: 10, padding: '4rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', paddingBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.8rem', color: 'white', lineHeight: 1.15, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>
            Únete a la<br />Experience.
          </h2>
          <p style={{ opacity: 0.8, fontSize: '1.05rem', maxWidth: '360px', lineHeight: 1.7 }}>
            Accede a los eventos más exclusivos de Punta Cana con tu cuenta Pura Vida PC.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
            {['500+ Eventos', '12K Viajeros', '4.9★ Rating'].map(t => (
              <div key={t} style={{ padding: '0.6rem 1.2rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media (min-width: 1024px) { .auth-visual-side { display: block !important; } }`}</style>

      {/* ── RIGHT: Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
              <PuraVidaLogo variant="light" size="sm" animated />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? 'login' : 'register'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  <button onClick={switchMode} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 700, marginLeft: '0.4rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2.25rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #E5E7EB' }}>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                    <FormField
                      label="Nombre de usuario" value={username} onChange={v => { setUsername(v); setTouched(p => ({ ...p, username: true })); }}
                      placeholder="ej. juanperez123" icon={User}
                      error={errors.username} hint="Solo letras, números y guión bajo (_)"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <FormField
                label="Correo electrónico" type="email" value={email} onChange={v => { setEmail(v); setTouched(p => ({ ...p, email: true })); }}
                placeholder="tu@correo.com" icon={Mail} error={errors.email}
              />

              <div>
                <FormField
                  label="Contraseña" type="password" value={password} onChange={v => { setPassword(v); setTouched(p => ({ ...p, password: true })); }}
                  placeholder="••••••••" icon={Lock} error={errors.password}
                  hint={!isLogin ? 'Mínimo 8 caracteres, una mayúscula y un número' : ''}
                />
                {!isLogin && <PasswordStrength pass={password} />}
              </div>

              <AnimatePresence>
                {!isLogin && isAdmin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                    <FormField
                      label="Secreto de administrador" value={adminSecret} onChange={v => setAdminSecret(v)}
                      placeholder="Ingresa el secreto de admin" icon={Shield}
                      hint="Proporcionado por el administrador del sistema"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit" variant="primary" size="lg" isLoading={loading}
                style={{ width: '100%', marginTop: '0.5rem', opacity: (!isFormValid && (touched.email || touched.password)) ? 0.7 : 1, transition: 'opacity 0.2s' }}
                rightIcon={<ArrowRight size={18} />}
              >
                {isLogin ? 'Ingresar' : isAdmin ? 'Registrar Admin' : 'Crear Cuenta'}
              </Button>

              {!isLogin && (
                <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAdmin(prev => !prev)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-secondary)', fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    {isAdmin ? 'Volver a registro normal' : '¿Eres administrador? Regístrate como admin'}
                  </button>
                </div>
              )}

            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9CA3AF', marginTop: '1.5rem' }}>
            Al continuar aceptas nuestros <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>Términos de Uso</span> y <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>Política de Privacidad</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
