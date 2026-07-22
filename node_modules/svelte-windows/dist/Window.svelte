<script lang="ts">
    import {
        INACTIVE_MOUSE_ID,
        type ActualWindowProps,
        type WindowPosition
    } from "./utils.js";
    import WindowDragger from "./WindowDragger.svelte";
    import BottomResize from "./BottomResize.svelte";
    import RightResize from "./RightResize.svelte";
    import LeftResize from "./LeftResize.svelte";
    import TopResize from "./TopResize.svelte";
    import TopLeftResize from "./TopLeftResize.svelte";
    import TopRightResize from "./TopRightResize.svelte";
    import BottomLeftResize from "./BottomLeftResize.svelte";
    import BottomRightResize from "./BottomRightResize.svelte";
    import { onDestroy } from "svelte";

    const FORCEMINWIDTH = 120;
    const FORCEMINHEIGHT = 120;

    let {
        height = $bindable("300px"),
        width = $bindable("300px"),
        resizeWhenInactive = false,
        left = $bindable("100px"),
        top = $bindable("100px"),
        windowDragRegions = [],
        onActiveStateChanged,
        onDragStart,
        onDragEnd,
        onResizeStart,
        onResizeEnd,
        resizable = true,
        minHeight = 300,
        minWidth = 300,
        children,
        context,
        innerStyle,
        innerClassName,
        outerStyle,
        outerClassName,
        id
    }: ActualWindowProps = $props();

    let window: HTMLElement | undefined = $state();
    let somethingMoving = $state(false);
    let stackOrder = $state(1);
    let active = $state(false);
    let activeInteraction: "drag" | "resize" | null = $state(null);

    function activeStateHasChanged(state: boolean) {
        if (onActiveStateChanged) onActiveStateChanged(state);
    }

    $effect(() => {
        activeStateHasChanged(active);
    });

    function windowOrderChanged(winId: string, winOrder: string[]) {
        stackOrder = winOrder.indexOf(id) * 10;
        active = id == winId;
    }

    function activeMouseStateChanged(activeMouseListener: string) {
        if (activeMouseListener === INACTIVE_MOUSE_ID) {
            if (activeInteraction === "drag" && onDragEnd) onDragEnd({ top, left });
            if (activeInteraction === "resize" && onResizeEnd) onResizeEnd({ width, height });
            activeInteraction = null;
            somethingMoving = false;
            return;
        }

        if (activeMouseListener.startsWith(`windowDragger${id}`)) {
            activeInteraction = "drag";
        } else if (activeMouseListener.startsWith(`windowresize${id}`)) {
            activeInteraction = "resize";
        }

        somethingMoving = true;
    }

    function dragStarted(position: WindowPosition) {
        if (onDragStart) onDragStart(position);
    }

    function resizeStarted() {
        if (onResizeStart) onResizeStart({ width, height });
    }

    const unsubscribeMouseListener = context.mouseContext.subscribeActiveMouseSubscribers(activeMouseStateChanged);
    const unsubscribeWindow = context.windowContext.registerWindow(id, windowOrderChanged);

    onDestroy(() => {
        unsubscribeMouseListener();
        unsubscribeWindow();
    });
</script>

<section
    class="{active?"active":"inactive"} {outerClassName}"
    style="--stackOrder:{stackOrder};width:max({width},min({Math.max(FORCEMINWIDTH, minWidth)}px, 100%));height:max({height},min({Math.max(FORCEMINHEIGHT, minHeight)}px, 100%));top:{top};left:{left};{outerStyle}"
    {id}
    bind:this={window}
    onmousedown={() => context.windowContext.setActiveWindow(id)}
    role="none"
>
    {#if context.desktop}
        <div class="draggers">
            {#each windowDragRegions as dragConfig, index (`windowDragger${id}${index}`)}
                <WindowDragger
                    activated={() => context.windowContext.setActiveWindow(id)}
                    mouseContext={context.mouseContext}
                    id="windowDragger{id}{index}"
                    desktop={context.desktop}
                    parentWindow={window}
                    {dragConfig}
                    bind:left
                    bind:top
                    {active}
                    onDragStart={dragStarted}
                />
            {/each}
        </div>
        {#if (active || resizeWhenInactive) && resizable}
            <TopResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                desktop={context.desktop}
                id="windowresize{id}top"
                bind:height
                {minHeight}
                bind:top
                {active}
                onResizeStart={resizeStarted}
            />
            <RightResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                id="windowresize{id}right"
                desktop={context.desktop}
                parentWindow={window}
                {minWidth}
                bind:width
                {active}
                onResizeStart={resizeStarted}
            />
            <BottomResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                id="windowresize{id}bottom"
                desktop={context.desktop}
                parentWindow={window}
                {minHeight}
                bind:height
                {active}
                onResizeStart={resizeStarted}
            />
            <LeftResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                id="windowresize{id}left"
                desktop={context.desktop}
                {minWidth}
                bind:width
                bind:left
                {active}
                onResizeStart={resizeStarted}
            />
            <TopLeftResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                id="windowresize{id}topLeft"
                bind:width
                bind:height
                bind:left
                bind:top
                {minWidth}
                {minHeight}
                {active}
                onResizeStart={resizeStarted}
            />
            <TopRightResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                id="windowresize{id}topRight"
                desktop={context.desktop}
                bind:width
                bind:height
                bind:top
                {left}
                {minWidth}
                {minHeight}
                {active}
                onResizeStart={resizeStarted}
            />
            <BottomLeftResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                id="windowresize{id}bottomLeft"
                desktop={context.desktop}
                bind:width
                bind:height
                bind:left
                {top}
                {minWidth}
                {minHeight}
                {active}
                onResizeStart={resizeStarted}
            />
            <BottomRightResize
                activated={() => context.windowContext.setActiveWindow(id)}
                mouseContext={context.mouseContext}
                id="windowresize{id}bottomRight"
                desktop={context.desktop}
                bind:width
                bind:height
                {left}
                {top}
                {minWidth}
                {minHeight}
                {active}
                onResizeStart={resizeStarted}
            />
        {/if}
    {/if}
    <div class="rest {innerClassName}" style={innerStyle}>
        {#if children}
            {@render children()}
        {/if}
    </div>
    {#if somethingMoving}
        <div class="covermoving" role="none"></div>
    {/if}
</section>

<style>
    section {
        z-index: var(--stackOrder);
        position: absolute;
        isolation: isolate;
    }

    .draggers {
        pointer-events: none;
        position: absolute;
        isolation: isolate;
        overflow: hidden;
        z-index: 200;
        height: 100%;
        width: 100%;
        left: 0;
        top: 0;
    }

    .covermoving {
        pointer-events: all;
        position: absolute;
        height: 100%;
        z-index: 100;
        width: 100%;
        left: 0;
        top: 0;
    }

	.rest {
        pointer-events: all;
        isolation: isolate;
		overflow: hidden;
		height: 100%;
		width: 100%;
	}
</style>