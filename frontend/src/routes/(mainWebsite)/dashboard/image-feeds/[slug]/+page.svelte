<script lang="ts">
    import IFeedDisplaySettings from "@/dashboard/imageFeed/IFeedDisplaySettings.svelte";
    import IFeedFilterSettings from "@/dashboard/imageFeed/IFeedFilterSettings.svelte";
    import IFeedQuickActions from "@/dashboard/imageFeed/IFeedQuickActions.svelte";
    import IFeedPreviewCard from "@/dashboard/imageFeed/IFeedPreviewCard.svelte";
    import IFeedGeneralInfo from "@/dashboard/imageFeed/IFeedGeneralInfo.svelte";
    import IFeedStatistics from "@/dashboard/imageFeed/IFeedStatistics.svelte";
    import { updateImageFeedForm } from "../imageFeedActions.remote.js";
    import IFeedAvatar from "@/dashboard/imageFeed/IFeedAvatar.svelte";
    import IFeedShare from "@/dashboard/imageFeed/IFeedShare.svelte";
    import { getImageFeedById } from "../../backend.remote.js";
    import { Button } from "@/components/ui/button";
    import { Temporal } from "temporal-polyfill";
    import { clearFileInput } from "@/utils.js";
    import { ArrowLeft } from "@lucide/svelte";
    import { toast } from "svelte-sonner";
    import { onDestroy } from "svelte";
    import IFeedAdditionalImages from "@/dashboard/imageFeed/IFeedAdditionalImages.svelte";

    
    let { data } = $props();

    let selectedImageFeed = $derived(await getImageFeedById(data.selectedFeedId));

    let timeZone = $state(Temporal.Now.timeZoneId());
    let nowDate = $derived(Temporal.Now.zonedDateTimeISO(timeZone));
    let uploadNewAvatar: File | null = $state(null);
    let saveChangesToast: string | number | null = $state(null);

    let avatarChanged = $state(false);
    let generalInfoChanged = $state(false);
    let filterSettingsChanged = $state(false);
    let displaySettingsChanged = $state(false);

    // svelte-ignore state_referenced_locally
    let displaySettingsPreview = $state(selectedImageFeed.displaySettings);

    // This effect checks if any configurations have changed. If so, the saveRequired state will be set to true.
    $effect(() => {
        const saveRequired = avatarChanged || generalInfoChanged || displaySettingsChanged || filterSettingsChanged;
    
        if (saveRequired) {
            if (saveChangesToast === null) {
                saveChangesToast = toast("Save?", {
                    description: "You have some unsaved changes.",
                    dismissable: false,
                    duration: Number.POSITIVE_INFINITY,
                    action: {
                        label: "Save Changes",
                        onClick: () => {
                            const formSubmitButton = document.getElementById("updateImageFeedButton1") as HTMLButtonElement | null;
                            if (formSubmitButton) {
                                formSubmitButton.click();
                            }
                        }
                    }
                });
            }
        } else {
            if (saveChangesToast !== null) {
                toast.dismiss(saveChangesToast);
            }
            saveChangesToast = null;
        }
    });

    onDestroy(() => {
        if (saveChangesToast !== null) {
            toast.dismiss(saveChangesToast);
        }
        saveChangesToast = null;
    });
</script>

<svelte:head>
    <title>{selectedImageFeed.name} | InfoSections</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-6 isolate">
    <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" href="/dashboard/image-feeds">
            <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
            <h1 class="text-3xl font-bold text-foreground">{selectedImageFeed.name} | Feed Details</h1>
            <p class="text-muted-foreground mt-1">Manage your image feed settings and filters.</p>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-6">
            <form
                {...updateImageFeedForm.enhance(async ({ submit, form }) => {
                    let savingChanges = toast.loading("Saving Changes.", { duration: Number.POSITIVE_INFINITY });
                    try {
                        await submit();
                        form.reset();
                        clearFileInput(document.getElementById("imageUploaderImageFeed"));
                        uploadNewAvatar = null;
                        toast.dismiss(savingChanges);

                        toast.success("Saved Changes");
                    } catch (err) {
                        console.log(err);
                        toast.dismiss(savingChanges);
                        toast.error("An error occured.");
                    }
                })}
                class="space-y-6"
                enctype="multipart/form-data"
            >
                <Button type="submit" id="updateImageFeedButton1" class="sr-only">Update Image Feed</Button>
                <IFeedAvatar
                    bind:changed={avatarChanged}
                    bind:uploadNewAvatar
                    avatarLink={selectedImageFeed.logo ? `${data.pb_url}/api/files/${selectedImageFeed.collectionId}/${selectedImageFeed.id}/${selectedImageFeed.logo}` : ""}
                />

                <IFeedGeneralInfo
                    bind:changed={generalInfoChanged}
                    feedId={selectedImageFeed.id}
                    feedName={selectedImageFeed.name}
                    feedDescription={selectedImageFeed.description}
                />

                <IFeedDisplaySettings displaySettings={selectedImageFeed.displaySettings} bind:changed={displaySettingsChanged} bind:displaySettingsPreview />

                <IFeedPreviewCard {nowDate} displaySettings={displaySettingsPreview} feedId={selectedImageFeed.id} />

                <IFeedFilterSettings filters={selectedImageFeed.filters} bind:changed={filterSettingsChanged} />
            </form>

            <div class="space-y-6">
                <IFeedAdditionalImages feedId={selectedImageFeed.id} pb_url={data.pb_url} />
            </div>
        </div>

        <!-- This is the sticky side options section. -->
        <div class="space-y-6 stickySidebar h-fit">
            <IFeedShare feedId={selectedImageFeed.id} />

            <IFeedStatistics
                visits={selectedImageFeed.visits}
                updated={selectedImageFeed.updated}
                created={selectedImageFeed.created}
                {timeZone}
            />

            <IFeedQuickActions feedId={selectedImageFeed.id} />
        </div>
    </div>
</div>

<style>
    .stickySidebar {
        position: -webkit-sticky;
        position: sticky;
        top: 0;
    }
</style>