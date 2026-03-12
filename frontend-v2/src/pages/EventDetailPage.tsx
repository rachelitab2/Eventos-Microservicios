import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Ticket, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ToastContext';
import { api } from '../services/api';

interface EventDetail {
  id: number;
  name: string;
  category: string;
  location: string;
  eventDate: string;
  availableSpots: number;
  price: number;
  imageUrl?: string;
}

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleLoadError = useCallback(() => {
    showToast('No pudimos cargar el evento', 'error');
    navigate('/events');
  }, [showToast, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get<EventDetail>(`/events/${id}`)
      .then(res => setEvent(res))
      .catch(() => handleLoadError())
      .finally(() => setLoading(false));
  }, [id, handleLoadError]);

  const handleBookTicket = async () => {
    if (!session) {
      showToast('Debes iniciar sesión para reservar', 'info');
      navigate('/auth');
      return;
    }
    if (!event) return;

    setIsBooking(true);
    try {
      await api.post(`/inscriptions`, { userId: session.userId, eventId: event.id });
      await api.put(`/events/${event.id}/decrease-spots`);
      await api.post(`/notifications`, {
        userId: session.userId,
        email: session.email,
        eventName: event.name,
        message: `Te has inscrito con éxito al evento: ${event.name}. ¡Guarda la fecha!`
      });
      setBookingSuccess(true);
      setEvent(prev => prev ? { ...prev, availableSpots: prev.availableSpots - 1 } : prev);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al procesar la reserva';
      showToast(message, 'error');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading || !event) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Cargando evento...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const formattedDate = new Date(event.eventDate).toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-wrapper" style={{ paddingBottom: '4rem' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: '50vh', minHeight: '360px' }}>
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600'}
          alt={event.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,60,68,1) 0%, transparent 60%)' }} />
      </div>

      <div className="container" style={{ marginTop: '-8rem', position: 'relative', zIndex: 10, display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ flexGrow: 1, flexBasis: '55%', background: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}
        >
          <button
            onClick={() => navigate('/events')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontWeight: 500, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={14} /> Volver a eventos
          </button>

          <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>{event.category}</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1.5rem', lineHeight: 1.2 }}>{event.name}</h1>
          <p style={{ fontSize: '1.1rem', color: '#4B5563', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Sumérgete en la experiencia única de Punta Cana. Un evento diseñado para crear recuerdos imborrables bajo el sol y las estrellas del Caribe.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            {[
              { Icon: Calendar, label: 'Fecha y Hora', value: formattedDate, caps: true },
              { Icon: MapPin, label: 'Ubicación', value: event.location, caps: false },
              { Icon: Users, label: 'Cupos Disponibles', value: `${event.availableSpots} cupos`, caps: false },
            ].map(({ Icon, label, value, caps }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--color-secondary)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                  <p style={{ fontWeight: 500, color: 'var(--color-text-dark)', textTransform: caps ? 'capitalize' : 'none' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Booking Box */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ flexBasis: '33%', minWidth: '300px', background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: 'var(--shadow-xl)', position: 'sticky', top: '7rem' }}
        >
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>Reserva tu Tícket</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Precio</span>
            <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>RD${event.price}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.875rem 1rem', background: event.availableSpots > 10 ? 'rgba(16,185,129,0.08)' : 'rgba(227,116,52,0.1)', color: event.availableSpots > 10 ? '#10B981' : 'var(--color-secondary)', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <Users size={18} />
            {event.availableSpots > 0 ? `${event.availableSpots} cupos restantes` : 'Agotado'}
          </div>
          {event.availableSpots > 0 ? (
            <Button size="lg" style={{ width: '100%' }} rightIcon={<Ticket size={18} />} onClick={() => setIsModalOpen(true)}>
              Confirmar Tícket
            </Button>
          ) : (
            <Button size="lg" style={{ width: '100%' }} disabled>Sin cupos disponibles</Button>
          )}
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#9CA3AF', marginTop: '1rem' }}>
            🔒 Reserva segura y confirmada al instante
          </p>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { if (!isBooking) { setIsModalOpen(false); setBookingSuccess(false); } }} title={bookingSuccess ? undefined : 'Confirmar Reserva'}>
        {!bookingSuccess ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(227,116,52,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Ticket size={40} color="var(--color-secondary)" />
            </div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>¿Confirmas tu reserva?</h3>
            <p style={{ color: '#4B5563', marginBottom: '0.5rem' }}>
              Evento: <strong>{event.name}</strong>
            </p>
            <p style={{ color: '#4B5563', marginBottom: '2rem' }}>
              Precio: <strong>RD$ {event.price}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isBooking}>Cancelar</Button>
              <Button onClick={handleBookTicket} isLoading={isBooking}>Sí, confirmar</Button>
            </div>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle size={80} color="#10B981" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>¡Inscripción Exitosa! 🎉</h3>
            <p style={{ color: '#4B5563', marginBottom: '2rem' }}>
              Confirmación enviada a <strong>{session?.email}</strong>.
            </p>
            <Button onClick={() => { setIsModalOpen(false); setBookingSuccess(false); navigate('/my-events'); }} style={{ width: '100%' }}>
              Ver Mis Eventos
            </Button>
          </motion.div>
        )}
      </Modal>
    </div>
  );
}
