'use strict';

var _ = require('lodash');
var color = require('color');

module.exports = function (swatches) {
    return _.map(swatches, function (swatch) {
        let swatchColour = color(swatch.color);
        return _.extend(swatch, {
            hex: swatchColour.hex().toString(),
            rgb: swatchColour.rgb().round().toString(),
            hsl: swatchColour.hsl().round().toString()
        });
    });
};
