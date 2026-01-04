from flask import Flask, request, jsonify
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Cargar configuración
    try:
        from config.config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
    except ImportError:
        print("Advertencia: No se pudo cargar config.config.DevelopmentConfig")
    
    CORS(app)

    # Registrar blueprints
    # Registrar blueprints
    # from core.routes_excel import bp_excel
    # app.register_blueprint(bp_excel, url_prefix='/api')

    from api.routes.analytics import analytics_bp
    from api.routes.reports import reports_bp
    from api.routes.expenses import expenses_bp

    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(reports_bp, url_prefix='/api')
    app.register_blueprint(expenses_bp, url_prefix='/api')

    # Configurar JSON Provider personalizado (Flask 3.x+)
    from utils.json_encoder import CustomJSONProvider
    app.json = CustomJSONProvider(app)
    def home():
        return 'API de AAP_WEB_REPORTES funcionando', 200

    return app

# Esta línea es para que gunicorn pueda encontrar la app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)