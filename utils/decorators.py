"""
Decoradores para validación de endpoints Flask.
Proporciona decoradores reutilizables para validar requests.
"""
from functools import wraps
from flask import request, jsonify
from utils.file_validator import FileValidator
from utils.date_validator import DateValidator


def validate_excel_upload(f):
    """
    Decorador para validar que se haya subido un archivo Excel válido.
    
    Usage:
        @bp_excel.route('/endpoint', methods=['POST'])
        @validate_excel_upload
        def my_endpoint(file):
            # file ya está validado
            pass
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Verificar que existe el archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se envió archivo'}), 400
        
        file = request.files['file']
        
        # Validar el archivo
        is_valid, error = FileValidator.validate_excel_file(file)
        if not is_valid:
            return jsonify({'error': error}), 400
        
        # Pasar el archivo como primer argumento
        return f(file, *args, **kwargs)
    
    return decorated_function


def validate_date_range(fecha_inicio_key='fecha_inicio', fecha_fin_key='fecha_fin', required=True):
    """
    Decorador para validar rango de fechas en form-data.
    
    Args:
        fecha_inicio_key: Nombre del campo de fecha inicio en form-data
        fecha_fin_key: Nombre del campo de fecha fin en form-data
        required: Si las fechas son requeridas
        
    Usage:
        @bp_excel.route('/endpoint', methods=['POST'])
        @validate_excel_upload
        @validate_date_range()
        def my_endpoint(file, fecha_inicio, fecha_fin):
            # file, fecha_inicio y fecha_fin ya están validados
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(file, *args, **kwargs):
            # Obtener fechas del form-data
            fecha_inicio_str = request.form.get(fecha_inicio_key)
            fecha_fin_str = request.form.get(fecha_fin_key)
            
            # Si son requeridas, validar que existan
            if required:
                if not fecha_inicio_str or not fecha_fin_str:
                    return jsonify({
                        'error': 'Fechas de inicio y fin son requeridas'
                    }), 400
            
            # Si no son requeridas y no están presentes, usar None
            if not fecha_inicio_str or not fecha_fin_str:
                return f(file, None, None, *args, **kwargs)
            
            # Validar y parsear fechas
            is_valid, fecha_inicio, fecha_fin, error = DateValidator.parse_and_validate_date_range(
                fecha_inicio_str, fecha_fin_str
            )
            
            if not is_valid:
                return jsonify({'error': error}), 400
            
            # Pasar fechas como argumentos
            return f(file, fecha_inicio, fecha_fin, *args, **kwargs)
        
        return decorated_function
    return decorator


def extract_form_params(*param_names):
    """
    Decorador para extraer parámetros del form-data.
    
    Args:
        *param_names: Nombres de los parámetros a extraer
        
    Usage:
        @bp_excel.route('/endpoint', methods=['POST'])
        @validate_excel_upload
        @validate_date_range()
        @extract_form_params('notas', 'nombre_pdf')
        def my_endpoint(file, fecha_inicio, fecha_fin, notas, nombre_pdf):
            # Todos los parámetros ya están extraídos
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Extraer parámetros del form-data
            params = {}
            for param_name in param_names:
                params[param_name] = request.form.get(param_name, '')
            
            # Pasar como kwargs
            return f(*args, **params, **kwargs)
        
        return decorated_function
    return decorator
