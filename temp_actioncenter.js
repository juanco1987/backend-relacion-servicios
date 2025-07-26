import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { APP_MESSAGES } from '../config/appConfig';
import actionIcon from '../assets/flechas_circulo.png';
import pdfIcon from '../assets/icono_pdf.png';
import openIcon from '../assets/OJO.png';
import processIcon from '../assets/Engrenages.png'
import { generarPDFServiciosEfectivo, generarPDFPendientes } from '../services/pdfService';
import { createLogEntry } from '../config/logMessages';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '../context/ThemeContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../config/animations';
import LoadingSpinner from './LoadingSpinner';
import SuccessAnimation from './SuccessAnimation';
import ErrorAnimation from './ErrorAnimation';
import ModeTransitionAnimation from './ModeTransitionAnimation';

function ActionCenterCard({ archivoExcel, fechaInicio, fechaFin, notas, addLog, fullHeight, workMode = 0, onProcessData, onToggleAnalytics, showAnalytics }) {
  const { theme } = useTheme();
  
  const neumorphicBox = {
    background: theme.fondoContenedor,
    borderRadius: '28px',
    boxShadow: theme.sombraContenedor,
    p: { xs: 2, md: 3 },
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: 140,
    justifyContent: 'center',
    maxWidth: '100%', // Asegura que ocupe todo el ancho
    minWidth: 0 // Elimina restricciones
  };
  const [reportName, setReportName] = useState('');
  const [canGeneratePDF, setCanGeneratePDF] = useState(false);
  const [canOpenPDF, setCanOpenPDF] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [lastGeneratedPDF, setLastGeneratedPDF] = useState(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [animationState, setAnimationState] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [showModeTransition, setShowModeTransition] = useState(false);
  const [modeTransitionData, setModeTransitionData] = useState({ from: 0, to: 0 });

  // Generar nombre por defecto con fecha y hora
  const generateDefaultName = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '-'); // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
    if (workMode === 0) {
      return `Relacion_Servicios_${dateStr}_${timeStr}.pdf`;
    } else {
      return `Pendientes_de_Pago_${dateStr}_${timeStr}.pdf`;
    }
  };

  // Inicializar nombre por defecto
  useEffect(() => {
    setReportName(generateDefaultName());
  }, []);

  // Agrega este useEffect para resetear los botones al cambiar archivo, fechas o modo
  useEffect(() => {
    setCanGeneratePDF(false);
    setCanOpenPDF(false);
    setPdfUrl(null);
    setLastGeneratedPDF(null); // Limpiar el estado de duplicado al cambiar datos
  }, [archivoExcel, fechaInicio, fechaFin, workMode]);

  const handleReportNameChange = (e) => {
    setReportName(e.target.value);
  };

  // Función para verificar si los datos son iguales al último PDF generado
  const isDuplicateData = () => {
    if (!lastGeneratedPDF) return false;
    
    return (
      lastGeneratedPDF.archivo === archivoExcel?.name &&
      lastGeneratedPDF.fechaInicio === fechaInicio &&
      lastGeneratedPDF.fechaFin === fechaFin &&
      lastGeneratedPDF.workMode === workMode &&
      lastGeneratedPDF.notas === notas
    );
  };

  // Función para manejar la confirmación de generar PDF duplicado
  const handleDuplicateConfirm = () => {
    setShowDuplicateDialog(false);
    // Proceder con la generación del PDF
    const pdfData = {
      archivo: archivoExcel?.name,
      fechaInicio,
      fechaFin,
      workMode,
      notas
    };
    setLastGeneratedPDF(pdfData);
    onProcessData();
  };

  // Función para cancelar la generación duplicada
  const handleDuplicateCancel = () => {
    setShowDuplicateDialog(false);
  };

  const handleProcess = async () => {
    if (typeof onProcessData === 'function') {
      onProcessData();
    }
    try {
      if (!archivoExcel || !fechaInicio || !fechaFin) {
        addLog(createLogEntry('ERROR_FILE_REQUIRED'));
        setAnimationState('error');
        setTimeout(() => setAnimationState('idle'), 3000);
        alert('Debes seleccionar un archivo y un rango de fechas.');
        setCanGeneratePDF(false);
        setCanOpenPDF(false);
        return;
      }

      // Mostrar animación de carga
      setAnimationState('loading');

      // Limpiar PDF anterior y deshabilitar abrir PDF
      setPdfUrl(null);
      setCanOpenPDF(false);

      // Actualizar el nombre del PDF automáticamente al procesar
      setReportName(generateDefaultName());

      // LOG para depuración: mostrar fechas justo antes de enviar al backend
      console.log('Enviando al backend: fechaInicio =', fechaInicio, ', fechaFin =', fechaFin);

      setProcessing(true);
      setCanGeneratePDF(false);
      setCanOpenPDF(false);
      
      if (workMode === 0) {
        // Modo: Relación de Servicios
        addLog(createLogEntry('PROCESSING_STARTED'));
        try {
          const formData = new FormData();
          formData.append('file', archivoExcel);
          // Convertir fechas a formato YYYY-MM-DD
          const fechaInicioISO = new Date(fechaInicio).toISOString().slice(0, 10);
          const fechaFinISO = new Date(fechaFin).toISOString().slice(0, 10);
          formData.append('fecha_inicio', fechaInicioISO);
          formData.append('fecha_fin', fechaFinISO);
          const response = await fetch('http://localhost:5000/api/relacion_servicios', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Error en la validación');
          }
          const result = await response.json();
          console.log('Respuesta del backend:', result);
          if (result.error) {
            addLog(createLogEntry('NO_DATA_IN_RANGE'));
            alert('No se encontraron datos en el rango de fechas seleccionado.');
            setCanGeneratePDF(false);
            setCanOpenPDF(false);
            setProcessing(false);
            return;
          }
          if (!result.data || result.data.length === 0) {
            addLog(createLogEntry('NO_DATA_IN_RANGE'));
            alert('No se encontraron datos en el rango de fechas seleccionado.');
            setCanGeneratePDF(false);
            setCanOpenPDF(false);
            setProcessing(false);
            return;
          }
          addLog(createLogEntry('DATA_FOUND', `${result.data.length} registros encontrados`));
          setCanGeneratePDF(true);
          setCanOpenPDF(false);
          // Mostrar animación de éxito
          setAnimationState('success');
          setTimeout(() => setAnimationState('idle'), 2000);
        } catch (error) {
          console.error('Error en handleProcess:', error, typeof error, error?.message);
          addLog(createLogEntry('ERROR_VALIDATION', error.message || JSON.stringify(error)));
          setCanGeneratePDF(false);
          setCanOpenPDF(false);
          setProcessing(false);
          // Mostrar animación de error
          setAnimationState('error');
          setTimeout(() => setAnimationState('idle'), 3000);
          return;
        }
        addLog(createLogEntry('PROCESSING_COMPLETED'));
      } else {
        // Modo: Pendientes de Pago
        addLog(createLogEntry('PENDIENTES_PROCESSING_STARTED'));
        try {
          const formData = new FormData();
          formData.append('file', archivoExcel);
          // Convertir fechas a formato YYYY-MM-DD
          const fechaInicioISO = new Date(fechaInicio).toISOString().slice(0, 10);
          const fechaFinISO = new Date(fechaFin).toISOString().slice(0, 10);
          formData.append('fecha_inicio', fechaInicioISO);
          formData.append('fecha_fin', fechaFinISO);
          const response = await fetch('http://localhost:5000/api/procesar_excel', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Error en la validación de pendientes');
          }
          const result = await response.json();
          console.log('Respuesta del backend:', result);
          if (result.error) {
            addLog(createLogEntry('PENDIENTES_NO_DATA'));
            alert('No se encontraron servicios pendientes en el rango de fechas seleccionado.');
            setCanGeneratePDF(false);
            setCanOpenPDF(false);
            setProcessing(false);
            return;
          }
          if (!result.data || result.data.length === 0) {
            addLog(createLogEntry('PENDIENTES_NO_DATA'));
            alert('No se encontraron servicios pendientes en el rango de fechas seleccionado.');
            setCanGeneratePDF(false);
            setCanOpenPDF(false);
            setProcessing(false);
            return;
          }
          addLog(createLogEntry('PENDIENTES_DATA_FILTERED', `${result.data.length} pendientes encontrados`));
          setCanGeneratePDF(true);
          setCanOpenPDF(false);
          // Mostrar animación de éxito
          setAnimationState('success');
          setTimeout(() => setAnimationState('idle'), 2000);
        } catch (error) {
          console.error('Error en handleProcess:', error, typeof error, error?.message);
          addLog(createLogEntry('ERROR_VALIDATION', error.message || JSON.stringify(error)));
          setCanGeneratePDF(false);
          setCanOpenPDF(false);
          setProcessing(false);
          // Mostrar animación de error
          setAnimationState('error');
          setTimeout(() => setAnimationState('idle'), 3000);
          return;
        }
        addLog(createLogEntry('PENDIENTES_PROCESSING_COMPLETED'));
      }
    } catch (error) {
      addLog(createLogEntry('PROCESSING_ERROR', error.message));
      alert(error.message);
      setCanGeneratePDF(false);
      setCanOpenPDF(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      if (!archivoExcel || !fechaInicio || !fechaFin) {
        addLog(createLogEntry('ERROR_FILE_REQUIRED'));
        alert('Debes seleccionar un archivo y un rango de fechas.');
        return;
      }

      // Verificar si es un duplicado
      if (isDuplicateData()) {
        setShowDuplicateDialog(true);
        return;
      }
      // Usar el nombre personalizado o generar uno por defecto
      const pdfName = reportName.trim() || generateDefaultName();
      let blob;
      if (notas && notas.trim() !== '') {
        addLog(createLogEntry('NOTAS_CARGADAS', notas));
      }
      if (workMode === 0) {
        // Modo: Relación de Servicios
        addLog(createLogEntry('PDF_GENERATION_STARTED'));
        blob = await generarPDFServiciosEfectivo({
          archivo: archivoExcel,
          fechaInicio,
          fechaFin,
          notas,
          nombrePDF: pdfName,
        });
        addLog(createLogEntry('PDF_GENERATED_SUCCESS'));
        addLog(createLogEntry('PDF_DOWNLOADED', pdfName));
      } else {
        // Modo: Pendientes de Pago
        addLog(createLogEntry('PDF_PENDIENTES_GENERATION_STARTED'));
        blob = await generarPDFPendientes({
          archivo: archivoExcel,
          fechaInicio,
          fechaFin,
          notas,
          nombrePDF: pdfName,
        });
        addLog(createLogEntry('PDF_PENDIENTES_GENERATED_SUCCESS'));
        addLog(createLogEntry('PDF_PENDIENTES_DOWNLOADED', pdfName));
      }
      
      // Crear URL del blob para poder abrirlo después
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Descargar el PDF con el nombre personalizado
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfName;
      a.click();
      
      // Guardar el estado del PDF generado para evitar duplicados
      const pdfData = {
        archivo: archivoExcel.name,
        fechaInicio,
        fechaFin,
        workMode,
        notas
      };
      setLastGeneratedPDF(pdfData);
      
      setCanOpenPDF(true);
    } catch (error) {
      if (workMode === 0) {
        addLog(createLogEntry('ERROR_PDF_GENERATION', error.message));
      } else {
        addLog(createLogEntry('ERROR_PDF_PENDIENTES_GENERATION', error.message));
      }
      alert(error.message);
    }
  };

  const handleOpenPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      addLog(createLogEntry('PDF_OPENED'));
    }
  };

  return (
    <Box sx={{ width: '100%', ...neumorphicBox, height: fullHeight ? '100%' : undefined, position: 'relative', overflow: 'hidden' }}>
      {/* Overlay de animación de estado */}
      {(animationState !== 'idle' || showModeTransition) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            background: theme.modo === 'claro' 
              ? 'rgba(255,255,255,0.85)' 
              : 'rgba(22,36,71,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s',
          }}
        >
          {showModeTransition && <ModeTransitionAnimation fromMode={modeTransitionData.from} toMode={modeTransitionData.to} />}
          {animationState === 'loading' && <LoadingSpinner message="Procesando archivo..." fileName={archivoExcel?.name} />}
          {animationState === 'success' && <SuccessAnimation message="¡Procesado con éxito!" />}
          {animationState === 'error' && <ErrorAnimation message="Ocurrió un error" />}
        </Box>
      )}
      <Grid container alignItems="flex-start" spacing={6} sx={{ opacity: (animationState !== 'idle' || showModeTransition) ? 0.3 : 1, pointerEvents: (animationState !== 'idle' || showModeTransition) ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
        {/* Columna izquierda: icono, título, chip */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={actionIcon} alt="Acciones" sx={{ width: 32, height: 32, mr: 2, bgcolor: 'transparent', boxShadow: theme.sombraComponente }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, letterSpacing: 2, fontSize: '1.8rem' }}>
              {APP_MESSAGES.ACTION_CARD_TITLE}
            </Typography>
          </Box>
          <motion.div
            whileHover={ANIMATIONS.formFieldHover}
            whileFocus={ANIMATIONS.formFieldFocus}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: { xs: 2, md: 0 } }}>
              <TextField
                label="Nombre del PDF"
                value={reportName}
                onChange={handleReportNameChange}
                variant="outlined"
                size="small"
                sx={{
                  background: theme.gradientes.botonInactivo,
                  borderRadius: '14px',
                  boxShadow: theme.sombraComponente,
                  color: theme.textoPrincipal,
                  minWidth: 420,
                  maxWidth: 420,
                  '& .MuiInputBase-root': {
                    color: theme.textoPrincipal,
                    borderRadius: '14px',
                    height: 54,
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.bordeTerminal,
                    borderWidth: '1.5px',
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.textoSecundario,
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiInputLabel-shrink': {
                    color: theme.textoSecundario,
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.modo === 'claro' 
                      ? '0 8px 25px rgba(0,0,0,0.15)' 
                      : '0 8px 25px rgba(0,0,0,0.4)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.bordeHover,
                    borderWidth: '2px'
                  },
                  '&.Mui-focused': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.modo === 'claro' 
                      ? '0 12px 35px rgba(0,0,0,0.2)' 
                      : '0 12px 35px rgba(0,0,0,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.bordeFocus,
                    borderWidth: '2.5px'
                  },
                  '& .MuiInputBase-input': {
                    transition: 'all 0.3s ease'
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.textoPrincipal,
                    fontWeight: 600
                  },
                  transition: 'all 0.3s ease'
                }}
                InputProps={{
                  startAdornment: (
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar src={pdfIcon} alt="PDF" sx={{ width: 32, height: 32, bgcolor: 'transparent', mr: 1 }} />
                    </motion.div>
                  ),
                  endAdornment: (
                    <motion.div
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconButton
                        onClick={() => setReportName(generateDefaultName())}
                        sx={{ 
                          color: theme.textoSecundario, 
                          mr: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: theme.textoPrincipal,
                            backgroundColor: theme.modo === 'claro' 
                              ? 'rgba(0,0,0,0.1)' 
                              : 'rgba(255,255,255,0.1)'
                          }
                        }}
                        title="Generar nombre automático"
                      >
                        <RefreshIcon />
                      </IconButton>
                    </motion.div>
                  ),
                }}
                disabled={!canGeneratePDF}
              />
            </Box>
          </motion.div>
        </Grid>
        {/* Columna derecha: botones */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%' }}>
            <motion.div
              whileHover={ANIMATIONS.buttonHover}
              whileTap={ANIMATIONS.buttonTap}
            >
              <Button
                variant="contained"
                disabled={!archivoExcel || !fechaInicio || !fechaFin || processing}
                onClick={handleProcess}
                startIcon={<Avatar src={processIcon} alt="Procesar" sx={{ width: 28, height: 28, bgcolor: 'transparent' }} />}
                sx={{
                  background: theme.gradientes.botonInactivo,
                  borderRadius: '18px',
                  boxShadow: theme.sombraComponente,
                  color: theme.textoPrincipal,
                  fontWeight: 'bold',
                  fontSize: 22,
                  px: 9,
                  minWidth: 280,
                  py: 1.2,
                  mb: 2,
                  height: 48,
                  '&:disabled': {
                    background: theme.fondoOverlay,
                    color: theme.textoDeshabilitado,
                    boxShadow: 'none',
                  },
                }}
              >
                {processing 
                  ? APP_MESSAGES.BUTTON_PROCESSING_TEXT 
                  : workMode === 0 
                    ? APP_MESSAGES.BUTTON_PROCESS_TEXT 
                    : APP_MESSAGES.BUTTON_PROCESS_TEXT
                }
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <motion.div
                  whileHover={ANIMATIONS.buttonHover}
                  whileTap={ANIMATIONS.buttonClick}
                  animate={canGeneratePDF ? ANIMATIONS.buttonActive.animate : {}}
                >
                <Button
                  variant="contained"
                  disabled={!canGeneratePDF}
                  onClick={handleGeneratePDF}
                  startIcon={<Avatar src={pdfIcon} alt="PDF" sx={{ width: 28, height: 28, bgcolor: 'transparent' }} />}
                  sx={{
                    background: theme.modo === 'claro' 
                      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' 
                      : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    borderRadius: '14px',
                    boxShadow: theme.modo === 'claro' 
                      ? '0 4px 12px rgba(25,118,210,0.3)' 
                      : '0 4px 12px rgba(25,118,210,0.5)',
                    color: theme.modo === 'claro' ? '#1565c0' : '#ffffff',
                    fontWeight: 'bold',
                    fontSize: 18,
                    px: 2,
                    minWidth: 140,
                    height: 48,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: theme.modo === 'claro' 
                        ? 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)' 
                        : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                      boxShadow: theme.modo === 'claro' 
                        ? '0 6px 16px rgba(25,118,210,0.4)' 
                        : '0 6px 16px rgba(25,118,210,0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: theme.fondoOverlay,
                      color: theme.textoDeshabilitado,
                      boxShadow: 'none',
                      transform: 'none',
                    },
                  }}
                >
                  {APP_MESSAGES.BUTTON_GENERATE_PDF_TEXT}
                </Button>
              </motion.div>
              <motion.div
                whileHover={ANIMATIONS.buttonHover}
                whileTap={ANIMATIONS.buttonClick}
                animate={canOpenPDF ? ANIMATIONS.buttonActive.animate : {}}
              >
                <Button
                  variant="contained"
                  disabled={!canOpenPDF}
                  onClick={handleOpenPDF}
                  startIcon={<Avatar src={openIcon} alt="Abrir PDF" sx={{ width: 28, height: 28, bgcolor: 'transparent' }} />}
                  sx={{
                    background: theme.modo === 'claro' 
                      ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' 
                      : 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                    borderRadius: '14px',
                    boxShadow: theme.modo === 'claro' 
                      ? '0 4px 12px rgba(46,125,50,0.3)' 
                      : '0 4px 12px rgba(46,125,50,0.5)',
                    color: theme.modo === 'claro' ? '#1b5e20' : '#ffffff',
                    fontWeight: 'bold',
                    fontSize: 18,
                    px: 3,
                    minWidth: 140,
                    height: 48,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: theme.modo === 'claro' 
                        ? 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)' 
                        : 'linear-gradient(135deg, #1b5e20 0%, #0d4f14 100%)',
                      boxShadow: theme.modo === 'claro' 
                        ? '0 6px 16px rgba(46,125,50,0.4)' 
                        : '0 6px 16px rgba(46,125,50,0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: theme.fondoOverlay,
                      color: theme.textoDeshabilitado,
                      boxShadow: 'none',
                      transform: 'none',
                    },
                  }}
                >
                  {APP_MESSAGES.BUTTON_OPEN_PDF_TEXT}
                </Button>
              </motion.div>
            </Box>
            </motion.div>

            {/* Botón Analytics */}
            <motion.div
              whileHover={ANIMATIONS.buttonHover}
              whileTap={ANIMATIONS.buttonClick}
              animate={showAnalytics ? ANIMATIONS.buttonActive.animate : {}}
            >
              <Button
                variant="contained"
                onClick={onToggleAnalytics}
                startIcon={
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: 'transparent',
                        background: `linear-gradient(135deg, ${theme.primario}, ${theme.secundario})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} 
                    >
                      📊
                    </Avatar>
                  </motion.div>
                }
                sx={{
                  background: showAnalytics 
                    ? `linear-gradient(135deg, ${theme.primario}, ${theme.secundario})`
                    : theme.gradientes.botonInactivo,
                  borderRadius: '14px',
                  boxShadow: showAnalytics 
                    ? `0 4px 12px ${theme.primario}40`
                    : theme.sombraComponente,
                  color: showAnalytics ? theme.textoContraste : theme.textoPrincipal,
                  fontWeight: 'bold',
                  fontSize: 18,
                  px: 2,
                  minWidth: 140,
                  height: 48,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: showAnalytics 
                      ? `linear-gradient(135deg, ${theme.secundario}, ${theme.primario})`
                      : theme.gradientes.botonHover,
                    boxShadow: showAnalytics 
                      ? `0 6px 16px ${theme.primario}60`
                      : theme.sombraComponente,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {showAnalytics ? 'Ocultar Analytics' : 'Ver Analytics'}
              </Button>
            </motion.div>
          </Box>
        </Grid>
      </Grid>
      {/* Diálogo de confirmación para PDF duplicado */}
      <Dialog
        open={showDuplicateDialog}
        onClose={handleDuplicateCancel}
        PaperProps={{
          style: {
            backgroundColor: theme.fondoCuerpo,
            color: theme.texto,
            borderRadius: '12px',
            boxShadow: theme.sombra
          }
        }}
      >
        <DialogTitle style={{ color: theme.texto }}>
          Confirmar generación de PDF
        </DialogTitle>
        <DialogContent>
          <Typography style={{ color: theme.texto }}>
            Ya generaste un PDF con estos mismos datos. ¿Deseas generarlo nuevamente?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDuplicateCancel}
            style={{ 
              color: theme.textoSecundario,
              backgroundColor: 'transparent'
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDuplicateConfirm}
            variant="contained"
            style={{ 
              backgroundColor: theme.primario,
              color: theme.textoContraste
            }}
          >
            Generar PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ActionCenterCard; 