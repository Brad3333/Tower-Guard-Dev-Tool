const { db } = require('../config/firebase');
const chalk = require('chalk');
const {
    askForOutputPath,
    askToGenerateReport,
    askForHours,
    askToSendEmails,
    askToGeneratePlot,
} = require('../prompts');
const { writeJsonToExcel } = require('../utils/fileUtils');
const createPlot = require('./plot');

const path = require('path');
const { spawn } = require('child_process');

async function exportUsers(yearInput, directory) {
    const date = new Date();
    const formatted = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;

    let filePath = await askForOutputPath();
    let plotPath = '';
    if (filePath.trim() === 'd') {
        filePath = `TG_Report_${formatted}.xlsx`;
        plotPath = `TG_Plot_${formatted}.png`;
    }

    let hours = 0;
    let send = false;

    if (await askToGenerateReport()) {
        hours = await askForHours();
        if (hours === 'd') {
            const pythonPath = path.join(
                __dirname,
                '..',
                'python',
                'get_target.py'
            );
            await new Promise((resolve, reject) => {
                const python = spawn('python', [
                    pythonPath,
                    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                ]);

                python.stdout.on('data', (data) => {
                    const print = data.toString();
                    hours = Number(print)
                });

                python.stderr.on('data', (data) => {
                    console.log(chalk.bold.red(`Error: ${data}`));
                });

                python.on('close', (code) => {
                    if (code === 0) {
                        resolve(); // Python finished successfully
                    } else {
                        reject(
                            new Error(`Python process exited with code ${code}`)
                        );
                    }
                });

                python.on('error', (err) => {
                    reject(err); // Spawn failed
                });
            });
        }
        send = await askToSendEmails();
    }

    const userSnap = await db
        .collection('users')
        .where('year', '==', yearInput.trim())
        .orderBy('name')
        .get();

    let users = [];

    const headerOrder = [
        'Last Name',
        'First Name',
        'Email Address',
        'Total Hours',
        'Live Hours',
        'E-Texting Hours',
        'Scribing Hours',
        'Attendance',
        'Excused Absences',
    ];

    userSnap.forEach((doc) => {
        const data = doc.data();
        const user = {
            'Last Name': data.lastName,
            'First Name': data.firstName,
            'Email Address': data.email,
            'Total Hours': data.totalHours,
            'Live Hours': data.liveHours,
            'E-Texting Hours': data.etextingHours,
            'Scribing Hours': data.scribingHours,
            Attendance: data.attendance,
            'Excused Absences': data.excusedAbsences,
        };
        if (!data.exclude) {
            users.push(user);
        }
    });

    const outputPath = path.join(directory, filePath);
    const outputPathPlot = path.join(directory, plotPath);

    await writeJsonToExcel(users, headerOrder, outputPath, hours, send);

    if (await askToGeneratePlot()) {
        await createPlot(directory, outputPathPlot);
    }
}

module.exports = exportUsers;
