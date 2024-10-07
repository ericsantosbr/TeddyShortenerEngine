const { config } = require('dotenv');
var uuidBase62 = require('uuid-base62');

config();

function generateUUID() {
    const uuid = uuidBase62.v4();

    return uuid;
}

function generateShortURL() {
    const characterLimit = process.env.ENGINE_SHORT_URL_CHARACTERS;
    const alphabet = process.env.ENGINE_ALPHABET;
    let outputURL = '';
    
    for (let i = 0; i < characterLimit; i++) {
        outputURL = outputURL + alphabet[Math.floor(Math.random() * (alphabet.length - 1))];
    }

    return outputURL;
}

function checkURLMeetsRequirements(url) {
    const characterLimit = Number(process.env.ENGINE_SHORT_URL_CHARACTERS);
    const alphabet = process.env.ENGINE_ALPHABET;
    let urlMeetsRequirements = true;

    if (url.length !== characterLimit) urlMeetsRequirements = false;

    for (let i = 0; i < url.length && urlMeetsRequirements === true; i++) {
        if (!alphabet.includes(url[i])) {            
            urlMeetsRequirements = false;
        }
    }

    return urlMeetsRequirements;
}

module.exports = {
    generateUUID,
    generateShortURL,
    checkURLMeetsRequirements
}