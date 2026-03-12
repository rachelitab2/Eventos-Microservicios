import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { EventCard } from '../components/EventCard';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch last 3 events for featured section
    api.get<any[]>('/events')
      .then(res => {
        setFeaturedEvents(res.slice(0, 3));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper" style={{ paddingTop: '0' }}>
      
      {/* ══ HERO SECTION ══ */}
      <section style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        position: 'relative',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Subtle background pattern or overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ maxWidth: '800px' }}
          >
            <div className="badge glass-dark" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
              🌴 Vive la experiencia
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              El Caribe te llama.<br/>
              <span style={{ color: 'var(--color-secondary)' }}>Responde con estilo.</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#E5E7EB', marginBottom: '2.5rem', maxWidth: '600px', lineHeight: 1.6 }}>
              Descubre, reserva y vive los mejores eventos en Punta Cana. Desde fiestas exclusivas en la playa hasta excursiones épicas.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/events">
                <Button size="lg" variant="secondary" rightIcon={<ArrowRight size={20} />}> Explorar Eventos </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURED EVENTS SECTION ══ */}
      <section style={{ padding: '6rem 0', background: 'var(--color-background)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Star size={20} /> Destacados
              </div>
              <h2 style={{ fontSize: '2.5rem' }}>Eventos Populares</h2>
            </div>
            <Link to="/events" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: '400px', background: '#E5E7EB', borderRadius: '1.5rem', animation: 'pulse 1.5s infinite' }} />
              ))
            ) : (
              featuredEvents.map((ev, index) => (
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
              ))
            )}
          </div>
        </div>
      </section>
      
    </div>
  );
}
