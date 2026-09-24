import Link from "next/link";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button asChild (Slot single-child contract)", () => {
  it("renders a single Link child without throwing", () => {
    let html = "";
    expect(() => {
      html = renderToString(
        <Button asChild variant="outline">
          <Link href="/admin/patients">View</Link>
        </Button>,
      );
    }).not.toThrow();
    expect(html).toContain("/admin/patients");
    expect(html).toContain("View");
  });

  it("does not inject icon placeholder siblings when asChild", () => {
    // Regression: multi-child Slot throws
    // "Slot failed to slot onto its children" → dashboard error boundary.
    const html = renderToString(
      <Button asChild>
        <Link href="/pharmacy/inventory">Open inventory</Link>
      </Button>,
    );
    expect(html).toContain("/pharmacy/inventory");
    // No leftover svg/loader fragments from the non-asChild icon path.
    expect(html).not.toContain("animate-spin");
  });

  it("still renders a real button when asChild is false", () => {
    const html = renderToString(<Button>Register</Button>);
    expect(html).toContain("<button");
    expect(html).toContain("Register");
  });
});
