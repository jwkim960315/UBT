

// generates id by sorting current url ids
const idGenerator = lst => {

    if (!lst.length) {
        return 0;
    }

    lst.sort();

    let res;

    for (let i=0;i < lst.length;i++) {
        if (typeof lst[i] === 'string') {
            if (!lst[i].includes(i)) {
                return i;
            }
        } else {
            if (lst[i] !== i) {
                return i;
            }
        }
    }
    if (typeof lst[0] === 'string') {
        return parseInt(lst[lst.length-1].slice(-1))+1;
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

// render function
const renderLinks = (groupData,index,lst) => {

    const urlData = groupData[`group${index}`].data;

    if (!Object.keys(urlData).length) {
        return '';
    }

    const urlDataHTML = urlData
        .map((urlDatum,i) => {
            const { url, linkName, iconLink, urlId } = urlDatum;

            return `
                <div class="row url-buttons" id="url-data-${urlId}">
                    <div class="col s12 m10">
                        <a href="${url}" id="url-${urlId}" class="url white url-text btn" target="_blank">
                            <img class="link-icon" src="${iconLink}" width="25" height="25"/>
                            <p id="name-${urlId}">${linkName}</p>
                        </a>
                    </div>
                    <div class="col s12 m1">
                        <button id="url-edit-${urlId}" class="waves-effect waves-light btn url-edit" type="button"><i class="material-icons">edit</i></button>
                    </div>
                    <div class="col s12 m1">
                        <button id="url-delete-${urlId}" class="waves-effect waves-light btn red accent-2 url-delete" type="button"><i class="material-icons">delete</i></button>
                    </div>
                </div>
            `;
        });

    return urlDataHTML.join('');
};