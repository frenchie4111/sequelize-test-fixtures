/**
 * This file is licensed under the MIT license
 *
 * Authors:
 *     - Michael Lyons (mdl0394@gmail.com)
 */

(function() {
    'use strict';

    var _ = require( 'underscore' ),
        q = require( 'q' ),
        path = require( 'path' ),
        assert = require( 'chai' ).assert,
        require_absolute = require( 'require-absolute' );

    /**
     * Initializes the library, will return and expose a load function
     * @param  {[type]} models The sequelize models
     * @param  {[type]} root   The directory where your fixtures are stored
     * @param  {[type]} config Some config
     * @param  {[type]} config.create_config Passed to model.create as the second argument
     */
    module.exports = function( models, root, config ) {
        assert.isDefined( models, 'Fixtures init requires models' );
        assert.isDefined( root, 'Fixtures init requires root' );

        config = _.defaults( config, {
            create_config: {}
        } );

        /**
         * Searches associations of model for associated model name
         * @param keyname String column name of association to look for
         * @param model Object (see _createFixturePromise)s
         * @returns {*}
         * @private
         */
        var _findReferenceModel = function( keyname, model ) {
            var association = _.find( model.associations, function( value ) {
                return ( value.foreignKey === keyname );
            } );

            return association.target;
        };

        /**
         * Creates subqueries for given fixture. These look up the associated values and replace the key
         * @param fixture Object (see _createFixturePromise)
         * @param model Object (see _createFixturePromise)
         * @returns {*|Bluebird.Promise}
         * @private
         */
        var _createSubqueryPromise = function( fixture, model ) {
            var subquery_promises = [];

            _.each( fixture.data, function( value, key ) {
                if( _.isObject( value ) ) {
                    var reference_model = _findReferenceModel( key, model );

                    var subquery = reference_model
                        .find( {
                            where: value
                        } )
                        .then( function( found ) {
                            if( !found ) throw new Error( 'Could not find ' + key );
                            fixture.data[ key ] = found.id;
                        } );

                    subquery_promises.push( subquery );
                }
            } );

            return q.all( subquery_promises )
                .then( function() {
                    return fixture;
                } );
        };

        /**
         * Create a promise for the given fixture object
         * @param fixture Object represents the fixture
         * @param fixture.key String they key for the fixtures values to represent in the return body
         * @param fixture.model String name of model to import fixture with
         * @param fixture.data Data to import
         * @param fixture.data[ keynam ] Object search value for keyname, object gets replaced with associated model search result
         * @param models Object Initialized Sequelize models
         * @returns {Function}
         * @private
         */
        var _createFixturePromise = function( fixture, models ) {
            return function() {
                assert.isObject( fixture, 'Fixture must be object' );
                assert.isDefined( fixture.key, 'Fixture must have key' );
                assert.isDefined( fixture.model, 'Fixture must have model' );
                assert.isDefined( fixture.data, 'Fixture must have data' );

                var model = models[ fixture.model ];

                var promise = _createSubqueryPromise( fixture, model )
                    .then( function() {
                        return model
                            .create( fixture.data, config.create_config );
                            .catch( function( err ) {
                                if( fixture.ignore_duplicate && err.name && err.name === 'SequelizeUniqueConstraintError' ) {
                                    return;
                                } else {
                                    throw err;
                                }
                            } );
                    } );

                return promise;
            };
        };

        /**
         * Loads array of fixtures
         * @param fixtures Array Array of fixutre (see fixture)
         * @param fixture Object represents the fixture
         * @param fixture.key String they key for the fixtures values to represent in the return body
         * @param fixture.model String name of model to import fixture with
         * @param fixture.data Data to import
         * @param fixture.data[ keynam ] Object search value for keyname, object gets replaced with associated model search result
         * @param models Object Initialized Sequelize models
         * @returns {*|Bluebird.Promise}
         * @private
         */
        var _loadFixtures = function( fixtures, models ) {
            var last_promise = null;
            var fixtures_values = {};

            // Chain the promises sequentially
            _.each( fixtures, function( fixture ) {
                if( last_promise ) {
                    last_promise = last_promise.then( _createFixturePromise( fixture, models ) );
                } else {
                    last_promise = _createFixturePromise( fixture, models )();
                }

                last_promise
                    .then( function( created ) {
                        fixtures_values[ fixture.key ] = created;
                    } );
            } );

            return last_promise
                .then( function() {
                    return fixtures_values;
                } );
        };

        var _loadFile = function( filename ) {
            var required = require_absolute( filename );
            return JSON.parse( JSON.stringify( required ) );
        };

        /**
         * Loads fixtures from model
         * @param absolute_paths Array name of file/s to load into database sequentially
         * @param models Initialized Sequelize models
         * @returns {*|Bluebird.Promise}
         * @private
         */
        var _loadFixturesFromFile = function( absolute_paths, models ) {
            var fixtures = [];

            _.each( absolute_paths, function( filename ) {
                var loaded_file = _loadFile( filename );
                fixtures = fixtures.concat( loaded_file );
            } );

            return _loadFixtures( fixtures, models );
        };

        module.exports.load = function( fixture_names ) {
            assert.isDefined( models );
            assert.isDefined( root );

            var absolute_paths = _.map( fixture_names, function( fixture_name ) {
                return path.resolve( root, fixture_name );
            } );

            return _loadFixturesFromFile( absolute_paths, models );
        };
    };

    module.exports.load = function() {
        throw new Error( 'Fixtures not initialized' );
    }

})();
