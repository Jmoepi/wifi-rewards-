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

      <BalanceAdmin currentBalance={user.sbBalance} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Available Bundles</h2>
        <BundleList userBalance={user.sbBalance} />
      </div>
    </div>
  );
}
