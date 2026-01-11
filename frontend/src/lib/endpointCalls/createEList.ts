import { emailNotSetDialog } from "@/store";
import { toast } from "svelte-sonner";

type Success = boolean

export async function createEList(
    name: string,
    description: string,
    stripeUrl: string,
    userEmail: any
): Promise<Success> {
    const data = new FormData();

    data.append("name", name);
    data.append("description", description);

    const response = await fetch('/api/eventList', {
        method: 'POST',
        body: data
    });
    if (response.ok) {
        toast.success("Successfully created event list.");
        return true;
    } else {
        if (response.status === 402) {
            toast("List limit reached.", {
                description: "Subscribe to a plan to get more features.",
                action: {
                    label: "Subscribe",
                    onClick: () => {
                        if (userEmail) {
                            window.location.replace(stripeUrl + "?prefilled_email=" + userEmail);
                        } else {
                            emailNotSetDialog.set(true);
                        }
                    }
                }
            });
        } else {
            toast.error("Failed to create event list.");
        }
        console.log({response});

        return false;
    }
}