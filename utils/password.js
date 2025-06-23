function generateRandomPassword(length = 8) {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}

module.exports = { generateRandomPassword };
