<script lang="ts">
	import { ArrowLeft } from "@lucide/svelte";
</script>

<svelte:head>
	<title>Terms of Service | InfoSections</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="mx-auto max-w-3xl px-6 py-12">
		<a
			href="/"
			class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 mt-5"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Home
		</a>

		<article class="prose prose-invert max-w-none">
			<h1 class="text-3xl font-bold tracking-tight text-foreground mb-2">Terms of Service</h1>
			<p class="text-muted-foreground mb-8">Last updated: March 14, 2026</p>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					By accessing or using InfoSections ("the Service"), you agree to be bound by these Terms
					of Service. If you do not agree to these terms, please do not use the Service.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					InfoSections provides an event management platform that allows users to fetch events from
					third-party services, create event displays (calendars, lists, carousels), and manage
					dynamic URLs for event redirection.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					You are responsible for maintaining the confidentiality of your account credentials and
					for all activities that occur under your account. You agree to notify us immediately of
					any unauthorized use of your account.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">4. Third-Party Integrations</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					The Service integrates with third-party services such as Planning Center, Breeze ChMS,
					Google Calendar, and others. Your use of these integrations is subject to the respective
					third-party terms of service. We are not responsible for the availability, accuracy, or
					content provided by third-party services.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">5. Acceptable Use</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					You agree not to use the Service to:
				</p>
				<ul class="list-disc list-inside text-muted-foreground space-y-2 mb-4">
					<li>Violate any applicable laws or regulations</li>
					<li>Infringe on the rights of others</li>
					<li>Distribute malicious software or harmful content</li>
					<li>Attempt to gain unauthorized access to the Service or its systems</li>
					<li>Interfere with or disrupt the Service's operation</li>
				</ul>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					The Service and its original content, features, and functionality are owned by
					InfoSections and are protected by international copyright, trademark, and other
					intellectual property laws.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">7. Data and Privacy</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					Your use of the Service is also governed by our{" "}
					<a href="/privacy" class="text-primary hover:underline"> Privacy Policy </a>
					. By using the Service, you consent to the collection and use of information as described in
					the Privacy Policy.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					To the maximum extent permitted by law, InfoSections shall not be liable for any indirect,
					incidental, special, consequential, or punitive damages, including loss of profits, data,
					or other intangible losses resulting from your use of the Service.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">9. Termination</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					We reserve the right to terminate or suspend your account and access to the Service at our
					sole discretion, without prior notice, for conduct that we believe violates these Terms or
					is harmful to other users, us, or third parties.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">10. Changes to Terms</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					We reserve the right to modify these Terms at any time. We will notify users of
					significant changes by posting a notice on the Service. Your continued use of the Service
					after such modifications constitutes acceptance of the updated Terms.
				</p>
			</section>

			<section class="mb-8">
				<h2 class="text-xl font-semibold text-foreground mb-4">11. Contact Information</h2>
				<p class="text-muted-foreground leading-relaxed mb-4">
					If you have any questions about these Terms, please contact us at{" "}
					<a href="mailto:support@infosections.com" class="text-primary hover:underline">
						support@infosections.com
					</a>
					.
				</p>
			</section>
		</article>

		<div class="mt-12 pt-8 border-t border-border">
			<p class="text-sm text-muted-foreground">
				See also:{" "}
				<a href="/privacy" class="text-primary hover:underline"> Privacy Policy </a>
			</p>
		</div>
	</div>
</div>
