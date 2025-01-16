chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // if current URL contains "linkedin"
    if (window.location.href.indexOf("linkedin.com") > -1) {
        const jobTitle = document.getElementsByClassName('job-details-jobs-unified-top-card__job-title')[0].innerText;

        const companyName = document.getElementsByClassName('job-details-jobs-unified-top-card__company-name')[0].innerText;

        const companyContainer = document.getElementsByClassName('job-details-jobs-unified-top-card__primary-description-container')[0];
        const companyLocation = companyContainer.getElementsByTagName('span')[0].innerText;

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
    if (window.location.href.indexOf("indeed.com") > -1) {
        const jobTitle = document.getElementsByClassName('jobsearch-JobInfoHeader-title')[0].innerText

        const container = document.querySelector('[data-testid="jobsearch-CompanyInfoContainer"]').innerText;
        const containerSplitted = container.split('\n');
        const companyName = containerSplitted[0]

        let companyLocation;
        if (containerSplitted[2] && (containerSplitted[2].includes('out of 5') || containerSplitted[2].includes('sur 5'))) {
            companyLocation = containerSplitted[3];
        } else {
            companyLocation = containerSplitted[1];
        }

        var jobType = '';

        // search if "Télétravail" is present in containerSplitted
        for (var i = 0; i < containerSplitted.length; i++) {
            if (containerSplitted[i].indexOf('Télétravail') > -1) {
                if (containerSplitted[i].indexOf('hybride') > -1) {
                    jobType = "Hybride"
                } else {
                    jobType = "Remote"
                }
            } else {
                jobType = "On Site"
            }
        }

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "hellowork.com"
    if (window.location.href.indexOf("hellowork") > -1) {
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
    if (window.location.href.indexOf("welcometothejungle.com") > -1) {
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
    if (window.location.href.indexOf("apec.fr") > -1) {
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
    if (window.location.href.indexOf("djinni.co") > -1) {
        const nameWrapper = document.querySelector('.detail--title-wrapper');
        const jobTitle = nameWrapper.querySelector('h1').textContent;

        const companyName = document.getElementsByClassName('job-details--title')[0].innerText

        const companyLocation = document.getElementsByClassName('location-text')[0].innerText

        const jobType = 'Remote'

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "weworkremotely"
    if (window.location.href.indexOf("weworkremotely.com") > -1) {
        const nameWrapper = document.getElementsByClassName('listing-header-container');
        const jobTitle = nameWrapper[0].querySelector('h1').textContent;

        const companyCard = document.getElementsByClassName('company-card');

        const companyHeader = companyCard[0].querySelector('h2')
        const companyName = companyHeader.querySelector('a').textContent


        // Get the reference to the i tag with the class "fas fa-map-marker-alt"
        const icon = document.querySelector('i.fas.fa-map-marker-alt');

        // Check if the icon exists and retrieve the associated h3 text
        let companyLocation = '';
        if (icon) {
            const h3Tag = icon.parentElement; // Get the reference to the parent element of the icon
            companyLocation = h3Tag.textContent.trim();
        }

        const jobType = 'Remote'

        sendResponse({ name: jobTitle, company: companyName, location: companyLocation, type: jobType })
    }

    // if current URL contains "justjoin.it"
    if (window.location.href.indexOf("justjoin.it") > -1) {
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
    if (window.location.href.indexOf("octopusit.fr") > -1) {
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
});