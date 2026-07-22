<script lang="ts">
	import LoginForm from "@/landingPage/authComponents/LoginForm.svelte";
	import { Calendar } from "@lucide/svelte";
</script>

<svelte:head>
	<title>Login | InfoSections</title>
</svelte:head>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<a href="/" class="flex items-center gap-2 self-center font-medium">
			<div
				class="bg-ring text-primary-foreground flex size-6 items-center justify-center rounded-md"
			>
				<Calendar class="size-4" />
			</div>
			InfoSections
		</a>
		<LoginForm />
	</div>
</div>
