const chalk = require('chalk');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');

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
    setUpDirectory,
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

//C:\Users\bdaus\OneDrive\Desktop

async function main() {
    try {
        console.clear();
        console.log(chalk.greenBright.bold('Tower Guard Admin Tool v1.0.0'));

        // Read config.txt if it exists
        let content = '';
        try {
            content = await fsPromises.readFile('config.txt', 'utf8');
        } catch (err) {
            if (err.code !== 'ENOENT') throw err; // rethrow other errors
        }

        let directory = content.trim();

        if (!directory) {
            // Ask user for base directory
            directory = await setUpDirectory();

            // Append subfolder
            directory = path.join(directory, 'TG Reports');

            // Ensure the folder exists
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
                console.log(chalk.gray(`Created directory: ${directory}`));
            }

            console.log(chalk.yellow(`Saving directory: ${directory}`));

            // Save to config.txt
            await fsPromises.writeFile('config.txt', directory, 'utf8');
            console.log(chalk.green('Directory saved to config.txt.'));
        } else {
            console.log(
                chalk.cyan('Loaded directory from config.txt:'),
                directory
            );

            // Ensure directory exists even if loaded from file
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
                console.log(chalk.gray(`Created directory: ${directory}`));
            }
        }

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
