export async function load({ params, parent }) {
	await parent();
	let slug = params.slug;

	return {
		selectedCalendarId: slug
	};
}
