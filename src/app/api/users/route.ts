import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '../../../../lib/db';

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['id', 'client_id', 'email', 'password', 'role', 'created_by', 'status'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserResult = await query(
      'SELECT id, email FROM client_users WHERE id = $1 OR email = $2',
      [body.id, body.email]
    );
    
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this ID or email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(body.password, saltRounds);

    // Insert new user into database
    const insertQuery = `
      INSERT INTO client_users (
        id, client_id, email, password_hash, role, permissions, first_name, last_name,
        phone, last_login_at, failed_login_attempts, locked_until, password_expires_at,
        must_change_password, two_factor_enabled, two_factor_secret, created_at, updated_at,
        created_by, status, email_verified, email_verification_token, password_reset_token,
        password_reset_expires_at, timezone, language, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      ) RETURNING *
    `;

    const values = [
      body.id,
      body.client_id,
      body.email,
      password_hash,
      body.role || 'USER',
      body.permissions || null,
      body.first_name || null,
      body.last_name || null,
      body.phone || null,
      null, // last_login_at
      0, // failed_login_attempts
      null, // locked_until
      null, // password_expires_at
      false, // must_change_password
      false, // two_factor_enabled
      null, // two_factor_secret
      new Date(), // created_at
      new Date(), // updated_at
      body.created_by,
      body.status || 'ACTIVE',
      false, // email_verified
      null, // email_verification_token
      null, // password_reset_token
      null, // password_reset_expires_at
      body.timezone || 'UTC',
      body.language || 'en',
      body.notes || null
    ];

    const result = await query(insertQuery, values);
    const newUser = result.rows[0];

    // Return success response (don't include password_hash in response)
    const { password_hash: _, ...userResponse } = newUser;
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve all users
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    // Build WHERE clauses for filtering
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        LOWER(first_name) LIKE $${paramIndex} OR 
        LOWER(last_name) LIKE $${paramIndex + 1} OR 
        LOWER(email) LIKE $${paramIndex + 2} OR 
        LOWER(id) LIKE $${paramIndex + 3}
      )`);
      const searchTerm = `%${search.toLowerCase()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      paramIndex += 4;
    }

    if (role) {
      whereConditions.push(`LOWER(role) = $${paramIndex}`);
      queryParams.push(role.toLowerCase());
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`LOWER(status) = $${paramIndex}`);
      queryParams.push(status.toLowerCase());
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM client_users cu
      LEFT JOIN clients c ON cu.client_id = c.id
      ${whereClause.replace('client_users', 'cu')}
    `;
    const countResult = await query(countQuery, queryParams);
    const totalUsers = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with pagination and client name
    const usersQuery = `
      SELECT 
        cu.id, cu.client_id, cu.email, cu.role, cu.permissions, cu.first_name, cu.last_name, cu.phone,
        cu.last_login_at, cu.failed_login_attempts, cu.locked_until, cu.password_expires_at,
        cu.must_change_password, cu.two_factor_enabled, cu.created_at, cu.updated_at,
        cu.created_by, cu.status, cu.email_verified, cu.timezone, cu.language, cu.notes,
        c.name as client_name
      FROM client_users cu
      LEFT JOIN clients c ON cu.client_id = c.id
      ${whereClause.replace('client_users', 'cu')}
      ORDER BY cu.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const usersResult = await query(usersQuery, queryParams);

    return NextResponse.json({
      users: usersResult.rows,
      pagination: {
        page: page,
        limit: limit,
        total: totalUsers,
        totalPages: totalPages
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
