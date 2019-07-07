// create group bookmark
const createGroupBookmark = async groupName => {
    return await bookmarkCreate({
        index: 0,
        parentId: "1",
        title: groupName
    });
    // returns treeNodeOrErr
};

// update group bookmark
const updateGroupBookmark = async (bookmarkId,groupChanges) => {
    return await bookmarkUpdate(bookmarkId,groupChanges);
    // returns treeNodeOrErr
};

// conditionally create/update group bookmark
const condGroupBookmark = async (bookmarkId,groupChanges,groupName) => {
    const treeNodeOrErr = await bookmarkGet(bookmarkId);

    if (treeNodeOrErr) {
        return await updateGroupBookmark(bookmarkId, groupChanges);
    }

    return await createGroupBookmark(groupName);
    // returns treeNodeOrErr
};

// assign group bookmark id
const assignGroupBookmarkId = (storageData,groupId,bookmarkId) => {
    storageData[groupId].bookmarkId = bookmarkId;
    return storageData;
    // returns storageData
};

// helper for retrieving url bookmark id
const getUrlData = (urlDataLst,urlId) => {
    return urlDataLst.filter(urlData => urlData.urlId === urlId)[0];
    // returns urlData
};

// create url bookmark
const createUrlBookmark = async (urlDataLst,urlId,parentId) => {
    const { linkName, url } = getUrlData(urlDataLst,urlId);

    return await bookmarkCreate({
        parentId,
        title: linkName,
        url
    });
    // returns treeNodeOrErr
};

// update url bookmark
const updateUrlBookmark = async (urlDataLst,urlId,urlChanges) => {
    const { bookmarkId } = getUrlData(urlDataLst,urlId);

    return await bookmarkUpdate(bookmarkId,urlChanges);
    // returns treeNodeOrErr
};

// conditionally create/update url bookmark
const condUrlBookmark = async (storageData,groupId,urlDataLst,urlId,urlChanges) => {
    const { bookmarkId } = getUrlData(urlDataLst,urlId);
    const treeNodeOrErr = await bookmarkGet(bookmarkId);
    const parentId = storageData[groupId].bookmarkId;

    if (treeNodeOrErr && treeNodeOrErr.parentId === parentId) {
        return await updateUrlBookmark(urlDataLst,urlId,urlChanges);
    }

    return await createUrlBookmark(urlDataLst,urlId,parentId);
    // returns treeNodeOrErr
};

const assignUrlBookmarkId = async (storageData,groupId,urlId,bookmarkId) => {
    const { index } = storageData[groupId].data.map((urlData,index) => {
        if (urlData.urlId === urlId) {
            return { urlData, index };
        }
    })[0];

    storageData[groupId].data[index].bookmarkId = bookmarkId;
    return storageData;
    // returns storageData
};

// create multiple url bookmarks
const createUrlBookmarks = async (storageData,groupId,urlDataLst,parentId,success) => {

    await asyncForEach(urlDataLst,async ({ urlId },index) => {
        treeNodeOrErr = await createUrlBookmark(urlDataLst,urlId,parentId);
        if (treeNodeOrErr) {
            storageData[groupId].data[index].bookmarkId = treeNodeOrErr.id;
        } else {
            success = false;
        }

    });
    return { storageData, success };
    // returns storageData
};

// conditionally create/update group bookmark w/ urls
const condGroupBookmarkNUrls = async (storageData,groupId,urlDataLst,groupName) => {
    const { bookmarkId } = storageData[groupId];
    let success = true;
    let obj;

    if (bookmarkId) {
        let treeNodeOrErr = await bookmarkGet(bookmarkId);

        if (treeNodeOrErr) {
            let treeNode = await updateGroupBookmark(treeNodeOrErr[0].id,{ title: groupName });

            // group bookmarkId updated
            storageData[groupId].bookmarkId = treeNode.id;

            const parentId = treeNode.id;

            let subTreeNodes = await bookmarkGetSubTree(treeNode.id);


            // remove all urls in the updated group bookmark
            await asyncForEach(subTreeNodes[0].children,async subTreeNode => {
                await bookmarkRemove(subTreeNode.id);
            });

            // create urls in the update group bookmark
            obj = await createUrlBookmarks(storageData,groupId,urlDataLst,parentId,success);
        } else {
            let treeNode = await createGroupBookmark(groupName);

            storageData[groupId].bookmarkId = treeNode.id;

            const parentId = treeNode.id;

            obj = await createUrlBookmarks(storageData,groupId,urlDataLst,parentId,success);
        }

    }

    return obj;
    // returns storageData
};

// create multiple group bookmarks w/ urls
const condGroupBookmarksNUrls = async storageData => {
    const groupIds = Object.keys(storageData);
    let obj;
    await asyncForEach(groupIds,async groupId => {
        obj = await condGroupBookmarkNUrls(storageData,groupId,storageData[groupId].data,storageData[groupId].groupName);
    });

    return obj.storageData;
    // returns storageData
};

// update/do nothing with group bookmark
const updateOrRemainGroupBookmarksNUrls = async (storageData,groupId,urlDataLst,groupName) => {
    const { bookmarkId } = storageData[groupId];
    let success = true;
    let obj;

    if (bookmarkId) {
        let treeNodeOrErr = await bookmarkGet(bookmarkId);

        if (treeNodeOrErr) {
            let treeNode = await updateGroupBookmark(treeNodeOrErr[0].id,{ title: groupName });

            // group bookmarkId updated
            storageData[groupId].bookmarkId = treeNode.id;

            const parentId = treeNode.id;

            let subTreeNodes = await bookmarkGetSubTree(treeNode.id);


            // remove all urls in the updated group bookmark
            await asyncForEach(subTreeNodes[0].children,async subTreeNode => {
                await bookmarkRemove(subTreeNode.id);
            });

            // create urls in the update group bookmark
            obj = await createUrlBookmarks(storageData,groupId,urlDataLst,parentId,success);
        } else {
            obj = false;
        }
    }

    return obj;
    // returns storageData
};