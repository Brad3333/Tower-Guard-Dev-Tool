const { db } = require('../config/firebase');
const chalk = require('chalk');

async function transferYear(yearInput) {
    const doc = db.collection('global').doc('state');
    const snap = await doc.get();

    const oldYear = snap.exists ? parseInt(snap.data().year) : 2028;
    const newYear = yearInput === 'y' ? String(oldYear + 1) : yearInput;

    await doc.update({ year: newYear });
    console.log(chalk.green.bold(`Year changed from ${oldYear} to ${newYear}`));
}

module.exports = transferYear;
