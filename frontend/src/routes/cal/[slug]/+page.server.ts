import type { CalendarDBModel } from "@/cal.utils";
import { error, redirect } from "@sveltejs/kit";
import { config } from "dotenv";

config();

export async function load({ params, locals, cookies }) {
    let calendar: CalendarDBModel;
    try {
        calendar = await locals.pb.collection('calendars').getFirstListItem(`publicId="${params.slug}"`, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Calendar not found.", err);
        return error(404, "Calendar Not Found");
    }

    if (calendar.password && calendar.passwordEnabled) {
        if (cookies.get(`cal-${params.slug}`) !== calendar.password) {
            return redirect(307, `/cal/${params.slug}/login`);
        }
    }

    try {
        await locals.pb.collection('calendars').update(calendar.id, { 
            visits: calendar.visits + 1
        }, {
            headers: {
                "Authorization": "Bearer " + process.env["POCKETBASE_TOKEN"]!
            }
        });
    } catch (err) {
        console.log("Failed to update the visits", err);
        return error(500);
    }

    return {
        id: calendar.id,
        name: calendar.name,
        logoLink: locals.pb.files.getURL(calendar, calendar.logo.toString()),
        displaySettings: calendar.displaySettings,
        filters: calendar.filters
    }
}