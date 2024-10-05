const bcrypt = require('bcrypt');
const dbRegisterUser = require('./DBhelpers').registerUser;

/**
 * Registers an user based on provided data
 * @param {string} data.username
 * @param {string} data.password
 */
async function registerUser (data) {
    let returnData = {
        success: false
    };

    const userData = {
        username: data.username
    };

    await bcrypt.hash(data.password, 12, async (err, hash) => {
        if (err) {
            console.log('bcrypt err');
            console.debug(err);
        } else {
            console.log('password hash: ' + hash);
            userData.password = hash;

            try {
                const registerUserResult = await dbRegisterUser(userData);
                returnData.success = true;
                returnData.data = registerUserResult;
        
            } catch (e) {
                console.debug(e);
            }
        }
    });    

    return returnData;
}

function authenticateUser (data) {

}

module.exports = {
    registerUser,
    authenticateUser
}