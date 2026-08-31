import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);

function source(path: string): string {
	return readFileSync(new URL(path, root), "utf-8");
}

test("AdminShell provides the only h1 for every authenticated admin route", () => {
	const shell = source("src/components/admin/AdminShell.tsx");
	assert.equal(shell.match(/<h1(?:\s|>)/g)?.length, 1);

	const authenticatedPages = [
		"src/app/admin/page.tsx",
		"src/app/admin/profile/page.tsx",
		"src/app/admin/stats/page.tsx",
		"src/components/admin/StatsForm.tsx",
		"src/app/admin/photos/page.tsx",
		"src/components/admin/PhotoUpload.tsx",
		"src/app/admin/deletephotos/page.tsx",
		"src/app/admin/schedule/page.tsx",
		"src/app/admin/events/page.tsx",
		"src/components/admin/GetEvents.tsx",
		"src/app/admin/news/page.tsx",
		"src/components/admin/NewsInput.tsx",
		"src/app/admin/guestbooks/page.tsx",
		"src/components/admin/GuestbookManager.tsx",
	];
	for (const path of authenticatedPages) {
		assert.equal(source(path).match(/<h1(?:\s|>)/g)?.length ?? 0, 0, path);
	}

	assert.equal((shell.match(/Manage Stats/g) ?? []).length, 1);
	assert.equal(source("src/app/admin/login/page.tsx").match(/<h1(?:\s|>)/g)?.length, 1);
});

test("stats UI keeps numeric drafts and exposes a separate New Season selection", () => {
	const statsForm = source("src/components/admin/StatsForm.tsx");
	const statsRoute = source("src/app/api/admin/stats/route.ts");
	assert.match(statsForm, /<option value="__new__">New Season<\/option>/);
	assert.match(statsForm, /value=\{selectedRecord\}/);
	assert.match(statsForm, /setCurrentStat\(emptyStatsDraft\(\)\)/);
	assert.match(statsForm, /평균 득점 \(PPG\)/);
	assert.match(statsForm, /inputMode=\{isTime \? "text" : isInteger \? "numeric" : "decimal"\}/);
	assert.doesNotMatch(statsForm, /parseFloat|value === "" \? 0/);
	assert.match(statsRoute, /\{ status: 409 \}/);
	assert.match(statsRoute, /DUPLICATE_STATS_SEASON_MESSAGE/);
});

test("event UI validates selected files and never shows raw upstream JSON", () => {
	const eventsPage = source("src/app/admin/events/page.tsx");
	const eventsList = source("src/components/admin/GetEvents.tsx");
	const eventUpdateRoute = source("src/app/api/admin/events/[id]/route.ts");
	const eventOrderRoute = source("src/app/api/admin/events/order/route.ts");
	const eventUtility = source("src/lib/admin/events.ts");
	assert.match(eventsPage, /accept=\{EVENT_PHOTO_ACCEPT\}/);
	assert.match(eventsPage, /prepareEventPhotosSequentially\(files/);
	assert.match(eventsPage, /e\.target\.value = ""/);
	assert.match(eventsPage, /safeEventErrorMessage/);
	assert.doesNotMatch(eventsPage, /alert\(|response\.text\(\)|URL\.createObjectURL/);
	assert.match(eventsPage, /eventDraftFromItem\(event\)/);
	assert.match(eventsPage, /이벤트 수정/);
	assert.match(eventsPage, /수정 저장/);
	assert.match(eventsPage, /cancelEdit/);
	assert.match(eventsPage, /canonicalEventUpdateFormData\(input\)/);
	assert.match(eventsPage, /method: isEditing \? "PUT" : "POST"/);
	assert.match(eventsPage, /if \(photoError \|\| converting \|\| submittingRef\.current\) return/);
	assert.match(eventsPage, /resetForm\(\);[\s\S]*setEventListKey/);
	assert.match(eventsPage, /setPhotoError\(safeEventErrorMessage/);
	assert.match(eventsPage, /removeSelectedPhoto/);
	assert.match(eventUtility, /imageOrientation: "from-image"/);
	assert.match(eventUtility, /URL\.revokeObjectURL/);
	assert.match(eventUtility, /context\.drawImage/);
	assert.doesNotMatch(eventUtility, /fillRect/);
	assert.match(eventsList, /이벤트 위로 이동/);
	assert.match(eventsList, /이벤트 아래로 이동/);
	assert.match(eventsList, /onEdit\(event\)/);
	assert.match(eventsList, /기존 사진.*삭제/);
	assert.match(eventsList, /body: JSON\.stringify\(\{ eventIds: reorderedIds \}\)/);
	assert.match(eventsList, /if \(savingOrderRef\.current\) return/);
	assert.match(eventsList, /setEvents\(previousEvents\)/);
	assert.match(eventsList, /await fetchEvents\(\); \/\/ 이벤트 삭제 후/);
	assert.match(eventOrderRoute, /rejectCrossOriginMutation/);
	assert.match(eventOrderRoute, /adminBackendFetch\("\/api\/admin\/events\/order"/);
	assert.match(eventUpdateRoute, /rejectCrossOriginMutation/);
	assert.match(eventUpdateRoute, /canonicalEventUpdateFormData/);
	assert.match(eventUpdateRoute, /adminBackendFetch\(`\/api\/admin\/events\/\$\{encodeURIComponent\(params\.id\)\}`/);
	assert.doesNotMatch(eventsPage, /Authorization|NEXT_PUBLIC_BACKAPI_URL|sessionStorage/);
});
