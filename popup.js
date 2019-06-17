let data;

$(document).ready(() => {

    chrome.storage.sync.get(null, res => {
        data = res;

        groupIds = Object.keys(data);

        const optionsHTMLLst = groupIds
            .map((groupId,index) => {
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
        chrome.tabs.query({ 'active': true }, function (tabs) {
            const { url } = tabs[0];
            $('#url').val(url);
            $('label[for="url"]').addClass('active');
        });
    })
});

// create new group button selected
$('select').change(function() {
    if ($(this).children('option:selected').val() === 'create-new-group') {
        $('#group-select').after(`
            <div class="row new-group-input">
                <div class="input-field col s12">
                    <label for="new-group">Group Name</label>
                    <input id="new-group" type="text" class="validate" name="groupName"/>
                </div>
            </div>
        `);

        $('button[type="submit"]').removeClass('disabled');
    } else {
        $('.new-group-input').remove();

        const groupId = $(this).children('option:selected').val();

        const url = $('#url').val();

        console.log(url);

        const urlExists = data[groupId].data.some(urlData => urlData.url === url);

        if (!urlExists) {
            $('button[type="submit"]').removeClass('disabled');
        } else {
            $('button[type="submit"]').addClass('disabled');
        }
    }


});

// check if url exists
$('#url').on('propertychange change keyup paste input',function() {
    const url = $(this).val();
    const groupId = $('select').children('option:selected').val();

    if (groupId.length) {
        const urlExists = data[groupId].data.some(urlData => urlData.url === url);

        if (!urlExists) {
            if (isUrlValid(url)) {
                $('button[type="submit"]').removeClass('disabled');
            } else {
                $('input#url').addClass('invalid');
            }
        } else {
            $('button[type="submit"]').addClass('disabled');
        }
    }






});

// url submitted
$('form.save-url').submit(function(e) {
    e.preventDefault();
    console.log($(this).serializeArray());




    let formValues = $(this).serializeArray();

    let groupId;
    let urlId;
    let linkName;
    let url;

    if (formValues[0].value === 'create-new-group') {
        groupId = `group${idGenerator(groupIds)}`;



        formValues.splice(0,1);
        console.log(formValues);
        data[groupId] = {
            groupName: formValues[0].value,
            data: []
        };
    } else {
        groupId = formValues[0].value;
    }

    urlId = idGenerator(urlIdsToLst(data));

    linkName = formValues[1].value;

    url = formValues[2].value;

    console.log('groupId',groupId);
    console.log('urlId',urlId);
    console.log('linkName',linkName);
    console.log('url',url);

    if (isUrlValid(url)) {
        axios.get(`${'https://cors-anywhere.herokuapp.com/'}https://besticon-demo.herokuapp.com/allicons.json?url=${url}`)
            .then(res => {
                const iconLink = res.data.icons[0].url;

                data[groupId].data.push({
                    urlId,
                    linkName,
                    url,
                    iconLink
                });

                chrome.storage.sync.set({[groupId]: data[groupId]},() => {
                    console.log('New Group & new url has been successfully saved!');
                });
            },err => {
                if (err.response.status === 404) {
                    console.log('invalid url');
                }
            });
    } else {

    }


});