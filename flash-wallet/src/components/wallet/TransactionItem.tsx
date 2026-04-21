import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Transaction } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { formatSats, formatXof, formatDate, getTypeLabel } from "@/lib/utils";

interface TransactionItemProps {
  tx: Transaction;
  onClick?: (tx: Transaction) => void;
}

export function TransactionItem({ tx, onClick }: TransactionItemProps) {
  const isIncoming = tx.type === "receive" || tx.type === "buy";

  return (
    <div
      onClick={() => onClick?.(tx)}
      className={`flex items-center justify-between py-4 px-2 rounded-2xl transition-colors ${
        onClick ? "cursor-pointer hover:bg-flash-gray" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isIncoming
              ? "bg-green-100 text-flash-success"
              : "bg-orange-100 text-orange-500"
          }`}
        >
          {isIncoming ? (
            <ArrowDownLeft className="w-5 h-5" />
          ) : (
            <ArrowUpRight className="w-5 h-5" />
          )}
        </div>

        <div>
          <p className="font-semibold text-flash-dark text-sm">
            {getTypeLabel(tx.type)}
          </p>
          <p className="text-xs text-flash-gray-text">{formatDate(tx.created_at)}</p>
          {tx.mobile_money_number && (
            <p className="text-xs text-flash-gray-text">{tx.mobile_money_number}</p>
          )}
        </div>
      </div>

      <div className="text-right space-y-1">
        <p
          className={`font-bold text-sm ${
            isIncoming ? "text-flash-success" : "text-flash-dark"
          }`}
        >
          {isIncoming ? "+" : "-"}
          {formatSats(tx.amount_sats)}
        </p>
        <p className="text-xs text-flash-gray-text">{formatXof(tx.amount_xof)}</p>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  );
}
