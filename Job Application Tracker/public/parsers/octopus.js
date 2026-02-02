/**
 * Octopus IT job page parser.
 */
(function () {
    'use strict';

    const { getText } = window.JobParserUtils;

    /**
     * Parse Octopus IT job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const headerContainer = getText('.font-company-header', document, '');
        const arr = headerContainer.split(' | ');
        const jobTitle = arr[0] || 'Job Title Not Found';

        const companyName = 'Octopus IT';

        const h2Content = getText('h2', document, '');
        const locationStart = h2Content.indexOf('Lieu : ') + 7;
        const locationEnd = h2Content.indexOf('Tags') - 1;
        const companyLocation =
            locationStart > 6 && locationEnd > locationStart
                ? h2Content.substring(locationStart, locationEnd)
                : 'Location Not Found';

        const typeContainer = getText('.bg-company-primary-text', document, '');

        let jobType;
        if (typeContainer.includes('Complètement à distance')) {
            jobType = 'Remote';
        } else if (typeContainer.includes('Télétravail hybride')) {
            jobType = 'Hybride';
        } else {
            jobType = 'On Site';
        }

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['octopusit.fr'] = parse;
})();
