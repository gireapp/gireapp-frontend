import { describe, it, expect } from "vitest";
import { isStaffRole } from "@/lib/roles";

describe("isStaffRole", () => {
  it.each(["ADMIN", "TUTOR"])("treats %s as staff", (role) => {
    expect(isStaffRole(role)).toBe(true);
  });

  it.each(["STUDENT", "admin", "", null, undefined])(
    "does not treat %s as staff",
    (role) => {
      expect(isStaffRole(role)).toBe(false);
    },
  );
});
