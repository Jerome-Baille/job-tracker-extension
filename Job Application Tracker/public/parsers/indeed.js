/**
 * Indeed job page parser.
 */
(function () {
    'use strict';

    /**
     * Parse Indeed job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const jobTitle = document.querySelector('[data-testid="simpler-jobTitle"]')?.innerText ??
            document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText ??
            'Job Title Not Found';

        const companyName = document.querySelector('.jobsearch-JobInfoHeader-companyNameLink')?.innerText ??
            document.querySelector('.jobsearch-JobInfoHeader-companyNameSimple')?.innerText ??
            document.querySelector('[data-testid="inlineHeader-companyName"]')?.innerText ??
            'Company Name Not Found';

        let companyLocation = 'Non spécifié';
        let jobType = 'On Site';
        let jobText = '';

        const inlineCompanyLocation = document.querySelector('[data-testid="inlineHeader-companyLocation"]')?.innerText;

        if (inlineCompanyLocation) {
            companyLocation = inlineCompanyLocation;
        } else {
            const container = document.querySelector('[data-testid="jobsearch-JobInfoHeader-companyLocation"]');
            if (container) {
                const div = container.querySelector('div');
                if (div) {
                    const children = Array.from(div.childNodes);
                    const sepIndex = children.findIndex(n =>
                        n.nodeType === Node.ELEMENT_NODE && n.getAttribute('role') === 'separator'
                    );
                    if (sepIndex > -1) {
                        companyLocation = children.slice(0, sepIndex)
                            .map(n => n.textContent.trim())
                            .filter(Boolean)
                            .join(' ');
                        jobText = children.slice(sepIndex + 1)
                            .map(n => n.textContent.trim())
                            .filter(Boolean)
                            .join(' ');
                    } else {
                        companyLocation = div.textContent.trim();
                    }
                }
            } else {
                jobText = 'Télétravail';
            }
        }

        jobType = jobText.includes('Télétravail partiel') ? 'Hybride' :
            jobText.includes('Télétravail') ? 'Remote' :
                'On Site';

        return {
            name: jobTitle,
            company: companyName,
            location: companyLocation,
            type: jobType
        };
    }

    // Register parser
    window.JobParsers['indeed.com'] = parse;
})();
