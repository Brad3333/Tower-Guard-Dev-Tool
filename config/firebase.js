const admin = require('firebase-admin');
require('dotenv').config();
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = {
    db: admin.firestore(),
    auth: admin.auth(),
};
