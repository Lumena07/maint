import { getAircraftList } from "@/lib/data";
import { MainDashboardTabs } from "@/components/MainDashboardTabs";

export default async function Home() {
  const allAircraft = await getAircraftList();
  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Maintenance Dashboard</h1>
      <MainDashboardTabs aircraft={allAircraft} />
    </main>
  );
}
