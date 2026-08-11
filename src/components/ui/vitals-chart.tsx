"use client"

import * as React from "react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"

export type VitalsData = {
  date: string
  systolic?: number
  diastolic?: number
  heartRate?: number
  temperature?: number
  weight?: number
}

interface VitalsChartProps {
  data: VitalsData[]
  title?: string
  type: "bloodPressure" | "heartRate" | "temperature" | "weight"
}

export function VitalsChart({ data, title, type }: VitalsChartProps) {
  const formatXAxis = (tickItem: string) => {
    try {
      return format(parseISO(tickItem), "MMM d")
    } catch {
      return tickItem
    }
  }

  const getChartConfig = () => {
    switch (type) {
      case "bloodPressure":
        return {
          title: title || "Blood Pressure (mmHg)",
          lines: [
            { key: "systolic", name: "Systolic", color: "var(--color-destructive)" },
            { key: "diastolic", name: "Diastolic", color: "var(--color-info)" },
          ],
          domain: [40, 200]
        }
      case "heartRate":
        return {
          title: title || "Heart Rate (bpm)",
          lines: [
            { key: "heartRate", name: "Heart Rate", color: "var(--color-warning)" },
          ],
          domain: [40, 150]
        }
      case "temperature":
        return {
          title: title || "Temperature (°C)",
          lines: [
            { key: "temperature", name: "Temperature", color: "var(--color-destructive)" },
          ],
          domain: [35, 42]
        }
      case "weight":
        return {
          title: title || "Weight (kg)",
          lines: [
            { key: "weight", name: "Weight", color: "var(--color-primary)" },
          ],
          domain: ['auto', 'auto']
        }
    }
  }

  const config = getChartConfig()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis} 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                stroke="var(--color-muted-foreground)"
              />
              <YAxis 
                domain={config.domain as any} 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                stroke="var(--color-muted-foreground)"
              />
              <Tooltip 
                labelFormatter={(label) => formatXAxis(String(label))}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {config.lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
