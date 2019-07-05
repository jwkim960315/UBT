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
            if (chrome.runtime.lastError) {
                return resolve(null);
            }

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

// chrome tabs update
const tabsUpdate = async (id,options) => {
    return new Promise(resolve => {
        chrome.tabs.update(id,options,() => {
            return resolve(null);
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

/* storageToBookmarkFunctions */
/*====================================================================================*/
const createGroupBookmark = async (storageData,groupId,urlDataLst) => {
    const folderTreeNode = await bookmarkCreate({
        index: 0,
        title: storageData[groupId].groupName,
        parentId: '1'
    });

    storageData[groupId].bookmarkId = folderTreeNode.id;

    if (!urlDataLst.length) {
        await storageSet({[groupId]: storageData[groupId]});
    }

    await asyncForEach(urlDataLst, async ({ url, linkName }) => {
        await bookmarkCreate({
            parentId: folderTreeNode.id,
            title: linkName,
            url
        });
    });
    await storageSet({[groupId]: storageData[groupId]});
};

const updateGroupBookmark = async (storageData,groupId,urlDataLst) => {
    const { groupName, bookmarkId } = storageData[groupId];

    const groupChanges = {
        title: groupName
    };

    await bookmarkUpdate(bookmarkId,groupChanges);
    const bookmarkTreeNodes = await bookmarkGetSubTree(bookmarkId);

    await asyncForEach(bookmarkTreeNodes[0].children,async bookmarkUrlNode => {
        await bookmarkRemove(bookmarkUrlNode.id);
    });

    await asyncForEach(urlDataLst,async ({ linkName, url }) => {
        await bookmarkCreate({
            parentId: bookmarkId,
            title: linkName,
            url
        });
    });

    await storageSet({[groupId]: storageData[groupId]});
};

const syncGroupToBookmark = async (storageData,groupId,urlDataLst) => {
    console.log(urlDataLst);
    if (storageData[groupId].bookmarkId) {
        await updateGroupBookmark(storageData,groupId,urlDataLst);
    } else {
        await createGroupBookmark(storageData,groupId,urlDataLst);
    }
};

const syncGroupsToBookmark = async storageData => {
    const groupIds = Object.keys(storageData);

    await asyncForEach(groupIds,async groupId => {
        const urlDataLst = storageData[groupId].data;
        await syncGroupToBookmark(storageData,groupId,urlDataLst);
    });
};

/*====================================================================================*/


// execute once loaded
chrome.windows.onCreated.addListener(window => {
    (async () => {
        const { id } = (await tabsCreate({ windowId: window.id }))[0];
        await tabsUpdate(id,{
            active: true,
            url: 'index.html'
        });
    })();
});



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

// saving all tabs route
chrome.contextMenus.create({
    title: 'save all tabs',
    contexts: ["browser_action"],
    onclick: () => {
        (async () => {
            let storageData = await storageGet();
            const groupIds = Object.keys(storageData);
            const tabs = await tabsQuery({currentWindow: true});
            const groupId = `group${idGenerator(groupIds)}`;
            let urlIds = urlIdsToLst(storageData);
            const curDateNTime = curDateNTimeToString();

            let tempGroupData = {
                groupName: 'Temporary Group',
                color    : 'rgb(0,0,0)',
                data     : [],
                createdAt: curDateNTime
            };

            tabs.forEach(({url, title, favIconUrl}) => {
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
            chrome.runtime.sendMessage({todo: 'reloadMainPage'});
        })();
    }
});

// sync with bookmarks route
chrome.contextMenus.create({
    title: 'sync with bookmarks',
    contexts: ["browser_action"],
    onclick: () => {
        (async () => {
            let storageData = await storageGet();
            const groupIds = Object.keys(storageData);

            await syncGroupsToBookmark(storageData);
        })();
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
        }
    }
});