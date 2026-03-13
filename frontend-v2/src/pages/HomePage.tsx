import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, MapPin, Waves, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { EventCard } from '../components/EventCard';
import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';

/* ──────────────────────────────────────────────────────
   SLIDES del carrusel hero
────────────────────────────────────────────────────── */
const HERO_SLIDES = [
  {
    id: 0,
    src: '/hero1.png',
    title: 'Playa Privada al Atardecer',
    sub: 'Arena blanca · Mar Caribe · Palmeras infinitas',
    panFrom: { scale: 1.15, x: '4%', y: '-3%' },
    panTo:   { scale: 1,    x: '0%', y: '0%'  },
  },
  {
    id: 1,
    src: '/hero2.png',
    title: 'Noches Mágicas en la Playa',
    sub: 'Cenas bajo las estrellas · Luces festivas · Brisa caribeña',
    panFrom: { scale: 1.12, x: '-3%', y: '2%' },
    panTo:   { scale: 1,    x: '0%',  y: '0%' },
  },
  {
    id: 2,
    src: '/hero3.png',
    title: 'Nightlife Épico',
    sub: 'Shows exclusivos · Música en vivo · Experiencia única',
    panFrom: { scale: 1.1,  x: '3%',  y: '3%' },
    panTo:   { scale: 1,    x: '0%',  y: '0%' },
  },
  {
    id: 3,
    src: '/hero4.png',
    title: 'Vista Aérea del Paraíso',
    sub: 'Punta Cana desde las alturas · Mar turquesa · Lujo caribeño',
    panFrom: { scale: 1.18, x: '-5%', y: '-2%' },
    panTo:   { scale: 1,    x: '0%',  y: '0%'  },
  },
];

/* ─── Separador ondulado ─── */
function WaveDivider({ topColor = '#0F172A', bottomColor = '#F8F9FA', flip = false }) {
  return (
    <div style={{ position: 'relative', height: '80px', background: topColor, overflow: 'hidden', lineHeight: 0 }}>
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', transform: flip ? 'scaleX(-1)' : 'none' }}
      >
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill={bottomColor} />
      </svg>
    </div>
  );
}

const STATS = [
  { num: '500+', label: 'Eventos realizados' },
  { num: '12K+', label: 'Viajeros felices'   },
  { num: '4.9★', label: 'Valoración promedio' },
  { num: '24/7', label: 'Soporte en destino'  },
];

/* ══════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════ */
export function HomePage() {
  const [current, setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [featuredEvents, setFeaturedEvents] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── auto-play carousel ── */
  const startAuto = () => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent(p => (p + 1) % HERO_SLIDES.length);
    }, 6000);
  };
  useEffect(() => {
    startAuto();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (dir: 1 | -1) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(dir);
    setCurrent(p => (p + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    startAuto();
  };

  /* ── events ── */
  useEffect(() => {
    api.get<unknown[]>('/events')
      .then(res => setFeaturedEvents(res.slice(0, 3)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const slide = HERO_SLIDES[current];

  /* Variants for the crossfade */
  const imgVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? '8%' : '-8%', scale: 1.08 }),
    center: { opacity: 1, x: '0%', scale: 1 },
    exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? '-8%' : '8%', scale: 0.97 }),
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: '0' }}>

      {/* ══ HERO CARRUSEL ══ */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* ── SLIDES ── */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={imgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${slide.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              willChange: 'transform, opacity',
            }}
          />
        </AnimatePresence>

        {/* ── Ken Burns en cada slide ── */}
        <motion.div
          key={`kb-${slide.id}`}
          initial={slide.panFrom}
          animate={slide.panTo}
          transition={{ duration: 6.5, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.src})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1 }}
        />

        {/* ── Overlay dramático ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(5,20,25,0.52) 0%, rgba(5,20,25,0.22) 45%, rgba(5,20,25,0.78) 100%)',
        }} />

        {/* ── Partículas flotantes ── */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} style={{
            position: 'absolute', zIndex: 3,
            width: `${8 + i * 3}px`, height: `${8 + i * 3}px`,
            borderRadius: '50%', background: 'rgba(227,116,52,0.45)',
            left: `${8 + i * 18}%`, top: `${18 + (i % 3) * 18}%`, filter: 'blur(1px)',
          }}
            animate={{ y: [0, -28, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 4.5 + i, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
          />
        ))}

        {/* ── CONTENIDO ── */}
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
            >
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(227,116,52,0.22)', border: '1px solid rgba(227,116,52,0.5)',
                backdropFilter: 'blur(8px)', color: '#F9C17E',
                padding: '0.45rem 1.2rem', borderRadius: '99px',
                fontWeight: 600, fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.05em',
              }}>
                <MapPin size={13} /> Punta Cana, República Dominicana
              </div>

              <h1 style={{
                fontSize: 'clamp(2.6rem, 6.5vw, 5.2rem)',
                color: 'white', marginBottom: '0.75rem',
                letterSpacing: '-0.03em', lineHeight: 1.1,
                fontFamily: "'Georgia', serif",
                textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              }}>
                {slide.title}
              </h1>

              <p style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
                color: 'rgba(255,255,255,0.78)',
                marginBottom: '2.5rem', letterSpacing: '0.05em',
              }}>
                {slide.sub}
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/events">
                  <Button size="lg" variant="secondary" rightIcon={<ArrowRight size={19} />}>
                    Explorar Eventos
                  </Button>
                </Link>
                <Link to="/auth">
                  <button style={{
                    padding: '0.82rem 1.9rem', borderRadius: '99px',
                    border: '2px solid rgba(255,255,255,0.45)',
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                    color: 'white', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
                  }}>
                    Crear cuenta gratis
                  </button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              marginTop: '4rem', maxWidth: '660px', margin: '4rem auto 0',
              background: 'rgba(10,25,30,0.55)', backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.14)', borderRadius: '1.25rem', overflow: 'hidden',
            }}
          >
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '1.1rem 0.75rem', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <p style={{ color: '#F9C17E', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>{s.num}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem', margin: '0.2rem 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── CONTROLES del carrusel ── */}
        <button onClick={() => go(-1)} style={{
          position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)', color: 'white',
          width: '46px', height: '46px', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChevronLeft size={22} />
        </button>
        <button onClick={() => go(1)} style={{
          position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.25)', color: 'white',
          width: '46px', height: '46px', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChevronRight size={22} />
        </button>

        {/* ── DOTS ── */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, display: 'flex', gap: '0.6rem',
        }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              style={{
                width: i === current ? '28px' : '8px', height: '8px',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: i === current ? '#E37434' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.35s ease', padding: 0,
              }}
            />
          ))}
        </div>

        {/* ── Onda de transición inferior ── */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', zIndex: 15, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,55 C360,100 720,10 1080,55 C1260,78 1350,28 1440,55 L1440,100 L0,100 Z" fill="var(--color-background)" />
          </svg>
        </div>
      </section>

      {/* ══ MARQUEE STRIP ══ */}
      <div style={{
        background: 'linear-gradient(90deg, #0a1e23 0%, #123C44 50%, #0a1e23 100%)',
        padding: '0.85rem 0',
        overflow: 'hidden',
        borderTop: '1px solid rgba(227,116,52,0.2)',
        borderBottom: '1px solid rgba(227,116,52,0.2)',
      }}>
        <div className="marquee-track">
          {[...Array(2)].map((_, rep) =>
            ['🌴 Playa VIP', '🎵 Música en Vivo', '🌊 Excursiones Marinas', '🎉 Fiestas Exclusivas', '🏄 Deportes Acuáticos', '🦞 Cenas Gourmet', '🌅 Atardeceres Mágicos', '🎭 Cultura Local', '🍹 Cocktail Nights', '🤿 Snorkel & Buceo'].map((tag, i) => (
              <span key={`${rep}-${i}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                color: i % 3 === 0 ? '#F9C17E' : i % 3 === 1 ? '#6CA4A9' : 'rgba(255,255,255,0.65)',
                fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.06em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
                padding: '0 2rem',
              }}>
                {tag}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ══ EVENTOS DESTACADOS ══ */}
      <section style={{ padding: '5rem 0 2rem', background: 'var(--color-background)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.83rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <Waves size={15} /> Experiencias Únicas
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '0.4rem' }}>
              Todo lo que Punta Cana tiene para ti
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '500px' }}>
              Selecciona tu próxima aventura caribeña — playas, fiestas, excursiones o cultura local.
            </p>
          </motion.div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={18} color="var(--color-secondary)" />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-dark)' }}>Eventos Destacados</span>
            </div>
            <Link to="/events" style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '1.5rem' }} />
                ))
              : (featuredEvents as Record<string, unknown>[]).map((ev, index) => (
                  <motion.div key={ev.id as string}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EventCard
                      id={ev.id as string} name={ev.name as string}
                      category={ev.category as string} location={ev.location as string}
                      eventDate={ev.eventDate as string} availableSpots={ev.availableSpots as number}
                      price={ev.price as number} imageUrl={ev.imageUrl as string} index={index}
                    />
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* ── Onda hacia CTA ── */}
      <WaveDivider topColor="var(--color-background)" bottomColor="#0a1e23" flip />

      {/* ══ CTA FINAL ══ */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1e23 0%, #123C44 60%, #1a4f58 100%)',
        padding: '6rem 0', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated aurora blobs */}
        <div className="aurora-blob" style={{ width: 400, height: 400, top: -120, right: -100, background: 'radial-gradient(circle, rgba(227,116,52,0.18) 0%, transparent 70%)', backgroundSize: '200% 200%' }} />
        <div className="aurora-blob" style={{ width: 350, height: 350, bottom: -100, left: -80, background: 'radial-gradient(circle, rgba(108,164,169,0.2) 0%, transparent 70%)', animationDelay: '3s', backgroundSize: '200% 200%' }} />
        {/* Floating emoji decorations */}
        {['🌴', '🌊', '🎉', '⭐', '🏖️'].map((em, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -16, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
            transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
            style={{
              position: 'absolute', fontSize: `${1.2 + i * 0.2}rem`,
              left: `${8 + i * 18}%`, top: `${20 + (i % 3) * 20}%`,
              opacity: 0.25, pointerEvents: 'none', zIndex: 1,
            }}
          >{em}</motion.div>
        ))}

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            {/* Shimmer label */}
            <div style={{
              display: 'inline-block', marginBottom: '1.25rem',
              padding: '0.4rem 1.2rem', borderRadius: '99px',
              background: 'rgba(227,116,52,0.15)', border: '1px solid rgba(227,116,52,0.35)',
              color: '#F9C17E', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              ✦ Únete ahora · Es gratis ✦
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              ¿Listo para vivir el{' '}
              <span style={{
                background: 'linear-gradient(90deg, #E37434, #F9C17E, #E37434)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'textShimmer 3s linear infinite',
              }}>
                Caribe?
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.15rem', margin: '0 auto 2.5rem', maxWidth: '520px' }}>
              Únete a miles de viajeros que ya descubren Punta Cana con Pura Vida PC.
            </p>
            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              {[['12K+', 'Viajeros'], ['500+', 'Eventos'], ['4.9★', 'Rating']].map(([n, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#F9C17E', fontWeight: 800, fontSize: '1.5rem' }}>{n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
                </div>
              ))}
            </div>
            <Link to="/auth" className="btn-shimmer" style={{ display: 'inline-block' }}>
              <Button size="lg" variant="secondary" rightIcon={<ArrowRight size={20} />}>
                Empezar gratis ahora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <WaveDivider topColor="#123C44" bottomColor="#0F172A" />
    </div>
  );
}
