const { db } = require('../config/firebase');
const chalk = require('chalk');
const { askToSendReminderEmails, askForMeeting } = require('../prompts');
const { writeJsonToExcel } = require('../utils/fileUtils');
const customize = require('../utils/emailConverter');
const fs = require('fs');
const path = require('path');
const { sendTemplatedEmail } = require('../utils/email');

async function attendance(yearInput) {
    //const path = await askForOutputPath();

    const meetingId = await askForMeeting(yearInput);

    const attendanceSnap = await db
        .collection(`attendance_${yearInput.trim()}`)
        .doc(meetingId)
        .get();

    const attendanceData = attendanceSnap.data();
    if (!attendanceData) {
        console.log(
            chalk.red('No attendance data found for the selected meeting.')
        );
        return;
    }

    console.log(`Total Attendees: ${attendanceData.attendees.length}`);
    console.log(`Total Excused Absences: ${attendanceData.excused.length}`);
    console.log(`Total Absences: ${attendanceData.absent.length}`);

    const sendEmails = await askToSendReminderEmails();

    if (sendEmails) {
        const filePath = path.join(__dirname, '../attendanceEmail.txt');
        const data = fs.readFileSync(filePath, 'utf8');
        const message = data;
        for (const email of attendanceData.absent) {
            const userSnap = await db
                .collection('users')
                .where('email', '==', email)
                .get();
            if (userSnap.empty) {
                console.log(chalk.yellow(`No user found for ${email}`));
                continue;
            }
            const userData = userSnap.docs[0].data();
            const specificMessage = customize(message, userData, [
                attendanceData.date,
            ]);
            await sendTemplatedEmail(
                userData.email,
                'Tower Guard Notification',
                '',
                `<p>${specificMessage.replace(/\n/g, '<br>')}</p>`,
                ''
            );
        }
    }
}

module.exports = attendance;
