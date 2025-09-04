import { NextRequest, NextResponse } from "next/server";
import { UserService, AUTH_CONFIG } from "@/lib/userService";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, secretCode } = await request.json();

    if (!username || !email || !password || !secretCode) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify company secret code
    if (secretCode !== AUTH_CONFIG.COMPANY_SECRET_CODE) {
      return NextResponse.json(
        { message: "Invalid company secret code" },
        { status: 401 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    try {
      // Create new user in database
      const newUser = await UserService.create({
        username,
        email,
        password,
        role: "admin", // Default role
      });

      console.log("New user created:", { username, email, id: newUser.id });

      return NextResponse.json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdat,
        },
      });
    } catch (dbError: any) {
      // Handle database-specific errors
      if (dbError.message.includes("already exists")) {
        return NextResponse.json(
          { message: dbError.message },
          { status: 409 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
