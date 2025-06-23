const { db } = require('../config/firebase');
const chalk = require('chalk');
const admin = require('firebase-admin');
const { confirmation } = require('../prompts');

async function deleteYear(year) {
    try {
        if ((await confirmation()) !== 'CONFIRM') return;

        const usersSnap = await db
            .collection('users')
            .where('year', '==', year)
            .get();

        // Delete each user document and their Firebase Auth account
        for (const snap of usersSnap.docs) {
            await db.collection('users').doc(snap.id).delete();
            try {
                await admin.auth().deleteUser(snap.id);
            } catch (authErr) {
                console.log(
                    chalk.red(
                        `Could not delete auth user with UID ${snap.id}:`
                    ),
                    authErr.message
                );
            }
        }

        // Delete all documents in volunteer_submissions_${year}
        const submissionSnap = await db
            .collection(`volunteer_submissions_${year.trim()}`)
            .get();
        for (const doc of submissionSnap.docs) {
            await doc.ref.delete();
        }

        // Delete all documents in absence_forms_${year}
        const absenceSnap = await db
            .collection(`absence_forms_${year.trim()}`)
            .get();
        for (const doc of absenceSnap.docs) {
            await doc.ref.delete();
        }

        // Remove year-specific fields from global state doc
        const stateRef = db.collection('global').doc('state');
        await stateRef.update({
            [`totalAttendance${year.trim()}`]:
                admin.firestore.FieldValue.delete(),
            [`eTotalAttendance${year.trim()}`]:
                admin.firestore.FieldValue.delete(),
        });

        console.log(chalk.green.bold(`Successfully deleted year ${year}`));
    } catch (error) {
        console.error(chalk.red(`Error deleting year ${year}:`), error);
    }
}

module.exports = deleteYear;
