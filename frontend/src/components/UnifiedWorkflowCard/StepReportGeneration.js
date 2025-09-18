import React from 'react';
import { 
  Box, Typography, TextField, Grid
} from '@mui/material';
import CustomButton from '../common/CustomButton';

const StepReportGeneration = ({
  theme,
  pdfIcon,
  processIcon,
  reportName,
  dataProcessed,
  processing,
  archivoExcel,
  userHasConfiguredDates,
  onReportNameChange,
  onProcessData,
  onGeneratePDF,
  workMode,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              component="img"
              src={pdfIcon}
              alt="PDF"
              sx={{ 
                width: 20, 
                height: 20,
                filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
              }}
            />
            <Typography variant="subtitle2" sx={{ mb: 1, color: theme.textoSecundario }}>
              Nombre del PDF
            </Typography>
          </Box>
          {!dataProcessed && (
            <Typography variant="caption" sx={{ 
              color: theme.textoDeshabilitado, 
              mb: 1, 
              display: 'block',
              fontStyle: 'italic'
            }}>
              * Debes procesar los datos primero para habilitar este campo
            </Typography>
          )}
          <TextField
            fullWidth
            label="Nombre del PDF"
            value={reportName}
            onChange={onReportNameChange}
            variant="outlined"
            size="small"
            disabled={!dataProcessed}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: dataProcessed ? theme.fondoOverlay : theme.fondoDeshabilitado,
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  '& > fieldset': { 
                    borderColor: dataProcessed ? theme.bordeHover : theme.bordeDeshabilitado,
                    borderWidth: '2px',
                  },
                  transform: dataProcessed ? 'translateY(-2px)' : 'none',
                  boxShadow: dataProcessed ? '0 6px 12px rgba(0,0,0,0.1)' : 'none',
                },
                '&.Mui-focused': {
                  '& > fieldset': { 
                    borderColor: dataProcessed ? theme.bordeHover : theme.bordeDeshabilitado,
                    borderWidth: '2px',
                  },
                  transform: dataProcessed ? 'translateY(-2px)' : 'none',
                  boxShadow: dataProcessed ? '0 8px 16px rgba(0,0,0,0.15)' : 'none',
                },
                '& > fieldset': {
                  borderColor: dataProcessed ? theme.bordePrincipal : theme.bordeDeshabilitado,
                  borderWidth: '1.5px',
                },
                '&.Mui-disabled': {
                  background: theme.fondoDeshabilitado,
                  '& > fieldset': {
                    borderColor: theme.bordeDeshabilitado,
                  },
                },
              },
              '& .MuiInputLabel-root': {
                color: dataProcessed ? theme.textoSecundario : theme.textoDeshabilitado,
                fontWeight: 500,
                '&.Mui-focused': {
                  color: dataProcessed ? theme.textoPrincipal : theme.textoDeshabilitado,
                  fontWeight: 600,
                },
              },
              '& .MuiInputBase-input': {
                color: dataProcessed ? theme.textoPrincipal : theme.textoDeshabilitado,
                fontWeight: 500,
                '&.Mui-disabled': {
                  color: theme.textoDeshabilitado,
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: theme.textoSecundario }}>
            Acciones
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <CustomButton
              variant="contained"
              disabled={!archivoExcel || !userHasConfiguredDates || processing}
              onClick={onProcessData}
              startIcon={<img src={processIcon} alt="Procesar" style={{ width: 16, height: 16 }} />}
              sx={{
                background: theme.gradientes.botonProcesar,
                color: theme.textoContraste,
                color: theme.textoContraste,
                borderRadius: '20px',
                height: '40px',
                px: 4,
                py: 1.5,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                boxShadow: theme.sombraComponente,
                '&:hover': {
                  background: theme.gradientes.botonProcesarHover,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.sombraComponenteHover,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  background: theme.fondoOverlay,
                  color: theme.textoDeshabilitado,
                  transform: 'none',
                  boxShadow: 'none',
                },
                flex: 1,
              }}
            >
              {processing ? 'Procesando...' : 'Procesar Datos'}
            </CustomButton>
            <CustomButton
              variant="contained"
              color="secondary"
              disabled={!archivoExcel || !userHasConfiguredDates || processing || !dataProcessed || !reportName.trim()}
              onClick={() => onGeneratePDF(reportName, workMode)}
              startIcon={<img src={pdfIcon} alt="PDF" style={{ width: 16, height: 16 }} />}
              sx={{
                background: theme.gradientes.botonGenerar,
                color: theme.textoContraste,
                borderRadius: '20px',
                height: '40px',
                px: 3,
                py: 1.5,
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                boxShadow: theme.sombraComponente,
                '&:hover': {
                  background: theme.gradientes.botonGenerarHover,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.sombraComponenteHover,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  background: theme.fondoOverlay,
                  color: theme.textoDeshabilitado,
                  transform: 'none',
                  boxShadow: 'none',
                },
                flex: 1,
              }}
            >
              Generar PDF
            </CustomButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StepReportGeneration;