const jwt = require('jsonwebtoken');

const generateAccessToken = (uid, role) => jwt.sign({ _id: uid, role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '2d' });
const generateRefreshToken = (uid) => jwt.sign({ _id: uid }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

module.exports = {
    generateAccessToken,
    generateRefreshToken
};