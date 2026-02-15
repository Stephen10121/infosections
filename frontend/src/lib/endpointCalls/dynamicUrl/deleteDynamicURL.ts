import { toast } from "svelte-sonner";

type Success = boolean

export async function deleteDynamicURL(id: string): Promise<Success> {
    const data = new FormData();

    data.append("id", id);

    const response = await fetch('/api/dynamic-url', {
        method: 'DELETE',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully deleted dynamic URL.");
        return true;
    } else {
        toast.error("Failed to delete dynamic URL.");
        console.log(response);

        return false;
    }
}