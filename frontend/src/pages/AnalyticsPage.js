import React, { useEffect, useState } from 'react';
import AnalyticsResumen from '../components/AnalyticsResumen';
import ServiciosPendientesEfectivo from '../components/ServiciosPendientesEfectivo';
import ServiciosPendientesCobrar from '../components/ServiciosPendientesCobrar';
// Si usas recharts para el gráfico de barras:
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState('2024-12-31');
  const [reporteActivo, setReporteActivo] = useState('efectivo');

  useEffect(() => {
    // Aquí deberías hacer el fetch real a tu backend
    fetch('http://localhost:5000/analytics', { method: 'POST' /*, body: formData, etc. */ })
      .then(res => res.json())
      .then(data => setAnalyticsData(data.resumen));
  }, []);

  const meses = analyticsData ? Object.keys(analyticsData) : [];
  const datosMes = mesSeleccionado && analyticsData ? analyticsData[mesSeleccionado] : null;

  // Depuración: ver qué llega como datosMes
  console.log('datosMes:', datosMes);

  // Preparar datos para el gráfico de barras
  const dataBar = analyticsData
    ? Object.entries(analyticsData).map(([mes, datos]) => ({
        mes,
        efectivo: Number(datos?.efectivo_total ?? 0),
        transferencia: Number(datos?.transferencia_total ?? 0),
        total: Number(datos?.total_general ?? 0),
      }))
    : [];

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Análisis de Ingresos por Mes</h1>
      
      {/* Selector de archivo y fechas */}
      <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
        <h3>Configuración de Análisis</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label>Archivo Excel: </label>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
          <div>
            <label>Fecha Inicio: </label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
          <div>
            <label>Fecha Fin: </label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Botones para alternar reportes */}
      <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        <button
          onClick={() => setReporteActivo('efectivo')}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '20px',
            border: 'none',
            background: reporteActivo === 'efectivo' ? '#ffa500' : '#f0f0f0',
            color: reporteActivo === 'efectivo' ? '#fff' : '#333',
            fontWeight: 'bold',
            boxShadow: reporteActivo === 'efectivo' ? '0 2px 8px #ffa50044' : 'none',
            cursor: 'pointer'
          }}
        >
          Servicios Pendientes en Efectivo
        </button>
        <button
          onClick={() => setReporteActivo('cobrar')}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '20px',
            border: 'none',
            background: reporteActivo === 'cobrar' ? '#ffa500' : '#f0f0f0',
            color: reporteActivo === 'cobrar' ? '#fff' : '#333',
            fontWeight: 'bold',
            boxShadow: reporteActivo === 'cobrar' ? '0 2px 8px #ffa50044' : 'none',
            cursor: 'pointer'
          }}
        >
          Servicios Pendientes por Cobrar
        </button>
      </div>

      {/* Renderizado condicional de los reportes */}
      {reporteActivo === 'efectivo' && (
        <ServiciosPendientesEfectivo
          file={selectedFile}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )}
      {reporteActivo === 'cobrar' && (
        <ServiciosPendientesCobrar
          file={selectedFile}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      )}

      {/* Menú desplegable de meses */}
      <div style={{ margin: '1rem 0' }}>
        <label>Selecciona un mes: </label>
        <select value={mesSeleccionado} onChange={e => setMesSeleccionado(e.target.value)}>
          <option value="">Todos</option>
          {meses.map(mes => (
            <option key={mes} value={mes}>{mes}</option>
          ))}
        </select>
      </div>

      {/* Tarjetas de totales para el mes seleccionado */}
      {mesSeleccionado && datosMes && typeof datosMes === 'object' ? (
        <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ background: '#e8f5e9', padding: 16, borderRadius: 8, minWidth: 180 }}>
            <h4>Total EFECTIVO</h4>
            <p style={{ fontSize: 20, margin: 0 }}>${Number(datosMes?.efectivo_total ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <small>Cantidad: {Number(datosMes?.efectivo_cantidad ?? 0)}</small>
          </div>
          <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 8, minWidth: 180 }}>
            <h4>Total TRANSFERENCIA</h4>
            <p style={{ fontSize: 20, margin: 0 }}>${Number(datosMes?.transferencia_total ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            <small>Cantidad: {Number(datosMes?.transferencia_cantidad ?? 0)}</small>
          </div>
          <div style={{ background: '#fff3e0', padding: 16, borderRadius: 8, minWidth: 180 }}>
            <h4>Total General</h4>
            <p style={{ fontSize: 20, margin: 0 }}><b>${Number(datosMes?.total_general ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</b></p>
            <small>Cantidad: <b>{Number(datosMes?.cantidad_general ?? 0)}</b></small>
          </div>
        </div>
      ) : (
        <div style={{ margin: '1rem 0', color: 'gray' }}>Selecciona un mes para ver el detalle.</div>
      )}

      {/* Gráfico de barras para todos los meses */}
      <div style={{ width: '100%', height: 350, margin: '2rem 0' }}>
        <ResponsiveContainer>
          <BarChart data={dataBar} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="efectivo" fill="#4caf50" name="Efectivo" />
            <Bar dataKey="transferencia" fill="#2196f3" name="Transferencia" />
            <Bar dataKey="total" fill="#ff9800" name="Total General" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de resumen completa */}
      <AnalyticsResumen resumen={analyticsData} />
    </div>
  );
}

export default AnalyticsPage; 