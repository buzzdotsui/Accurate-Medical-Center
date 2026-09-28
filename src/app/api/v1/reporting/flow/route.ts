import { NextRequest } from "next/server";
import { withRole } from "@/lib/api/middleware";
import { ok } from "@/lib/api/response";
import { buildBranchFilter } from "@/lib/auth/resource-authorization";
import { ROLES } from "@/config/roles";
import { prisma } from "@/lib/db/client";

/**
 * GET /api/v1/reporting/flow?period=week|month|year
 * Returns time-series patient visit counts and revenue for the chart.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req: NextRequest, session) => {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get("period") ?? "week") as
      | "week"
      | "month"
      | "year";

    const branchFilter = buildBranchFilter(session.user);
    const branchId = branchFilter.branchId;

    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    if (period === "week") {
      // Last 7 days grouped by day name
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 6);

      const [visits, payments] = await Promise.all([
        prisma.visit.findMany({
          where: {
            startedAt: { gte: start },
            ...(branchId ? { patient: { branchId } } : {}),
          },
          select: { startedAt: true },
        }),
        prisma.payment.findMany({
          where: {
            createdAt: { gte: start },
            ...(branchId ? { invoice: { branchId } } : {}),
          },
          select: { createdAt: true, amount: true },
        }),
      ]);

      const map = new Map<string, { patients: number; revenue: number }>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        map.set(days[d.getDay()], { patients: 0, revenue: 0 });
      }
      visits.forEach((v) => {
        const k = days[v.startedAt.getDay()];
        if (map.has(k)) map.get(k)!.patients++;
      });
      payments.forEach((p) => {
        const k = days[p.createdAt.getDay()];
        if (map.has(k)) map.get(k)!.revenue += Number(p.amount);
      });

      const data = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const k = days[d.getDay()];
        return { name: k, ...(map.get(k) ?? { patients: 0, revenue: 0 }) };
      });
      return ok(data);
    }

    if (period === "month") {
      // Last 30 days grouped in ~4 weekly buckets labelled "Wk 1" … "Wk 4"
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 29);

      const [visits, payments] = await Promise.all([
        prisma.visit.findMany({
          where: {
            startedAt: { gte: start },
            ...(branchId ? { patient: { branchId } } : {}),
          },
          select: { startedAt: true },
        }),
        prisma.payment.findMany({
          where: {
            createdAt: { gte: start },
            ...(branchId ? { invoice: { branchId } } : {}),
          },
          select: { createdAt: true, amount: true },
        }),
      ]);

      const buckets = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
      const map = new Map(buckets.map((b) => [b, { patients: 0, revenue: 0 }]));

      const getWeekBucket = (date: Date) => {
        const diff = Math.floor(
          (date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        return buckets[Math.min(diff, 3)];
      };

      visits.forEach((v) => {
        const k = getWeekBucket(v.startedAt);
        map.get(k)!.patients++;
      });
      payments.forEach((p) => {
        const k = getWeekBucket(p.createdAt);
        map.get(k)!.revenue += Number(p.amount);
      });

      const data = buckets.map((b) => ({ name: b, ...(map.get(b) ?? { patients: 0, revenue: 0 }) }));
      return ok(data);
    }

    // year — last 12 months
    const start = new Date(now);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    start.setMonth(start.getMonth() - 11);

    const [visits, payments] = await Promise.all([
      prisma.visit.findMany({
        where: {
          startedAt: { gte: start },
          ...(branchId ? { patient: { branchId } } : {}),
        },
        select: { startedAt: true },
      }),
      prisma.payment.findMany({
        where: {
          createdAt: { gte: start },
          ...(branchId ? { invoice: { branchId } } : {}),
        },
        select: { createdAt: true, amount: true },
      }),
    ]);

    const map = new Map<string, { patients: number; revenue: number }>();
    for (let i = 0; i < 12; i++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i);
      map.set(months[d.getMonth()], { patients: 0, revenue: 0 });
    }
    visits.forEach((v) => {
      const k = months[v.startedAt.getMonth()];
      if (map.has(k)) map.get(k)!.patients++;
    });
    payments.forEach((p) => {
      const k = months[p.createdAt.getMonth()];
      if (map.has(k)) map.get(k)!.revenue += Number(p.amount);
    });

    const data = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(start);
      d.setMonth(d.getMonth() + i);
      const k = months[d.getMonth()];
      return { name: k, ...(map.get(k) ?? { patients: 0, revenue: 0 }) };
    });
    return ok(data);
  }
);
