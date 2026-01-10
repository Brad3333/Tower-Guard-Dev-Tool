const nodemailer = require('nodemailer');
require('dotenv').config();
const chalk = require('chalk');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
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

async function sendTemplatedEmail(
    to,
    subject = 'Tower Guard Reminder',
    text,
    html,
    styles = '',
    title = ''
) {
    const htmlTemplate = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f6f6f6;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #18453B;
                color: white;
                padding: 15px;
                text-align: center;
                border-radius: 8px 8px 0 0;
                font-size: 20px;
                font-weight: bold;
            }
            .content {
                padding: 20px;
                line-height: 1.6;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888888;
                text-align: center;
            }
            ${styles}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">${title ? title : 'Tower Guard Reminder'}</div>
            <div class="content">
                ${html}
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} Tower Guard App Admin. All rights reserved.
            </div>
        </div>
    </body>
    </html>`;

    await sendEmail(to, subject, text, htmlTemplate);
}

module.exports = { sendEmail, sendTemplatedEmail };
