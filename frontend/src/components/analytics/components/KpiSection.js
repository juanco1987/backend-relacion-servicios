import React from 'react';
import { Box } from '@mui/material';
import { formatNumber, formatCurrency } from '../../../utils/numberFormatters';
import { useTheme } from '../../../context/ThemeContext';
import KpiCard from '../../common/KpiCard';

function KpiSection({ kpi, pendientesSeleccionados }) {
  const { theme } = useTheme();

  // Funciones para mostrar mensajes reconfortantes
  const getPendientesRelacionarDisplay = () => {
    const cantidad = pendientesSeleccionados.total_pendientes_relacionar || 0;
    if (cantidad === 0) {
      return {
        value: "¡Excelente!",
        subtitle: "Estás al día en la relación de servicios",
        color: theme.terminalVerde
      };
    }
    return {
      value: cantidad.toString(),
      subtitle: "servicios por relacionar",
      color: theme.terminalRojo
    };
  };

  const getPendientesCobrarDisplay = () => {
    const cantidad = pendientesSeleccionados.total_pendientes_cobrar || 0;
    if (cantidad === 0) {
      return {
        value: "¡Excelente!",
        subtitle: "Estás al día en el cobro de pendientes",
        color: theme.terminalVerde
      };
    }
    return {
      value: cantidad.toString(),
      subtitle: "servicios por cobrar",
      color: theme.terminalAmarillo
    };
  };

  return (
    <>
      {/* KPIs de montos */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <KpiCard
          title="Total Efectivo"
          value={formatCurrency(kpi.efectivo_total)}
          subtitle={`${kpi.efectivo_cantidad} servicios en efectivo`}
          color={theme.terminalVerde}
        />
        <KpiCard
          title="Total Transferencia"
          value={formatCurrency(kpi.transferencia_total)}
          subtitle={`${kpi.transferencia_cantidad} servicios por transferencia`}
          color={theme.textoInfo}
        />
        <KpiCard
          title="Total General"
          value={formatCurrency(kpi.total_general)}
          subtitle={`${kpi.efectivo_cantidad + kpi.transferencia_cantidad} servicios totales`}
          color={theme.terminalVerdeNeon}
        />
      </Box>

      {/* KPIs de pendientes */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <KpiCard
          title="Pendientes Relacionar"
          value={getPendientesRelacionarDisplay().value}
          subtitle={getPendientesRelacionarDisplay().subtitle}
          color={getPendientesRelacionarDisplay().color}
        />
        <KpiCard
          title="Pendientes Cobrar"
          value={getPendientesCobrarDisplay().value}
          subtitle={getPendientesCobrarDisplay().subtitle}
          color={getPendientesCobrarDisplay().color}
        />
        {/* Espaciador invisible para mantener la consistencia */}
        <Box />
      </Box>
    </>
  );
}

export default KpiSection;