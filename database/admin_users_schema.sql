-- Admin Users table for Pi Admin Console access management
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPERADMIN', 'ADMIN', 'MANAGER', 'SUPPORT')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION')),
    department VARCHAR(100),
    phone VARCHAR(20),
    cognito_sub VARCHAR(255) UNIQUE, -- Link to AWS Cognito user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES admin_users(id),
    notes TEXT,
    
    -- Audit fields
    created_by_system BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES admin_users(id),
    
    -- Indexes
    INDEX idx_admin_users_email (email),
    INDEX idx_admin_users_role (role),
    INDEX idx_admin_users_status (status),
    INDEX idx_admin_users_cognito_sub (cognito_sub)
);

-- Admin User Sessions table for tracking login sessions
CREATE TABLE admin_user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_admin_sessions_user_id (admin_user_id),
    INDEX idx_admin_sessions_token (session_token),
    INDEX idx_admin_sessions_expires (expires_at)
);

-- Admin User Activity Log
CREATE TABLE admin_user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', etc.
    resource_type VARCHAR(50), -- 'ADMIN_USER', 'CLIENT', 'MERCHANT', etc.
    resource_id VARCHAR(255), -- ID of the affected resource
    details JSONB, -- Additional details about the action
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_admin_activity_user_id (admin_user_id),
    INDEX idx_admin_activity_action (action),
    INDEX idx_admin_activity_resource (resource_type, resource_id),
    INDEX idx_admin_activity_created_at (created_at)
);

-- Role-based permissions (if you need granular permissions beyond role-based)
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'USER_MANAGEMENT', 'SYSTEM', 'CLIENT_MANAGEMENT', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin User Custom Permissions (for overriding role defaults)
CREATE TABLE admin_user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
    granted BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = grant permission, FALSE = revoke permission
    granted_by UUID REFERENCES admin_users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(admin_user_id, permission_id),
    INDEX idx_admin_user_perms_user (admin_user_id),
    INDEX idx_admin_user_perms_permission (permission_id)
);

-- Insert default permissions
INSERT INTO admin_permissions (name, description, category) VALUES
-- User Management
('VIEW_ADMIN_USERS', 'View admin users list', 'USER_MANAGEMENT'),
('CREATE_ADMIN_USERS', 'Create new admin users', 'USER_MANAGEMENT'),
('EDIT_ADMIN_USERS', 'Edit admin user details', 'USER_MANAGEMENT'),
('DELETE_ADMIN_USERS', 'Delete admin users', 'USER_MANAGEMENT'),

-- Client Management
('VIEW_CLIENTS', 'View client/merchant list', 'CLIENT_MANAGEMENT'),
('CREATE_CLIENTS', 'Create new clients/merchants', 'CLIENT_MANAGEMENT'),
('EDIT_CLIENTS', 'Edit client/merchant details', 'CLIENT_MANAGEMENT'),
('DELETE_CLIENTS', 'Delete clients/merchants', 'CLIENT_MANAGEMENT'),

-- System Management
('VIEW_SYSTEM_SETTINGS', 'View system settings', 'SYSTEM'),
('EDIT_SYSTEM_SETTINGS', 'Edit system settings', 'SYSTEM'),
('VIEW_AUDIT_LOGS', 'View audit logs', 'SYSTEM'),
('EXPORT_DATA', 'Export system data', 'SYSTEM'),

-- API Management
('VIEW_API_DOCS', 'View API documentation', 'API_MANAGEMENT'),
('MANAGE_API_KEYS', 'Manage API keys', 'API_MANAGEMENT'),

-- Risk Management
('VIEW_RISK_REPORTS', 'View risk management reports', 'RISK_MANAGEMENT'),
('MANAGE_RISK_RULES', 'Manage risk rules', 'RISK_MANAGEMENT'),

-- Communications
('SEND_NOTIFICATIONS', 'Send notifications', 'COMMUNICATIONS'),
('MANAGE_TEMPLATES', 'Manage communication templates', 'COMMUNICATIONS'),

-- Support
('VIEW_SUPPORT_TICKETS', 'View support tickets', 'SUPPORT'),
('RESPOND_SUPPORT_TICKETS', 'Respond to support tickets', 'SUPPORT');

-- Create initial super admin (you should update this with real values)
INSERT INTO admin_users (
    email, 
    first_name, 
    last_name, 
    role, 
    department, 
    created_by_system,
    notes
) VALUES (
    'superadmin@your-domain.com',
    'Super',
    'Admin',
    'SUPERADMIN',
    'Engineering',
    TRUE,
    'Initial super administrator account'
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();
