<script lang="ts">
    import { Button } from '@/components/ui/button';

    let { data } = $props();

    let emailNotSet = $derived(!data.user.userEmail);

    async function testHit(scope: "newAccessToken" | "compareExp") {
        try {
            const data = await fetch(`/api/test?scope=${scope}`);

            if (data.ok) {
                const dataJSON = await data.json();

                console.log(dataJSON)
            }
        } catch (err) {
            console.log(err);
        }
    }
</script>

<svelte:head>
    <title>Dashboard | InfoSections</title>
</svelte:head>

{#if data.user.accessLevel !== "none"}
    <a href="{data.stripeCustomerPortal}?prefilled_email={data.user.userEmail}" target="_blank">Customer Portal</a>
{:else}
    <Button onclick={() => {
        if (data.user && data.user.userEmail) {
            window.location.replace(data.stripeUrl + "?prefilled_email=" + data.user.userEmail);
        }
    }}>Pay $6 a month.</Button>
    <Button onclick={() => {
        if (data.user && data.user.userEmail) {
            window.location.replace(data.stripeFreeTrialUrl + "?prefilled_email=" + data.user.userEmail);
        }
    }}>Free Trial.</Button>
{/if}

{#if emailNotSet}
    <p>You need to set the email.</p>
{:else}
    <p>hello {data.user?.userEmail}</p>
{/if}

<a href="/logout" class="underline">Logout</a>