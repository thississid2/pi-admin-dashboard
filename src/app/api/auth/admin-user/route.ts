import { NextRequest, NextResponse } from 'next/server';
import { AdminUser, AdminRole, AdminUserStatus } from '@/types/adminUsers';
import { CognitoIdentityProviderClient, AdminListGroupsForUserCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

// Configure AWS SDK v3
const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// Function to map Cognito group to AdminRole
function mapGroupToRole(groupName: string): AdminRole {
  switch (groupName) {
    case 'pi-superadmin':
      return AdminRole.SUPERADMIN;
    case 'pi-admin':
      return AdminRole.ADMIN;
    case 'pi-manager':
      return AdminRole.MANAGER;
    case 'pi-support':
      return AdminRole.SUPPORT;
    default:
      return AdminRole.SUPPORT; // Default fallback
  }
}

// Function to get user's groups and determine role
async function getUserRole(username: string): Promise<AdminRole> {
  try {
    const command = new AdminListGroupsForUserCommand({
      UserPoolId: USER_POOL_ID!,
      Username: username,
    });

    const userGroups = await cognito.send(command);
    
    // If user has multiple groups, return the highest priority role
    const groups = userGroups.Groups || [];
    if (groups.length === 0) {
      return AdminRole.SUPPORT; // Default if no groups
    }

    // Sort by precedence (lower number = higher priority)
    groups.sort((a, b) => (a.Precedence || 999) - (b.Precedence || 999));
    
    return mapGroupToRole(groups[0].GroupName!);
  } catch (error) {
    console.error('Error getting user role:', error);
    return AdminRole.SUPPORT; // Default fallback
  }
}

// Function to get current user from session/token
async function getCurrentUserFromSession(request: NextRequest): Promise<string | null> {
  try {
    // In a real implementation, you would:
    // 1. Extract JWT token from Authorization header or cookies
    // 2. Verify the token with Cognito
    // 3. Extract the username/email from the token
    
    // For now, let's try to get it from cookies or headers
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      // Extract user from JWT token (simplified)
      // This is a placeholder - you'd need proper JWT verification
      return null;
    }

    // Check for session cookies or other auth mechanisms
    // For demo purposes, let's return a test user
    // In production, implement proper session handling
    
    // Return null to indicate no authenticated user found
    return null;
  } catch (error) {
    console.error('Error getting current user from session:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, let's hardcode the current user lookup until proper auth is implemented
    // In production, you would get this from the JWT token or session
    const testUsers = [
      'siddartha.yadav@payintelli.com',
      'kamal.naidu@payintelli.com', 
      'vivek.rallapally@payintelli.com'
    ];
    
    // For demo, use the first superadmin user
    const currentUserEmail = 'siddartha.yadav@payintelli.com';
    
    if (!currentUserEmail) {
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    // Find the user in Cognito
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: USER_POOL_ID!,
      Filter: `email = "${currentUserEmail}"`,
      Limit: 1
    });

    const usersResult = await cognito.send(listUsersCommand);
    const cognitoUser = usersResult.Users?.[0];

    if (!cognitoUser) {
      return NextResponse.json(
        { error: 'User not found in Cognito' },
        { status: 404 }
      );
    }

    // Get user's role from their groups
    const role = await getUserRole(cognitoUser.Username!);
    
    // Extract user attributes
    const email = cognitoUser.Attributes?.find(attr => attr.Name === 'email')?.Value || '';
    const preferredUsername = cognitoUser.Attributes?.find(attr => attr.Name === 'preferred_username')?.Value || '';
    
    // Extract first and last name
    let firstName = 'Unknown';
    let lastName = 'User';
    
    if (preferredUsername) {
      if (preferredUsername.toLowerCase().includes('thississid')) {
        firstName = 'Siddartha';
        lastName = 'Yadav';
      } else if (preferredUsername.toLowerCase().includes('kamal')) {
        firstName = 'Kamal';
        lastName = 'Naidu';
      } else {
        const nameParts = preferredUsername.split(/[._\s]+/);
        firstName = nameParts[0] || 'Unknown';
        lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'User';
      }
    } else if (email) {
      const emailName = email.split('@')[0];
      const nameParts = emailName.split(/[._]+/);
      firstName = nameParts[0] || 'Unknown';
      lastName = nameParts.length > 1 ? nameParts[1] : 'User';
    }

    // Capitalize names properly
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    const currentAdminUser: AdminUser = {
      id: cognitoUser.Username!,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      status: cognitoUser.UserStatus === 'CONFIRMED' ? AdminUserStatus.ACTIVE : AdminUserStatus.PENDING_ACTIVATION,
      permissions: [], // Will be derived from role
      createdAt: cognitoUser.UserCreateDate || new Date(),
      updatedAt: cognitoUser.UserLastModifiedDate || new Date(),
      lastLogin: cognitoUser.UserLastModifiedDate || undefined,
      createdBy: 'cognito',
      department: undefined,
      cognitoSub: cognitoUser.Username!,
    };

    return NextResponse.json(currentAdminUser);
  } catch (error) {
    console.error('Error fetching current admin user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current admin user' },
      { status: 500 }
    );
  }
}
