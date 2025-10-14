const inquirer = require('inquirer');
const { db } = require('./config/firebase');
const fs = require('fs');
const chalk = require('chalk');

module.exports = {
    askForMainAction: async () => {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                prefix: '',
                message: chalk.gray('Choose an operation:'),
                choices: [
                    new inquirer.Separator(
                        chalk.magenta.bold('--- User Operations ---')
                    ),
                    { name: 'Create users', value: 'u' },
                    { name: 'Display users', value: 'v' },
                    { name: 'Edit user', value: 'e' },

                    new inquirer.Separator(
                        chalk.magenta.bold('--- Data Handling ---')
                    ),
                    { name: 'Export users', value: 'x' },
                    { name: 'Attendance', value: 'xa' },
                    { name: 'Transfer year', value: 't' },

                    new inquirer.Separator(chalk.magenta.bold('--- Email ---')),
                    { name: 'Email users', value: 'm' },
                    { name: 'Starting hours email', value: 's' },

                    new inquirer.Separator(
                        chalk.magenta.bold('--- Utilities ---')
                    ),
                    { name: 'Excel attendance', value: 'ea' },
                    { name: 'Admin Tools', value: 'o' },
                    { name: 'Exit', value: 'exit' },
                ],
                pageSize: 15,
            },
        ]);
        return action;
    },

    askForTestingAction: async () => {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                prefix: '',
                message: chalk.gray('Choose an operation:'),
                choices: [
                    new inquirer.Separator(
                        chalk.magenta.bold('--- Delete Operations ---')
                    ),
                    { name: 'Delete user', value: 'd' },
                    { name: 'Delete year', value: 'dy' },
                    new inquirer.Separator(
                        chalk.magenta.bold('--- Reset Operations ---')
                    ),
                    { name: 'Reset user', value: 'r' },
                    { name: 'Reset year', value: 'ry' },
                    new inquirer.Separator(
                        chalk.magenta.bold('------------------------')
                    ),
                    { name: 'Back', value: 'back' },
                ],
                pageSize: 8,
            },
        ]);
        return action;
    },

    askForEmailDecision: async () => {
        const { decision } = await inquirer.prompt([
            {
                type: 'list',
                name: 'decision',
                prefix: '',
                message: chalk.gray('Choose an operation:'),
                choices: [
                    { name: 'Email all users for a given year', value: 'a' },
                    { name: 'Email eboard users for a given year', value: 'e' },
                    { name: 'Email specific list of users', value: 's' },
                ],
                pageSize: 3,
            },
        ]);
        return decision;
    },

    askForDisplayInputType: async () => {
        const { decision } = await inquirer.prompt([
            {
                type: 'list',
                name: 'decision',
                prefix: '',
                message: chalk.gray('Choose an operation:'),
                choices: [
                    { name: 'Pick from all users', value: 'a' },
                    { name: 'Pick a specific email', value: 's' },
                ],
                pageSize: 3,
            },
        ]);
        return decision;
    },

    askInputMethod: async () => {
        const { decision } = await inquirer.prompt([
            {
                type: 'list',
                name: 'decision',
                prefix: '',
                message: chalk.gray('Choose an operation:'),
                choices: [
                    { name: 'Enter emails as one list', value: 'l' },
                    { name: 'Pick emails manually', value: 'm' },
                ],
                pageSize: 3,
            },
        ]);
        return decision;
    },

    askForMessageTemplate: async () => {
        const { decision } = await inquirer.prompt([
            {
                type: 'list',
                name: 'decision',
                prefix: '',
                message: chalk.gray('Choose an operation:'),
                choices: [
                    { name: 'Enter an already made template', value: 'a' },
                    { name: 'Create one now', value: 'c' },
                ],
                pageSize: 3,
            },
        ]);
        return decision;
    },

    askForFilePath: async (type) => {
        const { path } = await inquirer.prompt([
            {
                type: 'input',
                name: 'path',
                prefix: '',
                message: chalk.gray(`Enter ${type} file path:`),
                validate: (input) =>
                    fs.existsSync(input.replace(/^"(.*)"$/, '$1'))
                        ? true
                        : chalk.red('File not found.'),
            },
        ]);
        return path.replace(/^"(.*)"$/, '$1');
    },

    askForListOfEmails: async () => {
        const { path } = await inquirer.prompt([
            {
                type: 'input',
                name: 'path',
                prefix: '',
                message: chalk.gray("Enter list of users seperated by ',':"),
            },
        ]);

        const userSnapshot = await db.collection('users').get();
        const emails = [];
        userSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email) {
                emails.push(data.email);
            }
        });

        let output = path
            .split(',')
            .map((str) => str.trim())
            .filter(
                (str) =>
                    /[a-zA-Z0-9.]+@[a-zA-Z0-9]+.(edu|com|org)/.test(str) &&
                    emails.includes(str)
            );

        console.log(output);

        return output;
    },

    askForOutputPath: async () => {
        const { path } = await inquirer.prompt([
            {
                type: 'input',
                name: 'path',
                prefix: '',
                message: chalk.gray('Enter output file path as xlsx:'),
                validate: (input) =>
                    input.includes('.xlsx')
                        ? true
                        : chalk.red('File not found.'),
            },
        ]);
        return path.replace(/^"(.*)"$/, '$1');
    },

    askForEmail: async (cancel = false, remove = []) => {
        const userSnapshot = await db.collection('users').get();
        const emails = [];
        userSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.email && !remove.includes(data.email)) {
                emails.push(data.email);
            }
        });

        // Step 1: Ask for partial input
        const { search } = await inquirer.prompt([
            {
                type: 'input',
                name: 'search', // Must match the destructured variable
                prefix: '',
                message: chalk.gray(
                    cancel
                        ? "Enter full email or part of the email to search (To finish the list of emails type 'DONE'):"
                        : 'Enter full email or part of the email to search:'
                ),
            },
        ]);

        if (cancel && search === 'DONE') {
            return 'DONE';
        }

        // Step 2: Filter emails based on input
        const filteredEmails = emails.filter((email) =>
            email.toLowerCase().includes(search.trim().toLowerCase())
        );

        // Step 3: If exact match, return it immediately
        const exactMatch = filteredEmails.find((e) => e === search.trim());
        if (exactMatch) return exactMatch;

        // Step 4: If no matches
        if (filteredEmails.length === 0) {
            console.log(chalk.red('No matching emails found.'));
            return null;
        }

        // Step 5: Let the user choose from filtered emails
        const { selectedEmail } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedEmail',
                message: chalk.gray('Select a matching email:'),
                choices: filteredEmails,
                prefix: '',
            },
        ]);

        return selectedEmail;
    },

    askForMeeting: async (year) => {
        const meetingSnapshot = await db
            .collection(`attendance_${year.trim()}`)
            .get();
        const meetings = [];

        meetingSnapshot.forEach((doc) => {
            const data = doc.data();

            const name = data.eboard
                ? `E-Board Meeting: ${data.date}`
                : `General Meeting: ${data.date}`;
            meetings.push({ name: name, value: doc.id });
        });

        // Let the user choose from filtered meetings
        const { selectedMeeting } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedMeeting',
                message: chalk.gray('Select a meeting:'),
                choices: meetings,
                prefix: '',
            },
        ]);

        return selectedMeeting;
    },

    askForYearInput: async () => {
        const { year } = await inquirer.prompt([
            {
                type: 'input',
                name: 'year',
                prefix: '',
                message: chalk.gray(
                    'Enter target year (or type y to increment):'
                ),
                validate: (input) =>
                    input === 'y' || /^\d{4}$/.test(input)
                        ? true
                        : chalk.red('Invalid year input'),
            },
        ]);
        return year;
    },

    askForYear: async () => {
        const { year } = await inquirer.prompt([
            {
                type: 'input',
                name: 'year',
                prefix: '',
                message: chalk.gray('Enter year of users:'),
                validate: (input) =>
                    /^\d{4}$/.test(input)
                        ? true
                        : chalk.red('Invalid year input'),
            },
        ]);
        return year;
    },

    askToDisplay: async () => {
        const { year } = await inquirer.prompt([
            {
                type: 'input',
                name: 'year',
                prefix: '',
                message: chalk.gray('Enter target year (or type a for all):'),
                validate: (input) =>
                    input === 'a' || /^\d{4}$/.test(input)
                        ? true
                        : chalk.red('Invalid year input'),
            },
        ]);
        return year;
    },

    askForFieldIndex: async (fields) => {
        const { index } = await inquirer.prompt([
            {
                type: 'list',
                name: 'index',
                message: chalk.gray('Select a field to edit:'),
                choices: fields.map(([key, value], idx) => ({
                    name: `${key}: ${chalk.bold(value)}`,
                    value: idx,
                })),
                pageSize: 15,
                prefix: '',
            },
        ]);
        return index;
    },

    askForNewValue: async () => {
        const { value } = await inquirer.prompt([
            {
                type: 'input',
                name: 'value',
                prefix: '',
                message: chalk.gray('New value:'),
            },
        ]);
        return value;
    },

    pickUserToDisplay: async (users) => {
        const { user } = await inquirer.prompt([
            {
                type: 'list',
                name: 'user',
                message: chalk.gray('Select a user to see:'),
                choices: users.map((user) => ({
                    name: `${user.name}: ${chalk.bold(user.email)}`,
                    value: user,
                })),
                pageSize: 12,
                prefix: '',
            },
        ]);
        return user;
    },

    exit: async () => {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                prefix: '',
                message: chalk.gray('Enter to exit'),
                suffix: '',
                choices: [{ name: 'Exit', value: 'exit' }],
            },
        ]);
        return action;
    },

    confirmation: async () => {
        const { confirmed } = await inquirer.prompt([
            {
                type: 'input',
                name: 'confirmed',
                prefix: '',
                message: chalk.gray('Confirm operation (type CONFIRM):'),
            },
        ]);
        return confirmed;
    },

    askToGenerateReport: async () => {
        const { report } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'report',
                prefix: '',
                message: chalk.gray('Do you want to generate a report?'),
                default: false,
            },
        ]);
        return report;
    },

    askToSendEmail: async () => {
        const { send } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'send',
                prefix: '',
                message: chalk.gray('Do you want to send an email?'),
                default: false,
            },
        ]);
        return send;
    },

    askToSendEmails: async () => {
        const { send } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'send',
                prefix: '',
                message: chalk.gray(
                    'Do you want to send reminder emails to users that are not on track?'
                ),
                default: false,
            },
        ]);
        return send;
    },

    askToSendReminderEmails: async () => {
        const { send } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'send',
                prefix: '',
                message: chalk.gray(
                    'Do you want to send emails to those that recieved unexcused absences?'
                ),
                default: false,
            },
        ]);
        return send;
    },

    askForHours: async () => {
        const { hours } = await inquirer.prompt([
            {
                type: 'input',
                name: 'hours',
                prefix: '',
                message: chalk.gray('How many hours would be on track:'),
                validate: (input) =>
                    /^\d+$/.test(input)
                        ? true
                        : chalk.red('Invalid hour input'),
            },
        ]);
        return hours;
    },

    askForEmailInput: async () => {
        let message = '';

        const { info } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'info',
                prefix: '',
                message: chalk.gray(
                    'Do you want info on how the email sender works?'
                ),
                default: false,
            },
        ]);

        if (info) {
            console.log(
                chalk.magenta.bold(
                    'This is the email builder, type each line and then hit enter.'
                )
            );
            console.log(
                chalk.magenta.bold(
                    "To finish off the email enter '**end' on a new line."
                )
            );
            console.log(
                chalk.magenta.bold(
                    "To add personalized information in the email add '**' in front of what you want personalized."
                )
            );
            console.log(
                chalk.gray.bold("'**name'"),
                'would print',
                chalk.gray.bold("'Bradley Austin'")
            );
            console.log(
                chalk.gray.bold("'**first'"),
                'would print',
                chalk.gray.bold("'Bradley'")
            );
            console.log(
                chalk.gray.bold("'**last'"),
                'would print',
                chalk.gray.bold("'Austin'")
            );
            console.log(
                chalk.gray.bold("'**email'"),
                'would print',
                chalk.gray.bold("'austi163@msu.edu'")
            );
            console.log(
                chalk.gray.bold("'**total'"),
                'would print',
                chalk.gray.bold("'0'"),
                'the users total hours'
            );
            console.log(
                chalk.gray.bold("'**live'"),
                'would print',
                chalk.gray.bold("'0'"),
                'the users live hours'
            );
            console.log(
                chalk.gray.bold("'**etext'"),
                'would print',
                chalk.gray.bold("'0'"),
                'the users e-texting hours'
            );
            console.log(
                chalk.gray.bold("'**scribe'"),
                'would print',
                chalk.gray.bold("'0'"),
                'the users scribing hours'
            );
            console.log(
                chalk.gray.bold("'**attendance'"),
                'would print',
                chalk.gray.bold("'0'"),
                'the users attendance'
            );
            console.log(
                chalk.gray.bold("'**excused'"),
                'would print',
                chalk.gray.bold("'0'"),
                'the users excused absenses'
            );
        }

        let line = '';
        while (line !== '**end') {
            const { input } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'input',
                    prefix: '',
                    message: chalk.gray('Enter line:'),
                },
            ]);
            line = input;
            if (line === '**end') {
                message += line;
                break;
            }
            message += line + '\n';
        }

        return message;
    },
};
