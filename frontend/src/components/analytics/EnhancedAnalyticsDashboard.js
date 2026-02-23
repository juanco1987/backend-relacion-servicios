import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/numberFormatters';
import { formatMonthAbbreviation } from '../../utils/dateFormatters';
import KpiCard from '../common/KpiCard';
import CustomButton from '../common/CustomButton/index';
import CustomTooltip from '../common/CustomTooltip';
import ServiciosPendientesEfectivo from './ServiciosPendientesEfectivo';
import ServiciosPendientesCobrar from './ServiciosPendientesCobrar';
import { API_CONFIG } from '../../config/appConfig';

// Función para formatear números de forma compacta (30k, 3M, etc)
const formatCompactNumber = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString();
};

const API_BASE = API_CONFIG.BASE_URL;
const EnhancedAnalyticsDashboard = ({ file, fechaInicio, fechaFin, defaultView = 'general', onRequestOpenUploader }) => {
  const { theme } = useTheme();
  const [selectedView, setSelectedView] = useState(defaultView);
  // Actualizar selectedView cuando cambie defaultView
  useEffect(() => {
    setSelectedView(defaultView);
  }, [defaultView]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [estadosGrafico, setEstadosGrafico] = useState(null);
  const [totalesEstadosEspeciales, setTotalesEstadosEspeciales] = useState(null);
  const [estadosEspecialesPorMes, setEstadosEspecialesPorMes] = useState(null);
  const [clientesData, setClientesData] = useState([]);
  const [tiemposRelacion, setTiemposRelacion] = useState(null); // Nuevo estado para tiempos de relación
  const [recaudacionPorMes, setRecaudacionPorMes] = useState(null); // Recaudación mensual por fecha de relación
  const [efectivoPendienteInfo, setEfectivoPendienteInfo] = useState(null); // Información de efectivo pendiente
  const [loading, setLoading] = useState(false);
  const [periodoDatos, setPeriodoDatos] = useState({ inicio: null, fin: null }); // Estado para las fechas dinámicas

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
        // Guardar tiempos de relación
        setTiemposRelacion(data.tiempos_relacion || null);
        // Guardar recaudación por mes
        setRecaudacionPorMes(data.recaudacion_por_mes || null);
        // Guardar información de efectivo pendiente
        setEfectivoPendienteInfo(data.efectivo_pendiente_info || null);

        // Extraer fechas dinámicas del resumen
        if (data.resumen && Object.keys(data.resumen).length > 0) {
          const mesesValidos = Object.keys(data.resumen)
            .filter(mes => {
              if (!mes) return false;
              const normalizado = mes.trim().toLowerCase();
              return normalizado &&
                normalizado !== 'null' &&
                normalizado !== 'undefined' &&
                normalizado !== 'invalid date' &&
                !/^nat$/i.test(normalizado);
            });

          if (mesesValidos.length > 0) {
            const mesesOrdenados = mesesValidos.sort((a, b) => {
              const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
              const partsA = a.split(' ');
              const partsB = b.split(' ');
              const yearA = partsA[1] || '';
              const yearB = partsB[1] || '';
              const monthA = meses.indexOf(partsA[0]);
              const monthB = meses.indexOf(partsB[0]);
              if (yearA !== yearB) return yearA - yearB;
              return monthA - monthB;
            });

            const primerMes = mesesOrdenados[0]; // "Enero 2026"
            const ultimoMes = mesesOrdenados[mesesOrdenados.length - 1]; // "Diciembre 2026"

            // Extraer año y mes
            const [, yearInicio] = primerMes.split(' ');
            const [, yearFin] = ultimoMes.split(' ');

            setPeriodoDatos({
              inicio: `${yearInicio}-01-01`,
              fin: `${yearFin}-12-31`
            });
          }
        }

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
        estadosServicio,
        tiemposRelacion
      });
    }
  }, [analyticsData, estadosGrafico, clientesData, tiemposRelacion]);
  const dataToUse = analyticsData ? realData : {
    serviciosPorTipo: [],
    tendenciaMensual: [],
    clientesRecurrentes: [],
    estadosServicio: []
  };
  const renderGeneralView = () => {
    console.log('🎨 Renderizando vista general');
    const totalServicios = estadosGrafico?.TOTAL_SERVICIOS || 0;
    const serviciosFacturables = estadosGrafico?.SERVICIOS_FACTURABLES || 0;
    const totalIngresos = dataToUse.tendenciaMensual.reduce((sum, item) => sum + item.ingresos, 0);
    const serviciosPendientesCobrar = estadosGrafico?.PENDIENTE_COBRAR || 0;

    // Calcular totales de efectivo relacionado y pendiente
    let totalEfectivoRelacionado = 0;
    let totalEfectivoPendiente = 0;
    let cantidadEfectivoRelacionado = 0;
    let cantidadEfectivoPendiente = 0;

    let totalEfectivoTotalJG = 0;
    if (analyticsData) {
      Object.values(analyticsData).forEach(mesData => {
        totalEfectivoRelacionado += mesData.efectivo_relacionado || 0;
        totalEfectivoPendiente += mesData.efectivo_pendiente_relacionar || 0;
        totalEfectivoTotalJG += mesData.efectivo_total_jg || 0;
        cantidadEfectivoRelacionado += mesData.efectivo_relacionado_cantidad || 0;
        cantidadEfectivoPendiente += mesData.efectivo_pendiente_cantidad || 0;
      });
    }

    // Obtener deuda a Abrecar desde efectivoPendienteInfo o calcular desde analyticsData
    const totalDeudaAbrecar =
      (analyticsData ? Object.values(analyticsData).reduce((sum, mesData) =>
        sum + (mesData.deuda_abrecar_pendiente || 0), 0) : 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.5s ease-in' }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* BLOQUE A: Tablero Financiero (Nivel Gerencial) */}
        <div>
          <h3 style={{ marginBottom: '16px', color: theme.terminalVerdeNeon, borderLeft: `4px solid ${theme.terminalVerdeNeon}`, paddingLeft: '12px', fontSize: '1.1rem', fontWeight: '700' }}>
            📊 Resumen Financiero
          </h3>
          <p style={{ marginBottom: '20px', color: theme.textoSecundario, fontSize: '0.9rem' }}>
            Indicadores clave del desempeño financiero en el período
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <KpiCard
              title="Ingresos Totales"
              value={formatCurrency(totalIngresos)}
              subtitle="Dinero real generado"
              color={theme.terminalVerde}
            />
            <KpiCard
              title="Servicios Facturables"
              value={serviciosFacturables.toString()}
              subtitle="Servicios exitosos (sin garantías/cancelados)"
              color={theme.textoInfo}
            />
            <KpiCard
              title="Pendientes Cobrar"
              value={serviciosPendientesCobrar.toString()}
              subtitle="Cartera pendiente"
              color={theme.textoAdvertencia}
            />
          </div>
        </div>

        {/* BLOQUE B: Centro de Control de Efectivo */}
        {(totalEfectivoRelacionado > 0 || totalEfectivoPendiente > 0) && (
          <div>
            <h3 style={{
              marginBottom: '20px',
              color: theme.terminalVerdeNeon,
              fontSize: '1.1rem',
              borderLeft: `4px solid ${theme.terminalVerdeNeon}`,
              paddingLeft: '12px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: '700'
            }}>
              💵 Control de Efectivo
            </h3>
            <p style={{ marginBottom: '20px', color: theme.textoSecundario, fontSize: '0.9rem' }}>
              Seguimiento detallado de cobros en efectivo y entregas a ABRECAR
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <KpiCard
                title="Efectivo Recaudado"
                value={formatCurrency(totalEfectivoTotalJG)}
                subtitle={`${cantidadEfectivoRelacionado + cantidadEfectivoPendiente} servicios en efectivo`}
                color={theme.terminalEsmeralda}
              />
              <KpiCard
                title="Efectivo Relacionado"
                value={formatCurrency(totalEfectivoRelacionado)}
                subtitle={`${cantidadEfectivoRelacionado} servicios entregados`}
                color={theme.terminalVerde}
              />
              <KpiCard
                title="Efectivo Pendiente"
                value={formatCurrency(totalEfectivoPendiente)}
                subtitle={`${cantidadEfectivoPendiente} servicios por entregar`}
                color={theme.terminalAmarillo}
              />
            </div>

            {/* Advertencia sobre Deuda a Abrecar */}
            {totalDeudaAbrecar > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '16px 20px',
                background: `linear-gradient(135deg, ${theme.terminalRojo}15 0%, ${theme.terminalAmarillo}15 100%)`,
                borderRadius: '12px',
                border: `1px solid ${theme.terminalRojo}40`,
                boxShadow: theme.sombraComponente
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <h4 style={{
                    margin: 0,
                    color: theme.terminalRojo,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    Acción Requerida: Entregar Efectivo a ABRECAR
                  </h4>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <p style={{
                      margin: '4px 0',
                      color: theme.textoPrincipal,
                      fontSize: '0.95rem'
                    }}>
                      Tienes <strong style={{ color: theme.terminalRojo, fontSize: '1.2rem' }}>{formatCurrency(totalDeudaAbrecar)}</strong> pendientes de entrega.
                    </p>
                    <p style={{
                      margin: '4px 0',
                      color: theme.textoSecundario,
                      fontSize: '0.85rem'
                    }}>
                      Corresponden a {cantidadEfectivoPendiente} servicios cobrados en efectivo pero no relacionados.
                    </p>
                  </div>
                  <CustomButton
                    onClick={() => {
                      window.location.hash = '#/dashboard/pendientes/efectivo';
                      setSelectedView('pendientes-efectivo');
                    }}
                    variant="contained"
                    color="error"
                  >
                    Gestionar Entrega
                  </CustomButton>
                </div>
              </div>
            )}

            {/* Mensaje de Felicitación - Sin Deuda */}
            {totalDeudaAbrecar === 0 && (totalEfectivoRelacionado > 0 || totalEfectivoPendiente > 0) && (
              <div style={{
                marginTop: '20px',
                padding: '16px 20px',
                background: `linear-gradient(135deg, ${theme.terminalVerde}15 0%, ${theme.terminalEsmeralda}15 100%)`,
                borderRadius: '12px',
                border: `1px solid ${theme.terminalVerde}40`,
                boxShadow: theme.sombraComponente
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>✅</span>
                  <h4 style={{
                    margin: 0,
                    color: theme.terminalVerde,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}>
                    EXCELENTE - Estás al día en la relación de servicios en efectivo
                  </h4>
                </div>
                <p style={{
                  margin: '8px 0 0 0',
                  color: theme.textoSecundario,
                  fontSize: '0.9rem'
                }}>
                  Todos los cobros en efectivo han sido entregados a ABRECAR correctamente.
                </p>
              </div>
            )}
          </div>
        )}

        {/* BLOQUE C: Auditoría Operativa (El "Ruido" separado) */}
        {totalesEstadosEspeciales && (
          <div style={{ paddingTop: '16px', borderTop: `1px dashed ${theme.bordePrincipal}` }}>
            <h3 style={{
              marginBottom: '20px',
              color: theme.terminalVerdeNeon,
              fontSize: '1.0rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '700'
            }}>
              📋 Auditoría Operativa & Excepciones
            </h3>
            <p style={{ marginBottom: '20px', color: theme.textoSecundario, fontSize: '0.9rem' }}>
              Análisis de servicios con estados especiales que requieren revisión
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {/* Total Registros como contexto */}
              <KpiCard
                title="Registros Totales en Excel"
                value={totalServicios.toString()}
                subtitle="Contexto general"
                color={theme.terminalCyan}
              />

              {/* Tarjetas más compactas para excepciones */}
              <KpiCard
                title="Garantías"
                value={totalesEstadosEspeciales.garantia?.toString() || '0'}
                subtitle="Revisar calidad"
                color={theme.terminalAmarillo}
              />
              <KpiCard
                title="Cancelados"
                value={totalesEstadosEspeciales.cancelado?.toString() || '0'}
                subtitle="Servicios perdidos"
                color={theme.terminalRojo}
              />
              <KpiCard
                title="No Pagaron Domicilio"
                value={totalesEstadosEspeciales.no_pagaron_domicilio?.toString() || '0'}
                subtitle="Fuga de ingresos"
                color={theme.terminalRojo}
              />
              <KpiCard
                title="Cotizaciones"
                value={totalesEstadosEspeciales.cotizacion?.toString() || '0'}
                subtitle="Solo consulta"
                color={theme.terminalMorado}
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
          border: `2px solid ${theme.bordePrincipal}`,
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
              <YAxis yAxisId="left" stroke={theme.textoPrincipal} tickFormatter={formatCompactNumber} />
              <YAxis yAxisId="right" orientation="right" stroke={theme.textoPrincipal} tickFormatter={formatCompactNumber} />
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
            border: `2px solid ${theme.bordePrincipal}`
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
                <YAxis stroke={theme.textoPrincipal} tickFormatter={formatCompactNumber} />
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

        {/* Gráfico de Recaudación Mensual por Fecha de Relación */}
        {recaudacionPorMes && Object.keys(recaudacionPorMes).length > 0 && (
          <div style={{
            background: theme.fondoContenedor,
            borderRadius: '16px',
            padding: '16px',
            boxShadow: theme.sombraComponente,
            border: `2px solid ${theme.bordePrincipal}`,
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <h3 style={{
              marginBottom: '8px',
              color: theme.terminalVerdeNeon,
              fontSize: '1.2rem',
              fontWeight: 700
            }}>
              💰 Recaudación Mensual por Fecha de Pago
            </h3>
            <p style={{
              marginBottom: '16px',
              color: theme.textoSecundario,
              fontSize: '0.85rem'
            }}>
              Análisis detallado de ingresos cobrados y servicios procesados por período
            </p>
            <ResponsiveContainer width="100%" height={450}>
              {(() => {
                // Procesar y ordenar datos
                const datosOrdenados = Object.entries(recaudacionPorMes)
                  .map(([mes, datos]) => {
                    const partes = mes.split(' ');
                    return {
                      mes: partes[0],
                      año: partes[1] || '',
                      mesCompleto: mes,
                      recaudado: datos.total_recaudado || 0,
                      servicios: datos.cantidad_servicios || 0
                    };
                  })
                  .sort((a, b) => {
                    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const añoA = parseInt(a.año) || 0;
                    const añoB = parseInt(b.año) || 0;
                    const mesA = meses.indexOf(a.mes);
                    const mesB = meses.indexOf(b.mes);
                    if (añoA !== añoB) return añoA - añoB;
                    return mesA - mesB;
                  });

                // Detectar si hay múltiples años
                const añosUnicos = [...new Set(datosOrdenados.map(d => d.año))];
                const hayMultiplesAños = añosUnicos.length > 1;

                // Formatear etiquetas del eje X
                const datosParaGrafico = datosOrdenados.map(d => ({
                  ...d,
                  etiquetaEje: hayMultiplesAños
                    ? `${formatMonthAbbreviation(d.mes)} ${d.año}`
                    : formatMonthAbbreviation(d.mes)
                }));

                return (
                  <ComposedChart
                    data={datosParaGrafico}
                    margin={{ top: 20, right: 10, left: 10, bottom: hayMultiplesAños ? 60 : 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
                    <XAxis
                      dataKey="etiquetaEje"
                      stroke={theme.textoPrincipal}
                      tick={{
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }}
                      angle={hayMultiplesAños ? -45 : 0}
                      textAnchor={hayMultiplesAños ? 'end' : 'middle'}
                      height={hayMultiplesAños ? 80 : 30}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke={theme.textoPrincipal}
                      tick={{ fontSize: '0.85rem' }}
                      tickFormatter={formatCompactNumber}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={theme.textoPrincipal}
                      tick={{ fontSize: '0.85rem' }}
                      tickFormatter={formatCompactNumber}
                    />
                    <Tooltip
                      content={
                        <CustomTooltip
                          labelFormatter={(label) => {
                            // El label viene como "Ene 2024" o "Ene" dependiendo de si hay múltiples años
                            return label;
                          }}
                          formatter={(value, name) => {
                            if (name === 'Recaudado') {
                              return formatCurrency(value);
                            }
                            if (name === 'Servicios') {
                              return `${value} servicios`;
                            }
                            return value;
                          }}
                        />
                      }
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="recaudado"
                      fill={theme.terminalVerde}
                      name="Recaudado"
                      maxBarSize={50}
                      radius={[16, 16, 16, 16]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="servicios"
                      stroke={theme.terminalCyan}
                      strokeWidth={3}
                      name="Servicios"
                      dot={{ fill: theme.terminalCyan, r: 4 }}
                    />
                  </ComposedChart>
                );
              })()}
            </ResponsiveContainer>

            {/* Resumen de totales */}
            <div style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              paddingTop: '20px',
              borderTop: `1px solid ${theme.bordePrincipal}`
            }}>
              {(() => {
                const totalRecaudado = Object.values(recaudacionPorMes).reduce(
                  (sum, datos) => sum + (datos.total_recaudado || 0), 0
                );
                const totalServicios = Object.values(recaudacionPorMes).reduce(
                  (sum, datos) => sum + (datos.cantidad_servicios || 0), 0
                );
                const promedioMensual = totalRecaudado / Object.keys(recaudacionPorMes).length;

                return (
                  <>
                    <KpiCard
                      title="Total Recaudado"
                      value={formatCurrency(totalRecaudado)}
                      subtitle="Ingresos por relación"
                      color={theme.terminalVerde}
                    />
                    <KpiCard
                      title="Total Servicios Pagados"
                      value={totalServicios.toString()}
                      subtitle="Cantidad cobrada"
                      color={theme.terminalCyan}
                    />
                    <KpiCard
                      title="Promedio Mensual"
                      value={formatCurrency(promedioMensual)}
                      subtitle="Media por mes"
                      color={theme.textoInfo}
                    />
                  </>
                );
              })()}
            </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-in' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>Análisis de Clientes</h2>
      <div style={{
        background: theme.fondoContenedor,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: theme.sombraComponente,
        border: `2px solid ${theme.bordePrincipal}`
      }}>
        <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>Clientes por Tipo</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataToUse.clientesRecurrentes}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
            <XAxis dataKey="cliente" stroke={theme.textoPrincipal} />
            <YAxis yAxisId="left" stroke={theme.textoPrincipal} tickFormatter={formatCompactNumber} />
            <YAxis yAxisId="right" orientation="right" stroke={theme.textoPrincipal} tickFormatter={formatCompactNumber} />
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
        border: `2px solid ${theme.bordePrincipal}`
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-in' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <h2 style={{ color: theme.textoPrincipal, textAlign: 'center' }}>Análisis de Servicios</h2>
      <div style={{
        background: theme.fondoContenedor,
        borderRadius: '16px',
        padding: '20px',
        boxShadow: theme.sombraComponente,
        border: `2px solid ${theme.bordePrincipal}`
      }}>
        <h3 style={{ marginBottom: '20px', color: theme.textoPrincipal }}>
          Servicios por Tipo
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataToUse.serviciosPorTipo}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.bordePrincipal} />
            <XAxis dataKey="tipo" stroke={theme.textoPrincipal} />
            <YAxis yAxisId="left" stroke={theme.textoPrincipal} tickFormatter={formatCompactNumber} />
            <YAxis yAxisId="right" orientation="right" stroke={theme.textoPrincipal} tickFormatter={formatCompactNumber} />
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
          title="Tiempo Promedio de Cobro"
          value={dataToUse.tiemposRelacion ? `${dataToUse.tiemposRelacion.promedio_dias} días` : 'N/A'}
          subtitle={dataToUse.tiemposRelacion ? `Min: ${dataToUse.tiemposRelacion.min_dias} - Max: ${dataToUse.tiemposRelacion.max_dias}` : 'Sin datos'}
          color={theme.textoInfo}
        />

        <KpiCard
          title="Eficiencia de Cobro"
          value={dataToUse.tiemposRelacion ? `${Math.round((dataToUse.tiemposRelacion.distribucion.rapido / dataToUse.tiemposRelacion.total_analizados) * 100)}%` : 'N/A'}
          subtitle="Cobrados en < 7 días"
          color={theme.terminalVerde}
        />
        <KpiCard
          title="Valor Promedio"
          value={formatCurrency(dataToUse.kpis_servicios?.valor_promedio || 0)}
          subtitle="Por servicio"
          color={theme.terminalVerde}
        />
      </div>
    </div>
  );
  const renderPendientesView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease-in' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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
      {/* Título dinámico según vista */}
      {(() => {
        const titles = {
          'general': '📊 Análisis de Servicios',
          'clientes': '👥 Análisis de Clientes',
          'servicios': '🔧 Desglose de Servicios',
          'pendientes': '⏳ Gestión de Pendientes',
          'pendientes-efectivo': '💵 Pendientes de Entrega',
          'pendientes-cobrar': '💰 Pendientes de Cobro'
        };
        return (
          <>
            <h1 style={{
              textAlign: 'center',
              marginBottom: '8px',
              color: theme.textoPrincipal,
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              {titles[selectedView] || '📊 Dashboard Analytics'}
            </h1>
            <p style={{
              textAlign: 'center',
              marginBottom: '30px',
              color: theme.textoSecundario,
              fontSize: '14px',
              fontWeight: 'normal'
            }}>
              {periodoDatos.inicio && periodoDatos.fin ? `Datos del período: ${periodoDatos.inicio} - ${periodoDatos.fin}` : 'Cargando datos del período...'}
            </p>
          </>
        );
      })()}
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