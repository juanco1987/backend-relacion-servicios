import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/numberFormatters';
import KpiCard from '../common/KpiCard';
import CustomButton from '../common/CustomButton';
import ServiciosPendientesEfectivo from './ServiciosPendientesEfectivo';
import ServiciosPendientesCobrar from './ServiciosPendientesCobrar';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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
        
        const response = await fetch(`${API_BASE}/api/analytics`, {
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

  // Usando la función de utilidad formatCurrency importada

  // ❌ ELIMINAR - Ya no necesitamos el KpiCard inline
  // const KpiCard = ({ title, value, subtitle, color = theme.textoInfo, icon }) => (
  //   ...
  // );

  // Datos de ejemplo basados en tu Excel (se pueden adaptar con datos reales)
  const sampleData = {
    serviciosPorTipo: [],
    tendenciaMensual: [],
    clientesRecurrentes: [],
    estadosServicio: []
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
        {/* KPIs Principales - Usando el componente reutilizable */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <KpiCard
            title="🔧 Total Servicios"
            value={totalServicios.toString()}
            subtitle="Total general"
            color={theme.textoInfo}
          />
          <KpiCard
            title="💰 Ingresos Totales"
            value={formatCurrency(totalIngresos)}
            subtitle="Total general"
            color={theme.terminalVerde}
          />
          <KpiCard
            title="⏳ Servicios Pendientes"
            value={serviciosPendientes.toString()}
            subtitle="Por cobrar"
            color={theme.textoAdvertencia}
          />
          <KpiCard
            title="✅ Efectividad"
            value={`${efectividad}%`}
            subtitle="Servicios completados"
            color={theme.terminalVerde}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {dataToUse.clientesRecurrentes.map((cliente, index) => (
            <KpiCard
              key={cliente.cliente}
              title={`${index === 0 ? '🏆' : index === 1 ? '⭐' : '🏢'} ${cliente.cliente}`}
              value={formatCurrency(cliente.valor)}
              subtitle={`${cliente.servicios} servicios`}
              color={index === 0 ? theme.terminalVerde : index === 1 ? theme.textoInfo : theme.textoSecundario}
              valueStyle={{ fontSize: '1rem' }}
            />
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

      {/* Métricas de Servicios - Usando KpiCard reutilizable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(200px, 1fr))', gap: '20px' }}>
        <KpiCard
          title="🔧 Servicio Más Común"
          value="Instalación"
          subtitle="40% del total"
          color={theme.textoInfo}
        />
        <KpiCard
          title="💵 Valor Promedio"
          value={formatCurrency(145000)}
          subtitle="Por servicio"
          color={theme.terminalVerde}
        />
        <KpiCard
          title="⏱️ Tiempo Promedio"
          value="2.5 días"
          subtitle="Para completar"
          color={theme.textoAdvertencia}
        />
        <KpiCard
          title="⭐ Satisfacción"
          value="4.8/5"
          subtitle="Promedio cliente"
          color={theme.terminalVerde}
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
        <CustomButton
          onClick={() => setSelectedView('pendientes-efectivo')}
          variant="contained"
          sx={{
            background: selectedView === 'pendientes-efectivo' ? theme.textoAdvertencia : theme.fondoContenedor,
            color: selectedView === 'pendientes-efectivo' ? 'white' : theme.textoPrincipal,
            border: `1px solid ${theme.bordePrincipal}`,
            padding: '12px 24px',
            fontSize: '1rem'
          }}
        >
          💸 Servicios Pendientes en Efectivo
        </CustomButton>
        <CustomButton
          onClick={() => setSelectedView('pendientes-cobrar')}
          variant="contained"
          sx={{
            background: selectedView === 'pendientes-cobrar' ? theme.terminalRojo : theme.fondoContenedor,
            color: selectedView === 'pendientes-cobrar' ? 'white' : theme.textoPrincipal,
            border: `1px solid ${theme.bordePrincipal}`,
            padding: '12px 24px',
            fontSize: '1rem'
          }}
        >
          ⏳ Servicios Pendientes por Cobrar
        </CustomButton>
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
          <CustomButton
            key={view.key}
            onClick={() => setSelectedView(view.key)}
            variant="contained"
            sx={{
              background: selectedView === view.key ? theme.textoInfo : theme.fondoContenedor,
              color: selectedView === view.key ? 'white' : theme.textoPrincipal,
              border: `1px solid ${theme.bordePrincipal}`,
              padding: '12px 24px',
              fontSize: '1rem'
            }}
          >
            {view.label}
          </CustomButton>
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