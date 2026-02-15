import type { DynamicURLModel } from "@/utils.js";
import { error, json, redirect } from "@sveltejs/kit";
import { config } from "dotenv";

config();

// async function cleanup(s: string) {
//     setTimeout(() => {
//         console.log(s);
//     }, 10000);
// }

export async function GET({ params, locals }) {
    const goID = params.slug;

    let record: DynamicURLModel;
    try {
        record = await locals.pb.collection('dynamic_url').getOne(goID, {
            headers: {
                "Authorization": "Bearer " + process.env.POCKETBASE_TOKEN!
            }
        });
    } catch (_err) {
        return error(404, "Dynamic Link not found.");
    }

    // return json({msg: record.redirectTo});
    return redirect(307, record.redirectTo);
}