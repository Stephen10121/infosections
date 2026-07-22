export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

import type { Snippet } from "svelte";
import { preventScroll } from "./prevent-scroll.js";

export const INACTIVE_MOUSE_ID = "senfjkenfsjkenfseffsefsefsef" as const;
export type WindowPosition = { top: string, left: string };
export type WindowDimensions = { width: string, height: string };

type VertConfig = { top: string, bottom?: undefined } | { bottom: string, top?: undefined };
type HorizontalConfig = { left: string, right?: undefined } | { right: string, left?: undefined }
type SizeConfig = {
    width: string
    height: string
}
type OptColorConfig = {
    color?: string
}

export type WindowDragConfig = VertConfig & HorizontalConfig & SizeConfig & OptColorConfig

/**
 * This class makes it possible to only use 1 mousemove listener and 1 mouseup listener for ALL of the windows.
 * This works by registering any mouse targets and whenever a mouse movement occurs, all registered closures are called with the current mouse target id sent to the closures.
 */
export class MouseContext {
    #activeMouseTarget = "";
    mouseMoveResponders: {[key: string]: (event: { clientX: number, clientY: number }) => unknown} = {}
    activeMouseSubscribers: {[key: string]: (activeId: string) => unknown} = {}
    #enableScroll?: () => unknown | undefined = undefined;

    constructor() {
        this.#activeMouseTarget = "";
        this.mouseMoveResponders = {}
        this.activeMouseSubscribers = {}
    }

    subscribeActiveMouseSubscribers(callBack: (activeId: string) => unknown) {
        const randomId = crypto.randomUUID();
        this.activeMouseSubscribers[randomId] = callBack;

        return () => {
            delete this.activeMouseSubscribers[randomId];
        }
    }

    addMouseMoveResponder(id: string, callbackFunc: (event: { clientX: number, clientY: number }) => unknown) {
        this.mouseMoveResponders[id] = callbackFunc;

        return () => {
            delete this.mouseMoveResponders[id];
        }
    }

    touchMoving(event: TouchEvent) {
        const touch = event.touches[0]; // Get the first touch point
        const x = touch.clientX;
        const y = touch.clientY;
        if (this.#activeMouseTarget && this.#activeMouseTarget.length > 0) {
            event.preventDefault();
            if (this.#enableScroll === undefined) {
                this.#enableScroll = preventScroll();
            }
            this.mouseMoveResponders[this.#activeMouseTarget]({ clientX: x, clientY: y });
        }
    }

    mouseMoving(event: MouseEvent) {
        if (this.#activeMouseTarget && this.#activeMouseTarget.length > 0) this.mouseMoveResponders[this.#activeMouseTarget](event);
    }

    mouseIsUp() {
        this.#activeMouseTarget = "";
        if (this.#enableScroll !== undefined) {
            this.#enableScroll();
            this.#enableScroll = undefined;
        }
        for (const [_id, callback] of Object.entries(this.activeMouseSubscribers)) {
            callback(INACTIVE_MOUSE_ID);
        }
    }

    touchIsUp() {
        this.mouseIsUp();
    }

    setActiveMouseTarget(id: string, enableScroll?: () => unknown) {
        if (enableScroll) this.#enableScroll = enableScroll;
        this.#activeMouseTarget = id;
        for (const [_id, callback] of Object.entries(this.activeMouseSubscribers)) {
            callback(id);
        }
    }
}

/**
 * This class manages all the windows that are in the WindowManager component. It keeps track of the active windows, order of activeWindow history, and send data to anyone who subscribe to the active window subscribers.
 * This subscription makes it possible to see the current active window.
 */
export class WindowContext {
    activeWindow = "";
    orderOfActiveWindows: string[] = [];
    registeredWindows: {[key: string]: (windId: string, winStackOrder: string[]) => unknown} = {}
    // If anything thats not a window wants to know what the current active window is, they can subscript to activeWindowsSubscribers
    activeWindowSubscribers: {[key: string]: (windId: string, winStackOrder: string[]) => unknown} = {}
    iframeWindowClickedListeners: {[key: string]: (windId: string) => unknown} = {}

    constructor() {
        this.activeWindow = "";
        this.registeredWindows = {};
        this.activeWindowSubscribers = {};
    }

    setActiveWindow(winId: string, iframeClicked?: boolean) {
        if (this.orderOfActiveWindows.includes(winId)) {
            let newActiveWinOrder: string[] = [];
            for (let i=0;i<this.orderOfActiveWindows.length;i++) {
                if (this.orderOfActiveWindows[i] !== winId) {
                    newActiveWinOrder.push(this.orderOfActiveWindows[i]);
                }
            }
            newActiveWinOrder.push(winId);
            this.orderOfActiveWindows = newActiveWinOrder;
        } else {
            this.orderOfActiveWindows.push(winId);
        }

        this.activeWindow = winId;

        for (const [_id, activeWindowCallback] of Object.entries(this.registeredWindows)) {
            activeWindowCallback(winId, this.orderOfActiveWindows);
        }

        for (const [_id, callback] of Object.entries(this.activeWindowSubscribers)) {
            callback(winId, this.orderOfActiveWindows);
        }

        if (iframeClicked) {
            for (const [_id, callback] of Object.entries(this.iframeWindowClickedListeners)) {
                callback(this.activeWindow);
            }
        }
    }

    deleteWindow(id: string) {
        delete this.registeredWindows[id];

        if (this.orderOfActiveWindows.includes(id)) {
            let newActiveWinOrder: string[] = [];
            for (let i=0;i<this.orderOfActiveWindows.length;i++) {
                if (this.orderOfActiveWindows[i] !== id) {
                    newActiveWinOrder.push(this.orderOfActiveWindows[i]);
                }
            }
            this.orderOfActiveWindows = newActiveWinOrder;
        }

        if (this.orderOfActiveWindows.length > 0) {
            this.activeWindow = this.orderOfActiveWindows[this.orderOfActiveWindows.length - 1]
            for (const [_id, activeWindowCallback] of Object.entries(this.registeredWindows)) {
                activeWindowCallback(this.activeWindow, this.orderOfActiveWindows);
            }
    
            for (const [_id, callback] of Object.entries(this.activeWindowSubscribers)) {
                callback(this.activeWindow, this.orderOfActiveWindows);
            }
        }
    }

    registerWindow(id:string, activeWindowCallback: (winId: string, winStackOrder: string[]) => unknown) {
        this.registeredWindows[id] = activeWindowCallback;
        this.setActiveWindow(id);

        return () => {
            this.deleteWindow(id);
        }
    }

    subscribeActiveWindow(callBack: (windId: string, winStackOrder: string[]) => unknown) {
        const randomId = crypto.randomUUID();
        this.activeWindowSubscribers[randomId] = callBack;
        callBack(this.activeWindow, this.orderOfActiveWindows);

        return () => {
            delete this.activeWindowSubscribers[randomId];
        }
    }

    iframeWindowClickedSubscribe(callBack: (windId: string) => unknown) {
        const randomId = crypto.randomUUID();
        this.iframeWindowClickedListeners[randomId] = callBack;

        return () => {
            delete this.iframeWindowClickedListeners[randomId];
        }
    }

    get currentActiveWindow() {
        return this.activeWindow;
    }
}

export type ActualWindowProps = {
    /**
     * These are the places in a window that are drag targets. The user can drag a window with these targets.
     * If you dont set this, the window will not be draggable.
     * @example
     * ```ts
     * windowDragRegions: [
     *      {
     *          left: "10px",
     *          top: "0px",
     *          width: "calc(100% - 10px)",
     *          height: "100%",
     *          color: "red"
     *      },
     *      {
     *          right: "0",
     *          bottom: "0px",
     *          width: "100%",
     *          height: "10px"
     *      }
     * ]
     * ```
     * */
    windowDragRegions?: WindowDragConfig[],
    /**
     * The `<WindowManager />` component provides the context variable. To get the context you need to use a snippet.
     * @example
     * ```svelte
     *  <WindowManager>
     *       {#snippet children(context)}
     *           <Window id="win03" {context} />
     *       {/snippet}
     *   </WindowManager>
     * ```
     */
    context: {
        desktop?: HTMLElement
        mouseContext: MouseContext,
        windowContext: WindowContext,
    },
    /**
     * This makes it possible to resize the window. By default it's set to true. In order to disable the resize, set it to false.
     */
    resizable?: boolean,
    /**
     * You MUST use px to set the height. Any relative value like % or rem will not work. Only px. The default size is set to 300px.
     * 
     * You can also bind to the value to recieve the current state of it.
     * 
     * @default 300px
     * 
     * @example
     * ```ts
     * height: "10px" // Valid
     * 
     * height: "100%" // Not Valid
     * 
     * height: "calc(10px + 20px)" // Not Valid
     * ```
     */
    height?: string,
    /**
     * This minimum height that the window can be. By default the value is set to 300.
     * 
     * @default 300
     */
    minHeight?: number,
    /**
     * You MUST use px to set the width. Any relative value like % or rem will not work. Only px. The default size is set to 300px.
     * 
     * You can also bind to the value to recieve the current state of it.
     * 
     * @default 300px
     * 
     * @example
     * ```ts
     * width: "10px" // Valid
     * 
     * width: "100%" // Not Valid
     * 
     * width: "calc(10px + 20px)" // Not Valid
     * ```
     */
    width?: string,
    /**
     * This minimum width that the window can be. By default the value is set to 300.
     * 
     * @default 300
     */
    minWidth?: number,
    /**
     * This sets the x position of the window in relation to the window manager box, NOT the html window box.
     * You MUST use px to set the left value. Any relative value like % or rem will not work. Only px. The default size is set to 100px.
     * 
     * You can also bind to the value to recieve the current state of it.
     * 
     * @default 100px
     * 
     * @example
     * ```ts
     * left: "10px" // Valid
     * 
     * left: "100%" // Not Valid
     * 
     * left: "calc(10px + 20px)" // Not Valid
     * ```
     */
    left?: string,
    /**
     * This sets the y position of the window in relation to the window manager box, NOT the html window box.
     * You MUST use px to set the top value. Any relative value like % or rem will not work. Only px. The default size is set to 100px.
     * 
     * You can also bind to the value to recieve the current state of it.
     * 
     * @default 100px
     * 
     * @example
     * ```ts
     * top: "10px" // Valid
     * 
     * top: "100%" // Not Valid
     * 
     * top: "calc(10px + 20px)" // Not Valid
     * ```
     */
    top?: string,
    /**
     * Each window gets a unique id. If you register a new window with an id that already exists, the other window will not work anymore.
     * `INACTIVE_MOUSE_ID` is a reserved id. DO NOT use this id.
     */
    id: string,
    children?: Snippet,
    /**
     * This function is called if the window active state changes. You can see if the window is active with the isActive boolean.
     * @param isActive
     * @returns
     */
    onActiveStateChanged?: (isActive: boolean) => unknown
    /**
     * Called when dragging starts.
     */
    onDragStart?: (position: WindowPosition) => unknown
    /**
     * Called when dragging ends.
     */
    onDragEnd?: (position: WindowPosition) => unknown
    /**
     * Called when resizing starts.
     */
    onResizeStart?: (dimensions: WindowDimensions) => unknown
    /**
     * Called when resizing ends.
     */
    onResizeEnd?: (dimensions: WindowDimensions) => unknown
    /**
     * Any basic style to the inner window box.
     * The reason why we have an innerStyle and outerStyle argument is because the innerStyle cannot set any css properties outside the window box because of overflow hidden.
     * So, do NOT use this to set the shadow of the window. Use "outerStyle" instead.
     * ```ts
     * innerStyle = "border-radius: 10px;"
     * ```
     */
    innerStyle?: string
    /**
     * Any classes to the inside of the window box.
     * The reason why we have an innerClassName and outerClassName argument is because the innerClassName cannot set any css classes outside the window box because of overflow hidden.
     * So, do NOT use this to set the shadow of the window. Use "outerClassName" instead.
     * ```ts
     * innerClassName = "rounded-xs"
     * ```
     */
    innerClassName?: string
    /**
     * Any basic style to the outside of the window box.
     * The reason why we have an innerStyle and outerStyle argument is because the innerStyle cannot set any css properties outside the window box because of overflow hidden.
     * So, do NOT use this to set the shadow of the window. Use "outerStyle" instead.
     * ```ts
     * outerStyle = "box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;"
     * ```
     */
    outerStyle?: string
    /**
     * Any classes to the outside of the window box.
     * The reason why we have an innerClassName and outerClassName argument is because the innerClassName cannot set any css classes outside the window box because of overflow hidden.
     * So, do NOT use this to set the shadow of the window. Use "outerClassName" instead.
     * ```ts
     * outerClassName = "shadow-2xs"
     * ```
     */
    outerClassName?: string
    /**
     * If set to true, you will be able to resize inactive windows. Possible performance drops may happen.
     * ```ts
     * resizeWhenInactive = true
     * ```
     */
    resizeWhenInactive?: boolean
}


// Took the next 2 functions from runed, https://github.com/svecosystem/runed/blob/main/packages/runed/src/lib/internal/utils/dom.ts


export function getActiveElement(document: DocumentOrShadowRoot): Element | null {
	let activeElement = document.activeElement;

	while (activeElement?.shadowRoot) {
		const node = activeElement.shadowRoot.activeElement;
		if (node === activeElement) break;
		else activeElement = node;
	}

	return activeElement;
}
export function isOrContainsTarget(node: Element, target: Element) {
	return node === target || node.contains(target);
}