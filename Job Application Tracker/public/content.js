/**
 * Content script dispatcher.
 * Delegates to site-specific parsers registered in window.JobParsers.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        const url = window.location.href;

        // Find matching parser by checking URL against registered site keys
        let result = null;
        for (const [siteKey, parser] of Object.entries(window.JobParsers || {})) {
            if (url.indexOf(siteKey) > -1) {
                result = parser();
                break;
            }
        }

        sendResponse(result);
    } catch (err) {
        console.error('content.js error while scraping page:', err);
        try {
            sendResponse({
                name: 'Error',
                company: 'Error',
                location: 'Error',
                type: 'On site',
                _error: err && err.message ? err.message : String(err)
            });
        } catch (e) {
            // ignore
        }
    }

    return true;
});