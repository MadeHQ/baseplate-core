'use strict';

var test = require('ava');
var collections = require('../server/lib/collections.js');

test('collections#pages', t => {
    let noop = () => {};

    const templates = {
        'template-1.html': noop,
        'template-2.html': noop
    };

    t.deepEqual(collections.pages(templates), [
        {
            id: 'template-1',
            label: 'Template 1',
            content: undefined
        },
        {
            id: 'template-2',
            label: 'Template 2',
            content: undefined
        }
    ]);
});

test('collections#patterns', t => {
    let noop = () => {};

    const templates = {
        'base/pattern-1.html': noop,
        'modules/pattern-2.html': noop
    };

    t.deepEqual(collections.patterns(templates), {
        base: [{
            id: 'pattern-1',
            label: 'Pattern 1',
            group: 'base',
            usage: false,
            rawTemplate: false,
            content: undefined
        }],
        modules: [{
            id: 'pattern-2',
            label: 'Pattern 2',
            group: 'modules',
            usage: false,
            rawTemplate: false,
            content: undefined
        }]
    });
});

test('collections#labelFromSlug', t => {
    t.is(collections._.labelFromSlug('this-is-a-label'), 'This is a label');
    t.not(collections._.labelFromSlug('this-is-a-label'), 'this is a label');
    t.not(collections._.labelFromSlug('this-is-a-label'), 'This-is-a-label');
});
