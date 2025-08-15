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
import { APP_MESSAGES } from '../../config/appConfig';
import actionIcon from '../../assets/flechas_circulo.png';
import pdfIcon from '../../assets/icono_pdf.png';
import processIcon from '../../assets/Engrenages.png'
import { generarPDFServiciosEfectivo, generarPDFPendientes } from '../../services/pdfService';

import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '../../context/ThemeContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { motion } from 'framer-motion';
import { ANIMATIONS } from '../../config/animations';
import LoadingSpinner from '../common/LoadingSpinner';
import SuccessAnimation from '../animations/SuccessAnimation';
import ErrorAnimation from '../animations/ErrorAnimation';
import ModeTransitionAnimation from '../animations/ModeTransitionAnimation';

function ActionCenterCard({ archivoExcel, fechaInicio, fechaFin, notas, fullHeight, workMode = 0, onProcessData }) {
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
      lastGeneratedPDF.fechaInicio === fechaInicio.format('YYYY-MM-DD') &&
      lastGeneratedPDF.fechaFin === fechaFin.format('YYYY-MM-DD') &&
      lastGeneratedPDF.workMode === workMode &&
      lastGeneratedPDF.notas === notas
    );
  };

  // Función para verificar si el nombre del PDF es automático o personalizado
  const isCustomName = () => {
    const currentName = reportName.trim();
    const autoName = generateDefaultName();
    return currentName !== autoName;
  };

  // Función para verificar si debe mostrar confirmación de duplicado
  const shouldShowDuplicateDialog = () => {
    // Solo mostrar confirmación si:
    // 1. Los datos son duplicados Y
    // 2. El nombre es personalizado (no automático)
    return isDuplicateData() && isCustomName();
  };

  // Función para manejar la confirmación de generar PDF duplicado
  const handleDuplicateConfirm = () => {
    setShowDuplicateDialog(false);
    // Proceder con la generación del PDF
    const pdfData = {
      archivo: archivoExcel?.name,
      fechaInicio: fechaInicio.format('YYYY-MM-DD'),
      fechaFin: fechaFin.format('YYYY-MM-DD'),
      workMode,
      notas
    };
    setLastGeneratedPDF(pdfData);
    // Continuar con la generación del PDF
    generatePDF();
  };

  // Función para cancelar la generación duplicada
  const handleDuplicateCancel = () => {
    setShowDuplicateDialog(false);
  };

  // Función separada para generar el PDF
  const generatePDF = async () => {
    try {
      if (!archivoExcel || !fechaInicio || !fechaFin) {
        alert('Debes seleccionar un archivo y un rango de fechas.');
        return;
      }

      // Verificar que las fechas sean objetos dayjs válidos
      if (!fechaInicio || !fechaInicio.isValid || !fechaInicio.isValid()) {
        alert('Error: Fecha de inicio inválida');
        return;
      }

      if (!fechaFin || !fechaFin.isValid || !fechaFin.isValid()) {
        alert('Error: Fecha de fin inválida');
        return;
      }

      // Usar el nombre personalizado o generar uno por defecto
      const pdfName = reportName.trim() || generateDefaultName();
      let blob;
             if (workMode === 0) {
         // Modo: Relación de Servicios
         blob = await generarPDFServiciosEfectivo({
           archivo: archivoExcel,
           fechaInicio: fechaInicio.format('YYYY-MM-DD'),
           fechaFin: fechaFin.format('YYYY-MM-DD'),
           notas,
           nombrePDF: pdfName,
         });
       } else {
         // Modo: Pendientes de Pago
         blob = await generarPDFPendientes({
           archivo: archivoExcel,
           fechaInicio: fechaInicio.format('YYYY-MM-DD'),
           fechaFin: fechaFin.format('YYYY-MM-DD'),
           notas,
           nombrePDF: pdfName,
         });
       }
      
      // Crear URL del blob para poder abrirlo después
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      
      // Actualizar el estado del último PDF generado
      const pdfData = {
        archivo: archivoExcel?.name,
        fechaInicio: fechaInicio.format('YYYY-MM-DD'),
        fechaFin: fechaFin.format('YYYY-MM-DD'),
        workMode,
        notas
      };
      setLastGeneratedPDF(pdfData);
      
      // Descargar el PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(`Error al generar el PDF: ${error.message}`);
    }
  };

  const handleProcess = async () => {
    if (typeof onProcessData === 'function') {
      onProcessData();
    }
    try {
      if (!archivoExcel || !fechaInicio || !fechaFin) {
        setAnimationState('error');
        setTimeout(() => setAnimationState('idle'), 3000);
        alert('Debes seleccionar un archivo y un rango de fechas.');
        setCanGeneratePDF(false);
        return;
      }

      // Mostrar animación de carga
      setAnimationState('loading');

      // Limpiar PDF anterior
      setPdfUrl(null);

      // Actualizar el nombre del PDF automáticamente al procesar
      setReportName(generateDefaultName());

      // Verificar que las fechas sean objetos dayjs válidos
      if (!fechaInicio || !fechaInicio.isValid || !fechaInicio.isValid()) {
        setAnimationState('error');
        setTimeout(() => setAnimationState('idle'), 3000);
        alert('Error: Fecha de inicio inválida');
        setCanGeneratePDF(false);
        setProcessing(false);
        return;
      }

      if (!fechaFin || !fechaFin.isValid || !fechaFin.isValid()) {
        setAnimationState('error');
        setTimeout(() => setAnimationState('idle'), 3000);
        alert('Error: Fecha de fin inválida');
        setCanGeneratePDF(false);
        setProcessing(false);
        return;
      }

      // LOG para depuración: mostrar fechas justo antes de enviar al backend
      console.log('Enviando al backend: fechaInicio =', fechaInicio, ', fechaFin =', fechaFin);

      setProcessing(true);
      setCanGeneratePDF(false);
      
      if (workMode === 0) {
        // Modo: Relación de Servicios
        try {
          const formData = new FormData();
          formData.append('file', archivoExcel);
          // Convertir fechas dayjs a formato YYYY-MM-DD
          const fechaInicioISO = fechaInicio.format('YYYY-MM-DD');
          const fechaFinISO = fechaFin.format('YYYY-MM-DD');
          
          // DEBUG: Log para verificar el formato exacto de las fechas
          console.log('DEBUG - Fechas formateadas para backend (workMode 0):', {
            fechaInicioISO,
            fechaFinISO,
            tipoFechaInicio: typeof fechaInicioISO,
            tipoFechaFin: typeof fechaFinISO
          });
          
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
          setCanGeneratePDF(false);
          setProcessing(false);
          setAnimationState('idle'); // <-- Asegura que el overlay desaparezca
          alert('No se encontraron datos en el rango de fechas seleccionado.');
          return;
        }
        if (!result.data || result.data.length === 0) {
          setCanGeneratePDF(false);
          setProcessing(false);
          setAnimationState('idle'); // <-- Asegura que el overlay desaparezca
          alert('No se encontraron datos en el rango de fechas seleccionado.');
          return;
        }
        setCanGeneratePDF(true);
          // Mostrar animación de éxito
          setAnimationState('success');
          setTimeout(() => setAnimationState('idle'), 2000);
        } catch (error) {
          console.error('Error en handleProcess:', error, typeof error, error?.message);
          setCanGeneratePDF(false);
          setProcessing(false);
          // Mostrar animación de error
          setAnimationState('error');
          setTimeout(() => setAnimationState('idle'), 3000);
          return;
        }
      } else {
        // Modo: Pendientes de Pago
        try {
          const formData = new FormData();
          formData.append('file', archivoExcel);
          // Convertir fechas dayjs a formato YYYY-MM-DD
          const fechaInicioISO = fechaInicio.format('YYYY-MM-DD');
          const fechaFinISO = fechaFin.format('YYYY-MM-DD');
          
          // DEBUG: Log para verificar el formato exacto de las fechas
          console.log('DEBUG - Fechas formateadas para backend (workMode 1):', {
            fechaInicioISO,
            fechaFinISO,
            tipoFechaInicio: typeof fechaInicioISO,
            tipoFechaFin: typeof fechaFinISO
          });
          
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
            setCanGeneratePDF(false);
            setProcessing(false);
            setAnimationState('idle'); // <-- Asegura que el overlay desaparezca
            alert('No se encontraron servicios pendientes en el rango de fechas seleccionado.');
            return;
          }
          if (!result.data || result.data.length === 0) {
            setCanGeneratePDF(false);
            setProcessing(false);
            setAnimationState('idle'); // <-- Asegura que el overlay desaparezca
            alert('No se encontraron servicios pendientes en el rango de fechas seleccionado.');
            return;
          }

                  setCanGeneratePDF(true);
          // Mostrar animación de éxito
          setAnimationState('success');
          setTimeout(() => setAnimationState('idle'), 2000);
        } catch (error) {
          console.error('Error en handleProcess:', error, typeof error, error?.message);
          setCanGeneratePDF(false);
          setProcessing(false);
          // Mostrar animación de error
          setAnimationState('error');
          setTimeout(() => setAnimationState('idle'), 3000);
          return;
        }
      }
    } catch (error) {
      alert(error.message);
      setCanGeneratePDF(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleGeneratePDF = async () => {
    // Verificar si debe mostrar confirmación de duplicado
    if (shouldShowDuplicateDialog()) {
      setShowDuplicateDialog(true);
      return;
    }
    
    // Si no hay confirmación necesaria, generar directamente
    await generatePDF();
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
             {/* Header con título y flujo de trabajo */}
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
         <Box component="img" src={actionIcon} alt="Acciones" sx={{ width: 32, height: 32, mr: 2, bgcolor: 'transparent', boxShadow: theme.sombraComponente }} />
         <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.textoPrincipal, letterSpacing: 2, fontSize: '1.8rem' }}>
           {APP_MESSAGES.ACTION_CARD_TITLE}
         </Typography>
       </Box>

       {/* Flujo de trabajo secuencial */}
       <Box sx={{ opacity: (animationState !== 'idle' || showModeTransition) ? 0.3 : 1, pointerEvents: (animationState !== 'idle' || showModeTransition) ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
         
         {/* Paso 1: Configurar nombre del PDF */}
         <Box sx={{ mb: 3 }}>
           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
             <Box sx={{ 
               width: 32, 
               height: 32, 
               borderRadius: '50%', 
               background: theme.gradientes.botonInactivo,
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               mr: 2,
               color: theme.textoContraste,
               fontWeight: 'bold',
               fontSize: '1.2rem'
             }}>
               1
             </Box>
             <Typography variant="h6" sx={{ color: theme.textoPrincipal, fontWeight: 600 }}>
               Configurar nombre del reporte
             </Typography>
           </Box>
           <motion.div
             whileHover={ANIMATIONS.formFieldHover}
             whileFocus={ANIMATIONS.formFieldFocus}
             whileTap={{ scale: 0.98 }}
             transition={{ duration: 0.2 }}
           >
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
                 width: '100%',
                 '& .MuiInputBase-root': {
                   color: theme.textoPrincipal,
                   borderRadius: '14px',
                   height: 54,
                   transition: 'all 0.3s ease'
                 },
                 '& .MuiOutlinedInput-notchedOutline': {
                   borderColor: `${theme.bordePrincipal} !important`,
                   borderWidth: '1.5px !important',
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
                   boxShadow: theme.sombraHover,
                 },
                 '&:hover .MuiOutlinedInput-notchedOutline': {
                   borderColor: `${theme.bordeHover} !important`,
                 },
                 '&.Mui-focused': {
                   transform: 'translateY(-3px)',
                   boxShadow: theme.sombraFocus,
                 },
                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                   borderColor: `${theme.bordeFocus} !important`,
                   borderWidth: '2.5px !important'
                 },
                 '& .MuiInputBase-input': {
                   color: `${theme.textoPrincipal} !important`,
                   transition: 'all 0.3s ease'
                 },
                 '& .MuiInputLabel-root.Mui-focused': {
                   color: `${theme.textoPrincipal} !important`,
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
                     <Box component="img" src={pdfIcon} alt="PDF" sx={{ width: 32, height: 32, bgcolor: 'transparent', mr: 1 }} />
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
           </motion.div>
         </Box>

         {/* Paso 2: Procesar datos */}
         <Box sx={{ mb: 3 }}>
           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
             <Box sx={{ 
               width: 32, 
               height: 32, 
               borderRadius: '50%', 
               background: theme.gradientes.botonInactivo,
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               mr: 2,
               color: theme.textoContraste,
               fontWeight: 'bold',
               fontSize: '1.2rem'
             }}>
               2
             </Box>
             <Typography variant="h6" sx={{ color: theme.textoPrincipal, fontWeight: 600 }}>
               Procesar datos del archivo
             </Typography>
           </Box>
           <motion.div
             whileHover={ANIMATIONS.buttonHover}
             whileTap={ANIMATIONS.buttonTap}
           >
             <Button
               variant="contained"
               disabled={!archivoExcel || !fechaInicio || !fechaFin || processing}
               onClick={handleProcess}
               startIcon={<Box component="img" src={processIcon} alt="Procesar" sx={{ width: 28, height: 28, bgcolor: 'transparent' }} />}
               sx={{
                 background: theme.gradientes.botonInactivo,
                 borderRadius: '18px',
                 boxShadow: theme.sombraComponente,
                 color: theme.textoPrincipal,
                 fontWeight: 'bold',
                 fontSize: 18,
                 px: 6,
                 width: '100%',
                 py: 1.5,
                 height: 52,
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
         </Box>

         {/* Paso 3: Generar PDF */}
         <Box>
           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
             <Box sx={{ 
               width: 32, 
               height: 32, 
               borderRadius: '50%', 
               background: theme.gradientes.botonInactivo,
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               mr: 2,
               color: theme.textoContraste,
               fontWeight: 'bold',
               fontSize: '1.2rem'
             }}>
               3
             </Box>
             <Typography variant="h6" sx={{ color: theme.textoPrincipal, fontWeight: 600 }}>
               Generar reporte PDF
             </Typography>
           </Box>
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
           >
             <motion.div
               whileHover={ANIMATIONS.buttonHover}
               whileTap={ANIMATIONS.buttonClick}
               animate={canGeneratePDF ? ANIMATIONS.buttonActive.animate : {}}
             >
               <Button
                 variant="contained"
                 disabled={!canGeneratePDF}
                 onClick={handleGeneratePDF}
                 startIcon={<Box component="img" src={pdfIcon} alt="PDF" sx={{ width: 28, height: 28, bgcolor: 'transparent' }} />}
                 sx={{
                   background: theme.gradientes.botonGenerar,
                   borderRadius: '14px',
                   boxShadow: theme.sombraComponente,
                   color: theme.textoContraste,
                   fontWeight: 'bold',
                   fontSize: 18,
                   px: 6,
                   width: '100%',
                   height: 52,
                   transition: 'all 0.3s ease',
                   '&:hover': {
                     background: theme.gradientes.botonGenerarHover,
                     boxShadow: theme.sombraComponenteHover,
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
           </motion.div>
         </Box>
       </Box>
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