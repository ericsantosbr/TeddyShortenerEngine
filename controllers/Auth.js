const express = require('express');
const { authenticateUser, registerUser } = require('../helpers/AuthHelpers');
const auth = require('basic-auth');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const userCredentials = auth(req);

    if (typeof userCredentials !== 'undefined') {
        let authenticationResult = await authenticateUser(userCredentials);
        res.json(authenticationResult);
    } else {
        res.status(401);
        res.send('Authentication Failed');
    }

    return next();
});

router.post('/register', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const registerResult = await registerUser({username: username, password: password});

    res.json(registerResult);

    return next();
});

module.exports = {
    router
}