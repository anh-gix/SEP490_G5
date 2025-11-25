require('dotenv').config();
const mongoose = require('mongoose');
const LevelBandMapping = require('../models/levelBandMappingModel');

// Dữ liệu mapping level-band
const mappings = [
    // IELTS
    { type: 'ielts', level: 'A1', band: '0-2.5' },
    { type: 'ielts', level: 'A2', band: '3.0-3.5' },
    { type: 'ielts', level: 'B1', band: '4.0-5.0' },
    { type: 'ielts', level: 'B2', band: '5.5-6.5' },
    { type: 'ielts', level: 'C1', band: '7.0-8.0' },
    { type: 'ielts', level: 'C2', band: '8.5-9.0' },
    // TOEIC
    { type: 'toeic', level: 'A1', band: '0-250' },
    { type: 'toeic', level: 'A2', band: '251-500' },
    { type: 'toeic', level: 'B1', band: '501-700' },
    { type: 'toeic', level: 'B2', band: '701-900' },
    { type: 'toeic', level: 'C1', band: '901-990' },
    { type: 'toeic', level: 'C2', band: '990+' },
    // CAM
    { type: 'cam', level: 'Pre-A1', band: 'Starter' },
    { type: 'cam', level: 'A1', band: 'Mover' }
];

async function seed() {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.DB_NAME,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Xóa dữ liệu cũ (optional - comment nếu muốn giữ lại)
        await LevelBandMapping.deleteMany({});
        console.log('Cleared existing mappings');

        // Insert dữ liệu mới
        await LevelBandMapping.insertMany(mappings);
        console.log(`✅ Successfully seeded ${mappings.length} level-band mappings`);

        // Hiển thị dữ liệu đã seed
        const allMappings = await LevelBandMapping.find().sort({ type: 1, level: 1 });
        console.log('\n📋 Level-Band Mappings:');
        allMappings.forEach(m => {
            console.log(`  ${m.type.toUpperCase()}: ${m.level} → ${m.band}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding mappings:', error);
        process.exit(1);
    }
}

// Chạy seed
seed();

