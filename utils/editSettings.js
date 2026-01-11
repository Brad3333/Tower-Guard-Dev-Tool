const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const {
    askForEmailSettings,
    askForEmailPass,
    askForDirectory,
    askForSettingsVar,
    askToUpdateSetting,
} = require('../prompts');

const vars = ['EMAIL_USER', 'EMAIL_PASS', 'REPORT_DIRECTORY'];

const env = {
    EMAIL_USER: process.env[vars[0]],
    EMAIL_PASS: process.env[vars[1]],
    REPORT_DIRECTORY: process.env[vars[2]],
};

const dict = {
    EMAIL_USER: 'Email Address',
    EMAIL_PASS: 'Email Password',
    REPORT_DIRECTORY: 'Report Directory',
};

async function readSettings() {
    const decision = await askForSettingsVar();

    if (decision === 'EMAIL_PASS') {
        console.log(
            chalk.yellow(
                `Current ${dict[decision]}: ${'*'.repeat(env[decision].length)}`
            )
        );
    } else {
        console.log(
            chalk.yellow(`Current ${dict[decision]}: ${env[decision]}`)
        );
    }

    const update = await askToUpdateSetting();

    if (update) {
        if (decision === vars[0]) {
            env.EMAIL_USER = await askForEmailSettings();
        } else if (decision === vars[1]) {
            env.EMAIL_PASS = await askForEmailPass();
        } else if (decision === vars[2]) {
            const directory = await askForDirectory();
            env.REPORT_DIRECTORY = path.join(directory, 'TG Reports');
        }
    }

    const envContent = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync('.env', envContent);

    if (update) {
        if (decision === 'EMAIL_PASS') {
            console.log(
                chalk.green(
                    `Updated ${dict[decision]} to ${'*'.repeat(env[decision].length)}`
                )
            );
        } else
            console.log(
                chalk.green(`Updated ${dict[decision]} to ${env[decision]}`)
            );
    }
}

module.exports = readSettings;
