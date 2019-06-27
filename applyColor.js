const applyColor = (iterableObj,groupId) => {
    const rgbColor = tinycolor(iterableObj[groupId].color);
    $(`#card-${groupId}`).css('color',rgbColor.toRgbString());
    $(`#card-${groupId}`).find('.url-text > p').css('color',rgbColor.toRgbString());
    const rgbRightShadow = rgbColor.setAlpha(.14).toRgbString();
    const rgbTopShadow = rgbColor.setAlpha(.12).toRgbString();
    const rgbLeftShadow = rgbColor.setAlpha(.2).toRgbString();
    const boxShadow = `0 2px 2px 0 ${rgbRightShadow}, 0 3px 1px -2px ${rgbTopShadow}, 0 1px 5px 0 ${rgbLeftShadow}`;
    $(`#card-${groupId}`).css('box-shadow',`${boxShadow}`);
};