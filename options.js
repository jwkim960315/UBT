let data;

// chrome.storage.sync.clear();

// Initialization
$(document).ready(() => {
    chrome.storage.sync.get(null,res => {

        data = res;

        urlFormIds = urlIdsToLst(data);

        groupIds = Object.keys(data);

        // rendering all the storage data
        Object.keys(data).forEach((groupKey,index) => {
            $('.group-cont').append(`
                <div class="card" id="${groupKey}">
                    <div class="card-content">
                        <div class="row">
                            <div class="col s12 m11">
                                <span id="${groupKey}" class="card-title">${data[groupKey].groupName}</span>
                            </div>
                            <div class="col s12 m1">
                                <button class='dropdown-trigger btn' data-target='group-settings${groupKey.slice(-1)}'><i class="material-icons">settings</i></button>
                                <ul id='group-settings${groupKey.slice(-1)}' class='dropdown-content'>
                                    <li><a class="change-color">change color</a></li>
                                    <li class="divider" tabindex="-1"></li>
                                    <li><a class="edit-group-name">edit group name</a></li>
                                    <li class="divider" tabindex="-1"></li>
                                    <li><a class="delete-group red-text">delete group</a></li>
                                </ul>
                            </div>
                        </div>
                        ${renderLinks(data,parseInt(groupKey.slice(-1)),urlFormIds)}
                        <div class="row new-url-data">
                            <div class="col">
                                <a class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });

        // initialize group settings dropdown
        $('.dropdown-trigger').dropdown();
    });
});

// Add new group
$('.add-group').click(() => {

    let groupNum = idGenerator(groupIds);

    const groupName = `Group${groupNum}`;

    const newGroupData = {
        groupName,
        data: []
    };

    $('.group-cont').append(`
        <div class="card">
            <div class="card-content">
                <div class="row">
                    <form class="add-group-form">
                        <div class="input-field col s10 l8">
                            <label for="group${groupNum}">Group Name</label>
                            <input id="group${groupNum}" type="text" class="validate">
                        </div>
                        <div class="col s1 l1">
                            <button class="waves-effect waves-light btn right" type="submit"><i class="material-icons">save</i></button>
                        </div>
                    </form>
                </div>
                <div class="row">
                    <a class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
                </div>
            </div>
        </div>
    `);

    chrome.storage.sync.set({
        [`group${groupNum}`]: newGroupData
    });

    data[`group${groupNum}`] = newGroupData;
});

// onSubmit add-group-form
$(document).on('submit','.add-group-form',function(e) {
    e.preventDefault();

    const inputElem = $(this).find('input');
    const inputVal = inputElem.val();
    const groupName = inputElem.prop('id');

    data[groupName].groupName = inputVal;

    const groupData = data[groupName];

    if (inputVal !== '') {
        chrome.storage.sync.set({[groupName]: groupData},() => {
            console.log('group name successfully saved!');
            location.reload();
        });
    }
});

// delete group
$(document).on('click','.delete-group',function(e) {

    const groupName = $(this).parents('.card').prop('id');

    delete data[groupName];

    chrome.storage.sync.remove(groupName,() => {
        console.log('successfully deleted group!');
    });

    $(this).parents('.card').remove();
});

// edit group name
$(document).on('click','.edit-group-name',function(e) {

    const groupName = $(this).parents('.card').prop('id');

    $(this).parents('.card-content > div.row').replaceWith(`
        <div class="row">
            <form class="add-group-form">
                <div class="input-field col s10 l8">
                    <label for="${groupName}">Group Name</label>
                    <input id="${groupName}" type="text" class="validate">
                </div>
                <div class="col s1 l1">
                    <button class="waves-effect waves-light btn right" type="submit"><i class="material-icons">save</i></button>
                </div>
            </form>
        </div>
    `);
});

// Add new link form
$(document).on('click','.add-link',function() {

    const groupName = $(this).parents('.card-content').find('.card-title').prop('id');

    const urlNum = idGenerator(urlFormIds);
    // urlFormIds.push(urlNum);

    $(this).parents('.new-url-data').prev().after(`
        <div class="row">
            <form class="add-url-form" id="new-url-form-${urlNum}">
                <div class="row">
                    <div class="input-field col s4 l4">
                        <label for="urlName${urlNum}">Name</label>
                        <input id="urlName${urlNum}" type="text" class="validate url-name-input">
                    </div>
                    <div class="input-field col s8 l6">
                      <label for="url${urlNum}">Url</label>
                      <input id="url${urlNum}" type="text" class="validate url-input">
                    </div>
                    <div class="col s12 l1">
                        <button class="waves-effect waves-light btn" type="submit"><i class="material-icons">save</i></i></button>
                    </div>
                    <div class="col s12 l1">
                        <button class="waves-effect waves-light btn red accent-2 url-delete" type="button"><i class="material-icons">delete</i></button>
                    </div>
                </div>
            </form>
        </div>
    `);


});

// onSubmit add-url-form
$(document).on('submit','.add-url-form',function(e) {
    e.preventDefault();

    const url = $(this).find('.url-input').val();
    const linkName = $(this).find('.url-name-input').val();
    const urlId = parseInt($(this).prop('id').slice(-1));

    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://besticon-demo.herokuapp.com/allicons.json?url=${url}`)
        .then(res => {

            const iconLink = res.data.icons[0].url;
            const groupName = $(this).parents('.card-content').find('.card-title').prop('id');

            if (urlFormIds.includes(urlId)) {
                data[groupName].data.forEach((urlData,index) => {
                    if (urlData.urlId === urlId) {
                        data[groupName].data[index] = { urlId, url, iconLink, linkName };
                    }
                });
            } else {
                data[groupName].data.push({ urlId, url, iconLink, linkName });
            }

            const groupData = data[groupName];
            chrome.storage.sync.set({
                [groupName]: groupData
            },() => {
                console.log('stored successfully!');
                location.reload();
            });


        },err => {
            if (err.response.status === 404) {
                console.log('invalid url');
            }
        });

});

// Delete url input
$(document).on('click','.url-delete',function(e) {
    e.preventDefault();
    $(this).parents('form[class="add-url-form"]').remove();
});

// Edit url
$(document).on('click','.url-edit',function(e) {
    const name = $(this).parents('.url-buttons').find('a').text().trim();

    const url = $(this).parents('.url-buttons').find('a').prop('href').slice(8);

    const urlNum = $(this).parents('.url-buttons').prop('id').slice(-1);

    urlFormIds.push(urlNum);




    $(this).parents('.url-buttons').replaceWith(`
        <div class="row">
            <form class="add-url-form" id="new-url-form-${urlNum}">
                <div class="row">
                    <div class="input-field col s4 l4">
                        <label for="urlName${urlNum}" class="active">Name</label>
                        <input id="urlName${urlNum}" type="text" class="validate url-name-input" value="${name}">
                    </div>
                    <div class="input-field col s8 l6">
                      <label for="url${urlNum}" class="active">Url</label>
                      <input id="url${urlNum}" type="text" class="validate url-input" value="${url}">
                    </div>
                    <div class="col s12 l1">
                        <button class="waves-effect waves-light btn" type="submit"><i class="material-icons">save</i></i></button>
                    </div>
                    <div class="col s12 l1">
                        <button class="waves-effect waves-light btn red accent-2 url-delete" type="button"><i class="material-icons">delete</i></button>
                    </div>
                </div>
            </form>
        </div>
    `);
});

// delete url data
$(document).on('click','.url-delete',function(e) {
    e.preventDefault();

    const groupName = $(this).parents('.card-content').find('.card-title').prop('id');
    const urlId = parseInt($(this).parents('.url-buttons').prop('id').slice(-1));

    data[groupName].data.forEach((urlData,index) => {
        if (urlData.urlId === urlId) {
            data[groupName].data.splice(index,1);
        }
    });
    const groupData = data[groupName];

    chrome.storage.sync.set({[groupName]: groupData});

    $(this).parents('.url-buttons').remove();
});


// delete group data


// Chrome storage data structure
/*

const data = {
    'group${index}': {
        groupName: '',
        data: [
            {
                urlId: 0,
                linkName: '',
                url: '',
                iconLink: ''
            }
        ]
    }
}

*/