import jwt
import requests
import boto3
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify, session
from config import Config

class CognitoAuth:
    def __init__(self):
        self.config = Config()
        self._jwks = None
        self._jwks_expiry = None
        # Initialize Cognito Identity Provider client
        self.cognito_client = boto3.client(
            'cognito-idp',
            region_name=self.config.AWS_COGNITO_REGION
        )
    
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
    
    def get_user_groups(self, username):
        """Get user's groups from Cognito"""
        try:
            response = self.cognito_client.admin_list_groups_for_user(
                UserPoolId=self.config.AWS_COGNITO_USER_POOL_ID,
                Username=username
            )
            return [group['GroupName'] for group in response.get('Groups', [])]
        except Exception as e:
            print(f"Error getting user groups: {e}")
            return []
    
    def get_user_admin_role(self, username):
        """Get user's admin role based on Cognito groups"""
        groups = self.get_user_groups(username)
        
        # Map Cognito groups to admin roles (highest precedence first)
        role_mapping = {
            'pi-superadmin': 'SUPERADMIN',
            'pi-admin': 'ADMIN', 
            'pi-manager': 'MANAGER',
            'pi-support': 'SUPPORT'
        }
        
        # Return the highest priority role
        for group in groups:
            if group in role_mapping:
                return role_mapping[group]
        
        return None  # No admin role assigned
    
    def add_user_to_group(self, username, group_name):
        """Add user to a Cognito group"""
        try:
            self.cognito_client.admin_add_user_to_group(
                UserPoolId=self.config.AWS_COGNITO_USER_POOL_ID,
                Username=username,
                GroupName=group_name
            )
            return True
        except Exception as e:
            print(f"Error adding user to group: {e}")
            return False
    
    def remove_user_from_group(self, username, group_name):
        """Remove user from a Cognito group"""
        try:
            self.cognito_client.admin_remove_user_from_group(
                UserPoolId=self.config.AWS_COGNITO_USER_POOL_ID,
                Username=username,
                GroupName=group_name
            )
            return True
        except Exception as e:
            print(f"Error removing user from group: {e}")
            return False

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

def require_admin_role(allowed_roles=None):
    """Decorator to require specific admin roles"""
    if allowed_roles is None:
        allowed_roles = ['SUPERADMIN', 'ADMIN', 'MANAGER', 'SUPPORT']
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # First check authentication
            if not session.get('authenticated') or not session.get('user'):
                return jsonify({'error': 'Authentication required'}), 401
            
            user = session.get('user')
            username = user.get('email') or user.get('preferred_username')
            
            if not username:
                return jsonify({'error': 'User identifier not found'}), 401
            
            # Get user's admin role
            auth = CognitoAuth()
            user_role = auth.get_user_admin_role(username)
            
            if not user_role:
                return jsonify({'error': 'Admin access required'}), 403
            
            if user_role not in allowed_roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            # Store role in request context for use in the route
            request.admin_role = user_role
            request.admin_user = user
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator
