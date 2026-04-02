import { redirect } from '@sveltejs/kit';

export function POST({ params, cookies }) {
    cookies.delete(`cal-${params.slug}`, {
        path: "/"
    });

    throw redirect(303, `/cal/${params.slug}/login`);
}

export function GET({ params, cookies }) {

    cookies.delete(`cal-${params.slug}`, {
        path: "/"
    });

    throw redirect(303, `/cal/${params.slug}/login`);
}