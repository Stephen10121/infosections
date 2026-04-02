import PocketBase from "pocketbase";
import { config } from "dotenv";
import type { UserModel } from "@/utils";

config();

export async function handle ({ event, resolve }) {
    event.locals.pb = new PocketBase(process.env.PB_URL);
    // event.locals.pb.authStore.save(process.env.POCKETBASE_TOKEN!, null);
    event.locals.pb.authStore.clear();

    const authCookie = event.cookies.get("pb_auth");

    if (authCookie) {
        try {
            event.locals.pb.authStore.loadFromCookie(authCookie);
            
            event.locals.pb.authStore.isValid && await event.locals.pb.collection('users').authRefresh();

            if (event.locals.pb.authStore.isValid) {
                event.locals.user = structuredClone(event.locals.pb.authStore.record) as UserModel;
            } else {
                event.locals.user = undefined;
            }
        } catch (_) {
            event.locals.pb.authStore.clear();
        }
    }

    const response = await resolve(event);

    return response;
}