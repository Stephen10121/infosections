<script lang="ts">
    import type { ImageFeedCustomizations } from "@/utils";
    import * as Card from "@/components/ui/card/index";
    import { Switch } from "@/components/ui/switch";
    import { Label } from "@/components/ui/label";

    let {
        displaySettings,
        feedId
    }: {
        displaySettings: ImageFeedCustomizations,
        feedId: string
    } = $props();

    let previewIFrame: HTMLIFrameElement | undefined = $state();

    $effect(() => {
        if (displaySettings && previewIFrame && previewIFrame.contentWindow) {
            previewIFrame.contentWindow.postMessage({ call: 'displaySettings', value: JSON.stringify(displaySettings) });
            setTimeout(() => {
                iframeLoaded();
            }, 0);
        }
    });

    function iframeLoaded() {
        try {
           const iFrameID = document.getElementById('imageFeedPreviewFrame');
            if(iFrameID) {
                // @ts-ignore
                iFrameID.height = "";
                // @ts-ignore
                iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + 39 + "px";
            }  
        } catch (_err) {
            console.log("Oops. Iframe wasnt loaded.")
        }
    }
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Ifeed Preview Grid</Card.Title>
        <Card.Description>See the current changes in this preview before saving the settings.</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="w-full">
            <iframe     
                bind:this={previewIFrame}
                onload={iframeLoaded}
                style="background: none transparent;border:none;"
                allowtransparency
                width="100%"
                height="100%"
                src="/ifeedPreview/{feedId}"
                title="Image Feed Preview"
                id="imageFeedPreviewFrame"
                frameborder="0"
            ></iframe>
        </div>
        <div class="flex items-center justify-between space-x-2 mt-5">
            <Label for="showDebugger" class="flex flex-col items-start space-y-1 cursor-pointer">
                <span class="font-medium">Debugger</span>
                <span class="text-sm text-muted-foreground">Show extra information in the ifeed preview.</span>
            </Label>
            <Switch
                id="showDebugger"
                onCheckedChange={(checked) => {
                    if (displaySettings && previewIFrame && previewIFrame.contentWindow) {
                        previewIFrame.contentWindow.postMessage({ call: 'toggleDebug', value: checked ? "1" : "0" });
                    }
                }}
            />
        </div>
    </Card.Content>
</Card.Root>