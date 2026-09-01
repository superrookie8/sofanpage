import type { Instrumentation } from "next";
import { reportSlackError } from "@/lib/server/alerts/slackErrorReporter";

export const onRequestError: Instrumentation.onRequestError = async (
	error,
	request,
	context
) => {
	await reportSlackError({
		source: "next-unhandled",
		error,
		route: context.routePath,
		method: request.method,
		routeType: context.routeType,
	});
};
