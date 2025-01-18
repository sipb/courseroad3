import type { APIHandler } from "@solidjs/start/server";

export const GET: APIHandler = async () => {
	return new Response("Kerb was not specified", { status: 400 });
};
