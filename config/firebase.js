const admin = require('firebase-admin');
const serviceAccount = require('../tower-guard-1c483-firebase-adminsdk-fbsvc-60f5004342.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = {
    db: admin.firestore(),
    auth: admin.auth(),
};
