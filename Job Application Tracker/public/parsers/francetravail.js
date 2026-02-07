/**
 * France Travail job page parser.
 */
(function () {
    'use strict';

    /**
     * Parse France Travail job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {

        let jobTitle = 'Job Title Not Found';
        let companyName = 'Company Name Not Found';
        let companyLocation = 'Location Not Found';
        const jobType = 'On site';

        // Helper to extract only direct text nodes (ignoring spans/children)
        function getDirectText(el) {
            let text = '';
            for (const node of el.childNodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent;
                }
            }
            return text.trim();
        }

        // Direct offer page: structured data with itemprop attributes
        const titleEl = document.querySelector('[itemprop="title"]');

        if (titleEl) {
            jobTitle = getDirectText(titleEl) || jobTitle;

            const addressEl = document.querySelector('[itemprop="address"]');
            if (addressEl) companyLocation = (addressEl.textContent || '').trim() || companyLocation;

            const mediaBody = document.querySelector('.media-body');
            if (mediaBody) {
                const h3 = mediaBody.querySelector('h3');
                if (h3) companyName = (h3.textContent || '').trim() || companyName;
            }
        } else {
            // Indirect offer page: uses a modal/popin label
            const labelEl = document.getElementById('labelPopinCandidature');
            if (labelEl) {
                jobTitle = getDirectText(labelEl) || jobTitle;

                // The <p> immediately after the label contains "location / company"
                const nextP = labelEl.nextElementSibling
                    || (labelEl.parentElement && labelEl.parentElement.querySelector('p'));

                if (nextP && nextP.tagName === 'P') {
                    const parts = (nextP.textContent || '').split('/');
                    if (parts.length >= 2) {
                        companyLocation = parts[0].trim() || companyLocation;
                        companyName = parts.slice(1).join('/').trim() || companyName;
                    } else if (parts.length === 1) {
                        companyLocation = parts[0].trim() || companyLocation;
                    }
                }
            }
        }

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['candidat.francetravail.fr'] = parse;
})();