const { db } = require('../config/firebase');
const chalk = require('chalk');
const { pickUserToDisplay, displayUserData } = require('../prompts');

async function displayUsers(yearInput, email = '') {
    try {
        if (email) {
            const userSnapshot = await db
                .collection('users')
                .where('email', '==', email)
                .get();
            const userData = userSnapshot.docs[0].data();
            console.table(userData);
        } else {
            const usersSnapshot = await db
                .collection('users')
                .where('exclude', '==', false)
                .orderBy('firstName')
                .get();

            let users = usersSnapshot.docs.map((doc) => doc.data());

            if (yearInput !== 'a') {
                users = users.filter((user) => user.year === yearInput.trim());
            }

            if (users.length > 0) {
                console.log(
                    chalk.green.bold(
                        `${users.length} users in ${yearInput === 'a' ? 'all users' : `class of ${yearInput}`}`
                    )
                );
                const user = await pickUserToDisplay(users);
                await displayUserData(Object.entries(user));
                return;
            } else {
                console.log(chalk.red(`No users form ${yearInput}`));
            }
        }
    } catch (error) {
        console.error(chalk.red('Error fetching user:'), error.message);
    }
}

module.exports = displayUsers;
