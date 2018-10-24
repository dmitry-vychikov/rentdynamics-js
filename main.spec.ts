import { RentDynamicsClient, RentDynamicsClientOptions } from "./main";
import Chance from "chance";
import "whatwg-fetch";


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