import { describe, it, expect } from "vitest";
import {
  CHART_VIEWBOX,
  donutSegments,
  percentToDegrees,
  seriesMaximum,
  toPolylinePoints,
} from "@/features/admin/chart-geometry";

describe("toPolylinePoints", () => {
  it("spans the full width and puts the peak at the top", () => {
    const points = toPolylinePoints([0, 5, 10], 10).split(" ");

    expect(points[0]).toBe("0,60");
    expect(points[2]).toBe(`${CHART_VIEWBOX.width},0`);
  });

  it("measures from zero rather than from the smallest value", () => {
    // 8 and 10 are close; against a zero baseline they must stay close.
    const [first, second] = toPolylinePoints([8, 10], 10).split(" ");

    expect(first).toBe("0,12");
    expect(second).toBe("100,0");
  });

  it("draws an all-zero series flat along the bottom instead of dividing by zero", () => {
    expect(toPolylinePoints([0, 0, 0], 0)).toBe("0,60 50,60 100,60");
  });

  it("is empty for an empty series", () => {
    expect(toPolylinePoints([], 10)).toBe("");
  });

  it("places a lone point at the left edge without dividing by zero", () => {
    expect(toPolylinePoints([5], 10)).toBe("0,30");
  });
});

describe("seriesMaximum", () => {
  it("takes the tallest value across every series so they share an axis", () => {
    expect(seriesMaximum([1, 2], [9, 3])).toBe(9);
  });

  it("is zero for no data at all", () => {
    expect(seriesMaximum([], [])).toBe(0);
  });
});

describe("donutSegments", () => {
  it("lays each segment after the one before it", () => {
    const [first, second] = donutSegments([50, 50]);

    expect(first?.dashOffset).toBe(-0);
    expect(second?.dashOffset).toBeLessThan(0);
  });

  it("consumes the whole ring when the shares total 100", () => {
    const circumference = 2 * Math.PI * 40;
    const drawn = donutSegments([50, 30, 20]).reduce(
      (total, segment) => total + Number(segment.dashArray.split(" ")[0]),
      0,
    );

    expect(drawn).toBeCloseTo(circumference, 1);
  });

  it("treats a negative or absurd share as nothing rather than wrapping the ring", () => {
    const [negative] = donutSegments([-10]);
    const [over] = donutSegments([250]);
    const circumference = 2 * Math.PI * 40;

    expect(Number(negative?.dashArray.split(" ")[0])).toBe(0);
    expect(Number(over?.dashArray.split(" ")[0])).toBeCloseTo(circumference, 1);
  });
});

describe("percentToDegrees", () => {
  it("maps a quarter of the ring to 90 degrees", () => {
    expect(percentToDegrees(25)).toBe(90);
  });
});
