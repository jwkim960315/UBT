let storageBookmarkLst = [];

// generates id by sorting current url ids
const idGenerator = lst => {
    if (!lst.length) {
        return 0;
    }

    if (typeof lst[0] === 'string') {
        lst.sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)));
    } else {
        lst.sort((a, b) => a - b);
    }

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
chrome.storage.local.get(null, res => {
    // storageData = res;
    const groupIds = Object.keys(res);

    groupIds.forEach(groupId => {
        storageBookmarkLst.push({
            groupId
        });
    });
});

// async forEach
asyncForEach = async (arr,callback) => {
    for (let i=0; i < arr.length; i++) {
        await callback(arr[i],i,arr);
    };
};

/* promisified Chrome API functions */
/*---------------------------------------------------------------------------------------------*/

// chrome bookmark remove
const bookmarkRemove = async bookmarkId => {
    return new Promise(resolve => {
        chrome.bookmarks.remove(bookmarkId,removedTreeNode => {
            return resolve(removedTreeNode);
        });
    });
};

// chrome bookmarks remove
const bookmarksRemove = async bookmarkId => {
    return new Promise(resolve => {
        chrome.bookmarks.removeTree(bookmarkId,() => {
            return resolve('successfully removed folder w/ urls');
        });
    });
};

// chrome bookmarks create
const bookmarkCreate = async options => {
    return new Promise(resolve => {
        chrome.bookmarks.create(options,bookmarkTreeNode => {
            return resolve(bookmarkTreeNode);
        });
    });
};

// chrome bookmarks update
const bookmarkUpdate = async (bookmarkId,changes) => {
    return new Promise(resolve => {
        chrome.bookmarks.update(bookmarkId,changes,bookmarkTreeNode => {
            return resolve(bookmarkTreeNode);
        });
    });
};

// chrome bookmarks get subtree
const bookmarkGetSubTree = async bookmarkId => {
    return new Promise(resolve => {
        chrome.bookmarks.getSubTree(bookmarkId,bookmarkNodeTrees => {
            return resolve(bookmarkNodeTrees);
        });
    });
};

// chrome storage set
const storageSet = async (modifiedData) => {
    return new Promise(resolve => {
        chrome.storage.local.set(modifiedData,() => {
            return resolve('successfully updated storage');
        });
    });
};

// chrome storage get
const storageGet = async () => {
    return new Promise(resolve => {
        chrome.storage.local.get(null,res => {
            return resolve(res);
        });
    });
};

// chrome tabs create
const tabsCreate = async options => {
    return new Promise(resolve => {
        chrome.tabs.create(options, tab => {
            return resolve(tab);
        });
    });
};

// chrome tabs query
const tabsQuery = async options => {
    return new Promise(resolve => {
        chrome.tabs.query(options, tabs => {
            return resolve(tabs);
        });
    });
};

// chrome get all trees
const treesGet = async () => {
    return new Promise(resolve => {
        chrome.bookmarks.getTree(bookmarkTreeNodes => {
            return resolve(bookmarkTreeNodes);
        });
    });
};

/*----------------------------------------------------------------------------------------------*/

// execute once loaded
chrome.windows.onCreated.addListener(window => {
    chrome.tabs.query({ windowId: window.id }, tabs => {
        chrome.tabs.update(tabs[0].id,{
            active: true, url: 'index.html'
        });
    });
});



// management page route
chrome.contextMenus.create({
    title: 'open management page',
    contexts: ["browser_action"],
    onclick: async () => {
        await tabsCreate({ url: 'index.html' });
    }
});

// saving all tabs route
chrome.contextMenus.create({
    title: 'save all tabs',
    contexts: ["browser_action"],
    onclick: async () => {
        const tabs = await tabsQuery({ currentWindow: true });
        let storageData = await storageGet();
        const groupId = `group${idGenerator(Object.keys(storageData))}`;
        let urlIds = urlIdsToLst(storageData);
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

        await storageSet({[groupId]: tempGroupData});
        chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
    }
});

// sync with bookmarks route
chrome.contextMenus.create({
    title: 'sync with bookmarks',
    contexts: ["browser_action"],
    onclick: async () => {
        let storageData = await storageGet();
        const groupIds = Object.keys(storageData);
        const treeNodes = await treesGet();
        await asyncForEach(groupIds,async (groupId,index) => {
            const groupBookmarkId = storageData[groupId].bookmarkId;

            if (groupBookmarkId && treeNodes[0].children[0].children.some(({ id }) => groupBookmarkId === id)) {
                await bookmarksRemove(groupBookmarkId);
            }

            const bookmarkTreeNode = await bookmarkCreate({
                index,
                parentId: "1",
                title: storageData[groupId].groupName
            });

            // saving group bookmark id
            storageData[groupId].bookmarkId = bookmarkTreeNode.id;

            if (!storageData[groupId].data.length) {
                await storageSet({ [groupId]: storageData[groupId] });
            } else {
                await asyncForEach(storageData[groupId].data,async ({ urlId, url, linkName },urlIndex) => {
                    const urlTreeNode = await bookmarkCreate({
                        parentId: bookmarkTreeNode.id,
                        title: linkName,
                        url
                    });

                    // saving url bookmark id
                    storageData[groupId].data[urlIndex].bookmarkId = urlTreeNode.id;
                    storageData[groupId].data[urlIndex].parentBookmarkId = urlTreeNode.parentId;

                });

                await storageSet({ [groupId]: storageData[groupId] });
            }
        });
        console.log(storageData);
        chrome.runtime.sendMessage({
            todo: 'updateStorageData',
            storageData
        });
    }
});


// create group bookmark
chrome.runtime.onMessage.addListener( async ({ todo, groupId, groupName, urlDataLst, urlLst, bookmarkId, groupIndex },sender,sendResponse) => {
    switch(todo) {
        case 'createGroupBookmark':
            let storageData = await storageGet();

            if (bookmarkId !== undefined) {
                const groupChanges = {
                    title: groupName
                };

                await bookmarkUpdate(bookmarkId,groupChanges);
                const bookmarkTreeNodes = await bookmarkGetSubTree(bookmarkId);

                await asyncForEach(bookmarkTreeNodes[0].children,async bookmarkUrlNode => {
                    await bookmarkRemove(bookmarkUrlNode.id);
                });

                await asyncForEach(storageData[groupId].data,async ({ linkName, url },index) => {
                    const urlTreeNode = await bookmarkCreate({
                        parentId: bookmarkId,
                        title: linkName,
                        url
                    });

                    storageData[groupId].data[index].bookmarkId = urlTreeNode.id;

                    await storageSet({[groupId]: storageData[groupId]});
                });
            } else {
                const folderTreeNode = await bookmarkCreate({
                    index: 0,
                    title: groupName,
                    parentId: '1'
                });

                storageData[groupId].bookmarkId = folderTreeNode.id;

                if (!urlDataLst.length) {
                    await storageSet({[groupId]: storageData[groupId]});
                }

                await asyncForEach(urlDataLst,async ({ url, linkName },index) => {
                    const urlTreeNode = bookmarkCreate({
                        parentId: folderTreeNode.id,
                        title: linkName,
                        url
                    });

                    storageData[groupId].data[index].bookmarkId = urlTreeNode.id;

                    await storageSet({[groupId]: storageData[groupId]});

                    chrome.storage.local.set({[groupId]: storageData[groupId]},() => {
                        chrome.runtime.sendMessage({
                            todo: 'updateStorageData',
                            storageData
                        });
                    });
                });
            }

            chrome.runtime.sendMessage({
                todo: 'updateStorageData',
                storageData
            });


            return;
        case 'openSelectedUrls':
            chrome.windows.create({ url: urlLst });
            return;
        default:
            return;
    }
});

chrome.bookmarks.onRemoved.addListener(async (id,removeInfo) => {
    console.log('bookmark has been removed');
    console.log(removeInfo);

    let storageData = await storageGet();

    const groupIds = Object.keys(storageData);

    if (removeInfo.parentId === '1') {
        const folderGroupId = groupIds.filter(groupId => storageData[groupId].bookmarkId === id)[0];

        if (folderGroupId && storageData[folderGroupId].bookmarkId) {
            delete storageData[folderGroupId].bookmarkId;

            await storageSet({[folderGroupId]: storageData[folderGroupId]});
            chrome.runtime.sendMessage({
                todo: 'updateStorageData',
                storageData
            });
        }


    } else if (removeInfo.node.children === undefined) {

        const folderGroupId = groupIds.filter(groupId => {
            return storageData[groupId].data.some(({ bookmarkId }) => bookmarkId === id);
        })[0];

        if (folderGroupId) {
            let index;

            storageData[folderGroupId].data.forEach(({ bookmarkId },i) => {
                if (bookmarkId === id) {
                    index = i;
                }
            });

            if (index && storageData[folderGroupId].data[index].bookmarkId) {
                delete storageData[folderGroupId].data[index].bookmarkId;
            }



            await storageSet({[folderGroupId]: storageData[folderGroupId]});
            chrome.runtime.sendMessage({
                todo: 'updateStorageData',
                storageData
            });
        }


    }

});