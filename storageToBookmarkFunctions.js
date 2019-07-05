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
        const urlTreeNode = await bookmarkCreate({
            parentId: folderTreeNode.id,
            title: linkName,
            url
        });

        // storageData[groupId].data[index].bookmarkId = urlTreeNode.id;
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
        const urlTreeNode = await bookmarkCreate({
            parentId: bookmarkId,
            title: linkName,
            url
        });

        // storageData[groupId].data[index].bookmarkId = urlTreeNode.id;
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