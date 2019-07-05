// Global Vars
let storageData;
let urlIds;
let tempGroupIds;

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
$(document).ready(() => {
    (async () => {
        let storageData = filterOnCreatingGroupOrUrl(storageDataGroupIdModifier(await storageGet()));
        await storageClear();
        await storageSet(storageData);
        console.log(storageData);
        renderGroups(storageData,'.groups-placeholder');
    })();
});

// search input change
$('#search').on('input', function() {
    (async () => {
        let storageData = await storageGet();
        const keyword = $(this).val();

        if (!keyword) {
            $('.group-cont').html('<div class="groups-placeholder"></div>');

            // rendering all the storage data
            renderGroups(storageData,'.groups-placeholder');
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
                renderGroups(filteredData,'.groups-placeholder');

                $(".url-text").mark(keyword);
                $('.card-title').mark(keyword);
            }
        }
    })();
});

// sync to account's sync storage
$('.sync-to-account').click(() => {
    (async () => {
        let localStorageData = await storageGet();
        await syncStorageSet(localStorageData);
        M.toast({html: 'Successfully synchronized with the account!'});
    })();
});

// add new group
$('.add-group').click(() => {
    (async () => {
        let groupIds = Object.keys(await storageGet());
        let groupId = `group${idGenerator(groupIds)}`;

        const target = '.group-cont';

        await storageSet({ [groupId]: {} });

        renderNewGroupForm(target,groupId);
    })();
});

// new group name on change
$(document).on('input', '.group-name-input',function() {
    (async () => {
        let storageData = await storageGet();
        const newGroupName = $(this).val();
        const groupId = $(this).attr('id');
        const formValues = [{
            name: 'group name',
            type: 'text',
            value: newGroupName,
            target: `input[id="${groupId}"]`
        }];

        const buttonTar = `#submit-new-${groupId}`;

        const validatedValues = validator(formValues);

        renderValidationError(validatedValues,buttonTar);
    })();
});

// onSubmit add-group-form
$(document).on('submit','.add-group-form',function(e) {
    (async () => {
        e.preventDefault();

        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(15);
        const inputElem = $(`input[id="${groupId}"]`);
        const inputVal = inputElem.val();

        const formValues = [{
            name: 'group name',
            type: 'text',
            value: inputVal
        }];

        const validatedValues = validator(formValues);

        if (validatedValues.submit) {
            if (!Object.keys(storageData[groupId]).length) {
                storageData[groupId] = {
                    groupName: inputVal,
                    data     : [],
                    color    : 'rgb(0,0,0)',
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

            await storageSet({[groupId]: storageData[groupId]});
            M.toast({ html: `${inputVal} successfully saved` });
            renderGroups(storageData,`#card-colorpicker-cont-${groupId}`,groupId);
        }
    })();
});

// group name onDblclick
$(document).on('dblclick','.card-title',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id');
        const name = storageData[groupId].groupName;
        $(`#card-header-${groupId}`).replaceWith(
            renderGroupForm(name,groupId,false)
        );
    })();
});

// open all links
$(document).on('click','.open-all',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(9);
        const urls = storageData[groupId].data.map(({ url }) => url);

        await windowOpenNTabsCreate(urls);
    })();
});

// delete group
$(document).on('click','.delete-group',function() {
    (async () => {
        let storageData = await storageGet();
        const deletingGroupId = $(this).prop('id').slice(7);
        const deletingGroupName = storageData[deletingGroupId].groupName;
        delete storageData[deletingGroupId];

        await storageRemove(deletingGroupId);
        M.toast({ html: `${deletingGroupName} has been removed` });
        $(`#card-${deletingGroupId}`).remove();
        $(`#colorpicker-cont-${deletingGroupId}`).remove();
    })();
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
    (async () => {
        let storageData = await storageGet();
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
    })();
});

// change group color w/ input
$(document).on('input','.colorpicker-input',function() {
    const hexColor = $(this).val();
    const groupId = $(this).attr('id').slice(6);

    $.farbtastic(`#colorpicker-${groupId}`).setColor(hexColor);
});

// save color from color picker
$(document).on('click','.save-color',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(11);
        let color = tinycolor($.farbtastic(`#colorpicker-${groupId}`).color).toRgbString();

        if (!color) {
            color = 'rgb(0,0,0)';
        }

        storageData[groupId].color = color;

        await storageSet({[groupId]: storageData[groupId]});
        M.toast({ html: `color has been saved` });
        $(`#close-colorpicker-${groupId}`).trigger('click');
    })();
});

// close color picker
$(document).on('click','.close-colorpicker',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).prop('id').slice(18);

        $(`#colorpicker-cont-${groupId}`).replaceWith(`
            <div id="colorpicker-placeholder-${groupId}" class="colorpicker-placeholder"></div>
        `);

        applyColor(storageData, groupId);

        $(`#card-${groupId}`).removeClass('col s12 m9');
    })();
});

// sync group onClick
$(document).on('click','.export-group',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(7);
        const target = `#card-${groupId}`;

        renderCheckboxGroupForm(target,groupId,storageData,'export');
    })();
});

// checked urls sync form submit
$(document).on('submit','.export-group-form',function(e) {
    (async () => {
        e.preventDefault();

        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(18);

        let formValues = $(this).serializeArray();

        formValues = formValues.map(({ name }) => {
            const curUrlId = parseInt(name.slice(9));

            return storageData[groupId].data.filter(({ urlId }) => urlId === curUrlId)[0];
        });

        await syncGroupToBookmark(storageData,groupId,formValues);

        const target = `#card-colorpicker-cont-${groupId}`;
        M.toast({html: `Successfully synchronized ${storageData[groupId].groupName}`});
        renderGroups(storageData,target,groupId);
    })();
});

// cancel export group
$(document).on('click','.export-cancel',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(14);
        const target = `#card-colorpicker-cont-${groupId}`;
        renderGroups(storageData,target,groupId);
    })();
});

// open links onClick
$(document).on('click','.open-all-links',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(15);
        const target = `#card-${groupId}`;

        renderCheckboxGroupForm(target,groupId,storageData,'open');
    })();
});

// checked urls open on tabs
$(document).on('submit','.open-group-form',function(e) {
    (async () => {
        e.preventDefault();

        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(16);

        let formValues = $(this).serializeArray();

        const urls = formValues.map(({ name }) => {
            const curUrlId = parseInt(name.slice(9));

            return storageData[groupId].data.filter(({ urlId }) => urlId === curUrlId)[0];
        }).map(urlData => urlData.url);

        await windowOpenNTabsCreate(urls);

        const target = `#card-colorpicker-cont-${groupId}`;

        renderGroups(storageData,target,groupId);
    })();
});

// cancel open links
$(document).on('click','.open-cancel',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(12);

        const target = `#card-colorpicker-cont-${groupId}`;

        renderGroups(storageData,target,groupId);
    })();
});

// export entire group to bookmark
$(document).on('click','.export-whole',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).attr('id').slice(13);
        const urlDataLst = storageData[groupId].data;

        await syncGroupToBookmark(storageData,groupId,urlDataLst);

        M.toast({html: `Successfully synchronized ${storageData[groupId].groupName}`});
    })();
});

// Url onClick
$(document).on('click','.url-text',function(e) {
    (async () => {
        e.preventDefault();
        const url = $(this).attr('href');

        await tabsCreate({
            active: false,
            url
        });

        M.toast({ html: 'tab has been created' });
    })();
});


// Add new url form
$(document).on('click','.add-link',function() {
    (async () => {
        let storageData = await storageGet();
        let urlIds = urlIdsToLst(storageData);

        const groupId = $(this).prop('id').slice(9);
        const urlId = idGenerator(urlIds);

        storageData[groupId].data.push({
            linkName: '',
            url: '',
            urlId,
            iconLink: '',
            isPermanent: false
        });

        await storageSet({[groupId]: storageData[groupId]});

        $(`#new-url-data-${groupId}`).prev().append(
            renderNewUrlForm('','',urlId,false,false,true,true)
        );

        $(`input[id="urlName${urlId}"]`).focus();
    })();
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

    const buttonTar = `#submit-new-url-${urlId}`;

    let validatedValues = validator(formValues);

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

    const buttonTar = `#submit-new-url-${urlId}`;

    const validatedValues = validator(formValues);

    renderValidationError(validatedValues,buttonTar);
});

// onSubmit add-url-form
$(document).on('submit','.add-url-form',function(e) {
    (async () => {
        e.preventDefault();

        let storageData = await storageGet();
        const urlId = parseInt($(this).attr('id').slice(13));
        let url = $(`#url${urlId}`).val();

        if (url.slice(-1) !== '/' && url.length) {
            url += '/';
        }

        const linkName = $(`#urlName${urlId}`).val();

        const groupId = $(this).parents('.card').attr('id').slice(5);

        const formValues = [{
            name: 'url name',
            type: 'text',
            value: linkName
        },{
            name: 'url',
            type: 'url',
            value: url
        }];

        const validatedValues = validator(formValues);

        if (validatedValues.submit) {
            // preloader
            const preloaderTar = `#add-url-form-cont-${urlId}`;
            renderPreloader(preloaderTar,urlId);

            let iconLink = '';

            if (isUrlValid(url)) {
                iconLink = `https://www.google.com/s2/favicons?domain=${url}`;
            }

            storageData[groupId].data.forEach((urlData,index) => {
                if (urlData.urlId === urlId) {
                    storageData[groupId].data[index] = {
                        urlId,
                        url,
                        iconLink,
                        linkName,
                        isPermanent: true
                    };
                }
            });

            await storageSet({[groupId]: storageData[groupId]});

            M.toast({ html: `stored url successfully`});

            $(`#preloader-${urlId}`).replaceWith(
                renderUrl(url,linkName,iconLink,urlId)
            );

            // init tooltips
            $('.tooltipped').tooltip();

            // init DND
            initDND(storageData);

            applyColor(storageData,groupId);
        }
    })();





    // const { groupName } = storageData[groupId];



    // if (validatedValues.submit) {
    //
    //     // preloader
    //     const preloaderTar = `#add-url-form-cont-${urlId}`;
    //     renderPreloader(preloaderTar,urlId);
    //
    //     let iconLink = '';
    //
    //     if (isUrlValid(url)) {
    //         iconLink = `https://www.google.com/s2/favicons?domain=${url}`;
    //     }
    //
    //     if (urlIdsToLst(storageData).indexOf(urlId) === -1) {
    //         storageData[groupId].data.push({ urlId, url, iconLink, linkName });
    //     } else {
    //         storageData[groupId].data.forEach((urlData,index) => {
    //             if (urlData.urlId === urlId) {
    //                 storageData[groupId].data[index] = { urlId, url, iconLink, linkName };
    //             }
    //         });
    //     }
    //
    //     chrome.storage.local.set({
    //         [groupId]: storageData[groupId]
    //     },() => {
    //         console.log('stored successfully!');
    //
    //         $(`#preloader-${urlId}`).replaceWith(
    //             renderUrl(url,linkName,iconLink,urlId)
    //         );
    //
    //         // init tooltips
    //         $('.tooltipped').tooltip();
    //
    //         // init DND
    //         initDND(storageData);
    //
    //         applyColor(storageData,groupId);
    //     });
    // }
});

// Delete url input
$(document).on('click','.url-form-delete',function() {
    (async () => {
        let storageData = await storageGet();
        const groupId = $(this).parenst('.card').attr('id').slice(5);
        const urlId = parseInt($(this).attr('id').slice(16));
        $(`#add-url-form-cont-${urlId}`).remove();

        storageData[groupId].data = storageData[groupId].data.filter(urlData => urlData.isPermanent);

        await storageSet({[groupId]: storageData[groupId]});
    })();
    // const urlId = parseInt($(this).attr('id').slice(16));
    // $(`#add-url-form-cont-${urlId}`).remove();
    //
    // // delete url id since it has yet to be saved
    // const urlIdIndex = urlIds.indexOf(urlId);
    // urlIds.splice(urlIdIndex,1);

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

