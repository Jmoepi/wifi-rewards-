/**
 * BalanceAdmin — Client Component for the Admin/Test Controls section.
 *
 * Why "use client"? This component needs:
 * - `useState` for the input value, current balance, and toast notifications
 * - `useTransition` to handle the PATCH request without blocking the UI
 * - `useRouter` to refresh server components after the balance update
 *
 * This is a testing utility that lets users manually set their SB balance
 * via the PATCH /api/profile/balance endpoint. It exists because all new
 * users start with 0 SB and there's no "earn rewards" flow in this
 * assessment — without this, the redemption flow would be untestable.
 *
 * Flow:
 * 1. User enters a number in the input field
 * 2. Client-side validation ensures it's a valid positive integer
 * 3. PATCH request updates the balance in the database
 * 4. Local state and router.refresh() update the UI immediately
 */

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface BalanceAdminProps {
  currentBalance: number;
}

export function BalanceAdmin({ currentBalance }: BalanceAdminProps) {
  const router = useRouter();
  const [balance, setBalance] = useState(currentBalance);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleUpdate() {
    setToast(null);
    const parsed = parseInt(inputValue, 10);

    // Client-side validation: must be a valid positive integer.
    if (isNaN(parsed) || parsed < 0) {
      setToast({ type: "error", message: "Please enter a valid positive number." });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/profile/balance", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ balance: parsed }),
        });

        if (!res.ok) {
          const data = await res.json();
          // Handle both string errors and Zod validation error objects.
          const errorMsg =
            typeof data.error === "object"
              ? Object.values(data.error).flat().join(", ")
              : data.error || "Failed to update balance.";
          setToast({ type: "error", message: errorMsg });
          return;
        }

        // Update local state for immediate UI feedback, clear the input,
        // and refresh server components (dashboard balance display).
        const updated = await res.json();
        setBalance(updated.sbBalance);
        setInputValue("");
        setToast({ type: "success", message: "Balance updated successfully." });
        router.refresh();
      } catch {
        setToast({ type: "error", message: "An unexpected error occurred." });
      }
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">
        Admin / Test Controls
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="balance-input" className="text-sm text-gray-600">
          Set Balance:
        </label>
        <input
          id="balance-input"
          type="number"
          min="0"
          step="1"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={String(balance)}
          className="w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleUpdate}
          disabled={isPending || inputValue === ""}
          className="rounded-md bg-gray-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Updating..." : "Update"}
        </button>
      </div>
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
