import { NextRequest, NextResponse } from "next/server";

// This proxies to the KeyAuth *user-facing* API (not seller API)
// Used for license verification/activation by end users
const KEYAUTH_USER_API = "https://keyauth.win/api/1.2/";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Build form data — KeyAuth user API expects query params via GET
    const params = new URLSearchParams();
    Object.entries(body).forEach(([k, v]) => {
      params.set(k, String(v));
    });

    const url = `${KEYAUTH_USER_API}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://keyauth.win/",
        Origin: "https://keyauth.win",
      },
    });

    let data: unknown;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          success: false,
          message: `KeyAuth error ${response.status}: ${text.slice(0, 300)}`,
        };
      }
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to connect to KeyAuth",
      },
      { status: 500 }
    );
  }
}
