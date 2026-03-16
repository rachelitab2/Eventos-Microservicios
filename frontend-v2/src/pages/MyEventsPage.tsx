import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ToastContext';
import { api } from '../services/api';
import { useServiceStatus } from '../components/ServiceStatusContext';
import { ServiceUnavailable } from '../components/ServiceUnavailable';

interface Inscription {
  id: number;
  eventId: number;
  userId: number;
  inscriptionDate: string;
  status: string;
}

interface EventSummary {
  id: number;
  name: string;
  eventDate?: string;
  location?: string;
  category?: string;
  imageUrl?: string;
}

interface ReservationCard {
  inscription: Inscription;
  event: EventSummary;
}

function InscriptionSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', border: '1px solid #E5E7EB', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <div className="skeleton" style={{ width: 56, height: 56, borderRadius: '1rem', flexShrink: 0 }} />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '45%' }} />
        <div className="skeleton" style={{ height: '14px', width: '30%' }} />
      </div>
      <div className="skeleton" style={{ height: '36px', width: '110px', borderRadius: '0.5rem' }} />
    </div>
  );
}

/* ─── Confirmation modal for cancellation ─── */
/* ══════════════════════════════════════════════
   MY EVENTS PAGE
══════════════════════════════════════════════ */
export function MyEventsPage() {
  const { session } = useAuth();
  const navigate    = useNavigate();
  const { showToast } = useToast();
  const { isServiceDown } = useServiceStatus();

  const [reservations, setReservations] = useState<ReservationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.userId) { navigate('/auth'); return; }

    let cancelled = false;
    api.get<Inscription[]>(`/inscriptions/user/${session.userId}`)
      .then(async (inscriptions) => {
        const eventIds = [...new Set(inscriptions.map(i => i.eventId))];
        const events = await Promise.all(
          eventIds.map(async (eventId) => {
            try {
              const ev = await api.get<EventSummary>(`/events/${eventId}`);
              return [eventId, ev] as const;
            } catch {
              return [eventId, { id: eventId, name: `Evento #${eventId}` }] as const;
            }
          })
        );
        if (cancelled) return;
        const eventMap = new Map(events);
        setReservations(inscriptions.map(inscription => ({
          inscription,
          event: eventMap.get(inscription.eventId) || { id: inscription.eventId, name: `Evento #${inscription.eventId}` },
        })));
      })
      .catch(err => console.error(err))
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [session, navigate]);

  const handleDeleteInscription = async (reservation: ReservationCard) => {
    if (!session) return;
    setDeletingId(reservation.inscription.id);
    try {
      await api.delete(`/inscriptions/${reservation.inscription.id}`);
      try {
        await api.put(`/events/${reservation.inscription.eventId}/increase-spots`);
      } catch {
        // Si falla devolver el cupo, al menos no bloqueamos la cancelación visible del usuario.
      }
      setReservations(prev => prev.filter(r => r.inscription.id !== reservation.inscription.id));
      showToast('Inscripción cancelada correctamente', 'success');
    } catch {
      showToast('No fue posible cancelar. Intenta de nuevo.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── Status badge ─── */
  const StatusBadge = ({ status }: { status: string }) => {
    const s = (status || 'CONFIRMED').toUpperCase();
    const map: Record<string, { bg: string; color: string; label: string }> = {
      CONFIRMED: { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', label: '✓ Confirmado' },
      PENDING:   { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', label: '⏳ Pendiente' },
      CANCELLED: { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', label: '✗ Cancelado'  },
    };
    const config = map[s] || map.CONFIRMED;
    return (
      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', background: config.bg, color: config.color, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {config.label}
      </span>
    );
  };

  if (isServiceDown('inscrip-service')) {
    return (
      <div className="page-wrapper container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
        <ServiceUnavailable serviceName="Inscripciones" message="El servicio de inscripciones se encuentra temporalmente fuera de servicio. Por favor, contacta con el administrador." />
      </div>
    );
  }

  return (
    <div className="page-wrapper container" style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ padding: '3rem 0 2rem', borderBottom: '1px solid #E5E7EB', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>Mis Eventos</h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>
            Gestiona tus inscripciones y reservaciones activas.
          </p>
        </div>
        {!loading && (
          <div style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '1rem', padding: '0.75rem 1.5rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.6rem', lineHeight: 1 }}>{reservations.length}</p>
            <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inscripciones</p>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[1, 2, 3].map(i => <InscriptionSkeleton key={i} />)}
        </div>
      ) : reservations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AnimatePresence>
            {reservations.map(({ inscription, event }, index) => {
              const isPast = event.eventDate ? new Date(event.eventDate) < new Date() : false;
              return (
                <motion.div
                  key={inscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, scale: 0.96 }}
                  transition={{ delay: index * 0.06 }}
                  style={{
                    background: 'white', borderRadius: '1.25rem', padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)', border: `1px solid ${isPast ? '#F3F4F6' : '#E5E7EB'}`,
                    display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
                    opacity: isPast ? 0.72 : 1,
                  }}
                >
                  {/* Icon / Image */}
                  <div style={{
                    width: 56, height: 56, borderRadius: '1rem', flexShrink: 0,
                    background: event.imageUrl ? `url(${event.imageUrl}) center/cover` : 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!event.imageUrl && <CheckCircle size={26} color="#10B981" />}
                  </div>

                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', margin: 0, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.name}</h3>
                      <StatusBadge status={inscription.status} />
                      {isPast && <span style={{ fontSize: '0.75rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} /> Pasado</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} />
                        Inscrito el {new Date(inscription.inscriptionDate).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                    <Link to={`/events/${inscription.eventId}`}>
                      <Button variant="outline" size="sm">Ver evento</Button>
                    </Link>
                    {(inscription.status || '').toUpperCase() !== 'CANCELLED' && (
                      <button
                        onClick={() => handleDeleteInscription({ inscription, event })}
                        title="Cancelar inscripción"
                        disabled={deletingId === inscription.id}
                        style={{ padding: '0.5rem', borderRadius: '0.6rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: deletingId === inscription.id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', opacity: deletingId === inscription.id ? 0.6 : 1 }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: '1.5rem', border: '1px dashed #D1D5DB' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎟️</div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>Aún no tienes reservaciones</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Explora nuestro catálogo y vive el Caribe al máximo.</p>
          <Link to="/events"><Button rightIcon={<Calendar size={16} />}>Ver Eventos</Button></Link>
        </div>
      )}
    </div>
  );
}
