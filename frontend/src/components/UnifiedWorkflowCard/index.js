import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Stepper, Step, StepLabel, 
  StepContent, Paper, IconButton, Chip, Divider, MenuItem, Select,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Grow
} from '@mui/material';

import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { ANIMATIONS } from '../../config/animations';
import { APP_MESSAGES } from '../../config/appConfig';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import WorkflowHeader from './WorkflowHeader';
import StepFileUpload from './StepFileUpload';
import StepParameters from './StepParameters';
import StepReportGeneration from './StepReportGeneration';
import WorkflowStepper from './WorkFlowStepper';
import WorkflowStatus from './WorkFlowStatus';
import NewProcessDialog from './NewProcessDialog';
import NewProcessButton from './NewProcessButton';

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

dayjs.locale('es');

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
  const [imagenes, setImagenes] = useState([]);

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
    setPdfGenerated(false);
    setShouldClearFile(false);
    
    // Resetear fechas
    setFromDate(null);
    setToDate(null);
    setUserHasConfiguredDates(false);
    
    // Resetear mes y año
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
        <StepFileUpload
          archivoExcel={archivoExcel}
          onFileChange={onFileChange}
          theme={theme}
        />
      )
    },
    {
      label: 'Configurar parámetros',
      description: 'Define el período de tiempo y agrega notas al reporte',
      icon: engraneIcon,
      content: (
        <StepParameters
          theme={theme}
          calendarIcon2={calendarIcon2}
          notesIcon={notesIcon}
          fromDate={fromDate}
          toDate={toDate}
          notas={notas}
          imagenes={imagenes}
          onImageChange={setImagenes}
          onNoteChange={onNoteChange}
          onFromDateChange={handleFromDateChange}
          onToDateChange={handleToDateChange}
        />
      )
    },
    {
      label: 'Generar reporte',
      description: 'Procesa los datos y genera el PDF del reporte',
      icon: planIcon,
      content: (
        <StepReportGeneration
          theme={theme}
          pdfIcon={pdfIcon}
          processIcon={processIcon}
          reportName={reportName}
          dataProcessed={dataProcessed}
          processing={processing}
          archivoExcel={archivoExcel}
          userHasConfiguredDates={userHasConfiguredDates}
          onReportNameChange={(e) => setReportName(e.target.value)}
          onProcessData={handleProcessDataClick}
          onGeneratePDF={() => {
            if (onGeneratePDF) {
              onGeneratePDF(reportName, workMode);
              setPdfGenerated(true);
              setProcessCompleted(true);
            }
          }}
          workMode={workMode}
        />
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
        <WorkflowHeader theme={theme} workMode={workMode} actionIcon={actionIcon} />

        {/* Stepper */}
        <WorkflowStepper
          theme={theme}
          steps={steps}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          archivoExcel={archivoExcel}
          userHasConfiguredDates={userHasConfiguredDates}
          dataProcessed={dataProcessed}
          getStepStatus={getStepStatus}
        />

        {/* Estado actual */}
        <WorkflowStatus
          theme={theme}
          archivoExcel={archivoExcel}
          userHasConfiguredDates={userHasConfiguredDates}
          processing={processing}
          dataProcessed={dataProcessed}
          pdfGenerated={pdfGenerated}
          pdfIcon={pdfIcon}
        />

        {/* Botón de Nuevo Proceso - Solo visible cuando se ha completado el proceso */}
        <NewProcessButton
          theme={theme}
          processCompleted={processCompleted}
          onNewProcess={handleNewProcess}
        />
      </Paper>

      {/* Diálogo de confirmación para nuevo proceso */}
      <NewProcessDialog
        theme={theme}
        open={showNewProcessDialog}
        onClose={cancelNewProcess}
        onConfirm={confirmNewProcess}
      />
    </motion.div>
  );
};

export default UnifiedWorkflowCard;
