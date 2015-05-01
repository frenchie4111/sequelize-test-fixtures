# sequelize-test-fixtures
Creates sequelize test fixtures
Allows easy fixtures for testing sequelize driven database systems

## Usage

File tree:

- index.js
- fixtures/
  - test_fixture.js
- test.js

index.js

```javascript
var models = // Get your sequelize models somehow
var fixtures = require( 'sequelize-test-fixtures' );
fixtures( modles, 'fixtures/' );
```

fixtures/test_fixture.js

```javascript
module.exports = [
  {
    model: 'TestModel',
    key: 'test_model',
    data: {
      name: 'test'
    }
  }
];
```

test.js

```javascript
var fixture = require( 'fixture' );

fixture.load( 'test_fixture' )
  .then( function( fixtures ) {
    console.log( fixtures );
  } );
```

Output:

```bash
{
  "test_model": {
    "name": "test"
  }
}
```
