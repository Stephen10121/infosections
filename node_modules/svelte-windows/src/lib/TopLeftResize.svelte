<script lang="ts">
    import { onDestroy } from "svelte";
    import type { MouseContext } from "./utils.js";
    import { preventScroll } from "./prevent-scroll.js";

    let {
        id,
        mouseContext,
        width = $bindable(),
        height = $bindable(),
        left = $bindable(),
        top = $bindable(),
        minWidth,
        minHeight,
        active,
        activated,
        onResizeStart
    }: {
        id: string,
        mouseContext: MouseContext,
        width: string,
        height: string,
        left: string,
        top: string,
        minWidth: number,
        minHeight: number,
        active: boolean,
        activated: () => unknown,
        onResizeStart?: () => unknown
    } = $props();

    let startX = $state(0);
    let startY = $state(0);
    let startWidth = $state(0);
    let startHeight = $state(0);
    let startLeft = $state(0);
    let startTop = $state(0);

    function clamp(value: number, min: number, max: number) {
        return Math.min(max, Math.max(min, value));
    }

    function setStartState(clientX: number, clientY: number) {
        startX = clientX;
        startY = clientY;
        startWidth = parseInt(width.slice(0, -2));
        startHeight = parseInt(height.slice(0, -2));
        startLeft = parseInt(left.slice(0, -2));
        startTop = parseInt(top.slice(0, -2));
    }

    function mouseIsDown(event: MouseEvent) {
        setStartState(event.clientX, event.clientY);
        mouseContext.setActiveMouseTarget(id);
        if (!active) activated();
        if (onResizeStart) onResizeStart();
    }

    function touchIsDown(event: TouchEvent) {
        const enableScroll = preventScroll();
        const touch = event.touches[0];
        setStartState(touch.clientX, touch.clientY);
        mouseContext.setActiveMouseTarget(id, enableScroll);
        if (!active) activated();
        if (onResizeStart) onResizeStart();
    }

    const mouseMoveResponderDel = mouseContext.addMouseMoveResponder(id, (event) => {
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;

        const maxLeft = Math.max(0, startLeft + startWidth - minWidth);
        const maxTop = Math.max(0, startTop + startHeight - minHeight);

        const nextLeft = clamp(startLeft + deltaX, 0, maxLeft);
        const nextTop = clamp(startTop + deltaY, 0, maxTop);

        const nextWidth = startWidth + (startLeft - nextLeft);
        const nextHeight = startHeight + (startTop - nextTop);

        left = `${nextLeft}px`;
        top = `${nextTop}px`;
        width = `${nextWidth}px`;
        height = `${nextHeight}px`;
    });

    onDestroy(() => {
        mouseMoveResponderDel();
    });
</script>

<div onmousedown={mouseIsDown} ontouchstart={touchIsDown} role="none" {id}></div>

<style>
    div {
        width: 10px;
        height: 10px;
        position: absolute;
        top: -5px;
        left: -5px;
        cursor: nwse-resize;
        pointer-events: all;
        z-index: 250;
    }
</style>
