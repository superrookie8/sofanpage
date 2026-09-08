import "server-only";

import {
	createSlackErrorNotifier,
	slackErrorConfigFromEnv,
	type SlackErrorEvent,
} from "./slack-core";

const notifySlackError = createSlackErrorNotifier(slackErrorConfigFromEnv(process.env));

export async function notifyAdminError(event: SlackErrorEvent): Promise<void> {
	await notifySlackError(event);
}
