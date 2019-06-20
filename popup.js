let data;

$(document).ready(() => {

    chrome.storage.sync.get(null, res => {
        data = res;

        groupIds = Object.keys(data);

        const optionsHTMLLst = groupIds
            .map(groupId => {
                return `
                    <option value="${groupId}">${data[groupId].groupName}</option>
                `;
            });

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

            if (url.slice(-1) !== '/') {
                url += '/';
            }

            $('#url').val(url);
            $('label[for="url"]').addClass('active');
        });
    })
});

// selected from dropdown menu
$('select').change(function() {
    if ($(this).children('option:selected').val() === 'create-new-group') {
        $('#group-select').after(`
            <div class="row new-group-input">
                <div class="input-field col s12">
                    <label for="new-group">Group Name</label>
                    <input id="new-group" type="text" class="" name="groupName"/>
                    <span class="helper-text"></span>
                </div>
            </div>
        `);

        $('button[type="submit"]').removeClass('disabled');
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

        const validatedValues = validator(formValues,data,groupId,undefined);

        validatedValues.values.forEach(({ error, target, message },index) => {
            if (error) {
                $(target).removeClass('valid');
                $(target).addClass('invalid');
                $(target).next('span').attr('data-error',message);
            } else {
                $(target).removeClass('invalid');
                $(target).addClass('valid');
                $(target).next('span').attr('data-success',message);
            }
        });

        if (validatedValues.submit) {
            $('button[type="submit"]').removeClass('disabled');
        } else {
            $('button[type="submit"]').addClass('disabled');
        }
    }


});

// group name validation
$(document).on('propertychange change keyup paste input focusout blur','#new-group',function() {
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

    const validatedValues = validator(formValues,data,'none','none');

    validatedValues.values.forEach(({ error, target, message }) => {
        if (error) {
            $(target).removeClass('valid');
            $(target).addClass('invalid');
            $(target).next('span').attr('data-error',message);
        } else {
            $(target).removeClass('invalid');
            $(target).addClass('valid');
            $(target).next('span').attr('data-success',message);
        }
    });

    if (validatedValues.submit) {
        $('button[type="submit"]').removeClass('disabled');
    } else {
        $('button[type="submit"]').addClass('disabled');
    }
});

// url name validation
$('#urlName').on('propertychange change keyup paste input focusout blur',function() {
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

    const validatedValues = validator(formValues,data,groupId,undefined);
    console.log(validatedValues);
    validatedValues.values.forEach(({ error, target, message },index) => {
        if (error) {
            $(target).removeClass('valid');
            $(target).addClass('invalid');
            $(target).next('span').attr('data-error',message);
        } else {
            $(target).removeClass('invalid');
            $(target).addClass('valid');
            $(target).next('span').attr('data-success',message);
        }
    });

    if (validatedValues.submit && !urlExists) {
        $('button[type="submit"]').removeClass('disabled');
    } else {
        $('button[type="submit"]').addClass('disabled');
    }

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

        data[groupId] = {
            groupName: formValues[0].value,
            data: []
        };
    } else {
        groupId = $('select').children('option:selected').val();
    }

    const validatedValues = validator(formValues,data,groupId,undefined);

    if (validatedValues.submit) {
        let urlId;
        let linkName;
        let url;

        urlId = idGenerator(urlIdsToLst(data));

        linkName = formValues[1].value;

        url = formValues[2].value;

        if (url.slice(-1) !== '/') {
            url += '/';
        }

        axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://besticon-demo.herokuapp.com/allicons.json?url=${url}`)
            .then(res => {
                let iconLink;
                if (!res.data.icons.length) {
                    const domainInitialIndex = (url.includes('www.')) ? url.indexOf('www.')+4 : url.indexOf('//')+2;
                    const domainInitial = url[domainInitialIndex].toUpperCase();
                    iconLink = `https://besticon-demo.herokuapp.com/lettericons/${domainInitial}-120.png`
                } else {
                    iconLink = res.data.icons[0].url;
                }


                data[groupId].data.push({
                    urlId,
                    linkName,
                    url,
                    iconLink
                });

                chrome.storage.sync.set({[groupId]: data[groupId]},() => {
                    console.log('New Group & new url has been successfully saved!');
                    $('#cover-spin').hide(0);
                    $.notify("url has been successfully saved!",'success');
                    $('button[type="submit"]').addClass('disabled');
                });
            },err => {
                if (err.response.status === 404) {
                    console.log('invalid url');
                }
            });
    } else {
        $('#cover-spin').hide(0);
    }
});