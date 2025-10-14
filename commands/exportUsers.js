const { db } = require('../config/firebase');
const chalk = require('chalk');
const {
    askForOutputPath,
    askToGenerateReport,
    askForHours,
    askToSendEmails,
} = require('../prompts');
const { writeJsonToExcel } = require('../utils/fileUtils');

async function exportUsers(yearInput) {
    const path = await askForOutputPath();

    let hours = 0;
    let send = false;

    if (await askToGenerateReport()) {
        hours = await askForHours();
        send = await askToSendEmails();
    }

    const userSnap = await db
        .collection('users')
        .where('year', '==', yearInput.trim())
        .orderBy('name')
        .get();

    let users = [];

    const headerOrder = [
        'Last Name',
        'First Name',
        'Email Address',
        'Total Hours',
        'Live Hours',
        'E-Texting Hours',
        'Scribing Hours',
        'Attendance',
        'Excused Absences',
    ];

    userSnap.forEach((doc) => {
        const data = doc.data();
        const user = {
            'Last Name': data.lastName,
            'First Name': data.firstName,
            'Email Address': data.email,
            'Total Hours': data.totalHours,
            'Live Hours': data.liveHours,
            'E-Texting Hours': data.etextingHours,
            'Scribing Hours': data.scribingHours,
            Attendance: data.attendance,
            'Excused Absences': data.excusedAbsences,
        };
        if (!data.exclude) {
            users.push(user);
        }
    });

    await writeJsonToExcel(users, headerOrder, path, hours, send);
}

module.exports = exportUsers;
