import React from 'react';
import { Box } from '@mui/material';
import CustomButton from '../common/CustomButton';
import RefreshIcon from '@mui/icons-material/Refresh';

const NewProcessButton = ({ theme, processCompleted, onNewProcess }) => {
  if (!processCompleted) return null;

  return (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
      <CustomButton
        variant="outlined"
        onClick={onNewProcess}
        startIcon={<RefreshIcon />}
        sx={{
          borderColor: theme.primario,
          backgroundColor: theme.terminalAmarillo,
          color: theme.textoPrincipal,
          borderRadius: '25px',
          px: 4,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          borderWidth: '2px',
          boxShadow: theme.sombraComponente,
          
          '&:disabled': {
            borderColor: theme.bordeDeshabilitado,
            color: theme.textoDeshabilitado,
            backgroundColor: theme.fondoDeshabilitado,
          },
          '&:hover': {
            borderColor: theme.modo === 'claro' ? theme.bordeHover : theme.bordeHoverOscuro,
            color: theme.textoPrincipal,
            backgroundColor: theme.modo === 'claro' ? theme.hoverFondo : theme.hoverFondo,
            transform: 'translateY(-2px)',
            boxShadow: theme.sombraComponente,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        }}
      >
        Iniciar Nuevo Proceso
      </CustomButton>
    </Box>
  );
};

export default NewProcessButton;