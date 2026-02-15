import type { WeekSheetTimeSlot } from "@/utils";
import { toast } from "svelte-sonner";
import type { Temporal } from "temporal-polyfill";

type Success = boolean

export async function updateDynamicURL(
    id: string,
    defaultRedirectTo: string,
	timeZone: Temporal.TimeZoneLike,
	weekSheet: WeekSheetTimeSlot[][],
	enableWeekSheet: boolean,
	overrideRedirectTo: string,
	enableOverrideRedirect: boolean,
	disableURL: boolean
): Promise<Success> {
    const data = new FormData();

    if (enableOverrideRedirect) data.append("overrideRedirectTo", overrideRedirectTo);
    data.append("id", id);
    data.append("defaultRedirectTo", defaultRedirectTo);
    data.append("timeZone", timeZone.toString());
    data.append("weekSheet", JSON.stringify(weekSheet));
    data.append("enableWeekSheet", enableWeekSheet ? "1" : "0");
    data.append("enableOverrideRedirect", enableOverrideRedirect ? "1" : "0");
    data.append("disableURL", disableURL ? "1" : "0");

    const response = await fetch('/api/dynamic-url', {
        method: 'PATCH',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully updated dynamic URL.");
        return true;
    } else {
        toast.error("Failed to update dynamic URL.");
        console.log(response);

        return false;
    }
}