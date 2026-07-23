/**
 * Session management using JWT (JSON Web Tokens) stored in HTTP-only cookies.
 *
 * We use the `jose` library instead of `jsonwebtoken` because `jose` is
 * edge-runtime compatible, meaning it works in Next.js Middleware, proxy.ts,
 * and Server Actions without needing Node.js-specific APIs.
 *
 * Flow:
 * 1. On login/register, `createSession()` signs a JWT containing the userId
 *    and stores it as an HTTP-only cookie named "session".
 * 2. On each request to a protected route, `getSession()` reads and verifies
 *    the JWT from the cookie to identify the current user.
 * 3. On logout, `deleteSession()` removes the cookie.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
// `jose` requires the secret key as a Uint8Array, not a plain string.
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  expiresAt: Date;
}

/** Signs a JWT with the user's ID. The token is valid for 7 days. */
export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/** Verifies a JWT and returns the decoded userId, or null if invalid/expired. */
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as { userId: string };
  } catch {
    // Token is invalid, expired, or tampered with — treat as unauthenticated.
    return null;
  }
}

/**
 * Creates an HTTP-only session cookie after successful login or registration.
 * The cookie is:
 * - httpOnly: Not accessible via JavaScript (prevents XSS theft)
 * - sameSite: "lax" allows the cookie on top-level navigations but not cross-site POSTs
 * - secure: false for local dev; should be true in production (HTTPS only)
 */
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: false,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/** Removes the session cookie, effectively logging the user out. */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Reads the session cookie and verifies the JWT.
 * Returns { userId } if valid, or null if no session exists / token is invalid.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  return decrypt(sessionCookie);
}
