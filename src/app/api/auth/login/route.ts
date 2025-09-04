import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserService, AUTH_CONFIG } from "@/lib/userService";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user by username or email
    const user = await UserService.findByEmailOrUsername(username);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await UserService.verifyPassword(user, password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      AUTH_CONFIG.JWT_SECRET,
      { expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN }
    );

    // Return success with token and user info (without password)
    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdat,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
