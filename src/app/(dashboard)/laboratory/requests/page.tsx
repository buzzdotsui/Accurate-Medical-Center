"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, FileText } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface LabRequest {
  id: string;
  requestId: string;
  testName: string;
  priority: string;
  status: string;
  createdAt: string;
  category: { name: string };
  visit: { patient: { firstName: string; lastName: string; patientId: string } };
  doctor: { user: { name: string } };
}

export default function LabRequestsQueue() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lab-requests'],
    queryFn: async () => {
      const res = await fetch('/api/v1/laboratory/requests');
      if (!res.ok) throw new Error('Failed to fetch lab requests');
      const json = await res.json();
      return json.data as LabRequest[];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Active Lab Requests</h1>
          <p className="text-muted-foreground mt-1">Process test requests ordered by physicians.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-lg font-medium text-destructive">Failed to load lab requests</h3>
              <p className="text-muted-foreground mt-1">{(error as Error)?.message}</p>
              <button onClick={() => refetch()} className="mt-4 text-sm text-primary underline">Retry</button>
            </div>
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No active lab requests</h3>
              <p className="text-muted-foreground mt-1">All tests have been processed.</p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Order Time</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Patient</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Test Name</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Priority</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.map((req) => (
                    <tr key={req.id} className="border-b transition-colors hover:bg-muted/30 group">
                      <td className="p-6 align-middle font-medium">{new Date(req.createdAt).toLocaleTimeString()}</td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base">{req.visit.patient.firstName + ' ' + req.visit.patient.lastName}</div>
                        <div className="text-xs text-muted-foreground">{req.visit.patient.patientId}</div>
                      </td>
                      <td className="p-6 align-middle font-medium">
                        {req.testName}
                      </td>
                      <td className="p-6 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          req.priority === 'STAT' || req.priority === 'URGENT' ? 'bg-destructive/10 text-destructive' : 'bg-info/10 text-info'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-right">
                        <Button variant={req.priority === 'STAT' ? 'destructive' : 'default'} asChild className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Link href={`/laboratory/requests/${req.id}`}>
                            <FlaskConical className="w-4 h-4 mr-2" />
                            Input Results
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
