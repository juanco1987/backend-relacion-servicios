import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import CustomButton from '../common/CustomButton';

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
        <CustomButton 
          onClick={onClose}
          variant='contained'
          sx={{ 
            background: theme.terminalRojo,  // Más explícito que color="error"
            color: theme.textoContraste
          }}
        >
          Cancelar
        </CustomButton>
        <CustomButton 
          onClick={onConfirm}
          variant="contained"
          sx={{
            background: theme.gradientes?.botonProcesar,  // Más explícito que color="primary"
            color: theme.textoContraste
          }}
        >
          Confirmar
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default NewProcessDialog;