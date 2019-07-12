// chrome tabs create
const tabsCreate = async options => {
    return new Promise(resolve => {
        chrome.tabs.create(options, tab => {
            return resolve(tab);
        });
    });
};

/*====================================================================================*/

// management page route
chrome.contextMenus.create({
    title: 'open management page',
    contexts: ["browser_action"],
    onclick: () => {
        (async () => {
            await tabsCreate({ url: 'index.html' });
        })();
    }
});

