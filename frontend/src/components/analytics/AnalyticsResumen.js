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
            valueStyle={{ marginBottom: 0 }}
          >
            {/* Header Conciso */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <h4 style={{
                color: theme.textoPrincipal,
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: '800',
                borderLeft: `3px solid ${theme.terminalVerde}`,
                paddingLeft: '8px',
                lineHeight: '1'
              }}>
                {item.mes}
              </h4>
            </div>

            {/* Total Principal con Degradado Premium */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.terminalVerdeNeon} 40%, ${theme.terminalAzul} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2rem',
              fontWeight: '900',
              marginBottom: '10px',
              letterSpacing: '-1px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}>
              {formatCurrency(item.total)}
            </div>

            {/* Barra Visual de Proporción */}
            <div style={{
              display: 'flex',
              height: '6px',
              width: '100%',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '12px',
              background: theme.bordePrincipal
            }}>
              <div style={{
                width: `${(item.efectivo / item.total) * 100}%`,
                background: theme.terminalVerde
              }} />
              <div style={{
                width: `${(item.transferencia / item.total) * 100}%`,
                background: theme.textoInfo
              }} />
            </div>

            {/* Desglose Footer Minimalista */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: `1px solid ${theme.bordePrincipal}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem' }}>💰</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: theme.terminalVerde }}>
                  {formatCurrency(item.efectivo)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: theme.textoInfo }}>
                  {formatCurrency(item.transferencia)}
                </span>
                <span style={{ fontSize: '1rem' }}>💳</span>
              </div>
            </div>
          </KpiCard>
        ))
        }
      </div>

    </div>
  );
}

export default AnalyticsResumen;
