// src/components/KpiCard.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const KpiCard = React.memo(({
  title,
  value,
  subtitle,
  color,
  children,
  variant = 'elevated',
  valueStyle = {},
}) => {
  const { theme } = useTheme();

  // Diseño Moderno Minimalista
  const baseStyles = {
    background: theme.fondoContenedor, // Fondo base
    borderRadius: '16px', // Mismo radio que las tablas
    p: 3,
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',

    // Borde sutil
    border: variant === 'flat' ? 'none' : `1px solid ${theme.bordePrincipal}`,

    // Sombra suave
    boxShadow: variant === 'flat' ? 'none' : `0 4px 20px rgba(0,0,0,0.1)`,

    // Borde inferior Accent (Glow)
    borderBottom: variant === 'flat' || !color ? 'none' : `3px solid ${color}`,

    '&:hover': variant === 'flat' ? {} : {
      transform: 'translateY(-5px)',
      boxShadow: `0 12px 30px rgba(0,0,0,0.2), 0 0 15px ${color}30`, // Glow del color
      borderColor: theme.bordePrincipal, // Mantener borde sutil
    }
  };

  return (
    <Box sx={baseStyles}>
      {children ? (
        children
      ) : (
        <>
          {title && (
            <Typography variant="h6" sx={{
              color: theme.textoSecundario,
              fontWeight: 700,
              mb: 1,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.8
            }}>
              {title}
            </Typography>
          )}
          {value && (
            <Typography variant="h4" sx={{
              color: color || theme.primario,
              fontWeight: 800,
              mb: 0.5,
              fontSize: { xs: '1.8rem', md: '2.1rem' }, // Más grande e impactante
              textShadow: color ? `0 0 20px ${color}20` : 'none', // Sombra de texto suave
              ...valueStyle
            }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{
              color: theme.textoPrincipal,
              fontWeight: 500,
              fontSize: '0.85rem',
              mt: 1,
              opacity: 0.7
            }}>
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
});

export default KpiCard;
