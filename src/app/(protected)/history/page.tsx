import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const session = await verifySession();

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      bundleName: true,
      cost: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction History</h1>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">
          No transactions yet. Redeem a bundle to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">
                  Bundle Name
                </th>
                <th className="px-4 py-3 font-medium text-gray-600">Cost</th>
                <th className="px-4 py-3 font-medium text-gray-600">
                  Date Redeemed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3">{tx.bundleName}</td>
                  <td className="px-4 py-3">{tx.cost} SB</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
