<script lang="ts">
    import { onDestroy } from "svelte";
    import type { MouseContext } from "./utils.js";
    import { preventScroll } from "./prevent-scroll.js";

    let {
        id,
        mouseContext,
        width = $bindable(),
        left = $bindable(),
        minWidth,
        desktop,
        active,
        activated,
        onResizeStart
    }: {
        id: string,
        mouseContext: MouseContext,
        width: string,
        left: string,
        minWidth: number,
        desktop: HTMLElement,
        active: boolean,
        activated: () => unknown,
        onResizeStart?: () => unknown
    } = $props();

    let offsetX = $state(0);

    function mouseIsDown(event: MouseEvent) {
        const resizerDimensions = document.getElementById(id)?.getBoundingClientRect();
        if (resizerDimensions !== undefined) {
            offsetX = 5-(event.clientX - resizerDimensions.left)
        }
        mouseContext.setActiveMouseTarget(id);
        if (!active) activated();
        if (onResizeStart) onResizeStart();
    }

    function touchIsDown(event: TouchEvent) {
        const enableScroll = preventScroll();
        const resizerDimensions = document.getElementById(id)?.getBoundingClientRect();
        const touch = event.touches[0];
        if (resizerDimensions !== undefined) {
            offsetX = 5 - (touch.clientX - resizerDimensions.left);
        }
        mouseContext.setActiveMouseTarget(id, enableScroll);
        if (!active) activated();
        if (onResizeStart) onResizeStart();
    }

    const mouseMoveResponderDel = mouseContext.addMouseMoveResponder(id, (event) => {
        const desktopDims = desktop.getBoundingClientRect();
        
        const prevLeft = parseInt(left.slice(0, -2));
        const newLeft = event.clientX + offsetX - desktopDims.left;
        const widthNum = parseInt(width.slice(0, -2));
        
        left = Math.abs(Math.max(minWidth, prevLeft - Math.max(newLeft, 0) + widthNum) - widthNum - parseInt(left.slice(0, -2))).toString() + "px";
        width = Math.max(minWidth, prevLeft - Math.max(newLeft, 0) + widthNum).toString() + "px";
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
        left: -5px;
        cursor: w-resize;
        pointer-events: all;
    }
</style>