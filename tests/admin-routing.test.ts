import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { proxy } from "../src/proxy.ts";
import { ADMIN_ROOT_DESTINATION } from "../src/lib/admin/root-route.ts";

test("the admin app root targets the middleware-protected admin route", () => {
	assert.equal(ADMIN_ROOT_DESTINATION, "/admin");
});

test("an anonymous admin request redirects to the admin login page", () => {
	const response = proxy(new NextRequest("http://localhost:3001/admin"));
	assert.equal(response.status, 307);
	assert.equal(
		response.headers.get("location"),
		"http://localhost:3001/admin/login?next=%2Fadmin"
	);
});

test("the admin login page remains accessible without a session", () => {
	const response = proxy(new NextRequest("http://localhost:3001/admin/login"));
	assert.equal(response.status, 200);
	assert.equal(response.headers.get("x-middleware-next"), "1");
});
