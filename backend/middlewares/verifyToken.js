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
                const user = await User.findById(decode.id).populate('roleId');
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

// Helper function to ensure user role is populated
const ensureRolePopulated = async (req) => {
    // If roleId is not populated (it's an ObjectId string), populate it
    if (!req.user.roleId || typeof req.user.roleId === 'string' || !req.user.roleId.name) {
        const user = await User.findById(req.user._id).populate('roleId');
        if (!user) {
            throw new Error('User not found');
        }
        req.user = user;
    }
    return req.user;
};

// Check if user has a specific role
const hasRole = (roleName) => {
    return async (req, res, next) => {
        try {
            await ensureRolePopulated(req);
            
            if (!req.user || !req.user.roleId || req.user.roleId.name !== roleName) {
                return res.status(403).json({
                    success: false,
                    message: `Require ${roleName} role`
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Server error'
            });
        }
    };
};

// Check if user has any of the specified roles
// Usage: hasAnyRole('admin', 'teacher') or hasAnyRole(['admin', 'teacher'])
const hasAnyRole = (...roles) => {
    return async (req, res, next) => {
        try {
            await ensureRolePopulated(req);
            
            if (!req.user || !req.user.roleId) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found'
                });
            }
            
            // Flatten array if roles is passed as array
            const roleList = Array.isArray(roles[0]) ? roles[0] : roles;
            
            const userRole = req.user.roleId.name;
            if (!roleList.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Require one of the following roles: ${roleList.join(', ')}`
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Server error'
            });
        }
    };
};

// Check if user has all of the specified roles (for future multi-role support)
// Usage: hasAllRoles('admin', 'teacher') or hasAllRoles(['admin', 'teacher'])
const hasAllRoles = (...roles) => {
    return async (req, res, next) => {
        try {
            await ensureRolePopulated(req);
            
            if (!req.user || !req.user.roleId) {
                return res.status(403).json({
                    success: false,
                    message: 'User role not found'
                });
            }
            
            // Flatten array if roles is passed as array
            const roleList = Array.isArray(roles[0]) ? roles[0] : roles;
            
            const userRole = req.user.roleId.name;
            // Since user has only one role, check if it's in the required roles
            if (!roleList.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Require all of the following roles: ${roleList.join(', ')}`
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Server error'
            });
        }
    };
};


// Common role checks
const isStudent = hasRole('Student');
const isTeacher = hasRole('Teacher');
const isAcademicStaff = hasRole('Academic Staff');
const isSubjectLeader = hasRole('Subject Leader');
const isCenterHead = hasRole('Center Head');

// Combined role checks
const isTeacherOrSubjectLeader = hasAnyRole('Teacher', 'Subject Leader');
const isAcademicStaffOrCenterHead = hasAnyRole('Academic Staff', 'Center Head');

module.exports = {
    verifyToken,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isStudent,
    isTeacher,
    isAcademicStaff,
    isSubjectLeader,
    isCenterHead,
    isTeacherOrSubjectLeader,
    isAcademicStaffOrCenterHead
};