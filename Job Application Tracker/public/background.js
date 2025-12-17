let ports = [];

// Prefer opening the Side Panel when the user clicks the extension icon.
// Note: this won't work if the manifest defines action.default_popup.
chrome.runtime.onInstalled.addListener(() => {
    if (chrome.sidePanel?.setPanelBehavior) {
        chrome.sidePanel
            .setPanelBehavior({ openPanelOnActionClick: true })
            .catch(() => {
                // Some Chrome versions / policies may not support this.
            });
    }
});

// Fallback: explicitly open the side panel on click (covers cases where
// openPanelOnActionClick isn't available).
chrome.action.onClicked.addListener(tab => {
    const tabId = tab?.id;
    if (!tabId || !chrome.sidePanel?.open) return;
    chrome.sidePanel.open({ tabId }).catch(() => {
        // Ignore if side panel isn't available.
    });
});

// Set up connection listener outside tab change listener
chrome.runtime.onConnect.addListener(port => {
    if (port.name === "popup") {
        ports.push(port);
        
        // Remove port when disconnected
        port.onDisconnect.addListener(() => {
            ports = ports.filter(p => p !== port);
        });
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        const supportedWebsites = ["linkedin.com", "indeed.com", "hellowork", "welcometothejungle.com", "apec.fr", "djinni.co", "weworkremotely.com"];
        const isSupported = supportedWebsites.some(site => tab.url.includes(site));

        // Send message to all connected ports
        ports.forEach(port => {
            port.postMessage({ 
                type: isSupported ? 'TAB_CHANGED' : 'TAB_UNSUPPORTED' 
            });
        });

        // Fallback to regular message if no connections
        if (ports.length === 0 && chrome.runtime.getManifest().manifest_version === 3) {
            chrome.runtime.sendMessage({ type: isSupported ? 'TAB_CHANGED' : 'TAB_UNSUPPORTED' })
                .catch(() => {
                    // Silently fail if no receivers
                });
        }
    });
});