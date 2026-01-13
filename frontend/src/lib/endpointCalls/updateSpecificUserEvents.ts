import { config } from "dotenv";

config();

export async function updateSpecificUserEvents(id: string, authTok: string) {
    console.log(process.env.PB_URL + `updateSpecificUserEvents/${id}`);
    const response = await fetch(process.env.PB_URL + `/updateSpecificUserEvents/${id}`, {
        method: 'PATCH',
        headers: {
            "X-PCO-Webhooks-Authenticity": authTok
        }
    });
    if (response.ok) {
        console.log(response);
        return true;
    } else {
        console.log("Failed to update email");
        console.log(response);

        return false;
    }
}