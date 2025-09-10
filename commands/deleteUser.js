const { db } = require('../config/firebase');
const chalk = require('chalk');
const admin = require('firebase-admin'); // initialized already in your app
const { confirmation } = require('../prompts');

async function deleteUser(email, needConfirmation) {
    const userSnap = await db
        .collection('users')
        .where('email', '==', email)
        .get();

    if (needConfirmation && 'CONFIRM' !== (await confirmation())) return;

    if (userSnap.empty) {
        console.log(chalk.red(`User with email "${email}" not found.`));
        return;
    }

    const year = userSnap.docs[0].data().year;
    const uid = userSnap.docs[0].id;

    const submissionSnap = await db
        .collection(`volunteer_submissions_${year.trim()}`)
        .where('uid', '==', uid)
        .get();
    const absenceSnap = await db
        .collection(`absence_forms_${year}`)
        .where('uid', '==', uid)
        .get();

    const batch = db.batch();

    if (!submissionSnap.empty)
        submissionSnap.forEach((doc) => batch.delete(doc.ref));

    if (!absenceSnap.empty) absenceSnap.forEach((doc) => batch.delete(doc.ref));

    userSnap.forEach((doc) => batch.delete(doc.ref));

    //Attempt to delete the Firebase Auth account
    admin.auth().deleteUser(uid);

    await batch.commit();
    console.log(chalk.green.bold(`Deleted Firestore user data for "${email}"`));
}

module.exports = deleteUser;
