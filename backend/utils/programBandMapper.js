/**
 * Utility for mapping program level and type to corresponding band scores
 */

const LEVEL_BAND_MAPPING = {
    ielts: {
        'Pre-A1': '0 - 1.0',
        'A1': '1.0 - 2.5',
        'A2': '3.0 - 3.5',
        'B1': '4.0 - 5.0',
        'B2': '5.5 - 6.5',
        'C1': '7.0 - 8.5',
        'C2': '9.0'
    },
    toeic: {
        'Pre-A1': '0 - 250',
        'A1': '0 - 250',
        'A2': '255 - 500',
        'B1': '501 - 700',
        'B2': '701 - 900',
        'C1': '901 - 990',
        'C2': '901 - 990'
    },
    cam: {
        'Pre-A1': 'Starter',
        'A1': 'Mover',
        'A2': 'Flyer',
        'B1': 'KET',
        'B2': 'PET',
        'C1': 'FCE',
        'C2': 'CAE'
    }
};

/**
 * Get band score based on program type and level
 * @param {string} type - Program type (ielts, toeic, cam)
 * @param {string} level - CEFR level (Pre-A1, A1, A2, B1, B2, C1, C2)
 * @returns {string|null} - Band score or null if not found
 */
const getBandByTypeAndLevel = (type, level) => {
    if (!type || !level) return null;

    const mapping = LEVEL_BAND_MAPPING[type.toLowerCase()];
    if (!mapping) return null;

    return mapping[level] || null;
};

/**
 * Get all band options for a specific type
 * @param {string} type - Program type (ielts, toeic, cam)
 * @returns {object|null} - Object with level as key and band as value
 */
const getBandOptionsByType = (type) => {
    if (!type) return null;
    return LEVEL_BAND_MAPPING[type.toLowerCase()] || null;
};

/**
 * Validate if a band score is valid for given type and level
 * @param {string} type - Program type
 * @param {string} level - CEFR level
 * @param {string} band - Band score to validate
 * @returns {boolean}
 */
const isValidBand = (type, level, band) => {
    const expectedBand = getBandByTypeAndLevel(type, level);
    return expectedBand === band;
};

/**
 * Get the mapping table
 * @returns {object} - Complete mapping table
 */
const getMappingTable = () => {
    return LEVEL_BAND_MAPPING;
};

module.exports = {
    getBandByTypeAndLevel,
    getBandOptionsByType,
    isValidBand,
    getMappingTable,
    LEVEL_BAND_MAPPING
};
