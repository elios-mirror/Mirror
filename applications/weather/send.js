let elios_sdk = require('elios-sdk')

const sdk = new elios_sdk.default();

let widget = sdk.createWidget();

setInterval(() => {
  widget.html("[Weather]: Snow");
}, 1000);