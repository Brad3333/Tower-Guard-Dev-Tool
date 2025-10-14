const { db } = require('../config/firebase');
const chalk = require('chalk');
const parseExcel = require('../utils/fileUtils').parseExcel;

async function excelAttendance(filePath) {
    const users = parseExcel(filePath);

    for (const row of users) {
        const { Email: email, Present: present } = row;

        const snap = await db
            .collection('users')
            .where('email', '==', email)
            .get();
        if (snap.empty)
            return console.log(chalk.red(`User ${email} not found.`));

        const ref = snap.docs[0].ref;
        const data = snap.docs[0].data();
        let updateData = {
            attendance: data.attendance,
            totalHours: data.totalHours,
            excusedAbsences: data.excusedAbsences,
        };
        if (present !== -1 && present !== 0) {
            updateData.attendance += 1;
            updateData.totalHours += present;
        } else if (present === 0) {
            updateData.excusedAbsences += 1;
        }
        await ref.update(updateData);
        console.log(chalk.green.bold(`Updated attendance for ${email}`));
    }
}

module.exports = excelAttendance;
