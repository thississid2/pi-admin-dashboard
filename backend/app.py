from flask import Flask, redirect, url_for, session, jsonify, request
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import os
import secrets
from config import Config
from auth_utils import require_auth, require_admin_role, CognitoAuth

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
        
        # Get user's admin role from Cognito groups
        username = user_info.get('email') or user_info.get('preferred_username')
        if username:
            admin_role = auth_util.get_user_admin_role(username)
            if admin_role:
                session['user']['admin_role'] = admin_role
        
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

# Admin User Management Endpoints
@app.route('/api/admin/users')
@require_admin_role(['SUPERADMIN', 'ADMIN'])
def list_admin_users():
    """List all admin users (requires SUPERADMIN or ADMIN role)"""
    try:
        # Get current user's role
        current_role = request.admin_role
        
        # TODO: Replace with actual database query
        # For now, return mock data with role information from Cognito
        auth = CognitoAuth()
        
        # In production, you'd query your admin_users table here
        mock_users = [
            {
                'id': '1',
                'email': 'superadmin@pi.com',
                'firstName': 'Super',
                'lastName': 'Admin',
                'role': 'SUPERADMIN',
                'status': 'ACTIVE',
                'department': 'Engineering',
                'lastLogin': '2024-01-10T10:00:00Z'
            },
            {
                'id': '2', 
                'email': 'admin@pi.com',
                'firstName': 'John',
                'lastName': 'Admin',
                'role': 'ADMIN',
                'status': 'ACTIVE',
                'department': 'Operations',
                'lastLogin': '2024-01-09T14:30:00Z'
            }
        ]
        
        return jsonify({
            'users': mock_users,
            'pagination': {
                'page': 1,
                'limit': 10,
                'total': len(mock_users),
                'totalPages': 1
            }
        })
    except Exception as e:
        return jsonify({'error': f'Failed to fetch admin users: {str(e)}'}), 500

@app.route('/api/admin/users/<user_id>/assign-role', methods=['POST'])
@require_admin_role(['SUPERADMIN'])
def assign_admin_role(user_id):
    """Assign admin role to user (SUPERADMIN only)"""
    try:
        data = request.get_json()
        new_role = data.get('role')
        username = data.get('username')  # email or username
        
        if not new_role or not username:
            return jsonify({'error': 'Role and username are required'}), 400
        
        role_to_group = {
            'SUPERADMIN': 'pi-superadmin',
            'ADMIN': 'pi-admin',
            'MANAGER': 'pi-manager', 
            'SUPPORT': 'pi-support'
        }
        
        if new_role not in role_to_group:
            return jsonify({'error': 'Invalid role'}), 400
        
        auth = CognitoAuth()
        
        # Remove user from all admin groups first
        current_groups = auth.get_user_groups(username)
        for group in current_groups:
            if group in role_to_group.values():
                auth.remove_user_from_group(username, group)
        
        # Add user to new role group
        success = auth.add_user_to_group(username, role_to_group[new_role])
        
        if success:
            return jsonify({'message': f'User assigned to {new_role} role successfully'})
        else:
            return jsonify({'error': 'Failed to assign role'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to assign role: {str(e)}'}), 500

@app.route('/api/auth/admin-user')
@require_auth
def get_current_admin_user():
    """Get current user's admin profile"""
    try:
        user = session.get('user')
        username = user.get('email') or user.get('preferred_username')
        
        if not username:
            return jsonify({'error': 'User identifier not found'}), 400
        
        auth = CognitoAuth()
        admin_role = auth.get_user_admin_role(username)
        
        if not admin_role:
            return jsonify({'error': 'No admin access'}), 403
        
        # TODO: Get additional user details from database
        admin_user = {
            'id': user.get('sub'),
            'email': user.get('email'),
            'firstName': user.get('given_name', ''),
            'lastName': user.get('family_name', ''),
            'name': user.get('name', ''),
            'role': admin_role,
            'status': 'ACTIVE',
            'groups': auth.get_user_groups(username),
            'lastLogin': None,  # TODO: Get from database
            'department': None,  # TODO: Get from database or Cognito attributes
        }
        
        return jsonify(admin_user)
        
    except Exception as e:
        return jsonify({'error': f'Failed to get admin user: {str(e)}'}), 500

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
