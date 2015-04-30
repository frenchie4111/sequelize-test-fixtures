/**
 * This file is licensed under the MIT license
 *
 * Authors:
 *     - Michael Lyons (mdl0394@gmail.com)
 */

(function() {
    'use strict';

    var Sequelize = require( 'sequelize' ),
        config = require( './config' );

    require( 'mocha-runnable-generators' );
    require( 'mocha-directory' )();

    var initializeDatabase = function() {
        exports.sequelize = new Sequelize(
            config.database.database_name,
            config.database.username,
            config.database.password,
            {
                dialect: "postgres",
                protocol: "postgres",
                host: config.database.url,
                native: false,
                logging: false
            } );

        exports.sequelize.define( 'TestModel', {
            name: Sequelize.STRING
        } );

        exports.sequelize.sync();
    };

    initializeDatabase();
})();