const { db } = require('../config/firebase');
const chalk = require('chalk');
const resetUser = require('./resetUser');
const { confirmation } = require('../prompts');

async function resetYear(year) {
    try {
        if ('CONFIRM' !== (await confirmation())) return;

        const usersSnap = await db
            .collection('users')
            .where('year', '==', year)
            .get();

        const snapArray = usersSnap.docs;
        for (const snap of snapArray) {
            const data = snap.data();
            await resetUser(data.email, false);
        }

        await db
            .collection('global')
            .doc('state')
            .set(
                {
                    [`eTotalAttendance${year.trim()}`]: 0,
                    [`totalAttendance${year.trim()}`]: 0,
                },
                { merge: true }
            );

        console.log(chalk.green.bold(`Successfully reset year of ${year}`));
    } catch (error) {
        console.log(chalk.red(`Error resetting year of ${year}:`), error);
    }
}

module.exports = resetYear;
