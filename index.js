// Global Vars
let storageData;
let urlIds;
let groupIds;

// chrome.storage.local.clear();

chrome.runtime.onMessage.addListener(req => {
    switch(req.todo) {
        // reload page once all tabs are saved
        case 'reloadMainPage':
            location.reload();
            return;
        case 'updateStorageData':
            storageData = req.storageData;
            groupIds = Object.keys(storageData);
            urlIds = urlIdsToLst(storageData);
            initDND(storageData);
            return;
        default:
            return;
    }
});

// initialization
$(document).ready(async () => {
    console.log('here');
    let storageData = storageDataGroupIdModifier(await storageGet());
    await storageClear();
    await storageSet(storageData);
    let urlIds = urlIdsToLst(storageData);
    renderGroups(storageData,'.groups-placeholder',urlIds);

    chrome.storage.local.get(null,res => {
        // setting storageData to global var
        storageData = storageDataGroupIdModifier(res); // Re-assign group ids
        chrome.storage.local.clear(() => {
            chrome.storage.local.set(storageData,() => {
                urlIds = urlIdsToLst(storageData);
                groupIds = tempGroupReorder(storageData,Object.keys(storageData));
                // rendering all the storage data
                renderGroups(storageData,'.groups-placeholder',urlIds);
            });
        });
    });
});

// search input change
$('#search').on('input', function() {
    const keyword = $(this).val();

    if (!keyword) {
        $('.group-cont').html('<div class="groups-placeholder"></div>');

        // rendering all the storage data
        renderGroups(storageData,'.groups-placeholder',urlIds);
    } else {
        const filteredData = filterWithKeyword(keyword,storageData);

        if (!Object.keys(filteredData).length) {
            $('.group-cont').html(`
                <div class="row no-data">
                    <p>No data matching with "${keyword}"</p>
                </div>
            `);
        } else {
            $('.group-cont').html('<div class="groups-placeholder"></div>');

            // rendering filtered storageData
            renderGroups(filteredData,'.groups-placeholder',urlIds);

            $(".url-text").mark(keyword);
            $('.card-title').mark(keyword);
        }
    }
});

// sync to account's sync storage
$('.sync-to-account').click(async () => {
    let localStorageData = await storageGet();
    await syncStorageSet(localStorageData);
    M.toast({html: 'Successfully synchronized with the account!'});
});

// add new group
$('.add-group').click(() => {

    let groupId = `group${idGenerator(groupIds)}`;

    const target = '.group-cont';

    // update groupIds
    groupIds.push(groupId);

    renderNewGroupForm(target,groupId);
});

// new group name on change
$(document).on('input', '.group-name-input',function() {
    const newGroupName = $(this).val();
    const groupId = $(this).attr('id');
    const formValues = [{
        name: 'group name',
        type: 'text',
        value: newGroupName,
        target: `input[id="${groupId}"]`
    }];

    const buttonTar = `#submit-new-${groupId}`;

    const validatedValues = validator(formValues,storageData,'none','none');

    renderValidationError(validatedValues,buttonTar);
});

// onSubmit add-group-form
$(document).on('submit','.add-group-form',function(e) {
    e.preventDefault();

    const groupId = $(this).attr('id').slice(15);
    const inputElem = $(`input[id="${groupId}"]`);
    const inputVal = inputElem.val();

    const formValues = [{
        name: 'group name',
        type: 'text',
        value: inputVal
    }];

    console.log(formValues);

    const validatedValues = validator(formValues,storageData,'none','none');
    console.log(validatedValues);
    // check if submitted form passes all validations
    if (validatedValues.submit) {

        if (!storageData[groupId]) {
            storageData[groupId] = {
                groupName: inputVal,
                data: [],
                color: 'rgb(0,0,0)',
                createdAt: curDateNTimeToString()
            };
            console.log(storageData);
        } else {
            storageData[groupId].groupName = inputVal;
            console.log(storageData);
        }

        $(`#add-link-placeholder-${groupId}`).replaceWith(`
            <div class="row">
                <a class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
            </div>
        `);

        chrome.storage.local.set({[groupId]: storageData[groupId]},() => {
            console.log('group name successfully saved!');
            console.log(storageData);
            // render group w/ submitted group name
            renderGroups(storageData,`#card-${groupId}`,urlIds,groupId);
        });
    }
});

// group name onDblclick
$(document).on('dblclick','.card-title',function() {
    const groupId = $(this).attr('id');
    const name = storageData[groupId].groupName;
    $(`#card-header-${groupId}`).replaceWith(
        renderGroupForm(name,groupId,false)
    );
});

// open all links
$(document).on('click','.open-all',function() {
    const groupId = $(this).attr('id').slice(9);
    const urlIdLst = storageData[groupId].data.map(({ url }) => url);

    chrome.windows.create({ url: urlIdLst });
});

// delete group
$(document).on('click','.delete-group',function() {

    const deletingGroupId = $(this).prop('id').slice(7);

    delete storageData[deletingGroupId];

    groupIds = groupIds.filter(groupId => groupId !== deletingGroupId);

    chrome.storage.local.remove(deletingGroupId,() => {
        console.log('successfully deleted group!');
    });

    $(`#card-${deletingGroupId}`).remove();
    $(`#colorpicker-cont-${deletingGroupId}`).remove();
});

// edit group name
$(document).on('click','.edit-group-name',function() {

    const groupId = $(this).attr('id').slice(5);

    const name = storageData[groupId].groupName;

    $(`#card-header-${groupId}`).replaceWith(
        renderGroupForm(name,groupId,false)
    );
});

// change group color w/ wheel
$(document).on('click','.change-color',function() {
    const groupId = $(this).attr('id').slice(13);
    const target = `#colorpicker-placeholder-${groupId}`;

    const hexColor = tinycolor(storageData[groupId].color).toHexString();

    renderColorPicker(target,groupId,hexColor);

    // initialize && control color picker
    $.farbtastic(`#colorpicker-${groupId}`).setColor(hexColor);
    $.farbtastic(`#colorpicker-${groupId}`).linkTo(color => {
        storageData[groupId].color = color;
        const obj = {
            [groupId]: storageData[groupId]
        };

        $(`#color-${groupId}`).val(color);

        applyColor(obj,groupId);
    });

    $(`#card-${groupId}`).addClass('col s12 m9');
});

// change group color w/ input
$(document).on('input','.colorpicker-input',function() {
    const hexColor = $(this).val();
    const groupId = $(this).attr('id').slice(6);

    $.farbtastic(`#colorpicker-${groupId}`).setColor(hexColor);
});

// save color from color picker
$(document).on('click','.save-color',function() {
    const groupId = $(this).attr('id').slice(11);
    let color = tinycolor($.farbtastic(`#colorpicker-${groupId}`).color).toRgbString();

    if (!color) {
        color = 'rgb(0,0,0)';
    }

    storageData[groupId].color = color;

    chrome.storage.local.set({[groupId]: storageData[groupId]}, () => {
        console.log('color has been saved successfully!');

        $(`#close-colorpicker-${groupId}`).trigger('click');
    });
});

// close color picker
$(document).on('click','.close-colorpicker',function() {
    const groupId = $(this).prop('id').slice(18);

    $(`#colorpicker-cont-${groupId}`).replaceWith(`
        <div id="colorpicker-placeholder-${groupId}" class="colorpicker-placeholder"></div>
    `);

    // apply previous color
    chrome.storage.local.get([groupId], groupData => {
        applyColor(groupData, groupId);
        storageData[groupId].color = groupData[groupId].color;
    });

    $(`#card-${groupId}`).removeClass('col s12 m9');
});

// export group onClick
$(document).on('click','.export-group',function() {
    const groupId = $(this).attr('id').slice(7);
    const target = `#card-${groupId}`;

    renderCheckboxGroupForm(target,groupId,storageData,'export');
});

// checked urls form submit
$(document).on('submit','.export-group-form',function(e) {
    e.preventDefault();

    const groupId = $(this).attr('id').slice(18);

    let formValues = $(this).serializeArray();


    formValues = formValues.map(({ name }) => {
        const curUrlId = parseInt(name.slice(9));

        return storageData[groupId].data.filter(({ urlId }) => urlId === curUrlId)[0];
    });

    chrome.runtime.sendMessage({
        todo: 'createGroupBookmark',
        groupId,
        groupName: storageData[groupId].groupName,
        urlDataLst: formValues,
        bookmarkId: storageData[groupId].bookmarkId
    });

    const target = `#card-${groupId}`;
    M.toast({html: 'Successfully synchronized with bookmarks!'});
    renderGroups(storageData,target,0,groupId);
});

// cancel export group
$(document).on('click','.export-cancel',function() {
    const groupId = $(this).attr('id').slice(14);
    const target = `#card-${groupId}`;

    renderGroups(storageData,target,0,groupId);
});

// open links onClick
$(document).on('click','.open-all-links',function() {
    const groupId = $(this).attr('id').slice(15);
    const target = `#card-${groupId}`;

    renderCheckboxGroupForm(target,groupId,storageData,'open');
});

// checked urls open on tabs
$(document).on('submit','.open-group-form',function(e) {
    e.preventDefault();

    const groupId = $(this).attr('id').slice(16);

    let formValues = $(this).serializeArray();

    formValues = formValues.map(({ name }) => {
        const curUrlId = parseInt(name.slice(9));

        return storageData[groupId].data.filter(({ urlId }) => urlId === curUrlId)[0];
    }).map(urlData => urlData.url);

    chrome.runtime.sendMessage({
        todo: 'openSelectedUrls',
        groupId,
        urlLst: formValues
    }/*,response => {
        if (response.status === 'success') {
            const target = `#card-${groupId}`;

            renderGroups(storageData,target,0,groupId);
        }
    }*/);

    const target = `#card-${groupId}`;

    renderGroups(storageData,target,0,groupId);
});

// cancel open links
$(document).on('click','.open-cancel',function() {
    const groupId = $(this).attr('id').slice(12);

    console.log(groupId);

    const target = `#card-${groupId}`;

    renderGroups(storageData,target,0,groupId);
});

// export entire group to bookmark
$(document).on('click','.export-whole',function() {
    const groupId = $(this).attr('id').slice(13);

    chrome.runtime.sendMessage({
        todo: 'createGroupBookmark',
        groupId,
        groupName: storageData[groupId].groupName,
        urlDataLst: storageData[groupId].data,
        bookmarkId: storageData[groupId].bookmarkId
    });

    M.toast({html: 'Successfully synchronized with bookmarks!'});
});

// Url onClick
$(document).on('click','.url-text',function(e) {
    e.preventDefault();
    const url = $(this).attr('href');
    chrome.tabs.create({ url, active: false },() => {
        console.log('tab has been created');
    });
});


// Add new url form
$(document).on('click','.add-link',function() {

    const groupId = $(this).prop('id').slice(9);

    const urlId = idGenerator(urlIds);

    // update urlIds
    urlIds.push(urlId);

    $(`#new-url-data-${groupId}`).prev().append(
        renderNewUrlForm('','',urlId,false,false,true,true)
    );

    $(`input[id="urlName${urlId}"]`).focus();
});

// url name input validation
// propertychange change keyup paste input focusout blur click
$(document).on('input','.url-name-input',function() {
    const urlName = $(this).val();
    const urlId = parseInt($(this).attr('id').slice(7));
    const url = $(`#url${urlId}`).val();

    const formValues = [{
        name: 'url name',
        target: `input[id="urlName${urlId}"]`,
        type: 'text',
        value: urlName
    }, {
        name: 'url',
        target: `input[id="url${urlId}"]`,
        type: 'url',
        value: url
    }];

    const groupId = $(this).parents('.card').attr('id').slice(5);
    const buttonTar = `#submit-new-url-${urlId}`;

    let validatedValues = validator(formValues,storageData,groupId,urlId);

    renderValidationError(validatedValues,buttonTar);
});

// url input validation
$(document).on('input','.url-input',function() {
    const url = $(this).val();
    const urlId = parseInt($(this).attr('id').slice(3));
    const urlName = $(`#urlName${urlId}`).val();


    const formValues = [{
        name: 'url name',
        target: `input[id="urlName${urlId}"]`,
        type: 'text',
        value: urlName
    }, {
        name: 'url',
        target: `input[id="url${urlId}"]`,
        type: 'url',
        value: url
    }];

    const groupId = $(this).parents('.card').attr('id').slice(5);
    const buttonTar = `#submit-new-url-${urlId}`;

    const validatedValues = validator(formValues,storageData,groupId,urlId);

    renderValidationError(validatedValues,buttonTar);
});

// onSubmit add-url-form
$(document).on('submit','.add-url-form',function(e) {
    e.preventDefault();

    const urlId = parseInt($(this).attr('id').slice(13));
    let url = $(`#url${urlId}`).val();

    if (url.slice(-1) !== '/' && url.length) {
        url += '/';
    }

    const linkName = $(`#urlName${urlId}`).val();

    const groupId = $(this).parents('.card').attr('id').slice(5);
    const { groupName } = storageData[groupId];

    const formValues = [{
        name: 'url name',
        type: 'text',
        value: linkName
    },{
        name: 'url',
        type: 'url',
        value: url
    }];

    const validatedValues = validator(formValues,storageData,groupId,urlId);

    if (validatedValues.submit) {

        // preloader
        const preloaderTar = `#add-url-form-cont-${urlId}`;
        renderPreloader(preloaderTar,urlId);

        let iconLink = '';

        if (isUrlValid(url)) {
            iconLink = `https://www.google.com/s2/favicons?domain=${url}`;
        }

        if (urlIdsToLst(storageData).indexOf(urlId) === -1) {
            storageData[groupId].data.push({ urlId, url, iconLink, linkName });
        } else {
            storageData[groupId].data.forEach((urlData,index) => {
                if (urlData.urlId === urlId) {
                    storageData[groupId].data[index] = { urlId, url, iconLink, linkName };
                }
            });
        }

        chrome.storage.local.set({
            [groupId]: storageData[groupId]
        },() => {
            console.log('stored successfully!');

            $(`#preloader-${urlId}`).replaceWith(
                renderUrl(url,linkName,iconLink,urlId)
            );

            // init tooltips
            $('.tooltipped').tooltip();

            // init DND
            initDND(storageData);

            applyColor(storageData,groupId);
        });
    }
});

// Delete url input
$(document).on('click','.url-form-delete',function() {
    const urlId = parseInt($(this).attr('id').slice(16));
    $(`#add-url-form-cont-${urlId}`).remove();

    // delete url id since it has yet to be saved
    const urlIdIndex = urlIds.indexOf(urlId);
    urlIds.splice(urlIdIndex,1);

});

// Edit url
$(document).on('click','.url-edit',function() {
    const urlId = parseInt($(this).prop('id').slice(9));

    const name = $(`#name-${urlId}`).text().trim();

    const url = $(`#url-${urlId}`).prop('href');

    $(this).parents('.url-buttons').replaceWith(
        renderNewUrlForm(url,name,urlId,true,true,false,false)
    );

    $(`input[id="urlName${urlId}"]`).focus();
});

// delete url data
$(document).on('click','.url-delete',function() {
    const groupId = $(this).parents('.url-cont').prop('id').slice(9);
    const urlId = parseInt($(this).prop('id').slice(11));

    storageData[groupId].data.forEach((urlData,index) => {
        if (urlData.urlId === urlId) {
            storageData[groupId].data.splice(index,1);
        }
    });

    chrome.storage.local.set({[groupId]: storageData[groupId]});

    $(`#url-data-${urlId}`).remove();
});

