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

  // Estilos base según variante
  const baseStyles = {
    background: theme.fondoContenedor,
    borderRadius: '18px',
    p: 3,
    textAlign: 'center',
    transition: 'all 0.3s ease',
    border: variant === 'flat' ? 'none' : `2px solid ${color ? `${color}20` : theme.bordePrincipal}`,
    boxShadow: variant === 'flat' ? 'none' : theme.sombraComponente,
    '&:hover': variant === 'flat' ? {} : {
      transform: 'translateY(-4px)',
      boxShadow: theme.sombraHover,
      borderColor: color ? `${color}40` : theme.bordePrincipal,
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
              fontWeight: 600,
              mb: 1,
              fontSize: '0.9rem'
            }}>
              {title}
            </Typography>
          )}
          {value && (
            <Typography variant="h4" sx={{
              color: color || theme.primario,
              fontWeight: 800,
              mb: 1,
              textShadow: color ? `0 0 10px ${color}40` : 'none',
              fontSize: { xs: '1.5rem', md: '2rem' }
              , ...valueStyle
            }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" sx={{
              color: theme.textoSecundario,
              fontWeight: 500,
              fontSize: '0.8rem'
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
