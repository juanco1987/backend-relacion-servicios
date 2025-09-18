import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { APP_MESSAGES } from '../../config/appConfig';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';

const tabLabels = [
  APP_MESSAGES.WORK_MODE_SERVICES || 'Relación de Servicios',
  APP_MESSAGES.WORK_MODE_PENDING || 'Pendientes de Pago',
  'Servicios Pendientes en Efectivo',
  'Servicios Pendientes por Cobrar', // NUEVO TAB
];

function WorkModeTabs({ value, onChange, workMode = 0 }) {
  const { theme } = useTheme();
  
  // Definir colores para cada pestaña
  const getTabColors = (tabIndex) => {
    switch(tabIndex) {
      case 0:
        return {
          colorBg: theme.gradientes.servicios,
          colorMain: theme.gradientes.servicios,
          neonShadow: theme.neon.servicios
        };
      case 1:
        return {
          colorBg: theme.gradientes.pendientes,
          colorMain: theme.gradientes.pendientes,
          neonShadow: theme.neon.pendientes
        };
      case 2:
        return {
          colorBg: theme.terminalAmarillo,
          colorMain: theme.terminalAmarillo,
          neonShadow: `0 0 20px ${theme.terminalAmarillo}80`
        };
      case 3:
        return {
          colorBg: theme.textoInfo,
          colorMain: theme.textoInfo,
          neonShadow: `0 0 20px ${theme.textoInfo}80`
        };
      default:
        return {
          colorBg: theme.gradientes.servicios,
          colorMain: theme.gradientes.servicios,
          neonShadow: theme.neon.servicios
        };
    }
  };

  const currentColors = getTabColors(value);

  return (
    <Box sx={{ 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      gap: { xs: 2, md: 4 }, 
      py: { xs: 2, md: 3 },
      flexWrap: 'wrap'
    }}>
      {tabLabels.map((label, idx) => {
        const tabColors = getTabColors(idx);
        return (
          <motion.div
            key={label}
            whileHover={ANIMATIONS.buttonHover}
            whileTap={ANIMATIONS.buttonTap}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Button
              onClick={e => onChange(e, idx)}
              disableElevation
              sx={{
                minWidth: { xs: 160, md: 180 },
                minHeight: 56,
                px: 2,
                py: 1,
                borderRadius: '66px',
                fontWeight: 800,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                color: theme.textoPrincipal,
                background: value === idx ? tabColors.colorBg : theme.gradientes.botonInactivo,
                boxShadow: value === idx ? tabColors.neonShadow : theme.sombraComponente,
                transition: 'all 0.2s',
                textTransform: 'none',
                mb: 1,
                border: value === idx ? `2px solid ${tabColors.colorMain}` : '2px solid transparent',
                letterSpacing: '-1px',
                '&:hover': {
                  background: tabColors.colorBg,
                  boxShadow: tabColors.neonShadow,
                  filter: 'brightness(1.15)',
                },
              }}
            >
              {label}
            </Button>
          </motion.div>
        );
      })}
    </Box>
  );
}

export default WorkModeTabs; 