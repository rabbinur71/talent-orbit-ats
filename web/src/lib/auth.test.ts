import { describe, expect, it } from "vitest";
import { AuthLoginResponseSchema } from "./types";

describe("AuthLoginResponseSchema", () => {
  it("parses login response with access token", () => {
    const payload: unknown = {
      access_token: "jwt.token.here",
      email: "admin@talentorbit.dev", // extra fields allowed
      name: "Admin",
    };

    const parsed = AuthLoginResponseSchema.parse(payload);

    expect(parsed.access_token).toBe("jwt.token.here");
  });
});
