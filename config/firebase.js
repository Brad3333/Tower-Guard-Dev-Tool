const admin = require('firebase-admin');
const path = require('path');

// Load .env first
require('dotenv').config();

// Get the Firebase service account path from the environment variable
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount = null;

if (!serviceAccountPath) {
    serviceAccount = require('../service_account.json');
}
else {
    serviceAccount = require(path.resolve(serviceAccountPath));
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = {
    db: admin.firestore(),
    auth: admin.auth(),
};
