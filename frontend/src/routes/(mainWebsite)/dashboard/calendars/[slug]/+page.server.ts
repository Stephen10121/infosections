import type { CalendarDBModel } from '@/utils.js';
import { redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
    const data = await parent();
    let slug = params.slug;

    let selectedCalendar: CalendarDBModel | null = null;
    for (let i=0;i<data.calendars.length;i++) {
        if (data.calendars[i].id === slug) {
            selectedCalendar = data.calendars[i];
        }
    }

    if (!selectedCalendar) {
        return redirect(307, "/dashboard/calendars");
    }

    return {
        selectedCalendar
    }
}