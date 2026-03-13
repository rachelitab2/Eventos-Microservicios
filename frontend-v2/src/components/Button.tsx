import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary:  { background: '#123C44', color: 'white', boxShadow: '0 2px 8px rgba(18,60,68,0.3)' },
  secondary:{ background: '#E37434', color: 'white', boxShadow: '0 2px 8px rgba(227,116,52,0.3)' },
  outline:  { background: 'transparent', color: '#123C44', border: '2px solid #123C44' },
  ghost:    { background: 'transparent', color: '#374151' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: '36px', padding: '0 1rem',  fontSize: '0.875rem', borderRadius: '0.5rem'  },
  md: { height: '44px', padding: '0 1.5rem', fontSize: '1rem',    borderRadius: '0.75rem' },
  lg: { height: '56px', padding: '0 2rem',  fontSize: '1.1rem',  borderRadius: '0.875rem' },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false,
     leftIcon, rightIcon, children, disabled, style, ...props }, ref) => {

    const computedStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      border: 'none',
      transition: 'filter 0.2s ease',
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    const isDisabled = disabled || isLoading;

    return (
      // motion.div wraps a plain <button> so MotionStyle never conflicts with React.CSSProperties
      <motion.div
        style={{ display: 'inline-block', borderRadius: computedStyle.borderRadius }}
        whileHover={isDisabled ? {} : { scale: 1.03, y: -1 }}
        whileTap={isDisabled   ? {} : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <button
          ref={ref}
          disabled={isLoading || disabled}
          style={computedStyle}
          className={cn(className)}
          {...props}
        >
          {isLoading && <Loader2 size={18} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />}
          {!isLoading && leftIcon && <span style={{ marginRight: '0.5rem', display: 'flex' }}>{leftIcon}</span>}
          {children}
          {!isLoading && rightIcon && <span style={{ marginLeft: '0.5rem', display: 'flex' }}>{rightIcon}</span>}
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </button>
      </motion.div>
    );
  }
);

Button.displayName = 'Button';
