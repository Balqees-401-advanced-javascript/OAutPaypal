'use strict';

require('dotenv').config();

// Start the web server
require('./auth-server/src/app.js').start(process.env.PORT);
