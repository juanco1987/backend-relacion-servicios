import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { APP_MESSAGES } from '../../config/appConfig';
import terminalIcon from '../../assets/Konsole.png';
import trashIcon from '../../assets/papelera.png';
import statusIcon from '../../assets/punto.png';
import { useTheme } from '../../context/ThemeContext';

function ProcessingConsole({ logs, onClearLogs, workMode = 0 }) {
  const { theme } = useTheme();
  const colorBg = workMode === 0 ? theme.gradientes.servicios : theme.gradientes.pendientes;
  const neonShadow = workMode === 0 ? theme.neon.servicios : theme.neon.pendientes;

  const handleClear = () => {
    if (onClearLogs) {
      onClearLogs();
    }
  };

  return (
    <Box sx={{ width: '100%', background: theme.fondoContenedor, borderRadius: '28px', boxShadow: theme.sombraContenedor, p: { xs: 2, md: 3 }, mb: 0 }}>
      {/* Header: círculos tipo Mac, icono terminal, título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: theme.terminalRojo }} />
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: theme.terminalAmarillo }} />
          <Box sx={{ width: 16, height: 16, borderRadius: '50%', background: theme.terminalVerde }} />
        </Box>
        <img src={terminalIcon} alt="Terminal" style={{ width: 32, height: 32, marginRight: 12, display: 'block' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, fontSize: '1.5rem', flex: 1 }}>
          {APP_MESSAGES.TERMINAL_TITLE}
        </Typography>
      </Box>
      {/* Área de log */}
      <Box sx={{
        background: theme.gradientes.botonInactivo,
        borderRadius: 3,
        p: 2,
        minHeight: 180,
        maxHeight: 220,
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: 17,
        color: theme.textoLog,
        mb: 2,
        boxShadow: theme.sombraComponente,
      }}>
        {logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">{APP_MESSAGES.LOG_CLEARED}</Typography>
        ) : (
          logs.map((log, idx) => {
            // Detectar si es un mensaje de éxito (contiene ✅ o palabras clave de éxito)
            const isSuccessMessage = log.includes('✅') || 
                                   log.includes('exitosamente') || 
                                   log.includes('completado') ||
                                   log.includes('generado exitosamente') ||
                                   log.includes('procesado exitosamente');
            
            return (
              <div 
                key={idx} 
                style={{ 
                  color: isSuccessMessage ? theme.terminalVerde : theme.textoLog,
                  fontWeight: isSuccessMessage ? 'bold' : 'normal',
                  textShadow: isSuccessMessage 
                    ? theme.modo === 'claro' 
                      ? '0 0 4px rgba(39,201,63,0.6)' 
                      : '0 0 4px rgba(39,201,63,0.8)'
                    : 'none',
                  fontSize: isSuccessMessage ? '18px' : '17px'
                }}
              >
                {log}
              </div>
            );
          })
        )}
      </Box>
      {/* Estado y botón limpiar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={statusIcon} alt="En línea" style={{ width: 18, height: 18, marginRight: 6, display: 'block' }} />
          <Typography variant="body1" sx={{ color: theme.textoEnLinea, fontWeight: 'bold', fontFamily: 'monospace' }}>
            {APP_MESSAGES.TERMINAL_STATUS_ONLINE}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={onClearLogs}
          startIcon={
          <img src={trashIcon} alt="Limpiar" style={{ width: 32, height: 32, marginRight: 12, display: 'block' }} />
          }
          sx={{
            background: colorBg,
            color: theme.textoPrincipal,
            fontWeight: 'bold',
            borderRadius: '14px',
            boxShadow: neonShadow,
            px: 4,
            py: 1.2,
            fontSize: 16,
            minWidth: 120,
            transition: 'box-shadow 0.3s, background 0.3s',
            '&:hover': {
              background: colorBg,
              boxShadow: neonShadow,
              filter: 'brightness(1.15)',
            },
          }}
        >
          {APP_MESSAGES.BUTTON_CLEAR_TEXT}
        </Button>
      </Box>
    </Box>
  );
}

export default ProcessingConsole; 