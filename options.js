let data;

// chrome.storage.sync.clear();

const renderLinks = (groupData,index) => {

    const urlData = groupData[`group${index}`].data;

    if (!Object.keys(urlData).length) {
        return '';
    }

    const urlDataHTML = urlData
        .map((urlDatum,i) => {
            const { url, linkName, iconLink } = urlDatum;

            return `
                <div class="row">
                    <a href="https://${url}" class="url" target="_blank">
                        <img class="link-icon" src="${iconLink}" width="25" height="25"/>
                        ${linkName}
                    </a>
                </div>
            `;
        });

    return urlDataHTML.join('');
};

// Initialization
$(document).ready(() => {
    chrome.storage.sync.get(null,res => {

        data = res;

        // rendering all the storage data
        Object.keys(data).forEach((groupKey,index) => {
            $('.group-cont').append(`
                <div class="card">
                    <div class="card-content">
                        <div class="row">
                                <span id="group${index}" class="card-title">${data[groupKey].groupName}</span>
                        </div>
                        ${renderLinks(data,index)}
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
                        <span id="group${groupNum}" class="card-title">${groupName}</span>
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

// Add new link form
$(document).on('click','.add-link',function() {

    let lst = [];

    $(this).parent().prev().after(`
        <div class="row">
            <form class="add-url-form">
                <div class="row">
                    <div class="input-field col s4 l4">
                        <input id="urlName${lst.length}" type="text" class="validate url-name-input">
                        <label for="urlName${lst.length}">Name</label>
                    </div>
                    <div class="input-field col s8 l6">
                      <input id="url${lst.length}" type="text" class="validate url-input">
                      <label for="url${lst.length}">Url</label>
                    </div>
                    <div class="col s6 l1 center">
                        <button class="waves-effect waves-light btn" type="submit">Save</button>
                    </div>
                    <div class="col s6 l1 center">
                        <button class="waves-effect waves-light btn red accent-2 url-delete" type="button">Delete</button>
                    </div>
                </div>
            </form>
        </div>
    `);

    lst.push('');
});

// Submit Url
$(document).on('submit','.add-url-form',function(e) {
    e.preventDefault();

    const url = $(this).find('.url-input').val();
    const linkName = $(this).find('.url-name-input').val();

    axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://besticon-demo.herokuapp.com/allicons.json?url=${url}`)
        .then(res => {

            const iconLink = res.data.icons[0].url;
            const groupName = $(this).parents('.card-content').find('.card-title').prop('id');

            data[groupName].data.push({ url, iconLink, linkName });
            const groupData = data[groupName];
            chrome.storage.sync.set({
                [groupName]: groupData
            },() => {
                console.log('stored successfully!');
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



// Chrome storage data structure
/*

const data = {
    'group${index}': {
        groupName: '',
        data: [
            {
                linkName: '',
                url: '',
                iconLink: ''
            }
        ]
    }
}

*/