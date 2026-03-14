<script lang="ts">
    import { cn } from "$lib/utils.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Field from "$lib/components/ui/field/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import type { HTMLAttributes } from "svelte/elements";
    import { createEmailPasswordSignup, googleLoginSignup } from "../../../routes/(mainWebsite)/signup/signup.remote";

    let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn("flex flex-col gap-6", className)} {...restProps}>
    <Card.Root>
        <Card.Header class="text-center">
            <Card.Title class="text-xl">Create your account</Card.Title>
            <Card.Description>Enter your email below to create your account</Card.Description>
        </Card.Header>
        <Card.Content>
            <form {...createEmailPasswordSignup}>
                <Field.Group>
                    <Field.Field>
                        <Field.Label for="name">Full Name</Field.Label>
                        <Input id="name" {...createEmailPasswordSignup.fields.name.as("text")} />
                        {#each createEmailPasswordSignup.fields.name.issues() as issue (`anIssueforname${issue.message}`)}
                            <Field.Error>{issue.message}</Field.Error>
                        {/each}
                    </Field.Field>

                    <Field.Field>
                        <Field.Label for="email">Email</Field.Label>
                        <Input id="email" {...createEmailPasswordSignup.fields.email.as("email")} />
                        {#each createEmailPasswordSignup.fields.email.issues() as issue (`anIssueforemail${issue.message}`)}
                            <Field.Error>{issue.message}</Field.Error>
                        {/each}
                    </Field.Field>

                    <Field.Field>
                        <Field.Field class="grid grid-cols-2 gap-4">
                            <Field.Field>
                                <Field.Label for="password">Password</Field.Label>
                                <Input id="password" {...createEmailPasswordSignup.fields.password.as("password")} />
                                {#each createEmailPasswordSignup.fields.password.issues() as issue (`anIssueforpassword${issue.message}`)}
                                    <Field.Error>{issue.message}</Field.Error>
                                {/each}
                            </Field.Field>
                            <Field.Field>
                                <Field.Label for="confirm-password">Confirm Password</Field.Label>
                                <Input id="confirm-password" {...createEmailPasswordSignup.fields.passwordConfirm.as("password")} />
                                {#each createEmailPasswordSignup.fields.passwordConfirm.issues() as issue (`anIssueforpasswordconfirm${issue.message}`)}
                                    <Field.Error>{issue.message}</Field.Error>
                                {/each}
                            </Field.Field>
                        </Field.Field>
                        <Field.Description>Must be at least 8 characters long.</Field.Description>
                    </Field.Field>

                    <Field.Field>
                        <Button type="submit">Create Account</Button>
                    </Field.Field>
                </Field.Group>
            </form>

            <form {...googleLoginSignup}>
                <Field.Group class="mt-5">
                    <Field.Separator class="*:data-[slot=field-separator-content]:bg-card">
                        Or continue with
                    </Field.Separator>
    
                    <Field.Field class="flex">
                        <Input {...googleLoginSignup.fields.id.as("hidden", "google_login")} />
                        <Button variant="outline" type="submit">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                fill="currentColor"
                            />
                            </svg>
                            <span>Sign up with Google</span>
                        </Button>
                        {#each googleLoginSignup.fields.id.issues() as issue (`anIssueforoathGoogleLoginconfirm${issue.message}`)}
                            <Field.Error>{issue.message}</Field.Error>
                        {/each}
                    </Field.Field>
    
                    <Field.Description class="text-center">
                        Already have an account? <a href="#/">Sign in</a>
                    </Field.Description>
                </Field.Group>
            </form>
        </Card.Content>
    </Card.Root>
    <Field.Description class="px-6 text-center">
        By clicking continue, you agree to our <a href="#/">Terms of Service</a>
        and <a href="#/">Privacy Policy</a>.
    </Field.Description>
</div>
