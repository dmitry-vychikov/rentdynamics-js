import jsSHA from "jssha";


export class RentDynamicsClient {

    private helpers: RentDynamicsClientHelpers;
    private options: RentDynamicsClientOptions;

    constructor(options: RentDynamicsClientOptions){
        this.options = options;
        this.helpers = new RentDynamicsClientHelpers(options);
    }

    public get(endpoint: string): Promise<Response> {
        let options:RequestInit = {};
        options.method = "GET";
        options.headers = this.helpers.getHeaders(endpoint);
        let fullUrl = this.helpers.getBaseUrl() + endpoint;
        return fetch(fullUrl, options);
    }
}

export class RentDynamicsClientOptions {
    public apiKey: string = '';
    public apiSecretKey: string = '';
    public authToken: string = '';
    public development: boolean = false;
    public service: string = '';
}

export class RentDynamicsClientHelpers {
    private options: RentDynamicsClientOptions;

    constructor(options: RentDynamicsClientOptions){
        this.options = options;
    }

    public formatPayload(payload: any): any {
        let formattedPayload:any = {};

        if (typeof payload === undefined || payload === null) {
            formattedPayload = null;
        } else if (payload !== Object(payload)) {
            formattedPayload = payload;
        }
        else if (Array.isArray(payload)) {
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

    public getBaseUrl(){
        if(this.options.development){
            return 'https://api-dev.rentdynamics.com';
        }
        return 'https://api.rentdynamics.com';
    }

    public getHeaders(endpoint: string, payload?: Object){
        let headers = new Headers();
        if (typeof payload !== "undefined") {
            payload = this.formatPayload(payload);
        }
        let timestamp = Date.now();
        let nonce = this.getNonce(timestamp, endpoint, JSON.stringify(payload));
        if(this.options.authToken){
            headers.append('Authorization', 'TOKEN ' + this.options.authToken);
        }
        headers.append('x-rd-api-key', this.options.apiKey);
        headers.append('x-rd-api-nonce', nonce);
        headers.append('x-rd-timestamp', timestamp.toString());
        return headers;
    }

    public getNonce(timestamp: number, endpoint: string, payloadStr?: string) {
        let nonceStr = timestamp + endpoint;

        if (typeof payloadStr !== 'undefined') {
            nonceStr += payloadStr;
        }
        let shaObj = new jsSHA('SHA-1', 'TEXT');
        shaObj.setHMACKey(this.options.apiSecretKey, 'TEXT');
        shaObj.update(nonceStr);

        return shaObj.getHMAC('HEX');
    }
}