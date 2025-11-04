const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const {
    askForEmail,
    askForEmailPass,
    askForDirectory,
    askForSettingsVar,
    askToUpdateSetting,
    askForServiceAccount
} = require('../prompts');

const vars = ['EMAIL_USER', 'EMAIL_PASS', 'REPORT_DIRECTORY', 'FIREBASE_SERVICE_ACCOUNT'];

const env = {
    EMAIL_USER: process.env[vars[0]],
    EMAIL_PASS: process.env[vars[1]],
    REPORT_DIRECTORY: process.env[vars[2]],
    FIREBASE_SERVICE_ACCOUNT: process.env[vars[3]]
};

const dict = {
    EMAIL_USER: 'Email Address',
    EMAIL_PASS: 'Email Password',
    REPORT_DIRECTORY: 'Report Directory',
    FIREBASE_SERVICE_ACCOUNT: 'Firebase Servive Account Path'
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
            env.EMAIL_USER = await askForEmail();
        } else if (decision === vars[1]) {
            env.EMAIL_PASS = await askForEmailPass();
        } else if (decision === vars[2]) {
            const directory = await askForDirectory();
            env.REPORT_DIRECTORY = path.join(directory, 'TG Reports');
        } else if(decision === vars[3]) {
            env.FIREBASE_SERVICE_ACCOUNT  = await askForServiceAccount();
        }
    }

    const envContent = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync('.env', envContent);

    console.log(chalk.green(`Updated ${dict[decision]} to ${env[decision]}`));
}

module.exports = readSettings;
