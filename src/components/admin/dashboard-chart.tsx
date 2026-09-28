"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type Period = "week" | "month" | "year";

const PERIODS: { label: string; value: Period }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const PERIOD_LABELS: Record<Period, string> = {
  week: "last 7 days",
  month: "last 30 days",
  year: "last 12 months",
};

export function DashboardChart() {
  const [period, setPeriod] = useState<Period>("week");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-chart", period],
    queryFn: async () => {
      const res = await fetch(`/api/v1/reporting/flow?period=${period}`);
      if (!res.ok) throw new Error("Failed to load chart data");
      const json = await res.json();
      return json.data as { name: string; patients: number; revenue: number }[];
    },
    staleTime: 60_000,
  });

  return (
    <div className="bg-white border border-black/[0.04] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Activity Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Patient flow — {PERIOD_LABELS[period]}
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                period === p.value
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : !data || data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No activity data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4e842" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4e842" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/90 backdrop-blur-xl border border-black/[0.04] p-3 rounded-xl shadow-xl shadow-primary/5">
                        <p className="text-sm font-semibold mb-1">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {payload[0].value}
                          </span>{" "}
                          patients
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="patients"
                stroke="#d4e842"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPatients)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
