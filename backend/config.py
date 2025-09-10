import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Flask configuration
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # AWS Cognito configuration
    AWS_COGNITO_USER_POOL_ID = os.getenv('AWS_COGNITO_USER_POOL_ID')
    AWS_COGNITO_CLIENT_ID = os.getenv('AWS_COGNITO_CLIENT_ID')
    AWS_COGNITO_CLIENT_SECRET = os.getenv('AWS_COGNITO_CLIENT_SECRET')
    AWS_COGNITO_REGION = os.getenv('AWS_COGNITO_REGION', 'ap-south-1')
    AWS_COGNITO_DOMAIN = os.getenv('AWS_COGNITO_DOMAIN')
    
    # Frontend URLs
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    FRONTEND_CALLBACK_URL = os.getenv('FRONTEND_CALLBACK_URL', 'http://localhost:3000/auth/callback')
    
    # CORS configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Session configuration
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = os.getenv('SESSION_COOKIE_HTTPONLY', 'True').lower() == 'true'
    SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', 'Lax')
    
    @property
    def cognito_metadata_url(self):
        return f"{self.AWS_COGNITO_DOMAIN}/.well-known/openid-configuration"
    
    @property
    def cognito_logout_url(self):
        return f"https://{self.AWS_COGNITO_USER_POOL_ID.split('_')[1]}.auth.{self.AWS_COGNITO_REGION}.amazoncognito.com/logout"
