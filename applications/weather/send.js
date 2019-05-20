var proto = require('elios-protocol');

const sock = proto("/tmp/elios", true);

setInterval(() => {
  sock.send("[Weather]: Snow");
}, 1000);