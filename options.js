$(document).ready(() => {
    chrome.storage.local.get(null, res => {
        $('#data-display-area').html(`<pre>${JSON.stringify(res,undefined,4)}</pre>`);
    });
});

// resizing textarea
$('#textarea').on('input',function() {
    M.textareaAutoResize($(this));
});

// onSubmit data
$('#submit-data-form').on('submit',function(e) {
    e.preventDefault();

    const data = JSON.parse($('#textarea').val());
    chrome.storage.local.clear(() => {
        chrome.storage.local.set(data,() => {
            M.toast({html: 'Successfully overwritten data!'});
            chrome.runtime.sendMessage({ todo: 'reloadMainPage' });
        });
    });

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