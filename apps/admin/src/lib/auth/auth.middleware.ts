import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "./auth.provider";
import { jwtDecode } from "jwt-decode";


/**
 * Next.js Middleware — runs on every request
 * Validates access token and redirects unauthorized users
 */


const PUBLIC_ROUTES = ["/login", "/register", "/"];
const ADMIN_ROUTES = ["/admin", "/dashboard", "/settings"]

export function authMiddleware(req: NextRequest) {

  const pathName = req.nextUrl.pathname;

  // skip middleware for public routes
  if (PUBLIC_ROUTES.some(route => pathName.startsWith(route)))
    return NextResponse.next();

  // get access token from cookies 
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // no token --> redirect to login page
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // decode token to check expiration
    const decode = jwtDecode<{ exp: number, role: string }>(accessToken)
    const isExpired = Date.now() >= decode.exp * 1000;

    if (isExpired) {
      // is expired --> redirect to login page 
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // check admin routes 
    if (ADMIN_ROUTES.some(route => pathName.startsWith(route))) {
      if (decode.role !== "admin") {
        // not admin --> redirect to home 
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  } catch (error) {
    // invalid token  --> redirect to login page 
    return NextResponse.redirect(new URL("/login", req.url));
  }

}




