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
            'p._3a77e68c._4dceb28c._66c0300d.b07652e5._1816733c._00f2bb2c._51aa4f39._77bf8873._150cba7a',
            mainEl || document,
            jobTitle
        ) || jobTitle;

        // company is the content of the a tag with specified classes
        companyName = getText(
            'a._77bf8873._9df4e0d3._9566f9ea.ab7d4f05',
            mainEl || document,
            companyName
        ) || companyName;

        // companyLocation: find the p with specified classes and get first span
        const locationP = (mainEl || document).querySelector(
            'p._3a77e68c._761606f8._66c0300d.b07652e5.a2778aeb._00f2bb2c._51aa4f39._5d0b0d2f._150cba7a'
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
            'div._6d9316ce.c573e5cb._5798babd._9952eb5c._6244c491.b00ee6b2'
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
