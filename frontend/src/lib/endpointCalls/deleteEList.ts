import { toast } from "svelte-sonner";

type Success = boolean

export async function deleteEList(id: string): Promise<Success> {
    const data = new FormData();

    data.append("id", id);

    const response = await fetch('/api/eventList', {
        method: 'DELETE',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully deleted event list.");
        return true;
    } else {
        toast.error("Failed to delete event list");
        console.log(response);

        return false;
    }
}