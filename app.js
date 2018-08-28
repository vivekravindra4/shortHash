const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

const validator = require('validator');
const shortHash = require('shorthash');
const useragent = require('express-useragent');

const { Url } = require('./models/url');
const mongoose = require('./config/db');
const { urlRouter } = require('./routes/urls');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(morgan('short'));

app.use('/urls',urlRouter);

app.use(useragent.express());

app.get('/',(req,res) => {
    res.send({
        message: "Welcome to the page..."
    });
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})