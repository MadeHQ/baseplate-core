'use strict';

var test = require('ava');
var tempWrite = require('temp-write');
var usageNotes = require('../server/lib/usageNotes.js');

test('usageNotes', function (t) {
    var filepath = tempWrite.sync('this is some test text');
    var filepathMarkdown = tempWrite.sync('this is *some* test **markdown** text');

    /**
     * We don't want to test the actual markdown generation as that's handled
     * by a third-party library, just that we get something sensible back.
     */
    t.is(usageNotes(filepath), 'this is some test text');
    t.not(usageNotes(filepath), '<p>this is some test text</p>');
    t.is(usageNotes(filepathMarkdown, true), '<p>this is <em>some</em> test <strong>markdown</strong> text</p>');
    t.not(usageNotes(filepathMarkdown, true), 'this is *some* test **markdown** text');
});
