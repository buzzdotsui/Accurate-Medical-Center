import { describe, expect, it } from "vitest";
import { calcBMI, calcBSA, classifyBP } from "@/services/vitals.service";

describe("calcBMI", () => {
  it("computes BMI from weight (kg) and height (cm)", () => {
    // 70kg, 175cm -> 70 / (1.75^2) = 22.857... -> rounded to 1dp = 22.9
    expect(calcBMI(70, 175)).toBe(22.9);
  });

  it("returns undefined when weight or height is missing", () => {
    expect(calcBMI(undefined, 175)).toBeUndefined();
    expect(calcBMI(70, undefined)).toBeUndefined();
    expect(calcBMI(undefined, undefined)).toBeUndefined();
  });

  it("returns undefined when height is zero or negative", () => {
    expect(calcBMI(70, 0)).toBeUndefined();
    expect(calcBMI(70, -10)).toBeUndefined();
  });
});

describe("calcBSA", () => {
  it("computes BSA using the Mosteller formula", () => {
    // sqrt((70 * 175) / 3600) = sqrt(3.4027..) = 1.8446.. -> rounded to 2dp = 1.84
    expect(calcBSA(70, 175)).toBe(1.84);
  });

  it("returns undefined when weight or height is missing", () => {
    expect(calcBSA(undefined, 175)).toBeUndefined();
    expect(calcBSA(70, undefined)).toBeUndefined();
  });
});

describe("classifyBP", () => {
  it("returns undefined for missing or malformed input", () => {
    expect(classifyBP(undefined)).toBeUndefined();
    expect(classifyBP("")).toBeUndefined();
    expect(classifyBP("not-a-bp")).toBeUndefined();
    expect(classifyBP("120")).toBeUndefined();
  });

  it("classifies a normal blood pressure", () => {
    expect(classifyBP("110/70")).toBe("NORMAL");
  });

  it("classifies elevated blood pressure", () => {
    expect(classifyBP("125/70")).toBe("ELEVATED");
  });

  it("classifies hypertension stage 1", () => {
    expect(classifyBP("135/82")).toBe("HYPERTENSION_STAGE_1");
  });

  it("classifies hypertension stage 2", () => {
    expect(classifyBP("145/95")).toBe("HYPERTENSION_STAGE_2");
  });

  it("classifies a hypertensive crisis", () => {
    expect(classifyBP("185/125")).toBe("HYPERTENSIVE_CRISIS");
  });

  it("classifies hypotension", () => {
    expect(classifyBP("85/55")).toBe("HYPOTENSION");
  });
});
