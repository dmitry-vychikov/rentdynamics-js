import { RentDynamicsClient, RentDynamicsClientOptions, RentDynamicsClientHelpers } from "./main";
import Chance from "chance";
import jsSHA from "jssha";
import "whatwg-fetch";


describe('GET calls', () => {

  test('get calls fetch with method GET', () => {
      // setup mock for fetch to avoid actual calls
      const fakeFetch = jest.fn();
      window.fetch = fakeFetch;

      // setup and configure chance
      let chance = new Chance();

      // setup options for client
      let options = new RentDynamicsClientOptions();
      options.apiKey = chance.string();
      options.apiSecretKey = chance.string();

      // arrange
      let rdClient = new RentDynamicsClient(options);
      let endpoint = chance.string();

      // act
      let response = rdClient.get(endpoint);

      // assert
      expect(fakeFetch.mock.calls.length).toBe(1);

      /*
      // The mock function is called twice
  expect(mockCallback.mock.calls.length).toBe(2);

  // The first argument of the first call to the function was 0
  expect(mockCallback.mock.calls[0][0]).toBe(0);

  // The first argument of the second call to the function was 1
  expect(mockCallback.mock.calls[1][0]).toBe(1);

  // The return value of the first call to the function was 42
  expect(mockCallback.mock.results[0].value).toBe(42);
      */
  });

});


describe('formatPayload', () => {

  test('should alphabetize items in dictionary', () => {
    // arrange
    let payload = { orange: 1, blue: 2 };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.formatPayload(payload);

    // assert
    expect(Object.keys(result)[0]).toEqual('blue');
  });

  test('should alphabetize nested items', () => {
    // arrange
    let payload = { orange: 1, blue: { red: 21, pink: 22 } };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.formatPayload(payload);

    // assert
    expect(Object.keys(result['blue'])[0]).toEqual('pink');
  });

  test('should alphabetize keys even when their values are null', () => {
    // arrange
    let payload = { orange: null, blue: null };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.formatPayload(payload);

    // assert
    expect(Object.keys(result)[0]).toEqual('blue');
  });

  test('should remove spaces from formatted items', () => {
    // arrange
    let payload = { orange: 1, blue: { red: "a  f  g", pink: "b  t  g" } };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.formatPayload(payload);

    // assert
    expect(result['blue']['pink']).toEqual('btg');
  });

  test('should pass with Array inside of object', () => {
    // arrange
    let payload = {
      orange: 5,
      blue: [
        { red: 6, pink: 7 },
        { green: 3, blue: 4 }
      ]
    };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.formatPayload(payload);

    // assert
    expect(Object.keys(result['blue'][0])[0]).toEqual('pink');
  });

  test('should pass with Array of primitive values', () => {
    // arrange
    let payload = {
      orange: 5,
      blue: [1, 5, 2]
    };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.formatPayload(payload);

    // assert
    expect(result['orange']).toEqual(5);
    expect(result['blue'][0]).toEqual(1);
    expect(result['blue'][1]).toEqual(5);
    expect(result['blue'][2]).toEqual(2);
  });

});


describe('getNonce', () => {

  test('should handle arrays of primitive values', () => {
    // arrange
    let payload = {
      orange: 5,
      blue: [1, 5, 2]
    };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);
    let formattedPayload = JSON.stringify(clientHelpers.formatPayload(payload));
    let timestamp = Date.now();
    let url = '/someUrlolz';
    let nonce = timestamp + url + formattedPayload;
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(options.apiSecretKey, 'TEXT');
    shaObj.update(nonce);
    let hashedNonce = shaObj.getHMAC('HEX');

    // act
    let result = clientHelpers.getNonce(timestamp, url, formattedPayload);

    // assert
    expect(hashedNonce).toEqual(result);
  });

  test('should return hash of timestamp, url, payload and secret key', () => {
    // arrange
    let payload = {
      orange: 1,
      blue: {
        red: "a  f  g",
        pink: "b  t  g"
      }
    };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);
    let formattedPayload = JSON.stringify(clientHelpers.formatPayload(payload));
    let timestamp = Date.now();
    let url = '/someUrlolz';
    let nonce = timestamp + url + formattedPayload;
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(options.apiSecretKey, 'TEXT');
    shaObj.update(nonce);
    let hashedNonce = shaObj.getHMAC('HEX');

    // act
    let result = clientHelpers.getNonce(timestamp, url, formattedPayload);

    // assert
    expect(hashedNonce).toEqual(result);
  });

  test('should return hash of timestamp, url and secret key if no payload exists', () => {
    // arrange
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);
    let timestamp = Date.now();
    let url = '/someUrlolz';
    let nonce = timestamp + url;
    var shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(options.apiSecretKey, 'TEXT');
    shaObj.update(nonce);
    let hashedNonce = shaObj.getHMAC('HEX');

    // act
    let result = clientHelpers.getNonce(timestamp, url);

    // assert
    expect(hashedNonce).toEqual(result);
  });

});


describe('getHeaders', () => {

  test('should return authorization header if there is an authToken', () => {
    // arrange
    let url = '/someUrlolz';
    let options = new RentDynamicsClientOptions();
    options.authToken = 'akK9KL2';
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.getHeaders(url);

    // assert
    expect(result.get('Authorization')).toBeDefined();
  });

  test('should not return authorization header if there isnt an authToken', () => {
    // arrange
    let url = '/someUrlolz';
    let options = new RentDynamicsClientOptions();
    options.authToken = '';
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.getHeaders(url);
    // assert
    expect(result.get('Authorization')).toBeNull();
  });

  test('should return x-rd-api-key header', () => {
    // arrange
    let url = '/someUrlolz';
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.getHeaders(url);

    // assert
    expect(result.get('x-rd-api-key')).toBeDefined();
  });

  test('should return x-rd-api-nonce header', () => {
    // arrange
    let url = '/someUrlolz';
    let payload = { orange: 1, blue: 2 };
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.getHeaders(url, payload);

    // assert
    expect(result.get('x-rd-api-nonce')).toBeDefined();
  });

  test('should return x-rd-timestamp header', () => {
    // arrange
    let url = '/someUrlolz';
    let options = new RentDynamicsClientOptions();
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.getHeaders(url);

    // assert
    expect(result.get('x-rd-timestamp')).toBeDefined();
  });

});


describe('getBaseUrl', () => {

  test('should return correct url in development', () => {
    // arrange
    let options = new RentDynamicsClientOptions();
    options.development = true;
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.getBaseUrl();

    // assert
    expect(result).toEqual('https://api-dev.rentdynamics.com');
  });

  test('should return correct url in production', () => {
    // arrange
    let options = new RentDynamicsClientOptions();
    options.development = false;
    let clientHelpers = new RentDynamicsClientHelpers(options);

    // act
    let result = clientHelpers.getBaseUrl();

    // assert
    expect(result).toEqual('https://api.rentdynamics.com');
  });

});
