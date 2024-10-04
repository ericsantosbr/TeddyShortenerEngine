const express = require('express');
const { generateUUID, generateShortURL } = require('./helpers/URLHelpers');
const { config } = require('dotenv');

config();

const app = express();
app.listen(process.env.ENGINE_PORT || 8000);

app.post('/short/*', (req, res, next) => {
    const url = req.params[0];

    const entryUUID = generateUUID();
    const entryShortURL = generateShortURL();

    res.send('localhost/' + entryShortURL);

    return next();
});


app.get('/', (req, res, next) => {
    res.send('Hello world!');

    return next();
});