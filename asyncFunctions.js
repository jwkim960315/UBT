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
        chrome.storage.sync.set(modifiedData,() => {
            return resolve('successfully updated storage');
        });
    });
};

// chrome storage get
const storageGet = async () => {
    return new Promise(resolve => {
        chrome.storage.sync.get(null,res => {
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
