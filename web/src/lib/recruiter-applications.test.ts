import { describe, expect, it } from "vitest";
import { RecruiterApplicationsListSchema } from "./types";

describe("RecruiterApplicationsListSchema", () => {
  it("parses list response", () => {
    const payload: unknown = [
      {
        id: "a1",
        jobId: "j1",
        name: "Candidate",
        email: "c@example.com",
        status: "APPLIED",
      },
    ];

    const parsed = RecruiterApplicationsListSchema.parse(payload);
    expect(parsed[0]?.status).toBe("APPLIED");
  });
});
