/**
 * APEC job page parser.
 */
(function () {
    'use strict';

    const { getText } = window.JobParserUtils;

    /**
     * Parse APEC job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const jobTitle = getText('.nav-back__title h1', document, 'Job Title Not Found');
        const companyName = getText('ul.details-offer-list li', document, 'Company Name Not Found');
        const companyLocation = getText('ul.details-offer-list.mb-20 li:last-child', document, 'Location Not Found');
        const jobType = 'Hybrid';

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['apec.fr'] = parse;
})();
