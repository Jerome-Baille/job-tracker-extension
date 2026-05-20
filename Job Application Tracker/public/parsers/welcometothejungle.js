/**
 * Welcome to the Jungle job page parser.
 */
(function () {
    'use strict';

    const { getText } = window.JobParserUtils;

    /**
     * Parse Welcome to the Jungle job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const metadataBlock = document.querySelector('div[data-testid="job-metadata-block"]');

        const companyName = getText(
            'a span',
            metadataBlock,
            'Company Name Not Found'
        );
        const jobTitle = getText(
            'h2',
            metadataBlock,
            'Job Title Not Found'
        );
        const locationContainer = metadataBlock ? metadataBlock.querySelector('div:has(svg[alt="Location"])') : null;
        const locationSpan = locationContainer ? locationContainer.querySelector('span > span') : null;
        const companyLocation = locationSpan ? locationSpan.textContent.trim() : '';

        let jobType = '';

        const remoteContainer = metadataBlock ? metadataBlock.querySelector('div:has(svg[alt="Remote"])') : null;
        const remoteSpan = remoteContainer ? remoteContainer.querySelector('span:not([class])') : null;
        const remoteText = remoteSpan ? remoteSpan.textContent.trim() : '';
        const normalizedRemoteText = remoteText.toLowerCase().normalize('NFC');

        if (normalizedRemoteText.includes('total')) {
            jobType = 'Remote';
        } else if (
            normalizedRemoteText.includes('partiel') ||
            normalizedRemoteText.includes('ponctuel') ||
            normalizedRemoteText.includes('occasionnel') ||
            normalizedRemoteText.includes('régulier') ||
            normalizedRemoteText.includes('fréquent')
        ) {
            jobType = 'Hybrid';
        } else if (remoteText) {
            jobType = 'On site';
        }

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['welcometothejungle.com'] = parse;
})();
