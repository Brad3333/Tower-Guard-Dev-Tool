const chalk = require('chalk');

const {
    askForMainAction,
    askForFilePath,
    askForEmail,
    askForYearInput,
    askToDisplay,
    exit,
    askForYear,
    askForTestingAction,
    askForEmailDecision,
} = require('./prompts');

const updateUsers = require('./commands/updateUsers');
const transferYear = require('./commands/transferYear');
const editUser = require('./commands/editUser');
const deleteUser = require('./commands/deleteUser');
const displayUsers = require('./commands/displayUsers');
const exportUsers = require('./commands/exportUsers');
const resetUser = require('./commands/resetUser');
const resetYear = require('./commands/resetYear');
const deleteYear = require('./commands/deleteYear');
const emailUsers = require('./commands/emailUsers');
const startingEmail = require('./commands/startingEmail');

async function main() {
    try {
        console.clear();
        console.log(chalk.greenBright.bold('Tower Guard Admin Tool v1.0.0'));

        let action = '';

        while (action !== 'exit') {
            action = await askForMainAction();

            switch (action) {
                case 'u': {
                    const path = await askForFilePath();
                    await updateUsers(path);
                    await exit();
                    break;
                }
                case 's': {
                    const path = await askForFilePath();
                    await startingEmail(path);
                    await exit();
                    break;
                }
                case 't': {
                    const year = await askForYearInput();
                    await transferYear(year);
                    await exit();
                    break;
                }
                case 'e': {
                    const email = await askForEmail();
                    await editUser(email);
                    await exit();
                    break;
                }
                case 'v': {
                    const year = await askToDisplay();
                    await displayUsers(year);
                    await exit();
                    break;
                }
                case 'x': {
                    const year = await askForYear();
                    await exportUsers(year);
                    await exit();
                    break;
                }
                case 'm': {
                    const decision = await askForEmailDecision();
                    let year = '';
                    let emails = [];
                    let eboard = false;
                    if (decision === 'a') {
                        year = await askForYear();
                    } else if (decision === 'e') {
                        year = await askForYear();
                        eboard = true;
                    } else if (decision === 's') {
                        let email = '';
                        while (email !== 'DONE') {
                            email = await askForEmail(true, emails);
                            if (email !== 'DONE' && !emails.includes(email))
                                emails.push(email);
                        }
                    }
                    await emailUsers(year, emails, eboard);
                    await exit();
                    break;
                }
                case 'o': {
                    const testAction = await askForTestingAction();
                    switch (testAction) {
                        case 'r': {
                            const email = await askForEmail();
                            await resetUser(email, true);
                            await exit();
                            break;
                        }
                        case 'd': {
                            const email = await askForEmail();
                            await deleteUser(email, true);
                            await exit();
                            break;
                        }
                        case 'ry': {
                            const year = await askForYear();
                            await resetYear(year);
                            await exit();
                            break;
                        }
                        case 'dy': {
                            const year = await askForYear();
                            await deleteYear(year);
                            await exit();
                            break;
                        }
                        default:
                            console.log(chalk.cyan('Going Back...'));
                    }
                }
                default:
                    console.clear();
            }

            console.clear();
        }
    } catch (error) {
        console.error(
            chalk.red('An unexpected error occurred: '),
            chalk.bold(error.message)
        );
    }
}

main();
