/**
 * This file is licensed under the MIT license
 *
 * Authors:
 *     - Michael Lyons (mdl0394@gmail.com)
 */

(function() {
    'use strict';

    var fixtures = require( '../../' ),
        assert = require( 'chai' ).assert;

    it( 'should load fixture', function *() {
        var loaded_fixtures = yield fixtures( 'test' );
        assert.isDefined( loaded_fixtures );
    } );
})();