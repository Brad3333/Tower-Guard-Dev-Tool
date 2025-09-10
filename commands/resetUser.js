const { db } = require('../config/firebase');
const chalk = require('chalk');
const { confirmation } = require('../prompts');

async function resetUser(email, needConfirmation) {
    const userSnap = await db
        .collection('users')
        .where('email', '==', email)
        .get();

    const userData = userSnap.docs[0].data();

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

    if (!absenceSnap.empty) {
        absenceSnap.forEach((doc) => batch.delete(doc.ref));
    }

    await db.collection('users').doc(uid).set({
        firstName: userData.firstName,
        lastName: userData.lastName,
        exclude: userData.exclude,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        totalHours: 0,
        etextingHours: 0,
        liveHours: 0,
        scribingHours: 0,
        attendance: 0,
        lastMeeting: true,
        excusedAbsences: 0,
        year: userData.year,
        eboard: userData.role === "member" ? false : true,
    });

    await batch.commit();
    console.log(chalk.green.bold(`Reset Firestore user data for "${email}"`));
}

module.exports = resetUser;
