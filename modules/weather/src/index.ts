import { Module, Controller } from 'elios-sdk';

var WeatherJS = require('weather.js');

export default class Weather implements Module {
    name: string = '';
    installId: string = '';

    requireVersion: string = '0.0.1';
    showOnStart: boolean = true;

    widget: any;
    it: any;

    constructor(private elios: Controller) {
        console.log('Weather module constructor.');
    }

    init() {
        console.log('Weather module loaded.');
    }

    start() {


        this.widget = this.elios.createWidget({
            id: this.installId
        });

        this.widget.html.next('toto')

        console.log('Weather module started.');

        // WeatherJS.setApiKey("2b2e97e8ff9392650a58cbc8c9e1adae");

        // WeatherJS.getForecast("Kansas City", function (forecast: any) {
        //     console.log("forecast high: " + forecast.high());
        //     console.log("forecast low: " + forecast.low());
        // });

        /* WeatherJS.getForecast("Barcelona", function(forecast: any) {
            console.log("Forecast High in Celsius" + WeatherJS.kelvinToCelsius(forecast.high()));
        }); */

    }

    stop() {
        console.log('Weather module stopped.');
    }
}
