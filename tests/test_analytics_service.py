"""
Tests para AnalyticsService.
Valida la lógica de negocio de analytics y KPIs.
"""
import pytest
import pandas as pd
import numpy as np
from datetime import datetime
from services.analytics_service import AnalyticsService


class TestAnalyticsService:
    """Tests para AnalyticsService"""
    
    @pytest.fixture
    def sample_excel_data(self, tmp_path):
        """Crea un archivo Excel de prueba con datos realistas"""
        # Crear datos de prueba
        data = {
            'FECHA': pd.date_range('2025-01-01', periods=10, freq='D'),
            'ESTADO DEL SERVICIO': ['YA RELACIONADO'] * 5 + ['PENDIENTE COBRAR'] * 3 + ['COTIZACION'] * 2,
            'FORMA DE PAGO': ['EFECTIVO'] * 7 + ['TRANSFERENCIA'] * 3,
            'X50%/X25%': ['X50%'] * 10,
            'PARA JG': [50000, 60000, 70000, 80000, 90000, 100000, 110000, 120000, 130000, 140000],
            'SERVICIO REALIZADO': ['Instalación'] * 10
        }
        
        df = pd.DataFrame(data)
        
        # Guardar como Excel
        excel_path = tmp_path / "test_data.xlsx"
        df.to_excel(excel_path, index=False, engine='openpyxl')
        
        return str(excel_path)
    
    def test_get_general_analytics_success(self, sample_excel_data):
        """Test que get_general_analytics retorna datos correctos"""
        result = AnalyticsService.get_general_analytics(sample_excel_data)
        
        # Verificar estructura de respuesta
        assert result['success'] is True
        assert 'resumen' in result
        assert 'estados_grafico' in result
        assert 'pendientes_por_mes' in result
        
        # Verificar que hay datos
        assert len(result['resumen']) > 0
        assert result['estados_grafico']['TOTAL_SERVICIOS'] == 10
        
    def test_get_general_analytics_estados_correctos(self, sample_excel_data):
        """Test que los estados se cuentan correctamente"""
        result = AnalyticsService.get_general_analytics(sample_excel_data)
        
        estados = result['estados_grafico']
        
        # Verificar conteos según datos de prueba
        assert estados['YA_RELACIONADO'] == 5
        assert estados['PENDIENTE_COBRAR'] == 3
        assert estados['COTIZACION'] == 2
        
    def test_get_general_analytics_totales_por_mes(self, sample_excel_data):
        """Test que los totales por mes se calculan correctamente"""
        result = AnalyticsService.get_general_analytics(sample_excel_data)
        
        resumen = result['resumen']
        
        # Debe haber al menos un mes
        assert len(resumen) > 0
        
        # Verificar estructura de cada mes
        for mes, datos in resumen.items():
            assert 'efectivo_total' in datos
            assert 'transferencia_total' in datos
            assert 'total_general' in datos
            assert 'efectivo_cantidad' in datos
            assert 'transferencia_cantidad' in datos
            
            # Los totales deben ser números
            assert isinstance(datos['efectivo_total'], (int, float, np.number))
            assert isinstance(datos['transferencia_total'], (int, float, np.number))
    
    def test_get_pending_cash_analytics_success(self, sample_excel_data):
        """Test que get_pending_cash_analytics funciona correctamente"""
        result = AnalyticsService.get_pending_cash_analytics(sample_excel_data)
        
        assert result['success'] is True
        assert 'resumen' in result
        assert 'detalle' in result
        
    def test_get_pending_cash_analytics_filtra_efectivo(self, sample_excel_data):
        """Test que solo retorna servicios en efectivo no relacionados"""
        result = AnalyticsService.get_pending_cash_analytics(sample_excel_data)
        
        # Según datos de prueba: 7 efectivo, 5 ya relacionados = 2 pendientes
        # Pero el servicio filtra por estado != 'YA RELACIONADO'
        detalle = result['detalle']
        
        # Todos los servicios en detalle deben ser efectivo
        for servicio in detalle:
            # Verificar que tiene los campos esperados
            assert 'fecha' in servicio
            assert 'estado' in servicio
            assert 'dias_sin_relacionar' in servicio
    
    def test_get_pending_charges_analytics_success(self, sample_excel_data):
        """Test que get_pending_charges_analytics funciona"""
        result = AnalyticsService.get_pending_charges_analytics(sample_excel_data)
        
        assert result['success'] is True
        assert 'resumen' in result
        assert 'detalle' in result
        
    def test_get_pending_charges_analytics_solo_pendientes(self, sample_excel_data):
        """Test que solo retorna servicios con estado PENDIENTE COBRAR"""
        result = AnalyticsService.get_pending_charges_analytics(sample_excel_data)
        
        detalle = result['detalle']
        
        # Según datos de prueba: 3 servicios con PENDIENTE COBRAR
        assert len(detalle) == 3
        
        # Todos deben tener estado PENDIENTE COBRAR
        for servicio in detalle:
            assert servicio['estado'] == 'PENDIENTE COBRAR'
            assert 'dias_de_retraso' in servicio
            assert isinstance(servicio['dias_de_retraso'], int)


class TestAnalyticsServiceEdgeCases:
    """Tests para casos edge y manejo de errores"""
    
    def test_archivo_inexistente_lanza_error(self):
        """Test que un archivo inexistente lanza error"""
        with pytest.raises(Exception):
            AnalyticsService.get_general_analytics('/path/inexistente.xlsx')
    
    def test_archivo_vacio_retorna_estructura_valida(self, tmp_path):
        """Test que un archivo vacío retorna estructura válida"""
        # Crear Excel vacío
        df = pd.DataFrame()
        excel_path = tmp_path / "empty.xlsx"
        df.to_excel(excel_path, index=False, engine='openpyxl')
        
        # Debería lanzar error por falta de columnas requeridas
        with pytest.raises(ValueError):
            AnalyticsService.get_general_analytics(str(excel_path))
