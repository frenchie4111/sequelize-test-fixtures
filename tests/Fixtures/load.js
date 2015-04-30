/**
 * This file is licensed under the MIT license
 *
 * Authors:
 *     - Michael Lyons (mdl0394@gmail.com)
 */

(function() {
    'use strict';

    var fixtures = require( '../../' ),
        assert = require( 'chai' ).assert,
        util = require( '../util' );

    it( 'should load fixture', function *() {
        // Initialize fixtures
        fixtures( util.sequelize.models, __dirname );

        var loaded_fixtures = yield fixtures.load( [ 'test_fixture' ] );
        assert.isDefined( loaded_fixtures );
    } );
})();