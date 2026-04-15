<script lang="ts">
    import type { ImageListCustomizations } from "@/utils";
    import * as Card from "@/components/ui/card/index";

    let {
        displaySettings,
        listId
    }: {
        displaySettings: ImageListCustomizations,
        listId: string,
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
           const iFrameID = document.getElementById('eventListPreviewFrame');
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
        <Card.Title>Elist Preview</Card.Title>
        <Card.Description>See the current changes in this preview before saving the settings.</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="w-full">
            <iframe     
                bind:this={previewIFrame}
                onload={iframeLoaded}
                style="background: none transparent; border: none;"
                allowtransparency
                width="100%"
                height="100%"
                src="/elistPreview/{listId}"
                title="Event List Preview"
                id="eventListPreviewFrame"
                frameborder="0"
            ></iframe>
        </div>
    </Card.Content>
</Card.Root>