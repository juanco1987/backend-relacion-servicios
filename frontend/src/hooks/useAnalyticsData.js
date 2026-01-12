import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config/appConfig';

const API_BASE = API_CONFIG.BASE_URL;

function useAnalyticsData(analyticsFile, excelData) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendientesData, setPendientesData] = useState({
    total_pendientes_relacionar: 0,
    total_pendientes_cobrar: 0,
    pendientes_por_mes: {}
  });


  useEffect(() => {
    // Usar el archivo específico de Analytics si está disponible, sino usar excelData como fallback
    const fileToUse = analyticsFile || excelData;

    if (!fileToUse) {
      setAnalyticsData(null);
      setPendientesData({
        total_pendientes_relacionar: 0,
        total_pendientes_cobrar: 0,
        pendientes_por_mes: {}
      });
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', fileToUse);

        const response = await fetch(`${API_BASE}/api/analytics`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error al obtener analytics');
        }

        const data = await response.json();

        // Limpiar datos eliminando el campo 'precio'
        const cleanAnalyticsData = { ...data.resumen };
        Object.keys(cleanAnalyticsData).forEach(mes => {
          if (cleanAnalyticsData[mes] && cleanAnalyticsData[mes].precio) {
            delete cleanAnalyticsData[mes].precio;
          }
        });

        setAnalyticsData(cleanAnalyticsData);
        setPendientesData({
          total_pendientes_relacionar: data.total_pendientes_relacionar || 0,
          total_pendientes_cobrar: data.total_pendientes_cobrar || 0,
          pendientes_por_mes: data.pendientes_por_mes || {}
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [analyticsFile, excelData]);

  // Función para filtrar meses válidos - Optimizada con useCallback
  const filterValidMonths = useCallback((analyticsData) => {
    if (!analyticsData) return [];

    return Object.keys(analyticsData)
      .filter(mes => {
        if (!mes) return false;
        const normalizado = mes.trim().toLowerCase();
        return normalizado &&
          normalizado !== 'null' &&
          normalizado !== 'undefined' &&
          normalizado !== 'invalid date' &&
          !/^nat$/i.test(normalizado);
      })
      .sort((a, b) => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const añoA = a.split(' ')[1];
        const añoB = b.split(' ')[1];
        const mesA = meses.indexOf(a.split(' ')[0]);
        const mesB = meses.indexOf(b.split(' ')[0]);
        if (añoA !== añoB) return añoA - añoB;
        return mesA - mesB;
      });
  }, []);

  // Función para preparar datos del gráfico - Optimizada con useCallback
  const prepareChartData = useCallback((analyticsData) => {
    if (!analyticsData) return [];

    return Object.entries(analyticsData)
      .filter(([mes]) => {
        if (!mes) return false;
        const normalizado = mes.trim().toLowerCase();
        return normalizado &&
          normalizado !== 'null' &&
          normalizado !== 'undefined' &&
          normalizado !== 'invalid date' &&
          !/^nat$/i.test(normalizado);
      })
      .sort(([mesA], [mesB]) => {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const añoA = mesA.split(' ')[1];
        const añoB = mesB.split(' ')[1];
        const mesIndexA = meses.indexOf(mesA.split(' ')[0]);
        const mesIndexB = meses.indexOf(mesB.split(' ')[0]);

        if (añoA !== añoB) return añoA - añoB;
        return mesIndexA - mesIndexB;
      })
      .map(([mes, datos]) => ({
        mes,
        Efectivo: Number(datos?.efectivo_total || 0),
        Transferencia: Number(datos?.transferencia_total || 0),
        'Total General': Number(datos?.total_general || 0),
        efectivo_cantidad: Number(datos?.efectivo_cantidad || 0),
        transferencia_cantidad: Number(datos?.transferencia_cantidad || 0)
      }));
  }, []);

  // Función para calcular totales globales - Optimizada con useCallback
  const calculateGlobalTotals = useCallback((dataGrafica) => {
    return dataGrafica.reduce((acc, item) => ({
      efectivo_total: acc.efectivo_total + item.Efectivo,
      transferencia_total: acc.transferencia_total + item.Transferencia,
      total_general: acc.total_general + item['Total General'],
      efectivo_cantidad: acc.efectivo_cantidad + item.efectivo_cantidad,
      transferencia_cantidad: acc.transferencia_cantidad + item.transferencia_cantidad
    }), {
      efectivo_total: 0,
      transferencia_total: 0,
      total_general: 0,
      efectivo_cantidad: 0,
      transferencia_cantidad: 0
    });
  }, []);

  return {
    analyticsData,
    loading,
    pendientesData,
    filterValidMonths,
    prepareChartData,
    calculateGlobalTotals
  };
}

export default useAnalyticsData;
