import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface EventCardProps {
  id: string | number;
  name: string;
  category: string;
  location: string;
  eventDate: string | Date;
  availableSpots: number;
  price: number;
  imageUrl?: string;
  index?: number;
}

export function EventCard({
  id,
  name,
  category,
  location,
  eventDate,
  availableSpots,
  price,
  imageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
  index = 0
}: EventCardProps) {
  
  const formattedDate = new Date(eventDate).toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: 'spring' }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full group"
      style={{
        background: 'white',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Ojo: Dado que no uso Tailwind, aplicaré inline logic o css vars para el estilo directo premium */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
        <motion.img 
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          src={imageUrl} 
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          {category}
        </div>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.3, color: 'var(--color-primary)' }}>{name}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem', color: '#4B5563', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--color-secondary)" />
            <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="var(--color-secondary)" />
            <span>{location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="var(--color-secondary)" />
            <span>{availableSpots} cupos disponibles</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
             <span style={{ fontSize: '0.85rem', color: '#6B7280', display: 'block' }}>Precio final</span>
             <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>RD$ {price}</span>
          </div>
          <Link to={`/events/${id}`}>
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={16} />}>
              Detalle
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
