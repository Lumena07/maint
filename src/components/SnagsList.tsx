"use client";
import { Snag } from "@/lib/types";

const daysBetween = (a: Date, b: Date) => Math.ceil((b.getTime() - a.getTime()) / 86400000);

export const SnagsList = ({ snags, today }: { snags: Snag[]; today: string }) => {
  if (snags.length === 0) return <p className="text-sm text-gray-500">No snags.</p>;
  const now = new Date(today);

  return (
    <ul className="divide-y rounded border bg-white">
      {snags.map(s => {
        const expiresIn = s.status === "Deferred" && s.deferralStart && s.deferralLimitDays
          ? s.deferralLimitDays - daysBetween(new Date(s.deferralStart), now)
          : undefined;

        return (
          <li key={s.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{s.description}</div>
              <span className={
                "rounded px-2 py-0.5 text-xs class:" +
                (s.status === "Open" ? "bg-amber-100 text-amber-700" :
                 s.status === "Deferred" ? "bg-blue-100 text-blue-700" :
                 "bg-emerald-100 text-emerald-700")
              }>
                {s.status}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              Reported {s.reportedAt} by {s.reportedBy}{s.MELRef ? ` • MEL ${s.MELRef}` : ""}
              {typeof expiresIn === "number" ? ` • Expires in ${Math.max(expiresIn, 0)} days` : ""}
            </div>
          </li>
        );
      })}
    </ul>
  );
};


