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
        const companyName = getText(
            'div[data-testid="job-metadata-block"] a span',
            document,
            'Company Name Not Found'
        );
        const jobTitle = getText(
            'div[data-testid="job-metadata-block"] h2',
            document,
            'Job Title Not Found'
        );
        const companyLocation = getText('i[name="location"] + *', document, '');

        let jobType = '';

        const remoteIcon = document.querySelector('i[name="remote"]');
        if (remoteIcon) {
            const parentDiv = remoteIcon.closest('div');
            const spanElement = parentDiv ? parentDiv.querySelector('span') : null;
            const spanContent = spanElement ? spanElement.textContent : '';

            if (spanContent.indexOf('total') > -1) {
                jobType = 'Remote';
            } else if (
                spanContent.indexOf('partiel') > -1 ||
                spanContent.indexOf('ponctuel') > -1 ||
                spanContent.indexOf('occasionnel') > -1 ||
                spanContent.indexOf('régulier') > -1 ||
                spanContent.indexOf('fréquent') > -1
            ) {
                jobType = 'Hybrid';
            } else {
                jobType = 'On site';
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
    window.JobParsers['welcometothejungle.com'] = parse;
})();
