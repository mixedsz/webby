import { NextRequest, NextResponse } from "next/server";

const KEYAUTH_API_BASE = "https://keyauth.win/api/seller/";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Forward all query params to KeyAuth
  const url = new URL(KEYAUTH_API_BASE);
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // Forward the real client IP so KeyAuth IP whitelisting works correctly
  const clientIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://keyauth.win/",
        Origin: "https://keyauth.win",
        ...(clientIp && {
          "X-Forwarded-For": clientIp,
          "X-Real-IP": clientIp,
        }),
      },
    });

    // Try to parse JSON even on non-2xx so we can forward the KeyAuth error message
    let data: unknown;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: false, message: `KeyAuth API error ${response.status}: ${text.slice(0, 200)}` };
      }
    }

    return NextResponse.json(data, { status: response.ok ? 200 : response.status });
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
