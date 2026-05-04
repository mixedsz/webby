import { NextRequest, NextResponse } from "next/server";

const KEYAUTH_API_BASE = "https://keyauth.win/api/seller/";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Forward all query params to KeyAuth
  const url = new URL(KEYAUTH_API_BASE);
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "FlakeServices-Dashboard/1.0",
        Accept: "application/json",
      },
      // Server-side request — no CORS restrictions
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `KeyAuth API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to KeyAuth API",
      },
      { status: 500 }
    );
  }
}
