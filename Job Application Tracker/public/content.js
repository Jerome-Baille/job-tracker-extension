chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        const url = window.location.href;

        // Global helpers: safe queries and accent-insensitive normalization
        const getText = (selector, ctx = document, fallback = '') => {
            const el = ctx.querySelector(selector);
            return el ? el.textContent.trim() : fallback;
        };

        const getByClassList = (classList, fallback = '') => {
            const selector = '.' + classList.trim().split(/\s+/).join('.');
            return getText(selector, document, fallback);
        };

        const normalize = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();

    // if current URL contains "linkedin"
    if (url.indexOf("linkedin.com") > -1) {
        const mainEl = document.querySelector('main');

        let jobTitle = 'Job Title Not Found';
        let companyName = 'Company Name Not Found';
        let companyLocation = 'Location Not Found';
        let jobType = 'On site';

        // jobTitle is the content of the div with class "f5823fe9 _672f5363 ca3d9c80 _87c28aea c34544bf _3e5512f1 _14c8962d ba64e61e a2217112"
        jobTitle = getText('.f5823fe9._672f5363.ca3d9c80._87c28aea.c34544bf._3e5512f1._14c8962d.ba64e61e.a2217112', mainEl || document, jobTitle) || jobTitle;

        // company is the content of the a tag with class "ba64e61e cfcfed24 _1ef4c821 _3c388725"
        companyName = getText('a.ba64e61e.cfcfed24._1ef4c821._3c388725', mainEl || document, companyName) || companyName;

        // companyLocation: find the p with class "f5823fe9 _7e00cc80 ca3d9c80 _87c28aea b154eb37 _3e5512f1 _14c8962d _822563a7 a2217112" and get first span
        const locationP = (mainEl || document).querySelector('p.f5823fe9._7e00cc80.ca3d9c80._87c28aea.b154eb37._3e5512f1._14c8962d._822563a7.a2217112');
        if (locationP) {
            const firstSpan = locationP.querySelector('span');
            if (firstSpan) {
                const locText = (firstSpan.textContent || '').trim();
                if (locText) companyLocation = locText;
            }
        }

        // jobType: find the first div with class "d43d0ae6 _6aa42965 _55273a0f _822041e1 _033aed70 _6c0f1c43" and do the same text search as before
        const fitPrefs = (mainEl || document).querySelector('div.d43d0ae6._6aa42965._55273a0f._822041e1._033aed70._6c0f1c43');
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

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation || 'Location Not Found', type: jobType });
    }

    // if current URL contains "indeed.com"
    else if (url.indexOf("indeed.com") > -1) {
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
                            .join(" ");
                        jobText = children.slice(sepIndex + 1)
                            .map(n => n.textContent.trim())
                            .filter(Boolean)
                            .join(" ");
                    } else {
                        companyLocation = div.textContent.trim();
                    }
                }
            } else {
                jobText = 'Télétravail';
            }
        }

        jobType = jobText.includes("Télétravail partiel") ? "Hybride" :
            jobText.includes("Télétravail") ? "Remote" :
                "On Site";

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType });
    }

    // if current URL contains "hellowork.com"
    else if (url.indexOf("hellowork") > -1) {
        // Find the h1 with id "main-content"
        const h1 = document.querySelector('h1#main-content');

        // Default values - declare outside the if block so they're accessible to sendResponse
        let jobTitle = '';
        let companyName = '';
        let companyLocation = '';
        let jobType = 'On site';

        if (h1) {
            // The first span inside h1 is jobTitle, the second is companyName
            const spans = h1.getElementsByTagName('span');
            if (spans && spans.length >= 1) {
                jobTitle = spans[0].innerText.trim();
            }
            if (spans && spans.length >= 2) {
                companyName = spans[1].innerText.trim();
            }

            // Find the section (closest section ancestor) and try to locate the UL that
            // is a direct sibling of the div that contains the h1. Many pages put the
            // job meta list as a sibling, so walking siblings is more reliable than
            // querying the first UL in a higher-level section.
            const section = h1.closest('section');

            // use top-level `normalize` helper for accent-insensitive matching

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
                    // Sometimes ULs are wrapped in a div sibling
                    const found = sib.querySelector && sib.querySelector('ul');
                    if (found) {
                        ul = found;
                        break;
                    }
                    sib = sib.nextElementSibling;
                }
            }

            // Fallback: if we didn't find a sibling UL, query the section (if any)
            if (!ul && section) {
                ul = section.querySelector('ul');
            }

            // As a last resort, search the document for any UL that contains 'teletravail'
            if (!ul) {
                const possible = Array.from(document.querySelectorAll('ul'));
                ul = possible.find(u => Array.from(u.querySelectorAll('li')).some(li => normalize(li.textContent).includes('teletravail')));
            }

            if (ul) {
                const lis = Array.from(ul.querySelectorAll('li'));
                if (lis.length >= 1 && !companyLocation) {
                    companyLocation = lis[0].textContent.trim();
                }

                // Look for any li mentioning teletravail (accent-insensitive)
                const teleworkingLi = lis.find(li => normalize(li.textContent).includes('teletravail'));
                if (teleworkingLi) {
                    const t = normalize(teleworkingLi.textContent);
                    if (t.includes('partiel') || t.includes('occasionnel') || t.includes('ponctuel') || t.includes('hybride') || t.includes('mixte')) {
                        jobType = 'Hybrid';
                    } else if (t.includes('complet') || t.includes('total') || t.includes('full')) {
                        jobType = 'Remote';
                    } else {
                        // If only 'teletravail' mentioned without modifier, assume Remote
                        jobType = 'Remote';
                    }
                }
            }
        }

        // Ensure we have non-empty values before sending response
        if (!jobTitle) jobTitle = 'Job Title Not Found';
        if (!companyName) companyName = 'Company Name Not Found';
        if (!companyLocation) companyLocation = 'Location Not Found';
        if (!jobType) jobType = 'On site';

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "welcometothejungle.com"
    else if (url.indexOf("welcometothejungle.com") > -1) {
        const companyName = getText('div[data-testid="job-metadata-block"] a span', document, 'Company Name Not Found');
        const jobTitle = getText('div[data-testid="job-metadata-block"] h2', document, 'Job Title Not Found');

        const companyLocation = getText('i[name="location"] + *', document, '');

        let jobType = '';

        // Using querySelector to find the i element with the name "remote" and read nearby span
        const remoteIcon = document.querySelector('i[name="remote"]');
        if (remoteIcon) {
            const parentDiv = remoteIcon.closest('div');
            const spanElement = parentDiv ? parentDiv.querySelector('span') : null;
            const spanContent = spanElement ? spanElement.textContent : '';
            if (spanContent.indexOf('total') > -1) {
                jobType = 'Remote';
            } else if ((spanContent.indexOf('partiel') > -1) || (spanContent.indexOf('ponctuel') > -1) || (spanContent.indexOf('occasionnel') > -1) || (spanContent.indexOf('régulier') > -1) || (spanContent.indexOf('fréquent') > -1)) {
                jobType = 'Hybrid';
            } else {
                jobType = 'On site';
            }
        }

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType });
    }

    // if current URL contains "apec.fr"
    else if (url.indexOf("apec.fr") > -1) {
        const jobTitle = getText('.nav-back__title h1', document, 'Job Title Not Found');
        const companyName = getText('ul.details-offer-list li', document, 'Company Name Not Found');
        const companyLocation = getText('ul.details-offer-list.mb-20 li:last-child', document, 'Location Not Found');

        const jobType = 'Hybrid';

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType });
    }

    // if current URL contains "djinni"
    else if (url.indexOf("djinni.co") > -1) {
        const jobTitle = getText('.detail--title-wrapper h1', document, 'Job Title Not Found');
        const companyName = getByClassList('job-details--title', 'Company Name Not Found');
        const companyLocation = getByClassList('location-text', 'Location Not Found');

        const jobType = 'Remote';

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType });
    }

    // if current URL contains "weworkremotely"
    else if (url.indexOf("weworkremotely.com") > -1) {
        const jobTitle = getText('.listing-header-container h1', document, 'Job Title Not Found');
        const companyName = getText('.company-card h2 a', document, 'Company Name Not Found');

        // Get the reference to the i tag with the class "fas fa-map-marker-alt"
        const icon = document.querySelector('i.fas.fa-map-marker-alt');

        // Check if the icon exists and retrieve the associated parent text
        let companyLocation = '';
        if (icon && icon.parentElement) {
            companyLocation = icon.parentElement.textContent.trim();
        }

        const jobType = 'Remote';

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType });
    }

    // if current URL contains "justjoin.it"
    else if (url.indexOf("justjoin.it") > -1) {
        const jobTitle = getByClassList('css-1id4k1', 'Job Title Not Found');
        const companyName = getByClassList('css-l4opor', 'Company Name Not Found');
        const companyLocation = getByClassList('css-9wmrp4', 'Location Not Found');

        let jobType = getByClassList('css-1t449q3', '');
        switch (jobType.toLowerCase()) {
            case "fully remote":
                jobType = "Remote";
                break;
            case "partially remote":
                jobType = "Hybrid";
                break;
            default:
                jobType = "On site";
                break;
        }

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType });
    }

    // if current URL contains "octopusit.fr"
    else if (url.indexOf("octopusit.fr") > -1) {
        const headerContainer = getText('.font-company-header', document, '');
        const arr = headerContainer.split(" | ");
        const jobTitle = arr[0] || 'Job Title Not Found';

        const companyName = 'Octopus IT';

        const h2Content = getText('h2', document, '');
        const locationStart = h2Content.indexOf("Lieu : ") + 7;
        const locationEnd = h2Content.indexOf("Tags") - 1;
        const companyLocation = (locationStart > 6 && locationEnd > locationStart) ? h2Content.substring(locationStart, locationEnd) : 'Location Not Found';

        const typeContainer = getText('.bg-company-primary-text', document, '');

        let jobType;
        if (typeContainer.includes("Complètement à distance")) {
            jobType = "Remote";
        } else if (typeContainer.includes("Télétravail hybride")) {
            jobType = "Hybride";
        } else {
            jobType = "On Site";
        }

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType });
    }

    else {
        sendResponse(null);
    }
    } catch (err) {
        // Ensure we always respond to the caller so the popup/background doesn't get `undefined`.
        console.error('content.js error while scraping page:', err);
        try {
            sendResponse({ name: 'Error', company: 'Error', location: 'Error', type: 'On site', _error: err && err.message ? err.message : String(err) });
        } catch (e) {
            // ignore
        }
    }

    return true;
});