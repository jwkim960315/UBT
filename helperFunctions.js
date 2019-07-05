// generates id by sorting current ids
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

    if (isLstGroupIds(lst)) {
        return parseInt(lst[lst.length-1].slice(5))+1;
    } else {
        return lst[lst.length-1]+1;
    }
};

// re-assign group ids
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

// re-order groups so that temp groups are on top
const tempGroupReorder = (iterableObj,groupIds) => {
    const tempGroupIds = groupIds.filter(groupId => iterableObj[groupId].groupName.includes('Temporary Group'));
    const otherGroupIds = groupIds.filter(groupId => !iterableObj[groupId].groupName.includes('Temporary Group'));

    tempGroupIds.reverse();

    return tempGroupIds.concat(otherGroupIds);
};

// check whether the list is group or url
const isLstGroupIds = lst => typeof lst[0] === 'string';

// converts chrome storage data to a url list
const urlIdsToLst = storageData => {
    const dataKeys = Object.keys(storageData);

    if (!dataKeys.length) {
        return [];
    }

    return dataKeys
        .map(groupId => storageData[groupId].data.map(({ urlId }) => urlId))
        .reduce((accumulator,currentVal) => accumulator.concat(currentVal),[]);
};

const curDateNTimeToString = () => {
    const curDate = `${(new Date).toDateString()}`;
    const curHr = (`${(new Date).getHours()}`.length === 1) ? `0${(new Date).getHours()}` : (new Date).getHours();
    const curMin = (`${(new Date).getMinutes()}`.length === 1) ? `0${(new Date).getMinutes()}` : (new Date).getMinutes();
    const curSec = (`${(new Date).getSeconds()}`.length === 1) ? `0${(new Date).getSeconds()}` : (new Date).getSeconds();
    const curTime = `${curHr}:${curMin}:${curSec}`;

    return `${curDate} ${curTime}`;
};

// validate url
// const isUrlValid = url => {
//     const pattern = new RegExp(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/); // fragment locater
//
//     return pattern.test(url);
// };

// filter on-creating group
const filterOnCreatingGroupOrUrl = storageData => {
    const groupIds = Object.keys(storageData);

    groupIds.forEach(groupId => {
        if (!Object.keys(storageData[groupId]).length) {
            delete storageData[groupId];
        } else {
            storageData[groupId].data = filterOnCreatingUrl(storageData[groupId].data);
        }
    });

    return storageData;
};

const filterOnCreatingUrl = urlDataLst => {
    return urlDataLst.filter(urlData => urlData.isPermanent);
};