function customize(message, userData, special) {
    return message.replace(/\*\*[a-zA-Z0-9]+/g, (match) => {
        switch (match) {
            case '**name':
                return userData.name;
            case '**first':
                return userData.firstName;
            case '**last':
                return userData.lastName;
            case '**email':
                return userData.email;
            case '**total':
                return String(userData.totalHours);
            case '**live':
                return String(userData.liveHours);
            case '**etext':
                return String(userData.etextingHours);
            case '**scribe':
                return String(userData.scribingHours);
            case '**attendance':
                return String(userData.attendance);
            case '**excused':
                return String(userData.excusedAbsences);
            case '**end':
                return 'Regards,\nTower Guard App Admin';
            default:
                // Handle **0, **1, **2, etc.
                const numMatch = match.match(/^\*\*(\d+)/);
                if (numMatch) {
                    const index = Number(numMatch[1]);
                    return (
                        (special[index] ?? match) +
                        match.slice(numMatch[0].length)
                    );
                }
                return match; // unknown token
        }
    });
}

module.exports = customize;
