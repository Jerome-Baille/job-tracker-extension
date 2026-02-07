import { formatUrl } from './FormatUrl';
import { formatDate } from './FormatDate';

const queryTabs = (): Promise<{tabs: chrome.tabs.Tab[], url: string}> => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                const url = tabs[0]?.url ? formatUrl(tabs[0].url) : '';
                resolve({tabs, url});
            }
        });
    });
};

const executeScript = (tabId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Inject all parser files in order, then content.js dispatcher
        chrome.scripting.executeScript(
            {
                target: { tabId },
                files: [
                    'parsers/utils.js',
                    'parsers/linkedin.js',
                    'parsers/indeed.js',
                    'parsers/hellowork.js',
                    'parsers/welcometothejungle.js',
                    'parsers/apec.js',
                    'parsers/djinni.js',
                    'parsers/weworkremotely.js',
                    'parsers/justjoin.js',
                    'parsers/octopus.js',
                    'parsers/francetravail.js',
                    'content.js'
                ],
            },
            () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            }
        );
    });
};

const sendMessage = (tabId: number): Promise<{name: string, company: string, location: string, type: string} | undefined> => {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, {}, (response) => {
            if (response && typeof response.name === 'string' && typeof response.company === 'string' && typeof response.location === 'string' && typeof response.type === 'string') {
                resolve(response);
            } else {
                reject(new Error('Required properties not found in response'));
            }
        });
    });
};

export const fetchData = async (): Promise<{name: string, company: string, location: string, type: string, link: string, applicationDate: string, applicationYear: number}> => {
    try {
        const {tabs, url} = await queryTabs();
        if (tabs.length === 0 || tabs[0].id === undefined) {
            throw new Error('No active tab found or tab id is undefined');
        }

        const tabId = tabs[0].id;
        await executeScript(tabId);
        const data = await sendMessage(tabId);
        const { applicationDate, applicationYear } = formatDate();
        if (data && data.name && data.company && data.location && data.type) {
            return {...data, link: url, applicationDate, applicationYear};
        } else {
            throw new Error('Required properties not found in response');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};