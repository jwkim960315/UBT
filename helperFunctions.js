// generates id by sorting current url ids
const idGenerator = lst => {
    if (!lst.length) {
        return 0;
    }

    lst.sort();

    let res;

    for (let i=0;i < lst.length;i++) {
        if (typeof lst[i] === 'string') {
            // if (!lst[i].includes(i)) {
            //     return i;
            // }
        } else {
            if (lst[i] !== i) {
                return i;
            }
        }
    }
    if (typeof lst[0] === 'string') {
        return parseInt(lst[lst.length-1].slice(5))+1;
    } else {
        return lst[lst.length-1]+1;
    }

};

const storageDataGroupIdModifier = storageData => {
    const groupIds = Object.keys(storageData);

    groupIds.forEach((groupId,index) => {
        if (parseInt(groupId.slice(5)) !== index) {
            storageData[`group${index}`] = storageData[groupId];
            delete storageData[groupId];
        }
    });

    return storageData;
};

const tempGroupReorder = (iterableObj,groupIds) => {
    const tempGroupIds = groupIds.filter(groupId => iterableObj[groupId].groupName.includes('Temporary Group'));
    const otherGroupIds = groupIds.filter(groupId => !iterableObj[groupId].groupName.includes('Temporary Group'));

    tempGroupIds.reverse();

    return tempGroupIds.concat(otherGroupIds);
};

// console.log(storageDataGroupIdModifier({
//     'group0': {
//         data: []
//     },
//     'group2': {
//         data: [1,2,3]
//     },
//     'group1': {
//         data: [4,5,6]
//     }
// }));

const isLstGroupIds = lst => typeof lst[0] === 'string';

const extractNumFromGroupIds = lst => {
    if (isLstGroupIds) {
        return lst.map(groupId => parseInt(groupId.slice(5)));
    }

    return lst;
};


// converts chrome storage data to a url list
const urlIdsToLst = data => {
    let lst = [];
    const dataKeys = Object.keys(data);

    if (!dataKeys.length) {
        return [];
    }

    let urlDataLst;


    for (let i=0; i < dataKeys.length; i++) {
        urlDataLst = data[dataKeys[i]].data;

        if (!urlDataLst.length) {
            continue;
        }

        urlDataLst.forEach(urlData => {

            lst.push(urlData.urlId);
        });
    }
    return lst;
};
