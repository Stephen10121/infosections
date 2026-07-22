import { config } from "dotenv";

config();

export async function load({ params }) {
	return {
		id: params.slug
	};
}
