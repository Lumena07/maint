import { notFound } from "next/navigation";
import { getAircraftById, getTasksForAircraft, getChecksForAircraft, getComplianceForAircraft, getSnagsForAircraft, getAssembliesForAircraft } from "@/lib/data";
import { DueList } from "@/components/DueList";
import { Projections } from "@/components/Projections";
import { SnagsList } from "@/components/SnagsList";
import ClientDueSection from "./section.client";

export default async function AircraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ac = await getAircraftById(id);
  if (!ac) return notFound();
  const [tasks, snags, checks, compliance, assemblies] = await Promise.all([
    getTasksForAircraft(ac),
    getSnagsForAircraft(ac),
    getChecksForAircraft(ac),
    getComplianceForAircraft(ac),
    getAssembliesForAircraft(ac)
  ]);
  const engines = assemblies.filter(a => a.type === "Engine");
  const props = assemblies.filter(a => a.type === "Propeller");

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">{ac.registration}</h1>
        <div className="mt-1 text-sm text-gray-600">{ac.type} • TSN {ac.currentHrs.toFixed(1)}h • CSN {ac.currentCyc}</div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <ClientDueSection aircraft={ac} tasks={tasks} checks={checks} compliance={compliance} />

          <div className="rounded border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Projections 30/60/90</h2>
            <Projections aircraft={ac} tasks={tasks} checks={checks} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Utilization Snapshot</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded bg-gray-50 p-2">
                <div className="text-gray-500">Aircraft TSN / CSN</div>
                <div className="font-mono">{ac.currentHrs.toFixed(1)} h / {ac.currentCyc} c</div>
              </div>
              {engines.map(e => (
                <div key={e.id} className="rounded bg-gray-50 p-2">
                  <div className="text-gray-500">Engine {e.position} TSN/CSN • TSO/CSO</div>
                  <div className="font-mono">{e.tsnHrs.toFixed(1)} h / {e.csn} c • {(e.tsoHrs ?? 0).toFixed(1)} h / {e.cso ?? 0} c</div>
                </div>
              ))}
              {props.map(p => (
                <div key={p.id} className="rounded bg-gray-50 p-2">
                  <div className="text-gray-500">Prop {p.position} TSN/CSN • TSO/CSO</div>
                  <div className="font-mono">{p.tsnHrs.toFixed(1)} h / {p.csn} c • {(p.tsoHrs ?? 0).toFixed(1)} h / {p.cso ?? 0} c</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Snags</h2>
            <SnagsList snags={snags} today={ac.currentDate} />
          </div>
        </div>
      </section>
    </main>
  );
}


