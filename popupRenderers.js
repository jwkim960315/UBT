const renderNewGroupInput = target => {
    $(target).after(`
        <div class="row new-group-input">
            <div class="input-field col s12">
                <label for="new-group" class="active white-text">Group Name</label>
                <input id="new-group" type="text" name="groupName" class="white-text" autofocus/>
                <span class="helper-text"></span>
            </div>
        </div>
    `);
};