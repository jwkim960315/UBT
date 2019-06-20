const filterWithKeyword = (keyword,data) => {
    const groupIdLst = Object.keys(data);
    let res = {};

    groupIdLst.forEach(groupId => {
        if (data[groupId].groupName.includes(keyword)) {
            res[groupId] = {
                groupName: data[groupId].groupName,
                data     : [],
                color: data[groupId].color
            };
        }

        const groupData = data[groupId].data;

        if (groupData.length) {
            groupData.forEach(urlData => {

                if (urlData.linkName.includes(keyword) || urlData.url.includes(keyword)) {
                    if (!res[groupId]) {
                        res[groupId] = {
                            groupName: data[groupId].groupName,
                            data     : [],
                            color: data[groupId].color
                        };
                    }

                    res[groupId].data.push(urlData);
                }
            });
        }
    });

    return res;
};