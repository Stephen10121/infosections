<script lang="ts">
    import { onDestroy } from "svelte";
    import type { MouseContext } from "./utils.js";
    import { preventScroll } from "./prevent-scroll.js";

    let {
        id,
        parentWindow,
        mouseContext,
        width = $bindable(),
        minWidth,
        desktop,
        active,
        activated,
        onResizeStart
    }: {
       id: string,
       parentWindow: HTMLElement,
       mouseContext: MouseContext,
       width: string,
       minWidth: number,
       desktop: HTMLElement,
       active: boolean,
       activated: () => unknown,
       onResizeStart?: () => unknown
    } = $props();

    let offsetX = $state(0);

    function mouseIsDown(event: MouseEvent) {
        const parentDimensions = parentWindow?.getBoundingClientRect();
        const resizerDimensions = document.getElementById(id)?.getBoundingClientRect();

        if (parentDimensions !== undefined) {
            offsetX = parentDimensions.left;
        }
        if (resizerDimensions !== undefined) {
            offsetX += (event.clientX - resizerDimensions.left)
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
            offsetX = parentDimensions.left;
        }
        if (resizerDimensions !== undefined) {
            offsetX += touch.clientX - resizerDimensions.left;
        }
        mouseContext.setActiveMouseTarget(id, enableScroll);
        if (!active) activated();
        if (onResizeStart) onResizeStart();
    }

    const mouseMoveResponderDel = mouseContext.addMouseMoveResponder(id, (event) => {
        const desktopDimension = desktop.getBoundingClientRect();
        width = Math.max(minWidth, (Math.min(event.clientX, desktopDimension.width + desktopDimension.left) - offsetX)).toString() + "px";
    })

    onDestroy(() => {
        mouseMoveResponderDel();
    });
</script>

<div onmousedown={mouseIsDown} ontouchstart={touchIsDown} role="none" {id}></div>

<style>
    div {
        width: 5px;
        height: 100%;
        position: absolute;
        top: 0;
        right: -5px;
        cursor: e-resize;
        pointer-events: all;
    }
</style>