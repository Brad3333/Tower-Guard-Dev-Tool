const inquirer = require('inquirer');
const { Separator } = inquirer;
const chalk = require('chalk');

module.exports = {
    askForSubmission: async (submissions) => {
        const submissionsDisplay = [];

        submissions.forEach((doc) => {
            const data = doc.data();

            const name = `${data.name}: ${data.hourType}, ${data.timeSpent}, ${data.description}`;
            submissionsDisplay.push({ name: name, value: doc.id });
        });

        // Let the user choose from submisions
        const { selectedSubmission } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedSubmission',
                message: chalk.gray('Select a submission:'),
                choices: submissionsDisplay,
                prefix: '',
            },
        ]);

        return selectedSubmission;
    },
    askForFieldIndex: async (fields) => {
        const { index } = await inquirer.prompt([
            {
                type: 'list',
                name: 'index',
                message: chalk.gray('Select a field to edit:'),
                choices: [
                    ...fields.map(([key, value], idx) => {
                        let name = key;

                        if (key === 'hourType') {
                            name = 'Hour Type';
                        } else if (key === 'date') {
                            name = 'Date';
                        } else if (key === 'description') {
                            name = 'Descritpion';
                        } else {
                            name = 'Time Spent';
                        }

                        return {
                            name: `${name}: ${chalk.bold(value)}`,
                            value: idx,
                        };
                    }),
                    new Separator(),
                    { name: chalk.red('Delete'), value: -2 },
                    new Separator(),
                    { name: chalk.grey('Cancel'), value: -1 },
                ],
                pageSize: 20,
                prefix: '',
            },
        ]);
        return index;
    },
    askForDate: async (displayText) => {
        const { date } = await inquirer.prompt([
            {
                type: 'input',
                name: 'date',
                prefix: '',
                message: chalk.gray(displayText),
                validate: (input) => {
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
                        return 'Format must be YYYY-MM-DD';
                    }

                    const d = new Date(input);
                    if (isNaN(d.getTime())) {
                        return 'Invalid date';
                    }

                    const year = d.getUTCFullYear();
                    if (year < 2024 || year > 2100) {
                        return 'Year must be between 2024 and 2100';
                    }

                    return true;
                },
            },
        ]);

        return new Date(date).toISOString().slice(0, 10);
    },
    askForHourType: async (displayText) => {
        const { hourType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'hourType',
                message: chalk.gray(displayText),
                choices: [
                    { name: 'General', value: 'General' },
                    { name: 'Live', value: 'Live' },
                    { name: 'E-Texting', value: 'E-Texting' },
                    { name: 'Scribing', value: 'Scribing' },
                ],
                pageSize: 4,
                prefix: '',
            },
        ]);
        return hourType;
    },
    askForValue: async (displayText) => {
        const { value } = await inquirer.prompt([
            {
                type: 'input',
                name: 'value',
                prefix: '',
                message: chalk.gray(displayText),
            },
        ]);
        return value;
    },
};
