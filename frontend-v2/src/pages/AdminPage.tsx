import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Server, ScrollText, Calendar,
  RefreshCw, Activity, Wifi, WifiOff, Clock,
  Plus, Pencil, Trash2, Search, ChevronDown,
  AlertTriangle, CheckCircle, XCircle, Loader2,
  MapPin, Users, DollarSign, Eye, EyeOff
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { EventForm } from '../components/EventForm';
import { Modal } from '../components/Modal';
import type { EventFormData } from '../components/EventForm';
import type { AdminSummary, ServiceStatus, AuditEntry, AdminEvent } from '../types/admin';

type TabKey = 'summary' | 'services' | 'audit' | 'events';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'summary', label: 'Resumen', icon: <LayoutDashboard size={18} /> },
  { key: 'services', label: 'Servicios', icon: <Server size={18} /> },
  { key: 'audit', label: 'Auditoría', icon: <ScrollText size={18} /> },
  { key: 'events', label: 'Eventos', icon: <Calendar size={18} /> },
];

/* ═══════════════════════════════════
   STAT CARD
═══════════════════════════════════ */
function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: '1.25rem', padding: '1.5rem',
        border: '1px solid #E5E7EB', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: 40, height: 40, borderRadius: '0.75rem', background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-dark)', fontFamily: 'var(--font-heading)' }}>{value}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   STATUS BADGE
═══════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    healthy: { bg: '#ECFDF5', color: '#059669', icon: <CheckCircle size={12} /> },
    degraded: { bg: '#FFFBEB', color: '#D97706', icon: <AlertTriangle size={12} /> },
    down: { bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={12} /> },
  };
  const c = config[status] || config.down;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.3rem 0.75rem', borderRadius: '99px',
      background: c.bg, color: c.color, fontSize: '0.78rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.03em',
    }}>
      {c.icon} {status}
    </span>
  );
}

/* ═══════════════════════════════════
   LOADING SPINNER
═══════════════════════════════════ */
function LoadingState({ message }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
      <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>{message || 'Cargando...'}</p>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════
   EMPTY STATE
═══════════════════════════════════ */
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '1.5rem', border: '1px dashed #D1D5DB' }}>
      <div style={{ width: 56, height: 56, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#9CA3AF' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-dark)', marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{description}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════
   SECTION: SUMMARY
═══════════════════════════════════ */
function SummarySection() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.authGet<AdminSummary>('/admin/api/summary');
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar resumen');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <LoadingState message="Consultando servicios..." />;
  if (error) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <AlertTriangle size={32} color="#DC2626" style={{ marginBottom: '1rem' }} />
      <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{error}</p>
      <button onClick={fetch} style={{ padding: '0.5rem 1.5rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Reintentar</button>
    </div>
  );
  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Resumen del Sistema</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetch} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          <RefreshCw size={14} /> Actualizar
        </motion.button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard label="Total Servicios" value={data.totalServices} color="#123C44" icon={<Server size={20} />} />
        <StatCard label="Saludables" value={data.healthy} color="#059669" icon={<CheckCircle size={20} />} />
        <StatCard label="Degradados" value={data.degraded} color="#D97706" icon={<AlertTriangle size={20} />} />
        <StatCard label="Caídos" value={data.down} color="#DC2626" icon={<XCircle size={20} />} />
      </div>

      {/* Quick service overview */}
      <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text-dark)' }}>Estado Rápido</h3>
        </div>
        {data.services.map((svc, i) => (
          <div key={svc.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', borderBottom: i < data.services.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: svc.status === 'healthy' ? '#10B981' : svc.status === 'degraded' ? '#F59E0B' : '#EF4444' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{svc.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{svc.latency}ms</span>
              <StatusBadge status={svc.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SECTION: SERVICES
═══════════════════════════════════ */
function ServicesSection() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingKey, setRefreshingKey] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.authGet<ServiceStatus[]>('/admin/api/services');
      setServices(res);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refreshOne = async (key: string) => {
    setRefreshingKey(key);
    try {
      const res = await api.authGet<ServiceStatus>(`/admin/api/services/${key}/health`);
      setServices(prev => prev.map(s => s.key === key ? res : s));
      showToast(`${res.name} actualizado`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    } finally {
      setRefreshingKey(null);
    }
  };

  const restartService = async (key: string, name: string) => {
    try {
      await api.authPost(`/admin/api/services/${key}/restart`, {});
      showToast(`Señal de reinicio enviada a ${name}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    }
  };

  if (loading) return <LoadingState message="Consultando microservicios..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Gestión de Microservicios</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          <RefreshCw size={14} /> Refrescar Todo
        </motion.button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {services.map((svc, index) => (
          <motion.div
            key={svc.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              background: 'white', borderRadius: '1.25rem', padding: '1.5rem',
              border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '0.875rem',
                background: svc.status === 'healthy' ? '#ECFDF5' : svc.status === 'degraded' ? '#FFFBEB' : '#FEF2F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {svc.status === 'healthy' ? <Wifi size={20} color="#059669" /> : svc.status === 'degraded' ? <Activity size={20} color="#D97706" /> : <WifiOff size={20} color="#DC2626" />}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.15rem' }}>{svc.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Puerto {svc.port} &middot; {svc.latency}ms</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StatusBadge status={svc.status} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refreshOne(svc.key)}
                disabled={refreshingKey === svc.key}
                style={{
                  padding: '0.45rem 0.9rem', borderRadius: '0.625rem',
                  border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  opacity: refreshingKey === svc.key ? 0.5 : 1,
                }}
              >
                <RefreshCw size={13} style={refreshingKey === svc.key ? { animation: 'spin 1s linear infinite' } : {}} />
                Health
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => restartService(svc.key, svc.name)}
                style={{
                  padding: '0.45rem 0.9rem', borderRadius: '0.625rem',
                  border: '1px solid rgba(227,116,52,0.3)', background: 'rgba(227,116,52,0.05)',
                  cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
              >
                <RefreshCw size={13} /> Restart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SECTION: AUDIT
═══════════════════════════════════ */
function AuditSection() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('');
  const [limit, setLimit] = useState(50);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (serviceFilter) params.set('serviceId', serviceFilter);
      params.set('limit', String(limit));
      const res = await api.authGet<AuditEntry[]>(`/admin/api/audit?${params.toString()}`);
      setEntries(res);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [serviceFilter, limit]);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const methodColors: Record<string, string> = {
    GET: '#3B82F6', POST: '#10B981', PUT: '#F59E0B', DELETE: '#EF4444',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Registro de Auditoría</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.75rem', borderRadius: '0.625rem',
                border: '1px solid #E5E7EB', background: 'white', fontSize: '0.85rem',
                fontWeight: 500, appearance: 'none', cursor: 'pointer', minWidth: '160px',
              }}
            >
              <option value="">Todos los servicios</option>
              <option value="gateway">Gateway</option>
              <option value="auth-service">Auth Service</option>
              <option value="event-service">Event Service</option>
              <option value="user-service">User Service</option>
              <option value="inscrip-service">Inscription Service</option>
              <option value="notification-service">Notification Service</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{
                padding: '0.5rem 2rem 0.5rem 0.75rem', borderRadius: '0.625rem',
                border: '1px solid #E5E7EB', background: 'white', fontSize: '0.85rem',
                fontWeight: 500, appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value={20}>20 entradas</option>
              <option value={50}>50 entradas</option>
              <option value={100}>100 entradas</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }} />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchAudit} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.625rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            <RefreshCw size={14} />
          </motion.button>
        </div>
      </div>

      {loading ? <LoadingState message="Cargando auditoría..." /> : entries.length === 0 ? (
        <EmptyState icon={<ScrollText size={28} />} title="Sin registros" description="Las acciones administrativas aparecerán aquí." />
      ) : (
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Fecha', 'Servicio', 'Método', 'Ruta', 'Estado', 'Resumen'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFC')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                      {new Date(entry.timestamp).toLocaleString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{entry.serviceKey}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'white', background: methodColors[entry.method] || '#6B7280' }}>{entry.method}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{entry.path}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ fontWeight: 700, color: entry.status >= 200 && entry.status < 300 ? '#059669' : entry.status >= 400 ? '#DC2626' : '#D97706' }}>{entry.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   SECTION: EVENTS
═══════════════════════════════════ */
function EventsSection() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<(Partial<EventFormData> & { id?: string | number }) | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<AdminEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.authGet<AdminEvent[]>('/admin/api/events');
      setEvents(res);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al cargar eventos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreate = () => { setEditingEvent(undefined); setShowForm(true); };

  const handleEdit = (ev: AdminEvent) => {
    setEditingEvent({
      id: ev.id, name: ev.name, category: ev.category, location: ev.location,
      eventDate: ev.eventDate, totalCapacity: ev.totalCapacity, price: ev.price,
      imageUrl: ev.imageUrl || '', description: ev.description,
      instagram: '', facebook: '', tiktok: '', whatsapp: '',
    });
    setShowForm(true);
  };

  const handleDeleteClick = (ev: AdminEvent) => { setDeletingEvent(ev); setShowDeleteModal(true); };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setSubmitting(true);
    try {
      await api.authDelete(`/events/${deletingEvent.id}`);
      showToast('Evento eliminado', 'success');
      setShowDeleteModal(false);
      await fetchEvents();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (ev: AdminEvent) => {
    try {
      await api.authPut(`/admin/api/events/${ev.id}/toggle-active`);
      showToast(`Evento "${ev.name}" desactivado`, 'success');
      await fetchEvents();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error');
    }
  };

  const handleFormSaved = async () => { setShowForm(false); setEditingEvent(undefined); await fetchEvents(); };

  const filtered = events.filter(ev => !searchTerm || ev.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Administración de Eventos</h2>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--color-secondary)', color: 'white',
            padding: '0.7rem 1.25rem', borderRadius: '0.75rem',
            border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(227,116,52,0.35)',
          }}
        >
          <Plus size={18} /> Nuevo Evento
        </motion.button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar eventos..."
          style={{
            width: '100%', padding: '0.75rem 1rem 0.75rem 3rem',
            borderRadius: '0.875rem', border: '1px solid #E5E7EB',
            outline: 'none', background: 'white', fontSize: '0.95rem',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
        />
      </div>

      {!loading && (
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>
          {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {loading ? <LoadingState message="Cargando eventos..." /> : filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={28} />} title="Sin eventos" description="Crea tu primer evento." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((ev, index) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              style={{
                background: 'white', borderRadius: '1.25rem', overflow: 'hidden',
                border: `1px solid ${ev.active ? '#E5E7EB' : '#FEE2E2'}`,
                opacity: ev.active ? 1 : 0.7,
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Image */}
              <div style={{ height: '150px', background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                {ev.imageUrl ? (
                  <img src={ev.imageUrl} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', color: 'rgba(255,255,255,0.3)', fontSize: '2.5rem', fontWeight: 700 }}>
                    {ev.name.charAt(0)}
                  </div>
                )}
                <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', display: 'flex', gap: '0.4rem' }}>
                  <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.73rem', fontWeight: 600 }}>{ev.category}</span>
                  {!ev.active && (
                    <span style={{ background: 'rgba(220,38,38,0.85)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.73rem', fontWeight: 600 }}>Inactivo</span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.15rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: 1.3 }}>{ev.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {ev.location}</span>
                  <span style={{ fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {formatDate(ev.eventDate)}</span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={13} /> RD${ev.price.toLocaleString()}</span>
                    <span style={{ fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={13} /> {ev.availableSpots}/{ev.totalCapacity}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleEdit(ev)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                    <Pencil size={13} /> Editar
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleToggleActive(ev)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', color: ev.active ? '#D97706' : '#059669' }} title={ev.active ? 'Desactivar' : 'Activar'}>
                    {ev.active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleDeleteClick(ev)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #FEE2E2', background: 'white', cursor: 'pointer', color: '#EF4444' }}>
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* EventForm Modal */}
      <AnimatePresence>
        {showForm && (
          <EventForm
            initialData={editingEvent}
            onClose={() => { setShowForm(false); setEditingEvent(undefined); }}
            onSaved={handleFormSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {showDeleteModal && deletingEvent && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm">
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Eliminar evento</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            ¿Eliminar <strong>"{deletingEvent.name}"</strong>? Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowDeleteModal(false)} disabled={submitting} style={{ padding: '0.65rem 1.25rem', borderRadius: '0.625rem', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button onClick={handleConfirmDelete} disabled={submitting} style={{ padding: '0.65rem 1.25rem', borderRadius: '0.625rem', border: 'none', background: '#EF4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>{submitting ? 'Eliminando...' : 'Eliminar'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN ADMIN PAGE
═══════════════════════════════════════════════════════ */
export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const { session } = useAuth();

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.25rem)', marginBottom: '0.35rem' }}
        >
          Panel de Administración
        </motion.h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Bienvenido, <strong>{session?.username}</strong>. Gestiona la plataforma desde aquí.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '0.35rem', marginBottom: '2rem',
        background: '#F3F4F6', padding: '0.35rem', borderRadius: '1rem',
        overflowX: 'auto',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              whileHover={!isActive ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.65rem 1.25rem', borderRadius: '0.75rem',
                border: 'none', cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                background: isActive ? 'white' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'summary' && <SummarySection />}
          {activeTab === 'services' && <ServicesSection />}
          {activeTab === 'audit' && <AuditSection />}
          {activeTab === 'events' && <EventsSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
