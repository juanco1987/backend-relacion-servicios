import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const SIDEBAR_WIDTH = 260; // Cambia esto al ancho real de tu Sidebar

function DashboardLayout({ children, onNavigation, currentRoute }) {
  const { theme } = useTheme();

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar fijo a la izquierda */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          bgcolor: 'transparent',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <Box sx={{ pointerEvents: 'auto' }}>
          <Sidebar onNavigation={onNavigation} currentRoute={currentRoute} />
        </Box>
      </Box>

      {/* Área de contenido a la derecha del sidebar */}
      <Box
        sx={{
          ml: `${SIDEBAR_WIDTH}px`,
          flex: 1,
          overflowY: 'auto',
          background: theme.fondoContenedor,
          p: { xs: 2, md: 4 },
          height: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;
