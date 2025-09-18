import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';
import Header from '../common/Header';

const SIDEBAR_WIDTH = 260;

function DashboardLayout({ children, onNavigation, currentRoute }) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        onNavigation={onNavigation}
        currentRoute={currentRoute}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido principal */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          background: theme.fondoContenedor,
          height: '100vh',
          pl: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
        }}
      >
        {/* Header con botón hamburguesa */}
        <Box
          sx={{
            position: 'relative',
            px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 4 },
          }}
        >
          {/* Botón menú hamburguesa visible solo en móviles */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 8, md: 12 },
              left: { xs: 8, md: 12 },
              display: { xs: 'block', md: 'none' },
              zIndex: 10,
            }}
          >
            <IconButton onClick={toggleSidebar} size="large">
              <MenuIcon sx={{ color: theme.textoPrincipal }} />
            </IconButton>
          </Box>

          {/* Header completo */}
          <Header />
        </Box>

        {/* Contenido de la ruta */}
        <Box sx={{ px: { xs: 2, md: 4 }, pb: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
