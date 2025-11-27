require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/courseModel');

async function updateCourseBands() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Hardcoded mapping (since LevelBandMapping is removed)
        const mappingMap = {
            'ielts_A1': '0-2.5',
            'ielts_A2': '3.0-3.5',
            'ielts_B1': '4.0-5.0',
            'ielts_B2': '5.5-6.5',
            'ielts_C1': '7.0-8.0',
            'ielts_C2': '8.5-9.0',
            'toeic_A1': '0-250',
            'toeic_A2': '251-500',
            'toeic_B1': '501-700',
            'toeic_B2': '701-900',
            'toeic_C1': '901-990',
            'toeic_C2': '990+',
            'cam_Pre-A1': 'Starter',
            'cam_A1': 'Mover'
        };
        console.log(`📋 Loaded ${Object.keys(mappingMap).length} level-band mappings\n`);

        // Lấy tất cả courses chưa có band hoặc band rỗng
        const courses = await Course.find({
            $or: [
                { band: { $exists: false } },
                { band: null },
                { band: '' }
            ]
        });

        console.log(`📝 Found ${courses.length} courses without band\n`);

        let updated = 0;
        for (const course of courses) {
            if (course.type && course.level) {
                const key = `${course.type}_${course.level}`;
                const band = mappingMap[key];
                
                if (band) {
                    course.band = band;
                    await course.save();
                    updated++;
                    console.log(`✅ Updated: ${course.name} (${course.type} ${course.level}) → ${band}`);
                } else {
                    console.log(`⚠️  No mapping found for: ${course.name} (${course.type} ${course.level})`);
                }
            }
        }

        console.log(`\n✨ Update completed! Updated ${updated} courses`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating course bands:', error);
        process.exit(1);
    }
}

// Chạy update
updateCourseBands();

