import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

function KpiCard({ title, value, subtitle, color }) {
  const { theme } = useTheme();

  return (
    <Box sx={{
      background: theme.fondoContenedor,
      borderRadius: '18px',
      boxShadow: theme.sombraComponente,
      p: 3,
      textAlign: 'center',
      border: `2px solid ${color}20`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.sombraHover,
        borderColor: `${color}40`,
      }
    }}>
      <Typography variant="h6" sx={{
        color: theme.textoSecundario,
        fontWeight: 600,
        mb: 1,
        fontSize: '0.9rem'
      }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{
        color: color,
        fontWeight: 800,
        mb: 1,
        textShadow: `0 0 10px ${color}40`,
        fontSize: { xs: '1.5rem', md: '2rem' }
      }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{
        color: theme.textoSecundario,
        fontWeight: 500,
        fontSize: '0.8rem'
      }}>
        {subtitle}
      </Typography>
    </Box>
  );
}

export default KpiCard; 