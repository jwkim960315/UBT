const validator = formValues => {
    /*
    * formValues = [{
    *       name: String,
    *       type: String,
    *       value: String
    * }]
    */

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
                        error: true,
                        message: 'url is required'
                    });
                    submit = false;
                } else if (!isUrlValid(formValue.value)) {
                    result.values.push({
                        name: formValue.name,
                        error: true,
                        message: 'invalid url: ex) https://www.google.com'
                    });
                    submit = false;
                } else {
                    result.values.push({
                        name: formValue.name,
                        error: false,
                        message: 'valid url'
                    });

                }

                return;
            case 'text':
                if (formValue.value === '') {
                    result.values.push({
                        name: formValue.name,
                        error: true,
                        message: `${formValue.name} is required`
                    });
                    submit = false;
                } else {
                    result.values.push({
                        name: formValue.name,
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

    /*
    * result = {
    *       submit: true || false,
    *       values: [{
    *           name: String,
    *           error: Boolean,
    *           message: String
    *       }]
    * }
    */
};

// console.log(validator([
//     {
//         name: 'Group Name', type: 'text', value: ''
//     },
//     {
//         name: 'Group Name', type: 'text', value: 'Development'
//     },
//     {
//         name: 'url1', type: 'url', value: 'dbfdsbafaefs'
//     },
//     {
//         name: 'url2', type: 'url', value: ''
//     },
//     {
//         name: 'url3', type: 'url', value: 'https://www.google.com'
//     }
// ]));
//
// console.log(validator([{
//     name: 'Group Name', type: 'text', value: 'Development'
// }]));