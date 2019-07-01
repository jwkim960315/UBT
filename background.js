let storageBookmarkObj = {};

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

// morph current data and time to string
const curDateNTimeToString = () => {
    const curDate = `${(new Date).toDateString()}`;
    const curHr = (`${(new Date).getHours()}`.length === 1) ? `0${(new Date).getHours()}` : (new Date).getHours();
    const curMin = (`${(new Date).getMinutes()}`.length === 1) ? `0${(new Date).getMinutes()}` : (new Date).getMinutes();
    const curSec = (`${(new Date).getSeconds()}`.length === 1) ? `0${(new Date).getSeconds()}` : (new Date).getSeconds();
    const curTime = `${curHr}:${curMin}:${curSec}`;
    return `${curDate} ${curTime}`;
};


// management page route
chrome.contextMenus.create({
    title: 'open management page',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.tabs.create({ url: 'index.html' });
    }
});

// saving all tabs route
chrome.contextMenus.create({
    title: 'save all tabs',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.tabs.query({ currentWindow: true }, tabs => {
            chrome.storage.sync.get(null,res => {
                const groupId = `group${idGenerator(Object.keys(res))}`;
                let urlIds = urlIdsToLst(res);

                const curDateNTime = curDateNTimeToString();

                let tempGroupData = {
                    groupName: 'Temporary Group',
                    color: 'rgb(0,0,0)',
                    data: [],
                    createdAt: curDateNTime
                };

                tabs.forEach(tab => {
                    // console.log(tab);
                    const { url, title, favIconUrl } = tab;
                    const urlId = idGenerator(urlIds);

                    tempGroupData.data.push({
                        urlId,
                        linkName: title,
                        iconLink: favIconUrl,
                        url
                    });

                    urlIds.push(urlId);
                });

                chrome.storage.sync.set({[groupId]: tempGroupData },() => {
                    console.log('saved all tabs!');

                    chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
                });
            })


        });
    }
});

// export to bookmarks route
chrome.contextMenus.create({
    title: 'export to bookmarks',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.storage.sync.get(null,storageData => {
            const groupIds = Object.keys(storageData);
            groupIds.forEach((groupId,index) => {
                chrome.bookmarks.create({
                    index,
                    parentId: '1',
                    title: storageData[groupId].groupName
                }, bookmarkTreeNode => {
                    // save bookmark folder id to global var
                    storageBookmarkObj[bookmarkTreeNode.id] = { groupId };

                    storageData[groupId].data.forEach(urlData => {
                        chrome.bookmarks.create({
                            parentId: bookmarkTreeNode.id,
                            title: urlData.linkName,
                            url: urlData.url
                        });
                    });
                });
            });
        });
    }
});

// detect any changes on bookmark groups
chrome.bookmarks.onChanged.addListener((id,changeInfo) => {
    console.log(id);
    console.log(changeInfo);


});


chrome.contextMenus.onClicked.addListener((info,tab) => {
    console.log(info);
    console.log(tab);
});