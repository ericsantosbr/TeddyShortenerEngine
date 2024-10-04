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
    }

    try {
        const targetInsertResult = await sql`
            insert into "URL".urls
            (shortenedurl, target, createdat, updatedat, isactive, hits)
            values
            (${uploadData.shortenedurl}, ${uploadData.target}, ${uploadData.createdat}, ${uploadData.updatedat}, ${uploadData.isactive}, ${uploadData.hits})
            returning target
            `;
            
        returnData.target = targetInsertResult[0].target;
        returnData.success = true;
        returnData.code = 201;
    } catch (e) {

    }

    return returnData;
}

module.exports = {
    retrieveShortenedURLTarget,
    uploadShortenedURL
}