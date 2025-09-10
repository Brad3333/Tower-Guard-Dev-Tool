const admin = require('firebase-admin');
const serviceAccount = require('../service_account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = {
    db: admin.firestore(),
    auth: admin.auth(),
};
