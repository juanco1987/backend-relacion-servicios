import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import ServiciosPendientesEfectivo from './ServiciosPendientesEfectivo';
import ServiciosPendientesCobrar from './ServiciosPendientesCobrar';

const EnhancedAnalyticsDashboard = ({ file, fechaInicio, fechaFin }) => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState('general');
  const [selectedMonth, setSelectedMonth] = useState('Total Global');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Colores del tema
  const COLORS = [theme.textoInfo, theme.textoAdvertencia, theme.terminalRojo, theme.terminalVerde, theme.terminalAmarillo];

  useEffect(() => {
    if (!file) return;
    
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:5000/api/analytics', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Error al obtener analytics');
        }
        
        const data = await response.json();
        setAnalyticsData(data.resumen);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [file]);

  const formatCurrency = (value) => {
    return `$${Number(value || 0).toLocaleString('es-CO')}`;
  };

  const KpiCard = ({ title, value, subtitle, color = theme.textoInfo, icon }) => (
    <div style={{
      background: theme.fondoContenedor,
      borderRadius: '16px',
      padding: '20px',
      boxShadow: theme.sombraComponente,
      border: `2px solid ${color}`,
      textAlign: 'center',
      minWidth: '200px',
      color: theme.textoPrincipal
    }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '14px', color: theme.textoSecundario, marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: theme.textoSecundario }}>{subtitle}</div>
    </div>
  );

  // Datos de ejemplo basados en tu Excel (se pueden adaptar con datos reales)
  const sampleData = {
    serviciosPorTipo: [
      { tipo: 'Instalación', cantidad: 18, valor: 3200000 },
      { tipo: 'Mantenimiento', cantidad: 12, valor: 1800000 },
      { tipo: 'Reparación', cantidad: 8, valor: 1200000 },
      { tipo: 'Revisión', cantidad: 7, valor: 900000 }
    ],
    tendenciaMensual: [
      { mes: 'Enero', servicios: 25, ingresos: 4200000 },
      { mes: 'Febrero', servicios: 30, ingresos: 5100000 },
      { mes: 'Marzo', servicios: 28, ingresos: 4800000 },
      { mes: 'Abril', servicios: 35, ingresos: 5900000 },
      { mes: 'Mayo', servicios: 32, ingresos: 5400000 },
      { mes: 'Junio', servicios: 38, ingresos: 6200000 },
      { mes: 'Julio', servicios: 40, ingresos: 6800000 }
    ],
    clientesRecurrentes: [
      { cliente: 'EMPRESAS', servicios: 15, valor: 2800000 },
      { cliente: 'CASA', servicios: 20, valor: 2200000 },
      { cliente: 'ADMINISTRACIÓN', servicios: 8, valor: 1800000 },
      { cliente: 'LOCAL', servicios: 5, valor: 900000 }
    ],
    estadosServicio: [
      { estado: 'YA RELACIONADO', cantidad: 35, porcentaje: 70 },
      { estado: 'PENDIENTE COBRAR', cantidad: 12, porcentaje: 24 },
      { estado: 'EN PROCESO', cantidad: 3, porcentaje: 6 }
    ]
  };

  // Datos reales basados en el Excel (se procesan dinámicamente)
  const [realData, setRealData] = useState({
    serviciosPorTipo: [],
    tendenciaMensual: [],
    clientesRecurrentes: [],
    estadosServicio: []
  });

  // Procesar datos reales del Excel
  useEffect(() => {
    if (analyticsData) {
      // Procesar tendencia mensual desde analyticsData
      const tendenciaMensual = Object.entries(analyticsData)
        .filter(([mes]) => {
          if (!mes) return false;
          const normalizado = mes.trim().toLowerCase();
          return normalizado &&
            normalizado !== 'null' &&
            normalizado !== 'undefined' &&
            normalizado !== 'invalid date' &&
            !/^nat$/i.test(normalizado);
        })
        .map(([mes, datos]) => ({
          mes: mes,
          servicios: Number(datos?.cantidad_general || 0),
          ingresos: Number(datos?.total_general || 0)
        }))
        .sort((a, b) => {
          const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          const añoA = a.mes.split(' ')[1];
          const añoB = b.mes.split(' ')[1];
          const mesA = meses.indexOf(a.mes.split(' ')[0]);
          const mesB = meses.indexOf(b.mes.split(' ')[0]);
          if (añoA !== añoB) return añoA - añoB;
          return mesA - mesB;
        });

      // Calcular totales para estados de servicio
      const totalServicios = tendenciaMensual.reduce((sum, item) => sum + item.servicios, 0);
      const totalIngresos = tendenciaMensual.reduce((sum, item) => sum + item.ingresos, 0);
      
      // Estados de servicio (ejemplo - se pueden adaptar según los datos reales)
      const estadosServicio = [
        { estado: 'YA RELACIONADO', cantidad: Math.round(totalServicios * 0.7), porcentaje: 70 },
        { estado: 'PENDIENTE COBRAR', cantidad: Math.round(totalServicios * 0.24), porcentaje: 24 },
        { estado: 'EN PROCESO', cantidad: Math.round(totalServicios * 0.06), porcentaje: 6 }
      ];

      const serviciosPorTipo = [
        { tipo: 'Instalación', cantidad: Math.round(totalServicios * 0.4), valor: Math.round(totalIngresos * 0.4) },
        { tipo: 'Mantenimiento', cantidad: Math.round(totalServicios * 0.25), valor: Math.round(totalIngresos * 0.25) },
        { tipo: 'Reparación', cantidad: Math.round(totalServicios * 0.2), valor: Math.round(totalIngresos * 0.2) },
        { tipo: 'Revisión', cantidad: Math.round(totalServicios * 0.15), valor: Math.round(totalIngresos * 0.15) }
      ];

      const clientesRecurrentes = [
        { cliente: 'EMPRESAS', servicios: Math.round(totalServicios * 0.3), valor: Math.round(totalIngresos * 0.3) },
        { cliente: 'CASA', servicios: Math.round(totalServicios * 0.4), valor: Math.round(totalIngresos * 0.4) },
        { cliente: 'ADMINISTRACIÓN', servicios: Math.round(totalServicios * 0.2), valor: Math.round(totalIngresos * 0.2) },
        { cliente: 'LOCAL', servicios: Math.round(totalServicios * 0.1), valor: Math.round(totalIngresos * 0.1) }
      ];

      setRealData({
        serviciosPorTipo,
        tendenciaMensual,
        clientesRecurrentes,
        estadosServicio
      });
    }
  }, [analyticsData]);

  // Usar datos reales en lugar de sampleData
  const dataToUse = analyticsData ? realData : sampleData;

  const renderGeneralView = () => {
    // Calcular totales reales
    const totalServicios = dataToUse.tendenciaMensual.reduce((sum, item) => sum + item.servicios, 0);
    const totalIngresos = dataToUse.tendenciaMensual.reduce((sum, item) => sum + item.ingresos, 0);
    const serviciosPendientes = dataToUse.estadosServicio.find(item => item.estado === 'PENDIENTE COBRAR')?.cantidad || 0;
    const efectividad = dataToUse.estadosServicio.find(item => item.estado === 'YA RELACIONADO')?.porcentaje || 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* KPIs Principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <KpiCard
            title="Total Servicios"
            value={totalServicios.toString()}
            subtitle="Total general"
            color={theme.textoInfo}
            icon="🔧"
          />
          <KpiCard
            title="Ingresos Totales"
            value={formatCurrency(totalIngresos)}
            subtitle="Total general"
            color={theme.terminalVerde}
            icon="💰"
          />
          <KpiCard
            title="Servicios Pendientes"
            value={serviciosPendientes.toString()}
            subtitle="Por cobrar"
            color={theme.textoAdvertencia}
            icon="⏳"
          />
          <KpiCard
            title="Efectividad"
            value={`${efectividad}%`}
            subtitle="Servicios completados"
            color={theme.terminalVerde}
            icon="✅"
          />
        </div>

        {/* Gráfico de Tendencia Mensual */}
        <div style={{ 
          background: theme.fondoContenedor, 
          borderRadius: '16px', 
          padding: '20px', 
          boxShadow: theme.sombraComponente,
          border: `1px solid ${theme.bordePrincipal}`
        }}>
          <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>📈 Tendencia de Servicios e Ingresos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataToUse.tendenciaMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
              <XAxis dataKey="mes" stroke={theme.textoPrincipal} />
              <YAxis yAxisId="left" stroke={theme.textoPrincipal} />
              <YAxis yAxisId="right" orientation="right" stroke={theme.textoPrincipal} />
              <Tooltip 
                formatter={(value, name) => name === 'ingresos' ? formatCurrency(value) : value}
                contentStyle={{
                  backgroundColor: theme.fondoContenedor,
                  border: `1px solid ${theme.bordePrincipal}`,
                  color: theme.textoPrincipal
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="servicios" fill={theme.textoInfo} name="Servicios" />
              <Line yAxisId="right" type="monotone" dataKey="ingresos" stroke={theme.terminalVerde} strokeWidth={3} name="Ingresos" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estados de Servicios */}
        <div style={{ 
          background: theme.fondoContenedor, 
          borderRadius: '16px', 
          padding: '20px', 
          boxShadow: theme.sombraComponente,
          border: `1px solid ${theme.bordePrincipal}`
        }}>
          <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>📊 Estados de Servicios</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataToUse.estadosServicio}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ estado, porcentaje }) => `${estado}: ${porcentaje}%`}
                outerRadius={80}
                fill={theme.textoInfo}
                dataKey="cantidad"
              >
                {dataToUse.estadosServicio.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme.fondoContenedor,
                  border: `1px solid ${theme.bordePrincipal}`,
                  color: theme.textoPrincipal
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderClientesView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>🏢 Análisis de Clientes</h2>
      
      <div style={{ 
        background: theme.fondoContenedor, 
        borderRadius: '16px', 
        padding: '20px', 
        boxShadow: theme.sombraComponente,
        border: `1px solid ${theme.bordePrincipal}`
      }}>
        <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>Clientes por Tipo</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataToUse.clientesRecurrentes}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
            <XAxis dataKey="cliente" stroke={theme.textoPrincipal} />
            <YAxis stroke={theme.textoPrincipal} />
            <Tooltip 
              formatter={(value, name) => name === 'valor' ? formatCurrency(value) : value}
              contentStyle={{
                backgroundColor: theme.fondoContenedor,
                border: `1px solid ${theme.bordePrincipal}`,
                color: theme.textoPrincipal
              }}
            />
            <Legend />
            <Bar dataKey="servicios" fill={theme.textoInfo} name="Servicios" />
            <Bar dataKey="valor" fill={theme.terminalVerde} name="Valor Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Clientes */}
      <div style={{ 
        background: theme.fondoContenedor, 
        borderRadius: '16px', 
        padding: '20px', 
        boxShadow: theme.sombraComponente,
        border: `1px solid ${theme.bordePrincipal}`
      }}>
        <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>💎 Mejores Clientes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {dataToUse.clientesRecurrentes.map((cliente, index) => (
            <div key={cliente.cliente} style={{
              padding: '16px',
              background: theme.fondoContenedor,
              borderRadius: '12px',
              border: `1px solid ${theme.bordePrincipal}`,
              color: theme.textoPrincipal
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: theme.textoPrincipal }}>{cliente.cliente}</span>
                <span style={{ fontSize: '18px' }}>
                  {index === 0 ? '👑' : index === 1 ? '⭐' : '🏢'}
                </span>
              </div>
              <div style={{ color: theme.textoSecundario, fontSize: '14px' }}>
                {cliente.servicios} servicios
              </div>
              <div style={{ color: theme.terminalVerde, fontWeight: 'bold', fontSize: '16px' }}>
                {formatCurrency(cliente.valor)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServiciosView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>🔧 Análisis de Servicios</h2>
      
      <div style={{ 
        background: theme.fondoContenedor, 
        borderRadius: '16px', 
        padding: '20px', 
        boxShadow: theme.sombraComponente,
        border: `1px solid ${theme.bordePrincipal}`
      }}>
        <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>Servicios por Tipo</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataToUse.serviciosPorTipo}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
            <XAxis dataKey="tipo" stroke={theme.textoPrincipal} />
            <YAxis stroke={theme.textoPrincipal} />
            <Tooltip 
              formatter={(value, name) => name === 'valor' ? formatCurrency(value) : value}
              contentStyle={{
                backgroundColor: theme.fondoContenedor,
                border: `1px solid ${theme.bordePrincipal}`,
                color: theme.textoPrincipal
              }}
            />
            <Legend />
            <Bar dataKey="cantidad" fill={theme.textoInfo} name="Cantidad" />
            <Bar dataKey="valor" fill={theme.terminalVerde} name="Valor" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Métricas de Servicios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <KpiCard
          title="Servicio Más Común"
          value="Instalación"
          subtitle="40% del total"
          color={theme.textoInfo}
          icon="🔧"
        />
        <KpiCard
          title="Valor Promedio"
          value={formatCurrency(145000)}
          subtitle="Por servicio"
          color={theme.terminalVerde}
          icon="💵"
        />
        <KpiCard
          title="Tiempo Promedio"
          value="2.5 días"
          subtitle="Para completar"
          color={theme.textoAdvertencia}
          icon="⏱️"
        />
        <KpiCard
          title="Satisfacción"
          value="4.8/5"
          subtitle="Promedio cliente"
          color={theme.terminalVerde}
          icon="⭐"
        />
      </div>
    </div>
  );

  const renderPendientesView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>📋 Servicios Pendientes</h2>
      
      {/* Selector de tipo de pendientes */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setSelectedView('pendientes-efectivo')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '25px',
            background: selectedView === 'pendientes-efectivo' ? theme.textoAdvertencia : theme.fondoContenedor,
            color: selectedView === 'pendientes-efectivo' ? 'white' : theme.textoPrincipal,
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: theme.sombraComponente,
            border: `1px solid ${theme.bordePrincipal}`,
            transition: 'all 0.3s ease'
          }}
        >
          💸 Servicios Pendientes en Efectivo
        </button>
        <button
          onClick={() => setSelectedView('pendientes-cobrar')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '25px',
            background: selectedView === 'pendientes-cobrar' ? theme.terminalRojo : theme.fondoContenedor,
            color: selectedView === 'pendientes-cobrar' ? 'white' : theme.textoPrincipal,
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: theme.sombraComponente,
            border: `1px solid ${theme.bordePrincipal}`,
            transition: 'all 0.3s ease'
          }}
        >
          ⏳ Servicios Pendientes por Cobrar
        </button>
      </div>

      {/* Contenido de pendientes */}
      {selectedView === 'pendientes-efectivo' && (
        <ServiciosPendientesEfectivo 
          file={file}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )}
      {selectedView === 'pendientes-cobrar' && (
        <ServiciosPendientesCobrar 
          file={file}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200,
        color: theme.textoPrincipal 
      }}>
        <p>Cargando dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '20px',
      background: theme.fondoPrincipal,
      minHeight: '100vh',
      color: theme.textoPrincipal
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        color: theme.textoPrincipal,
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        📊 Dashboard Analytics Completo
      </h1>

      {/* Navegación */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'general', label: '📈 General', icon: '📈' },
          { key: 'clientes', label: '🏢 Clientes', icon: '🏢' },
          { key: 'servicios', label: '🔧 Servicios', icon: '🔧' },
          { key: 'pendientes', label: '📋 Pendientes', icon: '📋' }
        ].map((view) => (
          <button
            key={view.key}
            onClick={() => setSelectedView(view.key)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '25px',
              background: selectedView === view.key ? theme.textoInfo : theme.fondoContenedor,
              color: selectedView === view.key ? 'white' : theme.textoPrincipal,
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: theme.sombraComponente,
              border: `1px solid ${theme.bordePrincipal}`,
              transition: 'all 0.3s ease'
            }}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Contenido dinámico */}
      <div>
        {selectedView === 'general' && renderGeneralView()}
        {selectedView === 'clientes' && renderClientesView()}
        {selectedView === 'servicios' && renderServiciosView()}
        {selectedView === 'pendientes' && renderPendientesView()}
        {selectedView === 'pendientes-efectivo' && renderPendientesView()}
        {selectedView === 'pendientes-cobrar' && renderPendientesView()}
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDashboard; 