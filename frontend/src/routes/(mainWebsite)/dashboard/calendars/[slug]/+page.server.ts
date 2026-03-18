import type { CalendarDBModel } from '@/utils.js';
import { redirect } from '@sveltejs/kit';
import { getMyCalendars } from '../../backend.remote';

export async function load({ params, parent }) {
    await parent();
    let slug = params.slug;

    return {
        selectedCalendarId: slug
    }
}