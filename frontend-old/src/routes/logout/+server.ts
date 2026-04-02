import { redirect } from '@sveltejs/kit';

export function POST({ locals, cookies }) {
    locals.pb.authStore.clear();
    locals.user = undefined;

    cookies.delete("pb_auth", {
        path: "/"
    });

    throw redirect(303, "/");
}

export function GET({ locals, cookies }) {
    locals.pb.authStore.clear();
    locals.user = undefined;

    cookies.delete("pb_auth", {
        path: "/"
    });

    throw redirect(303, "/");
}