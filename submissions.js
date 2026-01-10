const { db } = require('../config/firebase');
const chalk = require('chalk');

async function getSubmissions() {
    
    const submissionsSnapshot = await db.collection('submissions').where('email', '==', email).get();
    const userData = userSnapshot.docs[0].data()
    console.table(userData);
}

module.exports = displayUsers;
