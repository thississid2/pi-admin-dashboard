import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { UserService, AUTH_CONFIG } from "@/lib/userService";

// Temporary storage for reset tokens - in production, use Redis or database
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, secretCode } = await request.json();

    if (!email || !secretCode) {
      return NextResponse.json(
        { message: "Email and secret code are required" },
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

    // Check if user exists in database
    const user = await UserService.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email address" },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Store reset token
    resetTokens.set(resetToken, { email, expiresAt });

    // In production, you would send an email with the reset link
    console.log("Password reset requested for:", email);
    console.log("Reset token:", resetToken);

    return NextResponse.json({
      message: "Reset request verified",
      resetToken, // In production, don't return this directly
    });
  } catch (error: any) {
    console.error("Reset request error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
