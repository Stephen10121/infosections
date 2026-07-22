<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import NoCalendarAvatar from "@/NoCalendarAvatar.svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { toast } from "svelte-sonner";
	import { enhance } from "$app/forms";
	import { onDestroy } from "svelte";

	let { data, form } = $props();

	let updatingToast: null | string | number = $state("");

	function dismissToast() {
		if (updatingToast !== null) {
			toast.dismiss(updatingToast);
			updatingToast = null;
		}
	}

	$effect(() => {
		if (form?.message) {
			toast.error(form.message);
			dismissToast();
		}
	});

	onDestroy(() => {
		dismissToast();
	});
</script>

<svelte:head>
	<title>Login | {data.name}</title>
	<link rel="shortcut icon" href={data.logo} type="image/x-icon" />
</svelte:head>

<main
	class="w-full min-h-screen flex items-center justify-center"
	style="background-color: #f9f9f5;"
>
	<Card.Root style="width:350px;">
		<Card.Header>
			<Card.Title>{data.name}</Card.Title>
			<Card.Description
				>{#if data.customMessage.length > 0}{data.customMessage}{:else}This calendar is restricted.{/if}</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				use:enhance={() => {
					updatingToast = toast.loading("Logging In...");
					return async ({ update }) => {
						if (updatingToast) {
							dismissToast();
						}
						update({ reset: true });
					};
				}}
			>
				<div class="grid w-full items-center gap-4">
					<div class="w-full flex justify-center">
						<Avatar.Root class="h-60 w-60 border-gray border-2">
							<Avatar.Image src={data.logo} alt="Avatar" />
							<Avatar.Fallback><NoCalendarAvatar /></Avatar.Fallback>
						</Avatar.Root>
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="password">Password</Label>
						<Input
							autofocus
							id="password"
							class="bg-(#f9f9f5)"
							type="password"
							name="password"
							placeholder="Password"
						/>
					</div>
					<div class="flex justify-between">
						<Button class="bg-(#f9f9f5)" href="/" variant="outline">Cancel</Button>
						<Button type="submit">Login</Button>
					</div>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</main>
