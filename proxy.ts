/**
 * Route protection via Next.js 16's `proxy.ts`.
 *
 * This replaces the traditional `middleware.ts` pattern from older Next.js versions.
 * It runs on the Edge runtime before a page or layout renders, allowing us to
 * intercept requests and redirect unauthenticated users.
 *
 * Responsibilities:
 * - Redirect unauthenticated users away from protected routes (/dashboard, /history)
 * - Redirect authenticated users away from public routes (/login, /register) to /dashboard
 *
 * This is an "optimistic" check — it only reads and verifies the JWT cookie,
 * without hitting the database. The DAL's `verifySession()` provides a second
 * layer of protection at the component level.
 */

import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ["/dashboard", "/history"];
const publicRoutes = ["/login", "/register", "/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the current path matches any protected or public route.
  // For protected routes, we also match nested paths (e.g. /dashboard/settings).
  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
  const isPublicRoute = publicRoutes.includes(path);

  // Read and verify the session cookie. No DB call — just JWT verification.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);

  // Unauthenticated user trying to access a protected page → redirect to login.
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Authenticated user trying to access login/register → redirect to dashboard.
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude API routes, static assets, and images from proxy interception.
  // API routes handle their own auth checks; static files must always be accessible.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
