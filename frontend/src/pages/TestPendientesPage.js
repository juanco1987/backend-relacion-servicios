import React, { useState } from 'react';
import ServiciosPendientesEfectivo from '../components/ServiciosPendientesEfectivo';

function TestPendientesPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState('2024-12-31');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Página de Prueba - Servicios Pendientes en Efectivo</h1>
      
      <div style={{ 
        margin: '2rem 0', 
        padding: '1rem', 
        border: '2px solid #1976d2', 
        borderRadius: '8px',
        backgroundColor: '#f0f8ff'
      }}>
        <h3>📋 Instrucciones de Prueba:</h3>
        <ol>
          <li>Selecciona un archivo Excel con datos de servicios</li>
          <li>Configura las fechas de inicio y fin</li>
          <li>El componente mostrará automáticamente los servicios en efectivo pendientes</li>
        </ol>
      </div>

      {/* Selector de archivo y fechas */}
      <div style={{ 
        margin: '2rem 0', 
        padding: '1rem', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>⚙️ Configuración</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>📁 Archivo Excel: </label>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>📅 Fecha Inicio: </label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>📅 Fecha Fin: </label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
        </div>
        
        {selectedFile && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '4px',
            border: '1px solid #4caf50'
          }}>
            ✅ Archivo seleccionado: <strong>{selectedFile.name}</strong>
          </div>
        )}
      </div>

      {/* Componente de Servicios Pendientes */}
      {selectedFile ? (
        <ServiciosPendientesEfectivo 
          file={selectedFile}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
        />
      ) : (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          border: '2px dashed #ddd', 
          borderRadius: '8px',
          backgroundColor: '#fafafa'
        }}>
          <h3>📤 Selecciona un archivo Excel para comenzar</h3>
          <p>Una vez que selecciones un archivo, verás aquí las estadísticas de servicios en efectivo pendientes.</p>
        </div>
      )}

      {/* Información de debug */}
      <div style={{ 
        marginTop: '3rem', 
        padding: '1rem', 
        border: '1px solid #ff9800', 
        borderRadius: '8px',
        backgroundColor: '#fff3e0'
      }}>
        <h4>🔍 Información de Debug:</h4>
        <p><strong>Archivo seleccionado:</strong> {selectedFile ? selectedFile.name : 'Ninguno'}</p>
        <p><strong>Fecha inicio:</strong> {fechaInicio}</p>
        <p><strong>Fecha fin:</strong> {fechaFin}</p>
        <p><strong>Endpoint:</strong> http://localhost:5000/api/analytics_pendientes_efectivo</p>
      </div>
    </div>
  );
}

export default TestPendientesPage; 