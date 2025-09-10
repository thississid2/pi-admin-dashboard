from flask import Flask, redirect, url_for, session, jsonify, request
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import os
import secrets
from config import Config
from auth_utils import require_auth, CognitoAuth

# Initialize Flask app
app = Flask(__name__)

# Load configuration
config = Config()
app.secret_key = config.SECRET_KEY
app.config.update(
    SESSION_COOKIE_SECURE=config.SESSION_COOKIE_SECURE,
    SESSION_COOKIE_HTTPONLY=config.SESSION_COOKIE_HTTPONLY,
    SESSION_COOKIE_SAMESITE=config.SESSION_COOKIE_SAMESITE
)

# Configure CORS
CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

# Initialize OAuth
oauth = OAuth(app)

# Register Cognito OAuth provider
oauth.register(
    name='cognito',
    authority=config.AWS_COGNITO_DOMAIN,
    client_id=config.AWS_COGNITO_CLIENT_ID,
    client_secret=config.AWS_COGNITO_CLIENT_SECRET,
    server_metadata_url=config.cognito_metadata_url,
    client_kwargs={
        'scope': 'openid email profile',
        'response_type': 'code'
    }
)

# Initialize auth utility
auth_util = CognitoAuth()

@app.route('/')
def index():
    """Home page with authentication status"""
    user = session.get('user')
    if user:
        return jsonify({
            'authenticated': True,
            'user': user,
            'message': f'Hello, {user.get("email", "User")}'
        })
    else:
        return jsonify({
            'authenticated': False,
            'message': 'Welcome! Please login to continue.',
            'login_url': '/auth/login'
        })

@app.route('/auth/login')
def login():
    """Initiate login with AWS Cognito"""
    try:
        # Generate a secure state parameter for CSRF protection
        state = secrets.token_urlsafe(32)
        session['oauth_state'] = state
        
        # Redirect to Cognito for authentication
        redirect_uri = url_for('authorize', _external=True)
        return oauth.cognito.authorize_redirect(
            redirect_uri,
            state=state
        )
    except Exception as e:
        return jsonify({'error': f'Login initiation failed: {str(e)}'}), 500

@app.route('/auth/authorize')
def authorize():
    """Handle the callback from AWS Cognito"""
    try:
        # Verify state parameter to prevent CSRF attacks
        state = request.args.get('state')
        if not state or state != session.get('oauth_state'):
            return jsonify({'error': 'Invalid state parameter'}), 400
        
        # Clear the state from session
        session.pop('oauth_state', None)
        
        # Get the access token from Cognito
        token = oauth.cognito.authorize_access_token()
        
        # Get user info from the token
        user_info = token.get('userinfo')
        if not user_info:
            # Fallback: get user info from the UserInfo endpoint
            user_info = auth_util.get_user_info(token['access_token'])
        
        if not user_info:
            return jsonify({'error': 'Failed to retrieve user information'}), 400
        
        # Store minimal user session (avoid large cookies)
        session['user'] = {
            'sub': user_info.get('sub'),
            'email': user_info.get('email'),
            'name': user_info.get('name') or user_info.get('preferred_username', ''),
        }
        
        # Store only essential token info
        session['authenticated'] = True
        session['token_expires_at'] = token.get('expires_at')
        
        # Redirect to frontend with success
        return redirect(f"{config.FRONTEND_CALLBACK_URL}?status=success")
        
    except Exception as e:
        return redirect(f"{config.FRONTEND_CALLBACK_URL}?status=error&message={str(e)}")

@app.route('/auth/logout')
def logout():
    """Logout user and clear session"""
    try:
        # Clear local session
        session.clear()
        
        # Redirect to Cognito logout URL
        logout_url = f"{config.cognito_logout_url}?client_id={config.AWS_COGNITO_CLIENT_ID}&logout_uri={config.FRONTEND_URL}"
        return redirect(logout_url)
        
    except Exception as e:
        return jsonify({'error': f'Logout failed: {str(e)}'}), 500

@app.route('/auth/user')
@require_auth
def get_user():
    """Get current user information"""
    user = session.get('user')
    if user:
        return jsonify({
            'authenticated': True,
            'user': user
        })
    else:
        return jsonify({'authenticated': False}), 401

@app.route('/auth/refresh')
def refresh_token():
    """Refresh the access token using refresh token"""
    try:
        tokens = session.get('tokens')
        if not tokens or not tokens.get('refresh_token'):
            return jsonify({'error': 'No refresh token available'}), 401
        
        # Use the refresh token to get new tokens
        new_token = oauth.cognito.fetch_access_token(
            refresh_token=tokens['refresh_token']
        )
        
        # Update stored tokens
        session['tokens'].update(new_token)
        
        return jsonify({
            'message': 'Token refreshed successfully',
            'expires_at': new_token.get('expires_at')
        })
        
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500

@app.route('/auth/status')
def auth_status():
    """Check authentication status"""
    user = session.get('user')
    authenticated = session.get('authenticated', False)
    
    if user and authenticated:
        return jsonify({
            'authenticated': True,
            'user': user,
            'token_expires_at': session.get('token_expires_at')
        })
    else:
        return jsonify({'authenticated': False})

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'pi-admin-auth-backend',
        'cognito_configured': bool(config.AWS_COGNITO_CLIENT_ID)
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Ensure required environment variables are set
    required_vars = [
        'AWS_COGNITO_USER_POOL_ID',
        'AWS_COGNITO_CLIENT_ID',
        'AWS_COGNITO_CLIENT_SECRET'
    ]
    
    missing_vars = [var for var in required_vars if not getattr(config, var)]
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file.")
        exit(1)
    
    print("Starting Pi Admin Dashboard Authentication Backend...")
    print(f"Frontend URL: {config.FRONTEND_URL}")
    print(f"Cognito User Pool: {config.AWS_COGNITO_USER_POOL_ID}")
    print(f"CORS Origins: {config.CORS_ORIGINS}")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=config.DEBUG
    )
