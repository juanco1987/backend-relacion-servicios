import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Stepper, Step, StepLabel, 
  StepContent, Paper, IconButton, Chip, Divider, MenuItem, Select,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Grow
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '../src/context/ThemeContext';
import { ANIMATIONS } from '../src/config/animations';
import { APP_MESSAGES } from '../src/config/appConfig';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Iconos
import excelIcon from '../../assets/document_microsoft_excel.png';
import engraneIcon from '../../assets/engrane.png';
import calendarIcon2 from '../../assets/calendario_2.png';
import notesIcon from '../../assets/document_write.png';
import planIcon from '../../assets/play.png';
import actionIcon from '../../assets/flechas_circulo.png';
import pdfIcon from '../../assets/icono_pdf.png';
import processIcon from '../../assets/Engrenages.png';
import RefreshIcon from '@mui/icons-material/Refresh';

const UnifiedWorkflowCard = ({
  archivoExcel,
  fechaInicio,
  fechaFin,
  notas,
  onFileChange,
  onFechaInicioChange,
  onFechaFinChange,
  onNoteChange,
  onProcessData,
  onGeneratePDF,
  processing,
  animationState,
  workMode = 0
}) => {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [reportName, setReportName] = useState('');
  const [processCompleted, setProcessCompleted] = useState(false);
  const [dataProcessed, setDataProcessed] = useState(false);
  const [showNewProcessDialog, setShowNewProcessDialog] = useState(false);
  const [shouldClearFile, setShouldClearFile] = useState(false);
  const prevActiveStepRef = useRef(0);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  
  // Estados para el selector de fechas
  const currentYear = dayjs().year();
  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(currentYear);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [userHasConfiguredDates, setUserHasConfiguredDates] = useState(false);

  // Sincronizar estados locales con props
  useEffect(() => {
    if (fechaInicio) {
      setFromDate(dayjs(fechaInicio));
      setMonth(dayjs(fechaInicio).month());
      setYear(dayjs(fechaInicio).year());
    }
  }, [fechaInicio]);

  useEffect(() => {
    if (fechaFin) {
      setToDate(dayjs(fechaFin));
    }
  }, [fechaFin]);

  const months = APP_MESSAGES.MONTHS_NAMES || [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Generar nombre por defecto
  const generateDefaultName = () => {
    const dateStr = dayjs().format('YYYY-MM-DD');
    const timeStr = dayjs().format('HH-mm-ss');
    if (workMode === 0) {
      return `Relacion_Servicios_${dateStr}_${timeStr}.pdf`;
    } else {
      return `Pendientes_de_Pago_${dateStr}_${timeStr}.pdf`;
    }
  };


  useEffect(() => {
    setReportName(generateDefaultName());
  }, [workMode]);

  // Función para manejar el inicio de un nuevo proceso
  const handleNewProcess = () => {
    setShowNewProcessDialog(true);
  };

  // Función para confirmar el nuevo proceso
  const confirmNewProcess = () => {
    // Resetear todos los estados
    setActiveStep(0);
    setReportName(generateDefaultName());
    setProcessCompleted(false);
    setDataProcessed(false);
    setMonth(dayjs().month());
    setYear(currentYear);
    setFromDate(null);
    setToDate(null);
    setUserHasConfiguredDates(false);
    
    // Limpiar los datos del archivo y fechas
    if (onFileChange) {
      onFileChange({ target: { files: [] } });
    }
    if (onFechaInicioChange) {
      onFechaInicioChange(null);
    }
    if (onFechaFinChange) {
      onFechaFinChange(null);
    }
    if (onNoteChange) {
      onNoteChange('');
    }
    
    setShowNewProcessDialog(false);
  };

  // Función para cancelar el nuevo proceso
  const cancelNewProcess = () => {
    setShowNewProcessDialog(false);
  };

  // Función personalizada para manejar el procesamiento
  const handleProcessDataClick = async () => {
    if (onProcessData) {
      const result = await onProcessData();
      
      // Solo establecer dataProcessed como true si el procesamiento fue exitoso
      if (result && result.success) {
        console.log('Procesamiento exitoso, habilitando campo de nombre del PDF');
        setDataProcessed(true);
      } else {
        console.log('Procesamiento falló, manteniendo estado actual del botón de avance');
        // NO cambiar dataProcessed, mantener el estado actual
        // Esto mantiene el botón de avance del stepper en su estado original
      }
    }
  };

  // Resetear dataProcessed cuando cambien los archivos o fechas
  useEffect(() => {
    if (dataProcessed) {
      console.log('Archivo o fechas cambiaron, reseteando estado de datos procesados');
      setDataProcessed(false);
    }
  }, [archivoExcel, fechaInicio, fechaFin]);

  // Debug logs para verificar props
  useEffect(() => {
    console.log('UnifiedWorkflowCard props:', {
      archivoExcel: archivoExcel,
      archivoExcelName: archivoExcel?.name,
      archivoExcelType: typeof archivoExcel,
      fechaInicio: fechaInicio?.format?.('YYYY-MM-DD'),
      fechaFin: fechaFin?.format?.('YYYY-MM-DD'),
      notas,
      workMode,
      userHasConfiguredDates,
      fromDate: fromDate?.format?.('YYYY-MM-DD'),
      toDate: toDate?.format?.('YYYY-MM-DD'),
      onGeneratePDF: !!onGeneratePDF
    });
  }, [archivoExcel, fechaInicio, fechaFin, notas, workMode, userHasConfiguredDates, fromDate, toDate, onGeneratePDF]);

  // Lógica para avanzar automáticamente el activeStep
  useEffect(() => {
    // Si se carga un archivo, avanzar al paso 1 (Configurar parámetros)
    if (activeStep === 0 && archivoExcel && prevActiveStepRef.current > 0) {
      console.log('UnifiedWorkflowCard: Navegado de vuelta al paso 0 con archivo , Limpiando ..');
      if (onFileChange) {
        onFileChange({ target: { files: [] } }); // Limpiar el archivo en App.js
      }
      setFromDate(null);
      setToDate(null);
      setUserHasConfiguredDates(false);
      if (onNoteChange) {
        onNoteChange(''); // Limpiar notas también para un reinicio limpio
      }
      setReportName(generateDefaultName()); // Resetear nombre del reporte al predeterminado
      setProcessCompleted(false); // Asegurar que el estado de completado del proceso se
      setDataProcessed(false); // Resetear el estado de datos procesados
    }
    prevActiveStepRef.current = activeStep;
  }, [archivoExcel, activeStep, onFileChange, onNoteChange, generateDefaultName]);

  // Detectar navegación hacia atrás y marcar para limpiar
  useEffect(() => {
    const prevStep = prevActiveStepRef.current;
    const hasNavigatedBack = prevStep > 0 && activeStep === 0;
    
    if (hasNavigatedBack && archivoExcel) {
      console.log('UnifiedWorkflowCard: Navegado de vuelta al paso 0, marcando para limpiar archivo');
      setShouldClearFile(true);
    }
    
    // Actualizar la referencia del paso anterior
    prevActiveStepRef.current = activeStep;
  }, [activeStep, archivoExcel]);

  // Limpiar archivo y resetear estados cuando se marca para limpiar
  useEffect(() => {
    if (shouldClearFile && archivoExcel) {
      console.log('UnifiedWorkflowCard: Limpiando archivo y estados relacionados.');
      
      if (onFileChange) {
        onFileChange({ target: { files: [] } }); // Limpiar el archivo en App.js
      }
      // También resetear estados locales que dependen de la selección de archivo para un estado limpio
      setFromDate(null);
      setToDate(null);
      setUserHasConfiguredDates(false);
      if (onNoteChange) {
        onNoteChange(''); // Limpiar notas también para un reinicio limpio
      }
      setReportName(generateDefaultName()); // Resetear nombre del reporte al predeterminado
      setProcessCompleted(false); // Asegurar que el estado de completado del proceso se resetee
      
      // Resetear el flag de limpieza
      setShouldClearFile(false);
    }
  }, [shouldClearFile, archivoExcel, onFileChange, onNoteChange]);

  // Removido el auto-avance del paso 1 al 2 para permitir que el usuario escriba notas

  // Handlers para fechas
  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    console.log('handleMonthChange ejecutado:', newMonth);
    setMonth(newMonth);
    
    const newFrom = dayjs().year(year).month(newMonth).startOf('month');
    const newTo = dayjs().year(year).month(newMonth).endOf('month');
    setFromDate(newFrom);
    setToDate(newTo);
    setUserHasConfiguredDates(true);
    
    console.log('Month changed:', newMonth, 'From:', newFrom.format('YYYY-MM-DD'), 'To:', newTo.format('YYYY-MM-DD'));
    console.log('onFechaInicioChange existe:', !!onFechaInicioChange);
    console.log('onFechaFinChange existe:', !!onFechaFinChange);
    
    if (onFechaInicioChange) onFechaInicioChange(newFrom);
    if (onFechaFinChange) onFechaFinChange(newTo);
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setYear(newYear);
    
    const newFrom = dayjs().year(newYear).month(month).startOf('month');
    const newTo = dayjs().year(newYear).month(month).endOf('month');
    setFromDate(newFrom);
    setToDate(newTo);
    setUserHasConfiguredDates(true);
    
    console.log('Year changed:', newYear, 'From:', newFrom.format('YYYY-MM-DD'), 'To:', newTo.format('YYYY-MM-DD'));
    if (onFechaInicioChange) onFechaInicioChange(newFrom);
    if (onFechaFinChange) onFechaFinChange(newTo);
  };

  const handleFromDateChange = (newDate) => {
    console.log('From date changed:', newDate?.format('YYYY-MM-DD'));
    setFromDate(newDate);
    setUserHasConfiguredDates(true);
    if (onFechaInicioChange) onFechaInicioChange(newDate);
  };

  const handleToDateChange = (newDate) => {
    console.log('To date changed:', newDate?.format('YYYY-MM-DD'));
    setToDate(newDate);
    setUserHasConfiguredDates(true);
    if (onFechaFinChange) onFechaFinChange(newDate);
  };

  // Determinar el estado de cada paso
  const getStepStatus = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Cargar archivo
        return archivoExcel ? 'completed' : 'pending';
      case 1: // Configurar parámetros
        return userHasConfiguredDates ? 'completed' : 'pending';
      case 2: // Generar reporte
        return dataProcessed ? 'completed' : (processing ? 'active' : 'pending');
      default:
        return 'pending';
    }
  };

  const steps = [
    {
      label: 'Cargar archivo Excel',
      description: 'Selecciona el archivo de datos que contiene la información de servicios',
      icon: excelIcon,
      content: (
        <Box sx={{ mt: 2 }}>
          <motion.div
            whileHover={ANIMATIONS.formFieldHover}
            whileTap={{ scale: 0.98 }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Archivo Excel"
                value={archivoExcel?.name || ''}
                placeholder="Selecciona un archivo Excel..."
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  width: '70%',
                  height: '40px',
                  '& .MuiOutlinedInput-root': {
                    background: theme.fondoOverlay,
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& > fieldset': { 
                        borderColor: theme.bordeHover,
                        borderWidth: '2px',
                      },
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      '& > fieldset': { 
                        borderColor: theme.bordeHover,
                        borderWidth: '2px',
                      },
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    },
                    '& > fieldset': {
                      borderColor: theme.bordePrincipal,
                      borderWidth: '1.5px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.textoSecundario,
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: theme.textoPrincipal,
                      fontWeight: 600,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.textoPrincipal,
                    fontWeight: 500,
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.textoSecundario,
                    fontSize: '0.75rem',
                  },
                }}
              />
              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{
                  background: theme.fondoOverlay,
                  color: theme.textoPrincipal,
                  borderColor: theme.bordePrincipal,
                  borderRadius: '16px',
                  px: 3,
                  py: 1.5,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  borderWidth: '2px',
                  minWidth: '120px',
                  height: '40px',
                  '&:hover': {
                    background: theme.fondoHover,
                    borderColor: theme.bordeHover,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:focus': {
                    borderColor: theme.bordeHover,
                    borderWidth: '2px',
                  }
                }}
              >
                Examinar
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    console.log('File selected:', e.target.files[0]);
                    onFileChange(e);
                  }}
                />
              </Button>
            </Box>
          </motion.div>
        </Box>
      )
    },
    {
      label: 'Configurar parámetros',
      description: 'Define el período de tiempo y agrega notas al reporte',
      icon: engraneIcon,
      content: (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
                         <Grid item xs={12} md={6}>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    component="img"
                    src={calendarIcon2}
                    alt="Calendario"
                    sx={{ 
                      width: 20, 
                      height: 20,
                      filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ color: theme.textoSecundario }}>
                    Período de tiempo
                  </Typography>
                </Box>

               <LocalizationProvider dateAdapter={AdapterDayjs}>
                 <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'column' } }}>
                   <DatePicker
                     label="Desde"
                     value={fromDate}
                     onChange={handleFromDateChange}
                     slotProps={{
                       textField: {
                         size: 'small',
                         sx: {
                          flex: 1, 
                          width: '180px',
                           '& .MuiOutlinedInput-root': {
                             background: theme.fondoOverlay,
                             borderRadius: '16px',
                             transition: 'all 0.3s ease',
                             '&:hover': {
                               '& > fieldset': { 
                                 borderColor: theme.bordeHover,
                                 borderWidth: '2px',
                               },
                               transform: 'translateY(-2px)',
                               boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                             },
                             '&.Mui-focused': {
                               '& > fieldset': { 
                                 borderColor: theme.bordeHover,
                                 borderWidth: '2px',
                               },
                               transform: 'translateY(-2px)',
                               boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                             },
                             '& > fieldset': {
                               borderColor: theme.bordePrincipal,
                               borderWidth: '1.5px',
                             },
                           },
                           '& .MuiInputLabel-root': {
                             color: theme.textoSecundario,
                             fontWeight: 500,
                             '&.Mui-focused': {
                               color: theme.textoPrincipal,
                               fontWeight: 600,
                             },
                           },
                           '& .MuiInputBase-input': {
                             color: theme.textoPrincipal,
                             fontWeight: 500,
                           },
                         }
                       }
                     }}
                   />
                   <DatePicker
                     label="Hasta"
                     value={toDate}
                     onChange={handleToDateChange}
                     slotProps={{
                       textField: {
                         size: 'small',
                         sx: {
                          flex: 1, 
                          width: '180px',
                          '& .MuiOutlinedInput-root': {
                             background: theme.fondoOverlay,
                             borderRadius: '16px',
                             transition: 'all 0.3s ease',
                             '&:hover': {
                               '& > fieldset': { 
                                 borderColor: theme.bordeHover,
                                 borderWidth: '2px',
                               },
                               transform: 'translateY(-2px)',
                               boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                             },
                             '&.Mui-focused': {
                               '& > fieldset': { 
                                 borderColor: theme.bordeHover,
                                 borderWidth: '2px',
                               },
                               transform: 'translateY(-2px)',
                               boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                             },
                             '& > fieldset': {
                               borderColor: theme.bordePrincipal,
                               borderWidth: '1.5px',
                             },
                           },
                           '& .MuiInputLabel-root': {
                             color: theme.textoSecundario,
                             fontWeight: 500,
                             '&.Mui-focused': {
                               color: theme.textoPrincipal,
                               fontWeight: 600,
                             },
                           },
                           '& .MuiInputBase-input': {
                             color: theme.textoPrincipal,
                             fontWeight: 500,
                           },
                         }
                       }
                     }}
                   />
                 </Box>
               </LocalizationProvider>
             </Grid>
             <Grid item xs={12} md={6}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                 <Box
                   component="img"
                   src={notesIcon}
                   alt="notas"
                  sx={{ 
                    width: 20, 
                    height: 20,
                    filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
                  }}
                />
                <Typography variant="subtitle2" sx={{ color: theme.textoSecundario }}>
                  Notas del reporte
                </Typography>
              </Box>
                <TextField
                 label="Escribe tus notas aquí..."
                 value={notas || ''}
                 onChange={(e) => {
                   console.log('Notes changed:', e.target.value);
                   console.log('onNoteChange existe:', !!onNoteChange);
                   if (onNoteChange) onNoteChange(e.target.value);
                 }}
                variant="outlined"
                size="small"
                multiline
                rows={3.5}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: theme.fondoOverlay,
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& > fieldset': { 
                        borderColor: theme.bordeHover,
                        borderWidth: '2px',
                      },
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      '& > fieldset': { 
                        borderColor: theme.bordeHover,
                        borderWidth: '2px',
                      },
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    },
                    '& > fieldset': {
                      borderColor: theme.bordePrincipal,
                      borderWidth: '1.5px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.textoSecundario,
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: theme.textoPrincipal,
                      fontWeight: 600,
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.textoPrincipal,
                    fontWeight: 500,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Generar reporte',
      description: 'Procesa los datos y genera el PDF del reporte',
      icon: planIcon,
      content: (
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
                onChange={(e) => setReportName(e.target.value)}
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
                                                    <Button
                     variant="contained"
                     disabled={!archivoExcel || !userHasConfiguredDates || processing}
                     onClick={handleProcessDataClick}
                   startIcon={<img src={processIcon} alt="Procesar" style={{ width: 16, height: 16 }} />}
                   sx={{
                     background: theme.gradientes.botonProcesar,
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
                 </Button>
                                    <Button
                     variant="contained"
                     disabled={!archivoExcel || !userHasConfiguredDates || processing || !dataProcessed || !reportName.trim()}
                     onClick={() => {
                       if (onGeneratePDF) {
                         onGeneratePDF(reportName, workMode);
                         setProcessCompleted(true);
                         setPdfGenerated(true);
                       }
                     }}
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
                 </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={0}
        sx={{
          background: theme.fondoContenedor,
          borderRadius: '28px',
          boxShadow: theme.sombraContenedor,
          p: { xs: 3, md: 4 },
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box
            component="img"
            src={actionIcon}
            alt="Flujo de trabajo"
            sx={{ 
              width: { xs: 40, md: 48 }, 
              height: { xs: 40, md: 48 },
              filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
            }}
          />
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: theme.textoPrincipal,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              {workMode === 0 ? 'Relación de Servicios' : 'Pendientes de Pago'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.textoSecundario,
                mt: 1,
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Flujo de trabajo unificado para generar reportes
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Box sx={{ maxWidth: '100%' }}>
          <Stepper 
            activeStep={activeStep} 
            orientation="vertical"
            sx={{
              '& .MuiStepLabel-root': {
                '& .MuiStepLabel-label': {
                  color: theme.textoPrincipal,
                  fontWeight: 600,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                },
                '& .MuiStepLabel-labelContainer': {
                  '& .MuiStepLabel-alternativeLabel': {
                    color: theme.textoSecundario,
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }
                }
              },
              '& .MuiStepIcon-root': {
                color: theme.textoSecundario,
                '&.Mui-active': {
                  color: theme.acento || theme.primario,
                },
                '&.Mui-completed': {
                  color: theme.terminalVerde,
                }
              }
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label} completed={getStepStatus(index) === 'completed'}>
                <StepLabel
                  optional={
                    <Typography variant="caption" sx={{ color: theme.textoSecundario }}>
                      {step.description}
                    </Typography>
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="img"
                      src={step.icon}
                      alt={step.label}
                      sx={{ 
                        width: 20, 
                        height: 20,
                        filter: theme.modo === 'oscuro' ? 'invert(1)' : 'none'
                      }}
                    />
                    {step.label}
                  </Box>
                </StepLabel>
                <StepContent>
                  {activeStep === index && step.content}
                  {activeStep === index && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                      {/* Botón Atrás - siempre disponible para volver al paso anterior */}
                      {index > 0 && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          console.log('Botón Atrás clickeado, navegando de paso', index, 'a', index - 1);
                          setActiveStep(index - 1);
                        }}
                        disabled={index === 0} // Deshabilitar solo en el primer paso
                        sx={{
                          background: theme.gradientes.botonInactivo,
                          borderColor: theme.bordePrincipal,
                          color: theme.textoPrincipal,
                          borderRadius: '18px',
                          boxShadow: theme.sombraComponente,
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          px: 3,
                          py: 1.5,
                          height: 40,
                          transition: 'all 0.3s ease',
                          borderWidth: '2px',
                          '&:hover': {
                            borderColor: theme.bordeHover,
                            background: theme.gradientes.botonHover,
                            transform: 'translateY(-2px)',
                            boxShadow: theme.sombraComponenteHover,
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: theme.sombraComponente,
                          },
                          '&:disabled': {
                            borderColor: theme.textoSecundario,
                            color: theme.textoDeshabilitado,
                            background: theme.fondoOverlay,
                            transform: 'none',
                            boxShadow: 'none',
                            cursor: 'not-allowed',
                          },
                        }}
                      >
                        Atrás
                      </Button>
                      )}
                      
                      {/* Botón Continuar - solo mostrar si no es el último paso */}
                      {index < steps.length - 1 && (
                        <Button
                          variant="contained"
                          onClick={() => {
                            console.log('Botón Continuar clickeado, navegando de paso', index, 'a', index + 1);
                            setActiveStep(index + 1);
                          }}
                          disabled={
                            (index === 0 && !archivoExcel) ||
                            (index === 1 && !userHasConfiguredDates) ||
                            (index === 2 && !dataProcessed)
                          }
                          sx={{
                            background: theme.gradientes.botonActivo,
                            color: theme.textoContraste,
                            borderRadius: '18px',
                            boxShadow: theme.sombraComponente,
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            px: 3,
                            py: 1.5,
                            height: 40,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: theme.gradientes.botonActivoHover,
                              boxShadow: theme.sombraComponenteHover,
                              transform: 'translateY(-2px)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                              boxShadow: theme.sombraComponente,
                            },
                            '&:disabled': {
                              background: theme.fondoOverlay,
                              color: theme.textoDeshabilitado,
                              transform: 'none',
                              boxShadow: 'none',
                            },
                          }}
                        >
                          Continuar
                        </Button>
                      )}
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Estado actual */}
        <Box sx={{ mt: 4, p: 3, background: theme.fondoOverlay, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: theme.textoPrincipal }}>
            Estado actual
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={200}>
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Chip
                    label={archivoExcel ? 'Archivo cargado' : 'Sin archivo'}
                    color={archivoExcel ? 'success' : 'default'}
                    variant="outlined"
                    sx={{
                      width: '100%',
                      background: archivoExcel
                        ? theme.terminalVerde
                        : theme.fondoOverlay,
                      color: archivoExcel
                        ? '#fff'
                        : theme.textoPrincipal,
                      boxShadow: theme.sombraComponente,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      border: `2px solid ${archivoExcel ? theme.terminalVerde : theme.bordePrincipal}`,
                      transition: 'background 0.5s, color 0.5s, border-color 0.5s',
                      pointerEvents: 'none',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  />
                  {archivoExcel && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-6px',
                        top: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', left: 0, top: 0 }}
                      >
                        <rect
                          x="4" y="4"
                          width="calc(100% - 8px)"
                          height="calc(100% - 8px)"
                          rx="18"
                          ry="18"
                          fill="none"
                          stroke={theme.neon?.exito || theme.acento || theme.terminalVerde}
                          strokeWidth="3"
                          strokeDasharray="440"
                          strokeDashoffset="440"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="440"
                            to="0"
                            dur="2.4s"
                            fill="freeze"
                            keySplines="0.4 0 0.2 1"
                            calcMode="spline"
                          />
                        </rect>
                      </svg>
                    </Box>
                  )}
                  <style>{`
                    @keyframes underline-grow {
                      from { width: 0%; opacity: 0.5; }
                      60% { width: 100%; opacity: 1; }
                      to { width: 100%; opacity: 1; }
                    }
                  `}</style>
                </Box>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={350}>
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Chip
                    label={userHasConfiguredDates ? 'Fechas configuradas' : 'Fechas pendientes'}
                    color={userHasConfiguredDates ? 'success' : 'default'}
                    variant="outlined"
                    sx={{
                      width: '100%',
                      background: userHasConfiguredDates
                        ? theme.terminalVerde
                        : theme.fondoOverlay,
                      color: userHasConfiguredDates
                        ? '#fff'
                        : theme.textoPrincipal,
                      boxShadow: theme.sombraComponente,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      border: `2px solid ${userHasConfiguredDates ? theme.terminalVerde : theme.bordePrincipal}`,
                      transition: 'background 0.5s, color 0.5s, border-color 0.5s',
                      pointerEvents: 'none',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  />
                  {userHasConfiguredDates && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-6px',
                        top: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', left: 0, top: 0 }}
                      >
                        <rect
                          x="4" y="4"
                          width="calc(100% - 8px)"
                          height="calc(100% - 8px)"
                          rx="18"
                          ry="18"
                          fill="none"
                          stroke={theme.neon?.exito || theme.acento || theme.terminalVerde}
                          strokeWidth="3"
                          strokeDasharray="440"
                          strokeDashoffset="440"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="440"
                            to="0"
                            dur="2.4s"
                            fill="freeze"
                            keySplines="0.4 0 0.2 1"
                            calcMode="spline"
                          />
                        </rect>
                      </svg>
                    </Box>
                  )}
                  <style>{`
                    @keyframes underline-grow {
                      from { width: 0%; opacity: 0.5; }
                      60% { width: 100%; opacity: 1; }
                      to { width: 100%; opacity: 1; }
                    }
                  `}</style>
                </Box>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={500}>
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Chip
                    label={processing ? 'Procesando...' : (dataProcessed ? 'Procesado exitosamente' : 'Listo para procesar')}
                    color={processing ? 'warning' : (dataProcessed ? 'success' : 'default')}
                    variant="outlined"
                    sx={{
                      width: '100%',
                      background: dataProcessed
                        ? theme.terminalVerde
                        : processing
                          ? theme.terminalAmarillo
                          : theme.fondoOverlay,
                      color: dataProcessed
                        ? '#fff'
                        : theme.textoPrincipal,
                      boxShadow: theme.sombraComponente,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      border: `2px solid ${dataProcessed ? theme.terminalVerde : theme.bordePrincipal}`,
                      transition: 'background 0.5s, color 0.5s, border-color 0.5s',
                      pointerEvents: 'none',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  />
                  {dataProcessed && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-6px',
                        top: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', left: 0, top: 0 }}
                      >
                        <rect
                          x="4" y="4"
                          width="calc(100% - 8px)"
                          height="calc(100% - 8px)"
                          rx="18"
                          ry="18"
                          fill="none"
                          stroke={theme.neon?.exito || theme.acento || theme.terminalVerde}
                          strokeWidth="3"
                          strokeDasharray="440"
                          strokeDashoffset="440"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="440"
                            to="0"
                            dur="2.4s"
                            fill="freeze"
                            keySplines="0.4 0 0.2 1"
                            calcMode="spline"
                          />
                        </rect>
                      </svg>
                    </Box>
                  )}
                  <style>{`
                    @keyframes underline-grow {
                      from { width: 0%; opacity: 0.5; }
                      60% { width: 100%; opacity: 1; }
                      to { width: 100%; opacity: 1; }
                    }
                  `}</style>
                </Box>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={700}>
                <Box sx={{ position: 'relative', width: '100%' }}>
                  <Chip
                    label={dataProcessed ? 'Listo para generar' : 'Configuración incompleta'}
                    color={dataProcessed ? 'success' : 'default'}
                    variant="outlined"
                    sx={{
                      width: '100%',
                      background: dataProcessed
                        ? theme.terminalVerde
                        : theme.fondoOverlay,
                      color: dataProcessed
                        ? '#fff'
                        : theme.textoPrincipal,
                      boxShadow: theme.sombraComponente,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      border: `2px solid ${dataProcessed ? theme.terminalVerde : theme.bordePrincipal}`,
                      transition: 'background 0.5s, color 0.5s, border-color 0.5s',
                      pointerEvents: 'none',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  />
                  {dataProcessed && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-6px',
                        top: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', left: 0, top: 0 }}
                      >
                        <rect
                          x="4" y="4"
                          width="calc(100% - 8px)"
                          height="calc(100% - 8px)"
                          rx="18"
                          ry="18"
                          fill="none"
                          stroke={theme.neon?.exito || theme.acento || theme.terminalVerde}
                          strokeWidth="3"
                          strokeDasharray="440"
                          strokeDashoffset="440"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="440"
                            to="0"
                            dur="2.4s"
                            fill="freeze"
                            keySplines="0.4 0 0.2 1"
                            calcMode="spline"
                          />
                        </rect>
                      </svg>
                    </Box>
                  )}
                  <style>{`
                    @keyframes underline-grow {
                      from { width: 0%; opacity: 0.5; }
                      60% { width: 100%; opacity: 1; }
                      to { width: 100%; opacity: 1; }
                    }
                  `}</style>
                </Box>
              </Grow>
            </Grid>
            {pdfGenerated && (
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={900}>
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <Chip
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <img src={pdfIcon} alt="PDF" style={{ width: 20, height: 20 }} />
                          PDF generado
                        </Box>
                      }
                      color="success"
                      variant="outlined"
                      sx={{
                        width: '100%',
                        background: theme.terminalVerde,
                        color: '#fff',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        border: `2px solid ${theme.terminalVerde}`,
                        transition: 'background 0.5s, color 0.5s, border-color 0.5s',
                        pointerEvents: 'none',
                        zIndex: 1,
                        position: 'relative',
                        boxShadow:
                          theme.modo === 'claro'
                            ? `${theme.neon?.exitoGlow ? `0 0 24px 8px ${theme.neon.exitoGlow}, ` : ''}0 0 16px 4px ${theme.neon?.exito}, 0 0 32px 8px ${theme.neon?.exito}80`
                            : `0 0 12px 2px ${theme.neon?.exito}, 0 0 32px 8px ${theme.neon?.exito}80`,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '-6px',
                        top: '-6px',
                        width: 'calc(100% + 12px)',
                        height: 'calc(100% + 12px)',
                        pointerEvents: 'none',
                        zIndex: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', left: 0, top: 0 }}
                      >
                        <rect
                          x="4" y="4"
                          width="calc(100% - 8px)"
                          height="calc(100% - 8px)"
                          rx="18"
                          ry="18"
                          fill="none"
                          stroke={theme.neon?.exito || theme.acento || theme.terminalVerde}
                          strokeWidth="3"
                          strokeDasharray="440"
                          strokeDashoffset="440"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="440"
                            to="0"
                            dur="2.4s"
                            fill="freeze"
                            keySplines="0.4 0 0.2 1"
                            calcMode="spline"
                          />
                        </rect>
                      </svg>
                    </Box>
                  </Box>
                </Grow>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Botón de Nuevo Proceso - Solo visible cuando se ha completado el proceso */}
        {processCompleted && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleNewProcess}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: theme.primario,
                color: theme.textoPrincipal,
                borderRadius: '25px',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: theme.modo === 'claro' ? '#1976d2' : '#42a5f5',
                  backgroundColor: theme.modo === 'claro' ? 'rgba(33, 150, 243, 0.04)' : 'rgba(100, 181, 246, 0.04)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Iniciar Nuevo Proceso
            </Button>
          </Box>
        )}
      </Paper>

      {/* Diálogo de confirmación para nuevo proceso */}
      <Dialog
        open={showNewProcessDialog}
        onClose={cancelNewProcess}
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
            onClick={cancelNewProcess}
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
            onClick={confirmNewProcess}
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
    </motion.div>
  );
};

export default UnifiedWorkflowCard;
