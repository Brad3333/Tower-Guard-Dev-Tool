const { db } = require('../config/firebase');
const chalk = require('chalk');
const {
    askForSubmission,
    askForFieldIndexSubmission,
    askForNewValue,
    askToSendEmail,
    askForNewHourType,
    askForDate,
} = require('../prompts');

async function editPendingSubmission(year, email) {
    let submissionsSnapshot = [];

    if (email) {
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

        submissionsSnapshot = await db
            .collection(`volunteer_submissions_${userData.year}`)
            .where('state', '==', 'pending')
            .where('uid', '==', userId)
            .get();
    } else {
        submissionsSnapshot = await db
            .collection(`volunteer_submissions_${year}`)
            .where('state', '==', 'pending')
            .get();
    }

    const docId = await askForSubmission(submissionsSnapshot);

    let submission = {};
    let ref = {};

    submissionsSnapshot.forEach((doc) => {
        if (doc.id == docId) {
            submission = doc;
            ref = doc.ref;
        }
    });

    const data = submission.data();

    const filtered = {
        hourType: data.hourType,
        date: data.date,
        description: data.description,
        timeSpent: data.timeSpent,
    };

    const fields = Object.entries(filtered);

    const index = await askForFieldIndexSubmission(fields);

    if (index === -1) {
        return;
    }

    const key = fields[index][0];
    const oldValue = fields[index][1];

    let newValue = null;

    console.log(chalk.cyan(`Editing ${key}: current value -> ${oldValue}`));

    if (key === 'hourType') {
        newValue = await askForNewHourType();
    } else if (key === 'date') {
        newValue = await askForDate();
    } else {
        newValue = await askForNewValue();
    }

    let updateData = { [key]: newValue };

    if (key === 'timeSpent') {
        updateData[key] = parseFloat(newValue, 10);
    }

    await ref.update(updateData);
    console.log(
        chalk.green.bold(`Updated ${key} from ${oldValue} to ${newValue}`)
    );

    const sendEmail = await askToSendEmail();
    if (sendEmail) await emailUsers('', [email], false);
}

module.exports = editPendingSubmission;
