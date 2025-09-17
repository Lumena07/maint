"use client";
import { Aircraft, MaintenanceTask, Component } from "@/lib/types";

type ProjectionsProps = {
  aircraft: Aircraft;
  tasks: MaintenanceTask[];
  components: Component[];
};

export const Projections = ({ aircraft, tasks, components }: ProjectionsProps) => {
  // Filter items that are due within the specified days
  const getItemsDueWithin = (days: number) => {
    const safeComponents = components || [];
    const allItems = [...tasks, ...safeComponents];
    return allItems.filter(item => {
      // Check if item has projectedDays and it's within the specified range
      if (item.projectedDays !== undefined) {
        return item.projectedDays <= days && item.projectedDays > 0;
      }
      
      // Fallback to old logic if projectedDays is not available
      const remainingHrs = item.remainingHrs || 0;
      const remainingCyc = item.remainingCyc || 0;
      const remainingDays = item.remainingDays || 0;
      
      // Convert to days using aircraft averages
      let projectedDays = 0;
      if (remainingHrs > 0) {
        projectedDays = remainingHrs / aircraft.avgDailyHrs;
      } else if (remainingCyc > 0) {
        projectedDays = remainingCyc / aircraft.avgDailyCyc;
      } else if (remainingDays > 0) {
        projectedDays = remainingDays;
      }
      
      return projectedDays <= days && projectedDays > 0;
    });
  };

  const items30d = getItemsDueWithin(30);
  const items60d = getItemsDueWithin(60);
  const items90d = getItemsDueWithin(90);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projection 30d</h3>
        <p className="text-sm text-gray-600 mb-4">
          {items30d.length} due within 30 days
        </p>
        {items30d.length === 0 ? (
          <p className="text-gray-500 italic">Nothing due in this window.</p>
        ) : (
          <div className="space-y-2">
            {items30d.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">
                    {'title' in item ? item.title : item.name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({'category' in item ? item.category : item.type})
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.projectedDays ? `${Math.ceil(item.projectedDays)} days` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projection 60d</h3>
        <p className="text-sm text-gray-600 mb-4">
          {items60d.length} due within 60 days
        </p>
        {items60d.length === 0 ? (
          <p className="text-gray-500 italic">Nothing due in this window.</p>
        ) : (
          <div className="space-y-2">
            {items60d.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">
                    {'title' in item ? item.title : item.name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({'category' in item ? item.category : item.type})
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.projectedDays ? `${Math.ceil(item.projectedDays)} days` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projection 90d</h3>
        <p className="text-sm text-gray-600 mb-4">
          {items90d.length} due within 90 days
        </p>
        {items90d.length === 0 ? (
          <p className="text-gray-500 italic">Nothing due in this window.</p>
        ) : (
          <div className="space-y-2">
            {items90d.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">
                    {'title' in item ? item.title : item.name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({'category' in item ? item.category : item.type})
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {item.projectedDays ? `${Math.ceil(item.projectedDays)} days` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


