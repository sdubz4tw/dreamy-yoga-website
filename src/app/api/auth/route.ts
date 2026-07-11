import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "password"; // Fallback if env variable is unconfigured

    if (username === expectedUsername && password === expectedPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid username or password credentials." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process authentication payload request." },
      { status: 500 }
    );
  }
}
