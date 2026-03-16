import { motion } from 'framer-motion';
import { ServerCrash, Mail } from 'lucide-react';

interface Props {
  serviceName: string;
  message?: string;
}

export function ServiceUnavailable({ serviceName, message }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: '500px',
        margin: '3rem auto',
        textAlign: 'center',
        padding: '2.5rem 2rem',
        background: 'white',
        borderRadius: '1.5rem',
        border: '1px solid #FEE2E2',
        boxShadow: '0 4px 24px rgba(220,38,38,0.08)',
      }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: '1rem',
        background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
      }}>
        <ServerCrash size={32} color="#DC2626" />
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-dark)' }}>
        Servicio no disponible
      </h2>
      <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
        {message || `El servicio de ${serviceName} se encuentra temporalmente fuera de servicio. Estamos trabajando para restaurarlo.`}
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        padding: '0.75rem 1.25rem', background: '#FEF2F2', borderRadius: '0.75rem',
        color: '#DC2626', fontSize: '0.88rem', fontWeight: 600,
      }}>
        <Mail size={16} />
        Contacta con el administrador
      </div>
    </motion.div>
  );
}
