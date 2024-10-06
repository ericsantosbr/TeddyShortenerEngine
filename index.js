const express = require('express');
const { generateUUID, generateShortURL } = require('./helpers/URLHelpers');
const { config } = require('dotenv');
const { retrieveShortenedURLTarget, uploadShortenedURL, fetchURLsFromAnUser } = require('./helpers/DBhelpers');
const authRouter = require('./controllers/Auth').router;
const bodyParser = require('body-parser');
const { validateUserAuth, catchAuthenticatedUserData } = require('./middlewawres/auth');

config();

const app = express();
app.listen(process.env.ENGINE_PORT || 8355);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRouter);

app.post('/short/*', (req, res, next) => {
    const url = req.params[0];

    const entryUUID = generateUUID();
    const entryShortURL = generateShortURL();

    const uploadData = {
        shortenedurl: entryShortURL,
        target: url
    }

    let uploadResult = uploadShortenedURL(uploadData);

    if (uploadResult.success) {
        res.statusCode = uploadResult.code;
        res.send('localhost/' + uploadResult.target);
    } else {
        res.send(uploadResult.message);
    }

    return next();
});


app.get('/', (req, res, next) => {
    res.send('Hello world!');

    return next();
});

/**
 * TODO: set different IDs for different authenticated users
 */
app.get('/getURLs', validateUserAuth, async (req, res, next) => {
    let returnData;

    let username = req.user;
    
    try {
        let searchResult = await fetchURLsFromAnUser(username);
        if (searchResult.success) {
            returnData = searchResult.fetchedURLs;
        }
    } catch (e) {
        returnData = [];
    }

    res.send(returnData);
});

app.get('/:url', async (req, res, next) => {
    const url = req.params.url;

    const result = await retrieveShortenedURLTarget(url);

    if (result.success) {
        res.redirect(result.target);
    } else {
        res.status(result.code);
        res.send(result.message);
    }

    return next();
});

