const { spawn } = require('child_process');
const chalk = require('chalk');
const { askForPlotAction } = require('../prompts');
const path = require('path');

async function createPlot(directory, outputPath) {
    // Wait for user choice
    const actions = await askForPlotAction();

    const pythonPath = path.join(__dirname, '..', 'python', 'plot.py');

    // Wrap spawn in a promise so we can await it
    await new Promise((resolve, reject) => {
        const python = spawn('python', [
            pythonPath,
            directory,
            outputPath,
            ...actions,
        ]);

        python.stdout.on('data', (data) => {
            const print = data.toString();
            for (const line of print.split('\n')) {
                if (line.trim() !== '') {
                    console.log(chalk.green(line));
                }
            }
        });

        python.stderr.on('data', (data) => {
            console.log(chalk.bold.red(`Error: ${data}`));
        });

        python.on('close', (code) => {
            if (code === 0) {
                resolve(); // Python finished successfully
            } else {
                reject(new Error(`Python process exited with code ${code}`));
            }
        });

        python.on('error', (err) => {
            reject(err); // Spawn failed
        });
    });
}

module.exports = createPlot;
