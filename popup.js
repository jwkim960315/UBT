let data;
console.log(data);
$(document).ready(() => {
    // initialize Materialize select form
    $('select').formSelect();

    chrome.storage.sync.get(null, res => {
        data = res;


        const groupIds = Object.keys(data);

        const optionsHTML = groupIds
            .map((groupId,index) => {
                return `
                    <option value="${groupId}">{data[groupId].groupName}</option>
                `;
            })
            .join('');

        $('option').after(optionsHTML);
    })
});

