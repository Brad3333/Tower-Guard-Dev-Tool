const { db, auth } = require('../config/firebase');
const { generateRandomPassword } = require('../utils/password');
const { parseExcel } = require('../utils/fileUtils');
const { sendEmail } = require('../utils/email');
const chalk = require('chalk');

async function updateUsers(filePath) {
    const users = parseExcel(filePath);

    let currentYear = '2028';
    try {
        const stateSnap = await db.collection('global').doc('state').get();
        if (stateSnap.exists)
            currentYear = stateSnap.data().year || currentYear;
    } catch (e) {
        console.warn(chalk.red('Could not fetch year. Defaulting to 2028.'));
    }

    for (const row of users) {
        const {
            'First Name': firstName,
            'Last Name': lastName,
            'Email Address': email,
            'Role': role,
            'Starting Hours': startingHours,
        } = row;

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const trimmedEmail = email.trim();
        const userSnap = await db
            .collection('users')
            .where('email', '==', trimmedEmail)
            .get();

        if (userSnap.empty) {
            const password = generateRandomPassword();
            const userRecord = await auth.createUser({
                email: trimmedEmail,
                password,
                displayName: fullName,
            });

            await db
                .collection('users')
                .doc(userRecord.uid)
                .set({
                    name: fullName,
                    email: trimmedEmail,
                    role: role === 'SAA' ? 'data' : 'member',
                    totalHours: startingHours,
                    etextingHours: 0,
                    liveHours: 0,
                    scribingHours: 0,
                    attendance: 0,
                    lastMeeting: true,
                    excusedAbsences: 0,
                    year: currentYear,
                    eboard: role !== 'Member' ? true : false,
                });

            console.log(chalk.green.bold(`Created user: ${trimmedEmail}`));
            const htmlContent = `
    <p>Your Tower Guard Credentials</p>
    <p>Hi ${firstName},</p>
    <p>Your account is ready. Below are your credentials:</p>
    <table>
        <tr>
            <td><strong>Email:</strong></td>
            <td>${trimmedEmail}</td>
        </tr>
        <tr>
            <td><strong>Password:</strong></td>
            <td>${password}</td>
        </tr>
    </table>
`;
            await sendEmail(
                trimmedEmail,
                'Your Tower Guard Credentials',
                '',
                htmlContent
            );
        } else {
            const ref = userSnap.docs[0].ref;
            await ref.update({
                role: role === 'SAA' ? 'data' : 'member',
                eboard: role !== 'Member',
            });
            console.log(chalk.green.bold(`Updated user: ${trimmedEmail}`));
        }
    }
}

module.exports = updateUsers;
