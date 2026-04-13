/**
 * Meteojob job page parser.
 */
(function () {
    'use strict';

    const { getText } = window.JobParserUtils;

    /**
     * Parse Meteojob job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const jobTitle = getText('h1 span.cc-job-offer-title', document, 'Job Title Not Found');

        // Company name is the last span inside the h1
        let companyName = 'Company Name Not Found';
        const h1 = document.querySelector('h1');
        if (h1) {
            const spans = h1.querySelectorAll('span');
            if (spans.length > 0) {
                companyName = spans[spans.length - 1].textContent.trim() || companyName;
            }
        }

        // Location: span.cc-offer-info-top--label that contains a mat-icon with text "place"
        let companyLocation = 'Location Not Found';
        const infoLabels = document.querySelectorAll('span.cc-offer-info-top--label');
        for (const label of infoLabels) {
            const icon = label.querySelector('mat-icon');
            if (icon && icon.textContent.trim() === 'place') {
                companyLocation = label.textContent.replace('place', '').trim();
                break;
            }
        }

        // Job type: span.cc-offer-info-top--label that contains a mat-icon with text "house"
        let jobType = 'On site';
        for (const label of infoLabels) {
            const icon = label.querySelector('mat-icon');
            if (icon && icon.textContent.trim() === 'house') {
                const text = label.textContent.replace('house', '').trim();
                if (text === 'Télétravail partiel') {
                    jobType = 'Hybrid';
                } else if (text !== 'Télétravail non autorisé') {
                    jobType = 'Remote';
                }
                break;
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
    window.JobParsers['meteojob.com'] = parse;
})();
