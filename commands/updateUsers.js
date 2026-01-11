const { db, auth } = require('../config/firebase');
const { generateRandomPassword } = require('../utils/password');
const { parseExcel } = require('../utils/fileUtils');
const { sendTemplatedEmail } = require('../utils/email');
const chalk = require('chalk');
const path = require('path');
const customize = require('../utils/emailConverter');
const fs = require('fs');

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
            'Display Name': displayName,
            'Email Address': email,
            Role: role,
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
                    name: displayName ? displayName.trim() : fullName,
                    firstName: firstName,
                    lastName: lastName,
                    email: trimmedEmail,
                    role:
                        role === 'SAA' || role === 'Sergeant-at-Arms'
                            ? 'data'
                            : 'member',
                    totalHours: startingHours,
                    etextingHours: 0,
                    liveHours: 0,
                    scribingHours: 0,
                    attendance: 0,
                    lastMeeting: true,
                    excusedAbsences: 0,
                    year: currentYear,
                    eboard: role !== 'Member' ? true : false,
                    exclude: false,
                });

            console.log(chalk.green.bold(`Created user: ${trimmedEmail}`));
            const filePath = path.join(__dirname, '../createEmail.txt');
            const htmlContent = customize(
                fs.readFileSync(filePath, 'utf8'),
                {},
                [firstName, trimmedEmail]
            );
            //             const htmlContent = `
            //     <p>Tower Guard Tracker Account</p>
            //     <p>Hi ${firstName},</p>
            //     <p>Your account is ready. To log in please download the app, then type in your email and press the reset password button to create a password.</p>
            //     <p><a href="https://tower-guard-tracker-download.vercel.app/">Download the app here</a></p>
            //     <p>Your login email is: ${trimmedEmail}</p>
            //     <p>If you have any questions, please respond to this email.</p>
            //     <p>Thank you!</p>
            //     <p>- Tower Guard App Admin</p>
            // `;
            await sendTemplatedEmail(
                trimmedEmail,
                'Tower Guard Tracker Account Created',
                '',
                htmlContent,
                '',
                'Tower Guard Tracker Account'
            );
        } else {
            const ref = userSnap.docs[0].ref;
            await ref.update({
                name: displayName ? displayName.trim() : fullName,
                role:
                    role === 'SAA' || role === 'Sergeant-at-Arms'
                        ? 'data'
                        : 'member',
                eboard: role !== 'Member',
            });
            console.log(chalk.green.bold(`Updated user: ${trimmedEmail}`));
        }
    }
}

module.exports = updateUsers;
