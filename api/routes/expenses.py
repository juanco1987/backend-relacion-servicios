from flask import Blueprint, request, jsonify, send_file
from services.report_service import ReportService
import io
import traceback

expenses_bp = Blueprint('expenses_bp', __name__)

@expenses_bp.route('/gastos/generar-pdf', methods=['POST'])
def generar_pdf_gasto():
    """Endpoint para generar PDF de gastos."""
    try:
        data = request.get_json()
        
        success, result, pdf_bytes = ReportService.generate_expenses_pdf(data)
        
        if success:
             return send_file(
                io.BytesIO(pdf_bytes),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=result['filename']
            )
        else:
            return jsonify(result), 500

    except Exception as e:
        error_trace = traceback.format_exc()
        return jsonify({'error': f'Error al generar PDF: {str(e)}', 'traceback': error_trace}), 500
