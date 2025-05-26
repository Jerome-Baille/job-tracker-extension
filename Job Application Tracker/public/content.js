chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const url = window.location.href;

    // if current URL contains "linkedin"
    if (url.indexOf("linkedin.com") > -1) {
        const jobTitle = document.getElementsByClassName('job-details-jobs-unified-top-card__job-title')[0].innerText;

        const companyName = document.getElementsByClassName('job-details-jobs-unified-top-card__company-name')[0].innerText;

        const companyContainer = document.getElementsByClassName('job-details-jobs-unified-top-card__primary-description-container')[0];
        // Modified: Get the first span in a span in a div in companyContainer
        let companyLocation = '';
        const innerDiv = companyContainer.querySelector('div');
        if (innerDiv) {
            const innerSpan = innerDiv.querySelector('span');
            if (innerSpan) {
                const firstSpan = innerSpan.querySelector('span');
                if (firstSpan) {
                    companyLocation = firstSpan.innerText;
                }
            }
        }

        // Extract jobType
        let jobType = document.querySelector('.job-details-jobs-unified-top-card__job-insight').innerText;

        if (!jobType || jobType.toLowerCase().includes('à distance')) {
            jobType = 'Remote';
        } else if (jobType.toLowerCase().includes('hybride')) {
            jobType = 'Hybrid';
        } else {
            jobType = 'On site';
        }

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
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
        // Find the element with the attribute "data-cy='jobTitle'"
        const jobTitleElement = document.querySelector("[data-cy='jobTitle']");
        const jobTitle = jobTitleElement ? jobTitleElement.innerText : "";

        // Find the div it's inside
        const parentDiv = jobTitleElement ? jobTitleElement.closest('div') : null;

        // Initialize an empty array to store the text from each child element
        const childTexts = [];

        // If parentDiv is not null, get the text from each child element
        if (parentDiv) {
            const spanElements = parentDiv.getElementsByTagName('span');

            // Get text from span elements
            for (let i = 0; i < spanElements.length; i++) {
                childTexts.push(spanElements[i].innerText);
            }
        }

        const companyName = childTexts[1];
        const companyLocation = childTexts[2];
        const jobType = "On site";

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "welcometothejungle.com"
    else if (url.indexOf("welcometothejungle.com") > -1) {
        const div = document.querySelector('div[data-testid="job-metadata-block"]');
        const companyName = div.querySelector('a span').textContent;

        const jobTitle = div.querySelector('h2').textContent;


        const iElement = document.querySelector('i[name="location"]');
        const companyLocationFull = iElement.nextElementSibling;
        const companyLocation = companyLocationFull.textContent;

        var jobType = '';

        // Using querySelector to find the i element with the name "remote"
        const remoteIcon = document.querySelector('i[name="remote"]');

        if (remoteIcon) {
            const parentDiv = remoteIcon.closest('div');

            if (parentDiv) {
                const spanElement = parentDiv.querySelector('span');

                if (spanElement) {
                    const spanContent = spanElement.textContent;

                    if (spanContent.indexOf('total') > -1) {
                        jobType = 'Remote'
                    } else if ((spanContent.indexOf('partiel') > -1) || (spanContent.indexOf('ponctuel') > -1) || (spanContent.indexOf('occasionnel') > -1) || (spanContent.indexOf('régulier') > -1) || (spanContent.indexOf('fréquent') > -1)) {
                        jobType = 'Hybrid'
                    } else {
                        jobType = 'On site'
                    }
                }
            }
        }

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "apec.fr"
    else if (url.indexOf("apec.fr") > -1) {
        const nameWrapper = document.getElementsByClassName('nav-back__title');
        const jobTitle = nameWrapper[0].querySelector('h1').textContent;

        let companyName;

        // Using querySelector to find the ul with the class "details-offer-list"
        const ulElement = document.querySelector('ul.details-offer-list');

        if (ulElement) {
            const firstLiElement = ulElement.querySelector('li');

            if (firstLiElement) {
                companyName = firstLiElement.textContent;
            }
        }

        // Find the ul tag with class "details-offer-list mb-20"
        const locationUl = document.querySelector('ul.details-offer-list.mb-20');

        // Find the last li tag inside the ul
        const locationLi = locationUl.querySelectorAll('li');
        const lastLiElement = locationLi[locationLi.length - 1];

        // Get the content of the last li tag
        const companyLocation = lastLiElement.textContent;

        const jobType = 'Hybrid'

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "djinni"
    else if (url.indexOf("djinni.co") > -1) {
        const nameWrapper = document.querySelector('.detail--title-wrapper');
        const jobTitle = nameWrapper.querySelector('h1').textContent;

        const companyName = document.getElementsByClassName('job-details--title')[0].innerText

        const companyLocation = document.getElementsByClassName('location-text')[0].innerText

        const jobType = 'Remote'

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "weworkremotely"
    else if (url.indexOf("weworkremotely.com") > -1) {
        const nameWrapper = document.getElementsByClassName('listing-header-container');
        const jobTitle = nameWrapper[0].querySelector('h1').textContent;

        const companyCard = document.getElementsByClassName('company-card');

        const companyHeader = companyCard[0].querySelector('h2')
        const companyName = companyHeader.querySelector('a').textContent


        // Get the reference to the i tag with the class "fas fa-map-marker-alt"
        const icon = document.querySelector('i.fas.fa-map-marker-alt');

        // Check else if the icon exists and retrieve the associated h3 text
        let companyLocation = '';
        if (icon) {
            const h3Tag = icon.parentElement; // Get the reference to the parent element of the icon
            companyLocation = h3Tag.textContent.trim();
        }

        const jobType = 'Remote'

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "justjoin.it"
    else if (url.indexOf("justjoin.it") > -1) {
        const jobTitle = document.getElementsByClassName('css-1id4k1')[0].innerText;

        const companyName = document.getElementsByClassName('css-l4opor')[0].innerText;

        const companyLocation = document.getElementsByClassName('css-9wmrp4')[0].textContent;

        let jobType = document.getElementsByClassName('css-1t449q3')[0].innerText;

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

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "octopusit.fr"
    else if (url.indexOf("octopusit.fr") > -1) {
        const headerContainer = document.getElementsByClassName('font-company-header')[0].innerText;
        const arr = headerContainer.split(" | ");
        const jobTitle = arr[0];

        const companyName = 'Octopus IT';


        const h2Content = document.querySelector('h2').textContent;
        const locationStart = h2Content.indexOf("Lieu : ") + 7;
        const locationEnd = h2Content.indexOf("Tags") - 1;
        const companyLocation = h2Content.substring(locationStart, locationEnd);

        const typeContainer = document.getElementsByClassName('bg-company-primary-text')[0].innerText;

        let jobType;
        if (typeContainer.includes("Complètement à distance")) {
            jobType = "Remote";
        } else if (typeContainer.includes("Télétravail hybride")) {
            jobType = "Hybride";
        } else {
            jobType = "On Site";
        }

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    else {
        sendResponse(null);
    }

    return true;
});