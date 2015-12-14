/**
 * Sets up a simple node.js server to serve the Simple Climate Model files.
 */
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(80);
