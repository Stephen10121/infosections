import { error, json } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function GET({ locals }) {
    if (!locals.user) return error(401, "No user");

    const response = await fetch(process.env.PB_URL + `updateSpecificUserEvents/${locals.user.id}`, {
        method: 'PATCH',
        headers: {
            "X-PCO-Webhooks-Authenticity": locals.user.authToken
        }
    });
    if (response.ok) {
        return json({ msg: "ok" });
    } else {
        console.log(response);

        return error(500, "Failed");
    }
}