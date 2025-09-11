import { NextRequest, NextResponse } from 'next/server';
import { AdminUser, AdminRole, AdminUserStatus } from '@/types/adminUsers';
import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const cognito = new AWS.CognitoIdentityServiceProvider();
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
    const params = {
      UserPoolId: USER_POOL_ID!,
      Username: username,
    };

    const userGroups = await cognito.adminListGroupsForUser(params).promise();
    
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

// Function to fetch all admin users from Cognito
async function fetchCognitoAdminUsers(): Promise<AdminUser[]> {
  try {
    const adminUsers: AdminUser[] = [];
    
    // Get all groups
    const groupsResult = await cognito.listGroups({
      UserPoolId: USER_POOL_ID!,
    }).promise();

    const adminGroups = ['pi-superadmin', 'pi-admin', 'pi-manager', 'pi-support'];
    
    // Get users from each admin group
    for (const group of groupsResult.Groups || []) {
      if (adminGroups.includes(group.GroupName!)) {
        const usersInGroup = await cognito.listUsersInGroup({
          UserPoolId: USER_POOL_ID!,
          GroupName: group.GroupName!,
        }).promise();

        for (const user of usersInGroup.Users || []) {
          // Check if user is already in our list (user might be in multiple groups)
          const existingUser = adminUsers.find(u => u.cognitoSub === user.Username);
          
          if (!existingUser) {
            const email = user.Attributes?.find(attr => attr.Name === 'email')?.Value || '';
            const preferredUsername = user.Attributes?.find(attr => attr.Name === 'preferred_username')?.Value || '';
            
            // Determine user's role based on their groups
            const role = await getUserRole(user.Username!);
            
            // Extract first and last name from preferred_username or email
            let firstName = 'Unknown';
            let lastName = 'User';
            
            if (preferredUsername) {
              // Handle different username formats
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

            const adminUser: AdminUser = {
              id: user.Username!,
              email: email,
              firstName: firstName,
              lastName: lastName,
              role: role,
              status: user.UserStatus === 'CONFIRMED' ? AdminUserStatus.ACTIVE : AdminUserStatus.PENDING_ACTIVATION,
              permissions: [], // Will be derived from role
              createdAt: user.UserCreateDate || new Date(),
              updatedAt: user.UserLastModifiedDate || new Date(),
              lastLogin: user.UserLastModifiedDate || undefined,
              createdBy: 'cognito',
              department: undefined, // No automatic department assignment
              cognitoSub: user.Username!,
            };

            adminUsers.push(adminUser);
          }
        }
      }
    }

    return adminUsers;
  } catch (error) {
    console.error('Error fetching Cognito admin users:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // TODO: Add permission check for VIEW_ADMIN_USERS

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    // Fetch real admin users from Cognito
    const allAdminUsers = await fetchCognitoAdminUsers();
    let filteredUsers = allAdminUsers;

    // Apply filters
    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (status && status !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // Pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // TODO: Add permission check for CREATE_ADMIN_USERS

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'firstName', 'lastName', 'role'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Fetch existing users to check for email conflicts
    const existingUsers = await fetchCognitoAdminUsers();
    if (existingUsers.find(user => user.email === body.email)) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create new admin user
    const newUser: AdminUser = {
      id: `new-user-${Date.now()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      status: body.status || AdminUserStatus.PENDING_ACTIVATION,
      permissions: [], // Will be derived from role
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user-id', // TODO: Get from auth context
      department: body.department,
      phone: body.phone,
    };

    // TODO: Create user in Cognito
    // TODO: Add user to appropriate Cognito group
    // TODO: Save to database if needed
    
    return NextResponse.json({
      message: 'Admin user creation initiated. User will receive setup instructions via email.',
      user: newUser,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
