require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/courseModel');
const Program = require('../models/programModel');

/**
 * Migration script to verify and migrate type from Course to Program
 * 
 * This script:
 * 1. Verifies that all courses have a program reference
 * 2. Checks if course.type matches program.type (if course.type exists)
 * 3. Logs any mismatches or issues
 * 4. Since Program already has type field, we just need to verify consistency
 * 
 * Note: After running this migration and verifying, the type field will be removed
 * from Course model and all code should use course.program.type instead
 */

async function migrate() {
    try {
        console.log('🔄 Starting migration: Verifying type field migration from Course to Program\n');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        // Step 1: Get all courses with their program populated
        const courses = await Course.find({})
            .populate('program', 'type')
            .select('name type program');
        
        console.log(`📋 Found ${courses.length} courses to verify\n`);
        
        if (courses.length === 0) {
            console.log('⚠️  No courses found. Migration complete.');
            await mongoose.connection.close();
            return;
        }
        
        // Step 2: Verify consistency
        let validCount = 0;
        let mismatchCount = 0;
        let missingProgramCount = 0;
        let missingTypeCount = 0;
        const mismatches = [];
        
        for (const course of courses) {
            // Check if course has program
            if (!course.program) {
                console.warn(`⚠️  Course "${course.name}" (${course._id}) has no program reference`);
                missingProgramCount++;
                continue;
            }
            
            // Check if program has type
            if (!course.program.type) {
                console.warn(`⚠️  Program for course "${course.name}" (${course._id}) has no type field`);
                missingTypeCount++;
                continue;
            }
            
            // If course has type field, verify it matches program.type
            if (course.type) {
                if (course.type !== course.program.type) {
                    console.warn(`⚠️  Mismatch: Course "${course.name}" has type="${course.type}" but program has type="${course.program.type}"`);
                    mismatches.push({
                        courseId: course._id,
                        courseName: course.name,
                        courseType: course.type,
                        programType: course.program.type
                    });
                    mismatchCount++;
                } else {
                    validCount++;
                }
            } else {
                // Course doesn't have type field - this is fine, we'll use program.type
                validCount++;
            }
        }
        
        console.log('\n📊 Verification Summary:');
        console.log(`  - Total courses: ${courses.length}`);
        console.log(`  - Valid/Consistent: ${validCount}`);
        console.log(`  - Type mismatches: ${mismatchCount}`);
        console.log(`  - Missing program: ${missingProgramCount}`);
        console.log(`  - Missing program type: ${missingTypeCount}\n`);
        
        if (mismatches.length > 0) {
            console.log('⚠️  Type Mismatches Found:');
            mismatches.forEach(m => {
                console.log(`  - Course: "${m.courseName}" (${m.courseId})`);
                console.log(`    Course type: ${m.courseType}`);
                console.log(`    Program type: ${m.programType}`);
            });
            console.log('\n⚠️  WARNING: Some courses have type that doesn\'t match their program type.');
            console.log('   These should be reviewed and fixed manually if needed.\n');
        }
        
        if (missingProgramCount > 0 || missingTypeCount > 0) {
            console.log('⚠️  WARNING: Some courses have missing program references or programs missing type field.');
            console.log('   These must be fixed before removing type field from Course model.\n');
        }
        
        if (mismatchCount === 0 && missingProgramCount === 0 && missingTypeCount === 0) {
            console.log('✅ All courses are consistent! Safe to remove type field from Course model.\n');
        } else {
            console.log('⚠️  Please fix the issues above before removing type field from Course model.\n');
        }
        
        console.log('✅ Migration verification completed!\n');
        console.log('📝 Next steps:');
        console.log('    1. Fix any mismatches or missing data if needed');
        console.log('    2. Remove type field from Course model');
        console.log('    3. Update all code to use course.program.type instead of course.type\n');
        
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    migrate();
}

module.exports = migrate;







