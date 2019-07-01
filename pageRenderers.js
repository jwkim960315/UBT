const renderGroups = (iterableObj,target,urlFormIds,groupId=false) => {
    if (groupId) {
        iterableObj = {
            [groupId]: iterableObj[groupId]
        };
    }

    const iterableLst = tempGroupReorder(iterableObj,Object.keys(iterableObj));

    let groupsHtmlLst = [];

    iterableLst.forEach(groupKey => {
        groupsHtmlLst.push(`
            <div class="row">
                <div class="card" id="card-${groupKey}">
                    <div class="card-content">
                        <div class="row" id="card-header-${groupKey}">
                            <div class="col s12 m11">
                                <span id="${groupKey}" class="card-title">${iterableObj[groupKey].groupName}</span>
                                <div class="created-at-cont"><p class="created-at">${iterableObj[groupKey].createdAt}</p></div>
                            </div>
                            <div class="col s12 m1">
                                <button class='dropdown-trigger btn ' data-target='group-settings${groupKey.slice(5)}'><i class="material-icons">settings</i></button>
                                <ul id='group-settings${groupKey.slice(5)}' class='dropdown-content'>
                                    <li><a id="export-${groupKey}" class="export-group">export to bookmark</a></li>
                                    <li class="divider" tabindex="-1"></li>
                                    <li><a id="change-color-${groupKey}" class="change-color">change color</a></li>
                                    <li class="divider" tabindex="-1"></li>
                                    <li><a id="edit-${groupKey}" class="edit-group-name">edit group name</a></li>
                                    <li class="divider" tabindex="-1"></li>
                                    <li><a id="open-all-links-${groupKey}" class="open-all-links">open all links</a></li>
                                    <li class="divider" tabindex="-1"></li>
                                    <li><a id="delete-${groupKey}" class="delete-group">delete group</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="url-cont" id="url-cont-${groupKey}">
                            ${renderLinks(iterableObj,parseInt(groupKey.slice(5)))}
                        </div>
                        <div id="new-url-data-${groupKey}" class="row new-url-data">
                            <div class="col">
                                <a id="add-link-${groupKey}" class="waves-effect waves-light btn add-link"><i class="material-icons">add</i>New Link</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="colorpicker-placeholder-${groupKey}" class="colorpicker-placeholder"></div>
            </div>
        `);
    });

    const groupsHTML = groupsHtmlLst.join('');

    $(target).replaceWith(groupsHTML);

    Object.keys(iterableObj).forEach(groupKey => {
        applyColor(iterableObj,groupKey);
    });
};

const renderLinks = (groupData,index) => {

    const urlData = groupData[`group${index}`].data;

    if (!Object.keys(urlData).length) {
        return '';
    }

    const urlDataHTML = urlData
        .map((urlDatum,i) => {
            const { url, linkName, iconLink, urlId } = urlDatum;

            return renderUrl(url,linkName,iconLink,urlId);
        });

    return urlDataHTML.join('');
};

const renderUrl = (url,urlName,iconUrl,urlId) => {
    let iconUrlHtml;

    if (!iconUrl || !iconUrl.length || iconUrl.slice(0,4) !== 'http') {
        iconUrlHtml = '<i class="material-icons web-icon">web</i>';
    } else {
        iconUrlHtml = `<img class="link-icon" src="${iconUrl}" width="16" height="16"/>`;
    }

    return `
        <div class="row url-buttons" id="url-data-${urlId}">
            <div class="col s12 m10">
                <a href="${url}" id="url-${urlId}" class="url white url-text btn" target="_blank">
                    ${iconUrlHtml}
                    <p id="name-${urlId}">${urlName}</p>
                </a>
            </div>
            <div class="col s12 m1">
                <button id="url-edit-${urlId}" class="waves-effect waves-light btn url-edit" type="button"><i class="material-icons">edit</i></button>
            </div>
            <div class="col s12 m1">
                <button id="url-delete-${urlId}" class="waves-effect waves-light btn url-delete" type="button"><i class="material-icons">delete</i></button>
            </div>
        </div>
    `;
};

const renderNewGroupForm = (target,groupId) => {
    const name = "";
    const isDisabled = true;

    $(target).append(`
        <div class="card" id="card-${groupId}">
            <div class="card-content">
                ${renderGroupForm(name,groupId,isDisabled)}
                <div class="add-link-placeholder" id="add-link-placeholder-${groupId}"></div>
            </div>
        </div>
    `);

    $(`input[id="${groupId}"]`).focus();
};

const renderGroupForm = (name,groupId,isDisabled) => {
    const disabled = (isDisabled) ? 'disabled' : '';

    return `
        <div class="row">
            <form class="add-group-form" id="new-group-form-${groupId}">
                <div class="input-field col s10 l8">
                    <label for="${groupId}" class="active">Group Name</label>
                    <input id="${groupId}" type="text" class="group-name-input" value="${name}" autofocus>
                    <span class="helper-text"></span>
                </div>
                <div class="col s1 l1">
                    <button id="submit-new-${groupId}" class="waves-effect waves-light btn right group-form-submit ${disabled}" type="submit"><i class="material-icons">save</i></button>
                </div>
            </form>
        </div>
    `;
};

const renderExportGroupForm = (target,groupId,data) => {
    $(target).html(`
            <div class="card" id="card-${groupId}">
                <div class="card-content">
                    <div class="row" id="card-header-${groupId}">
                        <div class="col s12 m11">
                            <span id="${groupId}" class="card-title">${data[groupId].groupName}</span>
                            <div class="created-at-cont"><p class="created-at">${data[groupId].createdAt}</p></div>
                        </div>
                    </div>
                    <form id="export-group-form-${groupId}" class="export-group-form">
                        <div class="url-cont" id="url-cont-${groupId}">
                            ${renderExportUrlForm(data[groupId].data)}
                        </div>
                        <div id="new-url-data-${groupId}" class="row new-url-data">
                            <div class="col">
                                <button id="export-links-${groupId}" type="submit" class="waves-effect waves-light btn export-urls">Export</button>
                            </div>
                            <div class="col">
                                <a id="export-cancel-${groupId}" class="waves-effect waves-light btn export-cancel">Cancel</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
    `);


};

const renderExportUrlForm = urlDataLst => {
    return urlDataLst.map(({ urlId, linkName }) => {
        return `
            <div class="row">
                <div class="col">
                    <p>
                        <label for="checkbox-${urlId}">
                            <input 
                                class="url-checkbox" 
                                type="checkbox" 
                                id="checkbox-${urlId}" 
                                checked
                                name="checkbox-${urlId}" 
                            />
                            <span>${linkName}</span>
                        </label>
                    </p>
                </div>
            </div>
        `;
    }).join('');
};

const renderColorPicker = (target,groupId,hexColor) => {
    $(target).replaceWith(`
        <div id="colorpicker-cont-${groupId}" class="color-picker-package-cont col s12 m2 right">
            <div class="row color-picker-cont" id="color-picker-cont${groupId}">
                <div class="col color-picker">
                    <div id="colorpicker-${groupId}" class="color-picker-input"></div>
                </div>
            </div>
            <div class="row colorpicker-input-cont">
                <input class="colorpicker-input" type="text" id="color-${groupId}" name="color" value="${hexColor}" />
            </div>
            <div class="row color-picker-buttons-cont" id="color-picker-buttons-cont${groupId}">
                <div class="col color-picker-buttons">
                    <div class="row">
                        <div class="col">
                            <button id="save-color-${groupId}" class="btn save-color"><i class="material-icons">save</i></button>
                        </div>
                        <div class="col">
                            <button id="close-colorpicker-${groupId}" class="btn close-colorpicker red accent-2"><i class="material-icons">close</i></button>
                        </div>
                    </div>
                    
                </div>
                
            </div>
        </div>
    `);
};

const renderNewUrlForm = (url,name,urlId,isNameInputActive,isUrlInputActive,shouldRenderDelete,isDisabled) => {
    const nameInputActive = (isNameInputActive) ? 'active' : '';
    const urlInputActive = (isUrlInputActive) ? 'active' : '';
    const disabled = (isDisabled) ? 'disabled' : '';

    return `
        <div id="add-url-form-cont-${urlId}" class="row add-url-form-cont">
            <form class="add-url-form" id="new-url-form-${urlId}">
                <div class="row">
                    <div class="input-field col s4 l4">
                        <label for="urlName${urlId}" class="${nameInputActive}">Name</label>
                        <input id="urlName${urlId}" type="text" class="url-name-input" value="${name}">
                        <span class="helper-text"></span>
                    </div>
                    <div class="input-field col s8 l6">
                      <label for="url${urlId}" class="${urlInputActive}">Url</label>
                      <input id="url${urlId}" type="text" class="url-input" value="${url}" />
                      <span class="helper-text"></span>
                    </div>
                    <div class="col s12 l1 submit-btn-cont">
                        <button id="submit-new-url-${urlId}" class="waves-effect waves-light btn url-form-submit ${disabled}" type="submit"><i class="material-icons">save</i></i></button>
                    </div>
                    ${renderUrlFormDelete(shouldRenderDelete,urlId)}
                </div>
            </form>
        </div>
    `;
};

const renderUrlFormDelete = (shouldRender,urlId) => {
    if (!shouldRender) {
        return '';
    }

    return `
        <div class="col s12 l1">
            <button id="url-form-delete-${urlId}" class="waves-effect waves-light btn url-form-delete" type="button"><i class="material-icons">delete</i></button>
        </div>
    `;
};

const renderPreloader = (target,urlId) => {
    $(target).replaceWith(`
        <div class="row preloader-cont" id="preloader-${urlId}">
            <div class="preloader-wrapper small active">
                <div class="spinner-layer spinner-green-only">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>
            </div>
        </div>
    `);
}