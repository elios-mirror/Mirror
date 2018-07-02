import {injectable} from "inversify";
import CookieService from "../utils/cookie.service";
import axios, {AxiosPromise, AxiosResponse} from 'axios';
import ConfigService from "../utils/config.service";

const https = require('https');

/**
 * Api core of App
 */
@injectable()
export default class ApiCoreService {
    constructor(private configService: ConfigService, private cookieService: CookieService) {
        axios.defaults.baseURL = this.configService.get().api.address;
        axios.defaults.timeout = 4000;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
    }

    async request<T>(method: string, url: string, params: any = {}): Promise<T> {
        let response: AxiosResponse<T>;
        const headers: any = {};
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        if (this.cookieService.has('access_token')) {
            headers['Authorization'] = 'Bearer ' + this.cookieService.get('access_token');
        }

        console.log('request to ' + url);

        response = await axios.request<T>({
            url: url,
            method: method,
            data: params,
            headers: headers,
            httpsAgent: agent
        });

        console.log('response of ' + url + ' --- ' + response.status);

        return response.data;
    }

    get<T>(url: string, params: any = {}) {
        return this.request<T>('get', url, params);
    }

    post<T>(url: string, params: any = {}) {
        return this.request<T>('post', url, params);
    }
}