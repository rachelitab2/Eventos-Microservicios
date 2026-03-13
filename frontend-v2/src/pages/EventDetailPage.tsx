import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Ticket, ArrowLeft, CheckCircle,
  Star, Send, MessageCircle, ThumbsUp, UserCircle, Trash2
} from 'lucide-react';
import { Button } from '../components/Button';
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
  totalSpots?: number;
  price: number;
  imageUrl?: string;
  description?: string;
}

interface Comment {
  id: number;
  userId: number;
  username: string;
  text: string;
  rating: number;
  createdAt: string;
}

/* ─── Componente de reseña/comentario ─── */
function CommentCard({
  comment,
  canDelete,
  isDeleting,
  onDelete,
}: {
  comment: Comment;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (comment: Comment) => void;
}) {
  const initials = comment.username?.slice(0, 2).toUpperCase() || '??';
  const colors = ['#E37434', '#6CA4A9', '#123C44', '#D4894A', '#B05D38'];
  const color = colors[Math.abs(comment.userId) % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flexGrow: 1 }}>
          <p style={{ fontWeight: 700, color: 'var(--color-primary)', margin: 0, fontSize: '0.95rem' }}>{comment.username}</p>
          <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: 0 }}>{new Date(comment.createdAt).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
        {/* Estrellas */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={13} fill={s <= comment.rating ? '#F59E0B' : 'none'} color={s <= comment.rating ? '#F59E0B' : '#D1D5DB'} />
          ))}
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(comment)}
            disabled={isDeleting}
            title="Eliminar comentario"
            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: isDeleting ? 'not-allowed' : 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: isDeleting ? 0.6 : 1 }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <p style={{ color: '#374151', fontSize: '0.92rem', lineHeight: 1.65, margin: 0 }}>{comment.text}</p>
    </motion.div>
  );
}

/* ─── Selector de estrellas ─── */
function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: s <= (hover || value) ? '#F59E0B' : '#D1D5DB', transition: 'color 0.15s' }}>
          <Star size={22} fill={s <= (hover || value) ? '#F59E0B' : 'none'} color="currentColor" />
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   EVENT DETAIL PAGE
══════════════════════════════════════════════ */
export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent]           = useState<EventDetail | null>(null);
  const [loading, setLoading]       = useState(true);
  const [isBooking, setIsBooking]   = useState(false);
  const [inscribedCount, setInscribedCount] = useState<number | null>(null);
  const [alreadyInscribed, setAlreadyInscribed] = useState(false);

  // Comments state
  const [comments, setComments]   = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [postingComment, setPostingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

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

    // Load inscribed count
    api.get<{ count: number } | number>(`/inscriptions/event/${id}/count`)
      .then(res => setInscribedCount(typeof res === 'number' ? res : res.count))
      .catch(() => setInscribedCount(null));

    api.get<Comment[]>(`/events/${id}/comments`)
      .then(res => setComments(Array.isArray(res) ? res : []))
      .catch(() => setComments([]));

    // Check if user already inscribed
    if (session?.userId) {
      api.get<{ inscribed: boolean } | boolean>(`/inscriptions/check?userId=${session.userId}&eventId=${id}`)
        .then(res => setAlreadyInscribed(typeof res === 'boolean' ? res : res.inscribed))
        .catch(() => setAlreadyInscribed(false));
    }
  }, [id, handleLoadError, session?.userId]);

  const handleBookTicket = async () => {
    if (!session) { showToast('Debes iniciar sesión para reservar', 'info'); navigate('/auth'); return; }
    if (!event) return;

    setIsBooking(true);
    try {
      await api.post(`/inscriptions`, { userId: session.userId, eventId: event.id });
      await api.put(`/events/${event.id}/decrease-spots`);
      await api.post(`/notifications`, {
        userId: session.userId, email: session.email,
        eventName: event.name,
        message: `Te has inscrito con éxito al evento: ${event.name}. ¡Guarda la fecha!`
      });
      setAlreadyInscribed(true);
      setEvent(prev => prev ? { ...prev, availableSpots: prev.availableSpots - 1 } : prev);
      setInscribedCount(prev => (prev ?? 0) + 1);
      showToast('Reserva confirmada. Revisa tu correo para la confirmación.', 'success');
      navigate('/my-events');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error al procesar la reserva', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const handlePostComment = async () => {
    if (!session) { showToast('Inicia sesión para comentar', 'info'); return; }
    if (!newComment.trim()) { showToast('Escribe un comentario primero', 'error'); return; }
    setPostingComment(true);

    try {
      const created = await api.post<Comment>(`/events/${id}/comments`, {
        userId: session.userId,
        username: session.username,
        text: newComment.trim(),
        rating: newRating,
      });
      setComments(prev => [created, ...prev]);
      setNewComment('');
      setNewRating(5);
      showToast('Comentario publicado', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'No se pudo publicar el comentario', 'error');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!session) return;
    setDeletingCommentId(comment.id);
    try {
      await api.delete(`/events/${id}/comments/${comment.id}?userId=${session.userId}`);
      setComments(prev => prev.filter(current => current.id !== comment.id));
      showToast('Comentario eliminado', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'No se pudo eliminar el comentario', 'error');
    } finally {
      setDeletingCommentId(null);
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

  const formattedDate = new Date(event.eventDate).toLocaleDateString('es-DO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Capacity bar percentage
  const totalSpots = event.totalSpots || (event.availableSpots + (inscribedCount ?? 0));
  const occupancy  = totalSpots > 0 ? Math.round(((totalSpots - event.availableSpots) / totalSpots) * 100) : 0;

  return (
    <div className="page-wrapper" style={{ paddingBottom: '4rem' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', height: '50vh', minHeight: '360px' }}>
        <img src={event.imageUrl || '/hero1.png'} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18,60,68,1) 0%, transparent 60%)' }} />
      </div>

      <div className="container" style={{ marginTop: '-8rem', position: 'relative', zIndex: 10, display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Main Info card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ flexGrow: 1, flexBasis: '55%', background: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}
        >
          <button onClick={() => navigate('/events')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontWeight: 500, cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={14} /> Volver a eventos
          </button>

          <span className="badge badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>{event.category}</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1rem', lineHeight: 1.2 }}>{event.name}</h1>
          <p style={{ fontSize: '1.05rem', color: '#4B5563', lineHeight: 1.7, marginBottom: '2rem' }}>
            {event.description || 'Sumérgete en la experiencia única de Punta Cana. Un evento diseñado para crear recuerdos imborrables bajo el sol y las estrellas del Caribe.'}
          </p>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#F9FAFB', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
            {[
              { Icon: Calendar, label: 'Fecha y Hora', value: formattedDate, caps: true },
              { Icon: MapPin,   label: 'Ubicación',   value: event.location, caps: false },
              { Icon: Ticket,   label: 'Precio',      value: `RD$ ${event.price}`, caps: false },
            ].map(({ Icon, label, value, caps }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--color-secondary)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                  <p style={{ fontWeight: 600, color: 'var(--color-text-dark)', textTransform: caps ? 'capitalize' : 'none', fontSize: '0.95rem' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── AFORO / Capacidad ── */}
          <div style={{ background: '#F0F9F8', borderRadius: '1rem', padding: '1.25rem 1.5rem', border: '1px solid #D1E9E7', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                <Users size={16} /> Aforo del Evento
              </div>
              {inscribedCount !== null && (
                <span style={{ fontSize: '0.85rem', color: '#4B8E8A', fontWeight: 600 }}>
                  {inscribedCount} inscritos &nbsp;·&nbsp; {event.availableSpots} cupos disponibles
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div style={{ height: '10px', background: '#D1E9E7', borderRadius: '5px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancy}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                style={{ height: '100%', borderRadius: '5px', background: occupancy > 80 ? '#EF4444' : occupancy > 50 ? '#F59E0B' : '#10B981' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.4rem' }}>{occupancy}% de capacidad ocupada</p>
          </div>
        </motion.div>

        {/* ── Booking Box ── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ flexBasis: '33%', minWidth: '300px', background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: 'var(--shadow-xl)', position: 'sticky', top: '7rem' }}
        >
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>Reserva tu Tícket</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Precio</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>RD${event.price}</span>
          </div>

          {/* Cupos status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', padding: '0.75rem 1rem', background: event.availableSpots > 10 ? 'rgba(16,185,129,0.08)' : 'rgba(227,116,52,0.1)', color: event.availableSpots > 10 ? '#10B981' : 'var(--color-secondary)', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
            <Users size={16} />
            {event.availableSpots > 0 ? `${event.availableSpots} cupos restantes` : 'Agotado'}
          </div>

          {alreadyInscribed ? (
            <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle size={28} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 700, color: '#10B981', margin: 0, fontSize: '0.95rem' }}>Ya estás inscrito</p>
              <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0.3rem 0 0' }}>Revisa tu correo para la confirmación</p>
            </div>
          ) : event.availableSpots > 0 ? (
            <Button size="lg" style={{ width: '100%' }} rightIcon={<Ticket size={18} />} onClick={handleBookTicket} isLoading={isBooking}>
              Confirmar Tícket
            </Button>
          ) : (
            <Button size="lg" style={{ width: '100%' }} disabled>Sin cupos disponibles</Button>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', marginTop: '1rem' }}>🔒 Reserva segura y confirmada al instante</p>

          {/* Inscritos counter */}
          {inscribedCount !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6', color: '#6B7280', fontSize: '0.85rem' }}>
              <UserCircle size={16} />
              <span><strong style={{ color: 'var(--color-primary)' }}>{inscribedCount}</strong> personas inscritas</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ══ SECCIÓN DE COMENTARIOS / RESEÑAS ══ */}
      <div className="container" style={{ marginTop: '3rem' }}>
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid #F3F4F6' }}>
            <MessageCircle size={24} color="var(--color-secondary)" />
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Comentarios y Reseñas</h2>
            <span style={{ background: 'rgba(18,60,68,0.08)', color: 'var(--color-primary)', borderRadius: '99px', padding: '0.2rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>{comments.length}</span>
          </div>

          {/* Form para nuevo comentario */}
          {session ? (
            <div style={{ background: '#F9FAFB', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #E5E7EB' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary)', fontSize: '0.95rem' }}>📝 Deja tu reseña</p>
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '0.35rem', fontWeight: 600 }}>Tu calificación</p>
                <StarRating value={newRating} onChange={setNewRating} />
              </div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia con este evento..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid #E5E7EB', outline: 'none', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <Button onClick={handlePostComment} isLoading={postingComment} rightIcon={<Send size={15} />} size="sm">
                  Publicar comentario
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(227,116,52,0.06)', borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '2rem', border: '1px dashed rgba(227,116,52,0.3)', textAlign: 'center' }}>
              <ThumbsUp size={20} color="var(--color-secondary)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: '#4B5563', fontSize: '0.92rem', margin: 0 }}>
                <button onClick={() => navigate('/auth')} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem' }}>Inicia sesión</button>{' '}
                para dejar un comentario o reseña.
              </p>
            </div>
          )}

          {/* Lista de comentarios */}
          {comments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {comments.map(c => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    canDelete={Number(session?.userId) === c.userId}
                    isDeleting={deletingCommentId === c.id}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
              <MessageCircle size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Sé el primero en comentar</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Comparte tu experiencia con este evento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
