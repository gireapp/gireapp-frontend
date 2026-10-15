import { describe, it, expect } from "vitest";
import { pageNumbers } from "@/features/admin/students-pagination";

describe("pageNumbers", () => {
  it("lists every page when they all fit", () => {
    expect(pageNumbers(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("matches the design's 1-5 … last shape", () => {
    expect(pageNumbers(1, 50)).toEqual([1, 2, 3, 4, 5, "ellipsis", 50]);
  });

  it("includes the current page even when it falls in the gap", () => {
    expect(pageNumbers(30, 50)).toEqual([
      1,
      2,
      3,
      4,
      5,
      "ellipsis",
      30,
      "ellipsis",
      50,
    ]);
  });

  it("does not repeat the last page when it is already in the leading run", () => {
    expect(pageNumbers(5, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses to a single page for an empty result set", () => {
    expect(pageNumbers(1, 1)).toEqual([1]);
  });

  it("omits an ellipsis when only one page separates the run from the last", () => {
    expect(pageNumbers(1, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
