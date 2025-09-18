import React from 'react';
import { Button } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useAppTheme } from '../../../context/ThemeContext';

// Wrapper que aplica el diseño existente por defecto y centraliza colores
// desde el theme. El `sx` entrante tiene prioridad para ajustes locales.
const CustomButton = ({ color = 'primary', variant = 'contained', sx = {}, type, ...props }) => {
  const muiTheme = useMuiTheme();
  const appThemeCtx = useAppTheme();
  const theme = (appThemeCtx && appThemeCtx.theme) ? appThemeCtx.theme : muiTheme;

  // Estilo base que coincide con el diseño actual usado en los botones
  const baseStyle = {
    borderRadius: '20px',
    height: '40px',
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease',
    boxShadow: theme.sombraComponente,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.sombraComponenteHover || theme.sombraHover,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    '&.Mui-disabled': {
      background: theme.fondoOverlay,
      color: theme.textoDeshabilitado,
      transform: 'none',
      boxShadow: 'none',
    },
  };

  const resolved = {};

  if (variant === 'contained') {
    if (color === 'primary') {
      resolved.background = theme.gradientes?.botonProcesar || theme.gradientes?.servicios || theme.gradientes?.fondo;
      resolved['&:hover'] = { ...(baseStyle['&:hover'] || {}), background: theme.gradientes?.botonProcesarHover };
      resolved.color = theme.textoContraste || theme.textoPrincipal || '#fff';
    } else if (color === 'secondary') {
      resolved.background = theme.gradientes?.botonGenerar || theme.gradientes?.pendientes || theme.gradientes?.fondo;
      resolved['&:hover'] = { ...(baseStyle['&:hover'] || {}), background: theme.gradientes?.botonGenerarHover };
      resolved.color = theme.textoContraste || theme.textoPrincipal || '#fff';
    } else if (color === 'success') {
      resolved.background = `linear-gradient(135deg, ${theme.terminalVerde} 30%, ${theme.terminalVerdeNeon || theme.terminalVerde} 90%)`;
      resolved.color = theme.textoContraste || theme.textoPrincipal || '#fff';
    } else if (color === 'error') {
      resolved.background = `linear-gradient(135deg, ${theme.terminalRojo} 30%, ${theme.terminalNaranja || theme.terminalRojo} 90%)`;
      resolved.color = theme.textoContraste || theme.textoPrincipal || '#fff';
    } else if (color === 'info') {
      resolved.background = `linear-gradient(135deg, ${theme.terminalAzul} 30%, ${theme.textoInfo || theme.terminalAzul} 90%)`;
      resolved.color = theme.textoContraste || theme.textoPrincipal || '#fff';
    } else {
      resolved.background = theme.gradientes?.botonInactivo || theme.gradientes?.fondo;
      resolved.color = theme.textoContraste || theme.textoPrincipal || '#fff';
    }
  }

  if (variant === 'outlined') {
    resolved.borderColor = color === 'primary' ? theme.bordePrincipal : color === 'secondary' ? theme.bordeHover : theme.bordePrincipal;
    resolved.color = theme.textoPrincipal;
    // keep outlined hover subtle
    resolved['&:hover'] = { ...(baseStyle['&:hover'] || {}), backgroundColor: 'rgba(0,0,0,0.04)' };
  }

  // Merge: baseStyle <- resolved <- sx (sx tiene prioridad)
  const mergedSx = { ...baseStyle, ...resolved, ...sx };

  const buttonType = type || 'button';
  return <Button variant={variant} sx={mergedSx} color={color} type={buttonType} {...props} />;
};

export default CustomButton;
