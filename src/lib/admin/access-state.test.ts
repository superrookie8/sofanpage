import { expect, it } from "vitest";
import { adminAccessFailure } from "./access-state";

it("never automatically redirects an authenticated backend-401 session back into the login callback loop", () => {
	expect(adminAccessFailure(401, "authenticated")).toBe("reauth");
	expect(adminAccessFailure(401, "loading")).toBe("reauth");
	expect(adminAccessFailure(401, "unauthenticated")).toBe("login");
});
it("keeps denied members signed in and provides retry for backend failures", () => {
	expect(adminAccessFailure(403, "authenticated")).toBe("forbidden");
	expect(adminAccessFailure(503, "authenticated")).toBe("retry");
});
