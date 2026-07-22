<script lang="ts">
    import { onDestroy, type Snippet } from "svelte";
    import {
        getActiveElement,
        INACTIVE_MOUSE_ID,
        isOrContainsTarget,
        MouseContext,
        WindowContext,
        type ActualWindowProps
    } from "./utils.js";

    type ParentDesktop = HTMLElement | undefined;

    let {
        children = undefined,
        mouseContext = new MouseContext(),
        windowContext = new WindowContext()
    }: { 
        children?: Snippet<[ActualWindowProps["context"]]>,
        mouseContext?: MouseContext,
        windowContext?: WindowContext,
    } = $props();
    
    let parentDesktop: ParentDesktop = $state();
    let somethingMoving = $state(false);

    const mouseUnsub = mouseContext.subscribeActiveMouseSubscribers((active) => {
        somethingMoving = active !== INACTIVE_MOUSE_ID;
    });

    // Checks if the user clicked an iframe that happens to be in the window manager scope.
    function blurEvent() {
        const activeElement = getActiveElement(document);
        if (!activeElement || activeElement?.tagName !== "IFRAME") return

        for (let i=0;i<Object.keys(windowContext.registeredWindows).length;i++) {
            let doc = document.getElementById(Object.keys(windowContext.registeredWindows)[i]);
            if (!doc) continue

            if (isOrContainsTarget(doc, activeElement)) windowContext.setActiveWindow(Object.keys(windowContext.registeredWindows)[i], true)
        }
    }

    onDestroy(() => {
        mouseUnsub();
    });
</script>

<svelte:window
    onmousemove={(e) => mouseContext.mouseMoving(e)}
    ontouchmove={(e) => mouseContext.touchMoving(e)}
    onmouseup={() => mouseContext.mouseIsUp()}
    ontouchend={() => mouseContext.touchIsUp()}
    onblur={blurEvent}
/>

<section class="rest {somethingMoving ? "somethingDragging" : ""}" bind:this={parentDesktop}>
    {#if children}
        {@render children({ mouseContext, windowContext, desktop: parentDesktop })}
    {/if}
</section>

<style>
    :global(body:has(.somethingDragging) *) {
        user-drag: none;
        -webkit-user-drag: none;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        -webkit-touch-callout: none; /* iOS Safari */
        -khtml-user-select: none; /* Konqueror HTML */
    }
    
    section {
        width: 100%;
        height: 100%;
        pointer-events: none;
        position: relative;
        overflow: hidden;
        isolation: isolate;
        box-sizing: border-box;
    }
</style>