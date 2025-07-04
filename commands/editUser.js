const { db } = require('../config/firebase');
const chalk = require('chalk');
const { askForFieldIndex, askForNewValue } = require('../prompts');

async function editUser(email) {
    const snap = await db.collection('users').where('email', '==', email).get();
    if (snap.empty) return console.log(chalk.red(`User ${email} not found.`));

    const ref = snap.docs[0].ref;
    const data = snap.docs[0].data();
    const fields = Object.entries(data);

    const index = await askForFieldIndex(fields);
    const key = fields[index][0];
    const oldValue = fields[index][1];

    console.log(chalk.cyan(`Editing ${key}: current value -> ${oldValue}`));
    const newValue = await askForNewValue();

    let updateData = { [key]: newValue };

    if (
        key.includes('Hours') ||
        ['totalHours', 'attendance', 'excusedAbsences'].includes(key)
    ) {
        updateData[key] = parseInt(newValue, 10);
    } else if (['lastMeeting', 'eboard'].includes(key)) {
        updateData[key] = newValue === 'true';
    }

    if (key.includes('Hours') && key !== 'totalHours') {
        const delta = parseInt(newValue) - data[key];
        updateData.totalHours = (data.totalHours || 0) + delta;
    }

    await ref.update(updateData);
    console.log(
        chalk.green.bold(`Updated ${key} from ${oldValue} to ${newValue}`)
    );
}

module.exports = editUser;
