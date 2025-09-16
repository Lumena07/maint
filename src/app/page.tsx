import { getAircraftList } from "@/lib/data";
import { AircraftCard } from "@/components/AircraftCard";

export default async function Home() {
  const allAircraft = await getAircraftList();
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Maintenance Dashboard</h1>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {allAircraft.map(a => <AircraftCard key={a.id} aircraft={a} />)}
      </section>
    </main>
  );
}
