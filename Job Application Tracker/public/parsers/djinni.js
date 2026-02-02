/**
 * Djinni job page parser.
 */
(function () {
    'use strict';

    const { getText, getByClassList } = window.JobParserUtils;

    /**
     * Parse Djinni job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const jobTitle = getText('.detail--title-wrapper h1', document, 'Job Title Not Found');
        const companyName = getByClassList('job-details--title', 'Company Name Not Found');
        const companyLocation = getByClassList('location-text', 'Location Not Found');
        const jobType = 'Remote';

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['djinni.co'] = parse;
})();
