import React from 'react';
import KpiCard from './KpiCard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaymentsIcon from '@mui/icons-material/Payments';
import InfoIcon from '@mui/icons-material/Info';

function AnalyticsResumen({ resumen }) {
  if (!resumen) return <div>No hay datos para mostrar.</div>;

  // Obtener el mes más reciente (última clave)
  const meses = Object.keys(resumen).sort();
  const mesActual = meses[meses.length - 1];
  const datos = resumen[mesActual] || {};
  const efectivo_total = Number(datos.efectivo_total) || 0;
  const efectivo_cantidad = Number(datos.efectivo_cantidad) || 0;
  const transferencia_total = Number(datos.transferencia_total) || 0;
  const transferencia_cantidad = Number(datos.transferencia_cantidad) || 0;
  const total_general = Number(datos.total_general) || 0;
  const cantidad_general = Number(datos.cantidad_general) || 0;

  return (
    <div>
      <h2>Resumen por mes</h2>
      {/* KPIs del mes más reciente */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        margin: '1.5rem 0',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
      }}>
        <KpiCard title={`Total Efectivo (${mesActual})`} value={`$${efectivo_total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="#388e3c" icon={<MonetizationOnIcon />} />
        <KpiCard title={`Cantidad Efectivo (${mesActual})`} value={efectivo_cantidad} color="#388e3c" icon={<InfoIcon />} />
        <KpiCard title={`Total Transferencia (${mesActual})`} value={`$${transferencia_total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="#1976d2" icon={<PaymentsIcon />} />
        <KpiCard title={`Cantidad Transferencia (${mesActual})`} value={transferencia_cantidad} color="#1976d2" icon={<InfoIcon />} />
        <KpiCard title={`Total General (${mesActual})`} value={`$${total_general.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} color="#ff9800" icon={<MonetizationOnIcon />} />
        <KpiCard title={`Cantidad General (${mesActual})`} value={cantidad_general} color="#ff9800" icon={<InfoIcon />} />
      </div>
      {/* Tabla para todos los meses */}
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Mes</th>
            <th>Total EFECTIVO</th>
            <th>Cantidad EFECTIVO</th>
            <th>Total TRANSFERENCIA</th>
            <th>Cantidad TRANSFERENCIA</th>
            <th>Total General</th>
            <th>Cantidad General</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(resumen).map(([mes, datos]) => {
            datos = datos || {};
            const efectivo_total = Number(datos.efectivo_total) || 0;
            const efectivo_cantidad = Number(datos.efectivo_cantidad) || 0;
            const transferencia_total = Number(datos.transferencia_total) || 0;
            const transferencia_cantidad = Number(datos.transferencia_cantidad) || 0;
            const total_general = Number(datos.total_general) || 0;
            const cantidad_general = Number(datos.cantidad_general) || 0;
            return (
              <tr key={mes}>
                <td>{mes}</td>
                <td>${efectivo_total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>{efectivo_cantidad}</td>
                <td>${transferencia_total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>{transferencia_cantidad}</td>
                <td><b>${total_general.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b></td>
                <td><b>{cantidad_general}</b></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AnalyticsResumen; 