import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/numberFormatters';
import { formatMonthAbbreviation } from '../../utils/dateFormatters';
import KpiCard from '../common/KpiCard';
import CustomButton from '../common/CustomButton';
import CustomTooltip from '../common/CustomTooltip';
import ServiciosPendientesEfectivo from './ServiciosPendientesEfectivo';
import ServiciosPendientesCobrar from './ServiciosPendientesCobrar';
import { API_CONFIG } from '../../config/appConfig';

const API_BASE = API_CONFIG.BASE_URL;

const EnhancedAnalyticsDashboard = ({ file, fechaInicio, fechaFin, defaultView = 'general', onRequestOpenUploader }) => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState(defaultView);

  // Actualizar selectedView cuando cambie defaultView
  useEffect(() => {
    setSelectedView(defaultView);
  }, [defaultView]);
  const [selectedMonth, setSelectedMonth] = useState('Total Global');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [estadosGrafico, setEstadosGrafico] = useState(null);
  const [totalesEstadosEspeciales, setTotalesEstadosEspeciales] = useState(null);
  const [estadosEspecialesPorMes, setEstadosEspecialesPorMes] = useState(null);
  const [clientesData, setClientesData] = useState([]);
  const [pendientesGlobales, setPendientesGlobales] = useState({ relacionar: 0, cobrar: 0 }); // Nuevo estado
  const [loading, setLoading] = useState(false);

  // Colores para el gráfico - Memoizados para evitar recreación
  const COLORS = useMemo(() => ({
    YA_RELACIONADO: theme.terminalVerde,
    PENDIENTE_COBRAR: theme.textoAdvertencia,
    COTIZACION: theme.textoInfo,
    NO_PAGARON_DOMICILIO: theme.terminalRojo,
    GARANTIA: theme.terminalAmarillo,
    NO_SE_COBRA_DOMICILIO: theme.terminalMorado,
    CANCELADO: theme.terminalRojoEncendido,
    OTROS: theme.terminalRosa
  }), [theme]);

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
        setAnalyticsData(data.resumen);
        setEstadosGrafico(data.estados_grafico);
        setTotalesEstadosEspeciales(data.totales_estados_especiales);
        setEstadosEspecialesPorMes(data.estados_especiales_por_mes);
        setClientesData(data.clientes_recurrentes || []);

        // Guardar pendientes globales
        setPendientesGlobales({
          relacionar: data.total_pendientes_relacionar || 0,
          cobrar: data.total_pendientes_cobrar || 0
        });

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

  // Procesar datos para el gráfico de dona - Memoizado para evitar recálculos
  const getEstadosParaDona = useMemo(() => {
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
  }, [estadosGrafico, COLORS]);

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

      // Datos de ejemplo para servicios por tipo (MOCK - Pendiente Fase 2)
      const serviciosPorTipo = [
        { tipo: 'Instalación', cantidad: Math.round(totalServicios * 0.4), valor: Math.round(totalIngresos * 0.4) },
        { tipo: 'Mantenimiento', cantidad: Math.round(totalServicios * 0.25), valor: Math.round(totalIngresos * 0.25) },
        { tipo: 'Reparación', cantidad: Math.round(totalServicios * 0.2), valor: Math.round(totalIngresos * 0.2) },
        { tipo: 'Revisión', cantidad: Math.round(totalServicios * 0.15), valor: Math.round(totalIngresos * 0.15) }
      ];

      // Datos REALES de clientes (Fase 1 completada)
      // Usamos el estado clientesData que guarda lo que viene del backend
      const clientesRecurrentes = clientesData || [];

      setRealData({
        serviciosPorTipo,
        tendenciaMensual,
        clientesRecurrentes,
        estadosServicio
      });
    }
  }, [analyticsData, estadosGrafico, clientesData]);

  const dataToUse = analyticsData ? realData : {
    serviciosPorTipo: [],
    tendenciaMensual: [],
    clientesRecurrentes: [],
    estadosServicio: []
  };

  const renderGeneralView = () => {
    console.log('🎨 Renderizando vista general');
    const totalServicios = estadosGrafico?.TOTAL_SERVICIOS || 0;
    const totalIngresos = dataToUse.tendenciaMensual.reduce((sum, item) => sum + item.ingresos, 0);
    const serviciosPendientesCobrar = estadosGrafico?.PENDIENTE_COBRAR || 0;
    // Usar el estado nuevo o fallback
    const serviciosPendientesRelacionar = pendientesGlobales.relacionar;

    const efectividad = totalServicios > 0
      ? Math.round((estadosGrafico?.YA_RELACIONADO / totalServicios) * 100)
      : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* KPIs Principales - Usando KpiCard */}
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
            title="Pendientes Cobrar"
            value={serviciosPendientesCobrar.toString()}
            subtitle="Por cobrar"
            color={theme.textoAdvertencia}
          />
          <KpiCard
            title="Pendientes Relacionar"
            value={serviciosPendientesRelacionar.toString()}
            subtitle="Por relacionar"
            color={theme.terminalRojo}
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
            <h3 style={{
              marginBottom: '20px',
              color: theme.textoPrincipal,
              fontSize: '1.1rem',
              borderLeft: `4px solid ${theme.terminalAmarillo}`,
              paddingLeft: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
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
                subtitle="Garantias realizadas"
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
                subtitle="Cotizaciones realizadas"
                color={theme.textoInfo}
              />
            </div>
          </div>
        )}

        {/* Gráfico de Tendencia Mensual */}
        {/* Gráfico de Tendencia Mensual */}
        <div style={{
          background: theme.fondoContenedor,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: `1px solid ${theme.bordePrincipal}`,
          position: 'relative'
        }}>
          <h3 style={{
            marginBottom: '24px',
            color: theme.textoPrincipal,
            fontSize: '1.2rem',
            borderBottom: `1px solid ${theme.bordePrincipal}`,
            paddingBottom: '12px'
          }}>
            Tendencia de Servicios e Ingresos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dataToUse.tendenciaMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
              <XAxis
                dataKey="mes"
                stroke={theme.textoPrincipal}
                tickFormatter={formatMonthAbbreviation}
                tick={{
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              />
              <YAxis yAxisId="left" stroke={theme.textoPrincipal} />
              <YAxis yAxisId="right" orientation="right" stroke={theme.textoPrincipal} />
              <Tooltip
                content={
                  <CustomTooltip
                    formatter={(value, name) => {
                      if (name === 'Ingresos') {
                        return formatCurrency(value);
                      }
                      return value;
                    }}
                  />
                }
              />
              <Legend />
              <Bar yAxisId="left" dataKey="servicios" fill={theme.textoInfo} name="Servicios" maxBarSize={40} radius={[16, 16, 16, 16]} />
              <Line yAxisId="right" type="monotone" dataKey="ingresos" stroke={theme.terminalVerde} strokeWidth={3} name="Ingresos" />
            </ComposedChart>
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
              <BarChart
                data={Object.entries(estadosEspecialesPorMes)
                  .sort(([mesA], [mesB]) => {
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const [mesTextA, yearA] = mesA.split(' ');
                    const [mesTextB, yearB] = mesB.split(' ');
                    if (yearA !== yearB) return yearA.localeCompare(yearB);
                    return meses.indexOf(mesTextA) - meses.indexOf(mesTextB);
                  })
                  .map(([mes, datos]) => ({
                    mes: mes.split(' ')[0],
                    'No Pagaron Domicilio': datos.no_pagaron_domicilio || 0,
                    'Garantía': datos.garantia || 0,
                    'Cancelado': datos.cancelado || 0,
                    'No se Cobra': datos.no_se_cobra_domicilio || 0,
                    'Cotización': datos.cotizacion || 0
                  }))}
                maxBarSize={40}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
                <XAxis
                  dataKey="mes"
                  stroke={theme.textoPrincipal}
                  tickFormatter={formatMonthAbbreviation}
                />
                <YAxis stroke={theme.textoPrincipal} />
                <Tooltip content={<CustomTooltip formatter={(value,) => `${value}`} />} />

                <Legend />
                <Bar dataKey="No Pagaron Domicilio" stackId="a" fill={COLORS.NO_PAGARON_DOMICILIO} radius={[16, 16, 16, 16]} />
                <Bar dataKey="Garantía" stackId="a" fill={COLORS.GARANTIA} radius={[16, 16, 16, 16]} />
                <Bar dataKey="Cancelado" stackId="a" fill={COLORS.CANCELADO} radius={[16, 16, 16, 16]} />
                <Bar dataKey="No se Cobra Domicilio" stackId="a" fill={COLORS.NO_SE_COBRA_DOMICILIO} radius={[16, 16, 16, 16]} />
                <Bar dataKey="Cotización" stackId="a" fill={COLORS.COTIZACION} radius={[16, 16, 16, 16]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de Dona - MATERIAL DESIGN 3 MEJORADO */}
        <div style={{
          background: theme.fondoContenedor,
          borderRadius: '16px',
          padding: '20px',
          boxShadow: theme.sombraComponente,
          border: `2px solid ${theme.bordePrincipal}`,
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .donut-segment:hover {
              filter: brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,0.3));
              transition: all 0.3s ease;
            }
            .legend-item {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .legend-item:hover {
              transform: translateY(-4px) scale(1.02);
              box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
            }
          `}</style>

          <h3 style={{ marginBottom: '24px', color: theme.textoPrincipal, fontSize: '1.2rem', fontWeight: '600' }}>
            Distribución de Estados de Servicios
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={getEstadosParaDona}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                labelLine={false}
                label={false}
                dataKey="cantidad"
                nameKey="estado"
              >
                {getEstadosParaDona.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="donut-segment"
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <CustomTooltip
                    formatter={(value) => {
                      const estadosData = getEstadosParaDona;
                      const total = estadosData.reduce((sum, item) => sum + item.cantidad, 0);
                      const porcentaje = ((value / total) * 100).toFixed(1);
                      return `${value} servicios (${porcentaje}%)`;
                    }}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Leyenda compacta - Badges con elevación */}
          <div style={{
            marginTop: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {getEstadosParaDona.map((item, index) => {
              const total = getEstadosParaDona.reduce((sum, i) => sum + i.cantidad, 0);
              const porcentaje = ((item.cantidad / total) * 100).toFixed(1);

              return (
                <div
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: theme.fondoContenedor,
                    borderRadius: '20px',
                    border: `2px solid ${item.color}`,
                    boxShadow: theme.sombraComponente,
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.sombraHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.sombraComponente;
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      background: item.color,
                      borderRadius: '50%'
                    }}
                  />
                  <span style={{ color: theme.textoPrincipal, fontWeight: '600' }}>
                    {item.estado}
                  </span>
                  <span style={{ color: item.color, fontWeight: '700' }}>
                    {item.cantidad}
                  </span>
                  <span style={{ color: theme.textoSecundario }}>
                    ({porcentaje}%)
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
            <YAxis yAxisId="left" stroke={theme.textoPrincipal} />
            <YAxis yAxisId="right" orientation="right" stroke={theme.textoPrincipal} />
            <Tooltip
              content={
                <CustomTooltip
                  formatter={(value, name) => {
                    if (name === 'Valor Total') {
                      return formatCurrency(value);
                    }
                    return value;
                  }}
                />
              }
            />
            <Legend />
            <Bar yAxisId="left" dataKey="servicios" fill={theme.textoInfo} radius={[16, 16, 16, 16]} name="Servicios" />
            <Bar yAxisId="right" dataKey="valor" fill={theme.terminalVerde} radius={[16, 16, 16, 16]} name="Valor Total" />
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
          {dataToUse.clientesRecurrentes.map((cliente, index) => {
            const colors = [
              theme.terminalAzul,
              theme.terminalVerde,
              theme.terminalMorado,
              theme.terminalRosa,
              theme.terminalAmarillo,
              theme.terminalCyan, // Nuevo
              theme.terminalNaranja, // Nuevo uso
              theme.terminalVerdeNeon
            ];
            // Ciclado de colores seguro
            const color = colors[index % colors.length] || theme.textoInfo;

            return (
              <KpiCard
                key={cliente.cliente}
                title={`${cliente.cliente}`}
                value={formatCurrency(cliente.valor)}
                subtitle={`${cliente.servicios} servicios`}
                color={color}
                valueStyle={{ fontSize: '1rem' }}
              />
            );
          })}
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
        <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>
          Servicios por Tipo
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataToUse.serviciosPorTipo}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
            <XAxis dataKey="tipo" stroke={theme.textoPrincipal} />
            <YAxis yAxisId="left" stroke={theme.textoPrincipal} />
            <YAxis yAxisId="right" orientation="right" stroke={theme.textoPrincipal} />

            <Tooltip
              content={
                <CustomTooltip
                  formatter={(value, name) => {
                    if (name === 'Valor') return formatCurrency(value);
                    if (name === 'Cantidad') return `${value} servicios`;
                    return value;
                  }}
                />
              }
            />

            <Legend />

            {/* Cantidad de servicios (escala izquierda) */}
            <Bar
              yAxisId="left"
              dataKey="cantidad"
              fill={theme.textoInfo}
              radius={[16, 16, 16, 16]}
              name="Cantidad"
            />

            {/* Valor total (escala derecha) */}
            <Bar
              yAxisId="right"
              dataKey="valor"
              fill={theme.terminalVerde}
              radius={[16, 16, 16, 16]}
              name="Valor"
            />
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
      {/* Los botones de navegación ahora están en el Sidebar */}

      {selectedView === 'pendientes-efectivo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ServiciosPendientesEfectivo
            file={file}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
          />
        </div>
      )}
      {selectedView === 'pendientes-cobrar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ServiciosPendientesCobrar
            file={file}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
          />
        </div>
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

  // Si no hay archivo, mostrar mensaje claro y opción para ir al uploader
  if (!file) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        color: theme.textoPrincipal,
        padding: 24
      }}>
        <h2 style={{ marginBottom: 8 }}>No hay datos disponibles</h2>
        <p style={{ color: theme.textoSecundario, marginBottom: 18 }}>Debes cargar un archivo excel primero.</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <CustomButton
            onClick={() => {
              if (onRequestOpenUploader) onRequestOpenUploader('/analytics');
              else window.alert('Navega a /analytics para cargar el archivo');
            }}
            variant="contained"
            color="primary"
          >
            Cargar archivo
          </CustomButton>
        </div>
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

      {/* Los botones de navegación ahora están en el Sidebar, no aquí */}

      <div>
        {selectedView === 'general' && renderGeneralView()}
        {selectedView === 'clientes' && renderClientesView()}
        {selectedView === 'servicios' && renderServiciosView()}
        {selectedView === 'pendientes' && renderPendientesView()}
        {selectedView === 'pendientes-efectivo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ServiciosPendientesEfectivo
              file={file}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
            />
          </div>
        )}
        {selectedView === 'pendientes-cobrar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ServiciosPendientesCobrar
              file={file}
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EnhancedAnalyticsDashboard);