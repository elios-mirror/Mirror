var sdk = require('elios-protocol');

const sock = sdk("/tmp/elios");

setInterval(() => {
  sock.send("[Clock]: " + new Date().toISOString());
}, 1000);