export async function updateSpecificUserEvents() {
    const response = await fetch("/api/updateUserEvents");
    if (response.ok) {
        return true;
    } else {
        console.log(response);

        return false;
    }
}