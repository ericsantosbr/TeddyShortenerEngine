const express = require('express');
const { generateUUID, generateShortURL, checkURLMeetsRequirements } = require('./helpers/URLHelpers');
const { config } = require('dotenv');
const { retrieveShortenedURLTarget, uploadShortenedURL, fetchURLsFromAnUser, retrieveShortenedURLData, disableShortenedURL, updateShortenedURL } = require('./helpers/DBhelpers');
const authRouter = require('./controllers/Auth').router;
const bodyParser = require('body-parser');
const { validateUserAuth, catchAuthenticatedUserData } = require('./middlewawres/auth');

config();

const app = express();
app.listen(process.env.ENGINE_PORT || 8355);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRouter);

app.post('/short/*', catchAuthenticatedUserData, (req, res, next) => {
    const url = req.params[0];

    const entryUUID = generateUUID();
    const entryShortURL = generateShortURL();

    const uploadData = {
        shortenedurl: entryShortURL,
        target: url
    }

    if (typeof req.user !== 'undefined') {
        uploadData.email = req.user;
        uploadData.user_id = req.userId;
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

    next();
});

app.delete('/:urlId', validateUserAuth, async (req, res, next) => {
    const urlIdToBeDeleted = req.params.urlId;

    const searchResult = await retrieveShortenedURLData(urlIdToBeDeleted);

    if (typeof searchResult.data !== 'undefined') {
        const urlData = searchResult.data;

        if (urlData.user_id === req.userId) {
            const result = await disableShortenedURL(urlIdToBeDeleted);

            res.status(result.code);
            if (result.success) {
                res.send('URL deleted successfully');
            } else {
                res.send(result.message);
            }
        } else {
            res.status(403);
            res.send('User can\'t remove URL');
        }
    } else {
        res.status(searchResult.code);
        res.send(searchResult.message);
    }

    next();
});


app.patch('/:oldURL/:newURL', validateUserAuth, async (req, res, next) => {
    const userID = req.userId;
    const oldURL = req.params.oldURL;
    const newURL = req.params.newURL;

    if (!checkURLMeetsRequirements(oldURL)) {
        res.send('Current URL given does not meet the requirements');
        return next();
    };
    
    if (!checkURLMeetsRequirements(newURL)) {
        res.send('New URL given does not meet the requirements');
        return next();
        
    };

    const URLData = await retrieveShortenedURLTarget(oldURL);
    if (!URLData.success) {
        res.send('No shortened URL found');
        return next();
    }
    
    let updateResult;

    if (URLData.userID === userID) {
        updateResult = await updateShortenedURL(oldURL, newURL);

        if (updateResult.success) {
            res.json(updateResult);
        } else {
            res.status(updateResult.code);
            typeof updateResult.message !== 'undefined' ? res.send(updateResult.message) : res.send('Failed updating shortened URL');
        }
    } else {
        res.send('Authenticated user cannot change this URL');
        res.status(401);
    }

    next();
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

