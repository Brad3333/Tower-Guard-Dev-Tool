const { db } = require('../config/firebase');
const chalk = require('chalk');
const { confirmation, askForEmailInput } = require('../prompts');
const { sendTemplatedEmail } = require('../utils/email');
const customize = require('../utils/emailConverter');
const fs = require('fs');

async function emailUsers(year, emails, eboard, messagePath) {
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
                .where('exclude', '!=', true)
                .get();
        }
        userSnapshot.forEach((user) => {
            processedEmails.push(user.data().email);
        });
    }

    let message = '';

    if (messagePath) {
        const data = fs.readFileSync(messagePath, 'utf8');
        message = data;
    } else message = await askForEmailInput();

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

            let formattedMessage;

            if (/<[a-z][\s\S]*>/i.test(specificMessage)) {
                // Message already contains HTML tags — don't modify
                formattedMessage = specificMessage;
            } else {
                // Plain text — safely convert newlines to <br> and wrap in <p>
                formattedMessage = `<p>${specificMessage.replace(/\n/g, '<br>')}</p>`;
            }
            await sendTemplatedEmail(
                userData.email,
                'Tower Guard Notification',
                '',
                formattedMessage,
                ''
            );
        }
    }
}

module.exports = emailUsers;
