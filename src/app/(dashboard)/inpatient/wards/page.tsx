"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, User, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function WardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['wards-overview'],
    queryFn: async () => {
      // Mock data for UI layout
      return [
        { 
          id: "w1", name: "General Ward A", type: "GENERAL", capacity: 20, 
          beds: Array(20).fill(null).map((_, i) => ({ 
            id: `b${i}`, number: `A-${(i+1).toString().padStart(2, '0')}`, 
            status: i < 18 ? "OCCUPIED" : "AVAILABLE",
            patient: i < 18 ? { name: "Occupied Patient", id: "AMC-..." } : null
          })) 
        },
        { 
          id: "w2", name: "Intensive Care Unit (ICU)", type: "ICU", capacity: 10, 
          beds: Array(10).fill(null).map((_, i) => ({ 
            id: `b${i+20}`, number: `ICU-${(i+1).toString().padStart(2, '0')}`, 
            status: i < 9 ? "OCCUPIED" : (i === 9 ? "MAINTENANCE" : "AVAILABLE"),
            patient: i < 9 ? { name: "Critical Patient", id: "AMC-..." } : null
          })) 
        }
      ];
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Ward & Bed Overview</h1>
        <p className="text-muted-foreground mt-1">Live map of hospital bed availability and occupancy.</p>
      </div>

      <div className="flex gap-4 p-4 border rounded-lg bg-muted/30 text-sm">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div> Available</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div> Occupied</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning"></div> Maintenance</div>
      </div>

      <div className="space-y-8">
        {data?.map(ward => (
          <Card key={ward.id} className="border-none shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b bg-muted/10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{ward.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{ward.type} • Capacity: {ward.capacity}</p>
                </div>
                <div className="text-right text-sm font-medium">
                  {ward.beds.filter((b: any) => b.status === "OCCUPIED").length} / {ward.capacity} Occupied
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {ward.beds.map((bed: any) => (
                  <div 
                    key={bed.id} 
                    className={`relative p-3 rounded-lg border flex flex-col items-center text-center group transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                      bed.status === 'AVAILABLE' ? 'bg-success/5 border-success/20 hover:border-success/50 hover:shadow-[0_4px_12px_rgba(34,197,94,0.1)]' : 
                      bed.status === 'MAINTENANCE' ? 'bg-warning/5 border-warning/20 hover:border-warning/50 hover:shadow-[0_4px_12px_rgba(245,158,11,0.1)]' : 
                      'bg-destructive/5 border-destructive/20 hover:border-destructive/50 hover:shadow-[0_4px_12px_rgba(239,68,68,0.1)]'
                    }`}
                  >
                    <Bed className={`w-6 h-6 mb-2 ${
                      bed.status === 'AVAILABLE' ? 'text-success' : 
                      bed.status === 'MAINTENANCE' ? 'text-warning' : 
                      'text-destructive'
                    }`} />
                    <span className="font-bold text-sm">{bed.number}</span>
                    
                    {bed.status === 'OCCUPIED' && (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 z-10">
                        <User className="w-4 h-4 text-foreground mb-1" />
                        <span className="text-xs font-medium text-foreground truncate w-full">{bed.patient.name}</span>
                        <Button variant="link" size="sm" className="h-6 mt-1 text-[10px] px-2">View Info</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
