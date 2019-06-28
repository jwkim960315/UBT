# Picker
A colour and opacity picker script designed with progressive enhancement in mind.

**Powered by jQuery**

***
### About
This colour picker was written to bridge the gap when browsers don't support form inputs with the 'color' type.

***
### Usage
At it's most basic add a 'data-picker' attribute to a form input with a 'color' type.

```
<input type="color" pattern="#[a-f0-9]{6}" value="#FF00FF" data-picker>
```

***
##### Opacity
My requirments whilst writing this script were to provide a 0-100 number along side the HEX code to represent the opacity of the colour.

I have built this feature into this colour picker. It is enabled by linking the values of two data attributes; 'data-picker-colour' and 'data-picker-opacity'.
We don't use the basic 'data-picker' attribute in this situation.

```
<input type="color" pattern="#[a-f0-9]{6}" value="#FF00FF" data-picker-colour="aGroupName">
<input type="number" min="0" max="100" value="100" data-picker-opacity="aGroupName">
```

***
##### Fallback Method
By default this script replaces the native color picker so the same colour picker is available cross-browser and device.

Within the script itself there is a switch to turn off the colour picker when a native one is available (eg. The browser supports the 'color' form input type.)
Simply set the picker fallback setting to true.

```
$.picker.settings = { fallback: false };
```

***
### Demo
Available here: [Live Demo](http://plugins.ozpital.com/picker)
