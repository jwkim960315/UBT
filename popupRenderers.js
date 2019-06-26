const renderUrlInput = target => {
    $(target).replaceWith(`
        <div class="row" id="url-input">
            <div class="input-field col s12">
                <label for="url">Url</label>
                <input id="url" type="text" name="url" required disabled/>
                <span class="helper-text"></span>
            </div>
        </div>
    `);
};

const renderNewGroupInput = target => {
    $(target).after(`
        <div class="row new-group-input">
            <div class="input-field col s12">
                <label for="new-group" class="active">Group Name</label>
                <input id="new-group" type="text" name="groupName" autofocus/>
                <span class="helper-text"></span>
            </div>
        </div>
    `);
};