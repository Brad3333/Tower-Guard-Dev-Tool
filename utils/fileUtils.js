const fs = require('fs');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const chalk = require('chalk');
const { sendTemplatedEmail } = require('../utils/email');

function validateFilePath(path) {
    return fs.existsSync(path);
}

function parseExcel(path) {
    const workbook = XLSX.readFile(path);
    const sheet = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
}

function addOnTrackSheet(workbook) {
    const sheet = workbook.addWorksheet('On Track Targets');

    // Define columns
    sheet.columns = [
        { header: 'Semester', key: 'Semester', width: 15 },
        { header: 'Week', key: 'Week', width: 12 },
        { header: 'Date Range', key: 'DateRange', width: 20 },
        { header: 'Notes', key: 'Notes', width: 40 },
        { header: 'Weekly Target', key: 'WeeklyTarget', width: 25 },
        { header: 'Cumulative Target', key: 'CumulativeTarget', width: 30 },
    ];

    // Style header
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF18453B' }, // dark green
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // Add a HOME button as the last cell in the header row
    const homeCell = headerRow.getCell(headerRow.cellCount + 1);
    homeCell.value = { text: 'HOME', hyperlink: "#'Members'!A1" };
    homeCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    homeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF18453B' }, // dark green
    };
    homeCell.alignment = { vertical: 'middle', horizontal: 'center' };
    homeCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    // Define weekly targets
    const fallWeeks = [
        [
            'Week 1',
            'Aug 25 – Aug 31',
            'First week of classes. Labor Day Sept 1',
            4,
        ],
        ['Week 2', 'Sept 1 – Sept 7', 'Labor Day holiday', 4],
        ['Week 3', 'Sept 8 – Sept 14', 'Regular instruction', 4],
        ['Week 4', 'Sept 15 – Sept 21', 'Quarter of semester', 4],
        ['Week 5', 'Sept 22 – Sept 28', 'Regular instruction', 4],
        ['Week 6', 'Sept 29 – Oct 5', 'Regular instruction', 4],
        ['Week 7', 'Oct 6 – Oct 12', 'Mid-semester approaches', 4],
        ['Week 8', 'Oct 13 – Oct 19', 'Midterm week', 4],
        ['Week 9', 'Oct 20 – Oct 26', 'Fall Break Oct 20–21', 4],
        ['Week 10', 'Oct 27 – Nov 2', 'Instruction resumes', 4],
        ['Week 11', 'Nov 3 – Nov 9', 'Regular instruction', 4],
        ['Week 12', 'Nov 10 – Nov 16', 'Spring open enrollment begins', 4],
        ['Week 13', 'Nov 17 – Nov 23', 'Regular instruction', 4],
        ['Week 14', 'Nov 24 – Nov 30', 'Thanksgiving break Nov 27–28', 4],
        ['Week 15', 'Dec 1 – Dec 7', 'Last week of classes', 4],
        ['Finals Week', 'Dec 8 – Dec 12', 'Final exams', 2],
    ];

    const springWeeks = [
        ['Week 1', 'Jan 12 – Jan 18', 'Classes begin Jan 12', 4],
        ['Week 2', 'Jan 19 – Jan 25', 'MLK Day Jan 19, no classes', 4],
        ['Week 3', 'Jan 26 – Feb 1', 'Regular instruction', 4],
        ['Week 4', 'Feb 2 – Feb 8', 'Quarter of semester', 4],
        ['Week 5', 'Feb 9 – Feb 15', 'Regular instruction', 4],
        ['Week 6', 'Feb 16 – Feb 22', 'Mid-semester approaches', 4],
        ['Week 7', 'Feb 23 – Mar 1', 'Midterm week', 4],
        ['Week 8', 'Mar 2 – Mar 8', 'Spring Break Mar 2–8', 0],
        ['Week 9', 'Mar 9 – Mar 15', 'Instruction resumes', 4],
        ['Week 10', 'Mar 16 – Mar 22', 'Regular instruction', 4],
        ['Week 11', 'Mar 23 – Mar 29', 'Regular instruction', 4],
        ['Week 12', 'Mar 30 – Apr 5', 'Regular instruction', 4],
        ['Week 13', 'Apr 6 – Apr 12', 'Regular instruction', 4],
        ['Week 14', 'Apr 13 – Apr 19', 'Regular instruction', 4],
        ['Week 15', 'Apr 20 – Apr 26', 'Last week of classes', 4],
        ['Finals Week', 'Apr 27 – May 1', 'Final exams', 2],
    ];

    let cumulative = 0;

    function addSemesterWeeks(semester, weeks) {
        for (const [week, range, notes, target] of weeks) {
            cumulative += target;
            const row = sheet.addRow({
                Semester: semester,
                Week: week,
                DateRange: range,
                Notes: notes,
                WeeklyTarget:
                    target > 0
                        ? `On track: ${target} hrs`
                        : 'Break / No expected hours',
                CumulativeTarget: `By end of this week: ${cumulative} hrs`,
            });

            // Alternating gray fill
            if (row.number % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD9D9D9' }, // light gray
                    };
                });
            }

            // Style all rows with borders + center align
            row.eachCell((cell) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true,
                };
                // cell.border = {
                //     top: { style: 'thin' },
                //     left: { style: 'thin' },
                //     bottom: { style: 'thin' },
                //     right: { style: 'thin' },
                // };
            });
        }
    }

    addSemesterWeeks('Fall 2025', fallWeeks);
    addSemesterWeeks('Spring 2026', springWeeks);
}

function writeMemberSheet(headerOrder, hours, member, memberSheet) {
    // Goals for each requirement
    const goals = {
        'Total Hours': 120,
        'Live Hours': 20,
        'E-Texting Hours': 10,
        'Scribing Hours': 5,
    };

    // === Row 1: Name + HOME link ===
    const fullName = `${member['First Name']} ${member['Last Name']}`;
    const topRow = memberSheet.addRow([fullName, '', '', 'HOME']);

    // Merge first 3 cells for the name
    memberSheet.mergeCells(`A1:C1`);

    const nameCell = topRow.getCell(1);
    nameCell.font = { bold: true, size: 14, color: { argb: 'FF000000' } };
    nameCell.alignment = { vertical: 'middle', horizontal: 'center' };
    if ((member['Total Hours'] || 0) < hours) {
        nameCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFB6B6' }, // light red
        };
    }

    const homeCell = topRow.getCell(4);
    homeCell.value = { text: 'HOME', hyperlink: '#Members!A1' };
    homeCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    homeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF18453B' }, // dark green
    };
    homeCell.alignment = { vertical: 'middle', horizontal: 'center' };
    homeCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    const onTrackCell = topRow.getCell(5);
    onTrackCell.value = {
        text: 'INFO',
        hyperlink: "#'On Track Targets'!A1",
    };
    onTrackCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    onTrackCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF18453B' }, // dark green
    };
    onTrackCell.alignment = { vertical: 'middle', horizontal: 'center' };
    onTrackCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    // Blank row for spacing
    memberSheet.addRow([]);

    // === Table Header ===
    const header = ['Requirement', 'Completed', 'Goal'];
    const headerRow = memberSheet.addRow(header);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF18453B' }, // dark green
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // === Table Body ===
    Object.entries(goals).forEach(([key, goal], index) => {
        const completed = member[key] || 0;
        const met = completed >= goal;

        const row = memberSheet.addRow([key, completed, goal]);

        // Alternating row fill
        if (index % 2 === 0) {
            row.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD9D9D9' }, // light gray
                };
            });
        }

        // Highlight Completed cell if goal is met
        if (met) {
            const completedCell = row.getCell(2);
            completedCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0B9A6D' }, // green
            };
            completedCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }

        // Borders + alignment
        row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // Column widths
    memberSheet.columns = [
        { key: 'Requirement', width: 20 },
        { key: 'Completed', width: 12 },
        { key: 'Goal', width: 10 },
        { key: 'Status', width: 20 },
    ];
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

        addOnTrackSheet(workbook);

        // Define columns with headers and auto width
        worksheet.columns = headerOrder.map((header) => ({
            header: header,
            key: header,
            width: Math.max(header.length + 5, 20),
        }));

        jsonData.sort((a, b) => {
            const last = a['Last Name'].localeCompare(b['Last Name']);
            if (last !== 0) return last;
            return a['First Name'].localeCompare(b['First Name']);
        });

        // Add data rows
        worksheet.addRows(jsonData);

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);

            // Alternating gray background for readability
            if (rowNumber % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD9D9D9' }, // light gray
                    };
                });
            }

            let emailSent = false;

            const lastNameCell = row.getCell('Last Name');
            const firstNameCell = row.getCell('First Name');
            const emailCell = row.getCell('Email Address');
            const totalHoursCell = row.getCell('Total Hours');
            const liveHoursCell = row.getCell('Live Hours');
            const etextingHoursCell = row.getCell('E-Texting Hours');
            const scribingHoursCell = row.getCell('Scribing Hours');

            // Build the safe sheet name (same logic used later)
            let baseName = makeSafeSheetName(
                `${lastNameCell.value}_${firstNameCell.value}`
            );
            let sheetName = baseName;
            let counter = 1;
            while (workbook.getWorksheet(sheetName)) {
                sheetName = `${baseName}_${counter}`.substring(0, 31);
                counter++;
            }

            // Turn Last Name into a link to that sheet
            lastNameCell.value = {
                text: lastNameCell.value,
                hyperlink: `#'${sheetName}'!A1`,
            };
            lastNameCell.font = {
                color: { argb: 'FF000000' },
                underline: true,
            }; // blue underline like Excel links
            lastNameCell.alignment = { vertical: 'middle', horizontal: 'left' };

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
                // lastNameCell.fill = {
                //     type: 'pattern',
                //     pattern: 'solid',
                //     fgColor: { argb: 'FFFFB6B6' },
                // };
                //lastNameCell.font = { color: { argb: 'FFFFB6B6' }, bold: true, underline: true };
                // firstNameCell.fill = {
                //     type: 'pattern',
                //     pattern: 'solid',
                //     fgColor: { argb: 'FFFFB6B6' },
                // };
                //firstNameCell.font = { color: { argb: 'FFFFB6B6' }, bold: true, underline: true };

                if (send && !emailSent) {
                    const htmlContent = `<p>Hi ${firstNameCell.value},</p>
                <p>Based on the most recent report, you are not on track to meet the 120-hour requirement. Please don't worry if you are not on track, because most people aren't. We split up the hours so that each person is supposed to complete 4 hours per week to stay on track. However, we understand that most people are still figuring out their volunteer opportunites.</p>
                <table>
                    <tr>
                        <td><strong>Your Total Hours:</strong></td>
                        <td>${totalHoursCell.value}</td>
                    </tr>
                    <tr>
                        <td><strong>On Track Total Hours:</strong></td>
                        <td>${hours}</td>
                    </tr>
                </table>
                <p>Make sure to plan your remaining hours accordingly!</p>`;
                    const styles = `
                    table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            table td {
                padding: 10px;
                border: 1px solid #dddddd;
            }`;

                    await sendTemplatedEmail(
                        emailCell.value.trim(),
                        'Tower Guard Reminder',
                        '',
                        htmlContent,
                        styles
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

        // After you've added all rows and styled them
        // Add totals and averages at the bottom
        const lastRowNumber = worksheet.rowCount + 1;

        // Row for totals
        const totalRow = worksheet.addRow({});
        totalRow.getCell('Email Address').value = 'Total';
        [
            'Total Hours',
            'Live Hours',
            'E-Texting Hours',
            'Scribing Hours',
        ].forEach((colKey) => {
            const col = worksheet.getColumn(colKey);
            const colLetter = col.letter;
            totalRow.getCell(colKey).value = {
                formula: `ROUND(SUM(${colLetter}2:${colLetter}${worksheet.rowCount - 1}), 2)`,
            };
        });

        // Row for averages
        const avgRow = worksheet.addRow({});
        avgRow.getCell('Email Address').value = 'Average';
        [
            'Total Hours',
            'Live Hours',
            'E-Texting Hours',
            'Scribing Hours',
        ].forEach((colKey) => {
            const col = worksheet.getColumn(colKey);
            const colLetter = col.letter;
            avgRow.getCell(colKey).value = {
                formula: `ROUND(AVERAGE(${colLetter}2:${colLetter}${worksheet.rowCount - 2}), 2)`,
            };
        });

        // Style totals/averages rows
        [totalRow, avgRow].forEach((row) => {
            row.eachCell((cell, colNumber) => {
                if (colNumber === worksheet.getColumn('Email Address').number) {
                    // Style for the titles ("Total", "Average")
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF18453B' }, // dark green background
                    };
                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                    };
                } else {
                    // Style for the numbers
                    cell.font = { color: { argb: 'FF000000' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD9D9D9' },
                    };
                    cell.alignment = {
                        vertical: 'middle',
                    };
                }
            });
        });

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

        function makeSafeSheetName(name) {
            return name.replace(/[:\\/?*\[\]]/g, '').substring(0, 31);
        }

        for (const member of jsonData) {
            let baseName = makeSafeSheetName(
                `${member['Last Name']}_${member['First Name']}`
            );
            let sheetName = baseName;
            let counter = 1;
            while (workbook.getWorksheet(sheetName)) {
                sheetName = `${baseName}_${counter}`.substring(0, 31);
                counter++;
            }
            const memberSheet = workbook.addWorksheet(sheetName);

            writeMemberSheet(headerOrder, hours, member, memberSheet);
        }

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
