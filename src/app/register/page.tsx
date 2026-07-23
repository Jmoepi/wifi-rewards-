/**
 * Registration page — Client Component for creating a new account.
 *
 * Uses the same `useActionState` + server action pattern as the login page.
 * The `register` server action handles validation, duplicate email checks,
 * password hashing, user creation, and session establishment.
 *
 * See login/page.tsx for detailed explanation of the useActionState pattern.
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthState } from "@/lib/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    register,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">WiFi Rewards</h1>
          <p className="mb-6 text-gray-500">Create a new account</p>

          <form action={action} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Your name"
              />
              {state?.errors?.name && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
              {state?.errors?.email && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="At least 6 characters"
              />
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {state?.message && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
