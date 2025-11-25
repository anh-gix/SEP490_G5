require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/courseModel');
const LevelBandMapping = require('../models/levelBandMappingModel');

async function updateCourseBands() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Lấy tất cả mappings
        const mappings = await LevelBandMapping.find().lean();
        const mappingMap = {};
        mappings.forEach(m => {
            mappingMap[`${m.type}_${m.level}`] = m.band;
        });
        console.log(`📋 Loaded ${mappings.length} level-band mappings\n`);

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

