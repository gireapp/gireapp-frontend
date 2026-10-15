import { describe, it, expect } from "vitest";
import { CLIENT_IP_HEADERS } from "@gireapp/shared";
import { clientIpHeaders } from "@/lib/client-ip";

const SECRET = "shared-secret";

describe("clientIpHeaders", () => {
  it("forwards the first x-forwarded-for entry with the secret", () => {
    const incoming = new Headers({
      "x-forwarded-for": "203.0.113.9, 10.0.0.1",
    });

    expect(clientIpHeaders(incoming, SECRET)).toEqual({
      [CLIENT_IP_HEADERS.IP]: "203.0.113.9",
      [CLIENT_IP_HEADERS.SECRET]: SECRET,
    });
  });

  it("falls back to x-real-ip", () => {
    const incoming = new Headers({ "x-real-ip": "198.51.100.4" });

    expect(clientIpHeaders(incoming, SECRET)[CLIENT_IP_HEADERS.IP]).toBe(
      "198.51.100.4",
    );
  });

  it("forwards nothing when no secret is configured", () => {
    const incoming = new Headers({ "x-forwarded-for": "203.0.113.9" });

    expect(clientIpHeaders(incoming, undefined)).toEqual({});
  });

  it("forwards nothing when the request carries no client address", () => {
    expect(clientIpHeaders(new Headers(), SECRET)).toEqual({});
  });
});
