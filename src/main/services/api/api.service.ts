import { injectable } from "inversify";
import CookieService from "../utils/cookie.service";
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import ConfigService from "../utils/config.service";
import AccountService, { AccountDTO } from "./account/account.service";

const https = require('https');

/**
 * Api core of App
 */
@injectable()
export default class ApiService {
    constructor(private configService: ConfigService, private cookieService: CookieService) {
        axios.defaults.baseURL = this.configService.get().api.address;
        axios.defaults.timeout = 4000;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
    }

    async request<T>(method: string, url: string, params: any = {}, mirror: boolean): Promise<T> {
        let response: AxiosResponse<T>;
        const headers: any = {};
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        if (mirror) {
            if (this.cookieService.has('access_token')) {
                headers['Authorization'] = 'Bearer ' + this.cookieService.get('access_token');
            }
        } else {
            if (this.cookieService.has('connected') && this.cookieService.has('accounts')) {
                const userConnectedId = this.cookieService.get('connected');
                const accounts = this.cookieService.get('accounts');
                const account = accounts[userConnectedId];
                if (account) {
                    headers['Authorization'] = 'Bearer ' + account.access_token;
                }
            }
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

    get<T>(url: string, params: any = {}, mirror = false) {
        return this.request<T>('get', url, params, mirror);
    }

    post<T>(url: string, params: any = {}, mirror = false) {
        return this.request<T>('post', url, params, mirror);
    }
}