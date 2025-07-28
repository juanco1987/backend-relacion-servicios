import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Collapse, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useTheme } from '../../context/ThemeContext';
import logoJG from '../../assets/icono.png';

const menuItems = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard'
  },
  {
    label: 'Reportes PDF',
    icon: <PictureAsPdfIcon />,
    expandIcon: <ExpandMore />,
    collapseIcon: <ExpandLess />,
    subItems: [
      { label: 'Relación de Servicios', icon: <DescriptionIcon />, path: '/reportes/servicios' },
      { label: 'Pendientes de Pago', icon: <PaymentIcon />, path: '/reportes/pendientes' }
    ]
  },
  {
    label: 'Analytics',
    icon: <BarChartIcon />,
    expandIcon: <ExpandMore />,
    collapseIcon: <ExpandLess />,
    subItems: [
      { label: 'Servicios Pendientes en Efectivo', icon: <AttachMoneyIcon />, path: '/analytics/efectivo' },
      { label: 'Servicios Pendientes por Cobrar', icon: <AccountBalanceIcon />, path: '/analytics/cobrar' }
    ]
  }
];

function Sidebar({ onNavigation, currentRoute }) {
  const { theme } = useTheme();
  const [openMenus, setOpenMenus] = useState({});

  const handleMenuClick = (menuLabel) => {
    // Buscar el item del menú
    const menuItem = menuItems.find(item => item.label === menuLabel);
    
    // Si el item tiene path directo, navegar directamente
    if (menuItem && menuItem.path) {
      handleSubItemClick(menuItem.path);
      return;
    }
    
    // Si tiene subItems, alternar el estado de apertura
    setOpenMenus(prev => ({
      ...prev,
      [menuLabel]: !prev[menuLabel]
    }));
  };

  const handleSubItemClick = (path) => {
    if (onNavigation) {
      onNavigation(path);
    }
  };

  // Determinar menú y submenú activo
  const getActiveMenu = () => {
    for (const item of menuItems) {
      // Si el item tiene path directo
      if (item.path && item.path === currentRoute) {
        return { menu: item.label, sub: item.path };
      }
      // Si el item tiene subItems
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.path === currentRoute) {
            return { menu: item.label, sub: sub.path };
          }
        }
      }
    }
    return { menu: null, sub: null };
  };
  const active = getActiveMenu();

  return (
    <Box
      sx={{
        width: { xs: 70, md: 280 },
        background: theme.fondoMenu,
        boxShadow: theme.sombraContenedor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'center', md: 'flex-start' },
        py: 2, // antes era 4
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
    >
      {/* Tarjeta de usuario */}
      <Box sx={{
        width: 'calc(100% - 32px)',
        mx: 2,
        mt: 2,
        mb: 2,
        py: 2,
        background: theme.fondoContenedor,
        borderRadius: 3,
        boxShadow: theme.sombraComponente,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 220,
        mx: 'auto',
      }}>
                 <img 
           src={logoJG} 
           alt="Logo JG" 
           style={{ 
             width: 48, 
             height: 48, 
             objectFit: 'contain',
             borderRadius: '50%',
             boxShadow: theme.sombraComponente,
             marginBottom: 8,
           }} 
         />
        <span style={{
          color: theme.textoPrincipal,
          fontWeight: 700,
          fontSize: 16,
          textAlign: 'center',
          width: '100%'
        }}>
          Juan Carvajal
        </span>
        <span style={{
          color: theme.textoSecundario,
          fontSize: 13,
          textAlign: 'center',
          width: '100%'
        }}>
          Administrador
        </span>
      </Box>

      {/* Divider */}
      <Box sx={{ width: '100%', mb: 2, borderBottom: `1.5px solid ${theme.primarioClaro}40` }} />

      {/* Menú scrolleable */}
      <Box sx={{ flex: 1, width: '100%', overflowY: 'auto', minHeight: 0 }}>
        <List sx={{ width: '100%' }}>
          {menuItems.map((item) => {
            const isOpen = openMenus[item.label];
            const isActiveMenu = active.menu === item.label;
            return (
              <Box key={item.label}>
                {/* Menú principal */}
                <ListItem 
                  button 
                  onClick={() => handleMenuClick(item.label)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    color: isActiveMenu ? theme.primarioClaro : theme.textoPrincipal,
                    background: isActiveMenu ? theme.fondoMenuActivo : 'transparent',
                    fontWeight: isActiveMenu ? 700 : 500,
                    '&:hover': {
                      background: theme.fondoMenuActivo,
                      color: theme.primario,
                      transform: 'none',
                    },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    px: { xs: 0, md: 3 },
                    minHeight: 56,
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 10,
                    transform: 'none',
                    transition: 'background-color 0.2s ease',
                    '& .MuiListItemIcon-root': {
                      minWidth: 36,
                      color: 'inherit',
                    },
                    '& .MuiListItemText-root': {
                      margin: 0,
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      display: { xs: 'none', md: 'block' },
                      '& .MuiListItemText-primary': {
                        fontWeight: 600,
                        fontSize: '1rem',
                      }
                    }} 
                  />
                  {item.subItems && (
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                      {isOpen ? item.collapseIcon : item.expandIcon}
                    </Box>
                  )}
                </ListItem>

                {/* Submenús */}
                {item.subItems && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => {
                        const isActiveSub = active.sub === subItem.path;
                        return (
                          <ListItemButton
                            key={subItem.path}
                            onClick={() => handleSubItemClick(subItem.path)}
                            sx={{
                              pl: { xs: 0, md: 6 },
                              pr: { xs: 0, md: 3 },
                              py: 1,
                              color: isActiveSub ? theme.primario : theme.textoSecundario,
                              background: isActiveSub ? theme.fondoMenuActivo : 'transparent',
                              fontWeight: isActiveSub ? 700 : 500,
                              '&:hover': {
                                background: theme.fondoMenuActivo,
                                color: theme.primario,
                                transform: 'none',
                              },
                              '&:active': {
                                background: theme.fondoMenuActivo,
                              },
                              justifyContent: { xs: 'center', md: 'flex-start' },
                              minHeight: 48,
                              cursor: 'pointer',
                              position: 'relative',
                              zIndex: 10,
                              transform: 'none',
                              transition: 'background-color 0.2s ease',
                              '& .MuiListItemIcon-root': {
                                minWidth: 32,
                                color: 'inherit',
                              },
                              '& .MuiListItemText-root': {
                                margin: 0,
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.label} 
                              sx={{ 
                                display: { xs: 'none', md: 'block' },
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.9rem',
                                  fontWeight: 500,
                                }
                              }} 
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

export default Sidebar; 