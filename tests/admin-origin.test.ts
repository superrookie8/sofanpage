import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { rejectCrossOriginMutation } from "../src/lib/admin/request.ts";

test("mutation routes accept the same browser origin", () => {
	const request = new NextRequest("http://localhost:3001/api/admin/stats", {
		method: "POST",
		headers: { host: "localhost:3001", origin: "http://localhost:3001" },
	});
	assert.equal(rejectCrossOriginMutation(request), null);
});

test("mutation routes reject a cross-site origin", () => {
	const request = new NextRequest("http://localhost:3001/api/admin/stats", {
		method: "DELETE",
		headers: { host: "localhost:3001", origin: "https://attacker.example" },
	});
	assert.equal(rejectCrossOriginMutation(request)?.status, 403);
});
