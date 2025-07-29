import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '../../../../../lib/db';

// GET - Get specific user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    const result = await query(
      `SELECT 
        id, client_id, email, role, permissions, first_name, last_name, phone,
        last_login_at, failed_login_attempts, locked_until, password_expires_at,
        must_change_password, two_factor_enabled, created_at, updated_at,
        created_by, status, email_verified, timezone, language, notes
      FROM users WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update specific user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    // Check if user exists
    const userCheckResult = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    
    if (userCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const existingUser = userCheckResult.rows[0];
    
    // If email is being updated, check if it's already taken by another user
    if (body.email && body.email !== existingUser.email) {
      const emailCheckResult = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [body.email, userId]
      );
      
      if (emailCheckResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Handle password separately (needs hashing)
    if (body.password) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(body.password, saltRounds);
      updateFields.push(`password_hash = $${paramIndex}`);
      updateValues.push(password_hash);
      paramIndex++;
    }

    // Handle other fields
    const fieldsToUpdate = [
      'client_id', 'email', 'role', 'permissions', 'first_name', 'last_name',
      'phone', 'status', 'timezone', 'language', 'notes', 'must_change_password',
      'two_factor_enabled', 'email_verified'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        updateValues.push(body[field]);
        paramIndex++;
      }
    });

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date());
    paramIndex++;

    // Add user ID as the last parameter for WHERE clause
    updateValues.push(userId);

    if (updateFields.length === 1) { // Only updated_at was added
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, client_id, email, role, permissions, first_name, last_name, phone,
        last_login_at, failed_login_attempts, locked_until, password_expires_at,
        must_change_password, two_factor_enabled, created_at, updated_at,
        created_by, status, email_verified, timezone, language, notes
    `;

    const result = await query(updateQuery, updateValues);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Check if user exists and get their info before deletion
    const userCheckResult = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheckResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    await query('DELETE FROM users WHERE id = $1', [userId]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: userCheckResult.rows[0].id,
        email: userCheckResult.rows[0].email,
        first_name: userCheckResult.rows[0].first_name,
        last_name: userCheckResult.rows[0].last_name
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
