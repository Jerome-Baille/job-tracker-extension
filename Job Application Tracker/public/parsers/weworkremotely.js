/**
 * We Work Remotely job page parser.
 */
(function () {
    'use strict';

    const { getText } = window.JobParserUtils;

    /**
     * Parse We Work Remotely job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const jobTitle = getText('.listing-header-container h1', document, 'Job Title Not Found');
        const companyName = getText('.company-card h2 a', document, 'Company Name Not Found');

        let companyLocation = '';
        const icon = document.querySelector('i.fas.fa-map-marker-alt');
        if (icon && icon.parentElement) {
            companyLocation = icon.parentElement.textContent.trim();
        }

        const jobType = 'Remote';

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['weworkremotely.com'] = parse;
})();
