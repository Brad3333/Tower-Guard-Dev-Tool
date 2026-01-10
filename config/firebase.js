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

let db_name = serviceAccount.project_id.split('-').filter((spot) => {
    return /^[a-zA-Z]/.test(spot);
}).map((spot) => {
    return spot.substr(0, 1).toUpperCase() + spot.substr(1, spot.length - 1);
}).join(' ');

module.exports = {
    db: admin.firestore(),
    auth: admin.auth(),
    name: db_name
};
