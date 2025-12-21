import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
import programService from '../../services/programService';
import { courseService } from '../../services/courseService';
import * as XLSX from 'xlsx';

/**
 * Import Student From Excel Component
 * Component để import học viên từ file Excel
 * @param {function} onBack - Callback để quay lại danh sách (optional, fallback to navigate)
 */
const ImportStudentFromExcel = ({ onBack }) => {
  const navigate = useNavigate();
  const [importFile, setImportFile] = useState(null);
  const [previewStudents, setPreviewStudents] = useState([]);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const fileInputRef = useRef(null);

  // Helper function to parse levelsToStudy string into array of levels
  // Example: "B1 → B2" → ["B1", "B2"]
  // Example: "A1 → A2 → B1" → ["A1", "A2", "B1"]
  const parseLevelsToStudy = (levelsToStudyStr) => {
    if (!levelsToStudyStr || typeof levelsToStudyStr !== 'string') {
      return [];
    }
    const cleaned = levelsToStudyStr.trim();
    if (!cleaned) return [];
    const levels = cleaned
      .split(/→|->/)
      .map(level => level.trim())
      .filter(level => level.length > 0);
    return levels;
  };

  // Function to get courses for a student based on program codes
  const getCoursesByProgramCodes = async (programCode) => {
    if (!programCode || !programCode.trim()) return [];

    try {
      // Parse multiple program codes
      const programCodes = programCode
        .split(/[,;|]/)
        .map(code => code.trim())
        .filter(code => code.length > 0);

      if (programCodes.length === 0) return [];

      // Find programs matching the codes
      const matchingPrograms = programs.filter(p =>
        programCodes.includes(p.code) && p.status === 'active'
      );

      if (matchingPrograms.length === 0) return [];

      const programIds = matchingPrograms.map(p => p._id);

      // Fetch courses for all programs at once using the new endpoint
      try {
        const response = await courseService.getCoursesByProgramId(programIds);
        if (response?.success && response.courses) {
          // Extract unique course names
          const uniqueCourseNames = [...new Set(response.courses.map(c => c.name))];
          return uniqueCourseNames;
        }
        return [];
      } catch (error) {
        console.error('Error fetching courses by program IDs:', error);
        return [];
      }
    } catch (error) {
      console.error('Error getting courses by program codes:', error);
      return [];
    }
  };

  // Fetch active programs from database on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await programService.getAllPrograms();
        const allPrograms = response.data || [];
        // Filter only active programs
        const activePrograms = allPrograms.filter(p => p.status === 'active');
        setPrograms(activePrograms);
      } catch (error) {
        // Continue with empty array if fetch fails
        setPrograms([]);
      }
    };
    fetchPrograms();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const isValidType = validTypes.includes(file.type) || 
                       file.name.endsWith('.xlsx') || 
                       file.name.endsWith('.xls');

    if (!isValidType) {
      toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      e.target.value = '';
      return;
    }

    setImportFile(file);
    setPreviewStudents([]);
  };

  const handlePreviewExcel = async () => {
    if (!importFile) {
      toast.warning('Vui lòng chọn file Excel');
      return;
    }

    setImporting(true);
    try {
      // Read file as array buffer
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        toast.error('File Excel không có sheet nào');
        setImporting(false);
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        toast.error('Sheet đầu tiên không có dữ liệu');
        setImporting(false);
        return;
      }

      // Get range of worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // First, get headers to find phone column index
      const headerRow = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellAddress];
        headerRow.push(cell ? (cell.w || cell.v || '') : '');
      }
      
      const phoneHeaderIndex = headerRow.findIndex(h => 
        h && (h.toString().toLowerCase().includes('phone') || 
              h.toString().toLowerCase().includes('số điện thoại') ||
              h.toString().toLowerCase().includes('điện thoại'))
      );

      // Convert to JSON (array of objects) - use raw: true to get raw values
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: true, 
        defval: ''
      });

      if (!jsonData || jsonData.length === 0) {
        toast.error('File Excel không có dữ liệu');
        setImporting(false);
        return;
      }

      // Helper function to normalize Cambridge level names
      const normalizeCambridgeLevel = (level) => {
        if (!level) return '';
        const levelStr = level.toString().trim();
        const levelLower = levelStr.toLowerCase();
        if (levelLower === 'starter') return 'Pre-A1';
        if (levelLower === 'mover') return 'A1';
        // If already in CEFR format, return as is
        if (levelStr === 'Pre-A1' || levelStr === 'A1') return levelStr;
        return levelStr;
      };

      // Helper function to get band order for comparison
      const getLevelOrder = (level) => {
        // Normalize Cambridge levels first
        const normalizedLevel = normalizeCambridgeLevel(level);
        const levelMap = {
          'Pre-A1': 0,
          'A1': 1,
          'A2': 2,
          'B1': 3,
          'B2': 4,
          'C1': 5,
          'C2': 6
        };
        return levelMap[normalizedLevel] !== undefined ? levelMap[normalizedLevel] : -1;
      };

      // Helper function to get band name from order
      const getLevelName = (order) => {
        const levelMap = {
          0: 'Pre-A1',
          1: 'A1',
          2: 'A2',
          3: 'B1',
          4: 'B2',
          5: 'C1',
          6: 'C2'
        };
        return levelMap[order] || '';
      };

      // Helper function to validate score by type
      const validateScore = (score, type) => {
        if (!score || !type) return false;
        
        const scoreStr = score.toString().trim();
        const typeStr = type.toString().trim().toLowerCase();
        
        if (typeStr === 'ielts') {
          const num = parseFloat(scoreStr);
          return !isNaN(num) && num >= 0 && num <= 9.0;
        } else if (typeStr === 'toeic') {
          const num = parseInt(scoreStr);
          return !isNaN(num) && num >= 0 && num <= 990;
        } else if (typeStr === 'cambridge' || typeStr === 'cam') {
          // Cambridge uses level names: Starter (Pre-A1) or Mover (A1)
          const normalized = normalizeCambridgeLevel(scoreStr);
          return normalized === 'Pre-A1' || normalized === 'A1';
        }
        return false;
      };

      // Helper function to check if a value is numeric (score) or CEFR level
      const isNumericScore = (value) => {
        if (!value) return false;
        const valueStr = value.toString().trim();
        // Check if it's a number (can be integer or decimal)
        return /^\d+(\.\d+)?$/.test(valueStr);
      };

      // Helper function to map numeric score to program level based on band ranges
      const mapScoreToLevel = (score, type, programs) => {
        if (!score || !type || !programs || programs.length === 0) {
          return null;
        }

        const scoreNum = type.toLowerCase() === 'ielts' 
          ? parseFloat(score.toString().trim())
          : parseInt(score.toString().trim());

        if (isNaN(scoreNum)) {
          return null;
        }

        const typeStr = type.toString().trim().toLowerCase();
        
        // Find programs matching the type
        const matchingPrograms = programs.filter(p => 
          p.type && p.type.toLowerCase() === typeStr && p.band
        );

        // Sort programs by level order to find the best match
        const levelOrder = {
          'Pre-A1': 0,
          'A1': 1,
          'A2': 2,
          'B1': 3,
          'B2': 4,
          'C1': 5,
          'C2': 6
        };

        // Try to find a program whose band range contains the score
        for (const program of matchingPrograms) {
          if (!program.band) continue;

          const bandStr = program.band.toString().trim();
          
          // Parse band range (e.g., "4.0-5.0" or "501-700")
          const rangeMatch = bandStr.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
          if (rangeMatch) {
            const min = typeStr === 'ielts' 
              ? parseFloat(rangeMatch[1])
              : parseInt(rangeMatch[1]);
            const max = typeStr === 'ielts'
              ? parseFloat(rangeMatch[2])
              : parseInt(rangeMatch[2]);

            if (!isNaN(min) && !isNaN(max) && scoreNum >= min && scoreNum <= max) {
              return program.level;
            }
          }
        }

        // If no exact match found, find the closest program level
        // Sort by level order and find the first level where score is less than or equal to max
        const sortedPrograms = matchingPrograms
          .filter(p => p.band && p.level)
          .sort((a, b) => {
            const orderA = levelOrder[a.level] || 999;
            const orderB = levelOrder[b.level] || 999;
            return orderA - orderB;
          });

        for (const program of sortedPrograms) {
          const bandStr = program.band.toString().trim();
          const rangeMatch = bandStr.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
          if (rangeMatch) {
            const max = typeStr === 'ielts'
              ? parseFloat(rangeMatch[2])
              : parseInt(rangeMatch[2]);
            
            if (!isNaN(max) && scoreNum <= max) {
              return program.level;
            }
          }
        }

        return null;
      };

      // Helper function to calculate bands to study from currentLevel to aim
      const calculateLevelsToStudy = (currentLevel, aim, type) => {
        if (!currentLevel || !aim) return '';
        
        const currentLevelStr = currentLevel.toString().trim();
        const aimStr = aim.toString().trim();
        const typeStr = type ? type.toString().trim().toLowerCase() : '';
        const isCambridge = typeStr === 'cambridge' || typeStr === 'cam';
        
        // For Cambridge, normalize level names first
        if (isCambridge) {
          const normalizedCurrent = normalizeCambridgeLevel(currentLevelStr);
          const normalizedAim = normalizeCambridgeLevel(aimStr);
          
          const currentOrder = getLevelOrder(normalizedCurrent);
          const aimOrder = getLevelOrder(normalizedAim);
          
          if (currentOrder === -1 || aimOrder === -1 || aimOrder <= currentOrder) {
            return '';
          }
          
          // Calculate all levels from currentLevel to aim
          const levelsToStudy = [];
          for (let order = currentOrder; order <= aimOrder; order++) {
            const levelName = getLevelName(order);
            if (levelName) {
              levelsToStudy.push(levelName);
            }
          }
          
          return levelsToStudy.join(' → ');
        }
        
        // Check if values are numeric scores
        const currentLevelIsNumeric = isNumericScore(currentLevelStr);
        const aimIsNumeric = isNumericScore(aimStr);
        
        if (typeStr && (currentLevelIsNumeric || aimIsNumeric)) {
          // Try to map numeric scores to program levels
          const startLevel = mapScoreToLevel(currentLevelStr, typeStr, programs);
          const endLevel = mapScoreToLevel(aimStr, typeStr, programs);
          
          // If both mappings succeeded, calculate progression from start to end level
          if (startLevel && endLevel) {
            const startOrder = getLevelOrder(startLevel);
            const endOrder = getLevelOrder(endLevel);
            
            // If start level is higher than end level, we need to find the correct start level
            // The start level should be the level that contains the current score
            // The end level should be the level that contains the aim score
            // But we want to start from the level that contains current score, not necessarily the exact level
            if (startOrder !== -1 && endOrder !== -1 && endOrder > startOrder) {
              const levelsToStudy = [];
              for (let order = startOrder; order <= endOrder; order++) {
                const levelName = getLevelName(order);
                if (levelName) {
                  levelsToStudy.push(levelName);
                }
              }
              return levelsToStudy.join(' → ');
            } else if (startOrder !== -1 && endOrder !== -1 && endOrder === startOrder) {
              // If both map to same level, just return that level
              return startLevel;
            }
          }
          
          // Fallback: if mapping failed, return simple score format
          return `${currentLevelStr} → ${aimStr}`;
        }
        
        // For CEFR levels, calculate progression
        const currentOrder = getLevelOrder(currentLevelStr);
        const aimOrder = getLevelOrder(aimStr);
        
        if (currentOrder === -1 || aimOrder === -1 || aimOrder <= currentOrder) {
          return '';
        }
        
        // Calculate all bands from currentLevel to aim (bao gồm cả currentLevel)
        const levelsToStudy = [];
        for (let order = currentOrder; order <= aimOrder; order++) {
          const levelName = getLevelName(order);
          if (levelName) {
            levelsToStudy.push(levelName);
          }
        }
        
        return levelsToStudy.join(' → ');
      };

      // Parse and validate each row
      const previewData = [];
      jsonData.forEach((row, index) => {
        const rowNumber = index + 2; // +2 vì có header và index bắt đầu từ 0
        const errors = [];

        // Get data from Excel (support both Vietnamese and English)
        const username = row.username || row.Username || row['Tên đăng nhập'] || row['username'] || '';
        const email = row.email || row.Email || row['Email'] || '';
        let phone = row.phone || row.Phone || row['Số điện thoại'] || row['Điện thoại'] || '';
        
        // Convert phone to string first
        phone = phone ? String(phone) : '';
        phone = phone.trim();
        
        // Remove any non-digit characters (spaces, dashes, etc.)
        phone = phone.replace(/\D/g, '');
        
        // Always add leading zero if phone doesn't start with 0
        // This handles the case where Excel removes leading zeros from phone numbers
        if (phone && phone.length > 0 && phone[0] !== '0') {
          phone = '0' + phone;
        }
        
        const address = row.address || row.Address || row['Địa chỉ'] || '';
        
        // Parse new columns (support both Vietnamese and English)
        const aim = row.aim || row.Aim || row['Điểm mục tiêu'] || row['Mục tiêu'] || '';
        const currentLevel = row.currentLevel || row.CurrentLevel || row['Trình độ hiện tại'] || row['Trình độ'] || '';
        const type = row.type || row.Type || row['Loại'] || row['Chương trình'] || '';
        const programCode = row.programCode || row.ProgramCode || row['Mã chương trình'] || row['program_code'] || '';

        // Validate
        if (!username || !username.toString().trim()) {
          errors.push('Username không được để trống');
        }

        if (!email || !email.toString().trim()) {
          errors.push('Email không được để trống');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toString())) {
          errors.push('Email không hợp lệ');
        }

        if (!phone || !phone.toString().trim()) {
          errors.push('Số điện thoại không được để trống');
        } else {
          // Validate phone length (10-11 digits after normalization)
          const phoneDigits = phone.replace(/\D/g, '');
          if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            errors.push('Số điện thoại phải có 10 hoặc 11 chữ số');
          }
        }

        if (!address || !address.toString().trim()) {
          errors.push('Địa chỉ không được để trống');
        }

        // Validate program code - REQUIRED
        if (!programCode || !programCode.toString().trim()) {
          errors.push('Mã chương trình (Program Code) không được để trống');
        }

        // Validate aim and currentLevel based on type
        if (aim && currentLevel) {
          const aimStr = aim.toString().trim();
          const currentLevelStr = currentLevel.toString().trim();
          const typeStr = type ? type.toString().trim().toLowerCase() : '';
          
          // Check if Cambridge type
          const isCambridge = typeStr === 'cambridge' || typeStr === 'cam';
          
          if (isCambridge) {
            // Cambridge uses level names (Starter/Mover or Pre-A1/A1)
            const normalizedAim = normalizeCambridgeLevel(aimStr);
            const normalizedCurrentLevel = normalizeCambridgeLevel(currentLevelStr);
            
            if (!validateScore(aimStr, typeStr)) {
              errors.push(`Điểm mục tiêu không hợp lệ cho Cambridge. Phải là Starter hoặc Mover (hoặc Pre-A1, A1)`);
            } else if (!validateScore(currentLevelStr, typeStr)) {
              errors.push(`Trình độ hiện tại không hợp lệ cho Cambridge. Phải là Starter hoặc Mover (hoặc Pre-A1, A1)`);
            } else {
              // Compare levels
              const aimOrder = getLevelOrder(normalizedAim);
              const currentLevelOrder = getLevelOrder(normalizedCurrentLevel);
              
              if (aimOrder <= currentLevelOrder) {
                errors.push('Điểm mục tiêu phải cao hơn trình độ hiện tại (Starter → Mover)');
              }
            }
          } else {
            // Check if values are numeric scores or CEFR levels
            const aimIsNumeric = isNumericScore(aimStr);
            const currentLevelIsNumeric = isNumericScore(currentLevelStr);
            
            if (typeStr && (aimIsNumeric || currentLevelIsNumeric)) {
              // Validate as numeric scores based on type
              if (!validateScore(aimStr, typeStr)) {
                errors.push(`Điểm mục tiêu không hợp lệ cho ${typeStr.toUpperCase()}. ${typeStr === 'ielts' ? 'Phải là số từ 0.0 đến 9.0' : 'Phải là số từ 0 đến 990'}`);
              } else if (!validateScore(currentLevelStr, typeStr)) {
                errors.push(`Trình độ hiện tại không hợp lệ cho ${typeStr.toUpperCase()}. ${typeStr === 'ielts' ? 'Phải là số từ 0.0 đến 9.0' : 'Phải là số từ 0 đến 990'}`);
              } else {
                // Compare numeric scores
                const aimNum = typeStr === 'ielts' ? parseFloat(aimStr) : parseInt(aimStr);
                const currentLevelNum = typeStr === 'ielts' ? parseFloat(currentLevelStr) : parseInt(currentLevelStr);
                
                if (aimNum <= currentLevelNum) {
                  errors.push('Điểm mục tiêu phải cao hơn trình độ hiện tại');
                }
              }
            } else {
              // Validate as CEFR levels (backward compatibility)
              const aimOrder = getLevelOrder(aimStr);
              const currentLevelOrder = getLevelOrder(currentLevelStr);
              
              if (aimOrder === -1) {
                errors.push('Band mục tiêu không hợp lệ');
              } else if (currentLevelOrder === -1) {
                errors.push('Trình độ hiện tại không hợp lệ');
              } else if (aimOrder <= currentLevelOrder) {
                errors.push('Band mục tiêu phải cao hơn trình độ hiện tại');
              }
            }
          }
        }

        // Calculate bands to study
        const levelsToStudy = calculateLevelsToStudy(
          currentLevel ? currentLevel.toString().trim() : '',
          aim ? aim.toString().trim() : '',
          type ? type.toString().trim() : ''
        );

        previewData.push({
          rowNumber,
          username: username.toString().trim(),
          email: email.toString().trim(),
          phone: phone.toString().trim(),
          address: address.toString().trim(),
          aim: aim ? aim.toString().trim() : '',
          currentLevel: currentLevel ? currentLevel.toString().trim() : '',
          type: type ? type.toString().trim() : '',
          programCode: programCode ? programCode.toString().trim() : '',
          levelsToStudy: levelsToStudy,
          hasError: errors.length > 0,
          errors,
          warnings: [],
          isExistingAccount: false,
          courses: [] // Will be populated later
        });
      });

      // Fetch courses for each student based on program codes
      // Note: Fetch courses regardless of validation errors, as long as programCode exists
      for (let i = 0; i < previewData.length; i++) {
        const item = previewData[i];
        // Fetch courses if programCode exists (ignore other validation errors)
        if (item.programCode && item.programCode.trim()) {
          try {
            console.log(`Fetching courses for program code: ${item.programCode}`);
            const courses = await getCoursesByProgramCodes(item.programCode);
            console.log(`Courses fetched for ${item.email}:`, courses);
            item.courses = courses;
          } catch (error) {
            console.error(`Error fetching courses for ${item.email}:`, error);
            item.courses = [];
          }
        } else {
          item.courses = [];
        }
      }

      // Normalize phone numbers - ensure they all have leading zero for comparison
      const normalizePhone = (phone) => {
        if (!phone) return '';
        const phoneStr = String(phone).replace(/\D/g, ''); // Remove all non-digits
        if (phoneStr && phoneStr.length > 0 && phoneStr[0] !== '0') {
          return '0' + phoneStr;
        }
        return phoneStr;
      };

      // Check for duplicates within the Excel file
      const emailMap = new Map();
      const phoneMap = new Map();
      
      previewData.forEach((item, index) => {
        const email = item.email.toLowerCase();
        // Normalize phone before checking duplicates
        const phone = normalizePhone(item.phone);
        
        // Check duplicate email in file
        if (email && emailMap.has(email)) {
          const firstIndex = emailMap.get(email);
          if (!previewData[firstIndex].errors.includes('Email trùng lặp trong file Excel')) {
            previewData[firstIndex].errors.push('Email trùng lặp trong file Excel');
            previewData[firstIndex].hasError = true;
          }
          if (!item.errors.includes('Email trùng lặp trong file Excel')) {
            item.errors.push('Email trùng lặp trong file Excel');
            item.hasError = true;
          }
        } else if (email) {
          emailMap.set(email, index);
        }
        
        // Check duplicate phone in file
        if (phone && phoneMap.has(phone)) {
          const firstIndex = phoneMap.get(phone);
          if (!previewData[firstIndex].errors.includes('Số điện thoại trùng lặp trong file Excel')) {
            previewData[firstIndex].errors.push('Số điện thoại trùng lặp trong file Excel');
            previewData[firstIndex].hasError = true;
          }
          if (!item.errors.includes('Số điện thoại trùng lặp trong file Excel')) {
            item.errors.push('Số điện thoại trùng lặp trong file Excel');
            item.hasError = true;
          }
        } else if (phone) {
          phoneMap.set(phone, index);
        }
      });

      // Validate program codes and check for duplicates with existing data in database
      try {
        // Get all students, teachers, and programs from database
        const [studentsResponse, teachersResponse] = await Promise.all([
          studentService.getAllStudents().catch(() => ({ students: [] })),
          teacherService.getAllTeachers().catch(() => ({ teachers: [] }))
        ]);

        const allStudents = studentsResponse.students || [];
        const allTeachers = teachersResponse.teachers || [];
        const allUsers = [...allStudents, ...allTeachers];

        const existingEmails = new Set(allUsers.map(u => u.email?.toLowerCase()).filter(Boolean));

        const existingPhones = new Set(
          allUsers
            .map(u => normalizePhone(u.phone))
            .filter(Boolean)
        );

        // Get all active program codes from database
        const activeProgramCodes = new Set(
          programs
            .filter(p => p.status === 'active')
            .map(p => p.code)
            .filter(Boolean)
        );

        previewData.forEach((item) => {
          const email = item.email.toLowerCase();
          const phone = normalizePhone(item.phone);

          if (email && existingEmails.has(email)) {
            if (!item.warnings.includes('Học viên đã có tài khoản trong hệ thống')) {
              item.warnings.push('Học viên đã có tài khoản trong hệ thống');
              item.isExistingAccount = true;
            }
          }

          if (phone && existingPhones.has(phone)) {
            if (!item.warnings.includes('Học viên đã có tài khoản trong hệ thống')) {
              item.warnings.push('Học viên đã có tài khoản trong hệ thống');
              item.isExistingAccount = true;
            }
          }

          // Validate program codes against database
          if (item.programCode && item.programCode.trim()) {
            // Parse multiple program codes
            const programCodes = item.programCode
              .split(/[,;|]/)
              .map(code => code.trim())
              .filter(code => code.length > 0);

            const invalidCodes = [];
            const validCodes = [];
            const mismatchedTypeCodes = [];
            const mismatchedLevelCodes = [];

            // Parse levels from levelsToStudy if available
            const requiredLevels = item.levelsToStudy ? parseLevelsToStudy(item.levelsToStudy) : [];

            programCodes.forEach(code => {
              if (activeProgramCodes.has(code)) {
                validCodes.push(code);

                // Check if program type matches the student's type
                const program = programs.find(p => p.code === code && p.status === 'active');
                if (program && item.type) {
                  const itemTypeStr = item.type.toString().trim().toLowerCase();
                  const programTypeStr = program.type?.toString().trim().toLowerCase() || '';

                  // Normalize type names for comparison
                  const normalizeType = (type) => {
                    if (type === 'cam') return 'cambridge';
                    return type;
                  };

                  const normalizedItemType = normalizeType(itemTypeStr);
                  const normalizedProgramType = normalizeType(programTypeStr);

                  if (normalizedItemType && normalizedProgramType && normalizedItemType !== normalizedProgramType) {
                    mismatchedTypeCodes.push({
                      code: code,
                      expected: itemTypeStr.toUpperCase(),
                      actual: programTypeStr.toUpperCase()
                    });
                  }

                  // Check if program level matches the levelsToStudy
                  if (requiredLevels.length > 0 && program.level) {
                    const programLevel = program.level.toString().trim();
                    if (!requiredLevels.includes(programLevel)) {
                      mismatchedLevelCodes.push({
                        code: code,
                        programLevel: programLevel,
                        requiredLevels: requiredLevels.join(', ')
                      });
                    }
                  }
                }
              } else {
                invalidCodes.push(code);
              }
            });

            // Add error if any program code is invalid
            if (invalidCodes.length > 0) {
              const errorMsg = `Mã chương trình không tồn tại: ${invalidCodes.join(', ')}`;
              if (!item.errors.includes(errorMsg)) {
                item.errors.push(errorMsg);
                item.hasError = true;
              }
            }

            // Add error if program type doesn't match student type
            if (mismatchedTypeCodes.length > 0) {
              mismatchedTypeCodes.forEach(mismatch => {
                const errorMsg = `Mã chương trình "${mismatch.code}" thuộc loại ${mismatch.actual}, không khớp với loại ${mismatch.expected} của học viên`;
                if (!item.errors.includes(errorMsg)) {
                  item.errors.push(errorMsg);
                  item.hasError = true;
                }
              });
            }

            // Add error if program level doesn't match levelsToStudy
            if (mismatchedLevelCodes.length > 0) {
              mismatchedLevelCodes.forEach(mismatch => {
                const errorMsg = `Mã chương trình "${mismatch.code}" có level ${mismatch.programLevel}, không nằm trong lộ trình học [${mismatch.requiredLevels}]`;
                if (!item.errors.includes(errorMsg)) {
                  item.errors.push(errorMsg);
                  item.hasError = true;
                }
              });
            }

            // Add warning if some codes are valid but some are invalid
            if (validCodes.length > 0 && invalidCodes.length > 0) {
              const warningMsg = `Chỉ ${validCodes.length}/${programCodes.length} mã chương trình hợp lệ: ${validCodes.join(', ')}`;
              if (!item.warnings.includes(warningMsg)) {
                item.warnings.push(warningMsg);
              }
            }
          }
        });
      } catch (err) {
        // Error checking existing users
        console.error('Error validating data:', err);
      }

      setPreviewStudents(previewData);
    } catch (error) {
      toast.error('Lỗi khi đọc file Excel: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const validStudents = previewStudents.filter(s => !s.hasError);

    if (validStudents.length === 0) {
      toast.warning('Không có học viên hợp lệ để import');
      return;
    }

    try {
      setLoading(true);
      const result = await studentService.importStudents(validStudents);
      
      const createdCount = result.createdCount || result.results?.created?.length || 0;
      const enrolledCount = result.enrolledCount || result.results?.enrolled?.length || 0;
      const skippedCount = result.skippedCount || result.results?.skipped?.length || 0;
      const failedCount = result.failedCount || result.results?.failed?.length || 0;

      let message = '';
      if (createdCount > 0) {
        message += `Tạo mới: ${createdCount} học viên\n`;
      }
      if (enrolledCount > 0) {
        message += `Đăng ký khóa học: ${enrolledCount} học viên đã có\n`;
      }
      if (skippedCount > 0) {
        message += `Bỏ qua: ${skippedCount} học viên (không có thông tin lộ trình)\n`;
      }
      if (failedCount > 0) {
        message += `Thất bại: ${failedCount} học viên\n`;
      }

      if (!message) {
        message = 'Không có học viên nào được xử lý';
      }

      toast.success(message.trim(), { autoClose: 5000 });
      
      // Navigate back to student management page after successful import
      if (onBack) {
        onBack();
      } else {
        navigate('/academic/student-management');
      }
    } catch (err) {
      const errorMessage = err.message || (typeof err === 'string' ? err : 'Không thể import học viên');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        username: 'student1',
        email: 'student1@email.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        aim: '6.0',
        currentLevel: '4.0',
        type: 'ielts',
        programCode: 'IELTS_B1'
      },
      {
        username: 'student2',
        email: 'student2@email.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        aim: '600',
        currentLevel: '400',
        type: 'toeic',
        programCode: 'TOEIC_B1, TOEIC_B2'
      },
      {
        username: 'student3',
        email: 'student3@email.com',
        phone: '0123456789',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        aim: 'Mover',
        currentLevel: 'Starter',
        type: 'cambridge',
        programCode: 'CAM_A1'
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học viên');

    // Generate file name with timestamp
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `Mau_Import_Hoc_Vien_${timestamp}.xlsx`;

    // Write and download
    XLSX.writeFile(wb, fileName);
  };

  const handleExportReport = () => {
    if (previewStudents.length === 0) {
      toast.warning('Không có dữ liệu để xuất báo cáo');
      return;
    }

    try {
      // Tạo data cho Excel
      const reportData = previewStudents.map(student => ({
        Username: student.username,
        Email: student.email,
        Phone: student.phone,
        Address: student.address,
        Aim: student.aim || '',
        'Trình độ hiện tại': student.currentLevel || '',
        Type: student.type || '',
        'Program Code': student.programCode || '',
        'Các khóa học đăng ký': student.courses && student.courses.length > 0
          ? student.courses.join(', ')
          : ''
      }));
      
      // Tạo worksheet
      const ws = XLSX.utils.json_to_sheet(reportData);
      
      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo Import');
      
      // Tạo tên file với timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
      const fileName = `BaoCao_Import_HocVien_${timestamp}.xlsx`;
      
      // Download
      XLSX.writeFile(wb, fileName);
      toast.success('Xuất báo cáo thành công!');
    } catch (error) {
      toast.error('Lỗi khi xuất báo cáo: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Import Học viên từ Excel</h4>
          <p className="text-neutral-600 mb-0">Nhập danh sách học viên từ file Excel</p>
        </div>
        <Button 
          variant="secondary"
          className="px-20 py-10 radius-8"
          onClick={onBack || (() => navigate('/academic/student-management'))}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

      {/* Phần 1: Hướng dẫn Format Excel */}
      <Card className="mb-3 border-info">
        <Card.Body className="bg-info bg-opacity-10">
          <h6 className="mb-3">
            <i className="fas fa-info-circle me-2"></i>
            Hướng dẫn Format Excel
          </h6>
          <p className="mb-2">Vui lòng đảm bảo file Excel của bạn có đúng format như bảng trên</p>
          <p className="mb-2 text-muted">
            <strong>Lưu ý về định dạng:</strong>
          </p>
          <ul className="mb-3 text-muted" style={{ fontSize: '0.9rem' }}>
            <li><strong>IELTS:</strong> Aim và Trình độ hiện tại dùng điểm số từ 0.0 đến 9.0 (ví dụ: 6.0, 4.0)</li>
            <li><strong>TOEIC:</strong> Aim và Trình độ hiện tại dùng điểm số từ 0 đến 990 (ví dụ: 600, 400)</li>
            <li><strong>Cambridge:</strong> Aim và Trình độ hiện tại dùng level: Starter (hoặc Pre-A1) và Mover (hoặc A1) (ví dụ: Mover, Starter)</li>
            <li><strong>Program Code (BẮT BUỘC):</strong> Mã chương trình - Phải nhập để xác định chính xác chương trình học
              <ul style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <li>Một chương trình: <code>IELTS_B1</code></li>
                <li>Nhiều chương trình: <code>IELTS_B1, IELTS_B2</code> hoặc <code>IELTS_B1; IELTS_B2</code></li>
                <li className="text-danger"><strong>Lưu ý:</strong> Nếu có nhiều chương trình cùng type và level, bạn phải chỉ định chính xác program code để tránh nhầm lẫn</li>
              </ul>
            </li>
          </ul>
          <p className="mb-3 text-muted">
            Lưu ý: Password sẽ tự động được tạo cho mỗi học viên
          </p>
          
          <div className="mb-3">
            <Button
              variant="outline-success"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <i className="fas fa-download me-2"></i>
              Tải file mẫu
            </Button>
          </div>
          
          <Table striped bordered size="sm" className="mb-0">
            <thead className="table-info">
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Aim</th>
                <th>Trình độ hiện tại</th>
                <th>Type</th>
                <th>Program Code</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>student1</td>
                <td>student1@email.com</td>
                <td>0123456789</td>
                <td>123 Đường ABC</td>
                <td>6.0</td>
                <td>4.0</td>
                <td>ielts</td>
                <td>IELTS_B1</td>
              </tr>
              <tr>
                <td>student2</td>
                <td>student2@email.com</td>
                <td>0987654321</td>
                <td>456 Đường XYZ</td>
                <td>600</td>
                <td>400</td>
                <td>toeic</td>
                <td>TOEIC_B1, TOEIC_B2</td>
              </tr>
              <tr>
                <td>student3</td>
                <td>student3@email.com</td>
                <td>0123456789</td>
                <td>789 Đường DEF</td>
                <td>Mover</td>
                <td>Starter</td>
                <td>cambridge</td>
                <td>CAM_A1</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Phần 2: Upload File */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">Upload File Excel</h6>
          <div className="d-flex align-items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outline-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <i className="fas fa-folder-open me-2"></i>
              Chọn file Excel
            </Button>
            {importFile && (
              <span className="text-muted">
                <i className="fas fa-file-excel me-2 text-success"></i>
                {importFile.name}
              </span>
            )}
            <Button
              variant="primary"
              onClick={handlePreviewExcel}
              disabled={!importFile || importing}
            >
              {importing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="fas fa-upload me-2"></i>
                  Tải lên và xem trước
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Phần 3: Bảng Preview */}
      {previewStudents.length > 0 && (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Preview dữ liệu</h6>
              <div className="d-flex align-items-center gap-3">
                <div>
                  <Badge bg="secondary" className="me-2">
                    Tổng số: {previewStudents.length}
                  </Badge>
                  <Badge bg="success" className="me-2">
                    Hợp lệ: {previewStudents.filter(s => !s.hasError && s.warnings.length === 0).length}
                  </Badge>
                  <Badge bg="warning" className="me-2">
                    Cảnh báo: {previewStudents.filter(s => !s.hasError && s.warnings.length > 0).length}
                  </Badge>
                  <Badge bg="danger">
                    Lỗi: {previewStudents.filter(s => s.hasError).length}
                  </Badge>
                </div>
                <Button
                  variant="info"
                  size="sm"
                  onClick={handleExportReport}
                  disabled={previewStudents.length === 0}
                >
                  <i className="fas fa-file-excel me-2"></i>
                  Xuất báo cáo
                </Button>
              </div>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table striped bordered hover size="sm">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>STT</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Aim</th>
                    <th>Trình độ hiện tại</th>
                    <th>Lộ trình học</th>
                    <th>Type</th>
                    <th>Program Code</th>
                    <th>Trạng thái</th>
                    <th>Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {previewStudents.map((student, index) => {
                    const hasWarnings = student.warnings.length > 0;
                    const rowClassName = student.hasError 
                      ? 'table-danger' 
                      : hasWarnings 
                        ? 'table-warning' 
                        : 'table-success';
                    
                    return (
                      <tr key={index} className={rowClassName}>
                        <td>{student.rowNumber}</td>
                        <td>{student.username}</td>
                        <td>{student.email}</td>
                        <td>{student.phone}</td>
                        <td>{student.address}</td>
                        <td>{student.aim || '-'}</td>
                        <td>{student.currentLevel || '-'}</td>
                        <td>{student.levelsToStudy || '-'}</td>
                        <td>{student.type || '-'}</td>
                        <td>{student.programCode || '-'}</td>
                        <td>
                          {student.hasError ? (
                            <Badge bg="danger">Lỗi</Badge>
                          ) : hasWarnings ? (
                            <Badge bg="warning">Cảnh báo</Badge>
                          ) : (
                            <Badge bg="success">Hợp lệ</Badge>
                          )}
                        </td>
                        <td>
                          {student.errors.length > 0 ? (
                            <ul className="mb-0" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                              {student.errors.map((error, i) => (
                                <li key={i} className="text-danger">{error}</li>
                              ))}
                            </ul>
                          ) : student.warnings.length > 0 ? (
                            <ul className="mb-0" style={{ fontSize: '12px', paddingLeft: '20px' }}>
                              {student.warnings.map((warning, i) => (
                                <li key={i} className="text-warning">{warning}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Footer Actions */}
      {previewStudents.length > 0 && (
        <Card className="mt-3">
          <Card.Body>
            <div className="d-flex justify-content-end gap-3">
              <Button 
                variant="secondary" 
                onClick={onBack || (() => navigate('/academic/student-management'))} 
                disabled={loading || importing}
              >
                Hủy
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmImport}
                disabled={previewStudents.filter(s => !s.hasError).length === 0 || loading || importing}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang import...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Xác nhận và Import
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ImportStudentFromExcel;

