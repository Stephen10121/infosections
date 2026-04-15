if (typeof window !== 'undefined') {
    if (!window.isResizeListenerActive) {
        window.addEventListener("message", (event) => {
            if (event.data.height && event.data.frameId) {
                const element = document.getElementById(event.data.frameId);
                if (element && element.tagName === 'IFRAME') {
                    element.height = event.data.height + 'px';
                }
            }
        }, false);
        window.isResizeListenerActive = true;
    }
} else {
    console.log("Window object doesnt exist. Wont listen for frame resize changes.");
}