<script lang="ts">
    import { Calendar, CreditCard, Layers, Smartphone } from "@lucide/svelte";

    let features = $state([
        {
            icon: Calendar,
            title: "Smart Filtering",
            description:
            "You can filter events based on if they're public, have certain tags, all resources are approved.",
        },
        {
            icon: Smartphone,
            title: "Customizable Views",
            description: "Create a custom look for a front page website, or a kiosk at church.",
        },
        {
            icon: Layers,
            title: "All-in-One Platform",
            description: "Manage multiple calendars, time zones, and availability preferences from a single dashboard.",
        },
    ])
</script>

<section class="py-20 sm:py-32 bg-secondary/30">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4 mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Everything you need to show only what you need
            </h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to filter and select the events that you want displayed in your custom calendar. 
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
            {#each features as feature, index (`feature${index}`)}
                <div class="group relative">
                    <div class="rounded-2xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:border-accent/50">
                    <div class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ring/10">
                        <feature.icon class="h-6 w-6 text-ring" />
                    </div>
                    <h3 class="text-xl font-semibold text-card-foreground mb-3">{feature.title}</h3>
                    <p class="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</section>