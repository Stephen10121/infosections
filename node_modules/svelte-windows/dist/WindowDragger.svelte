<script lang="ts">
    import { onDestroy } from "svelte";
    import type { MouseContext, WindowDragConfig, WindowPosition } from "./utils.js";
    import { preventScroll } from "./prevent-scroll.js";

    let {
        id,
        parentWindow,
        desktop,
        mouseContext,
        dragConfig,
        top = $bindable(),
        left = $bindable(),
        active,
        activated,
        onDragStart
    }: {
        id: string,
        parentWindow: HTMLElement,
        desktop: HTMLElement,
        mouseContext: MouseContext,
        dragConfig: WindowDragConfig,
        top: string,
        left: string,
        active: boolean,
        activated: () => unknown,
        onDragStart?: (position: WindowPosition) => unknown
    } = $props();

    let offsetX = $state(0);
    let offsetY = $state(0);

    function mouseIsDown(event: MouseEvent) {
        const parentDimensions = parentWindow?.getBoundingClientRect();
        const desktopDimensions = desktop.getBoundingClientRect();
        
        if (parentDimensions !== undefined) {
            offsetY = event.clientY - parentDimensions.top + desktopDimensions.top;
            offsetX = event.clientX - parentDimensions.left + desktopDimensions.left;
        }
        mouseContext.setActiveMouseTarget(id);
        if (!active) activated();
        if (onDragStart) onDragStart({ top, left });
    }

    function touchIsDown(event: TouchEvent) {
        const enableScroll = preventScroll();
        const parentDimensions = parentWindow?.getBoundingClientRect();
        const desktopDimensions = desktop.getBoundingClientRect();

        const touch = event.touches[0];
        
        if (parentDimensions !== undefined) {
            offsetY = touch.clientY - parentDimensions.top + desktopDimensions.top;
            offsetX = touch.clientX - parentDimensions.left + desktopDimensions.left;
        }
        mouseContext.setActiveMouseTarget(id, enableScroll);
        if (!active) activated();
        if (onDragStart) onDragStart({ top, left });
    }

    const mouseMoveResponderDel = mouseContext.addMouseMoveResponder(id, (event) => {
        const parentDimensions = parentWindow?.getBoundingClientRect();
        const desktopDimensions = desktop.getBoundingClientRect();
        top = (Math.min(desktopDimensions.height - parentDimensions.height, Math.max(0, event.clientY - offsetY))).toString() + "px";
        left = (Math.min(desktopDimensions.width - parentDimensions.width, Math.max(0, event.clientX - offsetX))).toString() + "px";
    })

    onDestroy(() => {
        mouseMoveResponderDel();
    });
</script>

<div
    style="{dragConfig.color ? `background-color:${dragConfig.color};` : ""}--drwidth:{dragConfig.width};--drheight:{dragConfig.height};{dragConfig.bottom === undefined ? `top:${dragConfig.top};` : `bottom:${dragConfig.bottom};`}{dragConfig.right === undefined ? `left:${dragConfig.left};` : `right:${dragConfig.right};`}"
    onmousedown={mouseIsDown}
    ontouchstart={touchIsDown}
    role="none"
    {id}
></div>

<style>
    div {
        width: var(--drwidth);
        height: var(--drheight);
        position: absolute;
        cursor: grab;
        z-index: 200;
        pointer-events: all;
    }
</style>