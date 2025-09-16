import { notFound } from "next/navigation";
import { getAircraftById, getTasksForAircraft, getComplianceForAircraft, getSnagsForAircraft, getAssembliesForAircraft, getComponentsForAircraft } from "@/lib/data";
import AircraftTabs from "./tabs.client";

export default async function AircraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ac = await getAircraftById(id);
  if (!ac) return notFound();
  const [tasks, snags, compliance, assemblies, components] = await Promise.all([
    getTasksForAircraft(ac),
    getSnagsForAircraft(ac),
    getComplianceForAircraft(ac),
    getAssembliesForAircraft(ac),
    getComponentsForAircraft(ac)
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{ac.registration}</h1>
        <div className="mt-1 text-sm text-gray-600">{ac.type} • TSN {ac.currentHrs.toFixed(1)}h • CSN {ac.currentCyc}</div>
      </header>

      <AircraftTabs 
        aircraft={ac} 
        tasks={tasks} 
        compliance={compliance} 
        snags={snags} 
        assemblies={assemblies}
        components={components}
      />
    </main>
  );
}


