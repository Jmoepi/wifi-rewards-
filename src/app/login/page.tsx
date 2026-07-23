/**
 * Login page — Client Component for the authentication form.
 *
 * Why "use client"? This page uses:
 * - `useActionState` (React 19 hook) to manage form state and display
 *   validation/server errors inline without page reloads
 * - Interactive form inputs that need client-side event handling
 *
 * The actual authentication logic runs on the server via the `login` server
 * action — only the form UI is rendered on the client.
 *
 * `useActionState` returns [state, action, pending]:
 * - state: the return value from the server action (errors or undefined)
 * - action: a wrapped version of the server action to pass to <form action>
 * - pending: boolean indicating if the action is currently running
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">WiFi Rewards</h1>
          <p className="mb-6 text-gray-500">Sign in to your account</p>

          <form action={action} className="space-y-4">
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
                placeholder="Enter your password"
              />
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* General error message (e.g. "Invalid email or password") */}
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
              {pending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
