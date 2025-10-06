"use client";

import { useState, useEffect } from "react";
import { ReliabilityMetric, Aircraft, ReliabilityMetricType } from "@/lib/types";

interface TrendAnalysisProps {
  aircraft: Aircraft[];
}

interface TrendData {
  metricType: ReliabilityMetricType;
  period: string;
  dataPoints: {
    date: string;
    value: number;
    aircraftId: string;
  }[];
  trend: "IMPROVING" | "STABLE" | "DEGRADING";
  changePercent: number;
  significance: "HIGH" | "MEDIUM" | "LOW";
}

const TrendAnalysis = ({ aircraft }: TrendAnalysisProps) => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");

  useEffect(() => {
    fetchTrendData();
  }, [selectedAircraft, selectedMetric]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      
      // Fetch metrics for multiple periods to analyze trends
      const periods = ["7_DAYS", "30_DAYS", "90_DAYS"];
      const allMetrics: ReliabilityMetric[] = [];

      for (const period of periods) {
        const params = new URLSearchParams();
        if (selectedAircraft !== "all") {
          params.append("aircraftId", selectedAircraft);
        }
        params.append("period", period);

        const response = await fetch(`/api/reliability/metrics?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          allMetrics.push(...data);
        }
      }

      // Analyze trends
      const analyzedTrends = analyzeTrends(allMetrics, selectedMetric);
      setTrendData(analyzedTrends);
    } catch (err) {
      setError("Error fetching trend data");
      console.error("Error fetching trend data:", err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTrends = (metrics: ReliabilityMetric[], filterMetric: string): TrendData[] => {
    const trends: TrendData[] = [];
    
    // Group metrics by type and aircraft
    const grouped: { [key: string]: ReliabilityMetric[] } = {};
    
    metrics.forEach(metric => {
      const key = `${metric.metricType}_${metric.aircraftId}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(metric);
    });

    // Analyze each group
    Object.entries(grouped).forEach(([key, groupMetrics]) => {
      const [metricType, aircraftId] = key.split('_');
      
      // Skip if filtering by specific metric type
      if (filterMetric !== "all" && metricType !== filterMetric) {
        return;
      }

      // Sort by period (most recent first)
      const sortedMetrics = groupMetrics.sort((a, b) => {
        const periodOrder = { "7_DAYS": 1, "30_DAYS": 2, "90_DAYS": 3 };
        return periodOrder[a.period as keyof typeof periodOrder] - periodOrder[b.period as keyof typeof periodOrder];
      });

      if (sortedMetrics.length >= 2) {
        const latest = sortedMetrics[0];
        const previous = sortedMetrics[sortedMetrics.length - 1];
        
        const changePercent = ((latest.value - previous.value) / previous.value) * 100;
        const trend = determineTrendDirection(changePercent);
        const significance = determineSignificance(Math.abs(changePercent));

        const dataPoints = sortedMetrics.map(metric => ({
          date: metric.calculatedDate,
          value: metric.value,
          aircraftId: metric.aircraftId
        }));

        trends.push({
          metricType: latest.metricType,
          period: latest.period,
          dataPoints,
          trend,
          changePercent,
          significance
        });
      }
    });

    return trends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  };

  const determineTrendDirection = (changePercent: number): "IMPROVING" | "STABLE" | "DEGRADING" => {
    if (changePercent > 5) return "IMPROVING";
    if (changePercent < -5) return "DEGRADING";
    return "STABLE";
  };

  const determineSignificance = (changePercent: number): "HIGH" | "MEDIUM" | "LOW" => {
    if (changePercent > 20) return "HIGH";
    if (changePercent > 10) return "MEDIUM";
    return "LOW";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        );
      case "DEGRADING":
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        );
      case "STABLE":
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return "text-green-600 bg-green-100";
      case "DEGRADING":
        return "text-red-600 bg-red-100";
      case "STABLE":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAircraftName = (aircraftId: string) => {
    const ac = aircraft.find(a => a.id === aircraftId);
    return ac ? ac.registration : aircraftId;
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Analyzing trends...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={fetchTrendData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="aircraft-trend-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft
            </label>
            <select
              id="aircraft-trend-filter"
              value={selectedAircraft}
              onChange={(e) => setSelectedAircraft(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Aircraft</option>
              {aircraft.map(ac => (
                <option key={ac.id} value={ac.id}>{ac.registration}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="metric-trend-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Metric Type
            </label>
            <select
              id="metric-trend-filter"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Metrics</option>
              <option value="MTBF">MTBF</option>
              <option value="MTTR">MTTR</option>
              <option value="FAILURE_RATE">Failure Rate</option>
              <option value="DISPATCH_RELIABILITY">Dispatch Reliability</option>
              <option value="PIREP_FREQUENCY">PIREP Frequency</option>
              <option value="COMPONENT_RELIABILITY">Component Reliability</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchTrendData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Trend Analysis Results */}
      {trendData.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <p>No trend data available for the selected filters.</p>
            <p className="text-sm mt-2">Try selecting different aircraft or metric types.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trendData.map((trend, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {trend.metricType.replace(/_/g, ' ')} - {getAircraftName(trend.dataPoints[0].aircraftId)}
                  </h3>
                  <span className="ml-2 text-sm text-gray-500">
                    ({trend.period.replace(/_/g, ' ')})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(trend.trend)}`}>
                    {getTrendIcon(trend.trend)}
                    <span className="ml-1">{trend.trend}</span>
                  </div>
                  <div className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSignificanceColor(trend.significance)}`}>
                    {trend.significance} SIGNIFICANCE
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatChangePercent(trend.changePercent)}
                  </div>
                  <div className="text-sm text-gray-500">Change</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {trend.dataPoints.length}
                  </div>
                  <div className="text-sm text-gray-500">Data Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {trend.dataPoints[0].value.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Latest Value</div>
                </div>
              </div>

              {/* Simple trend visualization */}
              <div className="mt-4">
                <div className="flex items-end space-x-2 h-20">
                  {trend.dataPoints.map((point, pointIndex) => {
                    const maxValue = Math.max(...trend.dataPoints.map(p => p.value));
                    const minValue = Math.min(...trend.dataPoints.map(p => p.value));
                    const range = maxValue - minValue || 1;
                    const height = ((point.value - minValue) / range) * 100;
                    
                    return (
                      <div key={pointIndex} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-full rounded-t ${
                            trend.trend === "IMPROVING" ? "bg-green-400" :
                            trend.trend === "DEGRADING" ? "bg-red-400" :
                            "bg-gray-400"
                          }`}
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {point.value.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>90 Days</span>
                  <span>30 Days</span>
                  <span>7 Days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;
