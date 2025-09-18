import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ServiciosPendientesEfectivo from '../components/ServiciosPendientesEfectivo';

function TestPendientesPage() {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 Página de Prueba - Servicios Pendientes en Efectivo</h1>
      
      <div style={{ 
        margin: '2rem 0', 
        padding: '1rem', 
        border: `2px solid ${theme.acento || theme.primario}`, 
        borderRadius: '8px',
        backgroundColor: theme.fondoOverlay
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
        border: `1px solid ${theme.bordePrincipal}`, 
        borderRadius: '8px',
        backgroundColor: theme.fondoContenedor
      }}>
        <h3>⚙️ Configuración</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: theme.textoPrincipal }}>📁 Archivo Excel: </label>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileChange}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: theme.textoPrincipal }}>📅 Fecha Inicio: </label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: theme.textoPrincipal }}>📅 Fecha Fin: </label>
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
            backgroundColor: theme.fondoOverlay, 
            borderRadius: '4px',
            border: `1px solid ${theme.acentoVerde || theme.primario}`
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
          border: `2px dashed ${theme.bordePrincipal}`, 
          borderRadius: '8px',
          backgroundColor: theme.fondoOverlay
        }}>
          <h3>📤 Selecciona un archivo Excel para comenzar</h3>
          <p>Una vez que selecciones un archivo, verás aquí las estadísticas de servicios en efectivo pendientes.</p>
        </div>
      )}

      {/* Información de debug */}
      <div style={{ 
        marginTop: '3rem', 
        padding: '1rem', 
        border: `1px solid ${theme.acento || theme.primario}`, 
        borderRadius: '8px',
        backgroundColor: theme.fondoOverlay
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