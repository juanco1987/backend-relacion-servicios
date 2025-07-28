import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

function AnalyticsResumen({ resumen, pendientes = { total_pendientes_relacionar: 0, total_pendientes_cobrar: 0 } }) {
  const { theme } = useTheme();

  if (!resumen) return <div>No hay datos para mostrar.</div>;

  // Preparar datos para el gráfico de dona
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
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const añoA = a.mes.split(' ')[1];
      const añoB = b.mes.split(' ')[1];
      const mesA = meses.indexOf(a.mes.split(' ')[0]);
      const mesB = meses.indexOf(b.mes.split(' ')[0]);
      if (añoA !== añoB) return añoA - añoB;
      return mesA - mesB;
    });

  // Colores para el gráfico
  const COLORS = [
    theme.terminalVerde,    // Verde para efectivo
    theme.textoInfo,        // Azul para transferencia
    theme.primario,         // Color primario para total
    theme.terminalAmarillo, // Amarillo
    theme.terminalRojo,     // Rojo
    theme.textoAdvertencia  // Naranja
  ];

  // Componente Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: theme.fondoContenedor,
          border: `1px solid ${theme.bordePrincipal}`,
          borderRadius: '8px',
          padding: '12px',
          color: theme.textoPrincipal,
          boxShadow: theme.sombraComponente
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              fontSize: '14px'
            }}>
              {entry.name}: ${entry.value.toLocaleString('es-CO')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Preparar datos para el gráfico de dona (solo totales por mes)
  const dataDona = dataGrafica.map(item => ({
    name: item.mes,
    value: item.total,
    efectivo: item.efectivo,
    transferencia: item.transferencia,
    cantidad: item.cantidad_general
  }));

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
        🍩 Distribución de Servicios por Mes
      </h3>

      {/* Gráfico de Dona */}
      <div style={{ marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={dataDona}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value, cantidad }) => 
                `${name}\n$${value.toLocaleString('es-CO')}\n(${cantidad} servicios)`
              }
              labelLine={false}
            >
              {dataDona.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke={theme.fondoContenedor}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                color: theme.textoPrincipal,
                fontSize: '14px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen numérico compacto */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginTop: '24px'
      }}>
        {dataGrafica.map((item, index) => (
          <div key={item.mes} style={{
            background: theme.fondoPrincipal,
            borderRadius: '12px',
            padding: '16px',
            border: `1px solid ${theme.bordePrincipal}`,
            textAlign: 'center'
          }}>
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
              ${item.total.toLocaleString('es-CO')}
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
                💰 ${item.efectivo.toLocaleString('es-CO')}
              </span>
              <span style={{ color: theme.textoInfo }}>
                💳 ${item.transferencia.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas adicionales */}
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
          <div>
            <div style={{ color: theme.terminalVerde, fontWeight: 'bold' }}>
              ${dataGrafica.reduce((sum, item) => sum + item.efectivo, 0).toLocaleString('es-CO')}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Total Efectivo
            </div>
          </div>
          <div>
            <div style={{ color: theme.textoInfo, fontWeight: 'bold' }}>
              ${dataGrafica.reduce((sum, item) => sum + item.transferencia, 0).toLocaleString('es-CO')}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Total Transferencia
            </div>
          </div>
          <div>
            <div style={{ color: theme.primario, fontWeight: 'bold' }}>
              ${dataGrafica.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-CO')}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Total General
            </div>
          </div>
          <div>
            <div style={{ color: theme.textoAdvertencia, fontWeight: 'bold' }}>
              {dataGrafica.reduce((sum, item) => sum + item.cantidad_general, 0)}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Servicios Totales
            </div>
          </div>
          <div>
            <div style={{ color: theme.terminalRojo, fontWeight: 'bold' }}>
              {pendientes.total_pendientes_relacionar}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Pendientes Relacionar
            </div>
          </div>
          <div>
            <div style={{ color: theme.terminalRojo, fontWeight: 'bold' }}>
              {pendientes.total_pendientes_cobrar}
            </div>
            <div style={{ color: theme.textoSecundario, fontSize: '12px' }}>
              Pendientes Cobrar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsResumen; 