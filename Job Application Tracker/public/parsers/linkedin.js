/**
 * LinkedIn job page parser.
 */
(function () {
    'use strict';

    const { normalize } = window.JobParserUtils;

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

        // Look inside the first div[data-testid="lazy-column"] for job details
        const lazyCol = (mainEl || document).querySelector('div[data-testid="lazy-column"]');
        if (lazyCol) {
            const pEls = lazyCol.querySelectorAll('p');
            const secondP = pEls[1] || null;
            if (secondP) jobTitle = (secondP.textContent || '').trim() || jobTitle;

            const firstA = lazyCol.querySelector('a');
            if (firstA) companyName = (firstA.textContent || '').trim() || companyName;

            const spans = Array.from(lazyCol.querySelectorAll('span'));
            const nonEmptySpan = spans.find(s => (s.textContent || '').trim().length > 0);
            if (nonEmptySpan) companyLocation = (nonEmptySpan.textContent || '').trim();
        }

        // jobType: search keywords inside the content of all buttons on the page
        const btns = Array.from((mainEl || document).querySelectorAll('button'));
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
