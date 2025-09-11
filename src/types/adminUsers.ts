export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  status: AdminUserStatus;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  createdBy: string;
  department?: string;
  phone?: string;
  cognitoSub?: string; // Link to Cognito user
}

export enum AdminRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN', 
  MANAGER = 'MANAGER',
  SUPPORT = 'SUPPORT'
}

export enum AdminUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION'
}

export enum Permission {
  // User Management
  VIEW_ADMIN_USERS = 'VIEW_ADMIN_USERS',
  CREATE_ADMIN_USERS = 'CREATE_ADMIN_USERS',
  EDIT_ADMIN_USERS = 'EDIT_ADMIN_USERS',
  DELETE_ADMIN_USERS = 'DELETE_ADMIN_USERS',
  
  // Client/Merchant Management
  VIEW_CLIENTS = 'VIEW_CLIENTS',
  CREATE_CLIENTS = 'CREATE_CLIENTS',
  EDIT_CLIENTS = 'EDIT_CLIENTS',
  DELETE_CLIENTS = 'DELETE_CLIENTS',
  
  // System Management
  VIEW_SYSTEM_SETTINGS = 'VIEW_SYSTEM_SETTINGS',
  EDIT_SYSTEM_SETTINGS = 'EDIT_SYSTEM_SETTINGS',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  EXPORT_DATA = 'EXPORT_DATA',
  
  // API Management
  VIEW_API_DOCS = 'VIEW_API_DOCS',
  MANAGE_API_KEYS = 'MANAGE_API_KEYS',
  
  // Risk Management
  VIEW_RISK_REPORTS = 'VIEW_RISK_REPORTS',
  MANAGE_RISK_RULES = 'MANAGE_RISK_RULES',
  
  // Communications
  SEND_NOTIFICATIONS = 'SEND_NOTIFICATIONS',
  MANAGE_TEMPLATES = 'MANAGE_TEMPLATES',
  
  // Support
  VIEW_SUPPORT_TICKETS = 'VIEW_SUPPORT_TICKETS',
  RESPOND_SUPPORT_TICKETS = 'RESPOND_SUPPORT_TICKETS',
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPERADMIN]: [
    // Full access to everything
    Permission.VIEW_ADMIN_USERS,
    Permission.CREATE_ADMIN_USERS,
    Permission.EDIT_ADMIN_USERS,
    Permission.DELETE_ADMIN_USERS,
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.DELETE_CLIENTS,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.EDIT_SYSTEM_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_DATA,
    Permission.VIEW_API_DOCS,
    Permission.MANAGE_API_KEYS,
    Permission.VIEW_RISK_REPORTS,
    Permission.MANAGE_RISK_RULES,
    Permission.SEND_NOTIFICATIONS,
    Permission.MANAGE_TEMPLATES,
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.RESPOND_SUPPORT_TICKETS,
  ],
  [AdminRole.ADMIN]: [
    // Most permissions except creating/deleting other admins
    Permission.VIEW_ADMIN_USERS,
    Permission.EDIT_ADMIN_USERS,
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.DELETE_CLIENTS,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.EDIT_SYSTEM_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_DATA,
    Permission.VIEW_API_DOCS,
    Permission.MANAGE_API_KEYS,
    Permission.VIEW_RISK_REPORTS,
    Permission.MANAGE_RISK_RULES,
    Permission.SEND_NOTIFICATIONS,
    Permission.MANAGE_TEMPLATES,
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.RESPOND_SUPPORT_TICKETS,
  ],
  [AdminRole.MANAGER]: [
    // Client management and reporting
    Permission.VIEW_ADMIN_USERS,
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.VIEW_SYSTEM_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.EXPORT_DATA,
    Permission.VIEW_API_DOCS,
    Permission.VIEW_RISK_REPORTS,
    Permission.SEND_NOTIFICATIONS,
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.RESPOND_SUPPORT_TICKETS,
  ],
  [AdminRole.SUPPORT]: [
    // Support and basic client management
    Permission.VIEW_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.VIEW_API_DOCS,
    Permission.VIEW_SUPPORT_TICKETS,
    Permission.RESPOND_SUPPORT_TICKETS,
  ],
};

export const getRoleDisplayName = (role: AdminRole): string => {
  switch (role) {
    case AdminRole.SUPERADMIN:
      return 'Super Administrator';
    case AdminRole.ADMIN:
      return 'Administrator';
    case AdminRole.MANAGER:
      return 'Manager';
    case AdminRole.SUPPORT:
      return 'Support Staff';
    default:
      return role;
  }
};

export const getRoleColor = (role: AdminRole): string => {
  switch (role) {
    case AdminRole.SUPERADMIN:
      return 'text-red-700 bg-red-100';
    case AdminRole.ADMIN:
      return 'text-purple-700 bg-purple-100';
    case AdminRole.MANAGER:
      return 'text-blue-700 bg-blue-100';
    case AdminRole.SUPPORT:
      return 'text-green-700 bg-green-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

export const getStatusColor = (status: AdminUserStatus): string => {
  switch (status) {
    case AdminUserStatus.ACTIVE:
      return 'text-green-700 bg-green-100';
    case AdminUserStatus.INACTIVE:
      return 'text-gray-700 bg-gray-100';
    case AdminUserStatus.SUSPENDED:
      return 'text-red-700 bg-red-100';
    case AdminUserStatus.PENDING_ACTIVATION:
      return 'text-yellow-700 bg-yellow-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};
