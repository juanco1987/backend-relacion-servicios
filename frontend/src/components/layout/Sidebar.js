import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, useMediaQuery, List, ListItemIcon, ListItemText, Collapse, ListItemButton
} from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; 
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import PendingIcon from '@mui/icons-material/Pending';
import { useTheme } from '../../context/ThemeContext';
import logoJG from '../../assets/icono.png';

const SIDEBAR_WIDTH = 260;

const menuItems = [
      {
        label: 'Dashboard',
        icon: <DashboardIcon />,
        subItems: [
      { label: 'General', icon: <BarChartIcon />, path: '/dashboard/general' },
      { label: 'Resumen', icon: <BarChartIcon />, path: '/dashboard/analytics' },
      { label: 'Clientes', icon: <PeopleIcon />, path: '/dashboard/clientes' },
      { label: 'Servicios', icon: <BuildIcon />, path: '/dashboard/servicios' },
      { 
        label: 'Pendientes', 
        icon: <PendingIcon />,
        subItems: [
          { label: 'Pendientes por Cobrar', icon: <AccountBalanceIcon />, path: '/dashboard/pendientes/cobrar' },
          { label: 'Pendientes Efectivo', icon: <AttachMoneyIcon />, path: '/dashboard/pendientes/efectivo' }
        ]
      }
    ]
  },
  {
    label: 'Reportes PDF',
    icon: <PictureAsPdfIcon />,
    subItems: [
      { label: 'Relación de Servicios', icon: <DescriptionIcon />, path: '/reportes/servicios' },
      { label: 'Pendientes de Pago', icon: <PaymentIcon />, path: '/reportes/pendientes' },
      { label: 'Registrar Gastos', icon: <AttachMoneyIcon/>, path: '/registrar-gasto'},
    ]
  },
];

function Sidebar({ onNavigation, open, onClose, currentRoute }) {
  const { theme } = useTheme();
  const muiTheme = useMUITheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  // Abrir automáticamente el menú Dashboard si la ruta actual es del dashboard
  useEffect(() => {
    if (currentRoute && currentRoute.startsWith('/dashboard')) {
      setOpenMenu('Dashboard');
      // Si es una ruta de pendientes, abrir también el submenú
      if (currentRoute.includes('/dashboard/pendientes')) {
        setOpenSubMenu('Pendientes');
      }
    } else {
      // Si la ruta no es parte del dashboard, colapsar menús para evitar que queden abiertos
      setOpenMenu(null);
      setOpenSubMenu(null);
    }
  }, [currentRoute]);

  const renderContent = () => (
    <Box sx={{
      width: SIDEBAR_WIDTH,
      height: '100%',
      background: theme.fondoMenu,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo + usuario */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={logoJG} alt="Logo JG" style={{ width: 48, height: 48, borderRadius: '50%' }} />
        <Box sx={{ fontWeight: 700, fontSize: 16, mt: 1, color: theme.textoPrincipal }}>Juan Carvajal</Box>
        <Box sx={{ fontSize: 13, color: theme.textoSecundario }}>Administrador</Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <React.Fragment key={item.label}>
              <ListItemButton 
                onClick={() => {
                  if (item.subItems) {
                    setOpenMenu(prev => (prev === item.label ? null : item.label));
                  } else if (item.path) {
                    onNavigation(item.path);
                    setOpenMenu(null);
                    setOpenSubMenu(null);
                    if (isMobile && onClose) onClose();
                  }
                }}
                selected={item.path === currentRoute || (item.subItems && item.subItems.some(sub => sub.path === currentRoute || (sub.subItems && sub.subItems.some(subSub => subSub.path === currentRoute))))}
              >
                <ListItemIcon sx={{ color: theme.iconoPrincipal }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ sx: { color: theme.textoPrincipal, fontWeight: 700 } }}
                />
                {item.subItems ? (
                  openMenu === item.label ? <ExpandLess sx={{ color: theme.iconoPrincipal }} /> : <ExpandMore sx={{ color: theme.iconoPrincipal }} />
                ) : null}
              </ListItemButton>

              {item.subItems && (
                <Collapse in={openMenu === item.label} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <React.Fragment key={subItem.path || subItem.label}>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => {
                            if (subItem.subItems) {
                              setOpenSubMenu(prev => (prev === subItem.label ? null : subItem.label));
                            } else if (subItem.path) {
                              onNavigation(subItem.path);
                              setOpenMenu(null);
                              setOpenSubMenu(null);
                              if (isMobile && onClose) onClose();
                            }
                          }}
                          selected={subItem.path === currentRoute || (subItem.subItems && subItem.subItems.some(subSub => subSub.path === currentRoute))}
                        >
                          <ListItemIcon sx={{ color: theme.iconoSecundario }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.label}
                            primaryTypographyProps={{ sx: { color: theme.textoSecundario } }}
                          />
                          {subItem.subItems ? (
                            openSubMenu === subItem.label ? <ExpandLess sx={{ color: theme.iconoSecundario, fontSize: 18 }} /> : <ExpandMore sx={{ color: theme.iconoSecundario, fontSize: 18 }} />
                          ) : null}
                        </ListItemButton>

                        {subItem.subItems && (
                          <Collapse in={openSubMenu === subItem.label} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {subItem.subItems.map((subSubItem) => (
                                <ListItemButton
                                  key={subSubItem.path}
                                  sx={{ pl: 6 }}
                                  onClick={() => {
                                      onNavigation(subSubItem.path);
                                      setOpenMenu(null);
                                      setOpenSubMenu(null);
                                      if (isMobile && onClose) onClose();
                                  }}
                                  selected={subSubItem.path === currentRoute}
                                >
                                  <ListItemIcon sx={{ color: theme.iconoSecundario }}>
                                    {subSubItem.icon}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={subSubItem.label}
                                    primaryTypographyProps={{ sx: { color: theme.textoSecundario, fontSize: '0.9rem' } }}
                                  />
                                </ListItemButton>
                              ))}
                            </List>
                          </Collapse>
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );

  return isMobile ? (
    <Drawer anchor="left" open={open} onClose={onClose}>
      {renderContent()}
    </Drawer>
  ) : (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        bgcolor: theme.fondoMenu,
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      {renderContent()}
    </Box>
  );
}

export default Sidebar;