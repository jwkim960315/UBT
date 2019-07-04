const disableButtons = () => {
    $('#save-all-tabs').addClass('disabled');
    $('#settings').addClass('disabled');
    $('#export-to-bookmarks').addClass('disabled');
};

const enableButtons = () => {
    $('#save-all-tabs').removeClass('disabled');
    $('#settings').removeClass('disabled');
    $('#export-to-bookmarks').removeClass('disabled');
};