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
