let ports = [];

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
        console.log('Active tab changed to:', tab.url);

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