if (typeof window !== 'undefined') {
    if (!window.isResizeListenerActive) {
        window.addEventListener("message", (event) => {
            if (event.data.height && event.source && 'frameElement' in event.source && event.source?.frameElement?.id) {
                if (event.source.frameElement.tagName === 'IFRAME') {
                    event.source.frameElement.height = event.data.height + 'px';
                }
            }
        }, false);
        window.isResizeListenerActive = true;
    }
} else {
    console.log("Window object doesnt exist. Wont listen for frame resize changes.");
}