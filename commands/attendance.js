const { db } = require('../config/firebase');
const chalk = require('chalk');
const {
    askToSendReminderEmails,
    askForMeeting,
} = require('../prompts');
const { writeJsonToExcel } = require('../utils/fileUtils');

async function attendance(yearInput) {
    //const path = await askForOutputPath();

    const meetingId = await askForMeeting(yearInput);

    const attendanceSnap = await db
        .collection(`attendance_${yearInput.trim()}`)
        .doc(meetingId)
        .get();

    const attendanceData = attendanceSnap.data();
    if (!attendanceData) {
        console.log(chalk.red('No attendance data found for the selected meeting.'));
        return;
    }

    console.log(`Total Attendees: ${attendanceData.attendees.length}`);
    console.log(`Total Excused Absences: ${attendanceData.excused.length}`);
    console.log(`Total Absences: ${attendanceData.absent.length}`);

    const sendEmails = await askToSendReminderEmails();

}

module.exports = attendance;