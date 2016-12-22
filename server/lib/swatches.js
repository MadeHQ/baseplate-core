'use strict';

var map = require('lodash/map');
var assign = require('lodash/assign');
var color = require('color');

function expandColor(swatch) {
    var swatchColor = color(swatch.color);
    return assign({}, swatch, {
        hex: swatchColor.hex().toString(),
        rgb: swatchColor.rgb().round().toString(),
        hsl: swatchColor.hsl().round().toString()
    });
}

module.exports = function (swatches) {
    return map(swatches, function (swatch) {
        var extended = expandColor(swatch);

        if (extended.tints && extended.tints.length > 0) {
            extended.tints = extended.tints.map(expandColor);
        }

        return extended;
    });
};
