<script lang="ts">
    import { onDestroy } from "svelte";
    import type { MouseContext } from "./utils.js";
    import { preventScroll } from "./prevent-scroll.js";

    let {
        id,
        parentWindow,
        mouseContext,
        height = $bindable(),
        desktop,
        minHeight,
        active,
        activated,
        onResizeStart
    }: {
        id: string,
        parentWindow: HTMLElement,
        mouseContext: MouseContext,
        height: string,
        desktop: HTMLElement,
        minHeight: number,
        active: boolean,
        activated: () => unknown,
        onResizeStart?: () => unknown
    } = $props();

    let offsetY = $state(0);

    function mouseIsDown(event: MouseEvent) {
        const parentDimensions = parentWindow?.getBoundingClientRect();
        const resizerDimensions = document.getElementById(id)?.getBoundingClientRect();
        if (parentDimensions !== undefined) {
            offsetY = parentDimensions.top;
        }
        if (resizerDimensions !== undefined) {
            offsetY += (event.clientY - resizerDimensions.top)
        }
        mouseContext.setActiveMouseTarget(id);
        if (!active) activated();
        if (onResizeStart) onResizeStart();
    }

    function touchIsDown(event: TouchEvent) {
        const enableScroll = preventScroll();
        const parentDimensions = parentWindow?.getBoundingClientRect();
        const resizerDimensions = document.getElementById(id)?.getBoundingClientRect();
        const touch = event.touches[0];
        if (parentDimensions !== undefined) {
            offsetY = parentDimensions.top;
        }
        if (resizerDimensions !== undefined) {
            offsetY += touch.clientY - resizerDimensions.top;
        }
        mouseContext.setActiveMouseTarget(id, enableScroll);
        if (!active) activated();
        if (onResizeStart) onResizeStart();
    }

    const mouseMoveResponderDel = mouseContext.addMouseMoveResponder(id, (event) => {
        const desktopDimension = desktop.getBoundingClientRect();
        height = Math.max((Math.min(event.clientY, desktopDimension.height + desktopDimension.top) - offsetY), minHeight).toString() + "px";
    })

    onDestroy(() => {
        mouseMoveResponderDel();
    });
</script>

<div onmousedown={mouseIsDown} ontouchstart={touchIsDown} role="none" {id}></div>

<style>
    div {
        width: 100%;
        height: 5px;
        position: absolute;
        bottom: -5px;
        right: 0;
        cursor: s-resize;
        pointer-events: all;
    }
</style>