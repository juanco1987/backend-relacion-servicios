import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography
} from '@mui/material';

const NewProcessDialog = ({
  theme,
  open,
  onClose,
  onConfirm
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        color: theme.textoPrincipal,
        background: theme.fondoContenedor,
        borderBottom: `1px solid ${theme.borde}`
      }}>
        Confirmar Nuevo Proceso
      </DialogTitle>
      <DialogContent sx={{ 
        background: theme.fondoContenedor,
        pt: 2
      }}>
        <Typography sx={{ color: theme.textoPrincipal }}>
          ¿Deseas iniciar un nuevo informe? Esto limpiará todos los datos actuales y comenzará un nuevo proceso desde el inicio.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ 
        background: theme.fondoContenedor,
        borderTop: `1px solid ${theme.borde}`,
        p: 2
      }}>
        <Button 
          onClick={onClose}
          variant='contained'
          sx={{ 
            background: theme.bordeTerminal,
            color: theme.textoPrincipal,
            borderRadius: '25px',
            '&:hover': {
              backgroundColor: theme.fondoHover,
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          sx={{
            background: theme.primario,
            borderRadius: '25px',
            color: theme.textoContraste,
            '&:hover': {
              background: theme.primarioHover,
            },
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewProcessDialog;