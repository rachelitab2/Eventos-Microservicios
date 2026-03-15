import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar as CalendarIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { Modal } from '../components/Modal';
import { api } from '../services/api';
import { useToast } from '../components/ToastContext';

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
}

interface FormData {
  name: string;
  description: string;
  category: string;
  eventDate: string;
  location: string;
  totalCapacity: number;
  price: number;
  imageUrl: string;
}

function EventCardSkeleton() {
  return (
    <div style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
      <div className="skeleton" style={{ height: '240px' }} />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="skeleton" style={{ height: '24px', width: '70%' }} />
        <div className="skeleton" style={{ height: '16px', width: '50%' }} />
        <div className="skeleton" style={{ height: '16px', width: '60%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <div className="skeleton" style={{ height: '32px', width: '40%' }} />
          <div className="skeleton" style={{ height: '36px', width: '30%', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );
}

const initialFormData: FormData = {
  name: '',
  description: '',
  category: 'Gastronomía',
  eventDate: '',
  location: '',
  totalCapacity: 1,
  price: 0,
  imageUrl: '',
};

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Admin controls
  const isAdmin = localStorage.getItem('authRole') === 'ADMIN';
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingEventId, setEditingEventId] = useState<string | number | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | number | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const filteredEvents = events.filter(ev => {
    if (searchTerm && !ev.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false;
    if (dateFilter !== 'all') {
      const today = new Date();
      const eventDate = new Date(ev.eventDate);
      if (dateFilter === 'today' && eventDate.toDateString() !== today.toDateString()) return false;
      if (dateFilter === 'this-week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        if (eventDate < today || eventDate > nextWeek) return false;
      }
      if (dateFilter === 'this-month' && (eventDate.getMonth() !== today.getMonth() || eventDate.getFullYear() !== today.getFullYear())) return false;
    }
    return true;
  });

  const handleCreateClick = () => {
    setFormData(initialFormData);
    setShowCreateModal(true);
  };

  const handleEditClick = (event: Event) => {
    setEditingEventId(event.id);
    setFormData({
      name: event.name,
      description: event.description,
      category: event.category,
      eventDate: event.eventDate.slice(0, 16), // Format for datetime-local input
      location: event.location,
      totalCapacity: event.totalCapacity,
      price: event.price,
      imageUrl: event.imageUrl || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (eventId: string | number) => {
    setDeletingEventId(eventId);
    setShowDeleteModal(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.name || !formData.description || !formData.eventDate || !formData.location) {
      showToast('Completa todos los campos requeridos', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.authPost('/events', formData);
      showToast('Evento creado exitosamente', 'success');
      setShowCreateModal(false);
      await fetchEvents();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al crear evento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.name || !formData.description || !formData.eventDate || !formData.location) {
      showToast('Completa todos los campos requeridos', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.authPut(`/events/${editingEventId}`, formData);
      showToast('Evento actualizado exitosamente', 'success');
      setShowEditModal(false);
      await fetchEvents();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al actualizar evento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDelete = async () => {
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

  return (
    <div className="page-wrapper container" style={{ paddingBottom: '4rem' }}>
      <div style={{ padding: '3rem 0', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>Explorar Eventos</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
          Encuentra las mejores experiencias en Punta Cana. Filtra por categoría o fecha.
        </p>
      </div>

      {/* ══ FILTERS BAR ══ */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap',
        background: 'white', padding: '1.25rem 1.5rem',
        borderRadius: '1.25rem', boxShadow: 'var(--shadow-md)',
        marginBottom: '3rem', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flexGrow: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar eventos..."
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '0.875rem', border: '1px solid #E5E7EB', outline: 'none', background: '#F9FAFB', fontSize: '0.95rem' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Category */}
            <div style={{ position: 'relative' }}>
              <Filter size={16} color="#6B7280" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '0.875rem', border: '1px solid #E5E7EB', outline: 'none', background: 'white', cursor: 'pointer', fontWeight: 500, color: 'var(--color-text-dark)', appearance: 'none', fontSize: '0.95rem' }}
              >
                <option value="all">Todas las Categorías</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Deportes">Deportes</option>
                <option value="Música">Música</option>
                <option value="Turismo">Turismo</option>
                <option value="Cultura">Cultura</option>
                <option value="Arte">Arte</option>
                <option value="Entretenimiento">Entretenimiento</option>
              </select>
              <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B7280', fontSize: '0.7rem' }}>▼</span>
            </div>

            {/* Date */}
            <div style={{ position: 'relative' }}>
              <CalendarIcon size={16} color="#6B7280" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '0.875rem', border: '1px solid #E5E7EB', outline: 'none', background: 'white', cursor: 'pointer', fontWeight: 500, color: 'var(--color-text-dark)', appearance: 'none', fontSize: '0.95rem' }}
              >
                <option value="all">Cualquier Fecha</option>
                <option value="today">Hoy</option>
                <option value="this-week">Esta Semana</option>
                <option value="this-month">Este Mes</option>
              </select>
              <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B7280', fontSize: '0.7rem' }}>▼</span>
            </div>
          </div>
        </div>

        {/* Create Event Button for Admin */}
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--color-secondary)',
              color: 'white',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: '0 4px 14px rgba(227,116,52,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(227,116,52,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(227,116,52,0.35)')}
          >
            <Plus size={18} />
            Crear Evento
          </motion.button>
        )}
      </div>

      {/* ══ RESULTS COUNT ══ */}
      {!loading && (
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
          {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ══ EVENTS GRID ══ */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filteredEvents.map((ev, index) => (
            <div key={ev.id} style={{ position: 'relative' }}>
              <EventCard
                id={ev.id}
                name={ev.name}
                category={ev.category}
                location={ev.location}
                eventDate={ev.eventDate}
                availableSpots={ev.availableSpots}
                price={ev.price}
                imageUrl={ev.imageUrl}
                index={index}
              />
              {/* Admin Icons Overlay */}
              {isAdmin && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  display: 'flex',
                  gap: '0.5rem',
                  zIndex: 10,
                }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditClick(ev)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'white',
                    }}
                  >
                    <Pencil size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteClick(ev.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '0.5rem',
                      background: 'rgba(220, 38, 38, 0.8)',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'white',
                    }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              )}
            </div>
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
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>Sin resultados</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Intenta cambiar tu búsqueda o filtros.</p>
        </motion.div>
      )}

      {/* ══ CREATE/EDIT MODAL ══ */}
      {(showCreateModal || showEditModal) && (
        <Modal isOpen={showCreateModal || showEditModal} onClose={() => { setShowCreateModal(false); setShowEditModal(false); }} size="md">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text-dark)' }}>
            {showCreateModal ? 'Crear Evento' : 'Editar Evento'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Nombre del evento *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Concierto de Reggaeton"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem' }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Descripción *</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el evento..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem', minHeight: '100px', fontFamily: 'inherit', resize: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Categoría *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem', cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                >
                  <option value="Gastronomía">Gastronomía</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Música">Música</option>
                  <option value="Turismo">Turismo</option>
                  <option value="Cultura">Cultura</option>
                  <option value="Arte">Arte</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Ubicación *</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Playa Blanca, Punta Cana"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem' }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Capacidad Total *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalCapacity}
                  onChange={e => setFormData({ ...formData, totalCapacity: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Precio (RD$) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>URL de imagen</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontSize: '0.95rem' }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #E5E7EB',
                background: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              onClick={showCreateModal ? handleSubmitCreate : handleSubmitEdit}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'var(--color-secondary)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : showCreateModal ? 'Crear Evento' : 'Guardar Cambios'}
            </button>
          </div>
        </Modal>
      )}

      {/* ══ DELETE CONFIRMATION MODAL ══ */}
      {showDeleteModal && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-text-dark)' }}>Eliminar evento</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #E5E7EB',
                background: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmitDelete}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: '#EF4444',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
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
