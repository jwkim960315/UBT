let data;

// chrome.storage.sync.clear();

// Initialization
$(document).ready(() => {
    chrome.storage.sync.get(null,res => {

        data = res;

        urlFormIds = urlIdsToLst(data);


        // rendering all the storage data
        Object.keys(data).forEach((groupKey,index) => {
            $('.group-cont').append(`
                <div class="card">
                    <div class="card-content">
                        <div class="row">
                                <span id="group${index}" class="card-title">${data[groupKey].groupName}</span>
                        </div>
                        ${renderLinks(data,index,urlFormIds)}
                        <div class="row">
                            <a class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
                        </div>
                    </div>
                </div>
            `);
        });
    });
});

// Add new group
$('.add-group').click(() => {
    let groupNum = Object.keys(data).length;

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
                            <input id="group${groupNum}" type="text" class="validate">
                            <label for="group${groupNum}">Group Name</label>
                        </div>
                        <div class="col s6 l1">
                            <button class="waves-effect waves-light btn" type="submit"><i class="material-icons">save</i></button>
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

    chrome.storage.sync.set({[groupName]: groupData},() => {
        console.log('group name successfully saved!');
        location.reload();
    });
});

// Add new link form
$(document).on('click','.add-link',function() {

    const groupName = $(this).parents('.card-content').find('.card-title').prop('id');

    const urlNum = urlIdFinder(urlFormIds);
    // urlFormIds.push(urlNum);

    $(this).parent().prev().after(`
        <div class="row">
            <form class="add-url-form" id="new-url-form-${urlNum}">
                <div class="row">
                    <div class="input-field col s4 l4">
                        <input id="urlName${urlNum}" type="text" class="validate url-name-input">
                        <label for="urlName${urlNum}">Name</label>
                    </div>
                    <div class="input-field col s8 l6">
                      <input id="url${urlNum}" type="text" class="validate url-input">
                      <label for="url${urlNum}">Url</label>
                    </div>
                    <div class="col s6 l1 center">
                        <button class="waves-effect waves-light btn" type="submit"><i class="material-icons">save</i></i></button>
                    </div>
                    <div class="col s6 l1 center">
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

    console.log(typeof urlNum);
    console.log(typeof parseInt(urlNum));

    urlFormIds.push(urlNum);




    $(this).parents('.url-buttons').replaceWith(`
        <div class="row">
            <form class="add-url-form" id="new-url-form-${urlNum}">
                <div class="row">
                    <div class="input-field col s4 l4">
                        <input id="urlName${urlNum}" type="text" class="validate url-name-input" value="${name}">
                        <label for="urlName${urlNum}" class="active">Name</label>
                    </div>
                    <div class="input-field col s8 l6">
                      <input id="url${urlNum}" type="text" class="validate url-input" value="${url}">
                      <label for="url${urlNum}" class="active">Url</label>
                    </div>
                    <div class="col s6 l1 center">
                        <button class="waves-effect waves-light btn" type="submit"><i class="material-icons">save</i></i></button>
                    </div>
                    <div class="col s6 l1 center">
                        <button class="waves-effect waves-light btn red accent-2 url-delete" type="button"><i class="material-icons">delete</i></button>
                    </div>
                </div>
            </form>
        </div>
    `);



});

// Chrome storage data structure
/*

const data = {
    'group${index}': {
        groupName: '',
        data: [
            {
                id: 0,
                linkName: '',
                url: '',
                iconLink: ''
            }
        ]
    }
}

*/