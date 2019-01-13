import {Module, Controller} from 'elios-sdk';

var WeatherJS = require('weather.js');

export default class Weather implements Module {
    name: string = '';

    requireVersion: string = '0.0.1';
    showOnStart: boolean = true;

    widget: any;
    it: any;

    constructor(private elios: Controller) {
        console.log('Weather module constructor.');

        this.widget = this.elios.createWidget({
        });
    }

    init() {
        console.log('Weather module loaded.');
    }

    start() {
        console.log('Weather module started.');

        WeatherJS.getCurrent("Barcelona", (current: any) => {
            console.log("currently:");
        }); 

        /* WeatherJS.getForecast("Barcelona", function(forecast: any) {
            console.log("Forecast High in Celsius" + WeatherJS.kelvinToCelsius(forecast.high()));
        }); */

    }

    stop() {
        console.log('Weather module stopped.');
    }
}
