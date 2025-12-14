import { describe, expect, it } from "vitest";
import { JobsListSchema } from "./types";

describe("JobsListSchema", () => {
  it("parses a valid jobs list payload", () => {
    const payload: unknown = [
      {
        id: "uuid",
        title: "Backend Engineer",
        description: "Build APIs",
        location: "Remote",
        department: "Engineering",
        status: "open",
        createdAt: "2025-12-14T00:00:00.000Z",
        updatedAt: "2025-12-14T00:00:00.000Z",
      },
    ];

    const parsed = JobsListSchema.parse(payload);
    expect(parsed[0]?.status).toBe("open");
  });
});
