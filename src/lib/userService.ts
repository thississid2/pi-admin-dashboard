import { query } from "../../lib/db";
import bcrypt from "bcryptjs";

// User interface matching your database table structure
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  createdat: string; // Note: PostgreSQL returns lowercase field names
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  createdat: string;
}

// Database operations for user authentication
export class UserService {
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM employee_credentials WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database error while finding user');
    }
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM employee_credentials WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Database error while finding user');
    }
  }

  // Find user by email or username
  static async findByEmailOrUsername(identifier: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT * FROM employee_credentials WHERE email = $1 OR username = $1',
        [identifier]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error finding user by email or username:', error);
      throw new Error('Database error while finding user');
    }
  }

  // Create new user
  static async create(userData: UserCreate): Promise<UserResponse> {
    try {
      // Hash password before storing
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const result = await query(
        `INSERT INTO employee_credentials (username, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, username, email, role, createdat`,
        [userData.username, userData.email, hashedPassword, userData.role]
      );
      
      return result.rows[0] as UserResponse;
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.constraint === 'employee_credentials_email_key') {
          throw new Error('Email already exists');
        }
        if (error.constraint === 'employee_credentials_username_key') {
          throw new Error('Username already exists');
        }
        throw new Error('Username or email already exists');
      }
      
      throw new Error('Database error while creating user');
    }
  }

  // Update user password
  static async updatePassword(email: string, newPassword: string): Promise<boolean> {
    try {
      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const result = await query(
        'UPDATE employee_credentials SET password = $1 WHERE email = $2',
        [hashedPassword, email]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Database error while updating password');
    }
  }

  // Check if user exists by username or email
  static async exists(username: string, email: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT 1 FROM employee_credentials WHERE username = $1 OR email = $2',
        [username, email]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      throw new Error('Database error while checking user existence');
    }
  }

  // Verify password
  static async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Error verifying password');
    }
  }

  // Get all users (for admin purposes)
  static async getAll(): Promise<UserResponse[]> {
    try {
      const result = await query(
        'SELECT id, username, email, role, createdat FROM employee_credentials ORDER BY createdat DESC'
      );
      
      return result.rows as UserResponse[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Database error while fetching users');
    }
  }

  // Delete user
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM employee_credentials WHERE id = $1',
        [id]
      );
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Database error while deleting user');
    }
  }
}

// Configuration from environment variables
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || "fallback-jwt-secret-change-in-production",
  COMPANY_SECRET_CODE: process.env.COMPANY_SECRET_CODE || "fallback-secret-code",
  JWT_EXPIRES_IN: "24h",
  PASSWORD_SALT_ROUNDS: 12,
} as const;
