// App.js Modificado

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

function App() {
  const { theme } = useTheme();
  
  // Estado para la navegación
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  
  // Estados existentes
  const [excelData, setExcelData] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month'));
  const [fechaFin, setFechaFin] = useState(dayjs().endOf('month'));
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showModeTransition, setShowModeTransition] = useState(false);
  const [modeTransitionData, setModeTransitionData] = useState({ from: '', to: '' });

  // Handlers existentes
  const handleFileChange = (data) => {
    setExcelData(data);
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
    setNote(newNote);
  };

  const handleProcessData = async (data) => {
    // Lógica de procesamiento existente
    setProcessing(true);
    setAnimationState('loading');
    
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
    } catch (error) {
      setShowError(true);
    } finally {
      setProcessing(false);
      setAnimationState('idle');
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
                <Header />
              </Box>
            </motion.div>

            {/* Área de contenido dinámico */}
            <ContentArea
              currentRoute={currentRoute}
              excelData={excelData}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              note={note}
              onFileChange={handleFileChange}
              onFechaInicioChange={handleFechaInicioChange}
              onFechaFinChange={handleFechaFinChange}
              onNoteChange={handleNoteChange}
              onProcessData={handleProcessData}
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
              <MuiButton onClick={handleClearNote} color="error">Limpiar nota</MuiButton>
              <MuiButton onClick={handleKeepNote} color="primary" autoFocus>Mantener nota</MuiButton>
            </DialogActions>
          </Dialog>
        </Box>
      </motion.div>
    </DashboardLayout>
  );
}

export default App;