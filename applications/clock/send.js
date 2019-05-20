var proto = require('elios-protocol');

const sock = proto("/tmp/elios", true);

setInterval(() => {
  sock.send("[Clock]: " + new Date().toISOString());
}, 1000);