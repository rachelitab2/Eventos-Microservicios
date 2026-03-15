import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Image, MapPin, Calendar, DollarSign, Users, Tag, FileText, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const CATEGORIES = [
  'Música', 'Deportes', 'Cultura', 'Gastronomía',
  'Tecnología', 'Educación', 'Entretenimiento', 'Otro',
];

export interface EventFormData {
  name: string;
  category: string;
  location: string;
  eventDate: string;
  totalCapacity: number;
  price: number;
  imageUrl: string;
  description: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
}

interface EventFormProps {
  initialData?: Partial<EventFormData> & { id?: string | number };
  onClose: () => void;
  onSaved: () => void;
}

const emptyForm: EventFormData = {
  name: '',
  category: 'Música',
  location: '',
  eventDate: '',
  totalCapacity: 1,
  price: 0,
  imageUrl: '',
  description: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  whatsapp: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.75rem',
  border: '1px solid #E5E7EB',
  outline: 'none',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '0.4rem',
  fontSize: '0.9rem',
  color: '#374151',
};

function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = 'var(--color-primary)';
}
function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#E5E7EB';
}

export function EventForm({ initialData, onClose, onSaved }: EventFormProps) {
  const isEditing = !!initialData?.id;
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<EventFormData>(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        category: initialData.category || 'Música',
        location: initialData.location || '',
        eventDate: initialData.eventDate ? initialData.eventDate.slice(0, 16) : '',
        totalCapacity: initialData.totalCapacity ?? 1,
        price: initialData.price ?? 0,
        imageUrl: initialData.imageUrl || '',
        description: initialData.description || '',
        instagram: initialData.instagram || '',
        facebook: initialData.facebook || '',
        tiktok: initialData.tiktok || '',
        whatsapp: initialData.whatsapp || '',
      });
    }
  }, [initialData]);

  const set = (field: keyof EventFormData, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.eventDate || !form.location) {
      showToast('Completa todos los campos requeridos', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.authPut(`/events/${initialData!.id}`, form);
        showToast('Evento actualizado exitosamente', 'success');
      } else {
        await api.authPost('/events', form);
        showToast('Evento creado exitosamente', 'success');
      }
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar evento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-dark)', margin: 0 }}>
            {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: '#F3F4F6', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={18} color="#6B7280" />
          </motion.button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}><Tag size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Nombre del evento *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Concierto de Reggaeton" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          {/* Category + Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Categoría *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }} onFocus={focusBorder as any} onBlur={blurBorder as any}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Calendar size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Fecha y Hora *</label>
              <input type="datetime-local" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}><MapPin size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Ubicación *</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ej: Playa Blanca, Punta Cana" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          {/* Capacity + Price row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}><Users size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Capacidad Total *</label>
              <input type="number" min="1" value={form.totalCapacity} onChange={e => set('totalCapacity', parseInt(e.target.value) || 1)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label style={labelStyle}><DollarSign size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Precio (RD$) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}><Image size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />URL de imagen</label>
            <input type="text" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}><FileText size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Descripción *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe el evento..." style={{ ...inputStyle, minHeight: '100px', resize: 'none' as const }} onFocus={focusBorder as any} onBlur={blurBorder as any} />
          </div>

          {/* Social Media Section */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.75rem' }}>Redes Sociales (opcional)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><Instagram size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Instagram</label>
                <input type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@usuario" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
              <div>
                <label style={labelStyle}><Facebook size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Facebook</label>
                <input type="text" value={form.facebook} onChange={e => set('facebook', e.target.value)} placeholder="facebook.com/pagina" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
              <div>
                <label style={labelStyle}>TikTok</label>
                <input type="text" value={form.tiktok} onChange={e => set('tiktok', e.target.value)} placeholder="@usuario" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
              <div>
                <label style={labelStyle}><MessageCircle size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+1 809 000 0000" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: '1rem', justifyContent: 'flex-end',
          padding: '1.25rem 2rem',
          borderTop: '1px solid #F3F4F6',
        }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
              border: '1px solid #E5E7EB', background: 'white',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
            }}
          >
            Cancelar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
              border: 'none', background: 'var(--color-secondary)', color: 'white',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(227,116,52,0.35)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            {submitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Evento'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
