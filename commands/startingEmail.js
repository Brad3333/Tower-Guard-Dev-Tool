const { parseExcel } = require('../utils/fileUtils');
const { sendEmail } = require('../utils/email');
const chalk = require('chalk');

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildHoursEmail({ info, numbersOnly, other }) {
    const name = info['Member'] || 'Member';
    const email = info['Email'] || '';
    const total = Number(info['Total'] ?? 0);

    const breakdownRowsHtml = Object.entries(numbersOnly)
        .map(
            ([k, v]) =>
                `<tr><td style="padding:6px 8px;border:1px solid #ccc">${escapeHtml(
                    k
                )}</td><td style="padding:6px 8px;border:1px solid #ccc;text-align:right">${v}</td></tr>`
        )
        .join('');

    const breakdownText = Object.entries(numbersOnly)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n');

    const otherHtml = Object.entries(other)
        .map(
            ([k, v]) =>
                `<tr><td style="padding:6px 8px;border:1px solid #ccc">${escapeHtml(
                    k
                )}</td><td style="padding:6px 8px;border:1px solid #ccc">${escapeHtml(
                    String(v)
                )}</td></tr>`
        )
        .join('');

    const otherText = Object.entries(other)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n');

    const html = `
    <html>
    <body style="font-family: Arial, sans-serif; color:#111; background:#fff; margin:0; padding:20px">
      <p>Hello ${escapeHtml(name)},</p>
      <p>Here’s a summary of your starting Tower Guard hours. If you notice anything that doesn’t look right, or have any questions, please let us know. Make sure to submit forms of any other service opportunites you have completed up to this point.</p>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;margin:12px 0">
        <tr>
          <td style="padding:6px 8px;border:1px solid #ccc;font-weight:bold">Total Hours</td>
          <td style="padding:6px 8px;border:1px solid #ccc;text-align:right">${total}</td>
        </tr>
      </table>
      <h4 style="margin:16px 0 8px 0;font-size:15px">Hours Breakdown</h4>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;margin-bottom:12px">
        ${
            breakdownRowsHtml ||
            `<tr><td style="padding:8px;color:#888">No categories recorded</td></tr>`
        }
      </table>
      ${
          otherHtml
              ? `<h4 style="margin:16px 0 8px 0;font-size:15px">Other</h4>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse">${otherHtml}</table>`
              : ''
      }
      <p style="margin-top:16px">
  Also make sure to fill out the information form if you haven't already: 
  <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=MHEXIi9k2UGSEXQjetVofROd6u4sBe1ItY1nQEM3WfFURTNHT1E2SUhUUlA1UVNJRzFOQTAwOFA1MC4u" 
     style="color:#2b8aef; text-decoration:none">
    Imformation Form
  </a>
</p>
      <p style="margin-top:16px">Thanks,<br/>Tower Guard App Admin</p>
    </body>
    </html>
    `;

    const text = [
        `Hi ${name},`,
        ``,
        `Here’s a summary of your starting Tower Guard hours. If you notice anything that doesn’t look right, or have any questions, please let us know. Make sure to submit forms of any other service opportunites you have completed up to this point.`,
        ``,
        `Total Hours: ${total}`,
        ``,
        `Hours breakdown:`,
        breakdownText || '  (none)',
        ``,
        otherText ? `Other:\n${otherText}` : '',
        ``,
        `Thanks,`,
        `Tower Guard App Admin`,
    ]
        .filter(Boolean)
        .join('\n');

    return { html, text, email };
}

async function startingEmail(filePath) {
    const users = parseExcel(filePath);

    for (const row of users) {
        const numbersOnly = {};
        const info = {};
        const other = {};

        for (const [key, value] of Object.entries(row)) {
            if (typeof value === 'number' && key !== 'Total') {
                numbersOnly[key] = value;
            } else if (key === 'Member' || key === 'Email' || key === 'Total') {
                info[key] = value;
            } else {
                other[key] = value;
            }
        }

        const { html, text, email } = buildHoursEmail({
            info,
            numbersOnly,
            other,
        });

        if (email) {
            try {
                await sendEmail(
                    email.trim(),
                    'Tower Guard Starting Hours Summary',
                    text,
                    html
                );
            } catch (err) {
                console.log(
                    chalk.red(
                        `Failed to send email to ${email}: ${err.message}`
                    )
                );
            }
        } else {
            console.log(chalk.yellow('Skipping row without an email address'));
        }
    }
}

module.exports = startingEmail;
