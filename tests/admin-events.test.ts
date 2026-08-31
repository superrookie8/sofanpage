import assert from "node:assert/strict";
import test from "node:test";
import {
	canonicalEventFormData,
	canonicalEventOrderBody,
	canonicalEventUpdateFormData,
	emptyEventDraft,
	EVENT_PHOTO_MAX_BYTES,
	EVENT_PHOTO_QUALITY_STEPS,
	EVENT_PHOTO_TARGET_BYTES,
	convertEventPhoto,
	eventDraftFromItem,
	EventFormValidationError,
	moveEventIds,
	prepareEventPhotosSequentially,
	safeEventErrorMessage,
	safeEventOrderErrorMessage,
	validateEventPhotos,
} from "../src/lib/admin/events.ts";
import type { EventPhotoEncoderFactory } from "../src/lib/admin/events.ts";

function image(name = "fixture.png", type = "image/png", size = 8): File {
	return new File([new Uint8Array(size)], name, { type });
}

test("event multipart adapter preserves canonical fields and repeated photos", () => {
	const input = new FormData();
	input.append("title", " 테스트 이벤트 ");
	input.append("url", " https://example.com/event ");
	input.append("description", " 설명 ");
	input.append("check_1", " 첫 번째 확인 ");
	input.append("check_2", "두 번째 확인");
	input.append("photos", image("one.png"));
	input.append("photos", image("two.webp", "image/webp"));

	const output = canonicalEventFormData(input);
	assert.equal(output.get("title"), "테스트 이벤트");
	assert.equal(output.get("url"), "https://example.com/event");
	assert.equal(output.get("description"), "설명");
	assert.equal(output.get("check1"), "첫 번째 확인");
	assert.equal(output.get("check2"), "두 번째 확인");
	assert.equal(output.get("check_1"), null);
	assert.deepEqual(
		output.getAll("photos").map((value) => value instanceof File ? [value.name, value.type] : null),
		[["one.png", "image/png"], ["two.webp", "image/webp"]]
	);
});

test("event edit prefill preserves metadata and reset returns a clean create draft", () => {
	assert.deepEqual(eventDraftFromItem({
		_id: "event-1",
		title: "기존 이벤트",
		url: "https://example.com",
		description: "기존 설명",
		checkFields: { check1: "하나", check_2: "둘" },
		photos: ["/existing/photo"],
		photoKeys: ["old-key"],
		isActive: false,
	}), {
		title: "기존 이벤트",
		url: "https://example.com",
		description: "기존 설명",
		checkFields: { check_1: "하나", check_2: "둘", check_3: "" },
		isActive: false,
	});
	assert.deepEqual(emptyEventDraft(), {
		title: "",
		url: "",
		description: "",
		checkFields: { check_1: "" },
		isActive: true,
	});
});

test("event edit body clears optional metadata and appends only newly converted WebP", async () => {
	const converted = await convertEventPhoto(image("new-photo.png", "image/png"), {
		encoderFactory: async () => ({
			width: 1200,
			height: 800,
			encode: async () => new Blob([new Uint8Array(4)], { type: "image/webp" }),
			close: () => {},
		}),
	});
	const input = new FormData();
	input.append("title", "수정된 이벤트");
	input.append("url", "");
	input.append("description", "");
	input.append("check_1", "");
	input.append("isActive", "false");
	input.append("photos", converted, converted.name);
	const output = canonicalEventUpdateFormData(input);
	assert.equal(output.get("url"), "");
	assert.equal(output.get("description"), "");
	assert.deepEqual([output.get("check1"), output.get("check2"), output.get("check3")], ["", "", ""]);
	assert.equal(output.get("isActive"), "false");
	const photo = output.get("photos");
	assert.ok(photo instanceof File);
	assert.deepEqual([photo.name, photo.type], ["new-photo.webp", "image/webp"]);
	assert.equal(output.get("photoKeys"), null);
});

test("event edit requires explicit active state", () => {
	const input = new FormData();
	input.append("title", "수정 이벤트");
	assert.throws(() => canonicalEventUpdateFormData(input), /활성 상태 값이 필요/);
});

test("event ordering moves one item and preserves boundary order", () => {
	const ids = ["first", "second", "third"];
	assert.deepEqual(moveEventIds(ids, "second", "up"), ["second", "first", "third"]);
	assert.deepEqual(moveEventIds(ids, "second", "down"), ["first", "third", "second"]);
	assert.equal(moveEventIds(ids, "first", "up"), ids);
	assert.equal(moveEventIds(ids, "third", "down"), ids);
});

test("event order payload preserves the complete unique server ID order", () => {
	assert.deepEqual(canonicalEventOrderBody({ eventIds: [" event-2 ", "event-1"] }), {
		eventIds: ["event-2", "event-1"],
	});
	assert.throws(() => canonicalEventOrderBody({ eventIds: ["same", "same"] }), /중복/);
	assert.throws(() => canonicalEventOrderBody({ eventIds: ["valid", ""] }), /올바르지/);
	assert.match(safeEventOrderErrorMessage(409), /목록이 변경/);
	assert.doesNotMatch(safeEventOrderErrorMessage(500), /\{|trace|stack/i);
});

test("event photo validation accepts 5MiB and rejects each oversized or invalid file", () => {
	assert.deepEqual(validateEventPhotos([image("limit.jpg", "image/jpeg", EVENT_PHOTO_MAX_BYTES)]), []);
	const errors = validateEventPhotos([
		image("too-large.png", "image/png", EVENT_PHOTO_MAX_BYTES + 1),
		image("unsupported.heic", "image/heic"),
	]);
	assert.equal(errors.length, 2);
	assert.match(errors[0], /too-large\.png.*파일당 5MB 이하/);
	assert.match(errors[1], /unsupported\.heic.*JPG, JPEG, PNG, GIF, WEBP/);
});

test("invalid event photos never enter the canonical multipart body", () => {
	const input = new FormData();
	input.append("title", "테스트 이벤트");
	input.append("photos", image("too-large.png", "image/png", EVENT_PHOTO_MAX_BYTES + 1));
	assert.throws(() => canonicalEventFormData(input), EventFormValidationError);
});

test("event errors prefer safe field messages and hide generic upstream details", () => {
	assert.equal(safeEventErrorMessage({
		status: 400,
		code: "ADMIN_VALIDATION_FAILED",
		message: "Request validation failed.",
		fieldErrors: { photos: "Each photo must be 5 MiB or smaller." },
		traceId: "not-for-the-browser",
	}, "fallback"), "사진은 파일당 5MB 이하만 업로드할 수 있습니다.");
	assert.equal(safeEventErrorMessage({
		code: "ADMIN_VALIDATION_FAILED",
		fieldErrors: { photos: "Photos must use jpg, jpeg, png, gif, or webp format." },
	}, "fallback"), "사진은 JPG, JPEG, PNG, GIF, WEBP 형식만 업로드할 수 있습니다.");
	assert.equal(safeEventErrorMessage({
		status: 400,
		code: "ADMIN_INVALID_REQUEST",
		message: "The request is invalid.",
		traceId: "not-for-the-browser",
	}, "안전한 안내"), "안전한 안내");
});

test("static images become named WebP files with quality fallback below the target", async () => {
	const attempts: Array<{ maxLongEdge: number; quality: number }> = [];
	let closed = false;
	const sizes = [EVENT_PHOTO_TARGET_BYTES + 1, EVENT_PHOTO_TARGET_BYTES - 1];
	const factory: EventPhotoEncoderFactory = async () => ({
		width: 4000,
		height: 3000,
		encode: async (options) => {
			attempts.push(options);
			return new Blob([new Uint8Array(sizes.shift() ?? 1)], { type: "image/webp" });
		},
		close: () => { closed = true; },
	});
	const converted = await convertEventPhoto(image("original.PNG", "image/png", 20), {
		encoderFactory: factory,
	});
	assert.equal(converted.name, "original.webp");
	assert.equal(converted.type, "image/webp");
	assert.ok(converted.size <= EVENT_PHOTO_TARGET_BYTES);
	assert.deepEqual(attempts.map((attempt) => attempt.quality), EVENT_PHOTO_QUALITY_STEPS.slice(0, 2));
	assert.equal(attempts[0].maxLongEdge, 2560);
	assert.equal(closed, true);
});

test("compression lowers resolution after reaching the minimum quality", async () => {
	const attempts: Array<{ maxLongEdge: number; quality: number }> = [];
	const factory: EventPhotoEncoderFactory = async () => ({
		width: 4000,
		height: 3000,
		encode: async (options) => {
			attempts.push(options);
			const fits = options.maxLongEdge === 2048 && options.quality === EVENT_PHOTO_QUALITY_STEPS[0];
			return new Blob([new Uint8Array(fits ? 1 : 20)], { type: "image/webp" });
		},
		close: () => {},
	});
	await convertEventPhoto(image("large.jpg", "image/jpeg"), {
		encoderFactory: factory,
		targetBytes: 10,
	});
	assert.equal(attempts[EVENT_PHOTO_QUALITY_STEPS.length - 1].quality, 0.5);
	assert.deepEqual(attempts[EVENT_PHOTO_QUALITY_STEPS.length], {
		maxLongEdge: 2048,
		quality: 0.9,
	});
});

test("GIF is preserved without losing animation and oversized GIF is rejected", async () => {
	let encoderCalled = false;
	const factory: EventPhotoEncoderFactory = async () => {
		encoderCalled = true;
		throw new Error("must not encode GIF");
	};
	const gif = image("animation.gif", "image/gif", 10);
	assert.equal(await convertEventPhoto(gif, { encoderFactory: factory }), gif);
	assert.equal(encoderCalled, false);
	await assert.rejects(
		convertEventPhoto(image("large.gif", "image/gif", EVENT_PHOTO_MAX_BYTES + 1), {
			encoderFactory: factory,
		}),
		/애니메이션 GIF.*5MB/
	);
});

test("HEIC and encoder failures return clear unsupported-image errors", async () => {
	await assert.rejects(
		convertEventPhoto(image("iphone.heic", "image/heic")),
		/HEIC\/HEIF.*JPG, PNG 또는 WebP/
	);
	await assert.rejects(
		convertEventPhoto(image("broken.jpg", "image/jpeg"), {
			encoderFactory: async () => { throw new Error("decode failed"); },
		}),
		/broken\.jpg.*브라우저에서 이미지를 읽지 못했습니다/
	);
});

test("multiple event photos are converted sequentially and keep their order", async () => {
	let active = 0;
	let maxActive = 0;
	const started: string[] = [];
	const factory: EventPhotoEncoderFactory = async (file) => {
		started.push(file.name);
		return {
			width: 1000,
			height: 800,
			encode: async () => {
				active += 1;
				maxActive = Math.max(maxActive, active);
				await new Promise((resolve) => setTimeout(resolve, 1));
				active -= 1;
				return new Blob([new Uint8Array(1)], { type: "image/webp" });
			},
			close: () => {},
		};
	};
	const progress: number[] = [];
	const converted = await prepareEventPhotosSequentially([
		image("one.jpg", "image/jpeg"),
		image("two.png", "image/png"),
	], {
		encoderFactory: factory,
		onProgress: ({ completed }) => progress.push(completed),
	});
	assert.deepEqual(started, ["one.jpg", "two.png"]);
	assert.deepEqual(converted.map((file) => file.name), ["one.webp", "two.webp"]);
	assert.equal(maxActive, 1);
	assert.deepEqual(progress, [0, 1, 2]);
});

test("conversion fails safely when every quality and size attempt stays too large", async () => {
	let attempts = 0;
	const factory: EventPhotoEncoderFactory = async () => ({
		width: 4000,
		height: 3000,
		encode: async () => {
			attempts += 1;
			return new Blob([new Uint8Array(20)], { type: "image/webp" });
		},
		close: () => {},
	});
	await assert.rejects(
		convertEventPhoto(image("huge.png", "image/png"), { encoderFactory: factory, targetBytes: 10 }),
		/자동 압축 후에도 5MB 이하/
	);
	assert.equal(attempts, 4 * EVENT_PHOTO_QUALITY_STEPS.length);
});
