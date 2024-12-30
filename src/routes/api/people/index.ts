export async function GET() {
	return new Response("Kerb was not specified", { status: 400 });
}
