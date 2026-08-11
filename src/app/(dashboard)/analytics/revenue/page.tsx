"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, CreditCard, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function RevenueAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: async () => {
      // Mock API response
      return {
        total: 142500,
        cash: 45000,
        card: 62000,
        insurance: 35500,
        recent: [
          { id: "PAY-001", amount: 150.00, method: "CARD", time: "10 mins ago" },
          { id: "PAY-002", amount: 45.00, method: "CASH", time: "1 hour ago" }
        ]
      };
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Financial Analytics</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border/50 bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Collected (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${data?.total.toLocaleString() || '0'}</div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 grid grid-cols-3 gap-4">
          <Card className="border-none shadow-sm ring-1 ring-border/50">
             <CardHeader className="pb-2 text-center"><CardTitle className="text-sm text-muted-foreground">Cash</CardTitle></CardHeader>
             <CardContent className="text-center"><div className="text-xl font-bold">${data?.cash.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-border/50">
             <CardHeader className="pb-2 text-center"><CardTitle className="text-sm text-muted-foreground">Card / Transfer</CardTitle></CardHeader>
             <CardContent className="text-center"><div className="text-xl font-bold">${data?.card.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-border/50">
             <CardHeader className="pb-2 text-center"><CardTitle className="text-sm text-muted-foreground">Insurance / HMO</CardTitle></CardHeader>
             <CardContent className="text-center"><div className="text-xl font-bold">${data?.insurance.toLocaleString()}</div></CardContent>
          </Card>
        </div>
      </div>
      
      {/* Mock chart area */}
      <Card className="border-none shadow-sm ring-1 ring-border/50 min-h-[300px] flex items-center justify-center bg-muted/10">
        <div className="text-center text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Revenue Time-Series Chart Component would mount here (e.g., Recharts)</p>
        </div>
      </Card>
    </div>
  );
}
