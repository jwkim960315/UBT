// chrome runtime listener
chrome.runtime.onMessage.addListener(req => {
    switch(req.todo) {
        // reload page once all tabs are saved
        case 'reloadOptionsPage':
            location.reload();
            return;
        default:
            return;
    }
});

// init
$(document).ready(() => {
    (async () => {
        let storageData = await storageGet();
        $('#data-display-area').html(`<pre>${JSON.stringify(storageData,undefined,4)}</pre>`);
        $('.tooltipped').tooltip();
    })();
});

// resizing textarea
$('#textarea').on('input',function() {
    M.textareaAutoResize($(this));
});

// onSubmit data
$('#submit-data-form').on('submit',function(e) {
    (async () => {
        e.preventDefault();

        const storageData = JSON.parse($('#textarea').val());

        await storageClear();
        await storageSet(storageData);
        M.toast({html: 'Successfully overwritten data!'});
        chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
    })();
});

// copy data
$('#copy-data').on('click',function() {
    const data = $('#data-display-area').text();
    let $temp = $('<textarea />');
    $("body").append($temp);
    $temp.val(data).select();
    document.execCommand("copy");
    $temp.remove();
    M.toast({html: 'Data Copied!'});
});

// save groups to an account's sync storage
$('.save-to-account').click(() => {
    (async () => {
        let localStorageData = await storageGet();
        await syncStorageClear();
        await syncStorageSet(localStorageData);
        M.toast({ html: 'Successfully saved groups to your account' });
    })();
});

// Overwrite data w/ account's data
$('.overwrite-with-account-data').click(() => {
    (async () => {
        let syncStorageData = await syncStorageGet();
        let storageData = await storageGet();

        await removeGroupBookmarks(storageData);
        await storageClear();

        syncStorageData = await condGroupBookmarksNUrls(syncStorageData);

        await storageSet(syncStorageData);

        M.toast({ html: "Successfully overwritten with account's data" });
        chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
        location.reload();
    })();
});