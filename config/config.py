import os

class Config:
    """Base config."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change-in-production'
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'temp')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB limit

class DevelopmentConfig(Config):
    """Development config."""
    DEBUG = True
    ENV = 'development'

class ProductionConfig(Config):
    """Production config."""
    DEBUG = False
    ENV = 'production'
    
class TestingConfig(Config):
    """Testing config."""
    TESTING = True
    DEBUG = True
