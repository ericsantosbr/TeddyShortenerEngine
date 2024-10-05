const express = require('express');
const { registerUser } = require('../helpers/AuthHelpers');

const router = express.Router();

router.post('/register', async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const registerResult = await registerUser({username: username, password: password});

    res.json(registerResult);
});

module.exports = {
    router
}