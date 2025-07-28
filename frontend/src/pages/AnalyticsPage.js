import React, { useEffect, useState } from 'react';
import EnhancedAnalyticsDashboard from '../components/analytics/EnhancedAnalyticsDashboard';
import { useTheme } from '../context/ThemeContext';

function AnalyticsPage() {
  const { theme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState('2024-12-31');
  const [showDashboard, setShowDashboard] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleStartAnalysis = () => {
    if (selectedFile) {
      setShowDashboard(true);
    }
  };

  return (
    <div style={{ 
      padding: 24, 
      background: theme.fondoPrincipal,
      minHeight: '100vh',
      color: theme.textoPrincipal
    }}>
      {!showDashboard ? (
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '2rem',
          background: theme.fondoContenedor,
          borderRadius: '16px',
          boxShadow: theme.sombraComponente,
          border: `1px solid ${theme.bordePrincipal}`
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: theme.textoPrincipal,
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            📊 Dashboard Analytics
          </h1>
          
          <div style={{ 
            margin: '2rem 0', 
            padding: '2rem', 
            border: `1px solid ${theme.bordePrincipal}`, 
            borderRadius: '12px',
            background: theme.fondoPrincipal
          }}>
            <h3 style={{ 
              marginBottom: '1.5rem',
              color: theme.textoPrincipal,
              fontSize: '1.5rem'
            }}>
              ⚙️ Configuración de Análisis
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ 
                  fontWeight: 'bold',
                  color: theme.textoPrincipal
                }}>
                  📁 Archivo Excel: 
                </label>
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileChange}
                  style={{ 
                    padding: '0.75rem',
                    border: `1px solid ${theme.bordePrincipal}`,
                    borderRadius: '8px',
                    background: theme.fondoContenedor,
                    color: theme.textoPrincipal
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ 
                    fontWeight: 'bold',
                    color: theme.textoPrincipal
                  }}>
                    📅 Fecha Inicio: 
                  </label>
                  <input 
                    type="date" 
                    value={fechaInicio} 
                    onChange={(e) => setFechaInicio(e.target.value)}
                    style={{ 
                      padding: '0.75rem',
                      border: `1px solid ${theme.bordePrincipal}`,
                      borderRadius: '8px',
                      background: theme.fondoContenedor,
                      color: theme.textoPrincipal
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ 
                    fontWeight: 'bold',
                    color: theme.textoPrincipal
                  }}>
                    📅 Fecha Fin: 
                  </label>
                  <input 
                    type="date" 
                    value={fechaFin} 
                    onChange={(e) => setFechaFin(e.target.value)}
                    style={{ 
                      padding: '0.75rem',
                      border: `1px solid ${theme.bordePrincipal}`,
                      borderRadius: '8px',
                      background: theme.fondoContenedor,
                      color: theme.textoPrincipal
                    }}
                  />
                </div>
              </div>
              
              <button
                onClick={handleStartAnalysis}
                disabled={!selectedFile}
                style={{
                  padding: '1rem 2rem',
                  borderRadius: '25px',
                  border: 'none',
                  background: selectedFile ? theme.textoInfo : theme.textoSecundario,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: selectedFile ? 'pointer' : 'not-allowed',
                  boxShadow: theme.sombraComponente,
                  transition: 'all 0.3s ease',
                  marginTop: '1rem'
                }}
              >
                🚀 Iniciar Análisis Completo
              </button>
              
              {!selectedFile && (
                <p style={{ 
                  textAlign: 'center', 
                  color: theme.textoAdvertencia,
                  fontSize: '0.9rem',
                  marginTop: '0.5rem'
                }}>
                  ⚠️ Por favor selecciona un archivo Excel para continuar
                </p>
              )}
            </div>
          </div>
          
          {/* Información sobre el dashboard */}
          <div style={{ 
            marginTop: '2rem',
            padding: '1.5rem',
            background: theme.fondoPrincipal,
            borderRadius: '12px',
            border: `1px solid ${theme.bordePrincipal}`
          }}>
            <h4 style={{ 
              marginBottom: '1rem',
              color: theme.textoPrincipal,
              fontSize: '1.2rem'
            }}>
              📋 Características del Dashboard:
            </h4>
            <ul style={{ 
              listStyle: 'none',
              padding: 0,
              color: theme.textoSecundario
            }}>
              <li style={{ marginBottom: '0.5rem' }}>📈 <strong>Vista General:</strong> KPIs principales y tendencias</li>
              <li style={{ marginBottom: '0.5rem' }}>👥 <strong>Análisis por Vendedores:</strong> Rendimiento y ranking</li>
              <li style={{ marginBottom: '0.5rem' }}>🏢 <strong>Análisis de Clientes:</strong> Tipos y mejores clientes</li>
              <li style={{ marginBottom: '0.5rem' }}>🔧 <strong>Análisis de Servicios:</strong> Tipos y métricas</li>
              <li style={{ marginBottom: '0.5rem' }}>📋 <strong>Servicios Pendientes:</strong> Efectivo y por cobrar</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          {/* Botón para volver */}
          <button
            onClick={() => setShowDashboard(false)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '20px',
              border: 'none',
              background: theme.textoSecundario,
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '1rem',
              boxShadow: theme.sombraComponente,
              transition: 'all 0.3s ease'
            }}
          >
            ← Volver a Configuración
          </button>
          
          {/* Dashboard mejorado */}
          <EnhancedAnalyticsDashboard 
            file={selectedFile}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
          />
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage; 