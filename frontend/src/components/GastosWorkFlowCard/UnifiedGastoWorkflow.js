import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { API_CONFIG } from '../../config/appConfig';
import WorkflowHeader from '../UnifiedWorkflowCard/WorkflowHeader';
import WorkflowStepper from '../UnifiedWorkflowCard/WorkFlowStepper';
import WorkflowStatus from '../UnifiedWorkflowCard/WorkFlowStatus';
import NewProcessButton from '../UnifiedWorkflowCard/NewProcessButton';
import NewProcessDialog from '../UnifiedWorkflowCard/NewProcessDialog';
import StepGastosTable from './StepGastosTable';
import StepConsignacionesTable from './StepConsignacionesTable';
import StepGastoConfirmation from './StepGastoConfirmation';
import StepImagenesPorCategoria from './StepGastoImages'; // <-- nuevo import
import CustomButton from '../common/CustomButton';
import gastoIcon from '../../assets/icono_pdf.png';

const UnifiedGastoWorkflow = ({
  gastoData,
  onGastoChange,
  imagenes, // ya no se usa, pero se deja para compatibilidad
  onImageChange,
  processing,
}) => {
  const { theme } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [pdfName, setPdfName] = useState('');
  const [showNewProcessDialog, setShowNewProcessDialog] = useState(false);
  const [processCompleted, setProcessCompleted] = useState(false);

  // Estados principales
  const [gastos, setGastos] = useState([]);
  const [consignaciones, setConsignaciones] = useState([]);

  // Estados para imágenes (nuevo paso)
  const [imagenesGastos, setImagenesGastos] = useState([]);
  const [imagenesConsignaciones, setImagenesConsignaciones] = useState([]);
  const [imagenesDevoluciones, setImagenesDevoluciones] = useState([]);

  // --- GASTOS ---
  const handleAgregarGasto = (nuevoGasto) => {
    setGastos([...gastos, nuevoGasto]);
  };

  const handleEliminarGasto = (index) => {
    const nuevos = [...gastos];
    nuevos.splice(index, 1);
    setGastos(nuevos);
  };

  // --- CONSIGNACIONES ---
  const handleAgregarConsignacion = (nuevaConsignacion) => {
    setConsignaciones([...consignaciones, nuevaConsignacion]);
  };

  const handleEliminarConsignacion = (index) => {
    const nuevas = [...consignaciones];
    nuevas.splice(index, 1);
    setConsignaciones(nuevas);
  };

  // --- IMÁGENES (manejadores) ---
  const handleAgregarImagenGastos = (img) => {
    setImagenesGastos((prev) => [...prev, img]);
  };
  const handleAgregarImagenConsignaciones = (img) => {
    setImagenesConsignaciones((prev) => [...prev, img]);
  };
  const handleAgregarImagenDevoluciones = (img) => {
    setImagenesDevoluciones((prev) => [...prev, img]);
  };

  const handleEliminarImagenGastos = (index) => {
    const nuevas = [...imagenesGastos];
    nuevas.splice(index, 1);
    setImagenesGastos(nuevas);
  };
  const handleEliminarImagenConsignaciones = (index) => {
    const nuevas = [...imagenesConsignaciones];
    nuevas.splice(index, 1);
    setImagenesConsignaciones(nuevas);
  };
  const handleEliminarImagenDevoluciones = (index) => {
    const nuevas = [...imagenesDevoluciones];
    nuevas.splice(index, 1);
    setImagenesDevoluciones(nuevas);
  };

  // Validaciones
  const isStep0Valid = () => gastos.length > 0;
  const isStep1Valid = () => consignaciones.length > 0;
  // Para el paso de imágenes las consideramos opcionales; marcamos completado si hay al menos una imagen en alguna categoría
  const isStep2ValidImages = () =>
    (imagenesGastos && imagenesGastos.length > 0) ||
    (imagenesConsignaciones && imagenesConsignaciones.length > 0) ||
    (imagenesDevoluciones && imagenesDevoluciones.length > 0);

  // Estado final (confirmación) valida si gastos+consignaciones están presentes (imágenes opcionales)
  const isStep3Valid = () => isStep0Valid() && isStep1Valid();

  // Estado de pasos
  const getStepStatus = (index) => {
    switch (index) {
      case 0:
        return isStep0Valid() ? 'completed' : 'pending';
      case 1:
        return isStep1Valid() ? 'completed' : 'pending';
      case 2:
        // Si hay imágenes -> completed, si no -> pending (porque opcional, pero visualmente así lo verás)
        return isStep2ValidImages() ? 'completed' : 'pending';
      case 3:
        return isStep3Valid() && processCompleted ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  // Generar PDF en backend (ahora incluye imágenes)
  const handleGenerarPDF = async (pdfNameParam) => {
    try {
      const API_BASE = API_CONFIG.BASE_URL;

      console.log('Enviando datos al backend...');
      console.log('Gastos:', gastos);
      console.log('Consignaciones:', consignaciones);
      console.log('Imagenes Gastos:', imagenesGastos.length);
      console.log('Imagenes Consignaciones:', imagenesConsignaciones.length);
      console.log('Imagenes Devoluciones:', imagenesDevoluciones.length);

      const response = await fetch(`${API_BASE}/api/gastos/generar-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gastos,
          consignaciones,
          imagenesGastos,
          imagenesConsignaciones,
          imagenesDevoluciones,
          nombrePDF: pdfNameParam || pdfName || 'Reporte_Gastos',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfNameParam || pdfName || 'Reporte_Gastos'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProcessCompleted(true);
      console.log('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error: ' + error.message);
    }
  };

  // Definir pasos (ahora con 4 pasos: gastos, consignaciones, comprobantes, confirmación)
  const steps = [
    {
      label: 'Datos del Gasto',
      description: 'Registra y visualiza tus gastos',
      icon: gastoIcon,
      content: (
        <StepGastosTable
          theme={theme}
          gastos={gastos}
          onAgregarGasto={handleAgregarGasto}
          onEliminarGasto={handleEliminarGasto}
          onContinuar={() => {
            if (isStep0Valid()) setActiveStep(1);
            else alert('Agrega al menos un gasto antes de continuar');
          }}
        />
      ),
    },
    {
      label: 'Consignaciones',
      description: 'Registra las consignaciones relacionadas',
      icon: gastoIcon,
      content: (
        <StepConsignacionesTable
          theme={theme}
          consignaciones={consignaciones}
          onAgregarConsignacion={handleAgregarConsignacion}
          onEliminarConsignacion={handleEliminarConsignacion}
          onContinuar={() => {
            if (isStep1Valid()) setActiveStep(2);
            else alert('Agrega al menos una consignación antes de continuar');
          }}
        />
      ),
    },
    {
      label: 'Comprobantes de pago', // título pedido
      description: 'Sube los comprobantes relacionados con tus gastos y consignaciones',
      icon: gastoIcon,
      content: (
        <>
          <StepImagenesPorCategoria
            theme={theme}
            imagenesGastos={imagenesGastos}
            imagenesConsignaciones={imagenesConsignaciones}
            imagenesDevolucioPnes={imagenesDevoluciones}
            onAgregarImagenGastos={handleAgregarImagenGastos}
            onAgregarImagenConsignaciones={handleAgregarImagenConsignaciones}
            onAgregarImagenDevoluciones={handleAgregarImagenDevoluciones}
            onEliminarImagenGastos={handleEliminarImagenGastos}
            onEliminarImagenConsignaciones={handleEliminarImagenConsignaciones}
            onEliminarImagenDevoluciones={handleEliminarImagenDevoluciones}
            // onContinuar aquí será usado por el componente interno para avanzar
            onContinuar={() => {
              // Avanza al paso de confirmación (índice 3)
              setActiveStep(3);
            }}
          />
        </>
      ),
    },
    {
      label: 'Confirmación y PDF',
      description: 'Revisa y genera tu reporte final',
      icon: gastoIcon,
      content: (
        <StepGastoConfirmation
          theme={theme}
          gastoData={{ gastos, consignaciones }}
          imagenesGastos={imagenesGastos}
          imagenesConsignaciones={imagenesConsignaciones}
          imagenesDevoluciones={imagenesDevoluciones}
          pdfName={pdfName}
          onPdfNameChange={setPdfName}
          onGeneratePDF={handleGenerarPDF}
          processing={processing}
        />
      ),
    },
  ];

  // Reiniciar proceso
  const handleNewProcess = () => {
    setGastos([]);
    setConsignaciones([]);
    setImagenesGastos([]);
    setImagenesConsignaciones([]);
    setImagenesDevoluciones([]);
    setPdfName('');
    setActiveStep(0);
    setProcessCompleted(false);
    setShowNewProcessDialog(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <WorkflowHeader
        theme={theme}
        workMode={0}
        actionIcon={gastoIcon}
        title="Registro de Gastos y Consignaciones"
        description="Flujo completo para registrar, consignar y generar reporte PDF"
      />

      <WorkflowStepper
        theme={theme}
        steps={steps}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        archivoExcel="Gastos"
        userHasConfiguredDates={isStep0Valid()}
        dataProcessed={isStep3Valid()}
        getStepStatus={getStepStatus}
      />

      <WorkflowStatus
        theme={theme}
        archivoExcel={isStep0Valid()}
        userHasConfiguredDates={isStep1Valid()}
        processing={processing}
        dataProcessed={processCompleted}
        pdfGenerated={processCompleted}
        pdfIcon={gastoIcon}
      />

      <NewProcessButton
        theme={theme}
        processCompleted={processCompleted}
        onNewProcess={() => setShowNewProcessDialog(true)}
      />

      <NewProcessDialog
        theme={theme}
        open={showNewProcessDialog}
        onClose={() => setShowNewProcessDialog(false)}
        onConfirm={handleNewProcess}
      />
    </Box>
  );
};

export default UnifiedGastoWorkflow;
