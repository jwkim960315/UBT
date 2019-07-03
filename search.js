const filterWithKeyword = (keyword,data) => {
    const groupIdLst = Object.keys(data);
    let res = {};

    groupIdLst.forEach(groupId => {
        if (data[groupId].groupName.toLowerCase().includes(keyword.toLowerCase())) {
            res[groupId] = data[groupId];
        }

        const groupData = data[groupId].data;

        if (groupData.length) {
            groupData.forEach(urlData => {

                if (urlData.linkName.toLowerCase().includes(keyword.toLowerCase())) {
                    if (!res[groupId]) {
                        res[groupId] = {
                            groupName: data[groupId].groupName,
                            data     : [],
                            color: data[groupId].color,
                            createdAt: data[groupId].createdAt,
                            bookmarkId: data[groupId].bookmarkId
                        };

                        res[groupId].data.push(urlData);
                    }
                }
            });
        }
    });

    return res;
};