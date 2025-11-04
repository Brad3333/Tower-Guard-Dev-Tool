const fs = require('fs');
const path = require('path');
const result = require('dotenv').config();

const {
    askForEmail,
    askForEmailPass,
    askForDirectory,
    askForServiceAccount
} = require('../prompts');

const vars = ['EMAIL_USER', 'EMAIL_PASS', 'REPORT_DIRECTORY', 'FIREBASE_SERVICE_ACCOUNT'];

const env = {
    EMAIL_USER: process.env[vars[0]],
    EMAIL_PASS: process.env[vars[1]],
    REPORT_DIRECTORY: process.env[vars[2]],
    FIREBASE_SERVICE_ACCOUNT: process.env[vars[3]]
};

async function readSettings() {
    let end = false;

    if (result.error) {
        const envPath = path.resolve(process.cwd(), '.env');
        fs.writeFileSync(envPath, '');
        end = true;
    }

    for (const [key, value] of Object.entries(env)) {
        if (!value) {
            if (key === vars[0]) {
                env.EMAIL_USER = await askForEmail();
            } else if (key === vars[1]) {
                env.EMAIL_PASS = await askForEmailPass();
            } else if (key === vars[2]) {
                const directory = await askForDirectory();
                env.REPORT_DIRECTORY = path.join(directory, 'TG Reports');
            } else if (key === vars[3]) {
                env.FIREBASE_SERVICE_ACCOUNT  = await askForServiceAccount();
            }
        }
    }

    const envContent = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync('.env', envContent);

    if (end) {
        process.exit();
    }

    return { directory: env.REPORT_DIRECTORY };

}

module.exports = readSettings;
