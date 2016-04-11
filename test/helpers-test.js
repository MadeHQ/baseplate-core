'use strict';

var test = require('ava');
var hbsHelpers = require('../server/helpers');

test('hbsHelpers#getOrElse', function (t) {
    t.plan(4);
    t.is(hbsHelpers.getOrElse('value', 'default'), 'value');
    t.is(hbsHelpers.getOrElse(false, 'default'), 'default');
    t.is(hbsHelpers.getOrElse(undefined, 'default'), 'default');
    t.is(hbsHelpers.getOrElse('', 'default'), 'default');
});

test('hbsHelpers#prefixClassNames', function (t) {
    t.plan(3);
    t.is(hbsHelpers.prefixClassNames('single', 'prefix-'), 'prefix-single');
    t.is(hbsHelpers.prefixClassNames('this is a list', 'prefix-'), 'prefix-this prefix-is prefix-a prefix-list');
    t.is(hbsHelpers.prefixClassNames('empty', ''), 'empty');
});

test('hbsHelpers#capitalize', function (t) {
    t.plan(3);
    t.is(hbsHelpers.capitalize('capitalize'), 'Capitalize');
    t.is(hbsHelpers.capitalize('Capitalize'), 'Capitalize');
    t.is(hbsHelpers.capitalize('capitalize something longer'), 'Capitalize something longer');
});
