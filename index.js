const express = require('express');
const { generateUUID, generateShortURL } = require('./helpers/URLHelpers');
const { config } = require('dotenv');
const { retrieveShortenedURLTarget, uploadShortenedURL } = require('./helpers/DBhelpers');

config();

const app = express();
app.listen(process.env.ENGINE_PORT || 8355);

app.post('/short/*', (req, res, next) => {
    const url = req.params[0];

    const entryUUID = generateUUID();
    const entryShortURL = generateShortURL();

    const uploadData = {
        shortenedurl: entryShortURL,
        target: url
    }

    let uploadResult = uploadShortenedURL(uploadData);

    res.send('localhost/' + entryShortURL);

    return next();
});


app.get('/', (req, res, next) => {
    res.send('Hello world!');

    return next();
});

app.get('/:url', async (req, res, next) => {
    const url = req.params.url;

    const result = await retrieveShortenedURLTarget(url);

    if (result.success) {
        res.redirect(result.target);
    } else {
        res.send(result.message);
    }

    return next();
});
