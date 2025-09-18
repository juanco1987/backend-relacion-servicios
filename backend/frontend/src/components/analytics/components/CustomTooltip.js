import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../../context/ThemeContext';

function CustomTooltip({ active, payload, label }) {
  const { theme } = useTheme();

  if (active && payload && payload.length) {
    return (
      <Box sx={{
        background: theme.fondoContenedor,
        border: `1px solid ${theme.bordePrincipal}`,
        borderRadius: '19px',
        padding: '10px',
        color: theme.textoPrincipal
      }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => {
          if (entry.name === 'precio') return null;
          return (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
}

export default CustomTooltip;