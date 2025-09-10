import jwt
import requests
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify, session
from config import Config

class CognitoAuth:
    def __init__(self):
        self.config = Config()
        self._jwks = None
        self._jwks_expiry = None
    
    def get_jwks(self):
        """Get JSON Web Key Set from Cognito"""
        if self._jwks is None or (self._jwks_expiry and datetime.now(timezone.utc) > self._jwks_expiry):
            jwks_url = f"{self.config.AWS_COGNITO_DOMAIN}/.well-known/jwks.json"
            response = requests.get(jwks_url)
            response.raise_for_status()
            self._jwks = response.json()
            # Cache for 1 hour
            self._jwks_expiry = datetime.now(timezone.utc).replace(hour=datetime.now(timezone.utc).hour + 1)
        return self._jwks
    
    def verify_token(self, token):
        """Verify JWT token from Cognito"""
        try:
            # Decode header to get key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get('kid')
            
            if not kid:
                return None
            
            # Get the signing key
            jwks = self.get_jwks()
            signing_key = None
            
            for key in jwks['keys']:
                if key['kid'] == kid:
                    signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break
            
            if not signing_key:
                return None
            
            # Verify the token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=['RS256'],
                audience=self.config.AWS_COGNITO_CLIENT_ID,
                issuer=self.config.AWS_COGNITO_DOMAIN
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    def get_user_info(self, access_token):
        """Get user information from Cognito UserInfo endpoint"""
        try:
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(
                f"{self.config.AWS_COGNITO_DOMAIN}/oauth2/userInfo",
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error getting user info: {e}")
            return None

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check session first
        if session.get('authenticated') and session.get('user'):
            return f(*args, **kwargs)
        
        # Check for Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        auth = CognitoAuth()
        payload = auth.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Store user info in request context
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated_function
