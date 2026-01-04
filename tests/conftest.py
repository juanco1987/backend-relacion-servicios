import pytest
import os
import sys

# Agregar el directorio raíz al path para importar módulos correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from config.config import TestingConfig

@pytest.fixture
def app():
    """Fixture para crear la aplicación Flask en modo testing."""
    app = create_app()
    app.config.from_object(TestingConfig)
    return app

@pytest.fixture
def client(app):
    """Fixture para el cliente de pruebas."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Fixture para el runner de comandos CLI."""
    return app.test_cli_runner()
