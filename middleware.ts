import {} from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";
import { JWTPayload, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest, res: NextApiResponse) {
  console.log("running middleware!!");
  try {
    const verifiedResult = await authenticateRequest(req);
    const { verified, payload } = verifiedResult;
    if (!verified || !payload) {
      throw new Error("Unable to verify request");
    }
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
    // check if request is to passkey endpoints
    if (
      req.nextUrl.pathname === "/api/auth/passkey/verifyRegistration" ||
      req.nextUrl.pathname === "/api/auth/passkey/all"
    ) {
      return NextResponse.next();
    }
    req.nextUrl.searchParams.set("from", req.nextUrl.pathname);
    req.nextUrl.pathname = "/wallet/create";
    return NextResponse.redirect(req.nextUrl);
  }
}

export type AuthRequestResponse = {
  payload: JWTPayload | null;
  verified: boolean;
};
export async function authenticateRequest(
  req: NextRequest
): Promise<AuthRequestResponse> {
  try {
    const cookies = req.cookies;
    const accessToken = cookies.get("accessToken")?.value;
    const refreshToken = cookies.get("refreshToken")?.value;
    if (!accessToken || !refreshToken || !process.env.JWT_ACCESS_SECRET) {
      return { payload: null, verified: false };
    }
    const secret = process.env.JWT_ACCESS_SECRET;
    const adaptedSecret: Uint8Array = new TextEncoder().encode(secret);
    const { payload, protectedHeader } = await jwtVerify(
      accessToken,
      adaptedSecret
    );
    // only hit if jwtVerify succeeds
    return { payload: payload, verified: true };
  } catch (e) {
    return { payload: null, verified: false };
  }
}

export async function authenticateApiRequest(
  req: NextApiRequest
): Promise<AuthRequestResponse> {
  try {
    const cookies = req.cookies;
    const accessToken = cookies["accessToken"];
    const refreshToken = cookies["refreshToken"];
    if (!accessToken || !refreshToken || !process.env.JWT_ACCESS_SECRET) {
      return { payload: null, verified: false };
    }
    const secret = process.env.JWT_ACCESS_SECRET;
    const adaptedSecret: Uint8Array = new TextEncoder().encode(secret);
    const { payload, protectedHeader } = await jwtVerify(
      accessToken,
      adaptedSecret
    );
    // only hit if jwtVerify succeeds
    return { payload: payload, verified: true };
  } catch (e) {
    return { payload: null, verified: false };
  }
}

export const config = {
  matcher: [
    "/api/user/activeUser",
    "/api/user/deleteUser",
    "/api/user/updateProfile",
    "/api/shares/:path*",
    "/api/account/:path*",
    "/wallet/send",
    "/wallet/receive",
    "/wallet/createName",
    "/wallet/delete",
    "/profile/:path*",
    "/wallet",
    "/sync/:path*",
    "/api/sync/:path*",
    "/api/auth/passkey/all",
    "/api/auth/passkey/verifyRegistration",
  ],
};
