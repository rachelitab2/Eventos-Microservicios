import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

interface Inscription {
  id: number;
  eventId: number;
  userId: number;
  createdAt: string;
}

function InscriptionSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '2rem' }}>
      <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '22px', width: '40%' }} />
        <div className="skeleton" style={{ height: '16px', width: '30%' }} />
      </div>
      <div className="skeleton" style={{ height: '36px', width: '100px', borderRadius: '0.5rem' }} />
    </div>
  );
}

export function MyEventsPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.userId) {
      navigate('/auth');
      return;
    }

    api.get<Inscription[]>(`/inscriptions/user/${session.userId}`)
      .then(res => setInscriptions(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [session, navigate]);

  return (
    <div className="page-wrapper container" style={{ paddingBottom: '4rem' }}>
      
      <div style={{ padding: '3rem 0 2rem 0', borderBottom: '1px solid #E5E7EB', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Mis Reservaciones</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
          Gestiona los eventos a los que te has inscrito.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => <InscriptionSkeleton key={i} />)}
        </div>
      ) : inscriptions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
          {inscriptions.map((insc, i) => (
            <motion.div
              key={insc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}
            >
              <div style={{ width: 60, height: 60, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={30} color="#10B981" />
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', margin: 0 }}>Evento #{insc.eventId}</h3>
                  <span className="badge badge-primary">Confirmado ✓</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6B7280', fontSize: '0.9rem' }}>
                  <Calendar size={14} />
                  Reservado el {new Date(insc.createdAt).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              <Link to={`/events/${insc.eventId}`}>
                <Button variant="outline" size="sm">Ver Detalles</Button>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1.5rem', border: '1px dashed #D1D5DB' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>Aún no tienes reservaciones</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Explora nuestro catálogo y vive el Caribe al máximo.</p>
          <Link to="/events"><Button>Ver Eventos</Button></Link>
        </div>
      )}
    </div>
  );
}
