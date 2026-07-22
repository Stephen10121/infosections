import { error, fail, redirect } from '@sveltejs/kit';
import type { CalendarDBModel } from '@/cal.utils.js';
import { config } from "dotenv";

config();

export async function load({ locals, params }) {
    let calendar: CalendarDBModel;
    try {
        calendar = await locals.pb.collection('calendars').getFirstListItem(`publicId="${params.slug}"`, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log(`[server] Calendar not found: '${params.slug}'.`);
        return error(404, "Calendar doesn't exist.");
    }

    if (!calendar.password) {
        return redirect(307, `/cal/${params.slug}`);
    }

    return {
        name: calendar.name,
        id: calendar.id,
        logo: locals.pb.files.getURL(calendar, calendar.logo as string),
        customMessage: calendar.passwordScreenMessage
    }
}

export const actions = {
    default: async ({ cookies, params, request, locals }) => {
        const data = await request.formData();

        let calendar: CalendarDBModel;
        try {
            calendar = await locals.pb.collection('calendars').getFirstListItem(`publicId="${params.slug}"`, {
                headers: {
                    "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
                }
            });
        } catch (err) {
            console.log("Calendar not found.");
            return error(404, "Calendar doesn't exist.");
        }

        if (calendar.password !== data.get("password")) {
            return fail(401, { message: "Invalid Password!" });
        }

        cookies.set(`cal-${params.slug}`, calendar.password, {
            path: "/"
        });

        return redirect(303, `/cal/${params.slug}`);
    }
};