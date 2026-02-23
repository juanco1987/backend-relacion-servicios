import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/numberFormatters';

const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
  const { theme } = useTheme();

  if (active && payload && payload.length) {
    // Usar labelFormatter si está disponible, sino usar label directamente
    const displayLabel = labelFormatter ? labelFormatter(label) : label;

    // Crear una key única basada en label y valores para forzar re-render
    const uniqueKey = `${label}-${payload.map(p => p.value).join('-')}`;

    return (
      <Box
        key={uniqueKey}
        sx={{
          background: theme.fondoContenedor,
          border: `1px solid ${theme.bordePrincipal}`,
          borderRadius: '19px',
          padding: '10px',
          color: theme.textoPrincipal,
          boxShadow: theme.sombraContenedor
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {displayLabel}
        </Typography>
        {payload.map((entry, index) => {
          if (entry.name === 'precio') return null;

          const displayValue = formatter
            ? formatter(entry.value, entry.name)
            : formatCurrency(entry.value);
          return (
            <Typography key={`${entry.name}-${entry.value}-${index}`} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {displayValue}
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
};

export default CustomTooltip;