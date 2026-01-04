"""
Validador de fechas para Flask.
Proporciona funciones para validar y parsear fechas.
"""
from datetime import datetime
from typing import Tuple, Optional


class DateValidator:
    """Validador de fechas"""
    
    DEFAULT_DATE_FORMAT = '%Y-%m-%d'
    
    @classmethod
    def validate_date_string(cls, date_str: str, format: str = DEFAULT_DATE_FORMAT) -> Tuple[bool, Optional[datetime], Optional[str]]:
        """
        Valida y parsea una fecha en formato string.
        
        Args:
            date_str: String con la fecha
            format: Formato esperado (default: YYYY-MM-DD)
            
        Returns:
            Tuple[bool, Optional[datetime], Optional[str]]: (es_válido, fecha_parseada, mensaje_error)
            
        Example:
            >>> is_valid, date, error = DateValidator.validate_date_string('2024-01-01')
            >>> if not is_valid:
            ...     return jsonify({'error': error}), 400
        """
        if not date_str:
            return False, None, 'Fecha no proporcionada'
        
        try:
            parsed_date = datetime.strptime(date_str, format)
            return True, parsed_date, None
        except ValueError:
            return False, None, f'Formato de fecha inválido. Use {format}'
    
    @classmethod
    def validate_date_range(cls, fecha_inicio: datetime, fecha_fin: datetime) -> Tuple[bool, Optional[str]]:
        """
        Valida que un rango de fechas sea válido.
        
        Args:
            fecha_inicio: Fecha de inicio
            fecha_fin: Fecha de fin
            
        Returns:
            Tuple[bool, Optional[str]]: (es_válido, mensaje_error)
        """
        if fecha_inicio > fecha_fin:
            return False, 'La fecha de inicio no puede ser mayor que la fecha de fin'
        
        return True, None
    
    @classmethod
    def parse_and_validate_date_range(
        cls, 
        fecha_inicio_str: str, 
        fecha_fin_str: str,
        format: str = DEFAULT_DATE_FORMAT
    ) -> Tuple[bool, Optional[datetime], Optional[datetime], Optional[str]]:
        """
        Parsea y valida un rango de fechas completo.
        
        Args:
            fecha_inicio_str: String con fecha de inicio
            fecha_fin_str: String con fecha de fin
            format: Formato esperado
            
        Returns:
            Tuple[bool, Optional[datetime], Optional[datetime], Optional[str]]: 
                (es_válido, fecha_inicio, fecha_fin, mensaje_error)
                
        Example:
            >>> is_valid, start, end, error = DateValidator.parse_and_validate_date_range(
            ...     '2024-01-01', '2024-12-31'
            ... )
            >>> if not is_valid:
            ...     return jsonify({'error': error}), 400
        """
        # Validar fecha de inicio
        is_valid, fecha_inicio, error = cls.validate_date_string(fecha_inicio_str, format)
        if not is_valid:
            return False, None, None, f'Fecha de inicio: {error}'
        
        # Validar fecha de fin
        is_valid, fecha_fin, error = cls.validate_date_string(fecha_fin_str, format)
        if not is_valid:
            return False, None, None, f'Fecha de fin: {error}'
        
        # Validar rango
        is_valid, error = cls.validate_date_range(fecha_inicio, fecha_fin)
        if not is_valid:
            return False, None, None, error
        
        return True, fecha_inicio, fecha_fin, None
