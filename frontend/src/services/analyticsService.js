// Servicio para procesar datos Excel y generar análisis


export class AnalyticsService {
  constructor() {
    this.dataCache = new Map();
  }

  // Procesar archivo Excel y extraer datos analíticos
  async processExcelData(file, fechaInicio, fechaFin, workMode) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fecha_inicio', fechaInicio);
      formData.append('fecha_fin', fechaFin);
      formData.append('work_mode', workMode);
      formData.append('analytics', 'true'); // Flag para indicar que queremos datos analíticos

      const response = await fetch('http://localhost:5000/api/analytics', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return this.transformDataForAnalytics(result.data, workMode);
    } catch (error) {
      console.error('Error procesando datos para analytics:', error);
      throw error;
    }
  }

  // Transformar datos del backend en formato para gráficos
  transformDataForAnalytics(rawData, workMode) {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
      return this.getEmptyAnalytics();
    }

    const analytics = {
      serviciosPorMes: this.calculateServicesByMonth(rawData),
      serviciosPorCategoria: this.calculateServicesByCategory(rawData, workMode),
      estadoServicios: this.calculateServicesByStatus(rawData, workMode),
      kpis: this.calculateKPIs(rawData, workMode),
      tendencias: this.calculateTrends(rawData),
      detalles: this.getDetailedStats(rawData, workMode)
    };

    return analytics;
  }

  // Calcular servicios por mes
  calculateServicesByMonth(data) {
    const monthData = {};
    
    data.forEach(item => {
      const fecha = new Date(item.fecha || item.Fecha || item.FECHA);
      const monthKey = fecha.toLocaleDateString('es-ES', { month: 'short' });
      const year = fecha.getFullYear();
      const key = `${monthKey} ${year}`;
      
      if (!monthData[key]) {
        monthData[key] = {
          mes: monthKey,
          servicios: 0,
          ingresos: 0,
          pendientes: 0,
          completados: 0
        };
      }
      
      monthData[key].servicios++;
      
      // Calcular ingresos (asumiendo que hay un campo de precio/monto)
      const precio = parseFloat(item.precio || item.Precio || item.PRECIO || item.monto || item.Monto || item.MONTO || 0);
      monthData[key].ingresos += precio;
      
      // Determinar estado
      const estado = (item.estado || item.Estado || item.ESTADO || '').toLowerCase();
      if (estado.includes('pendiente') || estado.includes('no pagado')) {
        monthData[key].pendientes++;
      } else {
        monthData[key].completados++;
      }
    });

    return Object.values(monthData).sort((a, b) => {
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return months.indexOf(a.mes.toLowerCase()) - months.indexOf(b.mes.toLowerCase());
    });
  }

  // Calcular servicios por categoría
  calculateServicesByCategory(data, workMode) {
    const categories = {};
    
    data.forEach(item => {
      // Determinar categoría basada en el tipo de servicio
      let categoria = this.determineCategory(item, workMode);
      
      if (!categories[categoria]) {
        categories[categoria] = {
          categoria: categoria,
          cantidad: 0,
          ingresos: 0,
          porcentaje: 0
        };
      }
      
      categories[categoria].cantidad++;
      const precio = parseFloat(item.precio || item.Precio || item.PRECIO || item.monto || item.Monto || item.MONTO || 0);
      categories[categoria].ingresos += precio;
    });

    // Calcular porcentajes
    const total = data.length;
    Object.values(categories).forEach(cat => {
      cat.porcentaje = Math.round((cat.cantidad / total) * 100);
    });

    return Object.values(categories).sort((a, b) => b.cantidad - a.cantidad);
  }

  // Determinar categoría del servicio
  determineCategory(item, workMode) {
    const servicio = (item.servicio || item.Servicio || item.SERVICIO || item.descripcion || item.Descripcion || item.DESCRIPCION || '').toLowerCase();
    const tipo = (item.tipo || item.Tipo || item.TIPO || '').toLowerCase();
    
    // Palabras clave para categorizar
    if (servicio.includes('mantenimiento') || servicio.includes('manten') || tipo.includes('mantenimiento')) {
      return 'Mantenimientos';
    }
    if (servicio.includes('puerta') || servicio.includes('vidrio') || servicio.includes('cristal')) {
      return 'Puertas Vidrio';
    }
    if (servicio.includes('automatismo') || servicio.includes('motor') || servicio.includes('electrico')) {
      return 'Automatismos';
    }
    if (servicio.includes('cerrajeria') || servicio.includes('llave') || servicio.includes('cerradura')) {
      return 'Cerrajería';
    }
    if (servicio.includes('reparacion') || servicio.includes('reparar') || servicio.includes('arreglo')) {
      return 'Reparaciones';
    }
    if (servicio.includes('instalacion') || servicio.includes('instalar') || servicio.includes('colocar')) {
      return 'Instalaciones';
    }
    
    return 'Otros Servicios';
  }

  // Calcular servicios por estado
  calculateServicesByStatus(data, workMode) {
    const statusCount = {
      'Completados': { cantidad: 0, color: 'success' },
      'Pendientes': { cantidad: 0, color: 'warning' },
      'Cotizados': { cantidad: 0, color: 'info' },
      'Cancelados': { cantidad: 0, color: 'error' }
    };

    data.forEach(item => {
      const estado = (item.estado || item.Estado || item.ESTADO || '').toLowerCase();
      const pago = (item.pago || item.Pago || item.PAGO || '').toLowerCase();
      
      if (estado.includes('completado') || estado.includes('finalizado') || pago.includes('pagado') || pago.includes('si')) {
        statusCount['Completados'].cantidad++;
      } else if (estado.includes('pendiente') || estado.includes('no pagado') || pago.includes('no') || pago.includes('pendiente')) {
        statusCount['Pendientes'].cantidad++;
      } else if (estado.includes('cotizado') || estado.includes('presupuesto')) {
        statusCount['Cotizados'].cantidad++;
      } else if (estado.includes('cancelado') || estado.includes('anulado')) {
        statusCount['Cancelados'].cantidad++;
      } else {
        // Por defecto, si no está claro, lo consideramos pendiente
        statusCount['Pendientes'].cantidad++;
      }
    });

    return Object.entries(statusCount)
      .map(([estado, data]) => ({ estado, ...data }))
      .filter(item => item.cantidad > 0);
  }

  // Calcular KPIs principales
  calculateKPIs(data, workMode) {
    const totalServicios = data.length;
    const totalIngresos = data.reduce((sum, item) => {
      return sum + parseFloat(item.precio || item.Precio || item.PRECIO || item.monto || item.Monto || item.MONTO || 0);
    }, 0);
    
    const serviciosCompletados = data.filter(item => {
      const estado = (item.estado || item.Estado || item.ESTADO || '').toLowerCase();
      const pago = (item.pago || item.Pago || item.PAGO || '').toLowerCase();
      return estado.includes('completado') || estado.includes('finalizado') || pago.includes('pagado') || pago.includes('si');
    }).length;
    
    const serviciosPendientes = data.filter(item => {
      const estado = (item.estado || item.Estado || item.ESTADO || '').toLowerCase();
      const pago = (item.pago || item.Pago || item.PAGO || '').toLowerCase();
      return estado.includes('pendiente') || estado.includes('no pagado') || pago.includes('no') || pago.includes('pendiente');
    }).length;
    
    const tasaCompletado = totalServicios > 0 ? Math.round((serviciosCompletados / totalServicios) * 100) : 0;

    return {
      totalServicios,
      totalIngresos: Math.round(totalIngresos),
      serviciosPendientes,
      tasaCompletado,
      promedioPorServicio: totalServicios > 0 ? Math.round(totalIngresos / totalServicios) : 0
    };
  }

  // Calcular tendencias
  calculateTrends(data) {
    if (data.length < 2) return null;

    // Agrupar por mes y calcular tendencias
    const monthlyData = this.calculateServicesByMonth(data);
    
    if (monthlyData.length < 2) return null;

    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const serviciosGrowth = previousMonth.servicios > 0 
      ? Math.round(((lastMonth.servicios - previousMonth.servicios) / previousMonth.servicios) * 100)
      : 0;
    
    const ingresosGrowth = previousMonth.ingresos > 0 
      ? Math.round(((lastMonth.ingresos - previousMonth.ingresos) / previousMonth.ingresos) * 100)
      : 0;

    return {
      serviciosGrowth,
      ingresosGrowth,
      trend: serviciosGrowth > 0 ? 'up' : serviciosGrowth < 0 ? 'down' : 'stable'
    };
  }

  // Obtener estadísticas detalladas
  getDetailedStats(data, workMode) {
    const stats = {
      mejorMes: null,
      peorMes: null,
      categoriaMasRentable: null,
      categoriaMenosRentable: null,
      serviciosRecientes: [],
      serviciosUrgentes: []
    };

    // Encontrar mejor y peor mes
    const monthlyData = this.calculateServicesByMonth(data);
    if (monthlyData.length > 0) {
      stats.mejorMes = monthlyData.reduce((max, month) => 
        month.ingresos > max.ingresos ? month : max
      );
      stats.peorMes = monthlyData.reduce((min, month) => 
        month.ingresos < min.ingresos ? month : min
      );
    }

    // Encontrar categorías más y menos rentables
    const categoryData = this.calculateServicesByCategory(data, workMode);
    if (categoryData.length > 0) {
      stats.categoriaMasRentable = categoryData[0];
      stats.categoriaMenosRentable = categoryData[categoryData.length - 1];
    }

    // Servicios recientes (últimos 5)
    stats.serviciosRecientes = data
      .sort((a, b) => new Date(b.fecha || b.Fecha || b.FECHA) - new Date(a.fecha || a.Fecha || a.FECHA))
      .slice(0, 5);

    // Servicios urgentes (pendientes recientes)
    stats.serviciosUrgentes = data
      .filter(item => {
        const estado = (item.estado || item.Estado || item.ESTADO || '').toLowerCase();
        return estado.includes('pendiente') || estado.includes('urgente');
      })
      .sort((a, b) => new Date(b.fecha || b.Fecha || b.FECHA) - new Date(a.fecha || a.Fecha || a.FECHA))
      .slice(0, 5);

    return stats;
  }

  // Datos vacíos para cuando no hay datos
  getEmptyAnalytics() {
    return {
      serviciosPorMes: [],
      serviciosPorCategoria: [],
      estadoServicios: [],
      kpis: {
        totalServicios: 0,
        totalIngresos: 0,
        serviciosPendientes: 0,
        tasaCompletado: 0,
        promedioPorServicio: 0
      },
      tendencias: null,
      detalles: {
        mejorMes: null,
        peorMes: null,
        categoriaMasRentable: null,
        categoriaMenosRentable: null,
        serviciosRecientes: [],
        serviciosUrgentes: []
      }
    };
  }

  // Limpiar caché
  clearCache() {
    this.dataCache.clear();
  }
}

export default new AnalyticsService(); 