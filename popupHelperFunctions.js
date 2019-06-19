const isUrlValid = url => {
    const pattern = new RegExp(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/); // fragment locater

    return pattern.test(url);
};
