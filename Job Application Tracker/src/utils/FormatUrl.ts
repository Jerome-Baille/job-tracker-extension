export const formatUrl = (tabUrl: string): string => {
    let newUrl = '';
    if (tabUrl && tabUrl.includes('indeed')) {
        newUrl = tabUrl.split('&')[0];
    } else {
        newUrl = tabUrl && tabUrl.includes('?') ? tabUrl.substring(0, tabUrl.indexOf('?')) : tabUrl || '';
    }
    return newUrl;
};