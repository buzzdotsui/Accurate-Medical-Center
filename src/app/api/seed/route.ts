import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";

export async function GET() {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: "doctor@accuratemedical.com" }
    });

    if (existing) {
      return NextResponse.json({ message: "User already exists", email: existing.email });
    }

    // Since we don't have a fake request object, we will use Prisma directly for seeding.
    // BetterAuth uses bcrypt for passwords by default. Wait, the easiest way to seed is just 
    // to use the auth API directly if possible, or we can just tell the user to register an account.
    // The login page has a "Create an account" link to /register. 
    return NextResponse.json({ error: "Use /register page to create an account, or we can seed one." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
