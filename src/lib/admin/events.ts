export const EVENT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const EVENT_PHOTO_TARGET_BYTES = Math.floor(4.75 * 1024 * 1024);
export const EVENT_PHOTO_MAX_LONG_EDGES = [2560, 2048, 1600, 1280] as const;
export const EVENT_PHOTO_QUALITY_STEPS = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5] as const;
export const EVENT_PHOTO_ACCEPT = [
	".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif",
	"image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif",
].join(",");

const allowedExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);
const convertibleExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const convertibleMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const heicExtensions = new Set(["heic", "heif"]);
const heicMimeTypes = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);

export class EventFormValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "EventFormValidationError";
	}
}

export type AdminEventListItem = {
	_id: string;
	title: string;
	url?: string | null;
	description?: string | null;
	checkFields?: Record<string, string | null>;
	photos?: string[];
	photoKeys?: string[];
	isActive: boolean;
};

export type EventDraft = {
	title: string;
	url: string;
	description: string;
	checkFields: Record<string, string>;
	isActive: boolean;
};

export function emptyEventDraft(): EventDraft {
	return {
		title: "",
		url: "",
		description: "",
		checkFields: { check_1: "" },
		isActive: true,
	};
}

export function eventDraftFromItem(event: AdminEventListItem): EventDraft {
	const checkFields = event.checkFields ?? {};
	return {
		title: event.title,
		url: event.url ?? "",
		description: event.description ?? "",
		checkFields: Object.fromEntries([1, 2, 3].map((index) => [
			`check_${index}`,
			checkFields[`check_${index}`] ?? checkFields[`check${index}`] ?? "",
		])),
		isActive: event.isActive !== false,
	};
}

export type EventMoveDirection = "up" | "down";

export function moveEventIds(
	eventIds: string[],
	eventId: string,
	direction: EventMoveDirection
): string[] {
	const currentIndex = eventIds.indexOf(eventId);
	const targetIndex = currentIndex + (direction === "up" ? -1 : 1);
	if (currentIndex < 0 || targetIndex < 0 || targetIndex >= eventIds.length) return eventIds;
	const reordered = [...eventIds];
	[reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
	return reordered;
}

export function canonicalEventOrderBody(input: unknown): { eventIds: string[] } {
	if (!input || typeof input !== "object" || !Array.isArray((input as Record<string, unknown>).eventIds)) {
		throw new EventFormValidationError("이벤트 순서 목록이 필요합니다.");
	}
	const values = (input as { eventIds: unknown[] }).eventIds;
	if (!values.every((value) => typeof value === "string" && Boolean(value.trim()))) {
		throw new EventFormValidationError("이벤트 순서 값이 올바르지 않습니다.");
	}
	const eventIds = values.map((value) => (value as string).trim());
	if (new Set(eventIds).size !== eventIds.length) {
		throw new EventFormValidationError("이벤트 순서에 중복된 항목이 있습니다.");
	}
	return { eventIds };
}

export function safeEventOrderErrorMessage(status: number): string {
	if (status === 401) return "관리자 로그인이 만료되었습니다. 다시 로그인해 주세요.";
	if (status === 403) return "이벤트 순서를 변경할 권한이 없습니다.";
	if (status === 409) return "이벤트 목록이 변경되었습니다. 목록을 새로 확인한 뒤 다시 시도해 주세요.";
	return "이벤트 순서를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function safeFilename(file: File): string {
	return (file.name || "이름 없는 파일").slice(0, 120);
}

function extension(file: File): string {
	return file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "" : "";
}

function abortError(): DOMException {
	return new DOMException("The operation was aborted.", "AbortError");
}

function throwIfAborted(signal?: AbortSignal): void {
	if (signal?.aborted) throw abortError();
}

export type EventPhotoEncodeOptions = {
	maxLongEdge: number;
	quality: number;
};

export type EventPhotoEncoder = {
	width: number;
	height: number;
	encode: (options: EventPhotoEncodeOptions) => Promise<Blob>;
	close: () => void;
};

export type EventPhotoEncoderFactory = (
	file: File,
	signal?: AbortSignal
) => Promise<EventPhotoEncoder>;

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => blob ? resolve(blob) : reject(new Error("WebP encoding failed")),
			"image/webp",
			quality
		);
	});
}

export const createBrowserEventPhotoEncoder: EventPhotoEncoderFactory = async (file, signal) => {
	throwIfAborted(signal);
	let source: CanvasImageSource;
	let width: number;
	let height: number;
	let closeSource = () => {};

	if (typeof createImageBitmap === "function") {
		const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
		if (signal?.aborted) {
			bitmap.close();
			throw abortError();
		}
		source = bitmap;
		width = bitmap.width;
		height = bitmap.height;
		closeSource = () => bitmap.close();
	} else {
		const objectUrl = URL.createObjectURL(file);
		const image = new Image();
		image.decoding = "async";
		try {
			await new Promise<void>((resolve, reject) => {
				const onAbort = () => reject(abortError());
				signal?.addEventListener("abort", onAbort, { once: true });
				image.onload = () => {
					signal?.removeEventListener("abort", onAbort);
					resolve();
				};
				image.onerror = () => {
					signal?.removeEventListener("abort", onAbort);
					reject(new Error("Image decoding failed"));
				};
				image.src = objectUrl;
			});
		} catch (error) {
			URL.revokeObjectURL(objectUrl);
			throw error;
		}
		source = image;
		width = image.naturalWidth;
		height = image.naturalHeight;
		closeSource = () => URL.revokeObjectURL(objectUrl);
	}

	if (!width || !height) {
		closeSource();
		throw new Error("Image has no dimensions");
	}

	return {
		width,
		height,
		encode: async ({ maxLongEdge, quality }) => {
			throwIfAborted(signal);
			const scale = Math.min(1, maxLongEdge / Math.max(width, height));
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(width * scale));
			canvas.height = Math.max(1, Math.round(height * scale));
			const context = canvas.getContext("2d");
			if (!context) throw new Error("Canvas is not available");
			// 투명 배경을 채우지 않아 alpha가 있는 PNG도 WebP alpha로 보존한다.
			context.drawImage(source, 0, 0, canvas.width, canvas.height);
			const blob = await canvasBlob(canvas, quality);
			throwIfAborted(signal);
			if (blob.type !== "image/webp") throw new Error("WebP is not supported by this browser");
			return blob;
		},
		close: closeSource,
	};
};

function webpFilename(file: File): string {
	const name = file.name.replace(/\.[^.]+$/, "") || "event-photo";
	return `${name}.webp`;
}

export async function convertEventPhoto(
	file: File,
	options: {
		encoderFactory?: EventPhotoEncoderFactory;
		signal?: AbortSignal;
		targetBytes?: number;
	} = {}
): Promise<File> {
	const name = safeFilename(file);
	const fileExtension = extension(file);
	const mimeType = file.type.toLowerCase();
	const signal = options.signal;
	throwIfAborted(signal);
	if (file.size === 0) throw new EventFormValidationError(`${name}: 비어 있는 파일은 업로드할 수 없습니다.`);

	if (heicExtensions.has(fileExtension) || heicMimeTypes.has(mimeType)) {
		throw new EventFormValidationError(
			`${name}: HEIC/HEIF는 이 브라우저에서 변환할 수 없습니다. JPG, PNG 또는 WebP로 변환한 뒤 선택해 주세요.`
		);
	}

	if (fileExtension === "gif" && mimeType === "image/gif") {
		if (file.size > EVENT_PHOTO_MAX_BYTES) {
			throw new EventFormValidationError(
				`${name}: 애니메이션 GIF는 첫 프레임으로 변환하지 않습니다. 원본 GIF를 파일당 5MB 이하로 줄여 주세요.`
			);
		}
		return file;
	}

	if (!convertibleExtensions.has(fileExtension) || !convertibleMimeTypes.has(mimeType)) {
		throw new EventFormValidationError(
			`${name}: JPG, JPEG, PNG, WebP 정적 이미지만 자동 변환할 수 있습니다.`
		);
	}

	const encoderFactory = options.encoderFactory ?? createBrowserEventPhotoEncoder;
	let encoder: EventPhotoEncoder;
	try {
		encoder = await encoderFactory(file, signal);
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") throw error;
		throw new EventFormValidationError(
			`${name}: 브라우저에서 이미지를 읽지 못했습니다. JPG, PNG 또는 WebP 파일인지 확인해 주세요.`
		);
	}

	const targetBytes = options.targetBytes ?? EVENT_PHOTO_TARGET_BYTES;
	try {
		const originalLongEdge = Math.max(encoder.width, encoder.height);
		const longEdges = Array.from(new Set(
			EVENT_PHOTO_MAX_LONG_EDGES.map((value) => Math.min(value, originalLongEdge))
		));
		for (const maxLongEdge of longEdges) {
			for (const quality of EVENT_PHOTO_QUALITY_STEPS) {
				throwIfAborted(signal);
				let blob: Blob;
				try {
					blob = await encoder.encode({ maxLongEdge, quality });
				} catch (error) {
					if (error instanceof DOMException && error.name === "AbortError") throw error;
					throw new EventFormValidationError(
						`${name}: WebP 변환에 실패했습니다. 다른 JPG, PNG 또는 WebP 파일을 선택해 주세요.`
					);
				}
				if (blob.size <= targetBytes) {
					return new File([blob], webpFilename(file), {
						type: "image/webp",
						lastModified: file.lastModified,
					});
				}
			}
		}
	} finally {
		encoder.close();
	}

	throw new EventFormValidationError(
		`${name}: 자동 압축 후에도 5MB 이하로 만들 수 없습니다. 더 작은 원본을 선택해 주세요.`
	);
}

export async function prepareEventPhotosSequentially(
	files: File[],
	options: {
		encoderFactory?: EventPhotoEncoderFactory;
		signal?: AbortSignal;
		onProgress?: (progress: { completed: number; total: number; filename: string }) => void;
	} = {}
): Promise<File[]> {
	const prepared: File[] = [];
	for (let index = 0; index < files.length; index += 1) {
		throwIfAborted(options.signal);
		options.onProgress?.({ completed: index, total: files.length, filename: safeFilename(files[index]) });
		prepared.push(await convertEventPhoto(files[index], options));
	}
	options.onProgress?.({ completed: files.length, total: files.length, filename: "" });
	return prepared;
}

export function eventPhotoError(file: File): string | null {
	const name = safeFilename(file);
	const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() ?? "" : "";
	if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.type.toLowerCase())) {
		return `${name}: JPG, JPEG, PNG, GIF, WEBP 형식만 업로드할 수 있습니다.`;
	}
	if (file.size === 0) return `${name}: 비어 있는 파일은 업로드할 수 없습니다.`;
	if (file.size > EVENT_PHOTO_MAX_BYTES) {
		return `${name}: 사진은 파일당 5MB 이하만 업로드할 수 있습니다.`;
	}
	return null;
}

export function validateEventPhotos(files: File[]): string[] {
	return files.map(eventPhotoError).filter((message): message is string => message !== null);
}

function stringValue(formData: FormData, key: string): string | null {
	const value = formData.get(key);
	return typeof value === "string" ? value : null;
}

export function canonicalEventFormData(input: FormData): FormData {
	const title = stringValue(input, "title")?.trim() ?? "";
	if (!title) throw new EventFormValidationError("이벤트 제목을 입력해 주세요.");

	const output = new FormData();
	output.append("title", title);
	for (const key of ["url", "description"] as const) {
		const value = stringValue(input, key);
		if (value !== null) output.append(key, value.trim());
	}
	for (let index = 1; index <= 3; index += 1) {
		const value = stringValue(input, `check${index}`) ?? stringValue(input, `check_${index}`);
		if (value !== null) output.append(`check${index}`, value.trim());
	}
	const isActive = stringValue(input, "isActive");
	if (isActive !== null) {
		if (isActive !== "true" && isActive !== "false") {
			throw new EventFormValidationError("이벤트 활성 상태 값이 올바르지 않습니다.");
		}
		output.append("isActive", isActive);
	}

	const photos = input.getAll("photos").filter((value): value is File => value instanceof File);
	const photoErrors = validateEventPhotos(photos);
	if (photoErrors.length > 0) throw new EventFormValidationError(photoErrors.join(" "));
	for (const photo of photos) output.append("photos", photo, photo.name);
	return output;
}

export function canonicalEventUpdateFormData(input: FormData): FormData {
	const output = canonicalEventFormData(input);
	for (const key of ["url", "description", "check1", "check2", "check3"] as const) {
		if (!output.has(key)) output.append(key, "");
	}
	if (!output.has("isActive")) {
		throw new EventFormValidationError("이벤트 활성 상태 값이 필요합니다.");
	}
	return output;
}

export function safeEventErrorMessage(body: unknown, fallback: string): string {
	if (!body || typeof body !== "object") return fallback;
	const value = body as Record<string, unknown>;
	if (value.fieldErrors && typeof value.fieldErrors === "object") {
		const messages = Object.values(value.fieldErrors as Record<string, unknown>)
			.filter((message): message is string => typeof message === "string" && Boolean(message.trim()));
		if (messages.length > 0) return messages.map((message) => {
			if (/5\s*(?:MiB|MB)/i.test(message)) return "사진은 파일당 5MB 이하만 업로드할 수 있습니다.";
			if (/jpg.*jpeg.*png.*gif.*webp/i.test(message)) {
				return "사진은 JPG, JPEG, PNG, GIF, WEBP 형식만 업로드할 수 있습니다.";
			}
			return message;
		}).join(" ");
	}
	const message = typeof value.message === "string" ? value.message.trim() : "";
	if (message && !["The request is invalid.", "Request validation failed."].includes(message)) {
		return message;
	}
	return fallback;
}
