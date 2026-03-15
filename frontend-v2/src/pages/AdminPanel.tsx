import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, MapPin, Calendar, Users, DollarSign, Search } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/ToastContext';
import { EventForm } from '../components/EventForm';
import type { EventFormData } from '../components/EventForm';
import { Modal } from '../components/Modal';

interface Event {
  id: string | number;
  name: string;
  category: string;
  location: string;
  eventDate: string;
  availableSpots: number;
  totalCapacity: number;
  price: number;
  imageUrl?: string;
  description: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
}

function AdminCardSkeleton() {
  return (
    <div style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid #E5E7EB', background: 'white' }}>
      <div className="skeleton" style={{ height: '160px' }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div className="skeleton" style={{ height: '22px', width: '65%' }} />
        <div className="skeleton" style={{ height: '14px', width: '80%' }} />
        <div className="skeleton" style={{ height: '14px', width: '50%' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div className="skeleton" style={{ height: '34px', width: '50%', borderRadius: '0.5rem' }} />
          <div className="skeleton" style={{ height: '34px', width: '50%', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<(Partial<EventFormData> & { id?: string | number }) | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get<Event[]>('/events');
      setEvents(res);
    } catch (err) {
      console.error(err);
      showToast('Error al cargar eventos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingEvent(undefined);
    setShowForm(true);
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent({
      id: event.id,
      name: event.name,
      category: event.category,
      location: event.location,
      eventDate: event.eventDate,
      totalCapacity: event.totalCapacity,
      price: event.price,
      imageUrl: event.imageUrl || '',
      description: event.description,
      instagram: event.instagram || '',
      facebook: event.facebook || '',
      tiktok: event.tiktok || '',
      whatsapp: event.whatsapp || '',
    });
    setShowForm(true);
  };

  const handleDeleteClick = (eventId: string | number) => {
    setDeletingEventId(eventId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setSubmitting(true);
    try {
      await api.authDelete(`/events/${deletingEventId}`);
      showToast('Evento eliminado exitosamente', 'success');
      setShowDeleteModal(false);
      await fetchEvents();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar evento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSaved = async () => {
    setShowForm(false);
    setEditingEvent(undefined);
    await fetchEvents();
  };

  const filteredEvents = events.filter(ev =>
    !searchTerm || ev.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-DO', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-wrapper container" style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ padding: '3rem 0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>Panel de Administración</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)' }}>
            Gestiona todos los eventos de Pura Vida PC.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--color-secondary)', color: 'white',
            padding: '0.85rem 1.5rem', borderRadius: '0.875rem',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem',
            boxShadow: '0 4px 14px rgba(227,116,52,0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(227,116,52,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(227,116,52,0.35)')}
        >
          <Plus size={20} />
          Nuevo Evento
        </motion.button>
      </div>

      {/* Search bar */}
      <div style={{
        background: 'white', padding: '1rem 1.5rem', borderRadius: '1.25rem',
        boxShadow: 'var(--shadow-md)', marginBottom: '2rem',
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar eventos..."
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
              borderRadius: '0.875rem', border: '1px solid #E5E7EB',
              outline: 'none', background: '#F9FAFB', fontSize: '0.95rem',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
            onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
          />
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
          {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} registrado{filteredEvents.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Events Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <AdminCardSkeleton key={i} />)}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredEvents.map((ev, index) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: 'white', borderRadius: '1.25rem', overflow: 'hidden',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Image */}
              <div style={{ height: '160px', background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                {ev.imageUrl ? (
                  <img src={ev.imageUrl} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', color: 'rgba(255,255,255,0.4)', fontSize: '3rem', fontWeight: 700 }}>
                    {ev.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: '0.75rem', left: '0.75rem',
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  color: 'white', padding: '0.3rem 0.75rem', borderRadius: '99px',
                  fontSize: '0.78rem', fontWeight: 600,
                }}>
                  {ev.category}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  {ev.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ev.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#6B7280' }}>
                    <MapPin size={14} /> {ev.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#6B7280' }}>
                    <Calendar size={14} /> {formatDate(ev.eventDate)}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#6B7280' }}>
                      <DollarSign size={14} /> RD${ev.price.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#6B7280' }}>
                      <Users size={14} /> {ev.availableSpots}/{ev.totalCapacity}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleEditClick(ev)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      padding: '0.6rem', borderRadius: '0.625rem',
                      border: '1px solid #E5E7EB', background: 'white',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      color: 'var(--color-primary)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(18,60,68,0.05)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                  >
                    <Pencil size={14} /> Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDeleteClick(ev.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      padding: '0.6rem', borderRadius: '0.625rem',
                      border: '1px solid #FEE2E2', background: 'white',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      color: '#EF4444', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = '#EF4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#FEE2E2'; }}
                  >
                    <Trash2 size={14} /> Eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '1.5rem', border: '1px dashed #D1D5DB' }}
        >
          <div style={{ width: 64, height: 64, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Search size={28} color="#9CA3AF" />
          </div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>Sin eventos</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Crea tu primer evento con el botón "Nuevo Evento".</p>
        </motion.div>
      )}

      {/* Event Form Modal */}
      <AnimatePresence>
        {showForm && (
          <EventForm
            initialData={editingEvent}
            onClose={() => { setShowForm(false); setEditingEvent(undefined); }}
            onSaved={handleFormSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-text-dark)' }}>Eliminar evento</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontWeight: 600 }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: '#EF4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              disabled={submitting}
            >
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
