<script>
	import { Button } from "@/components/ui/button";
	import { ArrowRight } from "@lucide/svelte";

	let mostPopular = $state([
		{ name: "Church Website Front Page", visits: "47 visits" },
		{ name: "Only Approved Events", visits: "32 visits" },
		{ name: "Church Location Events", visits: "28 visits" }
	]);
</script>

<section class="relative overflow-hidden py-20 sm:py-32">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-2 gap-12 items-center">
			<div class="space-y-8">
				<div
					class="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-ring animate-pulse"></span>
					Customization made simple
				</div>

				<h1
					class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance"
				>
					View events. A better way.
				</h1>

				<p class="text-lg text-muted-foreground leading-relaxed max-w-xl">
					We offer a unified view of every event, sortable by location, tags, and custom filters so
					you can focus on what's happening, where it matters.
				</p>

				<div class="flex flex-col sm:flex-row gap-4">
					<div class="sm:w-fit w-full">
						<Button
							size="lg"
							href="/signup?free_trial=1"
							class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
						>
							Start Free Trial
							<ArrowRight class="ml-2 h-4 w-4" />
						</Button>
					</div>
					<Button size="lg" variant="outline">Watch Demo</Button>
				</div>

				<div class="flex items-center gap-8 pt-4">
					<div>
						<div class="text-2xl font-bold text-foreground">Unlimited</div>
						<div class="text-sm text-muted-foreground">Custom Calendars</div>
					</div>
					<div class="h-12 w-px bg-border"></div>
					<div>
						<div class="text-2xl font-bold text-foreground">50k+</div>
						<div class="text-sm text-muted-foreground">Calendar Views</div>
					</div>
				</div>
			</div>

			<div class="relative">
				<div class="relative rounded-2xl border border-border bg-card p-6 shadow-2xl">
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold text-card-foreground">Calendar Insights</h3>
							<div class="flex gap-2">
								<div class="h-2 w-2 rounded-full bg-ring"></div>
								<div class="h-2 w-2 rounded-full bg-muted"></div>
								<div class="h-2 w-2 rounded-full bg-muted"></div>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="rounded-lg bg-secondary p-4 space-y-2">
							<div class="text-sm font-medium text-secondary-foreground">Total Visits</div>
							<div class="text-3xl font-bold text-foreground">107</div>
							<div class="text-xs text-muted-foreground">Visits for your calendars</div>
						</div>
						<div class="rounded-lg bg-secondary p-4 space-y-2">
							<div class="text-sm font-medium text-secondary-foreground">Custom Calendars</div>
							<div class="text-3xl font-bold text-foreground">3</div>
							<div class="text-xs text-muted-foreground">Customized calendars</div>
						</div>
					</div>

					<div class="space-y-3 pt-2">
						<div class="text-sm font-medium text-card-foreground">Most Popular</div>
						{#each mostPopular as pop, index (`mostPopular${index}`)}
							<div class="flex items-center justify-between rounded-lg bg-muted/50 p-3">
								<div class="flex items-center gap-3">
									<div class="h-8 w-8 rounded-full bg-ring/10 flex items-center justify-center">
										<div class="h-4 w-4 rounded-full bg-ring"></div>
									</div>
									<div>
										<div class="text-sm font-medium text-foreground">{pop.name}</div>
										<div class="text-xs text-muted-foreground">{pop.visits}</div>
									</div>
								</div>
								<Button variant="ghost" size="sm" class="text-xs">View</Button>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
