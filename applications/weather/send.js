var addon = require('elios-protocol');

const sock = addon("/mirrorsocket.sock");

setInterval(() => {
  sock.send("[Weather]: Snow");
}, 1000);