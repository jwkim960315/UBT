const createUrlBookmark = async (url,title,parentId) => {
    return await bookmarkCreate({
        parentId,
        title,
        url
    });
};

const createUrlBookmarkProcess = async ({url,title,parentId,groupId,index,storageData,errorMsg}) => {
    const urlTreeNodeOrErr = await createUrlBookmark(url,title,parentId);

    if (urlTreeNodeOrErr === 'invalid url') {
        errorMsg = urlTreeNodeOrErr;
    } else {
        storageData[groupId].data[index].bookmarkId = urlTreeNodeOrErr.id;
    }
    console.log(storageData[groupId].data[index].bookmarkId);
    return { errorMsg, storageData };
};

const updateUrlBookmark = async (url,title,bookmarkId) => {
    return await bookmarkUpdate(bookmarkId,{ url, title });
};

// const updateUrlBookmarkProcess = async ({ url,title,bookmarkId,groupId})

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

    let errorMsg = false;

    await asyncForEach(urlDataLst, async ({ url, linkName },index) => {
        const result = await createUrlBookmarkProcess({
            url,
            title: linkName,
            parentId: folderTreeNode.id,
            groupId,
            index,
            storageData,
            errorMsg
        });

        errorMsg = result.errorMsg;
        storageData = result.storageData;
    });

    await storageSet({[groupId]: storageData[groupId]});
    return errorMsg;
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

    let errorMsg = false;

    await asyncForEach(urlDataLst,async ({ linkName, url },index) => {
        const result = await createUrlBookmarkProcess({
            url,
            title: linkName,
            parentId: bookmarkId,
            groupId,
            index,
            storageData,
            errorMsg
        });

        errorMsg = result.errorMsg;
        storageData = result.storageData;
    });

    await storageSet({[groupId]: storageData[groupId]});
    return errorMsg;
};

const syncGroupToBookmark = async (storageData,groupId,urlDataLst) => {
    if (storageData[groupId].bookmarkId) {
        return await updateGroupBookmark(storageData,groupId,urlDataLst);
    } else {
        return await createGroupBookmark(storageData,groupId,urlDataLst);
    }
};

const syncGroupsToBookmark = async storageData => {
    const groupIds = Object.keys(storageData);

    let errorMsg = false;

    await asyncForEach(groupIds,async groupId => {
        const urlDataLst = storageData[groupId].data;
        if (await syncGroupToBookmark(storageData,groupId,urlDataLst) === 'invalid url') {
            errorMsg = 'invalid url';
        }
    });

    return errorMsg;
};