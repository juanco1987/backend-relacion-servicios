import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/numberFormatters';

const CustomTooltip = React.memo(({ active, payload, label, formatter }) => {
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

          const displayValue = formatter
            ? formatter(entry.value, entry.name)
            : formatCurrency(entry.value);
          return (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}:  {displayValue}
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
});

export default CustomTooltip;