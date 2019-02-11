import jsSHA from 'jssha';

declare var global: any;

export class Client {

    private helpers: ClientHelpers;
    private options: ClientOptions;
    public _fetch: any;

    constructor(options: ClientOptions) {
        this.options = options;
        this.helpers = new ClientHelpers(options);
        if (typeof global !== "undefined" && global && global.fetch) {
          this._fetch = global.fetch.bind(global);
        } else {
          let crossFetch = require('cross-fetch');
          this._fetch = crossFetch;
        }
    }

    public get(endpoint: string, parameters: object = {}): Promise<any> {
        let queryParams = this.helpers.stringifyParameters(parameters);
        let options: RequestInit = {};
        options.method = 'GET';
        options.headers = this.helpers.getHeaders(endpoint + queryParams);
        let fullUrl = this.helpers.getBaseUrl() + endpoint + queryParams;
        return this._fetch(fullUrl.replace(/\|/g, '%7C'), options).then((result: Response) => {
          return result.ok ? result.json() : result;
        });
    }

    public put(endpoint: string, payload: object): Promise<any> {
      let options: RequestInit = {};
      options.method = 'PUT';
      options.headers = this.helpers.getHeaders(endpoint, payload);
      options.body = JSON.stringify(payload);
      let fullUrl = this.helpers.getBaseUrl() + endpoint;
      return this._fetch(fullUrl, options).then((result: Response) => {
        return result.ok ? result.json() : result;
      });
    }

    public post(endpoint: string, payload: object): Promise<any> {
      let options: RequestInit = {};
      options.method = 'POST';
      options.headers = this.helpers.getHeaders(endpoint, payload);
      options.body = JSON.stringify(payload);
      let fullUrl = this.helpers.getBaseUrl() + endpoint;
      return this._fetch(fullUrl, options).then((result: Response) => {
        return result.ok ? result.json() : result;
      });
    }

    public delete(endpoint: string): Promise<any> {
      let options: RequestInit = {};
      options.method = 'DELETE';
      options.headers = this.helpers.getHeaders(endpoint);
      let fullUrl = this.helpers.getBaseUrl() + endpoint;
      return this._fetch(fullUrl, options).then((result: Response) => {
        return result.ok ? result.json() : result;
      });
    }

    public login(username: string, password: string): Promise<any> {
      let shaObj = new jsSHA('SHA-1', 'TEXT');
      shaObj.update(password);
      password = shaObj.getHash('HEX');
      let endpoint = '/auth/login';
      return this.post(endpoint, { username: username, password: password }).then((result) => {
        this.options.authToken = result.token;
        return result;
      });
    }

    public logout(): Promise<any> {
      let endpoint = '/auth/logout';
      return this.post(endpoint, {authToken: this.options.authToken}).then((res) => {
        this.options.authToken = undefined;
        return res;
      });
    }

}

export class ClientOptions {
    public apiKey?: string = undefined;
    public apiSecretKey?: string = undefined;
    public authToken?: string = undefined;
    public development?: boolean = false;
    public service?: string = undefined;
    public developmentUrl?: string = undefined;
}

export class ClientHelpers {
    private options: ClientOptions;

    constructor(options: ClientOptions) {
        this.options = options;
    }

    public formatPayload(payload: any): any {
        let formattedPayload:any = {};

        if (typeof payload === undefined || payload === null) {
            formattedPayload = null;
        } else if (payload !== Object(payload)) {
            formattedPayload = payload;
        } else if (Array.isArray(payload)) {
            formattedPayload = [];

            for (let i = 0; i < payload.length; i++) {
                formattedPayload[i] = this.formatPayload(payload[i]);
            }
        } else {
            Object.keys(payload).sort().forEach( (k:any, v:any) => {
                if (typeof(payload[k]) == 'object') {
                    formattedPayload[k] = this.formatPayload(payload[k]);
                } else if (typeof (payload[k]) == 'string') {
                    formattedPayload[k] = payload[k].replace(/ /g, '');
                } else {
                    formattedPayload[k] = payload[k]
                }
            }, this);
        }
        return formattedPayload;
    }

    public getBaseUrl() {
        if (this.options.development && this.options.developmentUrl) {
            return this.options.developmentUrl;
        } else if (this.options.development) {
            return 'https://api-dev.rentdynamics.com';
        }
        return 'https://api.rentdynamics.com';
    }

    public getHeaders(endpoint: string, payload?: Object) {
        let headers: any = {};
        if (this.options.apiKey && this.options.apiSecretKey) {
          if (typeof payload !== "undefined") {
                payload = this.formatPayload(payload);
            }
            let timestamp = Date.now();
            let nonce = this.getNonce(timestamp, endpoint, JSON.stringify(payload));
            if (this.options.authToken) {
                headers['Authorization'] = 'TOKEN ' + this.options.authToken;
            }
            headers['x-rd-api-key'] = this.options.apiKey;
            headers['x-rd-api-nonce'] = nonce;
            headers['x-rd-timestamp'] = timestamp.toString();
            headers['Content-Type'] = 'application/json';
            return headers;
        }
        return headers;
    }

    public getNonce(timestamp: number, endpoint: string, payloadStr?: string) {
        if (this.options.apiSecretKey) {
            let nonceStr = timestamp + endpoint;

            if (typeof payloadStr !== 'undefined') {
                nonceStr += payloadStr;
            }
            let shaObj = new jsSHA('SHA-1', 'TEXT');
            shaObj.setHMACKey(this.options.apiSecretKey, 'TEXT');
            shaObj.update(nonceStr);

            return shaObj.getHMAC('HEX');
        } else {
            return '';
      }
    }

    public stringifyParameters(object: any): string {
      let results = [];

      if (object.filters && this.stringifyFilters(object.filters))
        results.push(`filters=${this.stringifyFilters(object.filters)}`);

      if (object.include && object.include.length)
        results.push(`include=${object.include.join(',')}`);

      if (object.exclude && object.exclude.length)
        results.push(`exclude=${object.exclude.join(',')}`);

      if (object.fields && object.fields.length)
        results.push(`fields=${object.fields.join(',')}`);

      if (object.orderBy)
        results.push(`orderBy=${object.orderBy}`);

      if (object.page)
        results.push(`page=${object.page}`);

      if (object.pageSize)
        results.push(`pageSize=${object.pageSize}`);

      if (object.distinct)
        results.push(`distinct=true`);

      return results.join('&') ? `?${results.join('&')}` : '';
    }

    private mapKeyValuePairs(key: string, value: any): string[] {
      let results: string[] = [];

      if (Array.isArray(value)) {
        if (value.length)
          results.push(`${key}__in=${value.join(',')}`)
        return results;
      }

      if (value !== null && typeof value === 'object') {
        for (var filterValKey in value) {
          let result: string[];

          result = this.mapKeyValuePairs(`${key}__${filterValKey}`, value[filterValKey]);

          if (result && result.length)
            results.push(result.join('|'));
        }
        return results;
      }

      if (value !== null && value !== undefined && value !== '') {
        results.push(`${key}=${value}`);
        return results;
      }

      return results;
    }

    private stringifyFilters(filter: {[key: string]: any}): string {
      let results: string[] = [];

      for (var key in filter) {
        let result: string[] = this.mapKeyValuePairs(key, filter[key]);

        if (result && result.length)
          results.push(result.join('|'));
      }

      return results.join('|');
    }

}
