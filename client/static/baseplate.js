/* eslint-env browser */
(function (document) {
    'use strict';

    var cutsMustard = (
        'addEventListener' in window &&
        'forEach' in Array.prototype
    );

    if (!cutsMustard) {
        return;
    }

    function hasClass(el, cl) {
        var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
        return Boolean(el.className.match(regex));
    }

    function addClass(el, cl) {
        el.className += ' ' + cl;
    }

    function removeClass(el, cl) {
        var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
        el.className = el.className.replace(regex, ' ');
    }

    function toggleClass(el, cl) {
        if (hasClass(el, cl)) {
            removeClass(el, cl);
        } else {
            addClass(el, cl);
        }
    }

    function iconGrid() {
        var iconGrids = document.querySelectorAll('.js-baseplate-icon-grid');
        if (iconGrids.length) {
            [].forEach.call(iconGrids, function (grid) {
                var iconSpriteId = grid.getAttribute('data-icon-sprite');
                var iconSprite = document.getElementById(iconSpriteId);

                if (iconSprite) {
                    var iconList = [].map.call(iconSprite.querySelectorAll('symbol'), function (symbol) {
                        return symbol.id;
                    });

                    var html = iconList.map(function (id) {
                        return '<svg class="o-icon o-icon--offset"><use xlink:href="#' + id + '"/></use></svg>';
                    }).join('');

                    grid.innerHTML = html;
                }
            });
        }
    }

    function toggleSource() {
        var buttons = document.querySelectorAll('.js-baseplate-toggle-source');
        if (buttons.length) {
            [].forEach.call(buttons, function(button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    toggleClass(button.parentNode, 'sg-is-toggled');
                });
            });
        }
    }

    function sectionNavigtion() {
        var select = document.getElementById('sg-section-switcher');
        if (select) {
            select.addEventListener('change', function () {
                var val = this.value;
                if (val) {
                    window.location = val;
                }
            });
        }
    }

    iconGrid();
    toggleSource();
    sectionNavigtion();
})(document);
