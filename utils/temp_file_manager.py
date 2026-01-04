"""
Módulo para manejo seguro de archivos temporales.
Proporciona context managers que garantizan la limpieza de archivos temporales.
"""
import os
import tempfile
from contextlib import contextmanager
from typing import Generator
from werkzeug.datastructures import FileStorage


@contextmanager
def temporary_excel_file(uploaded_file: FileStorage) -> Generator[str, None, None]:
    """
    Context manager para manejar archivos Excel temporales de forma segura.
    
    Garantiza que el archivo temporal se elimine después de su uso,
    incluso si ocurre una excepción durante el procesamiento.
    
    Args:
        uploaded_file: Archivo subido desde Flask request.files
        
    Yields:
        str: Ruta al archivo temporal guardado
        
    Example:
        >>> with temporary_excel_file(request.files['file']) as temp_path:
        ...     df = pd.read_excel(temp_path)
        ...     # El archivo se elimina automáticamente al salir del bloque
    """
    # Crear archivo temporal con extensión .xlsx
    fd, temp_path = tempfile.mkstemp(suffix='.xlsx', prefix='excel_')
    
    try:
        # Cerrar el file descriptor ya que FileStorage.save() abrirá el archivo
        os.close(fd)
        
        # Guardar el archivo subido en la ruta temporal
        uploaded_file.save(temp_path)
        
        # Yield la ruta para que el código la use
        yield temp_path
        
    finally:
        # Garantizar que el archivo se elimine, incluso si hay excepciones
        try:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        except OSError as e:
            # Log del error pero no fallar
            print(f"Advertencia: No se pudo eliminar archivo temporal {temp_path}: {e}")


@contextmanager
def temporary_pdf_file(prefix: str = 'pdf_') -> Generator[str, None, None]:
    """
    Context manager para crear archivos PDF temporales de forma segura.
    
    Args:
        prefix: Prefijo para el nombre del archivo temporal
        
    Yields:
        str: Ruta al archivo temporal
        
    Example:
        >>> with temporary_pdf_file('reporte_') as temp_path:
        ...     generate_pdf(temp_path)
        ...     return send_file(temp_path)
    """
    fd, temp_path = tempfile.mkstemp(suffix='.pdf', prefix=prefix)
    
    try:
        os.close(fd)
        yield temp_path
    finally:
        try:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        except OSError as e:
            print(f"Advertencia: No se pudo eliminar archivo temporal {temp_path}: {e}")


def ensure_temp_directory(directory: str = 'temp') -> str:
    """
    Asegura que exista un directorio temporal y lo retorna.
    
    Args:
        directory: Nombre del directorio a crear
        
    Returns:
        str: Ruta absoluta al directorio
    """
    from flask import current_app
    try:
        if directory == 'temp' and current_app:
            directory = current_app.config.get('UPLOAD_FOLDER', 'temp')
    except RuntimeError:
        pass

    os.makedirs(directory, exist_ok=True)
    return os.path.abspath(directory)


def cleanup_temp_directory(directory: str = 'temp', max_age_hours: int = 24):
    """
    Limpia archivos antiguos del directorio temporal.
    
    Args:
        directory: Directorio a limpiar
        max_age_hours: Edad máxima de archivos en horas
    """
    import time
    
    import time
    from flask import current_app
    
    try:
        # Intentar obtener directorio de configuración
        if directory == 'temp' and current_app:
            directory = current_app.config.get('UPLOAD_FOLDER', 'temp')
    except RuntimeError:
        # Fuera de contexto de aplicación
        pass
        
    if not os.path.exists(directory):
        return
    
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600
    
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        
        if os.path.isfile(filepath):
            file_age = current_time - os.path.getmtime(filepath)
            
            if file_age > max_age_seconds:
                try:
                    os.unlink(filepath)
                    print(f"Eliminado archivo antiguo: {filepath}")
                except OSError as e:
                    print(f"Error al eliminar {filepath}: {e}")
