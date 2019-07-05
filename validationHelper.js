const morphFormValues = formValues => {
    return formValues.map(formValue => {
        switch(formValue.name) {
            case 'groupName':
                formValue.name = 'group name';
                formValue.type = 'text';
                return formValue;
            case 'urlName':
                formValue.name = 'url name';
                formValue.type = 'text';
                return formValue;
            case 'url':
                formValue.name = 'url';
                formValue.type = 'url';
                return formValue;
            default:
                return formValue;
        }
    });
};

// validate url w/ chrome bookmark
const isUrlValid = async url => {
    let urlTreeNodeOrErr = await bookmarkCreate({ url });

    if (urlTreeNodeOrErr === 'invalid url') {
        return false;
    } else {
        await bookmarkRemove(urlTreeNodeOrErr.id);
        return true;
    }
};

const validator = formValues => {

    let submit = true;
    let result = {
        values: []
    };

    formValues.forEach(formValue => {
        switch(formValue.type) {
            case 'url':
                if (formValue.value === '') {
                    result.values.push({
                        name: formValue.name,
                        target: formValue.target,
                        error: true,
                        message: 'url is required'
                    });
                    submit = false;
                } else {
                    result.values.push({
                        name: formValue.name,
                        target: formValue.target,
                        error: false,
                        message: ''
                    });
                }
                return;
            case 'text':
                if (formValue.value === '') {
                    result.values.push({
                        name: formValue.name,
                        target: formValue.target,
                        error: true,
                        message: `${formValue.name} is required`
                    });
                    submit = false;
                } else {
                    result.values.push({
                        name: formValue.name,
                        target: formValue.target,
                        error: false,
                        message: `valid ${formValue.name}`
                    });
                }
                return;
            default:
                return;
        }
    });

    result.submit = submit;

    return result;
};

const renderValidationError = (validatedValues,buttonTar) => {
    validatedValues.values.forEach(({ error, target, message }) => {
        if (error) {
            $(target).removeClass('valid');
            $(target).addClass('invalid');
            $(target).next('span').attr('data-error',message);
        } else {
            $(target).removeClass('invalid');
            $(target).addClass('valid');
            $(target).next('span').attr('data-success',message);
        }
    });

    if (validatedValues.submit) {
        $(buttonTar).removeClass('disabled');
    } else {
        $(buttonTar).addClass('disabled');
    }
};

const renderBookmarkableValidation = (error,successHTML,errorHTML) => {
    if (!error) {
        M.toast({ html: successHTML });
    } else {
        M.toast({ html: errorHTML });
    }
};