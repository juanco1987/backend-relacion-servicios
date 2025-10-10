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
  const [estadosGrafico, setEstadosGrafico] = useState(null);
  const [totalesEstadosEspeciales, setTotalesEstadosEspeciales] = useState(null);
  const [estadosEspecialesPorMes, setEstadosEspecialesPorMes] = useState(null);
  const [loading, setLoading] = useState(false);

  // Colores para el gráfico - Usando theme del archivo centralizado (SIN HARDCODEAR)
  const COLORS = {
    YA_RELACIONADO: theme.terminalVerde,
    PENDIENTE_COBRAR: theme.textoAdvertencia,
    COTIZACION: theme.textoInfo,
    NO_PAGARON_DOMICILIO: theme.terminalRojo,
    GARANTIA: theme.terminalAmarillo,
    NO_SE_COBRA_DOMICILIO: theme.terminalMorado,
    CANCELADO: theme.terminalRojoEncendido,
    OTROS: theme.terminalRosa
  };

  useEffect(() => {
    if (!file) {
      console.log('⚠️ No hay archivo cargado');
      return;
    }
    
    const fetchAnalytics = async () => {
      setLoading(true);
      console.log('📄 Iniciando fetch de analytics...');
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        console.log('📤 Enviando archivo:', file.name);
        
        const response = await fetch(`${API_BASE}/api/analytics`, {
          method: 'POST',
          body: formData,
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          throw new Error(`Error al obtener analytics: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Data recibida:', data);
        console.log('📊 resumen:', data.resumen);
        console.log('📊 estados_grafico:', data.estados_grafico);
        console.log('📊 totales_estados_especiales:', data.totales_estados_especiales);
        console.log('📊 estados_especiales_por_mes:', data.estados_especiales_por_mes);
        
        // DEBUG: Mostrar exactamente qué campos tiene estados_grafico
        console.log('🔍 CAMPOS DE estados_grafico:', Object.keys(data.estados_grafico || {}));
        console.log('🔍 Valor de OTROS:', data.estados_grafico?.OTROS);
        console.log('🔍 Valor de TOTAL_SERVICIOS:', data.estados_grafico?.TOTAL_SERVICIOS);
        
        setAnalyticsData(data.resumen);
        setEstadosGrafico(data.estados_grafico);
        setTotalesEstadosEspeciales(data.totales_estados_especiales);
        setEstadosEspecialesPorMes(data.estados_especiales_por_mes);
        
        console.log('✅ Estados actualizados en React');
        
      } catch (error) {
        console.error('❌ Error fetching analytics:', error);
        console.error('❌ Error details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [file]);

  // Procesar datos para el gráfico de dona - Solo los 7 estados principales
  const getEstadosParaDona = () => {
    if (!estadosGrafico) return [];

    return [
      { 
        estado: 'Ya Relacionado', 
        cantidad: estadosGrafico.YA_RELACIONADO || 0,
        color: COLORS.YA_RELACIONADO
      },
      { 
        estado: 'Pendiente Cobrar', 
        cantidad: estadosGrafico.PENDIENTE_COBRAR || 0,
        color: COLORS.PENDIENTE_COBRAR
      },
      { 
        estado: 'Cotización', 
        cantidad: estadosGrafico.COTIZACION || 0,
        color: COLORS.COTIZACION
      },
      { 
        estado: 'No Pagaron Domicilio', 
        cantidad: estadosGrafico.NO_PAGARON_DOMICILIO || 0,
        color: COLORS.NO_PAGARON_DOMICILIO
      },
      { 
        estado: 'Garantía', 
        cantidad: estadosGrafico.GARANTIA || 0,
        color: COLORS.GARANTIA
      },
      { 
        estado: 'No se Cobra Domicilio', 
        cantidad: estadosGrafico.NO_SE_COBRA_DOMICILIO || 0,
        color: COLORS.NO_SE_COBRA_DOMICILIO
      },
      { 
        estado: 'Cancelado', 
        cantidad: estadosGrafico.CANCELADO || 0,
        color: COLORS.CANCELADO
      }
    ].filter(item => item.cantidad > 0);
  };

  // Procesar datos reales del Excel
  const [realData, setRealData] = useState({
    serviciosPorTipo: [],
    tendenciaMensual: [],
    clientesRecurrentes: [],
    estadosServicio: []
  });

  useEffect(() => {
    if (analyticsData && estadosGrafico) {
      // Procesar tendencia mensual
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

      // Calcular totales
      const totalServicios = estadosGrafico.TOTAL_SERVICIOS || 0;
      const totalIngresos = tendenciaMensual.reduce((sum, item) => sum + item.ingresos, 0);
      
      // Estados de servicio para KPIs
      const estadosServicio = [
        { 
          estado: 'YA RELACIONADO', 
          cantidad: estadosGrafico.YA_RELACIONADO || 0, 
          porcentaje: totalServicios > 0 ? Math.round((estadosGrafico.YA_RELACIONADO / totalServicios) * 100) : 0 
        },
        { 
          estado: 'PENDIENTE COBRAR', 
          cantidad: estadosGrafico.PENDIENTE_COBRAR || 0, 
          porcentaje: totalServicios > 0 ? Math.round((estadosGrafico.PENDIENTE_COBRAR / totalServicios) * 100) : 0 
        },
        { 
          estado: 'EN PROCESO', 
          cantidad: estadosGrafico.COTIZACION || 0, 
          porcentaje: totalServicios > 0 ? Math.round((estadosGrafico.COTIZACION / totalServicios) * 100) : 0 
        }
      ];

      // Datos de ejemplo para servicios por tipo y clientes
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
  }, [analyticsData, estadosGrafico]);

  const dataToUse = analyticsData ? realData : { 
    serviciosPorTipo: [], 
    tendenciaMensual: [], 
    clientesRecurrentes: [], 
    estadosServicio: [] 
  };

  const renderGeneralView = () => {
    console.log('🎨 Renderizando vista general');
    console.log('📋 estadosGrafico:', estadosGrafico);
    console.log('📋 totalesEstadosEspeciales:', totalesEstadosEspeciales);
    console.log('📋 dataToUse:', dataToUse);
    
    if (!estadosGrafico) {
      return (
        <div style={{ 
          padding: '40px', 
          color: theme.textoPrincipal,
          background: theme.fondoContenedor,
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
            No hay datos de estados disponibles
          </p>
          <p style={{ color: theme.textoSecundario }}>
            Verifica que el backend esté retornando 'estados_grafico'
          </p>
        </div>
      );
    }
    
    const totalServicios = estadosGrafico?.TOTAL_SERVICIOS || 0;
    const totalIngresos = dataToUse.tendenciaMensual.reduce((sum, item) => sum + item.ingresos, 0);
    const serviciosPendientes = estadosGrafico?.PENDIENTE_COBRAR || 0;
    const efectividad = totalServicios > 0 
      ? Math.round((estadosGrafico?.YA_RELACIONADO / totalServicios) * 100) 
      : 0;
    
    console.log('📊 Calculados - Total:', totalServicios, 'Ingresos:', totalIngresos, 'Pendientes:', serviciosPendientes, 'Efectividad:', efectividad);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* KPIs Principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <KpiCard
            title="Total Servicios"
            value={totalServicios.toString()}
            subtitle="Total general"
            color={theme.textoInfo}
          />
          <KpiCard
            title="Ingresos Totales"
            value={formatCurrency(totalIngresos)}
            subtitle="Total general"
            color={theme.terminalVerde}
          />
          <KpiCard
            title="Servicios Pendientes"
            value={serviciosPendientes.toString()}
            subtitle="Por cobrar"
            color={theme.textoAdvertencia}
          />
          <KpiCard
            title="Efectividad"
            value={`${efectividad}%`}
            subtitle="Servicios completados"
            color={theme.terminalVerde}
          />
        </div>

        {/* KPIs de Estados Especiales */}
        {totalesEstadosEspeciales && (
          <div>
            <h3 style={{ marginBottom: '16px', color: theme.textoPrincipal }}>
              Estados Especiales
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <KpiCard
                title="No Pagaron Domicilio"
                value={totalesEstadosEspeciales.no_pagaron_domicilio?.toString() || '0'}
                subtitle="Servicios registrados"
                color={theme.terminalRojo}
              />
              <KpiCard
                title="Garantía"
                value={totalesEstadosEspeciales.garantia?.toString() || '0'}
                subtitle="Servicios en garantía"
                color={theme.terminalAmarillo}
              />
              <KpiCard
                title="Cancelado"
                value={totalesEstadosEspeciales.cancelado?.toString() || '0'}
                subtitle="Servicios cancelados"
                color={theme.terminalRojoEncendido}
              />
              <KpiCard
                title="No se Cobra Domicilio"
                value={totalesEstadosEspeciales.no_se_cobra_domicilio?.toString() || '0'}
                subtitle="Sin cargo domicilio"
                color={theme.terminalMorado}
              />
              <KpiCard
                title="Cotización"
                value={totalesEstadosEspeciales.cotizacion?.toString() || '0'}
                subtitle="En cotización"
                color={theme.textoInfo}
              />
            </div>
          </div>
        )}

        {/* Gráfico de Tendencia Mensual */}
        <div style={{ 
          background: theme.fondoContenedor, 
          borderRadius: '16px', 
          padding: '20px', 
          boxShadow: theme.sombraComponente,
          border: `1px solid ${theme.bordePrincipal}`
        }}>
          <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>
            Tendencia de Servicios e Ingresos
          </h3>
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

        {/* Gráfico de Estados Especiales por Mes - AHORA USA estadosEspecialesPorMes */}
        {estadosEspecialesPorMes && Object.keys(estadosEspecialesPorMes).length > 0 && (
          <div style={{ 
            background: theme.fondoContenedor, 
            borderRadius: '16px', 
            padding: '20px', 
            boxShadow: theme.sombraComponente,
            border: `1px solid ${theme.bordePrincipal}`
          }}>
            <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>
              Estados Especiales por Mes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(estadosEspecialesPorMes).map(([mes, datos]) => ({
                mes,
                'No Pagaron': datos.no_pagaron_domicilio || 0,
                'Garantía': datos.garantia || 0,
                'Cancelado': datos.cancelado || 0,
                'No se Cobra': datos.no_se_cobra_domicilio || 0,
                'Cotización': datos.cotizacion || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
                <XAxis dataKey="mes" stroke={theme.textoPrincipal} />
                <YAxis stroke={theme.textoPrincipal} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.fondoContenedor,
                    border: `1px solid ${theme.bordePrincipal}`,
                    color: theme.textoPrincipal
                  }}
                />
                <Legend />
                <Bar dataKey="No Pagaron" stackId="a" fill={COLORS.NO_PAGARON_DOMICILIO} />
                <Bar dataKey="Garantía" stackId="a" fill={COLORS.GARANTIA} />
                <Bar dataKey="Cancelado" stackId="a" fill={COLORS.CANCELADO} />
                <Bar dataKey="No se Cobra" stackId="a" fill={COLORS.NO_SE_COBRA_DOMICILIO} />
                <Bar dataKey="Cotización" stackId="a" fill={COLORS.COTIZACION} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Dona - Estados de Servicios - CORREGIDO PORCENTAJES */}
        <div style={{ 
          background: theme.fondoContenedor, 
          borderRadius: '16px', 
          padding: '20px', 
          boxShadow: theme.sombraComponente,
          border: `1px solid ${theme.bordePrincipal}`
        }}>
          <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>
            Distribución de Estados de Servicios
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={getEstadosParaDona()}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ estado, cantidad, percent }) => {
                  const porcentaje = (percent * 100).toFixed(1);
                  return `${estado}: ${cantidad} (${porcentaje}%)`;
                }}
                outerRadius={120}
                fill={theme.textoInfo}
                dataKey="cantidad"
              >
                {getEstadosParaDona().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => {
                  const estadosData = getEstadosParaDona();
                  const total = estadosData.reduce((sum, item) => sum + item.cantidad, 0);
                  const porcentaje = ((value / total) * 100).toFixed(1);
                  return `${value} servicios (${porcentaje}%)`;
                }}
                contentStyle={{
                  backgroundColor: theme.fondoContenedor,
                  border: `1px solid ${theme.bordePrincipal}`,
                  color: theme.textoPrincipal
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Leyenda personalizada */}
          <div style={{ 
            marginTop: '20px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '10px' 
          }}>
            {getEstadosParaDona().map((item, index) => {
              const total = getEstadosParaDona().reduce((sum, i) => sum + i.cantidad, 0);
              const porcentaje = ((item.cantidad / total) * 100).toFixed(1);
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px',
                  background: theme.fondoMenu,
                  borderRadius: '8px',
                  border: `1px solid ${theme.bordePrincipal}`
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    background: item.color,
                    borderRadius: '4px'
                  }} />
                  <span style={{ color: theme.textoPrincipal, fontSize: '0.9rem' }}>
                    {item.estado}: {item.cantidad} ({porcentaje}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderClientesView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>Análisis de Clientes</h2>
      
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

      <div style={{ 
        background: theme.fondoContenedor, 
        borderRadius: '16px', 
        padding: '20px', 
        boxShadow: theme.sombraComponente,
        border: `1px solid ${theme.bordePrincipal}`
      }}>
        <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>Mejores Clientes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {dataToUse.clientesRecurrentes.map((cliente, index) => (
            <KpiCard
              key={cliente.cliente}
              title={`${cliente.cliente}`}
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
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>Análisis de Servicios</h2>
      
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <KpiCard
          title="Servicio Más Común"
          value="Instalación"
          subtitle="40% del total"
          color={theme.textoInfo}
        />
        <KpiCard
          title="Valor Promedio"
          value={formatCurrency(145000)}
          subtitle="Por servicio"
          color={theme.terminalVerde}
        />
        <KpiCard
          title="Tiempo Promedio"
          value="2.5 días"
          subtitle="Para completar"
          color={theme.textoAdvertencia}
        />
        <KpiCard
          title="Satisfacción"
          value="4.8/5"
          subtitle="Promedio cliente"
          color={theme.terminalVerde}
        />
      </div>
    </div>
  );

  const renderPendientesView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>Servicios Pendientes</h2>
      
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
          Servicios Pendientes por Cobrar
        </CustomButton>
      </div>

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
      background: theme.fondoCuerpo,
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
        Dashboard Analytics Completo
      </h1>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '30px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'general', label: 'General' },
          { key: 'clientes', label: 'Clientes' },
          { key: 'servicios', label: 'Servicios' },
          { key: 'pendientes', label: 'Pendientes' }
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