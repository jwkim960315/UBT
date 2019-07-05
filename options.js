// init
$(document).ready(() => {
    (async () => {
        let storageData = await storageGet();
        $('#data-display-area').html(`<pre>${JSON.stringify(storageData,undefined,4)}</pre>`);
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