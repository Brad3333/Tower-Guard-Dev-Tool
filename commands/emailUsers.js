const { db } = require('../config/firebase');
const chalk = require('chalk');
const { confirmation, askForEmailInput } = require('../prompts');
const { sendEmail, sendTemplatedEmail } = require('../utils/email');

const customize = (message, userData) => {
    let userMessage = '';
    let hold = '';
    for (const index in message) {
        const char = message.at(index);
        if (hold.length <= 0 && char !== '*') {
            userMessage += char;
        } else if (hold.length > 2 && !/[a-zA-Z]/.test(char)) {
            switch (hold) {
                case '**name': {
                    hold = userData.name;
                    break;
                }
                case '**first': {
                    hold = userData.firstName;
                    break;
                }
                case '**last': {
                    hold = userData.lastName;
                    break;
                }
                case '**email': {
                    hold = userData.email;
                    break;
                }
                case '**total': {
                    hold = String(userData.totalHours);
                    break;
                }
                case '**live': {
                    hold = String(userData.liveHours);
                    break;
                }
                case '**etext': {
                    hold = String(userData.etextingHours);
                    break;
                }
                case '**scribe': {
                    hold = String(userData.scribingHours);
                    break;
                }
                case '**attendance': {
                    hold = String(userData.attendance);
                    break;
                }
                case '**exceused': {
                    hold = String(userData.excusedAbsences);
                    break;
                }
            }
            userMessage += hold + char;
            hold = '';
        } else {
            hold += char;
        }
    }

    if (hold === '**end') {
        userMessage += 'Regards, \nTower Guard App Admin';
    }

    return userMessage;
};

async function emailUsers(year, emails, eboard) {
    let processedEmails = emails;

    if (emails.length <= 0 && !year) {
        console.log(chalk.red('No users have been picked to email'));
        return;
    }

    let userSnapshot;
    if (emails.length <= 0) {
        if (eboard) {
            userSnapshot = await db
                .collection('users')
                .where('year', '==', year.trim())
                .where('eboard', '==', true)
                .get();
        } else {
            userSnapshot = await db
                .collection('users')
                .where('year', '==', year.trim())
                .get();
        }
        userSnapshot.forEach((user) => {
            processedEmails.push(user.data().email);
        });
    }

    const message = await askForEmailInput();

    const testMessage = customize(message, {
        name: 'Bradley Austin',
        email: 'austi163@msu.edu',
        totalHours: 10,
        liveHours: 4,
        etextingHours: 2,
        scribingHours: 1,
        attendance: 2,
        excusedAbsences: 1,
        firstName: 'Bradley',
        lastName: 'Austin',
    });

    console.log(testMessage);
    console.log(
        chalk.magentaBright('Is this what an expected output should be?')
    );

    const confirmed = await confirmation();

    if (confirmed) {
        for (const index in processedEmails) {
            const userSnap = await db
                .collection('users')
                .where('email', '==', processedEmails.at(index))
                .get();
            const userData = userSnap.docs[0].data();
            const specificMessage = customize(message, userData);
            await sendTemplatedEmail(
                userData.email,
                'Tower Guard Notification',
                '',
                `<p>${specificMessage.replace(/\n/g, '<br>')}</p>`,
                ''
            );
            // await sendEmail(
            //     userData.email,
            //     'Tower Guard Notification',
            //     specificMessage,
            //     ''
            // );
        }
    }
}

module.exports = emailUsers;
