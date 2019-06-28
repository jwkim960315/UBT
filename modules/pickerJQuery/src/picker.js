(function ( $ ) {

    if (!$.picker) {
        $.picker = {};
    };

    //
    //
    //

    $.picker.settings = {
        fallback: false
    };

    //
    //
    //

    $.picker.required = undefined;
    $.picker.elements = undefined;
    $.picker.data     = undefined;
    $.picker.dom      = undefined;
    $.picker.colours  = [
        '#ffff00',
        '#ffcc00',
        '#ff9900',
        '#ff6600',
        '#ff3300',
        '#ff0000',
        '#990000',
        '#993300',
        '#996600',
        '#999900',
        '#99cc00',
        '#99ff00',
        '#33ff00',
        '#33cc00',
        '#339900',
        '#336600',
        '#333300',
        '#330000',
        '#ffff33',
        '#ffcc33',
        '#ff9933',
        '#ff6633',
        '#ff3333',
        '#ff0033',
        '#990033',
        '#993333',
        '#996633',
        '#999933',
        '#99cc33',
        '#99ff33',
        '#33ff33',
        '#33cc33',
        '#339933',
        '#336633',
        '#333333',
        '#330033',
        '#ffff66',
        '#ffcc66',
        '#ff9966',
        '#ff6666',
        '#ff3366',
        '#ff0066',
        '#990066',
        '#993366',
        '#996666',
        '#999966',
        '#99cc66',
        '#99ff66',
        '#33ff66',
        '#33cc66',
        '#339966',
        '#336666',
        '#333366',
        '#330066',
        '#ffff99',
        '#ffcc99',
        '#ff9999',
        '#ff6699',
        '#ff3399',
        '#ff0099',
        '#990099',
        '#993399',
        '#996699',
        '#999999',
        '#99cc99',
        '#99ff99',
        '#33ff99',
        '#33cc99',
        '#339999',
        '#336699',
        '#333399',
        '#330099',
        '#ffffcc',
        '#ffcccc',
        '#ff99cc',
        '#ff66cc',
        '#ff33cc',
        '#ff00cc',
        '#9900cc',
        '#9933cc',
        '#9966cc',
        '#9999cc',
        '#99cccc',
        '#99ffcc',
        '#33ffcc',
        '#33cccc',
        '#3399cc',
        '#3366cc',
        '#3333cc',
        '#3300cc',
        '#ffffff',
        '#ffccff',
        '#ff99ff',
        '#ff66ff',
        '#ff33ff',
        '#ff00ff',
        '#9900ff',
        '#9933ff',
        '#9966ff',
        '#9999ff',
        '#99ccff',
        '#99ffff',
        '#33ffff',
        '#33ccff',
        '#3399ff',
        '#3366ff',
        '#3333ff',
        '#3300ff',
        '#ccffff',
        '#ccccff',
        '#cc99ff',
        '#cc66ff',
        '#cc33ff',
        '#cc00ff',
        '#6600ff',
        '#6633ff',
        '#6666ff',
        '#6699ff',
        '#66ccff',
        '#66ffff',
        '#00ffff',
        '#00ccff',
        '#0099ff',
        '#0066ff',
        '#0033ff',
        '#0000ff',
        '#ccffcc',
        '#cccccc',
        '#cc99cc',
        '#cc66cc',
        '#cc33cc',
        '#cc00cc',
        '#6600cc',
        '#6633cc',
        '#6666cc',
        '#6699cc',
        '#66cccc',
        '#66ffcc',
        '#00ffcc',
        '#00cccc',
        '#0099cc',
        '#0066cc',
        '#0033cc',
        '#0000cc',
        '#ccff99',
        '#cccc99',
        '#cc9999',
        '#cc6699',
        '#cc3399',
        '#cc0099',
        '#660099',
        '#663399',
        '#666699',
        '#669999',
        '#66cc99',
        '#66ff99',
        '#00ff99',
        '#00cc99',
        '#009999',
        '#006699',
        '#003399',
        '#000099',
        '#ccff66',
        '#cccc66',
        '#cc9966',
        '#cc6666',
        '#cc3366',
        '#cc0066',
        '#660066',
        '#663366',
        '#666666',
        '#669966',
        '#66cc66',
        '#66ff66',
        '#00ff66',
        '#00cc66',
        '#009966',
        '#006666',
        '#003366',
        '#000066',
        '#ccff33',
        '#cccc33',
        '#cc9933',
        '#cc6633',
        '#cc3333',
        '#cc0033',
        '#660033',
        '#663333',
        '#666633',
        '#669933',
        '#66cc33',
        '#66ff33',
        '#00ff33',
        '#00cc33',
        '#009933',
        '#006633',
        '#003333',
        '#000033',
        '#ccff00',
        '#cccc00',
        '#cc9900',
        '#cc6600',
        '#cc3300',
        '#cc0000',
        '#660000',
        '#663300',
        '#666600',
        '#669900',
        '#66cc00',
        '#66ff00',
        '#00ff00',
        '#00cc00',
        '#009900',
        '#006600',
        '#003300',
        '#000000'
    ];

    //
    //
    //

    $.picker.fn = {

        fallbackRequired: function() {

            var x = $('<input type="color">');

            if ( x[0].type === 'text' ) {
                $.picker.required = true;
            };

            x.remove();

        },

        getElements: function() {
            $.picker.elements = $('[data-picker], [data-picker-colour], [data-picker-opacity]');
            $.picker.elements.attr('readonly', 'true');
        },

        createDom: function() {

            $.picker.dom                                            = {};
            $.picker.dom.picker                                     = $('<div id="picker"></div>');
            $.picker.dom.picker.bg                                  = $('<div class="picker_bg"></div>').appendTo( $.picker.dom.picker );
            $.picker.dom.picker.container                           = $('<div class="picker_container"></div>').appendTo( $.picker.dom.picker );
            $.picker.dom.picker.container.form                      = $('<form id="picker_form"></form>').appendTo( $.picker.dom.picker.container );
            $.picker.dom.picker.container.form.grid                 = $('<div class="picker_grid"></div>').appendTo( $.picker.dom.picker.container.form );
            $.picker.dom.picker.container.form.opacity              = $('<div class="picker_opacity"></div>').appendTo( $.picker.dom.picker.container.form );
            $.picker.dom.picker.container.form.opacity.label        = $('<label></label>').appendTo( $.picker.dom.picker.container.form.opacity );
            $.picker.dom.picker.container.form.opacity.label.text   = $('<span class="label text">Opacity</span>').appendTo( $.picker.dom.picker.container.form.opacity.label );
            $.picker.dom.picker.container.form.opacity.label.input  = $('<span class="label input text"></span>').appendTo( $.picker.dom.picker.container.form.opacity.label );
            $.picker.dom.picker.container.form.opacity.input        = $('<input type="number" name="picker_opacity" min="0" max="100">').appendTo( $.picker.dom.picker.container.form.opacity.label.input );
            $.picker.dom.picker.container.form.hex                  = $('<div class="picker_hex"></div>').appendTo( $.picker.dom.picker.container.form );
            $.picker.dom.picker.container.form.hex.label            = $('<label></label>').appendTo( $.picker.dom.picker.container.form.hex );
            $.picker.dom.picker.container.form.hex.label.text       = $('<span class="label text">Hex</span>').appendTo( $.picker.dom.picker.container.form.hex.label );
            $.picker.dom.picker.container.form.hex.label.input      = $('<span class="label input text"></span>').appendTo( $.picker.dom.picker.container.form.hex.label );
            $.picker.dom.picker.container.form.hex.input            = $('<input type="text" name="picker_hex" pattern="#[a-f0-9]{6}">').appendTo( $.picker.dom.picker.container.form.hex.label.input );

            $.picker.dom.picker.appendTo('body');

        },

        generateGrid: function() {

            $.picker.colours.map( function( colour ) {

                var button = $('<button></button>').appendTo($.picker.dom.picker.container.form.grid);
                button.attr('name', 'picker_button');
                button.val(colour);
                button.css('background-color', colour);

            });

            $.picker.dom.picker.container.form.grid.buttons = $.picker.dom.picker.container.form.grid.children('button');

        },

        createBinds: function() {

            $.picker.elements
            .on('click', function(event) {

                event.preventDefault();

                var element = $(this);

                $.picker.fn.getData( element );
                $.picker.fn.setValues();
                $.picker.fn.showOpacity();
                $.picker.fn.showPicker();

            });

            $.picker.dom.picker.container.form.grid.buttons
            .on('click', function(event) {

                event.preventDefault();

                var element = $(this);

                $.picker.fn.updateValues( element );
                $.picker.fn.setValues();

            });

            $.picker.dom.picker.container.form.opacity.input
            .on('change keyup', function(event) {

                event.preventDefault();

                var element = $(this);

                $.picker.fn.updateValues( element );
                $.picker.fn.setValues();

            });

            $.picker.dom.picker.container.form.hex.input
            .on('change keyup', function(event) {

                event.preventDefault();

                var element = $(this);

                $.picker.fn.updateValues( element );
                $.picker.fn.setValues();

            });

            $.picker.dom.picker.bg
            .on('click', function(event) {

                event.preventDefault();

                $.picker.fn.hidePicker();
                $.picker.fn.setValues();

            });

        },

        getData: function( element ) {

            if ( !$.picker.data ) {
                $.picker.data = {};
            };

            $.picker.data.current = {};
            $.picker.data.current.group = {};
            $.picker.data.current.group.name = element.data('picker-colour') || element.data('picker-opacity');
            $.picker.data.current.group.elements = {
                colour: undefined,
                opacity: undefined
            };
            $.picker.data.current.colour = undefined;
            $.picker.data.current.opacity = undefined;

            //

            if ( element.data('picker') == '' || element.data('picker-colour') ) {

                $.picker.data.current.group.elements.colour = $(element);
                $.picker.data.current.colour = $.picker.data.current.group.elements.colour.val();
                $.picker.elements.each( function( index, element ) {
                    if ( ($(element).data('picker-opacity') !== undefined) && ($(element).data('picker-opacity') == $.picker.data.current.group.name) ) {
                        $.picker.data.current.group.elements.opacity = $(element);
                        $.picker.data.current.opacity = $.picker.data.current.group.elements.opacity.val();
                    };
                });

            }
            else if ( element.data('picker-opacity') ) {

                $.picker.data.current.group.elements.opacity = $(element);
                $.picker.data.current.opacity = $.picker.data.current.group.elements.opacity.val();
                $.picker.elements.each( function( index, element ) {
                    if ( ($(element).data('picker-colour') !== undefined) && ($(element).data('picker-colour') == $.picker.data.current.group.name) ) {
                        $.picker.data.current.group.elements.colour = $(element);
                        $.picker.data.current.colour = $.picker.data.current.group.elements.colour.val();
                    };
                });

            };

        },

        showOpacity: function() {

            $.picker.dom.picker.container.form.opacity.removeClass('active');

            if ( $.picker.data.current.opacity !== undefined ) {
                $.picker.dom.picker.container.form.opacity.addClass('active');
            };

        },

        updateValues: function( element ) {

            if ( (element.attr('name') == 'picker_button') || (element.attr('name') == 'picker_hex') ) {
                $.picker.data.current.colour = element.val();
            };

            if ( element.attr('name') == 'picker_opacity' ) {
                $.picker.data.current.opacity = element.val();
            };

        },

        setValues: function() {

            $.picker.dom.picker.container.form.hex.input.val( $.picker.data.current.colour );
            $.picker.dom.picker.container.form.opacity.input.val( $.picker.data.current.opacity );

            if ( $.picker.data.current.group.elements.colour !== undefined ) {
                $.picker.data.current.group.elements.colour.val( $.picker.data.current.colour );
            };

            if ( $.picker.data.current.group.elements.opacity !== undefined ) {
                $.picker.data.current.group.elements.opacity.val( $.picker.data.current.opacity );
            };

        },

        showPicker: function() {
            $.picker.dom.picker.addClass('visible');
        },

        hidePicker: function() {
            $.picker.dom.picker.removeClass('visible');
        }

    };

    //
    //
    //

    $.picker.init = function() {

        $.picker.fn.fallbackRequired();

        if ( ($.picker.settings.fallback === false) || ( $.picker.required === true ) ) {

            $.picker.fn.getElements();
            $.picker.fn.createDom();
            $.picker.fn.generateGrid();
            $.picker.fn.createBinds();

        };

    }();

})( jQuery );
