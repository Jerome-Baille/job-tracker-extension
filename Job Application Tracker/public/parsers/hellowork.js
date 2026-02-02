/**
 * HelloWork job page parser.
 */
(function () {
    'use strict';

    const { normalize } = window.JobParserUtils;

    /**
     * Parse HelloWork job page.
     * @returns {{ name: string, company: string, location: string, type: string }}
     */
    function parse() {
        const h1 = document.querySelector('h1#main-content');

        let jobTitle = '';
        let companyName = '';
        let companyLocation = '';
        let jobType = 'On site';

        if (h1) {
            const spans = h1.getElementsByTagName('span');
            if (spans && spans.length >= 1) {
                jobTitle = spans[0].innerText.trim();
            }
            if (spans && spans.length >= 2) {
                companyName = spans[1].innerText.trim();
            }

            const section = h1.closest('section');

            // Try to find a UL by looking at the H1 container's siblings first
            let ul = null;
            const h1ContainerDiv = h1.closest('div') || h1.parentElement;
            if (h1ContainerDiv) {
                let sib = h1ContainerDiv.nextElementSibling;
                while (sib) {
                    if (sib.tagName && sib.tagName.toLowerCase() === 'ul') {
                        ul = sib;
                        break;
                    }
                    const found = sib.querySelector && sib.querySelector('ul');
                    if (found) {
                        ul = found;
                        break;
                    }
                    sib = sib.nextElementSibling;
                }
            }

            // Fallback: query the section
            if (!ul && section) {
                ul = section.querySelector('ul');
            }

            // Last resort: search for any UL with 'teletravail'
            if (!ul) {
                const possible = Array.from(document.querySelectorAll('ul'));
                ul = possible.find(u =>
                    Array.from(u.querySelectorAll('li')).some(li =>
                        normalize(li.textContent).includes('teletravail')
                    )
                );
            }

            if (ul) {
                const lis = Array.from(ul.querySelectorAll('li'));
                if (lis.length >= 1 && !companyLocation) {
                    companyLocation = lis[0].textContent.trim();
                }

                const teleworkingLi = lis.find(li =>
                    normalize(li.textContent).includes('teletravail')
                );
                if (teleworkingLi) {
                    const t = normalize(teleworkingLi.textContent);
                    if (
                        t.includes('partiel') ||
                        t.includes('occasionnel') ||
                        t.includes('ponctuel') ||
                        t.includes('hybride') ||
                        t.includes('mixte')
                    ) {
                        jobType = 'Hybrid';
                    } else if (
                        t.includes('complet') ||
                        t.includes('total') ||
                        t.includes('full')
                    ) {
                        jobType = 'Remote';
                    } else {
                        jobType = 'Remote';
                    }
                }
            }
        }

        return {
            name: jobTitle || 'Job Title Not Found',
            company: companyName || 'Company Name Not Found',
            location: companyLocation || 'Location Not Found',
            type: jobType || 'On site'
        };
    }

    // Register parser
    window.JobParsers['hellowork'] = parse;
})();
