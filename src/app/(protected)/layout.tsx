/**
 * Protected layout — wraps all authenticated pages (dashboard, history).
 *
 * This is a Server Component that renders the shared navigation bar.
 * The (protected) route group means this layout applies to all routes
 * under this folder WITHOUT adding "/protected" to the URL path.
 *
 * The logout button uses a form with the `logout` server action directly —
 * no client-side JavaScript needed for the logout flow. This is the
 * React Server Actions pattern: a <form> with `action={serverFunction}`.
 *
 * Route protection is handled by proxy.ts (which redirects unauthenticated
 * users away from /dashboard and /history), so this layout doesn't need
 * to check authentication itself.
 */

import { logout } from "@/lib/actions/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <a href="/dashboard" className="text-lg font-bold">
            WiFi Rewards
          </a>
          <nav className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </a>
            <a
              href="/history"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              History
            </a>
            {/* Logout uses a form action — the server action deletes the
                session cookie and redirects to /login. */}
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4">{children}</main>
    </div>
  );
}
