const nodemailer = require('nodemailer');
require('dotenv').config();
const chalk = require('chalk');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail(to, subject, text, html) {
    try {
        await transporter.sendMail({
            from: `"Tower Guard App Admin" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text, // Plain text
            html, // HTML content for Outlook compatibility
        });
        console.log(chalk.green.bold(`Email sent to ${to}`));
    } catch (err) {
        console.error(chalk.red(`Failed to send email to ${to}:`), err.message);
    }
}

module.exports = { sendEmail };
