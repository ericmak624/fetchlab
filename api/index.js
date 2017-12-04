const express = require('express');
const path = require('path');
const app = express();
const middleware = require('./middleware');
const routes = require('./routes');
const port = process.env.PORT || 8000;

app.use(middleware.bodyParser.json());
app.use(middleware.bodyParser.urlencoded({ extended: true }));
app.use(middleware.morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev'));

app.use('/api/rating', routes.rating);

app.listen(port, () => console.log('Ready to accept connections on port', port));