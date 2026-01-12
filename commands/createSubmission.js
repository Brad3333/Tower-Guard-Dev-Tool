const { db, admin } = require('../config/firebase');
const chalk = require('chalk');
const {
    askForValue,
    askForHourType,
    askForDate,
} = require('../prompts/submissionPropmts');

async function createSubmission(email) {
    const userSnapshot = await db
        .collection('users')
        .where('email', '==', email)
        .get();

    if (userSnapshot.empty) {
        console.log(chalk.red('No user found with that email.'));
        return;
    }

    const userDoc = userSnapshot.docs[0];

    const userId = userDoc.id;

    const userData = userDoc.data();

    const hourType = await askForHourType('Select the hour type:');

    const date = await askForDate('Enter the date (YYYY-MM-DD):');

    const description = await askForValue('Enter the description:');

    const timeSpent = await askForValue('Enter the time spent:');

    const submissionData = {
        uid: userId,
        hourType,
        name: userData.name,
        date,
        description,
        timeSpent: parseFloat(timeSpent, 10),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        state: 'pending',
        saved: false,
    };

    await db
        .collection(`volunteer_submissions_${userData.year}`)
        .add(submissionData);

    console.log(
        chalk.green.bold(`Created a new volunteer submission for ${userData.name}`)
    );
}

module.exports = createSubmission;
