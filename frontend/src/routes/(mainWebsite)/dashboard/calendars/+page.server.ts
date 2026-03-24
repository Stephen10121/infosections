import { getMyCalendars } from "../backend.remote";

export async function load({ parent }) {
    await parent();
} 