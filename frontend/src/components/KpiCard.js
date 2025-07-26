import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '../context/ThemeContext';

const KpiCard = ({ title, value, color = '#1976d2', icon, children }) => {
  const { theme } = useTheme();
  
  return (
    <Card
      sx={{
        minWidth: 180,
        borderRadius: 5,
        boxShadow: theme.sombraComponente,
        background: theme.fondoContenedor,
        borderLeft: `6px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 0,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.sombraHover,
        },
        transition: 'all 0.3s ease'
      }}
      elevation={0}
    >
      <CardContent sx={{ width: '100%', py: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon && (
            <Box sx={{ mr: 1, color: color, fontSize: 28, display: 'flex', alignItems: 'center' }}>{icon}</Box>
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: color, letterSpacing: 0.5 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: color, mb: children ? 1 : 0 }}>
          {value}
        </Typography>
        {children && (
          <Box sx={{ mt: 0.5 }}>{children}</Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard; 