/**
 * JustJoin.it job page parser.
 */
(function () {
    'use strict';

    const { getByClassList } = window.JobParserUtils;

    /**
     * Parse JustJoin.it job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const jobTitle = getByClassList('css-1id4k1', 'Job Title Not Found');
        const companyName = getByClassList('css-l4opor', 'Company Name Not Found');
        const companyLocation = getByClassList('css-9wmrp4', 'Location Not Found');

        let jobType = getByClassList('css-1t449q3', '');
        switch (jobType.toLowerCase()) {
            case 'fully remote':
                jobType = 'Remote';
                break;
            case 'partially remote':
                jobType = 'Hybrid';
                break;
            default:
                jobType = 'On site';
                break;
        }

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['justjoin.it'] = parse;
})();
