'use strict';

var test = require('ava');
var swatches = require('../server/lib/swatches.js');

test('swatches', function (t) {
    var data = swatches([
        {
            label: 'Hex source',
            color: '#f00'
        },
        {
            label: 'Named source',
            color: 'green'
        },
        {
            label: 'RGB source',
            color: 'rgb(0,0,0)'
        }
    ]);

    t.is(data[0].label, 'Hex source');
    t.is(data[0].hex, '#FF0000');
    t.is(data[0].rgb, 'rgb(255, 0, 0)');
    t.is(data[0].hsl, 'hsl(0, 100%, 50%)');

    t.is(data[1].label, 'Named source');
    t.is(data[1].hex, '#008000');
    t.is(data[1].rgb, 'rgb(0, 128, 0)');
    t.is(data[1].hsl, 'hsl(120, 100%, 25%)');

    t.is(data[2].label, 'RGB source');
    t.is(data[2].hex, '#000000');
    t.is(data[2].rgb, 'rgb(0, 0, 0)');
    t.is(data[2].hsl, 'hsl(0, 0%, 0%)');
});
