let storageData;
let groupIds;

$(document).ready(() => {

    chrome.storage.sync.get(null, res => {
        // render preloader until url validation finishes
        const target = '#url-input';

        storageData = res;

        groupIds = Object.keys(storageData);

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
        chrome.tabs.query({ 'active': true }, tabs => {
            let { url, title } = tabs[0];

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
        });
    });
});

// open manage page
$('#settings').click(() => {
    chrome.tabs.create({ url: 'index.html' });
});

// export all groups to bookmarks
$('#export-to-bookmarks').click(() => {
    groupIds.forEach((groupId,index) => {
        chrome.bookmarks.create({
            index,
            parentId: '1',
            title: storageData[groupId].groupName
        }, bookmarkTreeNode => {
            storageData[groupId].data.forEach(({ urlId, url, linkName }) => {
                chrome.bookmarks.create({
                    parentId: bookmarkTreeNode.id,
                    title: linkName,
                    url
                });
            });
        });
    });
});

// selected from dropdown menu
$('select').change(function() {
    if ($(this).children('option:selected').val() === 'create-new-group') {
        const target = '#group-select';
        renderNewGroupInput(target);
    } else {
        $('.new-group-input').remove();

        const groupId = $(this).children('option:selected').val();
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

        const validatedValues = validator(formValues,storageData,groupId,undefined);
        const buttonTar = 'button[type="submit"]';

        renderValidationError(validatedValues,buttonTar);
    }


});

// group name validation
$(document).on('input','#new-group',function() {
    const urlName = $('input[name="urlName"]').val();
    const groupId = $('select').children('option:selected').val();
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

    const validatedValues = validator(formValues,storageData,'none','none');
    const buttonTar = 'button[type="submit"]';

    renderValidationError(validatedValues,buttonTar);
});

// url name validation
$('#urlName').on('input',function() {
    const urlName = $(this).val();
    const groupId = $('select').children('option:selected').val();
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

    const validatedValues = validator(formValues,storageData,groupId,undefined);
    const buttonTar = 'button[type="submit"]';

    renderValidationError(validatedValues,buttonTar);
});

// url validation
$('#url').on('input',function() {
    const url = $(this).val();
    const urlName = $('input[name="urlName"]').val();
    const groupId = $('select').children('option:selected').val();

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

    const validatedValues = validator(formValues,storageData,groupId,undefined);
    const buttonTar = 'button[type="submit"]';

    renderValidationError(validatedValues,buttonTar);
});

// enable edit url once double click input
$(document).on('dblclick','#url',function() {
    $(this).attr('disabled',false);
});

// url submitted
$('form.save-url').submit(function(e) {
    e.preventDefault();

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

    if (formValues[0].value === 'create-new-group') {
        groupId = `group${idGenerator(groupIds)}`;

        formValues.splice(0,1);

        storageData[groupId] = {
            groupName: formValues[0].value,
            data: [],
            color: 'rgb(0,0,0)'
        };
    } else if (formValues[0].value === 'temporary') {
        groupId = `group${idGenerator(groupIds)}`;

        const curDateNTime = curDateNTimeToString();

        storageData[groupId] = {
            groupName: 'Temporary Group',
            data: [],
            color: 'rgb(0,0,0)',
            createdAt: curDateNTime
        };
    } else {
        groupId = $('select').children('option:selected').val();
    }

    const validatedValues = validator(formValues,storageData,groupId,undefined);

    if (validatedValues.submit) {
        let urlId;
        let linkName;
        let url;

        urlId = idGenerator(urlIdsToLst(storageData));

        linkName = formValues[1].value;

        url = formValues[2].value;

        if (url.slice(-1) !== '/') {
            url += '/';
        }

        chrome.tabs.query({ active: true }, tabs => {
            const { favIconUrl } = tabs[0];

            let iconLink;

            if (!favIconUrl || !favIconUrl.length) {
                if (isUrlValid(url)) {
                    iconLink = `https://www.google.com/s2/favicons?domain=${url}`;
                } else {
                    iconLink = '';
                }
            } else {
                iconLink = favIconUrl;
            }

            storageData[groupId].data.push({
                urlId,
                linkName,
                url,
                iconLink
            });

            chrome.storage.sync.set({[groupId]: storageData[groupId]},() => {
                console.log('New Group & new url has been successfully saved!');
                $('#cover-spin').hide(0);
                $.notify("url has been successfully saved!",'success');
                $('button[type="submit"]').addClass('disabled');

                chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
            });
        });
    } else {
        $('#cover-spin').hide(0);
    }
});