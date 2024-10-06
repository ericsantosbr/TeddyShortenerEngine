const { createClient } = require('redis');
const { retrievePassword } = require('./DBhelpers');

/**
 * Creates authentication key for user and uploads it on a database. Ideally, this chunk authenticates using Basic auth, using the return from basic-auth lib
 * @param {string} data.name
 * @param {string} data.password
 */
async function authenticateUser (data) {
    let returnData = { success: false }
    const userPassword = await retrievePassword(data.name);

    const match = await bcrypt.compare(data.pass, userPassword.data);

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

            const bearerKey = data.name + ';' + generatedBearer

            const storedObj = {
                user: data.name,
                expiresAt: new Date(Date.now() + (redisBearerLifetime * 1000)).toISOString(),
                isValid: true
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

async function retrieveBearerData(bearer) {
    let returnData = { success: false };

    const redisUser = process.env.REDIS_USERNAME;
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisHostname = process.env.REDIS_HOSTNAME;
    const redisPort = process.env.REDIS_PORT;

    try {
        const client = await createClient({
            url: 'redis://' + (redisUser ? redisUser + ':' + redisPassword + '@' : '') + redisHostname + ':' + redisPort
        }).connect();

        let bearerData = await client.get(bearer);

        if (typeof bearerData !== 'undefined' && bearerData) {
            returnData.success = true;
            returnData.code = 200;
            returnData.data = JSON.parse(bearerData);
        }
    } catch (e) {
        console.debug(e);
        returnData.message = 'Failed fetching bearer data';
    }

    return returnData;
}

module.exports = {
    retrieveBearerData
}