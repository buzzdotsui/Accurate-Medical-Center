import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Phase 5 — concurrency: parallel IdGeneratorService allocations must never
 * hand out the same human-readable ID when CAS is used.
 *
 * We simulate a shared counter with optimistic CAS semantics (updateMany
 * returns 0 when the expected value is stale).
 */

const state = { current: 0 };

vi.mock("@/lib/db/client", () => ({
  prisma: {},
}));

const { IdGeneratorService } = await import("@/lib/utils/generate-id");

function makeSharedTx() {
  return {
    systemSetting: {
      upsert: vi.fn(async () => ({})),
      findUnique: vi.fn(async () => ({
        key: "seq_patient",
        value: { current: state.current },
      })),
      updateMany: vi.fn(async ({ where, data }: {
        where: { value: { equals: { current: number } } };
        data: { value: { current: number } };
      }) => {
        // Simulated CAS: only write if still equal to expected.
        if (state.current !== where.value.equals.current) {
          return { count: 0 };
        }
        state.current = data.value.current;
        return { count: 1 };
      }),
    },
  };
}

/** Yield to the event loop so interleaved async work can observe the counter. */
const tick = () => new Promise((r) => setImmediate(r));

describe("Phase 5 — concurrent ID allocation", () => {
  beforeEach(() => {
    state.current = 0;
  });

  it("never allocates duplicate IDs across interleaved callers", async () => {
    const ids: string[] = [];

    // Force interleaving: start many allocators without awaiting each first.
    const tasks = Array.from({ length: 25 }, async () => {
      const tx = makeSharedTx();
      // Small random delay after first read is inside getNextId; we rely on
      // updateMany CAS + retry to serialize writers.
      await tick();
      const id = await IdGeneratorService.getNextId(tx as never, "patient");
      ids.push(id);
    });

    await Promise.all(tasks);

    expect(ids).toHaveLength(25);
    expect(new Set(ids).size).toBe(25);
    expect(state.current).toBe(25);
    // Sequence must be dense: AMC-PT-000001 … AMC-PT-000025
    const numbers = ids
      .map((id) => Number(id.replace("AMC-PT-", "")))
      .sort((a, b) => a - b);
    expect(numbers[0]).toBe(1);
    expect(numbers[numbers.length - 1]).toBe(25);
  });

  it("sequential callers after contention continue from the winning counter", async () => {
    const first = await IdGeneratorService.getNextId(makeSharedTx() as never, "patient");
    const second = await IdGeneratorService.getNextId(makeSharedTx() as never, "patient");
    expect(first).toBe("AMC-PT-000001");
    expect(second).toBe("AMC-PT-000002");
  });
});

// Keep NextRequest import referenced so TS does not strip it if tests expand.
void NextRequest;
