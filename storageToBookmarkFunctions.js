// // create group bookmark only
// const createGroupBookmarkOnly = async (storageData,groupId) => {
//     const folderTreeNode = await bookmarkCreate({
//         index: 0,
//         title: storageData[groupId].groupName,
//         parentId: '1'
//     });
//
//     storageData[groupId].bookmarkId = folderTreeNode.id;
//
//     return { storageData, folderTreeNode };
// };
//
// // update group bookmark name
// const updateGroupBookmarkOnly = async (storageData,groupId) => {
//     const { groupName, bookmarkId } = storageData[groupId];
//
//     const groupChanges = {
//         title: groupName
//     };
//
//     await bookmarkUpdate(bookmarkId,groupChanges);
//     return bookmarkId;
// };
//
// // conditional func for create/update group bookmark only
// const syncGroupBookmarkOnly = async (storageData,groupId) => {
//     if (storageData[groupId].bookmarkId) {
//         return await updateGroupBookmarkOnly(storageData,groupId);
//     } else {
//         return await createGroupBookmarkOnly(storageData,groupId);
//     }
// };
//
// // delete group bookmark only
// const deleteGroupBookmarkOnly = async () => {
//
// };
//
// // delete group bookmark w/ urls
// const deleteGroupBookmark = async (storageData,groupId,bookmarkId) => {
//
// };
//
// // create a single url bookmark
// const createUrlBookmark = async (url,title,parentId) => {
//     // console.log(url);
//     // console.log(title);
//     // console.log(parentId);
//     return await bookmarkCreate({
//         parentId,
//         title,
//         url
//     });
// };
//
// // processes error && storage data while creating a single url bookmark
// const createUrlBookmarkProcess = async ({url,title,parentId,groupId,index,storageData,errorMsg}) => {
//     const urlTreeNodeOrErr = await createUrlBookmark(url,title,parentId);
//
//     if (urlTreeNodeOrErr === 'invalid url') {
//         errorMsg = urlTreeNodeOrErr;
//     } else {
//         storageData[groupId].data[index].bookmarkId = urlTreeNodeOrErr.id;
//     }
//     console.log(storageData);
//     return { errorMsg, storageData };
// };
//
// // update a single url bookmark
// const updateUrlBookmark = async (url,title,bookmarkId) => {
//     return await bookmarkUpdate(bookmarkId,{ url, title });
// };
//
//
// // create group as bookmark w/ urls
// const createGroupBookmark = async (storageData,groupId,urlDataLst) => {
//     const dataNTreeNode = await createGroupBookmarkOnly(storageData,groupId);
//
//     storageData = dataNTreeNode.storageData;
//     const { folderTreeNode } = dataNTreeNode;
//
//     let errorMsg = false;
//
//     await asyncForEach(urlDataLst, async ({ url, linkName },index) => {
//         const result = await createUrlBookmarkProcess({
//             url,
//             title: linkName,
//             parentId: folderTreeNode.id,
//             groupId,
//             index,
//             storageData,
//             errorMsg
//         });
//
//         errorMsg = result.errorMsg;
//         storageData = result.storageData;
//     });
//
//     await storageSet({[groupId]: storageData[groupId]});
//     return errorMsg;
// };
//
// // update group bookmark w/ urls
// const updateGroupBookmark = async (storageData,groupId,urlDataLst) => {
//     console.log(storageData);
//     console.log(groupId);
//     console.log(urlDataLst);
//     const bookmarkId = await updateGroupBookmarkOnly(storageData,groupId);
//
//     const bookmarkTreeNodes = await bookmarkGetSubTree(bookmarkId);
//
//     await asyncForEach(bookmarkTreeNodes[0].children,async bookmarkUrlNode => {
//         await bookmarkRemove(bookmarkUrlNode.id);
//     });
//
//     let errorMsg = false;
//
//     await asyncForEach(urlDataLst,async ({ linkName, url },index) => {
//         const result = await createUrlBookmarkProcess({
//             url,
//             title: linkName,
//             parentId: bookmarkId,
//             groupId,
//             index,
//             storageData,
//             errorMsg
//         });
//         console.log(result.storageData[groupId].data[index]);
//
//         errorMsg = result.errorMsg;
//         storageData = result.storageData;
//     });
//
//     await storageSet({[groupId]: storageData[groupId]});
//     return errorMsg;
// };
//
// // conditional func for creating/updating group bookmark w/ urls
// const syncGroupToBookmark = async (storageData,groupId,urlDataLst) => {
//     if (storageData[groupId].bookmarkId) {
//         return await updateGroupBookmark(storageData,groupId,urlDataLst);
//     } else {
//         return await createGroupBookmark(storageData,groupId,urlDataLst);
//     }
// };
//
// // create/update all groups w/ urls
// const syncGroupsToBookmark = async storageData => {
//     const groupIds = Object.keys(storageData);
//
//     let errorMsg = false;
//
//     await asyncForEach(groupIds,async groupId => {
//         const urlDataLst = storageData[groupId].data;
//         if (await syncGroupToBookmark(storageData,groupId,urlDataLst) === 'invalid url') {
//             errorMsg = 'invalid url';
//         }
//     });
//
//     return errorMsg;
// };


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
        console.log('here!!!');
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

const createUrlBookmarks = async (storageData,groupId,urlDataLst,parentId,success) => {
    console.log(urlDataLst);
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

const condGroupBookmarkNUrls = async (storageData,groupId,urlDataLst,groupName) => {
    const { bookmarkId } = storageData[groupId];
    let success = true;
    let obj;
    console.log(bookmarkId);
    if (bookmarkId) {
        let treeNodeOrErr = await bookmarkGet(bookmarkId);
        console.log(treeNodeOrErr);
        if (treeNodeOrErr) {
            console.log('here');
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
            // storageData = obj.storageData;
        } else {
            let treeNode = await createGroupBookmark(groupName);

            storageData[groupId].bookmarkId = treeNode.id;
            console.log(storageData[groupId]);

            const parentId = treeNode.id;

            obj = await createUrlBookmarks(storageData,groupId,urlDataLst,parentId,success);
            // storageData = obj.storageData;
        }

    }
    console.log(obj.storageData);
    return obj;
    // returns storageData
};

const condGroupBookmarksNUrls = async storageData => {
    const groupIds = Object.keys(storageData);
    let obj;
    await asyncForEach(groupIds,async groupId => {
        obj = await condGroupBookmarkNUrls(storageData,groupId,storageData[groupId].data,storageData[groupId].groupName);
    });

    return obj.storageData;
    // returns storageData
};


