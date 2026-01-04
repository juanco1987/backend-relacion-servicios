from flask import Blueprint, request, jsonify, send_file
from services.report_service import ReportService
from utils.decorators import validate_excel_upload, validate_date_range, extract_form_params
from utils.temp_file_manager import temporary_excel_file
from datetime import datetime
import io
import json

reports_bp = Blueprint('reports_bp', __name__)

@reports_bp.route('/process', methods=['POST'])
def process_data():
    """Endpoint para procesar y validar datos antes de generar PDF"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No se envió archivo'}), 400
    
    file = request.files['file']
    filename = file.filename or 'archivo.xlsx'
    
    # Obtener parámetros del formulario
    fecha_inicio_str = request.form.get('fecha_inicio')
    fecha_fin_str = request.form.get('fecha_fin')
    notas = request.form.get('notas', '')

    # Delegar validación lógica al servicio
    result = ReportService.validate_initial_file(
        file, filename, fecha_inicio_str, fecha_fin_str, notas
    )
    
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@reports_bp.route('/procesar_excel', methods=['POST'])
@validate_excel_upload
@validate_date_range(required=False)
def procesar_excel(file, fecha_inicio, fecha_fin):
    """Endpoint para procesar Excel de servicios pendientes."""
    try:
        # Usar fechas por defecto si no se proporcionaron
        if not fecha_inicio:
            fecha_inicio = datetime.strptime('2024-01-01', '%Y-%m-%d')
        if not fecha_fin:
            fecha_fin = datetime.strptime('2024-12-31', '%Y-%m-%d')
        
        with temporary_excel_file(file) as temp_path:
            success, result, status = ReportService.get_pending_services_report(temp_path, fecha_inicio, fecha_fin)
            return jsonify(result), status
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/relacion_servicios', methods=['POST'])
@validate_excel_upload
@validate_date_range(required=False)
def relacion_servicios(file, fecha_inicio, fecha_fin):
    """Endpoint para obtener relación de servicios en efectivo."""
    try:
        if not fecha_inicio:
            fecha_inicio = datetime.strptime('2024-01-01', '%Y-%m-%d')
        if not fecha_fin:
            fecha_fin = datetime.strptime('2024-12-31', '%Y-%m-%d')

        # Callback para logs
        logs = []
        def log_callback(msg, level='info'):
            logs.append({'level': level, 'text': msg})
        
        with temporary_excel_file(file) as temp_path:
            success, result, status = ReportService.get_cash_services_report(temp_path, fecha_inicio, fecha_fin, log_callback)
            
            # Inyectar logs acumulados en la respuesta
            if 'logs' not in result:
                result['logs'] = logs
                
            return jsonify(result), status
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/pdf_pendientes', methods=['POST'])
@validate_excel_upload
@validate_date_range(required=False)
@extract_form_params('notas', 'nombre_pdf')
def pdf_pendientes(file, fecha_inicio, fecha_fin, notas, nombre_pdf):
    """Endpoint para generar PDF de servicios pendientes."""
    try:
        if not fecha_inicio:
            fecha_inicio = datetime.strptime('2024-01-01', '%Y-%m-%d')
        if not fecha_fin:
            fecha_fin = datetime.strptime('2024-12-31', '%Y-%m-%d')

        with temporary_excel_file(file) as temp_path:
            success, result, extra = ReportService.generate_pending_services_pdf(
                temp_path, fecha_inicio, fecha_fin, nombre_pdf, notas
            )
            
            if not success:
                return jsonify(result), extra
            
            # Si success es True, extra es el status code 200 y result es la ruta
            ruta_pdf = result
            return send_file(ruta_pdf, as_attachment=True)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/pdf_relacion_servicios', methods=['POST'])
@validate_excel_upload
@validate_date_range(required=False)
@extract_form_params('notas', 'nombre_pdf')
def pdf_relacion_servicios(file, fecha_inicio, fecha_fin, notas, nombre_pdf):
    """Endpoint para generar PDF de relación de servicios."""
    try:
        if not fecha_inicio:
            fecha_inicio = datetime.strptime('2024-01-01', '%Y-%m-%d')
        if not fecha_fin:
            fecha_fin = datetime.strptime('2024-12-31', '%Y-%m-%d')
        
        # Obtener imágenes
        imagenes_json = request.form.get('imagenes', '[]')
        try:
            imagenes = json.loads(imagenes_json)
        except Exception:
            imagenes = []

        # Callback para logs
        logs = []
        def log_callback(msg, level='info'):
            logs.append({'level': level, 'text': msg})
        
        with temporary_excel_file(file) as temp_path:
            success, result_dict, pdf_bytes = ReportService.generate_cash_services_pdf(
                temp_path, fecha_inicio, fecha_fin, notas, nombre_pdf, imagenes, log_callback
            )
            
            if not success:
                if isinstance(result_dict, dict) and 'logs' not in result_dict:
                    result_dict['logs'] = logs
                return jsonify(result_dict), 400 if 'error' in result_dict else 500

            # Enviar el PDF
            return send_file(
                io.BytesIO(pdf_bytes),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=result_dict['filename']
            )
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
