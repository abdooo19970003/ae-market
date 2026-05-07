import { NextRequest, NextResponse } from "next/server";
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

  const loginUrl = new URL('/auth/login', req.url)
  if (!accessToken) {
    // no token --> redirect to login page
    loginUrl.searchParams.set('from', encodeURIComponent(req.url))
    return NextResponse.redirect(loginUrl);
  }

  try {
    // decode token to check expiration
    const decode = jwtDecode<{
      sub: number,
      email: string,
      role: "admin" | "customer",
      exp: number,
    }>(accessToken)
    const isExpired = Date.now() >= decode.exp * 1000;

    if (isExpired) {
      // is expired --> redirect to login page 
      loginUrl.searchParams.set("expired", "true")
      return NextResponse.redirect(loginUrl);
    }

    // check admin routes 
    const isAdminRoute = ADMIN_ROUTES.some(route => pathName.startsWith(route))
    if (isAdminRoute && decode.role !== "admin") {
      // not admin --> redirect to home 
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch (error) {
    loginUrl.searchParams.set("invalid", "true")
    // invalid token  --> redirect to login page 
    return NextResponse.redirect(loginUrl);
  }

}




