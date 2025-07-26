// App.js Modificado

import Header from './components/common/Header';
import WorkModeTabs from './components/layout/WorkModeTabs';
import ExcelUploader from './components/forms/ExcelUploader';
import DateRangeSelector from './components/forms/DateRangeSelector';
import NotesCard from './components/forms/NotesCard';
import ActionCenterCard from './components/layout/ActionCenterCard';
import ProcessingConsole from './components/common/ProcessingConsole';
import ServiciosPendientesEfectivo from './components/analytics/ServiciosPendientesEfectivo';
import ServiciosPendientesCobrar from './components/analytics/ServiciosPendientesCobrar';
import Analytics from './components/analytics/Analytics';
import './App.css';
import { useTheme } from './context/ThemeContext';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { createLogEntry, LOG_MESSAGES } from './config/logMessages';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';
import { motion } from 'framer-motion';
import { ANIMATIONS, STAGGER_VARIANTS, STAGGER_ITEM_VARIANTS } from './config/animations';
import ModeTransitionAnimation from './components/animations/ModeTransitionAnimation';

function App() {
  // Función para obtener fechas por defecto del mes actual
  const getDefaultDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const format = (date) => date.toISOString().split('T')[0];
    return {
      inicio: format(firstDay),
      fin: format(lastDay),
    };
  };

  const { inicio, fin } = getDefaultDates();
  const [tab, setTab] = useState(0);
  const [note, setNote] = useState("");
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(inicio);
  const [fechaFin, setFechaFin] = useState(fin);
  const [logs, setLogs] = useState([]);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [pendingFecha, setPendingFecha] = useState({ inicio: '', fin: '' });
  const [showModeTransition, setShowModeTransition] = useState(false);
  const [modeTransitionData, setModeTransitionData] = useState({ from: 0, to: 0 });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const {theme} = useTheme();

  // Inicializar logs de bienvenida
  useEffect(() => {
    const welcomeLogs = [
      createLogEntry('WELCOME_MESSAGE_1'),
      createLogEntry('WELCOME_MESSAGE_2'),
      createLogEntry('WELCOME_MESSAGE_3'),
      createLogEntry('WELCOME_MESSAGE_4'),
      createLogEntry('WELCOME_MESSAGE_5'),
      createLogEntry('WELCOME_MESSAGE_6'),
      createLogEntry('SYSTEM_READY'),
    ];
    setLogs(welcomeLogs);
  }, []);

  const handleTabChange = (event, newValue) => {
    // Mostrar animación de transición de modo
    setModeTransitionData({ from: tab, to: newValue });
    setShowModeTransition(true);
    
    setTimeout(() => {
      setTab(newValue);
      setShowModeTransition(false);
      const modeNames = ['Relación de Servicios', 'Pendientes de Pago', 'Servicios Pendientes en Efectivo'];
      addLog(createLogEntry('INFO_UPDATING', `Modo de trabajo cambiado a: ${modeNames[newValue]}`));
      setNote(""); // Limpiar nota al cambiar modo
    }, 4500); // Aumentado a 4.5 segundos para que el usuario pueda leer el modo final
  };

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    // Eliminado el log automático para evitar spam
  };

  // Función para agregar logs
  const addLog = (logEntry) => {
    setLogs(prevLogs => [...prevLogs, logEntry]);
  };

  // Función para limpiar logs
  const clearLogs = () => {
    setLogs([]);
    addLog(createLogEntry('LOG_CLEARED'));
  };

  // Función para manejar cambios de archivo
  const handleFileChange = (file) => {
    setArchivoExcel(file);
    setNote(""); // Limpiar nota al cambiar archivo
    // El log se maneja en ExcelUploader, no aquí
  };

  // Función para manejar cambios de fecha
  const handleFechaInicioChange = (fecha) => {
    // Si solo cambia la fecha y hay nota, preguntar si conservar
    if (note && (fecha !== fechaInicio)) {
      setPendingFecha({ inicio: fecha, fin: fechaFin });
      setShowNoteDialog(true);
    } else {
      setFechaInicio(fecha);
    }
  };

  const handleFechaFinChange = (fecha) => {
    // Si solo cambia la fecha y hay nota, preguntar si conservar
    if (note && (fecha !== fechaFin)) {
      setPendingFecha({ inicio: fechaInicio, fin: fecha });
      setShowNoteDialog(true);
    } else {
      setFechaFin(fecha);
    }
  };

  // Limpiar nota al procesar datos (se pasa como prop a ActionCenterCard)
  const handleProcessData = () => {
    // No limpiar la nota aquí
  };

  // Funciones para el diálogo de confirmación de nota
  const handleKeepNote = () => {
    setFechaInicio(pendingFecha.inicio);
    setFechaFin(pendingFecha.fin);
    setShowNoteDialog(false);
  };
  const handleClearNote = () => {
    setFechaInicio(pendingFecha.inicio);
    setFechaFin(pendingFecha.fin);
    setNote("");
    setShowNoteDialog(false);
  };

  // Función para mostrar/ocultar Analytics
  const handleToggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
    addLog(createLogEntry('INFO_UPDATING', `Analytics ${showAnalytics ? 'ocultado' : 'mostrado'}`));
  };

  // Función para renderizar el contenido según la pestaña seleccionada
  const renderTabContent = () => {
    switch(tab) {
      case 0: // Relación de Servicios
      case 1: // Pendientes de Pago
        return (
          <>
            {/* Tarjeta Centro de Acciones */}
            <motion.div variants={STAGGER_ITEM_VARIANTS}>
              <Box sx={{ width: '100%', mb: 4 }}>
                <ActionCenterCard 
                  archivoExcel={archivoExcel} 
                  fechaInicio={fechaInicio} 
                  fechaFin={fechaFin} 
                  notas={note}
                  addLog={addLog}
                  workMode={tab}
                  onProcessData={handleProcessData}
                  onToggleAnalytics={handleToggleAnalytics}
                  showAnalytics={showAnalytics}
                />
              </Box>
            </motion.div>

            {/* Componente Analytics */}
            {showAnalytics && (
              <motion.div variants={STAGGER_ITEM_VARIANTS}>
                <Analytics excelData={archivoExcel} workMode={tab} />
              </motion.div>
            )}
          </>
        );
      case 2: // Servicios Pendientes en Efectivo
        return (
          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <Box sx={{ width: '100%', mb: 4 }}>
              <ServiciosPendientesEfectivo 
                file={archivoExcel}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
              />
            </Box>
          </motion.div>
        );
      case 3: // Servicios Pendientes por Cobrar (nuevo)
        return (
          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <Box sx={{ width: '100%', mb: 4 }}>
              <ServiciosPendientesCobrar
                file={archivoExcel}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
              />
            </Box>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
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
          {/* Tarjeta grande: Header + Botones */}
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
              <WorkModeTabs value={tab} onChange={handleTabChange} />
            </Box>
          </motion.div>

          {/* Selector de archivo Excel */}
          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <Box sx={{ width: '100%', mb: 1 }}>
              <ExcelUploader onFileChange={handleFileChange} addLog={addLog} workMode={tab} />
            </Box>
          </motion.div>

          {/* Fila de Rango de Fechas y Notas */}
          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <Box sx={{ width: '100%', display: 'flex', gap: 3, mb: 4 }}>
              <Box
                sx={{
                  flex: 1,
                  background: theme.fondoContenedor,
                  borderRadius: '28px',
                  boxShadow: theme.sombraContenedor,
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 220,
                }}
              >
                <DateRangeSelector
                  fechaInicio={fechaInicio}
                  fechaFin={fechaFin}
                  onFechaInicioChange={handleFechaInicioChange}
                  onFechaFinChange={handleFechaFinChange}
                  addLog={addLog}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  background: theme.fondoContenedor,
                  borderRadius: '28px',
                  boxShadow: theme.sombraContenedor,
                  p: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 220,
                }}
              >
                <NotesCard value={note} onChange={handleNoteChange} addLog={addLog} />
              </Box>
            </Box>
          </motion.div>

          {/* Contenido específico según la pestaña */}
          {renderTabContent()}

          {/* Tarjeta Consola de Procesamiento */}
          <motion.div variants={STAGGER_ITEM_VARIANTS}>
            <Box sx={{ width: '100%' }}>
              <ProcessingConsole logs={logs} onClearLogs={clearLogs} />
            </Box>
          </motion.div>
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
  );
}

export default App;