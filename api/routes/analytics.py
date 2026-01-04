from flask import Blueprint, request, jsonify
from services.analytics_service import AnalyticsService
from utils.decorators import validate_excel_upload, validate_date_range
from utils.temp_file_manager import temporary_excel_file
from datetime import datetime
import traceback

analytics_bp = Blueprint('analytics_bp', __name__)

@analytics_bp.route('/analytics', methods=['POST'])
@validate_excel_upload
@validate_date_range(required=False)
def analytics(file, fecha_inicio, fecha_fin):
    """Endpoint para obtener analytics de servicios."""
    try:
        # Usar fechas por defecto si no se proporcionaron
        if not fecha_inicio:
            fecha_inicio = datetime.strptime('2024-01-01', '%Y-%m-%d')
        if not fecha_fin:
            fecha_fin = datetime.strptime('2024-12-31', '%Y-%m-%d')
        
        # El work_mode estaba en el código original pero no se usaba en el servicio nuevo
        # work_mode = int(request.form.get('work_mode', 0))

        with temporary_excel_file(file) as temp_path:
            # Delegar lógica compleja al servicio
            result = AnalyticsService.get_general_analytics(temp_path)
            # El dashboard espera un JSON directo
            return jsonify(result)
            
    except ValueError as val_err:
        return jsonify({'error': str(val_err)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/analytics_pendientes_efectivo', methods=['POST'])
def analytics_pendientes_efectivo():
    """Endpoint simplificado para analytics de efectivo, sin decoradores por ahora para mantener compatibilidad exacta"""
    if 'file' not in request.files:
        return jsonify({'error': 'No se envió archivo'}), 400
    
    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Nombre de archivo vacío'}), 400
    
    try:
        with temporary_excel_file(file) as temp_path:
            # Delegar lógica al servicio
            result = AnalyticsService.get_pending_cash_analytics(temp_path)
            return jsonify(result)

    except ValueError as val_err:
        return jsonify({'error': str(val_err)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/analytics_pendientes_cobrar', methods=['POST'])
@validate_excel_upload
def analytics_pendientes_cobrar(file):
    """Endpoint para analytics de pendientes por cobrar"""
    try:
        with temporary_excel_file(file) as temp_path:
            # Delegar lógica al servicio
            result = AnalyticsService.get_pending_charges_analytics(temp_path)
            return jsonify(result)

    except ValueError as val_err:
        return jsonify({'error': str(val_err)}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
