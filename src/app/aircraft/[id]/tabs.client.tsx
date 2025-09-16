"use client";
import { useState } from "react";
import { Aircraft, MaintenanceTask, ComplianceRecord, Assembly, Snag, Component } from "@/lib/types";
import { Projections } from "@/components/Projections";
import { SnagsList } from "@/components/SnagsList";
import { TasksComponentsTable } from "@/components/TasksComponentsTable";

type TabProps = {
  aircraft: Aircraft;
  tasks: MaintenanceTask[];
  compliance: ComplianceRecord[];
  snags: Snag[];
  assemblies: Assembly[];
  components: Component[];
};

type Tab = "tasks-components" | "hours" | "projections" | "snags";

export default function AircraftTabs({ aircraft, tasks, compliance, snags, assemblies, components }: TabProps) {
  const [activeTab, setActiveTab] = useState<Tab>("tasks-components");

  const engines = assemblies.filter(a => a.type === "Engine");
  const props = assemblies.filter(a => a.type === "Propeller");

  const tabs: { id: Tab; label: string }[] = [
    { id: "tasks-components", label: "Tasks/Components" },
    { id: "hours", label: "Hours" },
    { id: "projections", label: "Projections" },
    { id: "snags", label: "Snags" },
  ];

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: Tab) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveTab(tabId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "tasks-components" && (
          <div id="tabpanel-tasks-components" role="tabpanel" aria-labelledby="tab-tasks-components">
            <TasksComponentsTable 
              aircraft={aircraft} 
              tasks={tasks} 
              components={components} 
            />
          </div>
        )}

        {activeTab === "hours" && (
          <div id="tabpanel-hours" role="tabpanel" aria-labelledby="tab-hours">
            <div className="rounded border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Aircraft Hours & Cycles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded bg-gray-50 p-4">
                  <div className="text-sm text-gray-600 mb-1">Aircraft Total</div>
                  <div className="text-2xl font-mono font-bold">{aircraft.currentHrs.toFixed(1)}h</div>
                  <div className="text-sm text-gray-500">{aircraft.currentCyc} cycles</div>
                </div>
                {engines.map(e => (
                  <div key={e.id} className="rounded bg-gray-50 p-4">
                    <div className="text-sm text-gray-600 mb-1">Engine {e.position}</div>
                    <div className="text-lg font-mono font-semibold">{e.tsnHrs.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">{e.csn} cycles</div>
                    <div className="text-xs text-gray-400 mt-1">
                      TSO: {(e.tsoHrs ?? 0).toFixed(1)}h / {e.cso ?? 0}c
                    </div>
                  </div>
                ))}
                {props.map(p => (
                  <div key={p.id} className="rounded bg-gray-50 p-4">
                    <div className="text-sm text-gray-600 mb-1">Prop {p.position}</div>
                    <div className="text-lg font-mono font-semibold">{p.tsnHrs.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">{p.csn} cycles</div>
                    <div className="text-xs text-gray-400 mt-1">
                      TSO: {(p.tsoHrs ?? 0).toFixed(1)}h / {p.cso ?? 0}c
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "projections" && (
          <div id="tabpanel-projections" role="tabpanel" aria-labelledby="tab-projections">
            <div className="rounded border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Projections 30/60/90</h2>
              <Projections aircraft={aircraft} tasks={tasks} />
            </div>
          </div>
        )}

        {activeTab === "snags" && (
          <div id="tabpanel-snags" role="tabpanel" aria-labelledby="tab-snags">
            <div className="rounded border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Snags</h2>
              <SnagsList snags={snags} today={aircraft.currentDate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 