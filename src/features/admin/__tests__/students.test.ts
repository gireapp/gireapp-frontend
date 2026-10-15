import { describe, it, expect, vi, beforeEach } from "vitest";

const { serverApiClientMock, logActionErrorMock } = vi.hoisted(() => ({
  serverApiClientMock: vi.fn(),
  logActionErrorMock: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({ serverApiClient: serverApiClientMock }));
vi.mock("@/lib/log", () => ({ logActionError: logActionErrorMock }));

import { getStudents, getCourseOptions } from "@/features/admin/students";

const QUERY = { page: 1, limit: 20 } as const;

beforeEach(() => {
  vi.clearAllMocks();
  serverApiClientMock.mockResolvedValue({
    data: [],
    status: 200,
    meta: { page: 2, limit: 20, total: 500, totalPages: 25 },
  });
});

function requestedPath(): string {
  const call = serverApiClientMock.mock.calls[0];
  if (!call) throw new Error("serverApiClient was not called");
  return call[0] as string;
}

describe("getStudents", () => {
  it("carries the pagination meta the envelope would otherwise drop", async () => {
    const result = await getStudents({ ...QUERY, page: 2 });

    expect(result?.meta).toEqual({
      page: 2,
      limit: 20,
      total: 500,
      totalPages: 25,
    });
  });

  it("sends every filter that was set", async () => {
    await getStudents({
      ...QUERY,
      search: "Favor",
      courseId: "course-1",
      academicLevel: "TERTIARY",
      status: "ACTIVE",
    });

    const params = new URLSearchParams(requestedPath().split("?")[1]);
    expect(Object.fromEntries(params)).toMatchObject({
      search: "Favor",
      courseId: "course-1",
      academicLevel: "TERTIARY",
      status: "ACTIVE",
    });
  });

  it("leaves unset filters out of the query string entirely", async () => {
    await getStudents(QUERY);

    const params = new URLSearchParams(requestedPath().split("?")[1]);
    expect(params.has("search")).toBe(false);
    expect(params.has("status")).toBe(false);
  });

  it("returns null so the page can degrade when the backend fails", async () => {
    serverApiClientMock.mockRejectedValue(new Error("boom"));

    expect(await getStudents(QUERY)).toBeNull();
    expect(logActionErrorMock).toHaveBeenCalled();
  });

  it("falls back to a single page when a response carries no meta", async () => {
    serverApiClientMock.mockResolvedValue({ data: [], status: 200 });

    const result = await getStudents(QUERY);

    expect(result?.meta).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });
  });
});

describe("getCourseOptions", () => {
  it("returns an empty list rather than throwing when the lookup fails", async () => {
    serverApiClientMock.mockRejectedValue(new Error("boom"));

    expect(await getCourseOptions()).toEqual([]);
  });
});
