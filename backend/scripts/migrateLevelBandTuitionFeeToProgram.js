require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/courseModel');
const Program = require('../models/programModel');

/**
 * Migration script to move level, band, and tuitionFee from Course to Program
 * 
 * This script:
 * 1. Groups courses by type+level combination
 * 2. Creates programs for each unique type+level combination
 * 3. Updates all courses to reference the correct program
 * 4. Note: The model changes (removing fields from Course, adding to Program) 
 *    should be applied separately after running this migration
 */

async function migrate() {
    try {
        console.log('🔄 Starting migration: Moving level, band, tuitionFee from Course to Program\n');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database\n');
        
        // Step 1: Get all courses with their level, band, tuitionFee
        const courses = await Course.find({}).select('type level band tuitionFee program');
        console.log(`📋 Found ${courses.length} courses to process\n`);
        
        if (courses.length === 0) {
            console.log('⚠️  No courses found. Migration complete.');
            await mongoose.connection.close();
            return;
        }
        
        // Step 2: Group courses by type+level and collect unique combinations
        const typeLevelMap = new Map();
        
        courses.forEach(course => {
            if (!course.type || !course.level) {
                console.warn(`⚠️  Skipping course ${course._id}: missing type or level`);
                return;
            }
            
            const key = `${course.type}_${course.level}`;
            
            if (!typeLevelMap.has(key)) {
                typeLevelMap.set(key, {
                    type: course.type,
                    level: course.level,
                    band: course.band || null,
                    tuitionFee: course.tuitionFee || 0,
                    courseIds: []
                });
            }
            
            // If multiple courses have different band/tuitionFee, use the first non-null value
            const existing = typeLevelMap.get(key);
            if (!existing.band && course.band) {
                existing.band = course.band;
            }
            if (existing.tuitionFee === 0 && course.tuitionFee) {
                existing.tuitionFee = course.tuitionFee;
            }
            
            existing.courseIds.push(course._id);
        });
        
        console.log(`📊 Found ${typeLevelMap.size} unique type+level combinations:\n`);
        typeLevelMap.forEach((value, key) => {
            console.log(`  - ${key}: ${value.courseIds.length} courses, band=${value.band}, tuitionFee=${value.tuitionFee}`);
        });
        console.log('');
        
        // Step 3: Create programs for each type+level combination
        const programMap = new Map(); // Map type_level -> programId
        
        for (const [key, data] of typeLevelMap.entries()) {
            // Check if program already exists
            let program = await Program.findOne({ type: data.type, level: data.level });
            
            if (!program) {
                // Create new program
                const programCode = `${data.type.toUpperCase()}_${data.level}`;
                const programName = `${data.type.toUpperCase()} ${data.level}`;
                
                program = new Program({
                    code: programCode,
                    program_name: programName,
                    description: `Chương trình ${data.type.toUpperCase()} - Level ${data.level}`,
                    type: data.type,
                    level: data.level,
                    band: data.band,
                    tuitionFee: data.tuitionFee,
                    status: 'active'
                });
                
                await program.save();
                console.log(`✅ Created program: ${programCode} (${programName})`);
            } else {
                console.log(`ℹ️  Program already exists: ${program.code}`);
                
                // Update band and tuitionFee if they're missing in program but present in courses
                let updated = false;
                if (!program.band && data.band) {
                    program.band = data.band;
                    updated = true;
                }
                if (program.tuitionFee === 0 && data.tuitionFee) {
                    program.tuitionFee = data.tuitionFee;
                    updated = true;
                }
                if (updated) {
                    await program.save();
                    console.log(`  ↻ Updated program with band/tuitionFee`);
                }
            }
            
            programMap.set(key, program._id);
        }
        
        console.log('');
        
        // Step 4: Update all courses to reference the correct program
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const [key, data] of typeLevelMap.entries()) {
            const programId = programMap.get(key);
            
            for (const courseId of data.courseIds) {
                const course = await Course.findById(courseId);
                if (!course) {
                    console.warn(`⚠️  Course ${courseId} not found`);
                    skippedCount++;
                    continue;
                }
                
                // Only update if program is different
                if (course.program.toString() !== programId.toString()) {
                    course.program = programId;
                    await course.save();
                    updatedCount++;
                } else {
                    skippedCount++;
                }
            }
        }
        
        console.log(`✅ Updated ${updatedCount} courses to reference correct programs`);
        console.log(`ℹ️  Skipped ${skippedCount} courses (already correct or no program needed)\n`);
        
        // Step 5: Summary
        console.log('📊 Migration Summary:');
        console.log(`  - Programs created/updated: ${programMap.size}`);
        console.log(`  - Courses processed: ${courses.length}`);
        console.log(`  - Courses updated: ${updatedCount}`);
        console.log(`  - Courses skipped: ${skippedCount}\n`);
        
        console.log('✅ Migration completed successfully!\n');
        console.log('⚠️  IMPORTANT: After verifying the migration, update the models to:');
        console.log('    1. Remove level, band, tuitionFee from Course model');
        console.log('    2. Ensure type, level, band, tuitionFee are in Program model\n');
        
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




