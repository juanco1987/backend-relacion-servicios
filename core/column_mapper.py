"""
Módulo centralizado para el mapeo y normalización de columnas de Excel.
"""
import pandas as pd
from unidecode import unidecode
from typing import List, Dict, Optional, Any
from config.settings import EXCEL_COLUMNS

class ColumnMapper:
    """
    Clase encargada de identificar y normalizar columnas en DataFrames de Excel
    basándose en variantes conocidas.
    """
    
    @staticmethod
    def normalize_name(col_name: Any) -> str:
        """
        Normaliza el nombre de una columna para hacer comparaciones más flexibles.
        Elimina espacios, guiones bajos, convierte a mayúsculas y quita acentos.
        """
        if pd.isna(col_name):
            return ""
        # Convertir a string, quitar espacios, mayúsculas, quitar acentos
        return unidecode(str(col_name).strip().upper().replace(' ', '').replace('_', '').replace('.', ''))

    @classmethod
    def find_column(cls, df: pd.DataFrame, target_variants: List[str]) -> Optional[str]:
        """
        Busca una columna en el DataFrame que coincida con alguna de las variantes.
        
        Args:
            df: DataFrame donde buscar
            target_variants: Lista de posibles nombres de la columna
            
        Returns:
            Nombre real de la columna en el DataFrame o None si no se encuentra
        """
        # Crear un mapa de {nombre_normalizado: nombre_real}
        df_columns_normalized = {cls.normalize_name(col): col for col in df.columns}
        
        for variant in target_variants:
            normalized_variant = cls.normalize_name(variant)
            if normalized_variant in df_columns_normalized:
                return df_columns_normalized[normalized_variant]
        
        return None

    @classmethod
    def get_column_variants(cls) -> Dict[str, List[str]]:
        """
        Retorna el diccionario de variantes para cada columna estándar.
        """
        return {
            EXCEL_COLUMNS.get('FECHA', 'FECHA'): [
                'FECHA', 'Fecha', 'fecha', 'FECHA SERVICIO', 'Fecha Servicio', 'FECHA DE SERVICIO'
            ],
            EXCEL_COLUMNS.get('DIRECCION', 'DIRECCION'): [
                'DIRECCION', 'Direccion', 'direccion', 'DIRECCIÓN', 'Dirección', 
                'DIRECCION CLIENTE', 'UBICACION', 'UBICACIÓN'
            ],
            EXCEL_COLUMNS.get('NOMBRE_CLIENTE', 'NOMBRE CLIENTE'): [
                'NOMBRE CLIENTE', 'Nombre Cliente', 'nombre cliente', 'CLIENTE', 'Cliente', 
                'NOMBRE', 'Nombre'
            ],
            EXCEL_COLUMNS.get('SERVICIO_REALIZADO', 'SERVICIO REALIZADO'): [
                'SERVICIO REALIZADO', 'Servicio Realizado', 'servicio realizado', 
                'SERVICIO', 'Servicio', 'DESCRIPCION', 'Descripción', 'TRABAJO'
            ],
            EXCEL_COLUMNS.get('ESTADO_SERVICIO', 'ESTADO DEL SERVICIO'): [
                'ESTADO DEL SERVICIO', 'Estado del Servicio', 'estado del servicio', 
                'ESTADO', 'Estado', 'STATUS', 'Status'
            ],
            EXCEL_COLUMNS.get('FORMA_PAGO', 'FORMA DE PAGO'): [
                'FORMA DE PAGO', 'FORMA_PAGO', 'FORMA PAGO', 'PAGO', 'METODO PAGO'
            ],
            'X50_PORCIENTO': [
                'X50%/X25%', 'X50%', 'X25%', 'PORCENTAJE', 'PORCENTAJE PAGO', 'X50'
            ],
            'PARA_JG': [
                'PARA JG', 'Para JG', 'para jg', 'JG', 'J.G.', 'PARA J.G.'
            ],
            'PARA_ABRECAR': [
                'PARA ABRECAR', 'Para Abrecar', 'para abrecar', 'ABRECAR', 'Abrecar'
            ],
            'IVA': [
                'IVA 19%', 'IVA', 'Iva', 'iva', 'IVA%', 'IVA %', 'IVA TOTAL', 
                'TOTAL IVA', 'IMPUESTO', 'Impuesto'
            ],
            'DOMICILIO': [
                'DOMICILIO', 'Domicilio', 'domicilio', 'VALOR DOMICILIO'
            ],
            'VALOR_SERVICIO': [
                'VALOR SERVICIO', 'Valor Servicio', 'VALOR', 'Valor', 'PRECIO'
            ],
            EXCEL_COLUMNS.get('TORRE_APTO', 'TORRE/APTO'): [
                'TORRE/APTO', 'Torre/Apto', 'TORRE', 'Torre', 'APTO', 'Apto', 
                'INTERIOR', 'Interior', 'OFICINA', 'Oficina', 'DIRECCION', 'Direccion' # Fallback a Dirección si es necesario, pero mejor explícito
            ]
        }
