/**
 * Server Actions for authentication (register, login, logout).
 *
 * "use server" tells Next.js these functions should execute on the server,
 * not in the browser. Client components can call them directly via form
 * actions without creating explicit API routes — this is the React 19
 * Server Actions pattern.
 *
 * Each action uses the standard (prevState, formData) signature required
 * by React's `useActionState` hook on the client side.
 */

"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

// Zod schemas for input validation on the server side.
// Client-side HTML validation (required, type="email") is insufficient —
// server-side validation is essential for security.

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Return type for auth actions. On validation failure, `errors` contains
 * per-field error arrays. On logical failure (e.g. wrong password), `message`
 * holds a general error. `undefined` means the action succeeded (before redirect).
 */
export type AuthState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

/**
 * Register a new user.
 * Flow: validate input → check for duplicate email → hash password →
 * create user in DB (starts with 0 SB) → create session → redirect to dashboard.
 */
export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  // Prevent duplicate accounts — check if email is already registered.
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { message: "An account with this email already exists." };
  }

  // Hash password with bcrypt (10 salt rounds) before storing.
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      sbBalance: 0, // All new users start with 0 SB per requirements.
    },
  });

  // Establish a session immediately so the user is logged in after registration.
  await createSession(user.id);
  redirect("/dashboard");
}

/**
 * Log in an existing user.
 * Flow: validate input → look up user by email → compare password hash →
 * create session → redirect to dashboard.
 *
 * Uses a generic "Invalid email or password" message to prevent user enumeration
 * (attackers cannot determine whether an email exists in the system).
 */
export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { message: "Invalid email or password." };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return { message: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

/** Log out by deleting the session cookie, then redirect to login. */
export async function logout() {
  await deleteSession();
  redirect("/login");
}
