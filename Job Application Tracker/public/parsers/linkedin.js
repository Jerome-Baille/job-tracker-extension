/**
 * LinkedIn job page parser.
 */
(function () {
    'use strict';

    const { getText, normalize } = window.JobParserUtils;

    /**
     * Parse LinkedIn job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const mainEl = document.querySelector('main');

        let jobTitle = 'Job Title Not Found';
        let companyName = 'Company Name Not Found';
        let companyLocation = 'Location Not Found';
        let jobType = 'On site';

        // jobTitle is the content of the p with specified classes
        jobTitle = getText(
            'p.d0cf87d0._6dd48011._6a30f646._73ef6a21._50dadaaf._69332e10.b67a252c._022e7d57._03f4bbb8',
            mainEl || document,
            jobTitle
        ) || jobTitle;

        // company is the content of the a tag with specified classes
        companyName = getText(
            'a._022e7d57._4e7eff25.bb8dd018._742d1a1f',
            mainEl || document,
            companyName
        ) || companyName;

        // companyLocation: find the p with specified classes and get first span
        const locationP = (mainEl || document).querySelector(
            'p.d0cf87d0._67499df2._6a30f646._73ef6a21._3ba287d8._69332e10.b67a252c.ec71ea5c._03f4bbb8'
        );
        if (locationP) {
            const firstSpan = locationP.querySelector('span');
            if (firstSpan) {
                const locText = (firstSpan.textContent || '').trim();
                if (locText) companyLocation = locText;
            }
        }

        // jobType: check the div with specified classes for remote/hybrid keywords
        const fitPrefs = (mainEl || document).querySelector(
            'div._1a4b8909.dfb4d365._8e79ff8f._695f2473._3bd183c6._2c8829c7'
        );
        if (fitPrefs) {
            const btns = Array.from(fitPrefs.querySelectorAll('button'));
            let sawHybrid = false;
            for (const b of btns) {
                const text = normalize(b.textContent || '');
                if (!text) continue;
                if (
                    text.includes('remote') ||
                    text.includes('a distance') ||
                    text.includes('teletravail') ||
                    text.includes('work from home')
                ) {
                    jobType = 'Remote';
                    sawHybrid = false;
                    break;
                }
                if (text.includes('hybrid') || text.includes('hybride')) {
                    sawHybrid = true;
                }
            }
            if (jobType !== 'Remote' && sawHybrid) jobType = 'Hybrid';
        }

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation || 'Location Not Found',
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['linkedin.com'] = parse;
})();
