"""
Validador de archivos para Flask.
Proporciona funciones para validar archivos subidos por usuarios.
"""
import os
from werkzeug.datastructures import FileStorage
from typing import Tuple, Optional


class FileValidator:
    """Validador de archivos subidos"""
    
    # Configuración de validación
    ALLOWED_EXCEL_EXTENSIONS = {'.xlsx', '.xls'}
    ALLOWED_EXCEL_MIMETYPES = {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    }
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
    
    @classmethod
    def validate_excel_file(cls, file: FileStorage) -> Tuple[bool, Optional[str]]:
        """
        Valida que el archivo sea un Excel válido.
        
        Args:
            file: Archivo subido desde Flask request.files
            
        Returns:
            Tuple[bool, Optional[str]]: (es_válido, mensaje_error)
            
        Example:
            >>> is_valid, error = FileValidator.validate_excel_file(request.files['file'])
            >>> if not is_valid:
            ...     return jsonify({'error': error}), 400
        """
        # 1. Validar que el archivo existe
        if not file:
            return False, 'No se envió archivo'
        
        # 2. Validar nombre de archivo
        if not file.filename:
            return False, 'Nombre de archivo vacío'
        
        # 3. Validar extensión
        filename = file.filename.lower()
        ext = os.path.splitext(filename)[1]
        
        if ext not in cls.ALLOWED_EXCEL_EXTENSIONS:
            return False, f'Extensión no permitida: {ext}. Use .xlsx o .xls'
        
        # 4. Validar tamaño (si es posible)
        try:
            file.seek(0, os.SEEK_END)
            size = file.tell()
            file.seek(0)  # Volver al inicio
            
            if size > cls.MAX_FILE_SIZE:
                size_mb = size / 1024 / 1024
                max_mb = cls.MAX_FILE_SIZE / 1024 / 1024
                return False, f'Archivo muy grande: {size_mb:.2f} MB. Máximo permitido: {max_mb} MB'
            
            if size == 0:
                return False, 'El archivo está vacío'
                
        except Exception as e:
            # Si no se puede verificar el tamaño, continuar
            pass
        
        return True, None
    
    @classmethod
    def validate_file_exists(cls, file: FileStorage) -> Tuple[bool, Optional[str]]:
        """
        Valida que el archivo existe y tiene nombre.
        
        Args:
            file: Archivo subido desde Flask request.files
            
        Returns:
            Tuple[bool, Optional[str]]: (es_válido, mensaje_error)
        """
        if not file:
            return False, 'No se envió archivo'
        
        if not file.filename:
            return False, 'Nombre de archivo vacío'
        
        return True, None
