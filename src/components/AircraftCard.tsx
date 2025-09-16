"use client";
import Link from "next/link";
import { Aircraft } from "@/lib/types";

export const AircraftCard = ({ aircraft }: { aircraft: Aircraft }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") {
      const link = document.getElementById(`go-${aircraft.id}`) as HTMLAnchorElement | null;
      if (link) link.click();
    }
  };

  return (
    <article
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
      tabIndex={0}
      aria-label={`Aircraft ${aircraft.registration}`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{aircraft.registration}</h3>
        <span className="text-xs text-gray-600">{aircraft.type}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded bg-gray-50 p-2">
          <div className="text-gray-500">TSN (hrs)</div>
          <div className="font-mono">{aircraft.currentHrs.toFixed(1)}</div>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <div className="text-gray-500">CSN</div>
          <div className="font-mono">{aircraft.currentCyc}</div>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <div className="text-gray-500">Avg/day</div>
          <div className="font-mono">{aircraft.avgDailyHrs.toFixed(1)}h / {aircraft.avgDailyCyc}c</div>
        </div>
      </div>
      <Link id={`go-${aircraft.id}`} href={`/aircraft/${aircraft.id}`} className="mt-4 inline-block rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-600">
        Open
      </Link>
    </article>
  );
};


