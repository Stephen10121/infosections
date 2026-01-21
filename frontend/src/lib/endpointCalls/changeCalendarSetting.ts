import type { CalendarCustomizations, CalendarFilters } from "@/utils";
import { toast } from "svelte-sonner";

type Success = boolean

export async function changeCalendarSettings(
    id: string,
    name: string,
    description: string,
    enablePassword: boolean,
    newPassword: string,
    avatarLink: string,
    uploadedAvatar: File | null,
    passwordScreenMessage: string,
    displaySettings: CalendarCustomizations,
    filters: CalendarFilters
): Promise<Success> {
    const data = new FormData();

    if (uploadedAvatar !== null) data.append("newAvatar", uploadedAvatar);
    data.append("id", id);
    data.append("name", name);
    data.append("description", description);
    data.append("enablePassword", enablePassword ? "1" : "0");
    data.append("newPassword", newPassword);
    data.append("avatarLink", avatarLink);
    data.append("passwordScreenMessage", passwordScreenMessage);
    data.append("displaySettings", JSON.stringify(displaySettings));
    data.append("filters", JSON.stringify(filters));

    const response = await fetch('/api/calendar', {
        method: 'PATCH',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully updated calendar.");
        return true;
    } else {
        toast.error("Failed to update calendar");
        console.log(response);

        return false;
    }
}