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

        // jobTitle is the content of the h1
        jobTitle = getText('h1', mainEl || document, jobTitle) || jobTitle;

        // companyName is the content of the <a> with href starting with https://www.linkedin.com/company
        // (avoid anchors whose label is just the company logo aria-label)
        const trimText = (s) => (s || '').replace(/\s+/g, ' ').trim();
        const isBadCompanyLabel = (label) => {
            const t = normalize(label);
            if (!t) return true;
            return t === 'logo' || t.startsWith('logo ') || t.startsWith('logo de ') || t.includes('logo of ');
        };

        const companyAnchors = Array.from((mainEl || document).querySelectorAll('a[href^="https://www.linkedin.com/company"]'));
        if (companyAnchors.length) {
            const candidates = companyAnchors
                .map((a) => {
                    const aria = trimText(a.getAttribute('aria-label'));
                    const inner = trimText(a.innerText);
                    const text = trimText(a.textContent);
                    const title = trimText(a.getAttribute('title'));
                    const imgAlt = trimText(a.querySelector('img[alt]')?.getAttribute('alt'));

                    const sources = [
                        { kind: 'innerText', value: inner },
                        { kind: 'textContent', value: text },
                        { kind: 'title', value: title },
                        { kind: 'imgAlt', value: imgAlt },
                        { kind: 'ariaLabel', value: aria },
                    ];

                    const best = sources.find((x) => !isBadCompanyLabel(x.value)) || sources[0];
                    const label = trimText(best?.value);

                    const score =
                        (best?.kind === 'innerText' ? 30 : 0) +
                        (best?.kind === 'textContent' ? 20 : 0) +
                        (best?.kind === 'title' ? 10 : 0) +
                        (best?.kind === 'imgAlt' ? 5 : 0) +
                        (best?.kind === 'ariaLabel' ? 1 : 0) -
                        (isBadCompanyLabel(label) ? 1000 : 0) +
                        (label ? label.length : 0);

                    return { href: a.href, label, score };
                })
                .filter((c) => c.href);

            const bestByHref = new Map();
            for (const c of candidates) {
                const prev = bestByHref.get(c.href);
                if (!prev || c.score > prev.score) bestByHref.set(c.href, c);
            }

            const best = Array.from(bestByHref.values()).sort((a, b) => b.score - a.score)[0];
            if (best && best.label && !isBadCompanyLabel(best.label)) companyName = best.label;
        }

        // companyLocation extraction path:
        // div.job-details-jobs-unified-top-card__primary-description-container
        //   -> first div
        //     -> first span
        //       -> first span within that span
        const locationContainer = (mainEl || document).querySelector('div.job-details-jobs-unified-top-card__primary-description-container');
        if (locationContainer) {
            const firstDiv = locationContainer.querySelector('div');
            if (firstDiv) {
                const firstSpan = firstDiv.querySelector('span');
                if (firstSpan) {
                    const innerSpan = firstSpan.querySelector('span');
                    const locationText = ((innerSpan || firstSpan).textContent || '').trim();
                    if (locationText) companyLocation = locationText;
                }
            }
        }

        // jobType: check the text of each button in div.job-details-fit-level-preferences
        const fitPrefs = (mainEl || document).querySelector('div.job-details-fit-level-preferences');
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