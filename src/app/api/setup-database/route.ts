import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/userService";
import { testConnection } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 }
      );
    }

    // Check if admin user already exists
    const existingAdmin = await UserService.findByUsername("admin");
    
    if (existingAdmin) {
      return NextResponse.json(
        { 
          message: "Admin user already exists",
          user: {
            id: existingAdmin.id,
            username: existingAdmin.username,
            email: existingAdmin.email,
            role: existingAdmin.role
          }
        },
        { status: 200 }
      );
    }

    // Create initial admin user
    const adminUser = await UserService.create({
      username: "admin",
      email: "admin@company.com",
      password: "admin123", // This will be hashed automatically
      role: "admin"
    });

    console.log("Initial admin user created:", {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email
    });

    return NextResponse.json({
      message: "Initial admin user created successfully",
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        createdAt: adminUser.createdat
      },
      credentials: {
        username: "admin",
        password: "admin123"
      }
    });
  } catch (error: any) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { 
        message: "Database setup failed", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check database status
export async function GET() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 }
      );
    }

    // Check if admin user exists
    const adminExists = await UserService.findByUsername("admin");
    
    // Get all users count
    const allUsers = await UserService.getAll();
    
    return NextResponse.json({
      message: "Database status check",
      database: {
        connected: true,
        adminUserExists: !!adminExists,
        totalUsers: allUsers.length
      },
      users: allUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdat
      }))
    });
  } catch (error: any) {
    console.error("Database status check error:", error);
    return NextResponse.json(
      { 
        message: "Database status check failed", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
