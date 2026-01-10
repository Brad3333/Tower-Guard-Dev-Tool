const { db } = require('../config/firebase');
const chalk = require('chalk');

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function fix() {
    const uid = 'FUkLC5c6CKQJWhiCzypO7ZXQ0Uq1';
    const snap = await db
        .collection('volunteer_submissions_2028')
        .where('uid', '==', uid)
        .get();

//     const submissions = `Syllabusters*1*2025-09-03*General
// 'I helped Anshuman Patik with his EGR 100 app assignment. I posted on the group me but I still have no clue where to find the form for working with a student.'*1.5*2025-09-21*Live
// 'Helped student with EGR lab 100 preparer at wonders open lab'*1*2025-09-23*Live
// 'Helped Anshuman with EGR 100 paper introduction conclusion and  references'*1.5*2025-09-24*Live
// General Meeting*1*2025-09-24*General
// Tower Tours*1*2025-10-01*General
// 'Anshuman Patik unit conversion and dimensional analysis egr100'*1.5*2025-10-05*Live
// 'Anshuman Patik: egr 100 unit conversions for quiz tomorrow'*1*2025-10-06*Live
// Raising Canes Fundraiser*2*2025-10-06*General`.split('\n');

//     for (const submission of submissions) {
//         const array = submission.split('*');

//         const submissionData = {
//             uid: uid,
//             hourType: array[3],
//             name: 'Avery Kelly',
//             date: array[2],
//             description: array[0],
//             timeSpent: Number(array[1]),
//             timestamp: new Date(),
//             state: 'pending',
//             saved: false,
//         };
//         console.log(submissionData);
//         //await db.collection('volunteer_submissions_2028').add(submissionData);
//     }

    counter = 0

    snap.docs.forEach((doc) => {
        const data = doc.data();

        const date =
            String(data.date).search('T') == -1
                ? data.date
                : getLocalDateString(new Date(data.date));

        const asset = {
            type: data.hourType,
            date,
            time: data.timeSpent,
            description: data.description,
        };

        counter += Number(data.timeSpent)

        console.log(asset);
    });

    console.log("logged hours: ", counter)
    console.log("starting hours: ", 3.5)
    console.log("total: ", counter + 3.5)
}

fix();
