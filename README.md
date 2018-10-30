
# Rent Dynamics JS

[![Circle CI Badge][circleci-badge]][circleci-link]
[![codecov][codecov-image]][codecov-link]
[![Dependency Status][dependency-image]][dependency-link]
[![Dev Dependency Status][dev-dependency-image]][dev-dependency-link]
[![Peer Dependency Status][peer-dependency-image]][peer-dependency-link]
[![NPM Version][npm-version-image]][npm-version-link]
[![MIT License][npm-license-image]][npm-license-link]


## CDN
Include jsSHA and our CDN
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsSHA/2.3.1/sha.js"></script>
<script src="https://cdn.rentdynamics.com/rentdynamics.latest.js"></script>
```
```js
var options = {
  apiKey: '<insert-key-here>',
  apiSecretKey: '<insert-secret-key-here>'
};
var rdClient = new RentDynamics.Client(options);
rdClient.login('<username>', '<password>').then(function(result) {
  ...
});
// Then you can make api calls
rdClient.get('/data').then(function(result) {
  ...
});
```


## NPM
Install with [npm](https://www.npmjs.com/): `npm install rentdynamics`
```ts
import { Client } from 'rentdynamics';

let options = {
  apiKey: '<insert-key-here>',
  apiSecretKey: '<insert-secret-key-here>'
};
let rdClient = new Client(options);
rdClient.login('<username>', '<password>').then((result: object) => {
  ...
});
// Then you can make api calls
rdClient.get('/data').then((result: array | object) => {
  ...
});
```


## Values
### ClientOptions
 * `apiKey: string (default is '')`
 * `apiSecretKey: string (default is '')`
 * `authToken: string (default is '')`
 * `development: boolean (default is false)`
 * `service: string (default is '')`

### Client (requires a ClientOptions to be passed in)
 * `get(endpoint: string): Promise<any>`
 * `put(endpoint: string, payload: object): Promise<any>`
 * `post(endpoint: string, payload: object): Promise<any>`
 * `delete(endpoint: string): Promise<any>`
 * `login(username: string, password: string): Promise<any>`


## Testing
 * `npm test` > Runs all the tests and checks the code coverage.


[circleci-badge]: https://circleci.com/gh/RentDynamics/rentdynamics-js/tree/master.svg?style=shield&circle-token=8ca42b3ae23f8df7f754457b3daae599f716f85c
[circleci-link]: https://circleci.com/gh/RentDynamics/rentdynamics-js
[codecov-image]: https://codecov.io/gh/RentDynamics/rentdynamics-js/branch/master/graph/badge.svg
[codecov-link]: https://codecov.io/gh/RentDynamics/rentdynamics-js
[dependency-image]: https://david-dm.org/RentDynamics/rentdynamics-js/status.svg
[dependency-link]: https://david-dm.org/RentDynamics/rentdynamics-js
[dev-dependency-image]: https://david-dm.org/RentDynamics/rentdynamics-js/dev-status.svg
[dev-dependency-link]: https://david-dm.org/RentDynamics/rentdynamics-js?type=dev
[peer-dependency-image]: https://david-dm.org/RentDynamics/rentdynamics-js/peer-status.svg
[peer-dependency-link]: https://david-dm.org/RentDynamics/rentdynamics-js?type=peer
[npm-version-image]: https://img.shields.io/npm/v/rentdynamics.svg
[npm-version-link]: https://www.npmjs.com/package/rentdynamics
[npm-license-image]: https://img.shields.io/npm/l/rentdynamics.svg
[npm-license-link]: LICENSE
