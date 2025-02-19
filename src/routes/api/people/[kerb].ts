import type { APIHandler } from "@solidjs/start/server";

export const GET: APIHandler = async ({ params }) => {
	const kerb = params.kerb;
	const headers = new Headers();

	headers.append("client_id", process.env.PEOPLEAPI_ID);
	headers.append("client_secret", process.env.PEOPLEAPI_SECRET);

	const init = { method: "GET", headers };
	const response = await fetch(
		`https://mit-people-v3.cloudhub.io/people/v3/people/${kerb}`,
		init,
	);
	// console.log(`response status is ${response.status}`);

	if (response.status !== 200) {
		return new Response("Could not get user data", { status: 400 });
	}

	const data = await response.json();
	// console.log(data);

	if (data.item.affiliations[0].type !== "student") {
		return new Response("User is not a student", { status: 400 });
	}

	const year: string | null = data.item.affiliations[0].classYear;
	// console.log(data.item.affiliations[0]);

	if (year === "G") {
		return new Response("User is a graduate student", { status: 400 });
	}

	if (year === null) {
		return new Response("Could not get user year", { status: 400 });
	}

	const yearNumber = Number.parseInt(year, 10) - 1;

	if (Number.isNaN(yearNumber)) {
		return new Response("Could not parse user year", { status: 400 });
	}

	return new Response(yearNumber.toString(), { status: 200 });
};
