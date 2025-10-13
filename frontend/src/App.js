// App.js - Componente principal de la aplicación

import React, { useState, useEffect } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from './context/ThemeContext';
import Header from './components/common/Header';
import DashboardLayout from './components/layout/DashboardLayout';
import ContentArea from './components/layout/ContentArea';
import ModeTransitionAnimation from './components/animations/ModeTransitionAnimation';
import { STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from './config/animations';
import dayjs from 'dayjs';
import { generarPDFServiciosEfectivo, generarPDFPendientes } from './services/pdfService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
function App() {
  const { theme } = useTheme();
  
  // Estado para la navegación
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  
  // Estados existentes
  const [excelData, setExcelData] = useState(null);
  const [analyticsFile, setAnalyticsFile] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month'));
  const [fechaFin, setFechaFin] = useState(dayjs().endOf('month'));
  const [note, setNote] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [gastoData, setGastoData] = useState({
    fecha: null,
    descripcion: '',
    monto: '',
    categoria: '',
    notas: ''
  });
  const [showModeTransition, setShowModeTransition] = useState(false);
  const [modeTransitionData, setModeTransitionData] = useState({ from: '', to: '' });

  // Handlers existentes
  const handleFileChange = (event) => {
    console.log('handleFileChange recibió:', event);
    const file = event.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', file.name, file.size, file.type);
      setExcelData(file);
    } else {
      console.log('No se seleccionó ningún archivo');
      setExcelData(null);
    }
  };

  const handleAnalyticsFileChange = (input) => {
    console.log('handleAnalyticsFileChange recibió:', input);
    let file = null;

    // Permitir recibir directamente un File o un evento de input
    if (input instanceof File) {
      file = input;
    } else if (input?.target?.files?.[0]) {
      file = input.target.files[0];
    } else if (input?.files?.[0]) {
      file = input.files[0];
    }

    if (file) {
      console.log('Archivo de Analytics seleccionado:', file.name, file.size, file.type);
      setAnalyticsFile(file);
    } else {
      console.log('No se seleccionó ningún archivo de Analytics');
      setAnalyticsFile(null);
    }
  };

  const handleFechaInicioChange = (date) => {
    console.log('handleFechaInicioChange recibió:', date, 'tipo:', typeof date, 'es dayjs:', date && date.isValid);
    setFechaInicio(date);
  };

  const handleFechaFinChange = (date) => {
    console.log('handleFechaFinChange recibió:', date, 'tipo:', typeof date, 'es dayjs:', date && date.isValid);
    setFechaFin(date);
  };

  const handleNoteChange = (newNote) => {
    console.log('handleNoteChange recibió:', newNote);
    setNote(newNote);
  };

  const handleProcessData = async () => {
  setProcessing(true);
  setAnimationState('loading');
  
      try {
        if (!excelData || !fechaInicio || !fechaFin) {
          throw new Error('Debes seleccionar un archivo y un rango de fechas.');
        }

        // Verificar que las fechas sean objetos dayjs válidos
        if (!fechaInicio || !fechaInicio.isValid || !fechaInicio.isValid()) {
          throw new Error('Error: Fecha de inicio inválida');
        }

        if (!fechaFin || !fechaFin.isValid || !fechaFin.isValid()) {
          throw new Error('Error: Fecha de fin inválida');
        }

        // Crear FormData para enviar al backend
        const formData = new FormData();
        formData.append('file', excelData);
        formData.append('fecha_inicio', fechaInicio.format('YYYY-MM-DD'));
        formData.append('fecha_fin', fechaFin.format('YYYY-MM-DD'));
        formData.append('notas', note || '');
        
        // Determinar el endpoint basado en la ruta actual
        let endpoint = '';
        

        if (currentRoute === '/dashboard' || currentRoute === '/servicios-efectivo') {
          endpoint = `${API_BASE}/api/relacion_servicios`;
        } else if (currentRoute === '/pendientes-pago') {
          endpoint = `${API_BASE}/api/procesar_excel`;
        } else {
          // Fallback al endpoint de validación básica
          endpoint = `${API_BASE}/api/process`;
  }
        
        // Intentar conectar al backend
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('El backend no está disponible. Verifica que el servidor esté ejecutándose en http://localhost:5000');
          } else if (response.status === 500) {
            throw new Error('Error interno del servidor. Verifica los logs del backend.');
          } else if (response.status === 0 || response.statusText === 'Failed to fetch') {
            throw new Error('No se puede conectar al backend. Verifica que el servidor esté ejecutándose en http://localhost:5000');
          } else {
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
          }
        }

        const result = await response.json();
        
        // Validación específica para datos vacíos o errores de rango de fechas
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.success && result.data && result.data.length === 0) {
          throw new Error('No hay datos para procesar en el rango de fechas seleccionado. Por favor selecciona otro rango de fechas.');
        }
        
        if (!result.data || result.data.length === 0) {
          throw new Error('No hay datos para procesar en el rango de fechas seleccionado. Por favor selecciona otro rango de fechas.');
        }
        
        if (result.success || (result.data && result.data.length > 0)) {
          setShowSuccess(true);
          return { success: true, data: result.data };
        } else {
          throw new Error('No hay datos para procesar en el rango de fechas seleccionado. Por favor selecciona otro rango de fechas.');
        }
        
      } catch (error) {
        console.error('Error en el procesamiento:', error);
        
        // Manejar errores de red específicamente
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          setShowError(true);
          return { success: false, error: 'No se puede conectar al backend. Verifica que el servidor esté ejecutándose en http://localhost:5000' };
        }
        
        setShowError(true);
        return { success: false, error: error.message };
      } finally {
        setProcessing(false);
        setAnimationState('idle');
      }
    };

  const handleGeneratePDF = async (pdfName, workMode) => {
    try {
      if (!excelData || !fechaInicio || !fechaFin) {
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
      const finalPdfName = pdfName?.trim() || generateDefaultPDFName(workMode);
      let blob;

      if (workMode === 0) {
        // Modo: Relación de Servicios
        blob = await generarPDFServiciosEfectivo({
          archivo: excelData,
          fechaInicio: fechaInicio.format('YYYY-MM-DD'),
          fechaFin: fechaFin.format('YYYY-MM-DD'),
          notas: note,
          imagenes: imagenes,
          nombrePDF: finalPdfName,
        });
      } else {
        // Modo: Pendientes de Pago
        blob = await generarPDFPendientes({
          archivo: excelData,
          fechaInicio: fechaInicio.format('YYYY-MM-DD'),
          fechaFin: fechaFin.format('YYYY-MM-DD'),
          notas: note,
          imagenes: imagenes,
          nombrePDF: finalPdfName,
        });
      }
      
      // Descargar el PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalPdfName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL del blob
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(`Error al generar el PDF: ${error.message}`);
    }
  };

  const handleGastoChange = (newGastoData) => {
    setGastoData(newGastoData);
  };

  const generateDefaultPDFName = (workMode) => {
    const dateStr = dayjs().format('YYYY-MM-DD');
    const timeStr = dayjs().format('HH-mm-ss');
    if (workMode === 0) {
      return `Relacion_Servicios_${dateStr}_${timeStr}.pdf`;
    } else {
      return `Pendientes_de_Pago_${dateStr}_${timeStr}.pdf`;
    }
  };


  const handleKeepNote = () => {
    setShowNoteDialog(false);
  };

  const handleClearNote = () => {
    setNote('');
    setShowNoteDialog(false);
  };



  // Handler para navegación
  const handleNavigation = (route) => {
    setCurrentRoute(route);
  };

  return (
    <DashboardLayout onNavigation={handleNavigation} currentRoute={currentRoute}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Box sx={{ 
          maxWidth: 900, 
          mx: 'auto', 
          p: { xs: 1, md: 4 },
          minHeight: '100vh',
          background: theme.fondoCuerpo,
          transition: 'background 0.3s ease'
        }}>
          <motion.div
            variants={STAGGER_VARIANTS}
            initial="hidden"
            animate="visible"
          >
            {/* Tarjeta grande: Header */}
            <motion.div variants={STAGGER_ITEM_VARIANTS}>
              <Box
                sx={{
                  background: theme.fondoContenedor,
                  borderRadius: '28px',
                  boxShadow: theme.sombraContenedor,
                  mb: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  position: 'relative',
                }}
              >
                
              </Box>
            </motion.div>

            {/* Área de contenido dinámico */}
            <ContentArea
              currentRoute={currentRoute}
              excelData={excelData}
              analyticsFile={analyticsFile}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              note={note}
              imagenes={imagenes}
              gastoData={gastoData}
              onFileChange={handleFileChange}
              onAnalyticsFileChange={handleAnalyticsFileChange}
              onFechaInicioChange={handleFechaInicioChange}
              onFechaFinChange={handleFechaFinChange}
              onNoteChange={handleNoteChange}
              onImageChange={setImagenes}
              onProcessData={handleProcessData}
              onGeneratePDF={handleGeneratePDF}
              onGastoChange={handleGastoChange}
              processing={processing}
              animationState={animationState}
              setAnimationState={setAnimationState}
              showSuccess={showSuccess}
              showError={showError}
              setShowSuccess={setShowSuccess}
              setShowError={setShowError}
            />
          </motion.div>

          {/* Overlay de transición de modo */}
          {showModeTransition && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ModeTransitionAnimation fromMode={modeTransitionData.from} toMode={modeTransitionData.to} />
            </Box>
          )}

          {/* Diálogo de confirmación para conservar nota */}
          <Dialog open={showNoteDialog} onClose={handleKeepNote}>
            <DialogTitle>¿Deseas conservar la nota anterior?</DialogTitle>
            <DialogContent>
              Has cambiado el rango de fechas. ¿Quieres mantener la nota escrita o empezar con una nota vacía?
            </DialogContent>
            <DialogActions>
              <MuiButton 
                onClick={handleClearNote} 
                sx={{ 
                  background: theme.terminalRojo,
                  color: theme.textoContraste,
                  '&:hover': {
                    background: theme.terminalRojo,
                    opacity: 0.9
                  }
                }}
              >
                Limpiar nota
              </MuiButton>
              <MuiButton 
                onClick={handleKeepNote} 
                sx={{ 
                  background: theme.gradientes.botonProcesar,
                  color: theme.textoContraste,
                  '&:hover': {
                    background: theme.gradientes.botonProcesar,
                    opacity: 0.9
                  }
                }}
                autoFocus
              >
                Mantener nota
              </MuiButton>
            </DialogActions>
          </Dialog>
        </Box>
      </motion.div>
    </DashboardLayout>
  );
}

export default App;