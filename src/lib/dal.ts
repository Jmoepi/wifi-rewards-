/**
 * Data Access Layer (DAL) — a abstraction layer between route handlers/components
 * and the database. This centralizes authentication checks and user queries,
 * preventing duplicated session verification logic across pages.
 */

import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./prisma";

/**
 * Server-side session guard. Reads the JWT from cookies and verifies it.
 * If the user is not authenticated, redirects to /login (throws internally
 * as Next.js redirect is an exception).
 *
 * Used at the top of Server Components and Route Handlers that require auth.
 */
export async function verifySession() {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
}

/**
 * Fetches the current user's profile from the database.
 * Explicitly excludes `passwordHash` from the result for security.
 */
export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      sbBalance: true,
      createdAt: true,
    },
  });

  return user;
}
