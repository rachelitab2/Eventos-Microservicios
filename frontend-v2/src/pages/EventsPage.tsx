import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { api } from '../services/api';

interface Event {
  id: string | number;
  name: string;
  category: string;
  location: string;
  eventDate: string;
  availableSpots: number;
  price: number;
  imageUrl?: string;
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

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    api.get<Event[]>('/events')
      .then(res => setEvents(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
        marginBottom: '3rem', alignItems: 'center'
      }}>
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
              <option value="Musica">Música</option>
              <option value="Deportes">Deportes</option>
              <option value="Cultura">Cultura</option>
              <option value="Tecnologia">Tecnología</option>
              <option value="Fiesta">Fiesta en Playa</option>
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
            <EventCard
              key={ev.id}
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
    </div>
  );
}
