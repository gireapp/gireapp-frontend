// ─────────────────────────────────────────────────
// GIREAPP — Sanitisation Unit Tests (BE-SEC-005)
// Tests with common attack payload library
// ─────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  sanitizeRichText,
  sanitizeObject,
  detectThreats,
} from "@/lib/sanitize";

describe("sanitizeString", () => {
  it("should pass through clean strings unchanged (after entity encoding)", () => {
    const input = "Hello World";
    expect(sanitizeString(input)).toBe("Hello World");
  });

  it("should trim whitespace", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("should escape HTML angle brackets", () => {
    const input = "<b>bold</b>";
    expect(sanitizeString(input)).not.toContain("<");
    expect(sanitizeString(input)).not.toContain(">");
  });

  it("should escape double quotes", () => {
    const input = 'He said "hello"';
    expect(sanitizeString(input)).not.toContain('"');
    expect(sanitizeString(input)).toContain("&quot;");
  });

  // ── SQL keywords are flagged, never deleted ──
  //
  // Stripping them corrupted real content silently: "Union Ekpo" was stored as
  // "Ekpo". Queries are parameterised, so removal protects nothing — `detectThreats`
  // reports these payloads instead.

  it("preserves a name that collides with a SQL keyword", () => {
    expect(sanitizeString("Union Ekpo")).toBe("Union Ekpo");
    expect(sanitizeString("Cast Iron")).toBe("Cast Iron");
    expect(sanitizeString("Drop Anchor")).toBe("Drop Anchor");
  });

  it("preserves SQL keywords inside an injection payload", () => {
    const result = sanitizeString("admin UNION SELECT * FROM users");
    expect(result.toLowerCase()).toContain("union");
    expect(result.toLowerCase()).toContain("select");
  });

  it("preserves hex-looking values", () => {
    expect(sanitizeString("0x414243")).toBe("0x414243");
  });

  it("still reports those payloads through detectThreats", () => {
    expect(detectThreats("admin' UNION SELECT * FROM users--")).toContain(
      "sql_injection",
    );
    expect(detectThreats("'; WAITFOR DELAY '00:00:05'--")).toContain(
      "sql_injection",
    );
  });

  // ── XSS payloads ──

  it("should strip <script> tags", () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeString(input);
    expect(result.toLowerCase()).not.toContain("<script");
  });

  it("should strip event handlers", () => {
    const input = '<img onerror="alert(1)" src=x>';
    const result = sanitizeString(input);
    expect(result).not.toMatch(/onerror/i);
  });

  it("should strip javascript: URIs", () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeString(input);
    expect(result.toLowerCase()).not.toContain("javascript:");
  });

  it("should strip iframe tags", () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const result = sanitizeString(input);
    expect(result.toLowerCase()).not.toContain("<iframe");
  });

  it("should strip data:text/html URIs", () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">x</a>';
    const result = sanitizeString(input);
    expect(result.toLowerCase()).not.toContain("data:text/html");
  });
});

describe("sanitizeRichText", () => {
  it("should preserve markdown formatting", () => {
    const input = "# Hello\n**bold** and *italic*\n- list item";
    const result = sanitizeRichText(input);
    expect(result).toContain("# Hello");
    expect(result).toContain("**bold**");
    expect(result).toContain("*italic*");
  });

  it("should still strip script tags from rich text", () => {
    const input = '# Title\n<script>alert("xss")</script>\nParagraph';
    const result = sanitizeRichText(input);
    expect(result.toLowerCase()).not.toContain("<script");
  });

  it("preserves SQL keywords so lesson prose about databases survives", () => {
    const input = "# Title\nSELECT * FROM users; DROP TABLE lessons;";
    const result = sanitizeRichText(input);
    expect(result.toLowerCase()).toContain("select");
    expect(result.toLowerCase()).toContain("drop");
  });
});

describe("sanitizeObject", () => {
  it("should recursively sanitize all string values", () => {
    const input = {
      name: "<script>alert(1)</script>",
      nested: {
        value: '<iframe src="evil"></iframe>ok',
      },
    };
    const result = sanitizeObject(input);
    expect(result.name).not.toContain("<script");
    expect(result.nested.value).not.toContain("<iframe");
  });

  it("should handle arrays", () => {
    const input = {
      items: ["<script>x</script>", "clean"],
    };
    const result = sanitizeObject(input);
    expect(result.items[0]).not.toContain("<script");
    expect(result.items[1]).toBe("clean");
  });

  it("should use rich text sanitizer for designated fields", () => {
    const input = {
      content: "# Title\n<script>x</script>\n**bold**",
    };
    const result = sanitizeObject(input, ["content"]);
    expect(result.content).toContain("# Title");
    expect(result.content).toContain("**bold**");
    expect(result.content).not.toContain("<script");
  });

  it("should handle null and undefined gracefully", () => {
    expect(sanitizeObject(null)).toBeNull();
    expect(sanitizeObject(undefined)).toBeUndefined();
  });

  it("should pass through numbers and booleans", () => {
    const input = { count: 42, active: true };
    const result = sanitizeObject(input);
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
  });
});

describe("detectThreats", () => {
  it("should detect SQL injection", () => {
    const threats = detectThreats("admin' UNION SELECT * FROM users--");
    expect(threats).toContain("sql_injection");
  });

  it("should detect XSS", () => {
    const threats = detectThreats('<script>alert("xss")</script>');
    expect(threats).toContain("xss");
  });

  it("should return empty for clean input", () => {
    const threats = detectThreats("Hello, I am a normal user");
    expect(threats).toHaveLength(0);
  });

  it("should detect both SQL and XSS in combined payload", () => {
    const threats = detectThreats(
      '<script>fetch("/api?q=" + document.cookie)</script> UNION SELECT password FROM users',
    );
    expect(threats).toContain("sql_injection");
    expect(threats).toContain("xss");
  });
});
