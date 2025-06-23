const fs = require('fs');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const chalk = require('chalk');
const { sendEmail } = require('../utils/email');

function validateFilePath(path) {
    return fs.existsSync(path);
}

function parseExcel(path) {
    const workbook = XLSX.readFile(path);
    const sheet = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
}

async function writeJsonToExcel(
    jsonData,
    headerOrder,
    outputPath,
    hours,
    send
) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Members');

        // Define columns with headers and auto width
        worksheet.columns = headerOrder.map((header) => ({
            header: header,
            key: header,
            width: Math.max(header.length + 5, 20),
        }));

        // Add data rows
        worksheet.addRows(jsonData);

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            let emailSent = false;

            const fullNameCell = row.getCell('Full Name');
            const emailCell = row.getCell('Email Address');
            const totalHoursCell = row.getCell('Total Hours');
            const liveHoursCell = row.getCell('Live Hours');
            const etextingHoursCell = row.getCell('E-Texting Hours');
            const scribingHoursCell = row.getCell('Scribing Hours');

            if (totalHoursCell.value >= 120) {
                totalHoursCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF0B9A6D' },
                };
                totalHoursCell.font = {
                    color: { argb: 'FFFFFFFF' },
                    bold: true,
                };
            }

            if (totalHoursCell.value < hours) {
                fullNameCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFB6B6' },
                };
                fullNameCell.font = { color: { argb: 'FF000000' }, bold: true };

                if (send && !emailSent) {
                    const htmlContent = `<p>Hi ${fullNameCell.value.split(' ')[0]},</p>
<p>Based on the most recent report you are not on track to meet the 120 hour requirement.</p>
<table>
    <tr><td><strong>Your Total Hours:</strong></td><td>${totalHoursCell.value}</td></tr>
    <tr><td><strong>On Track Total Hours:</strong></td><td>${hours}</td></tr>
</table>
`;
                    await sendEmail(
                        emailCell.value.trim(),
                        'Tower Guard Reminder',
                        '',
                        htmlContent
                    );
                    emailSent = true;
                }
            }

            if (liveHoursCell.value >= 20) {
                liveHoursCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF0B9A6D' },
                };
                liveHoursCell.font = {
                    color: { argb: 'FFFFFFFF' },
                    bold: true,
                };
            }

            if (etextingHoursCell.value >= 10) {
                etextingHoursCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF0B9A6D' },
                };
                etextingHoursCell.font = {
                    color: { argb: 'FFFFFFFF' },
                    bold: true,
                };
            }

            if (scribingHoursCell.value >= 5) {
                scribingHoursCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF0B9A6D' },
                };
                scribingHoursCell.font = {
                    color: { argb: 'FFFFFFFF' },
                    bold: true,
                };
            }

            row.commit(); // Commit cell changes
        }

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // white text
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF18453B' }, // dark green background
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        await workbook.xlsx.writeFile(outputPath);
        console.log(chalk.green.bold(`Exported user data to ${outputPath}`));
    } catch (error) {
        console.error(chalk.red('Failed to export user data:'), error);
    }
}

module.exports = {
    validateFilePath,
    parseExcel,
    writeJsonToExcel,
};
