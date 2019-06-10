// Initialization
$(document).ready(() => {
    chrome.storage.sync.get([],res => {
        console.log(res);

    });
});

// Add new group
$('.add-group').click(() => {
    chrome.storage.sync.get([],res => {

    });

    const groupName = 'Group';

    $('.group-cont').append(`
        <div class="col s12 m12">
            <div class="card">
                <div class="card-content">
                    <span class="card-title">${groupName}</span>
                    <a class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
                </div>
            </div>
        </div>
    `);
});

// Add new link
$(document).on('click','.add-link',function() {

    let lst = [];

    $(this).parent().prev().after(`
        <div class="row">
            <form class="add-url-form">
                <div class="row">
                    <div class="input-field col s12 l10">
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
    $(this).find('.url-input').val();
});

// Delete url input
$(document).on('click','.url-delete',function(e) {
    e.preventDefault();
    $(this).parents('form[class="add-url-form"]').remove();
});