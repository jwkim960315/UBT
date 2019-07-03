const initDND = data => {
    $('.url-cont').sortable('destroy');
    $('.url-cont').sortable({
        // SortableJS options go here
        // See: (https://github.com/SortableJS/Sortable#options)
        group: 'shared',
        animation: 150,
        draggable: '.url-buttons',
        onEnd: event => {
            const oldGroupId = $(event.from).prop('id').slice(9);
            const newGroupId = $(event.to).prop('id').slice(9);
            const { oldDraggableIndex, newDraggableIndex } = event;
            const draggedUrlData = data[oldGroupId].data[oldDraggableIndex];

            if (oldGroupId === newGroupId) {
                data[oldGroupId].data[oldDraggableIndex] = data[oldGroupId].data[newDraggableIndex];
                data[oldGroupId].data[newDraggableIndex] = draggedUrlData;
            } else {
                data[oldGroupId].data.splice(oldDraggableIndex,1);
                data[newGroupId].data.splice(newDraggableIndex,0,draggedUrlData);

                // color change
                const rgbColor = data[newGroupId].color;
                $(`#${event.to.id}`).find('.url-text > p').css('color',rgbColor);
            }


            chrome.storage.local.set({[oldGroupId]: data[oldGroupId]},() => {
                console.log('Old group has been updated!');
                chrome.storage.local.set({[newGroupId]: data[newGroupId]}, () => {
                    console.log('New group has been updated!');
                });
            });

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