/**
 * BundleList — Client Component that fetches and displays available WiFi bundles.
 *
 * Why "use client"? This component needs:
 * - `useEffect` to fetch bundles from /api/bundles on mount
 * - `useState` for bundles, loading, and error states
 * - Interactive BundleCard sub-components with redeem functionality
 *
 * Architecture:
 * - The parent Server Component (dashboard/page.tsx) passes the user's
 *   balance as a prop. This avoids a client-side API call just to get
 *   the balance — it's already available from the server query.
 * - Bundle data IS fetched client-side from /api/bundles because this
 *   data is dynamic and independent of the user's session.
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface Bundle {
  id: number;
  name: string;
  cost: number;
}

interface BundleListProps {
  userBalance: number;
}

export function BundleList({ userBalance }: BundleListProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the available bundles from the API when the component mounts.
  useEffect(() => {
    fetch("/api/bundles")
      .then((res) => res.json())
      .then((data) => {
        setBundles(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bundles");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading bundles...</p>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bundles.map((bundle) => (
        <BundleCard
          key={`${bundle.id}-${userBalance}`}
          bundle={bundle}
          initialBalance={userBalance}
        />
      ))}
    </div>
  );
}

/**
 * BundleCard — individual bundle with a redeem button.
 *
 * Handles the two-step redemption flow:
 * 1. POST /api/redeem → calls the simulated WiFi provider
 * 2. POST /api/transactions → records the transaction and deducts balance
 *
 * Uses `useTransition` to keep the UI responsive during the ~1.5s API call.
 * The `isPending` state disables the button to prevent duplicate submissions.
 *
 * Balance is tracked in local state for instant UI updates, and
 * `router.refresh()` is called after success to re-run the parent
 * Server Component (which re-fetches the balance from the database).
 */
function BundleCard({
  bundle,
  initialBalance,
}: {
  bundle: Bundle;
  initialBalance: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [balance, setBalance] = useState(initialBalance);

  const canAfford = balance >= bundle.cost;

  function handleRedeem() {
    setToast(null);
    startTransition(async () => {
      try {
        // Step 1: Call the simulated WiFi provider API.
        // This may fail randomly (~20% failure rate) or succeed.
        const redeemRes = await fetch("/api/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bundleId: bundle.id }),
        });

        const redeemData = await redeemRes.json();

        if (!redeemRes.ok || !redeemData.success) {
          // Provider failed — show error, do NOT deduct balance or record transaction.
          setToast({
            type: "error",
            message: redeemData.message || "Redemption failed. Please try again.",
          });
          return;
        }

        // Step 2: Provider succeeded — now record the transaction and deduct balance.
        // Only called when the WiFi provider confirms delivery.
        const txRes = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bundleId: bundle.id,
            bundleName: bundle.name,
            cost: bundle.cost,
          }),
        });

        if (!txRes.ok) {
          const txData = await txRes.json();
          setToast({
            type: "error",
            message:
              typeof txData.error === "string"
                ? txData.error
                : "Failed to record transaction.",
          });
          return;
        }

        // Success — update local balance and refresh server components.
        const txResult = await txRes.json();
        setBalance(txResult.balance);
        setToast({
          type: "success",
          message: `${bundle.name} redeemed successfully!`,
        });
        // Re-run the parent Server Component to reflect the new balance
        // from the database (ensures consistency even if local state is stale).
        router.refresh();
      } catch {
        setToast({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
        });
      }
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold">{bundle.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{bundle.cost} SB</p>
      <button
        onClick={handleRedeem}
        disabled={isPending || !canAfford}
        className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Redeeming..." : canAfford ? "Redeem" : "Insufficient SB"}
      </button>
      {toast && (
        <div
          className={`mt-2 rounded-md p-2 text-xs ${
            toast.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
