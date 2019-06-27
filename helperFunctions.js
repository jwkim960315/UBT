// generates id by sorting current ids
const idGenerator = lst => {
    if (!lst.length) {
        return 0;
    }

    lst.sort();

    let res;

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
        console.log(urlDataLst);
        urlDataLst.forEach(urlData => {

            lst.push(urlData.urlId);
        });
    }
    return lst;
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
const isUrlValid = url => {
    const pattern = new RegExp(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/); // fragment locater

    return pattern.test(url);
};