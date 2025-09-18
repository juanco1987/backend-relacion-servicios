from flask import Flask, request, jsonify
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Registrar blueprints
    from core.routes_excel import bp_excel
    app.register_blueprint(bp_excel, url_prefix='/api')

    @app.route('/')
    def home():
        return 'API de AAP_WEB_REPORTES funcionando', 200

    return app

# Esta línea es para que gunicorn pueda encontrar la app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)