const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyToken = async (req, res, next) => {
    try {
        // Bearer token
        // headers: { authorization: Bearer token}
        if (req?.headers?.authorization?.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            
            jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decode) => {
                if (err) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid access token'
                    });
                }
                
                // Find user and attach to request
                const user = await User.findById(decode.id);
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Require authentication!!!'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('roleId');
        if (!user || !user.roleId || user.roleId.name !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'REQUIRE ADMIN ROLE'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    verifyToken,
    isAdmin
};