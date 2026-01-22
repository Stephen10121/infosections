import { toast } from "svelte-sonner";

type Success = boolean

export async function addIFeedIncludedCalendar(
    id: string,
    calId: string[]
): Promise<Success> {
    const data = new FormData();

    data.append("id", id);
    data.append("calId", JSON.stringify(calId));

    let addingToast = toast.loading("Including the calendar.");
    const response = await fetch('/api/imageFeedIncludedCal', {
        method: 'POST',
        body: data
    });
    toast.dismiss(addingToast);
    if (response.ok) {
        toast.success("Successfully included calendar.");
        console.log(response)
        return true;
    } else {
        toast.error("Failed to include calendar.");
        console.log(response);

        return false;
    }
}

export async function removeIFeedIncludedCalendar(
    id: string,
    calId: string
): Promise<Success> {
    const data = new FormData();

    data.append("id", id);
    data.append("calId", calId);

    let removingToast = toast.loading("Removing the calendar from ifeed.");
    const response = await fetch('/api/imageFeedIncludedCal', {
        method: 'DELETE',
        body: data
    });
    toast.dismiss(removingToast);
    if (response.ok) {
        toast.success("Successfully removed calendar from image feed.");
        return true;
    } else {
        toast.error("Failed to removed calendar from image feed.");
        console.log(response);

        return false;
    }
}