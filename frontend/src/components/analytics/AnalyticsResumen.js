import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import KpiCard from '../common/KpiCard';
import { formatCurrency } from '../../utils/numberFormatters';

function AnalyticsResumen({ resumen, pendientes = { total_pendientes_relacionar: 0, total_pendientes_cobrar: 0 } }) {
  const { theme } = useTheme();

  if (!resumen) return <div>No hay datos para mostrar.</div>;

  const dataGrafica = Object.entries(resumen)
    .filter(([mes]) => {
      if (!mes) return false;
      const normalizado = mes.trim().toLowerCase();
      return normalizado &&
        normalizado !== 'null' &&
        normalizado !== 'undefined' &&
        normalizado !== 'invalid date' &&
        !/^nat$/i.test(normalizado);
    })
    .map(([mes, datos]) => {
      datos = datos || {};
      const efectivo_total = Number(datos.efectivo_total) || 0;
      const transferencia_total = Number(datos.transferencia_total) || 0;
      const total_general = Number(datos.total_general) || 0;

      return {
        mes: mes,
        efectivo: efectivo_total,
        transferencia: transferencia_total,
        total: total_general,
        efectivo_cantidad: Number(datos.efectivo_cantidad) || 0,
        transferencia_cantidad: Number(datos.transferencia_cantidad) || 0,
        cantidad_general: Number(datos.cantidad_general) || 0
      };
    })
    .sort((a, b) => {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const añoA = a.mes.split(' ')[1];
      const añoB = b.mes.split(' ')[1];
      const mesA = meses.indexOf(a.mes.split(' ')[0]);
      const mesB = meses.indexOf(b.mes.split(' ')[0]);
      if (añoA !== añoB) return añoA - añoB;
      return mesA - mesB;
    });

  return (
    <div style={{
      background: theme.fondoContenedor,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: theme.sombraComponente,
      border: `1px solid ${theme.bordePrincipal}`
    }}>
      <h3 style={{
        color: theme.textoPrincipal,
        textAlign: 'center',
        marginBottom: '24px',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        📊 Distribución de Servicios por Mes
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '0px'
      }}>
        {dataGrafica.map((item) => (
          <KpiCard
            key={item.mes}
            color={theme.primario}
            variant="elevated"
          >
            <h4 style={{
              color: theme.textoPrincipal,
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {item.mes}
            </h4>
            <div style={{
              color: theme.terminalVerde,
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              {formatCurrency(item.total)}
            </div>
            <div style={{
              color: theme.textoSecundario,
              fontSize: '14px'
            }}>
              {item.cantidad_general} servicios
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
              fontSize: '12px'
            }}>
              <span style={{ color: theme.terminalVerde }}>
                💰 {formatCurrency(item.efectivo)}
              </span>
              <span style={{ color: theme.textoInfo }}>
                💳 {formatCurrency(item.transferencia)}
              </span>
            </div>
          </KpiCard>
        ))}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: theme.fondoPrincipal,
        borderRadius: '12px',
        border: `1px solid ${theme.bordePrincipal}`
      }}>
        <h4 style={{
          color: theme.textoPrincipal,
          margin: '0 0 12px 0',
          textAlign: 'center'
        }}>
          📊 Estadísticas Generales
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          textAlign: 'center'
        }}>
          <KpiCard color={theme.terminalVerde} variant='elevated'>
            <div style={{ color: theme.terminalVerde, fontWeight: 'bold' }}>
              {formatCurrency(dataGrafica.reduce((sum, item) => sum + item.efectivo, 0))}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Total Efectivo
            </div>
          </KpiCard>
          <KpiCard color={theme.textoInfo} variant='elevated'>
            <div style={{ color: theme.textoInfo, fontWeight: 'bold' }}>
              {formatCurrency(dataGrafica.reduce((sum, item) => sum + item.transferencia, 0))}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Total Transferencia
            </div>
          </KpiCard>
          <KpiCard color={theme.terminalVerdeNeon} variant='elevated'>
            <div style={{ color: theme.terminalVerdeNeon, fontWeight: 'bold' }}>
              {formatCurrency(dataGrafica.reduce((sum, item) => sum + item.total, 0))}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Total General
            </div>
          </KpiCard>
          <KpiCard color={theme.terminalOliva} variant='elevated'>
            <div style={{ color: theme.terminalOliva, fontWeight: 'bold', }}>
              {dataGrafica.reduce((sum, item) => sum + item.cantidad_general, 0)}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Servicios Totales
            </div>
          </KpiCard>
          <KpiCard color={theme.terminalRojo} variant='elevated'>
            <div style={{ color: theme.terminalRojo, fontWeight: 'bold' }}>
              {pendientes.total_pendientes_relacionar}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Pendientes Relacionar
            </div>
          </KpiCard>
          <KpiCard color={theme.terminalAmarillo} variant='elevated'>
            <div style={{ color: theme.terminalAmarillo, fontWeight: 'bold' }}>
              {pendientes.total_pendientes_cobrar}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Pendientes Cobrar
            </div>
          </KpiCard>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsResumen;
