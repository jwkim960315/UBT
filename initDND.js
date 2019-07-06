const initDND = data => {
    $('.url-cont').sortable('destroy');
    $('.url-cont').sortable({
        // SortableJS options go here
        // See: (https://github.com/SortableJS/Sortable#options)
        group: 'shared',
        animation: 150,
        draggable: '.url-buttons',
        onEnd: event => {
            (async () => {
                console.log(event);
                let data = await storageGet();
                const oldGroupId = $(event.from).prop('id').slice(9);
                const newGroupId = $(event.to).prop('id').slice(9);
                let obj;

                let tmpUrlDataObj = {};
                data[oldGroupId].data.forEach(urlData => tmpUrlDataObj[urlData.urlId] = urlData);
                data[oldGroupId].data = [];
                $(`#url-cont-${oldGroupId}`).find('.url-buttons').each(function() {
                    const urlId = parseInt($(this).attr('id').slice(9));
                    data[oldGroupId].data.push(tmpUrlDataObj[urlId]);
                });


                if (oldGroupId === newGroupId) {

                    obj = await condGroupBookmarkNUrls(data,oldGroupId,data[oldGroupId].data,data[oldGroupId].groupName);
                    storageData = obj.storageData;

                } else {
                    data[newGroupId].data.forEach(urlData => tmpUrlDataObj[urlData.urlId] = urlData);
                    data[newGroupId].data = [];

                    $(`#url-cont-${newGroupId}`).find('.url-buttons').each(function() {
                        const urlId = parseInt($(this).attr('id').slice(9));
                        data[newGroupId].data.push(tmpUrlDataObj[urlId]);
                    });

                    obj = await condGroupBookmarkNUrls(data,oldGroupId,data[oldGroupId].data,data[oldGroupId].groupName);
                    storageData = obj.storageData;
                    obj = await condGroupBookmarkNUrls(data,newGroupId,data[newGroupId].data,data[newGroupId].groupName);
                    storageData = obj.storageData;


                    // color change
                    const rgbColor = data[newGroupId].color;
                    $(`#${event.to.id}`).find('.url-text > p').css('color',rgbColor);
                }

                await storageSet(data);

            })();

            /*
            evt.item;  // dragged HTMLElement
            evt.to;    // target list
            evt.from;  // previous list
            evt.oldIndex;  // element's old index within old parent
            evt.newIndex;  // element's new index within new parent
            evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
            evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
            evt.clone // the clone element
            evt.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
            */
        }
    });
};