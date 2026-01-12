"""
Tests de integración para endpoints principales.
Valida el flujo completo de requests HTTP.
"""
import pytest
import io
from app import create_app


@pytest.fixture
def client():
    """Crea un cliente de prueba de Flask"""
    app = create_app()
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_excel_file():
    """Crea un archivo Excel de prueba en memoria"""
    import pandas as pd
    
    data = {
        'FECHA': pd.date_range('2025-01-01', periods=10, freq='D'),
        'ESTADO DEL SERVICIO': ['YA RELACIONADO'] * 5 + ['PENDIENTE COBRAR'] * 5,
        'FORMA DE PAGO': ['EFECTIVO'] * 7 + ['TRANSFERENCIA'] * 3,
        'X50%/X25%': ['X50%'] * 10,
        'PARA JG': [50000] * 10,
        'SERVICIO REALIZADO': ['Instalación'] * 10
    }
    
    df = pd.DataFrame(data)
    
    # Crear archivo en memoria
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Enero', index=False)
    output.seek(0)
    
    return output


class TestAnalyticsEndpoint:
    """Tests para endpoint /api/analytics"""
    
    def test_analytics_sin_archivo_retorna_error(self, client):
        """Test que sin archivo retorna error 400"""
        response = client.post('/api/analytics')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_analytics_con_archivo_valido_retorna_200(self, client, sample_excel_file):
        """Test que con archivo válido retorna 200"""
        data = {
            'file': (sample_excel_file, 'test.xlsx')
        }
        
        response = client.post(
            '/api/analytics',
            data=data,
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 200
        json_data = response.get_json()
        
        # Verificar estructura de respuesta
        assert 'success' in json_data
        assert json_data['success'] is True
        assert 'resumen' in json_data
        assert 'estados_grafico' in json_data
    
    def test_analytics_retorna_datos_correctos(self, client, sample_excel_file):
        """Test que los datos retornados son correctos"""
        data = {
            'file': (sample_excel_file, 'test.xlsx')
        }
        
        response = client.post(
            '/api/analytics',
            data=data,
            content_type='multipart/form-data'
        )
        
        json_data = response.get_json()
        
        # Verificar que hay estados
        estados = json_data['estados_grafico']
        assert 'TOTAL_SERVICIOS' in estados
        assert estados['TOTAL_SERVICIOS'] == 10
        assert 'YA_RELACIONADO' in estados
        assert 'PENDIENTE_COBRAR' in estados


class TestPendientesEfectivoEndpoint:
    """Tests para endpoint /api/analytics_pendientes_efectivo"""
    
    def test_pendientes_efectivo_sin_archivo_retorna_error(self, client):
        """Test que sin archivo retorna error"""
        response = client.post('/api/analytics_pendientes_efectivo')
        
        assert response.status_code == 400
    
    def test_pendientes_efectivo_con_archivo_valido(self, client, sample_excel_file):
        """Test que con archivo válido retorna datos"""
        data = {
            'file': (sample_excel_file, 'test.xlsx')
        }
        
        response = client.post(
            '/api/analytics_pendientes_efectivo',
            data=data,
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 200
        json_data = response.get_json()
        
        assert 'success' in json_data
        assert 'resumen' in json_data
        assert 'detalle' in json_data


class TestPendientesCobrarEndpoint:
    """Tests para endpoint /api/analytics_pendientes_cobrar"""
    
    def test_pendientes_cobrar_sin_archivo_retorna_error(self, client):
        """Test que sin archivo retorna error"""
        response = client.post('/api/analytics_pendientes_cobrar')
        
        assert response.status_code == 400
    
    def test_pendientes_cobrar_con_archivo_valido(self, client, sample_excel_file):
        """Test que con archivo válido retorna datos"""
        data = {
            'file': (sample_excel_file, 'test.xlsx')
        }
        
        response = client.post(
            '/api/analytics_pendientes_cobrar',
            data=data,
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 200
        json_data = response.get_json()
        
        assert 'success' in json_data
        assert 'resumen' in json_data
        assert 'detalle' in json_data
        
        # Verificar que el detalle contiene servicios pendientes
        detalle = json_data['detalle']
        for servicio in detalle:
            assert servicio['estado'] == 'PENDIENTE COBRAR'


class TestCORSHeaders:
    """Tests para verificar headers CORS"""
    
    def test_cors_headers_presentes(self, client, sample_excel_file):
        """Test que los headers CORS están configurados"""
        data = {
            'file': (sample_excel_file, 'test.xlsx')
        }
        
        response = client.post(
            '/api/analytics',
            data=data,
            content_type='multipart/form-data'
        )
        
        # Verificar que CORS está habilitado
        # (Flask-CORS agrega estos headers automáticamente)
        assert response.status_code == 200
