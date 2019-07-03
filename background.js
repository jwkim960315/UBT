let storageBookmarkLst = [];
let storageData;
let groupIds;
let urlIds = [];

// generates id by sorting current url ids
const idGenerator = lst => {
    if (!lst.length) {
        return 0;
    }

    lst.sort((a, b) => a - b);

    for (let i=0;i < lst.length;i++) {
        if (!isLstGroupIds(lst) && lst[i] !== i) {
            return i;
        }
    }

    if (typeof lst[0] === 'string') {
        return parseInt(lst[lst.length-1].slice(5))+1;
    } else {
        return lst[lst.length-1]+1;
    }
};

// check whether the list is group or url
const isLstGroupIds = lst => typeof lst[0] === 'string';


// converts chrome storage data to a url list
const urlIdsToLst = data => {
    const dataKeys = Object.keys(data);

    if (!dataKeys.length) {
        return [];
    }

    return dataKeys
        .map(groupId => data[groupId].data.map(({ urlId }) => urlId))
        .reduce((accumulator,currentVal) => accumulator.concat(currentVal),[]);
};

// morph current data and time to string
const curDateNTimeToString = () => {
    const curDate = `${(new Date).toDateString()}`;
    const curHr = (`${(new Date).getHours()}`.length === 1) ? `0${(new Date).getHours()}` : (new Date).getHours();
    const curMin = (`${(new Date).getMinutes()}`.length === 1) ? `0${(new Date).getMinutes()}` : (new Date).getMinutes();
    const curSec = (`${(new Date).getSeconds()}`.length === 1) ? `0${(new Date).getSeconds()}` : (new Date).getSeconds();
    const curTime = `${curHr}:${curMin}:${curSec}`;
    return `${curDate} ${curTime}`;
};

// init background page
chrome.storage.sync.get(null, res => {
    // storageData = res;
    groupIds = Object.keys(res);

    groupIds.forEach(groupId => {
        storageBookmarkLst.push({
            groupId
        });
    });
});

// management page route
chrome.contextMenus.create({
    title: 'open management page',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.tabs.create({ url: 'index.html' });
    }
});

// saving all tabs route
chrome.contextMenus.create({
    title: 'save all tabs',
    contexts: ["browser_action"],
    onclick: clickedData => {

        chrome.tabs.query({ currentWindow: true }, tabs => {
            chrome.storage.sync.get(null,res => {
                const groupId = `group${idGenerator(Object.keys(res))}`;
                urlIds = urlIdsToLst(res);

                const curDateNTime = curDateNTimeToString();

                let tempGroupData = {
                    groupName: 'Temporary Group',
                    color: 'rgb(0,0,0)',
                    data: [],
                    createdAt: curDateNTime
                };

                tabs.forEach(tab => {

                    const { url, title, favIconUrl } = tab;
                    const urlId = idGenerator(urlIds);

                    tempGroupData.data.push({
                        urlId,
                        linkName: title,
                        iconLink: favIconUrl,
                        url
                    });

                    urlIds.push(urlId);
                });



                chrome.storage.sync.set({[groupId]: tempGroupData },() => {
                    console.log('saved all tabs!');

                    chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
                });
            })


        });
    }
});

// export to bookmarks route
chrome.contextMenus.create({
    title: 'export to bookmarks',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.storage.sync.get(null,res => {
            let storageData = res;
            const groupIds = Object.keys(storageData);

            groupIds.forEach((groupId,index) => {
                const groupBookmarkId = storageData[groupId].bookmarkId;
                console.log(groupBookmarkId);
                if (groupBookmarkId) {
                    console.log('groupBookmarkId exists!');
                    chrome.bookmarks.removeTree(groupBookmarkId);
                }

                chrome.bookmarks.create({
                    index,
                    parentId: '1',
                    title: storageData[groupId].groupName
                }, bookmarkTreeNode => {

                    // saving group bookmark id
                    console.log(bookmarkTreeNode.id);
                    storageData[groupId].bookmarkId = bookmarkTreeNode.id;

                    // storageBookmarkLst.push({
                    //     groupId,
                    //     bookmarkId: bookmarkTreeNode.id
                    // });

                    storageData[groupId].data.forEach(({ urlId, url, linkName },urlIndex) => {
                        chrome.bookmarks.create({
                            parentId: bookmarkTreeNode.id,
                            title: linkName,
                            url
                        }, urlTreeNode => {
                            console.log(urlTreeNode.id);
                            // saving url bookmark id
                            storageData[groupId].data[urlIndex].bookmarkId = urlTreeNode.id;
                            storageData[groupId].data[urlIndex].parentBookmarkId = urlTreeNode.parentId;

                            // storageBookmarkLst.push({
                            //     urlId,
                            //     bookmarkId: urlTreeNode.id
                            // });
                            // console.log(storageData[groupId]);
                            chrome.storage.sync.set({ [groupId]: storageData[groupId] },() => {
                                console.log('successfully saved bookmarkId');
                            });
                        });
                    });
                });


            });

            // const deletedGroupIds = storageBookmarkLst.filter(({ groupId }) => !Object.keys(storageData).includes(groupId));
            //
            // deletedGroupIds.forEach(groupId => {
            //     const groupBookmarkId = storageData[groupId].bookmarkId;
            //
            //     chrome.bookmarks.remove(groupBookmarkId);
            // });

            // storageBookmarkLst = storageBookmarkLst.filter(({ groupId }) => !deletedGroupIds.includes(groupId));

            chrome.runtime.sendMessage({
                todo: 'updateStorageData',
                storageData
            });
        });
    }
});


// create group bookmark
chrome.runtime.onMessage.addListener(({ todo, groupId, groupName, urlDataLst, urlLst },sender,sendResponse) => {
    switch(todo) {
        case 'createGroupBookmark':
            chrome.bookmarks.create({
                index: 0,
                title: groupName,
                parentId: '1'
            },folderTreeNode => {
                urlDataLst.forEach(({ url, linkName }) => {
                    chrome.bookmarks.create({
                        parentId: folderTreeNode.id,
                        title: linkName,
                        url
                    });
                });

            });
            sendResponse({ status: 'success' });
            return;
        case 'openSelectedUrls':
            chrome.windows.create({ url: urlLst });
            sendResponse({ status: 'success' });
            return;
        default:
            return;
    }
});

// create selected url tabs
