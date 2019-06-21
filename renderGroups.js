const renderGroups = (iterableObj,target,urlFormIds,groupId=false) => {
    if (groupId) {
        iterableObj = {
            [groupId]: iterableObj[groupId]
        };
    }

    let groupsHtmlLst = [];

    Object.keys(iterableObj).forEach(groupKey => {
        groupsHtmlLst.push(`
            <div class="card" id="${groupKey}">
                <div class="card-content">
                    <div class="row">
                        <div class="col s12 m11">
                            <span id="${groupKey}" class="card-title">${iterableObj[groupKey].groupName}</span>
                        </div>
                        <div class="col s12 m1">
                            <button class='dropdown-trigger btn' data-target='group-settings${groupKey.slice(-1)}'><i class="material-icons">settings</i></button>
                            <ul id='group-settings${groupKey.slice(-1)}' class='dropdown-content'>
                                <li><a class="change-color ${groupKey}">change color</a></li>
                                <li class="divider" tabindex="-1"></li>
                                <li><a class="edit-group-name">edit group name</a></li>
                                <li class="divider" tabindex="-1"></li>
                                <li><a class="open-all-links ${groupKey}">open all links</a></li>
                                <li class="divider" tabindex="-1"></li>
                                <li><a class="delete-group red-text">delete group</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="url-cont" id="url-cont-${groupKey}">
                        ${renderLinks(iterableObj,parseInt(groupKey.slice(-1)),urlFormIds)}
                    </div>
                    <div class="row new-url-data">
                        <div class="col">
                            <a class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="color-picker-placeholder"></div>
        `);
    });

    const groupsHTML = groupsHtmlLst.join('');

    $(target).replaceWith(groupsHTML);

    Object.keys(iterableObj).forEach(groupKey => {
        applyColor(iterableObj,groupKey);
    });
};