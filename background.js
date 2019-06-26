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

chrome.contextMenus.create({
    title: 'Open in new tab',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.tabs.create({ url: 'options.html' });
    }
});

chrome.contextMenus.create({
    title: 'Save all tabs',
    contexts: ["browser_action"],
    onclick: clickedData => {
        chrome.tabs.query({ currentWindow: true }, tabs => {
            chrome.storage.sync.get(null,res => {
                const groupId = `group${idGenerator(Object.keys(res))}`;
                let urlIds = urlIdsToLst(res);

                const curDate = `${(new Date).toDateString()}`;
                const curTime = `${(new Date).getHours()}:${(new Date).getMinutes()}:${(new Date).getSeconds()}`;
                const curDateNTime = `${curDate} ${curTime}`;

                let tempGroupData = {
                    groupName: `Temporary Group - ${curDateNTime}`,
                    color: 'rgb(0,0,0)',
                    data: []
                };

                console.log(tabs);

                tabs.forEach(tab => {
                    // console.log(tab);
                    const { url, title, favIconUrl } = tab;
                    const urlId = idGenerator(urlIds);

                    if (!favIconUrl.length) {
                        const iconLink =
                    }

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
                });
            })


        });
    }
});