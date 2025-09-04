import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/userService";

// Temporary storage for reset tokens - in production, use Redis or database
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { resetToken, newPassword } = await request.json();

    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { message: "Reset token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if reset token is valid
    const tokenData = resetTokens.get(resetToken);

    if (!tokenData) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 401 }
      );
    }

    // Check if token has expired
    if (Date.now() > tokenData.expiresAt) {
      resetTokens.delete(resetToken);
      return NextResponse.json(
        { message: "Reset token has expired" },
        { status: 401 }
      );
    }

    // Update user password in database
    const success = await UserService.updatePassword(tokenData.email, newPassword);

    if (!success) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Remove used reset token
    resetTokens.delete(resetToken);

    console.log("Password reset successful for:", tokenData.email);

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
