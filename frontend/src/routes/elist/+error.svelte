<script>
    import { page } from "$app/state";
    import { AlertCircle, RefreshCw } from "@lucide/svelte";
</script>

<svelte:head>
    <title>{page.status} {page.error?.message}</title>
</svelte:head>

<main class="dark min-h-screen w-full flex items-center justify-center bg-background" style="">
    <div class="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-950/30 border border-red-900/50">
            <AlertCircle class="h-10 w-10 text-red-500" />
        </div>

        <h2 class="dark mb-3 text-2xl font-bold text-white">{page.status} {page.error?.message}</h2>

        <p class="dark mb-8 max-w-md text-gray-500">
            {#if page.status === 404}
                We couldn't find the event list you're looking for. This might be due to an invalid link or the list may not exist.
            {:else}
                An error has occured. Please wait and try again. If the error keeps happening, contact our support team.
            {/if}
        </p>

            <a
                data-sveltekit-preload-data="off"
                href={page.url.toString()}
                class="dark flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-gray-200"
                >
                <RefreshCw class="h-4 w-4" />
                Try Again
            </a>

        <div class="dark mt-8 text-sm text-gray-500">Need help? <a href="mailto:support@infosections.com" class="underline">Contact support</a></div>
        <div class="dark mt-1 text-sm text-gray-500"><a href="https://uptime.stephengruzin.dev/status/infosections" target="_blank" class="underline">Status Page</a></div>
    </div>
</main>