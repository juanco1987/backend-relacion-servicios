"""
Tests para ExcelProcessor.
Valida el procesamiento y filtrado de archivos Excel.
"""
import pytest
import pandas as pd
from datetime import datetime
from core.excel_processor import extraer_servicios


class TestExcelProcessor:
    """Tests para funciones de procesamiento de Excel"""
    
    @pytest.fixture
    def sample_excel_with_services(self, tmp_path):
        """Crea un archivo Excel con servicios de prueba"""
        data = {
            'FECHA': pd.date_range('2025-01-01', periods=20, freq='D'),
            'FORMA DE PAGO': ['EFECTIVO'] * 15 + ['TRANSFERENCIA'] * 5,
            'ESTADO DEL SERVICIO': [''] * 10 + ['YA RELACIONADO'] * 10,
            'DIRECCION': ['Calle 123'] * 20,
            'SERVICIO REALIZADO': ['Instalación'] * 20,
            'VALOR SERVICIO': [100000] * 20,
            'DOMICILIO': [10000] * 20,
            'IVA': [19000] * 20
        }
        
        df = pd.DataFrame(data)
        excel_path = tmp_path / "servicios.xlsx"
        
        # Crear Excel con una hoja
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Enero', index=False)
        
        return str(excel_path)
    
    def test_extraer_servicios_success(self, sample_excel_with_services):
        """Test que extraer_servicios retorna DataFrame válido"""
        fecha_inicio = datetime(2025, 1, 1)
        fecha_fin = datetime(2025, 1, 31)
        
        df, info = extraer_servicios(
            sample_excel_with_services,
            fecha_inicio,
            fecha_fin
        )
        
        # Verificar que retorna DataFrame
        assert isinstance(df, pd.DataFrame)
        assert isinstance(info, dict)
        
        # Verificar info
        assert 'has_data_in_range' in info
        assert 'has_filtered_data' in info
        assert 'total_in_range' in info
        assert 'total_filtered' in info
    
    def test_extraer_servicios_filtra_efectivo(self, sample_excel_with_services):
        """Test que solo extrae servicios en efectivo"""
        fecha_inicio = datetime(2025, 1, 1)
        fecha_fin = datetime(2025, 1, 31)
        
        df, info = extraer_servicios(
            sample_excel_with_services,
            fecha_inicio,
            fecha_fin
        )
        
        # Según datos: 15 efectivo, 10 sin estado = 10 que cumplen filtro
        # (efectivo Y estado vacío)
        assert info['total_filtered'] == 10
        assert info['has_filtered_data'] is True
    
    def test_extraer_servicios_filtra_por_fecha(self, sample_excel_with_services):
        """Test que filtra correctamente por rango de fechas"""
        # Rango que solo incluye primeros 5 días
        fecha_inicio = datetime(2025, 1, 1)
        fecha_fin = datetime(2025, 1, 5)
        
        df, info = extraer_servicios(
            sample_excel_with_services,
            fecha_inicio,
            fecha_fin
        )
        
        # Debe haber datos en el rango
        assert info['has_data_in_range'] is True
        assert info['total_in_range'] == 5
    
    def test_extraer_servicios_calcula_valores_correctamente(self, sample_excel_with_services):
        """Test que calcula SUBTOTAL y TOTAL EMPRESA correctamente"""
        fecha_inicio = datetime(2025, 1, 1)
        fecha_fin = datetime(2025, 1, 31)
        
        df, info = extraer_servicios(
            sample_excel_with_services,
            fecha_inicio,
            fecha_fin
        )
        
        if len(df) > 0:
            # Verificar que tiene las columnas calculadas
            assert 'SUBTOTAL' in df.columns
            assert 'TOTAL EMPRESA' in df.columns
            
            # SUBTOTAL debe ser 50% del VALOR_COMBINADO
            first_row = df.iloc[0]
            assert first_row['SUBTOTAL'] == first_row['VALOR_COMBINADO'] * 0.5
            
            # TOTAL EMPRESA = SUBTOTAL + IVA
            assert first_row['TOTAL EMPRESA'] == first_row['SUBTOTAL'] + first_row['IVA']
    
    def test_extraer_servicios_sin_datos_en_rango(self, sample_excel_with_services):
        """Test con rango de fechas sin datos"""
        # Rango futuro sin datos
        fecha_inicio = datetime(2026, 1, 1)
        fecha_fin = datetime(2026, 1, 31)
        
        df, info = extraer_servicios(
            sample_excel_with_services,
            fecha_inicio,
            fecha_fin
        )
        
        # No debe haber datos
        assert info['has_data_in_range'] is False
        assert info['total_in_range'] == 0
        assert len(df) == 0
    
    def test_extraer_servicios_con_valores_monetarios_sucios(self, tmp_path):
        """Test que limpia correctamente valores monetarios con formato"""
        data = {
            'FECHA': pd.date_range('2025-01-01', periods=5, freq='D'),
            'FORMA DE PAGO': ['EFECTIVO'] * 5,
            'ESTADO DEL SERVICIO': [''] * 5,
            'DIRECCION': ['Calle 123'] * 5,
            'SERVICIO REALIZADO': ['Instalación'] * 5,
            'VALOR SERVICIO': ['$100,000', '$200,000', '$300,000', '$400,000', '$500,000'],
            'DOMICILIO': [10000] * 5,
            'IVA': ['$19,000', '$38,000', '$57,000', '$76,000', '$95,000']
        }
        
        df = pd.DataFrame(data)
        excel_path = tmp_path / "valores_sucios.xlsx"
        
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Enero', index=False)
        
        fecha_inicio = datetime(2025, 1, 1)
        fecha_fin = datetime(2025, 1, 31)
        
        df_result, info = extraer_servicios(
            str(excel_path),
            fecha_inicio,
            fecha_fin
        )
        
        # Verificar que limpió los valores correctamente
        if len(df_result) > 0:
            assert df_result['VALOR_COMBINADO'].iloc[0] == 100000
            assert df_result['IVA'].iloc[0] == 19000


class TestExcelProcessorEdgeCases:
    """Tests para casos edge"""
    
    def test_archivo_inexistente(self):
        """Test con archivo que no existe"""
        fecha_inicio = datetime(2025, 1, 1)
        fecha_fin = datetime(2025, 1, 31)
        
        df, info = extraer_servicios(
            '/path/inexistente.xlsx',
            fecha_inicio,
            fecha_fin
        )
        
        # Debe retornar DataFrame vacío
        assert len(df) == 0
        assert info['has_data_in_range'] is False
