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
const storageSet = async modifiedData => {
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

// chrome storage remove
const storageRemove = async groupId => {
    return new Promise(resolve => {
        chrome.storage.local.remove(groupId,() => {
            return resolve(null);
        });
    });
};

// chrome storage clear
const storageClear = async () => {
    return new Promise(resolve => {
        chrome.storage.local.clear(() => {
            return resolve('cleared!');
        });
    });
};

// chrome sync storage get
const syncStorageGet = async () => {
    return new Promise(resolve => {
        chrome.storage.sync.get(null,res => {
            return resolve(res);
        });
    });
};

// chrome sync storage set
const syncStorageSet = async modifiedData => {
    return new Promise(resolve => {
        chrome.storage.sync.set(modifiedData,() => {
            return resolve('successfully updated storage');
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

// chrome open new window && create list of tabs
const windowOpenNTabsCreate = async urls => {
    return new Promise(resolve => {
        chrome.windows.create({ url: urls },() => {
            return resolve(null);
        });
    });
};

/*----------------------------------------------------------------------------------------------*/
