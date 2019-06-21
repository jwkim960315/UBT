// chrome.tabs.query({ active: true },tab => {
//     console.log(tab);
//     chrome.contextMenus.create({
//         title: 'Open in new tab',
//         contexts: ["browser_action"],
//         id: `${tab[0].id}`
//     });
//
//     chrome.contextMenus.onClicked.addListener((obj,tab) => {
//         chrome.tabs.create({ url: 'options.html' });
//     });
// });

chrome.contextMenus.create({
    title: 'Open in new tab',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.tabs.create({ url: 'options.html' });
    }
});