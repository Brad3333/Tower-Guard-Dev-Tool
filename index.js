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
    askInputMethod,
    askForListOfEmails,
    askForMessageTemplate,
    askForDisplayInputType,
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
const excelAttendance = require('./commands/execlAttendance');
const attendance = require('./commands/attendance');
const editPendingSubmission = require('./commands/editPendingSubmission');

const readSettings = require('./utils/readSettings');
const editSettings = require('./utils/editSettings');

async function main() {
    const name = 'Tower Guard Admin Tool v2.0.0';

    try {
        console.clear();
        console.log(chalk.greenBright.bold(name));

        const settings = await readSettings();
        const directory = settings.directory;

        let action = '';

        while (action !== 'exit') {
            action = await askForMainAction();

            switch (action) {
                case 'u': {
                    const path = await askForFilePath('Excel');
                    await updateUsers(path);
                    await exit();
                    break;
                }
                case 'ea': {
                    const path = await askForFilePath('Excel');
                    await excelAttendance(path);
                    await exit();
                    break;
                }
                case 's': {
                    const path = await askForFilePath('Excel');
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
                case 'eps': {
                    const decision = await askForDisplayInputType();
                    let year = '';
                    let email = '';
                    if (decision === 'a') {
                        year = await askToDisplay();
                    } else {
                        email = await askForEmail();
                    }
                    await editPendingSubmission(year, email);
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
                    const decision = await askForDisplayInputType();
                    let year = '';
                    let email = '';
                    if (decision === 'a') {
                        year = await askToDisplay();
                    } else {
                        email = await askForEmail();
                    }
                    await displayUsers(year, email);
                    await exit();
                    break;
                }
                case 'x': {
                    const year = await askForYear();
                    await exportUsers(year, directory);
                    await exit();
                    break;
                }
                case 'xa': {
                    const year = await askForYear();
                    await attendance(year);
                    await exit();
                    break;
                }
                case 'm': {
                    const decision = await askForEmailDecision();
                    let year = '';
                    let emails = [];
                    let eboard = false;
                    let messagePath = '';
                    if (decision === 'a') {
                        year = await askForYear();
                    } else if (decision === 'e') {
                        year = await askForYear();
                        eboard = true;
                    } else if (decision === 's') {
                        const inputDecision = await askInputMethod();
                        if (inputDecision === 'l') {
                            emails = await askForListOfEmails();
                        } else {
                            let email = '';
                            while (email !== 'DONE') {
                                email = await askForEmail(true, emails);
                                if (email !== 'DONE' && !emails.includes(email))
                                    emails.push(email);
                            }
                        }
                    }
                    const messageDecision = await askForMessageTemplate();
                    if (messageDecision === 'a') {
                        messagePath = await askForFilePath('.txt');
                    }
                    await emailUsers(year, emails, eboard, messagePath);
                    await exit();
                    break;
                }
                case 'es': {
                    await editSettings();
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

            console.log(chalk.greenBright.bold(name));
        }

        console.clear();
    } catch (error) {
        console.error(
            chalk.red('An unexpected error occurred: '),
            chalk.bold(error.message)
        );
    }
}

main();
