import React from 'react';

function AnalyticsResumen({ resumen }) {
  if (!resumen) return <div>No hay datos para mostrar.</div>;

  return (
    <div>
      <h2>Resumen por mes</h2>
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