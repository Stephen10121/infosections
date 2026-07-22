// Reexport your entry components here
import { default as WindowManager } from "./WindowManager.svelte";
import { default as Window } from "./Window.svelte";

import type { ActualWindowProps, WindowDimensions, WindowDragConfig, WindowPosition } from "./utils.js";
import { INACTIVE_MOUSE_ID, MouseContext, WindowContext } from "./utils.js";

export {
    INACTIVE_MOUSE_ID,
    MouseContext,
    Window,
    WindowContext,
    WindowManager,
    type ActualWindowProps,
    type WindowDimensions,
    type WindowDragConfig,
    type WindowPosition
}