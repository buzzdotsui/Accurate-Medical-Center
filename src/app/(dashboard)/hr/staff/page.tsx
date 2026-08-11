"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function StaffDirectory() {
  const { data, isLoading } = useQuery({
    queryKey: ['hr-staff'],
    queryFn: async () => {
      // Mock data for frontend demo
      return [
        { id: "EMP-001", name: "Dr. Sarah Adams", role: "DOCTOR", department: "Cardiology", status: "ACTIVE", email: "s.adams@accurate.med", phone: "555-0101" },
        { id: "EMP-002", name: "John Lee", role: "NURSE", department: "ICU", status: "ACTIVE", email: "j.lee@accurate.med", phone: "555-0102" },
        { id: "EMP-003", name: "Emily Chen", role: "PHARMACIST", department: "Pharmacy", status: "ON_LEAVE", email: "e.chen@accurate.med", phone: "555-0103" },
      ];
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Staff Directory</h1>
          <p className="text-muted-foreground mt-1">View and manage hospital personnel records.</p>
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
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Employee</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Department</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Contact</th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data?.map((staff: any) => (
                    <tr key={staff.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="p-6 align-middle">
                        <div className="font-bold text-base flex items-center gap-2">
                          {staff.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{staff.id} • {staff.role}</div>
                      </td>
                      <td className="p-6 align-middle font-medium">
                        {staff.department}
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        <div className="flex items-center gap-2 text-xs"><Mail className="w-3 h-3" /> {staff.email}</div>
                        <div className="flex items-center gap-2 text-xs mt-1"><Phone className="w-3 h-3" /> {staff.phone}</div>
                      </td>
                      <td className="p-6 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          staff.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {staff.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
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
