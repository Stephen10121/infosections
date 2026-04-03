<script lang="ts">
    const stats = [
        { value: "98%", label: "Customer satisfaction", company: "Feedback is greatly appreciated" },
        { value: "2.5x", label: "Faster setup", company: "vs traditional methods" },
        { value: "50k+", label: "Calendar Views", company: "and rising" },
        { value: "24/7", label: "Always available", company: "Automated event fetching" },
    ]
</script>

<section class="py-20 sm:py-32">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {#each stats as stat, index (`stats${index}`)}
                <div class="text-center space-y-2">
                    <div class="text-4xl sm:text-5xl font-bold text-foreground">{stat.value}</div>
                    <div class="text-base font-medium text-foreground">{stat.label}</div>
                    <div class="text-sm text-muted-foreground">{stat.company}</div>
                </div>
            {/each}
        </div>
    </div>
</section>