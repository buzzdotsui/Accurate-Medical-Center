"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function AuditLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      // Mock data representing the AuditLog model output
      return {
        data: [
          { id: "LOG-001", action: "PROCESS_PAYMENT", resource: "INVOICE", user: { firstName: "Admin", lastName: "User" }, role: "CASHIER", time: "10 mins ago", details: '{"amount": 145}' },
          { id: "LOG-002", action: "ADMIT_PATIENT", resource: "ADMISSION", user: { firstName: "Dr.", lastName: "Adams" }, role: "ADMIN", time: "1 hour ago", details: '{"bedId": "A-04"}' },
          { id: "LOG-003", action: "UPDATE_SETTINGS", resource: "SYSTEM", user: { firstName: "Super", lastName: "Admin" }, role: "SUPER_ADMIN", time: "2 days ago", details: '{"currency": "USD"}' },
        ]
      };
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">Immutable record of system activities.</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border/50">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/6">Timestamp</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/4">Action</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/4">User</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground w-1/3">Payload Details</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.data.map((log: any) => (
                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="p-6 align-middle font-medium text-muted-foreground whitespace-nowrap">
                        {log.time}
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-bold text-primary">{log.action}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">{log.resource}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <div className="font-medium text-foreground">{log.user.firstName} {log.user.lastName}</div>
                        <div className="text-xs text-muted-foreground mt-1">{log.role}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <pre className="text-xs bg-muted/50 p-2 rounded border font-mono overflow-x-auto max-w-sm">
                          {log.details}
                        </pre>
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
