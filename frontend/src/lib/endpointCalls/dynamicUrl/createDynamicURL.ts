import type { Temporal } from "temporal-polyfill";
import { toast } from "svelte-sonner";

type Success = boolean

export async function createDynamicURL(
    id: string,
    defaultRedirectTo: string,
    timeZone: Temporal.TimeZoneLike
): Promise<Success> {
    const data = new FormData();

    data.append("id", id);
    data.append("defaultRedirectTo", defaultRedirectTo);
    data.append("timeZone", timeZone.toString());

    const response = await fetch('/api/dynamic-url', {
        method: 'POST',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully created dynamic URL.");
        return true;
    } else {
        toast.error("Failed to create dynamic URL.");
        console.log(response);

        return false;
    }
}