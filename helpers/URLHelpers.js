var uuidBase62 = require('uuid-base62');

export function generateUUID() {
    const uuid = uuidBase62.v4();

    return uuid;
}