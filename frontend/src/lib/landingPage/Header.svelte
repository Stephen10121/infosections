<script lang="ts">
    import { Button } from "@/components/ui/button";
    import { Calendar } from "@lucide/svelte";

    let { loggedIn }: { loggedIn: boolean } = $props();
</script>

<header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
            <div class="flex items-center gap-2">
                <Calendar class="h-6 w-6 text-ring" />
                <span class="text-xl font-semibold text-foreground">InfoSections</span>
            </div>

            <nav class="hidden md:flex items-center gap-8">
                <a href="#features" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#pricing" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <a href="#about" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
            </nav>

            {#if loggedIn}
                <Button href="/dashboard" variant="outline">Dashboard</Button>
            {:else}
                <div class="flex gap-3 items-center">
                    <Button href="/signup" class="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
                    <Button href="/login" variant="outline">Login</Button>
                </div>
            {/if}
        </div>
    </div>
</header>