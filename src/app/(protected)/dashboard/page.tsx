/**
 * Dashboard page — the main authenticated view after login.
 *
 * This is a Server Component. It runs on the server and fetches data
 * directly from the database — no client-side fetch needed for the
 * initial page load. This means:
 * - Faster Time to First Byte (TTFB) — data is ready before HTML is sent
 * - Smaller JavaScript bundle — no fetch logic shipped to the client
 * - Secure — database queries never expose credentials to the browser
 *
 * The page renders three sections:
 * 1. User greeting + current SB balance (server-rendered)
 * 2. <BalanceAdmin> — client component for testing balance adjustments
 * 3. <BundleList> — client component for interactive bundle redemption
 *
 * Client components receive server-fetched data as props, creating a
 * clear boundary: server handles data, client handles interactivity.
 */

import { verifySession, getUser } from "@/lib/dal";
import { BundleList } from "./bundle-list";
import { BalanceAdmin } from "./balance-admin";

export default async function DashboardPage() {
  const session = await verifySession();
  const user = await getUser(session.userId);

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm text-gray-500">Current Balance:</span>
          <span className="text-3xl font-bold text-green-600">
            {user.sbBalance} SB
          </span>
        </div>
      </div>

      {/* Admin controls for manually setting the SB balance (testing only).
          Receives currentBalance as a prop so it can display the initial value. */}
      <BalanceAdmin currentBalance={user.sbBalance} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Available Bundles</h2>
        {/* BundleList fetches bundles from /api/bundles on the client side,
            because it needs interactive state (redeem buttons, toasts, etc.) */}
        <BundleList userBalance={user.sbBalance} />
      </div>
    </div>
  );
}
