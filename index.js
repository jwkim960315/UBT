// Global Vars
let storageData;
let urlIds;
let groupIds;

// chrome.storage.sync.clear();

// reload page once all tabs are saved
chrome.runtime.onMessage.addListener((req,sender,sendResponse) => {
    if (req.todo === 'reloadMainPage') {
        location.reload();
    }
});

// initialization
$(document).ready(() => {
    chrome.storage.sync.get(null,res => {
        // setting storageData to global var
        storageData = storageDataGroupIdModifier(res); // Re-assign group ids
        console.log(storageData);
        chrome.storage.sync.clear(() => {
            chrome.storage.sync.set(storageData,() => {
                urlIds = urlIdsToLst(storageData);
                groupIds = tempGroupReorder(storageData,Object.keys(storageData));

                // rendering all the storage data
                renderGroups(storageData,'.groups-placeholder',urlIds);

                // initialize group settings dropdown
                $('.dropdown-trigger').dropdown();

                initDND(storageData);
            });
        });
    });
});
// propertychange change keyup paste input focusout focusin blur
// search input change
$('#search').on('change keyup paste input focusout focusin mouseout', function() {
    const keyword = $(this).val();

    if (!keyword) {
        $('.group-cont').html('<div class="groups-placeholder"></div>');

        // rendering all the storage data
        renderGroups(storageData,'.groups-placeholder',urlIds);

        // initialize group settings dropdown
        $('.dropdown-trigger').dropdown();

        initDND(storageData);
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

            // initialize group settings dropdown
            $('.dropdown-trigger').dropdown();

            $(".url-text").mark(keyword);
            $('.card-title').mark(keyword);

            initDND(filteredData);
        }
    }
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
$(document).on('propertychange change keyup paste input focusout blur click', '.group-name-input',function() {
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

    const validatedValues = validator(formValues,storageData,'none','none');

    // check if submitted form passes all validations
    if (validatedValues.submit) {

        if (!storageData[groupId]) {
            storageData[groupId] = {
                groupName: inputVal,
                data: [],
                color: 'rgb(0,0,0)',
                createdAt: curDateNTimeToString()
            };
        } else {
            storageData[groupId].groupName = inputVal;
        }

        $(`#add-link-placeholder-${groupId}`).replaceWith(`
            <div class="row">
                <a class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
            </div>
        `);

        chrome.storage.sync.set({[groupId]: storageData[groupId]},() => {
            console.log('group name successfully saved!');

            // render group w/ submitted group name
            renderGroups(storageData,`#card-${groupId}`,urlIds,groupId);

            // initialize group settings dropdown
            $('.dropdown-trigger').dropdown();

            // for editing group name
            initDND(storageData);
        });
    }
});

// delete group
$(document).on('click','.delete-group',function() {

    const deletingGroupId = $(this).prop('id').slice(7);

    delete storageData[deletingGroupId];

    groupIds = groupIds.filter(groupId => groupId !== deletingGroupId);

    chrome.storage.sync.remove(deletingGroupId,() => {
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
$(document).on('propertychange change keyup paste input focusout blur click','.colorpicker-input',function() {
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

    chrome.storage.sync.set({[groupId]: storageData[groupId]}, () => {
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
    chrome.storage.sync.get([groupId], groupData => {
        applyColor(groupData, groupId);
        storageData[groupId].color = groupData[groupId].color;
    });

    $(`#card-${groupId}`).removeClass('col s12 m9');
});

// open all links
$(document).on('click','.open-all-links',function(e) {
    e.preventDefault();

    const groupId = $(this).attr('id').slice(15);
    const urlLst = storageData[groupId].data.map(urlData => {
        return urlData.url;
    });

    chrome.windows.create({ url: urlLst });
});

// Url onClick
$(document).on('click','.url-text',function(e) {
    e.preventDefault();
    const url = $(this).attr('href');
    chrome.tabs.create({ url },() => {
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
$(document).on('propertychange change keyup paste input focusout blur click','.url-name-input',function() {
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
$(document).on('propertychange change keyup paste input focusout blur click','.url-input',function() {
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

        chrome.storage.sync.set({
            [groupId]: storageData[groupId]
        },() => {
            console.log('stored successfully!');

            $(`#preloader-${urlId}`).replaceWith(
                renderUrl(url,linkName,iconLink,urlId)
            );

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

    chrome.storage.sync.set({[groupId]: storageData[groupId]});

    $(`#url-data-${urlId}`).remove();
});