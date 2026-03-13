import React from 'react';
import { motion } from 'framer-motion';

export type LogoVariant = 'dark' | 'light' | 'compact';

export interface PuraVidaLogoProps {
  variant?: LogoVariant;
  animated?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ─── PÉTALO: curva de arriba hacia el centro ───
// Desde el centro (0,0) el pétalo sube hasta y≈-40, con ancho máx ≈ ±20
// Al rotar 180° baja hasta y≈+40 → necesitamos el SVG contenedor de ±44 unidades
const PETAL = 'M 0,-6 C 20,-20 19,-43 0,-40 C -19,-43 -20,-20 0,-6';

const PETAL_COLORS = [
  '#E37434', // 0°   arriba        naranja vivo
  '#8FAFB4', // 60°  arriba-der    gris azulado
  '#D4894A', // 120° abajo-der     ocre
  '#6CA4A9', // 180° abajo         verde agua
  '#B05D38', // 240° abajo-izq     terracota
  '#CE8055', // 300° arriba-izq    salmón
];

/* ─── Flor SVG centrada en (0,0) ─── */
const Flower: React.FC = () => (
  <g>
    {PETAL_COLORS.map((fill, i) => (
      <path
        key={i}
        d={PETAL}
        fill={fill}
        opacity={0.92}
        transform={`rotate(${i * 60})`}
      />
    ))}
    {/* Anillo exterior coral */}
    <circle r={10} fill="none" stroke="#E37434" strokeWidth={2} />
    {/* Centro crema */}
    <circle r={6.5} fill="#FAF0D2" />
    {/* Punto coral central */}
    <circle r={2.5} fill="#E37434" />
  </g>
);

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════ */
export const PuraVidaLogo: React.FC<PuraVidaLogoProps> = ({
  variant = 'dark',
  animated = true,
  className = '',
  size = 'md',
}) => {
  // Factor de escala visual final del SVG
  const scaleFactor = { sm: 0.72, md: 1, lg: 1.35 }[size];

  const textPrimary = variant === 'light' ? '#123C44' : '#F5E9CC';
  const textSub     = variant === 'light' ? '#E37434' : '#6CA4A9';
  const lineColor   = variant === 'light' ? '#A8CACC' : '#2E5557';

  /* ─── COMPACT ─────────────────────────────────
     Flor centrada en (0,0).
     La flor llega ≈ ±43 → viewBox añade 5px de padding = ±48 → "−48 −48 96 96"
  ─────────────────────────────────────────────── */
  if (variant === 'compact') {
    const px = 96 * scaleFactor;
    return (
      <motion.svg
        className={className}
        width={px} height={px}
        viewBox="-48 -48 96 96"
        xmlns="http://www.w3.org/2000/svg"
        initial={animated ? { scale: 0, rotate: -45 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      >
        {/* Fondo circular */}
        <circle r={46} fill="#6CA4A9" />
        <Flower />
      </motion.svg>
    );
  }

  /* ─── FULL LOGO (dark / light) ────────────────
     Coordenadas base (sin escalar):
       H = 96  (flor necesita ≥88 de alto con 4px de margen a cada lado)
       Flor centrada en (50, 48) → margen vertical: 48-43=5px ✓  48+43=91<96 ✓
       Texto comienza en x = 50 + 44 + 10 = 104
       W = 104 + 168 = 272
  ─────────────────────────────────────────────── */
  const VB_W = 272;
  const VB_H = 96;
  const CX   = 50;   // centro X de la flor
  const CY   = 48;   // centro Y de la flor
  const TX   = 104;  // inicio del texto

  const svgW = VB_W * scaleFactor;
  const svgH = VB_H * scaleFactor;

  return (
    <svg
      className={className}
      width={svgW} height={svgH}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"      /* ← nunca recorta aunque algún píxel salga */
    >
      {/* ── FLOR ── */}
      <motion.g
        transform={`translate(${CX}, ${CY})`}
        initial={animated ? { scale: 0, rotate: -90, opacity: 0 } : false}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
        transition={{ type: 'spring', stiffness: 130, damping: 14, delay: 0.1 }}
      >
        <Flower />
      </motion.g>

      {/* ── LÍNEA HORIZONTAL ── */}
      <motion.line
        x1={TX} y1={VB_H * 0.60}
        x2={VB_W - 4} y2={VB_H * 0.60}
        stroke={lineColor} strokeWidth={1.3}
        initial={animated ? { scaleX: 0, opacity: 0 } : false}
        animate={{ scaleX: 1, opacity: 1 }}
        style={{ transformOrigin: `${TX}px 0` }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.55 }}
      />

      {/* ── "Pura Vida" ── */}
      <motion.text
        x={TX} y={VB_H * 0.52}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={30}
        fontWeight="bold"
        fill={textPrimary}
        initial={animated ? { opacity: 0, x: -10 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        Pura Vida
      </motion.text>

      {/* ── "PUNTA CANA" ── */}
      <motion.text
        x={TX + 3} y={VB_H * 0.86}
        fontFamily="'Outfit', sans-serif"
        fontSize={10}
        fontWeight="500"
        letterSpacing="4"
        fill={textSub}
        initial={animated ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.65 }}
      >
        PUNTA CANA
      </motion.text>
    </svg>
  );
};

export default PuraVidaLogo;
