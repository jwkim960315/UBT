const diffUrls = (url1,url2) => {
    const shorterUrl = (url1.length > url2.length) ? url2 : url1;
    const longerUrl = (url2.length > url1.length) ? url2 : url1;
    const diffNum = longerUrl.length - shorterUrl.length;

    if (!diffNum) {
        return '';
    }

    let startIndex = shorterUrl.length-1;
    let endIndex = startIndex + diffNum;


    for (i=0;i < shorterUrl.length;i++) {
        if (shorterUrl[i] !== longerUrl[i]) {
            startIndex = i;
            endIndex = startIndex + diffNum;
            break;
        }
    }

    return longerUrl.slice(startIndex,endIndex);
};

const urlExists = (url,data,groupId,urlId) => {

    if (url.slice(-1) !== '/') {
        url+='/';
    }

    if (groupId === 'none' || groupId === undefined || urlId === 'none') {
        return false;
    } else if (urlId === undefined) {
        console.log(urlId);
        return data[groupId].data.some(urlData => urlData.url === url);
    }

    return data[groupId].data.some(urlData => {

        return urlData.url === url && urlData.urlId !== urlId || diffUrls(urlData.url,(url)) === 'www.';
    });
};

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
                        message: 'valid url'
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