import type { ImageFeedCustomizations, ImageFeedFilters } from "@/utils";
import { toast } from "svelte-sonner";

type Success = boolean

export async function changeIListSettings(
    id: string,
    name: string,
    description: string,
    avatarLink: string,
    uploadedAvatar: File | null,
    displaySettings: ImageFeedCustomizations,
    filterSettings: ImageFeedFilters
): Promise<Success> {
    const data = new FormData();

    if (uploadedAvatar !== null) data.append("newAvatar", uploadedAvatar);
    data.append("id", id);
    data.append("name", name);
    data.append("description", description);
    data.append("avatarLink", avatarLink);
    data.append("displaySettings", JSON.stringify(displaySettings));
    data.append("filterSettings", JSON.stringify(filterSettings));

    const response = await fetch('/api/eventList', {
        method: 'PATCH',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully updated event list.");
        return true;
    } else {
        toast.error("Failed to update event list");
        console.log(response);

        return false;
    }
}