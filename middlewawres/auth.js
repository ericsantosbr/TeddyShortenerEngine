const { retrieveBearerData } = require("../helpers/AuthServerHelpers")

/**
 * Blocking function that validates if user is authenticated or not
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function validateUserAuth (req, res, next) {
    if (typeof req.headers.authorization !== 'undefined') {
        const authorizationBearer = req.headers.authorization.replace('Bearer ', '');
        let bearerSearchResult = await retrieveBearerData(authorizationBearer);

        if (bearerSearchResult.success && bearerSearchResult.data.isValid) {
            req.user = bearerSearchResult.data.userId.email;
            req.userId = bearerSearchResult.data.userId.user_id;
            return next();
        } else {
            res.send('Invalid or expired token');
        }
    } else {
        res.send('Authentication is required for this route');
    }
}

/**
 * Non-blocking function that catches authenticated user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function catchAuthenticatedUserData (req, res, next) {
    if (typeof req.headers.authorization !== 'undefined') {
        const authorizationBearer = req.headers.authorization.replace('Bearer ', '');
        let bearerSearchResult = await retrieveBearerData(authorizationBearer);

        console.debug(bearerSearchResult);

        if (bearerSearchResult.success && bearerSearchResult.data.isValid) {
            req.user = bearerSearchResult.data.userId.email;
            req.userId = bearerSearchResult.data.userId.user_id;
        }
    }
    
    next();
}

module.exports = {
    validateUserAuth,
    catchAuthenticatedUserData
}