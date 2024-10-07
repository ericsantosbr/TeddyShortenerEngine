const postgres = require('postgres');
const { config } = require('dotenv');

config();

const sql = postgres({
    host: process.env.POSTGRES_HOSTNAME,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
});

/**
 * 
 * @param {string} url - The URL being searched
 * @returns {Object}
 */
async function retrieveShortenedURLTarget(url) {
    let returnData = {
        success: false
    };
    try {
        const searchResult = await sql`select target from "URL".urls where shortenedurl = ${url} and isActive = true`;
        
        if (typeof searchResult[0] !== 'undefined') {
            returnData.target = searchResult[0].target;
            returnData.success = true;
            returnData.code = 200;
        } else {
            returnData.message = 'Shortened URL not found';
            returnData.code = 404;
        }
    } catch (e) {
        console.debug(e);
        returnData = e;
    }

    return returnData;
}

async function retrieveShortenedURLData(urlID) {
    let returnData = { success: false };

    try {
        const searchResult = await sql`select target, email, user_id from "URL".urls where id = ${urlID} and isActive = true`;
        
        if (typeof searchResult[0] !== 'undefined') {
            returnData.data = searchResult[0];
            returnData.success = true;
            returnData.code = 200;
        } else {
            returnData.message = 'Shortened URL ID not found';
            returnData.code = 404;
        }
    } catch (e) {
        console.debug(e);
        returnData.code = 500;
        returnData.message = 'Failed fetching data from the database';
    }

    return returnData;
}

/**
 * 
 * @param {string} data.user
 * @param {string} data.target
 * @param {string} data.shortenedurl
 */
async function uploadShortenedURL(data) {
    let returnData = {
        success: false,
    };

    const uploadData = {
        shortenedurl: data.shortenedurl,
        target: data.target,
        createdat: new Date(Date.now()).toISOString(),
        updatedat: new Date(Date.now()).toISOString(),
        isactive: true,
        hits: 0
    };

    try {
        let targetInsertResult;

        // This solutions refers to https://github.com/ericsantosbr/TeddyShortenerEngine/issues/2
        if (typeof data.email !== 'undefined') {
            targetInsertResult = await sql`
                insert into "URL".urls
                (shortenedurl, target, createdat, updatedat, isactive, hits, email, user_id)
                values
                (${uploadData.shortenedurl}, ${uploadData.target}, ${uploadData.createdat}, ${uploadData.updatedat}, ${uploadData.isactive}, ${uploadData.hits}, ${data.email}, ${data.user_id})
                returning target
                `;
        } else {
            targetInsertResult = await sql`
                insert into "URL".urls
                (shortenedurl, target, createdat, updatedat, isactive, hits)
                values
                (${uploadData.shortenedurl}, ${uploadData.target}, ${uploadData.createdat}, ${uploadData.updatedat}, ${uploadData.isactive}, ${uploadData.hits})
                returning target
            `;
        }
        
        if (typeof targetInsertResult[0] !== 'undefined') {
            returnData.target = targetInsertResult[0].target;
            returnData.success = true;
            returnData.code = 201;
        }
    } catch (e) {
        console.debug(e);
    }

    return returnData;
}

async function disableShortenedURL (urlID) {
    let returnData = { success: false };

    try {
        await sql`
        update "URL".urls SET isactive = false where id = ${urlID}
        `;

        returnData.success = true;
        returnData.code = 200;
    } catch (e) {
        console.debug(e);
        returnData.code = 500;
        returnData.message = 'Unable to delete URL from database';
    }

    return returnData;
}

async function fetchURLsFromAnUser (username) {
    let returnData = {
        success: false
    };
    let fetchedURLs;
    try {
        fetchedURLs = await sql`
            select * from "URL".urls where email = ${username}
        `

        if (fetchedURLs.length > 0) {
            returnData.fetchedURLs = fetchedURLs;
            returnData.success = true;
        }
    } catch (e) {
        console.debug(e);
    }

    return returnData;
}

async function registerUser (data) {
    let returnData = { success: false };

    try {
        const registerRestult = await sql`
            insert into "User".users
            (email, updatedat, isactive, password)
            values
            (${data.username}, ${new Date(Date.now()).toISOString()}, true, ${data.password})
            returning email, user_id, users.createdat
        `;

        returnData.success = true;
        returnData.returnedData = registerRestult;
    } catch (e) {
        console.debug(e);
    }

    return returnData;
}

/**
 * Retrieves user password on DB, based on a given username
 * @param {string} username 
 */
async function retrievePassword (username) {
    let returnData = { success: false };

    try {
        const searchResult = await sql`
            select
            (password)
            from "User".users
            where email = ${username}
        `;


        if (searchResult.length > 0) {
            returnData.success = true;
            returnData.data = searchResult[0].password;

        } else {
            return ''
        }
    } catch (e) {
        console.debug(e);
    }

    return returnData;
}
/**
 * Retrieves user data on DB, based on a given username
 * @param {string} username 
 */
async function retrieveUserData (username) {
    let returnData = { success: false };

    try {
        const searchResult = await sql`
            select
            email, user_id, password
            from "User".users
            where email = ${username}
        `;

        if (searchResult.length > 0) {
            returnData.success = true;
            returnData.data = searchResult[0];

        } else {
            return '';
        }
    } catch (e) {
        console.debug(e);
    }

    return returnData;
}

module.exports = {
    retrieveShortenedURLTarget,
    uploadShortenedURL,
    disableShortenedURL,
    fetchURLsFromAnUser,
    registerUser,
    retrievePassword,
    retrieveUserData,
    retrieveShortenedURLData
}