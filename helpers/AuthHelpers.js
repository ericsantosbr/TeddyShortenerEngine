const bcrypt = require('bcrypt');
const { retrievePassword, retrieveUserData } = require('./DBhelpers');
const dbRegisterUser = require('./DBhelpers').registerUser;
const { createClient } = require('redis');
const dotenvConfig = require('dotenv').config;
const uuidBase62 = require('uuid-base62');

dotenvConfig();

/**
 * Registers an user based on provided data
 * @param {string} data.username
 * @param {string} data.password
 */
async function registerUser (data) {
    let returnData = {
        success: false
    };

    const hash = bcrypt.hashSync(data.password, 12);

    const userData = {
        username: data.username,
        password: hash
    };

    try {
        const registerUserResult = await dbRegisterUser(userData);

        if (registerUserResult.success) {
            returnData.success = true;
            returnData.data = registerUserResult.returnData;
        } else if (registerUser.message){
            returnData.message = registerUserResult.message;
        }
        
    } catch (e) {
        console.debug(e);
    }

    return returnData;
}

/**
 * Creates authentication key for user and uploads it on a database. Ideally, this chunk authenticates using Basic auth, using the return from basic-auth lib
 * @param {string} data.name
 * @param {string} data.password
 */
async function authenticateUser (data) {
    let returnData = { success: false }
    const userData = await retrieveUserData(data.name);

    const match = await bcrypt.compare(data.pass, userData.data.password);

    if (match) {
        const redisUser = process.env.REDIS_USERNAME;
        const redisPassword = process.env.REDIS_PASSWORD;
        const redisHostname = process.env.REDIS_HOSTNAME;
        const redisPort = process.env.REDIS_PORT;
        const redisBearerLifetime = process.env.REDIS_BEARER_TOKEN_LIFETIME;

        try {
            const client = await createClient({
                url: 'redis://' + (redisUser ? redisUser + ':' + redisPassword + '@' : '') + redisHostname + ':' + redisPort
            }).connect();

            const generatedBearer = uuidBase62.v4();

            const bearerKey = generatedBearer;

            const storedObj = {
                user: userData.data.name,
                expiresAt: new Date(Date.now() + (redisBearerLifetime * 1000)).toISOString(),
                isValid: true,
                userId: userData.data
            };

            client.set(bearerKey, JSON.stringify(storedObj));
            client.expire(bearerKey, redisBearerLifetime);

            returnData.success = true;
            returnData.bearer = generatedBearer;
        } catch (e) {
            console.debug(e);
            returnData.message = 'Unable to create bearer token';
        }
        
    } else {
        returnData.message = 'Authentication Failed';
    }

    return returnData;
}

module.exports = {
    registerUser,
    authenticateUser
}