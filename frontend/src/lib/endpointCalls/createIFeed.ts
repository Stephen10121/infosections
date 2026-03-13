import { toast } from "svelte-sonner";

type Success = boolean

export async function createIFeed(
    name: string,
    description: string,
    subscriptionURL: string,
): Promise<Success> {
    const data = new FormData();

    data.append("name", name);
    data.append("description", description);

    const response = await fetch('/api/imageFeed', {
        method: 'POST',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully created image feed.");
        return true;
    } else {
        if (response.status === 402) {
            toast("Feed limit reached.", {
                description: "Subscribe to a plan to get more features.",
                action: {
                    label: "Subscribe",
                    onClick: () => {
                        window.location.replace(subscriptionURL);
                    }
                }
            });
        } else {
            toast.error("Failed to create image feed");
        }
        console.log({response});

        return false;
    }
}