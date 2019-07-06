// let storageData;
// let groupIds;

$(document).ready(() => {
    (async () => {
        let storageData = await storageGet();

        const target = '#url-input';

        const groupIds = Object.keys(storageData);

        let optionsHTMLLst = [`<option id="create-temporary-group" value="temporary" selected>New Temporary Group</option>`];

        optionsHTMLLst = optionsHTMLLst.concat(groupIds
            .map(groupId => {
                if (storageData[groupId].groupName === 'Temporary Group') {
                    return `
                        <option value="${groupId}">${storageData[groupId].groupName} - ${storageData[groupId].createdAt}</option>
                    `;
                }

                return `
                    <option value="${groupId}">${storageData[groupId].groupName}</option>
                `;
            }));

        optionsHTMLLst.push(`<option id="create-new-group" value="create-new-group">Create new group...</option>`);

        const optionsHTML = optionsHTMLLst.join('');

        $('select').append(optionsHTML);

        // initialize Materialize select form
        $('select').formSelect();

        // automatically inserts current page url to input

        let { title, url } = (await tabsQuery({ active: true }))[0];
        $('#urlName').val(title);
        $('label[for="urlName"]').addClass('active');

        // Check whether url name exists
        if (title === '' || undefined) {
            $('#urlName').addClass('invalid');
            $('#urlName').removeClass('valid');
            $('#urlName').next('span').attr('data-error','url name is required');
        } else {
            $('#urlName').addClass('valid');
            $('#urlName').removeClass('invalid');
            $('#urlName').next('span').attr('data-success','valid url name');
        }

        if (url.slice(-1) !== '/') {
            url += '/';
        }

        $('#url').val(url);
        $('label[for="url"]').addClass('active');

        // init tooltips
        $('.tooltipped').tooltip();
    })();
});

// save all tabs
$('#save-all-tabs').click(function() {
    (async () => {
        // disableButtons();
        let storageData = await storageGet();
        const groupIds = Object.keys(storageData);
        const tabs = await tabsQuery({ currentWindow: true });
        const groupId = `group${idGenerator(groupIds)}`;
        let urlIds = urlIdsToLst(storageData);
        const curDateNTime = curDateNTimeToString();

        const treeNode = await createGroupBookmark('Temporary Group');

        let tempGroupData = {
            groupName: 'Temporary Group',
            color: 'rgb(0,0,0)',
            data: [],
            createdAt: curDateNTime,
            bookmarkId: treeNode.id
        };

        tabs.forEach(({ url, title, favIconUrl }) => {
            const urlId = idGenerator(urlIds);

            tempGroupData.data.push({
                urlId,
                linkName: title,
                iconLink: favIconUrl,
                url
            });

            urlIds.push(urlId);
        });

        storageData[groupId] = tempGroupData;

        obj = await condGroupBookmarkNUrls(storageData,groupId,tempGroupData.data,'Temporary Group');
        storageData = obj.storageData;

        await storageSet(storageData);
        $.notify("saved all tabs",'success');
        // enableButtons();
        chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
    })();
});

// open manage page
$('#settings').click(() => {
    (async () => {
        await tabsCreate({ url: 'index.html'});
    })();
});

// export all groups to bookmarks
$('#export-to-bookmarks').click(() => {
    (async () => {
        let storageData = await storageGet();

        storageData = await condGroupBookmarksNUrls(storageData);

        await storageSet(storageData);
    })();
});

// selected from dropdown menu
$('select').change(function() {
    (async () => {
        if ($(this).children('option:selected').val() === 'create-new-group') {
            const target = '#group-select';
            renderNewGroupInput(target);
        } else {
            $('.new-group-input').remove();

            const url = $('#url').val();
            const urlName = $('input[name="urlName"]').val();

            // could be undefined
            const groupName = $(this).val();

            let formValues = [];

            if (groupName) {
                formValues.push({
                    name: 'group name',
                    target: 'input[name="groupName"]',
                    type: 'text',
                    value: groupName
                });
            }

            formValues = formValues.concat([{
                name: 'url name',
                target: 'input[name="urlName"]',
                type: 'text',
                value: urlName
            }, {
                name: 'url',
                target: 'input[name="url"]',
                type: 'url',
                value: url
            }]);

            const validatedValues = validator(formValues);
            const buttonTar = 'button[type="submit"]';

            renderValidationError(validatedValues,buttonTar);
        }
    })();
});

// group name validation
$(document).on('input','#new-group',function() {
    (async () => {
        const urlName = $('input[name="urlName"]').val();
        const url = $('input[name="url"]').val();

        // could be undefined
        const groupName = $(this).val();

        let formValues = [];

        formValues.push({
            name: 'group name',
            target: 'input[name="groupName"]',
            type: 'text',
            value: groupName
        });

        formValues = formValues.concat([{
            name: 'url name',
            target: 'input[name="urlName"]',
            type: 'text',
            value: urlName
        }, {
            name: 'url',
            target: 'input[name="url"]',
            type: 'url',
            value: url
        }]);

        const validatedValues = validator(formValues);
        const buttonTar = 'button[type="submit"]';

        renderValidationError(validatedValues,buttonTar);
    })();
});

// url name validation
$('#urlName').on('input',function() {
    (async () => {
        const urlName = $(this).val();
        const url = $('input[name="url"]').val();

        // could be undefined
        const groupName = $('input[name="groupName"]').val();

        let formValues = [];

        if (groupName !== undefined) {
            formValues.push({
                name: 'group name',
                target: 'input[name="groupName"]',
                type: 'text',
                value: groupName
            });
        }

        formValues = formValues.concat([{
            name: 'url name',
            target: 'input[name="urlName"]',
            type: 'text',
            value: urlName
        }, {
            name: 'url',
            target: 'input[name="url"]',
            type: 'url',
            value: url
        }]);

        const validatedValues = validator(formValues);
        const buttonTar = 'button[type="submit"]';

        renderValidationError(validatedValues,buttonTar);
    })();
});

// url validation
$('#url').on('input',function() {
    (async () => {
        const url = $(this).val();
        const urlName = $('input[name="urlName"]').val();

        // could be undefined
        const groupName = $('input[name="groupName"]').val();

        let formValues = [];

        if (groupName !== undefined) {
            formValues.push({
                name: 'group name',
                target: 'input[name="groupName"]',
                type: 'text',
                value: groupName
            });
        }

        formValues = formValues.concat([{
            name: 'url name',
            target: 'input[name="urlName"]',
            type: 'text',
            value: urlName
        }, {
            name: 'url',
            target: 'input[name="url"]',
            type: 'url',
            value: url
        }]);

        const validatedValues = validator(formValues);
        const buttonTar = 'button[type="submit"]';

        renderValidationError(validatedValues,buttonTar);
    })();
});

// enable edit url once double click input
$(document).on('dblclick','#url',function() {
    $(this).attr('disabled',false);
});

// url submitted
$('form.save-url').submit(function(e) {
    (async () => {
        e.preventDefault();

        let storageData = await storageGet();
        const groupIds = Object.keys(storageData);

        $('#cover-spin').show(0);

        let formValues = $(this).serializeArray();

        formValues = formValues.map(formValue => {
            switch(formValue.name) {
                case 'groupName':
                    formValue.target = 'input[name="groupName"]';
                    return formValue;
                case 'urlName':
                    formValue.target = 'input[name="urlName"]';
                    return formValue;
                case 'url':
                    formValue.target = 'input[name="url"]';
                    return formValue;
                default:
                    return formValue;
            }
        });

        // since url input is disabled, it has to be manually inserted to formValues
        formValues.push({
            name: 'url',
            target: 'input[name="url"]',
            value: $('#url').val()
        });

        formValues = morphFormValues(formValues);

        let groupId;
        let bookmarkId;

        if (formValues[0].value === 'create-new-group') {
            groupId = `group${idGenerator(groupIds)}`;

            formValues.splice(0,1);

            const treeNode = await createGroupBookmark(formValues[0].value);
            bookmarkId = treeNode.id;
            console.log(bookmarkId);

            storageData[groupId] = {
                groupName: formValues[0].value,
                data: [],
                color: 'rgb(0,0,0)',
                createdAt: curDateNTimeToString(),
                bookmarkId
            };
        } else if (formValues[0].value === 'temporary') {
            groupId = `group${idGenerator(groupIds)}`;

            const curDateNTime = curDateNTimeToString();

            const treeNode = await createGroupBookmark('Temporary Group');
            bookmarkId = treeNode.id;
            console.log(bookmarkId);

            storageData[groupId] = {
                groupName: 'Temporary Group',
                data: [],
                color: 'rgb(0,0,0)',
                createdAt: curDateNTime,
                bookmarkId
            };
        } else {
            groupId = $('select').children('option:selected').val();

            bookmarkId = storageData[groupId].bookmarkId;
        }

        const validatedValues = validator(formValues);

        if (validatedValues.submit) {
            let urlId = idGenerator(urlIdsToLst(storageData));
            let linkName = formValues[1].value;
            let url = formValues[2].value;

            // if (url.slice(-1) !== '/') {
            //     url += '/';
            // }

            const { favIconUrl } = (await tabsQuery({active: true}))[0];
            let iconLink = '';

            if (!await isUrlValid(url)) {
                $('#cover-spin').hide(0);
                $('input[name="url"]').removeClass('valid');
                $('input[name="url"]').addClass('invalid');
                $('input[name="url"]').next('span').attr('data-error','invalid url');
            } else {

                if (!favIconUrl || !favIconUrl.length) {
                    if (url !== 'chrome://extensions/') {
                        iconLink = `https://www.google.com/s2/favicons?domain=${url}`;
                    }
                } else {
                    iconLink = favIconUrl;
                }
                console.log(bookmarkId);
                const urlTreeNode = await bookmarkCreate({
                    parentId: bookmarkId,
                    title: linkName,
                    url
                });

                storageData[groupId].data.push({
                    urlId,
                    linkName,
                    url,
                    iconLink,
                    bookmarkId: urlTreeNode.id
                });

                await storageSet({[groupId]: storageData[groupId]});
                $('#cover-spin').hide(0);
                $.notify("url has been successfully saved!",'success');
                $('button[type="submit"]').addClass('disabled');
                chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
            }

        } else {
            $('#cover-spin').hide(0);
        }
    })();
});