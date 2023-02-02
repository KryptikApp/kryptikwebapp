import {} from "cookies-next";
import { NextApiResponse } from "next";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, res: NextApiResponse) {
  const cookies = req.cookies;
  const accessToken = cookies.get("accessToken")?.value;
  const refreshToken = cookies.get("refreshToken")?.value;
  console.log("running middleware!!");
  if (!accessToken || !refreshToken || !process.env.JWT_ACCESS_SECRET) {
    req.nextUrl.searchParams.set("from", req.nextUrl.pathname);
    req.nextUrl.pathname = "/wallet/create";
    return NextResponse.redirect(req.nextUrl);
  }
  const secret = process.env.JWT_ACCESS_SECRET;
  const adaptedSecret: Uint8Array = new TextEncoder().encode(secret);
  try {
    const { payload, protectedHeader } = await jwtVerify(
      accessToken,
      adaptedSecret
    );
    const requestHeaders = new Headers(req.headers);
    // Add new request headers
    console.log("setting header");
    requestHeaders.set("user-id", `${payload.userId}`);

    // You can also set request headers in NextResponse.rewrite
    const response = NextResponse.next({
      request: {
        // New request headers
        headers: requestHeaders,
      },
    });
    return response;
  } catch (e: any) {
    req.nextUrl.searchParams.set("from", req.nextUrl.pathname);
    req.nextUrl.pathname = "/wallet/create";
    return NextResponse.redirect(req.nextUrl);
  }
}

export const config = {
  matcher: [
    "/api/user/:path*",
    "/api/shares/:path*",
    "/api/account/:path*",
    "/wallet/send",
    "/wallet/receive",
    "/wallet/createName",
    "/wallet/delete",
    "/profile/:path*",
    "/wallet",
    "/sync/:path*",
  ],
};
