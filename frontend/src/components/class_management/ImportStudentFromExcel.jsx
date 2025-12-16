<<<<<<< HEAD
import React, { useState, useRef } from 'react';
=======
import React, { useState, useRef, useEffect } from 'react';
>>>>>>> origin/Namvv-teacher-class-management
import { Container, Row, Col, Card, Button, Badge, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import teacherService from '../../services/teacherService';
<<<<<<< HEAD
=======
import programService from '../../services/programService';
import { courseService } from '../../services/courseService';
>>>>>>> origin/Namvv-teacher-class-management
import * as XLSX from 'xlsx';

/**
 * Import Student From Excel Component
 * Component để import học viên từ file Excel
 */
const ImportStudentFromExcel = () => {
  const navigate = useNavigate();
  const [importFile, setImportFile] = useState(null);
  const [previewStudents, setPreviewStudents] = useState([]);
  const [importing, setImporting] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const fileInputRef = useRef(null);

=======
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

  // Function to get courses for a student based on levelsToStudy and type
  const getCoursesForStudent = async (levelsToStudy, type) => {
    if (!levelsToStudy || !type) return [];
    
    const levels = parseLevelsToStudy(levelsToStudy);
    if (levels.length === 0) return [];
    
    const typeStr = type.toString().trim().toLowerCase();
    const programNameMap = {
      'ielts': 'IELTS',
      'toeic': 'TOEIC',
      'cam': 'Cambridge',
      'cambridge': 'Cambridge'
    };
    const programName = programNameMap[typeStr] || typeStr;
    
    // Lấy courses cho tất cả levels
    const allCourses = [];
    for (const level of levels) {
      try {
        const response = await courseService.getCoursesByProgram(programName, level);
        if (response?.success && response.courses) {
          allCourses.push(...response.courses);
        }
      } catch (error) {
        // Error fetching courses
      }
    }
    
    // Loại bỏ duplicates và trả về tên courses
    const uniqueCourseNames = [...new Set(allCourses.map(c => c.name))];
    return uniqueCourseNames;
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

>>>>>>> origin/Namvv-teacher-class-management
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
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      e.target.value = '';
      return;
    }

    setImportFile(file);
    setPreviewStudents([]);
  };

  const handlePreviewExcel = async () => {
    if (!importFile) {
      alert('Vui lòng chọn file Excel');
      return;
    }

    setImporting(true);
    try {
      // Read file as array buffer
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Get first sheet
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert('File Excel không có sheet nào');
        setImporting(false);
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        alert('Sheet đầu tiên không có dữ liệu');
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
        alert('File Excel không có dữ liệu');
        setImporting(false);
        return;
      }

<<<<<<< HEAD
      // Helper function to get level order for comparison
      const getLevelOrder = (level) => {
=======
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
>>>>>>> origin/Namvv-teacher-class-management
        const levelMap = {
          'Pre-A1': 0,
          'A1': 1,
          'A2': 2,
          'B1': 3,
          'B2': 4,
          'C1': 5,
          'C2': 6
        };
<<<<<<< HEAD
        return levelMap[level] !== undefined ? levelMap[level] : -1;
      };

      // Helper function to get level name from order
=======
        return levelMap[normalizedLevel] !== undefined ? levelMap[normalizedLevel] : -1;
      };

      // Helper function to get band name from order
>>>>>>> origin/Namvv-teacher-class-management
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

<<<<<<< HEAD
      // Helper function to calculate levels to study from currentLevel to aim
      const calculateLevelsToStudy = (currentLevel, aim) => {
        if (!currentLevel || !aim) return '';
        
        const currentOrder = getLevelOrder(currentLevel);
        const aimOrder = getLevelOrder(aim);
=======
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
>>>>>>> origin/Namvv-teacher-class-management
        
        if (currentOrder === -1 || aimOrder === -1 || aimOrder <= currentOrder) {
          return '';
        }
        
<<<<<<< HEAD
        // Calculate all levels from currentLevel to aim (bao gồm cả currentLevel)
=======
        // Calculate all bands from currentLevel to aim (bao gồm cả currentLevel)
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
=======
        } else {
          // Validate phone length (10-11 digits after normalization)
          const phoneDigits = phone.replace(/\D/g, '');
          if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            errors.push('Số điện thoại phải có 10 hoặc 11 chữ số');
          }
>>>>>>> origin/Namvv-teacher-class-management
        }

        if (!address || !address.toString().trim()) {
          errors.push('Địa chỉ không được để trống');
        }

<<<<<<< HEAD
        // Validate aim must be higher than currentLevel
        if (aim && currentLevel) {
          const aimOrder = getLevelOrder(aim.toString().trim());
          const currentLevelOrder = getLevelOrder(currentLevel.toString().trim());
          
          if (aimOrder === -1) {
            errors.push('Level mục tiêu không hợp lệ');
          } else if (currentLevelOrder === -1) {
            errors.push('Trình độ hiện tại không hợp lệ');
          } else if (aimOrder <= currentLevelOrder) {
            errors.push('Level mục tiêu phải cao hơn trình độ hiện tại');
          }
        }

        // Calculate levels to study
        const levelsToStudy = calculateLevelsToStudy(
          currentLevel ? currentLevel.toString().trim() : '',
          aim ? aim.toString().trim() : ''
=======
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
>>>>>>> origin/Namvv-teacher-class-management
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
          levelsToStudy: levelsToStudy,
          hasError: errors.length > 0,
<<<<<<< HEAD
          errors
        });
      });

=======
          errors,
          warnings: [],
          isExistingAccount: false,
          courses: [] // Will be populated later
        });
      });

      // Fetch courses for each student
      for (let i = 0; i < previewData.length; i++) {
        const item = previewData[i];
        if (item.levelsToStudy && item.type && !item.hasError) {
          try {
            const courses = await getCoursesForStudent(item.levelsToStudy, item.type);
            item.courses = courses;
          } catch (error) {
            item.courses = [];
          }
        }
      }

>>>>>>> origin/Namvv-teacher-class-management
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
      
<<<<<<< HEAD
      console.log('=== Checking duplicates in Excel file ===');
      console.log('Total rows:', previewData.length);
      
=======
>>>>>>> origin/Namvv-teacher-class-management
      previewData.forEach((item, index) => {
        const email = item.email.toLowerCase();
        // Normalize phone before checking duplicates
        const phone = normalizePhone(item.phone);
        
<<<<<<< HEAD
        console.log(`Row ${index + 1}: email="${email}", phone="${item.phone}" -> normalized="${phone}"`);
        
        // Check duplicate email in file
        if (email && emailMap.has(email)) {
          const firstIndex = emailMap.get(email);
          console.log(`  -> Email duplicate found! First at row ${firstIndex + 1}`);
=======
        // Check duplicate email in file
        if (email && emailMap.has(email)) {
          const firstIndex = emailMap.get(email);
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
          console.log(`  -> Phone duplicate found! First at row ${firstIndex + 1}, phone="${phone}"`);
=======
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
      
      console.log('Email map:', Array.from(emailMap.keys()));
      console.log('Phone map:', Array.from(phoneMap.keys()));
      console.log('=== End checking duplicates ===');
=======
>>>>>>> origin/Namvv-teacher-class-management

      // Check for duplicates with existing data in database
      try {
        // Get all students and teachers from database
        const [studentsResponse, teachersResponse] = await Promise.all([
          studentService.getAllStudents().catch(() => ({ students: [] })),
          teacherService.getAllTeachers().catch(() => ({ teachers: [] }))
        ]);
        
        const allStudents = studentsResponse.students || [];
        const allTeachers = teachersResponse.teachers || [];
        const allUsers = [...allStudents, ...allTeachers];
        
<<<<<<< HEAD
        console.log('=== Checking duplicates with database ===');
        console.log('Students in DB:', allStudents.length);
        console.log('Teachers in DB:', allTeachers.length);
        console.log('Total users in DB:', allUsers.length);
        
=======
>>>>>>> origin/Namvv-teacher-class-management
        const existingEmails = new Set(allUsers.map(u => u.email?.toLowerCase()).filter(Boolean));
        
        const existingPhones = new Set(
          allUsers
            .map(u => normalizePhone(u.phone))
            .filter(Boolean)
        );
        
<<<<<<< HEAD
        console.log('Existing emails in DB:', Array.from(existingEmails));
        console.log('Existing phones in DB:', Array.from(existingPhones));
        
=======
>>>>>>> origin/Namvv-teacher-class-management
        previewData.forEach((item) => {
          const email = item.email.toLowerCase();
          const phone = normalizePhone(item.phone);
          
<<<<<<< HEAD
          console.log(`Checking row: email="${email}", phone="${phone}"`);
          
          if (email && existingEmails.has(email)) {
            console.log(`  -> Email "${email}" found in DB!`);
            item.errors.push('Email đã tồn tại trong hệ thống');
            item.hasError = true;
          }
          
          if (phone && existingPhones.has(phone)) {
            console.log(`  -> Phone "${phone}" found in DB!`);
            item.errors.push('Số điện thoại đã tồn tại trong hệ thống');
            item.hasError = true;
          }
        });
        
        console.log('=== End checking duplicates with database ===');
      } catch (err) {
        console.error('Error checking existing users:', err);
=======
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
        });
      } catch (err) {
        // Error checking existing users
>>>>>>> origin/Namvv-teacher-class-management
      }

      setPreviewStudents(previewData);
    } catch (error) {
<<<<<<< HEAD
      console.error('Error reading Excel file:', error);
=======
>>>>>>> origin/Namvv-teacher-class-management
      alert('Lỗi khi đọc file Excel: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setImporting(false);
    }
  };

  const handleConfirmImport = async () => {
    const validStudents = previewStudents.filter(s => !s.hasError);
    
    if (validStudents.length === 0) {
      alert('Không có học viên hợp lệ để import');
      return;
    }

    try {
      setLoading(true);
      const result = await studentService.importStudents(validStudents);
      
<<<<<<< HEAD
      alert(`Import thành công: ${result.success} học viên\nThất bại: ${result.failed} học viên`);
=======
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
      
      alert(message.trim());
>>>>>>> origin/Namvv-teacher-class-management
      
      // Navigate back to student management page after successful import
      navigate('/academic/student-management');
    } catch (err) {
<<<<<<< HEAD
      console.error('Error importing students:', err);
=======
>>>>>>> origin/Namvv-teacher-class-management
      const errorMessage = err.message || (typeof err === 'string' ? err : 'Không thể import học viên');
      alert(errorMessage);
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
<<<<<<< HEAD
        aim: 'B2',
        currentLevel: 'A2',
=======
        aim: '6.0',
        currentLevel: '4.0',
>>>>>>> origin/Namvv-teacher-class-management
        type: 'ielts'
      },
      {
        username: 'student2',
        email: 'student2@email.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
<<<<<<< HEAD
        aim: 'C1',
        currentLevel: 'B1',
        type: 'toeic'
=======
        aim: '600',
        currentLevel: '400',
        type: 'toeic'
      },
      {
        username: 'student3',
        email: 'student3@email.com',
        phone: '0123456789',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        aim: 'Mover',
        currentLevel: 'Starter',
        type: 'cambridge'
>>>>>>> origin/Namvv-teacher-class-management
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

<<<<<<< HEAD
=======
  const handleExportReport = () => {
    if (previewStudents.length === 0) {
      alert('Không có dữ liệu để xuất báo cáo');
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
    } catch (error) {
      alert('Lỗi khi xuất báo cáo: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

>>>>>>> origin/Namvv-teacher-class-management
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
          onClick={() => navigate('/academic/student-management')}
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
<<<<<<< HEAD
          <p className="mb-3 text-muted">
            <i className="fas fa-key me-1"></i>
=======
          <p className="mb-2 text-muted">
            <strong>Lưu ý về định dạng:</strong>
          </p>
          <ul className="mb-3 text-muted" style={{ fontSize: '0.9rem' }}>
            <li><strong>IELTS:</strong> Aim và Trình độ hiện tại dùng điểm số từ 0.0 đến 9.0 (ví dụ: 6.0, 4.0)</li>
            <li><strong>TOEIC:</strong> Aim và Trình độ hiện tại dùng điểm số từ 0 đến 990 (ví dụ: 600, 400)</li>
            <li><strong>Cambridge:</strong> Aim và Trình độ hiện tại dùng level: Starter (hoặc Pre-A1) và Mover (hoặc A1) (ví dụ: Mover, Starter)</li>
          </ul>
          <p className="mb-3 text-muted">
>>>>>>> origin/Namvv-teacher-class-management
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
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>student1</td>
                <td>student1@email.com</td>
                <td>0123456789</td>
                <td>123 Đường ABC</td>
<<<<<<< HEAD
                <td>B2</td>
                <td>A2</td>
=======
                <td>6.0</td>
                <td>4.0</td>
>>>>>>> origin/Namvv-teacher-class-management
                <td>ielts</td>
              </tr>
              <tr>
                <td>student2</td>
                <td>student2@email.com</td>
                <td>0987654321</td>
                <td>456 Đường XYZ</td>
<<<<<<< HEAD
                <td>C1</td>
                <td>B1</td>
                <td>toeic</td>
              </tr>
=======
                <td>600</td>
                <td>400</td>
                <td>toeic</td>
              </tr>
              <tr>
                <td>student3</td>
                <td>student3@email.com</td>
                <td>0123456789</td>
                <td>789 Đường DEF</td>
                <td>Mover</td>
                <td>Starter</td>
                <td>cambridge</td>
              </tr>
>>>>>>> origin/Namvv-teacher-class-management
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
<<<<<<< HEAD
              <div>
                <Badge bg="secondary" className="me-2">
                  Tổng số: {previewStudents.length}
                </Badge>
                <Badge bg="success" className="me-2">
                  Hợp lệ: {previewStudents.filter(s => !s.hasError).length}
                </Badge>
                <Badge bg="danger">
                  Lỗi: {previewStudents.filter(s => s.hasError).length}
                </Badge>
=======
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
>>>>>>> origin/Namvv-teacher-class-management
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
                    <th>Trạng thái</th>
                    <th>Lỗi</th>
                  </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                  {previewStudents.map((student, index) => (
                    <tr 
                      key={index}
                      className={student.hasError ? 'table-danger' : 'table-success'}
                    >
                      <td>{student.rowNumber}</td>
                      <td>{student.username}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>{student.address}</td>
                      <td>{student.aim || '-'}</td>
                      <td>{student.currentLevel || '-'}</td>
                      <td>{student.levelsToStudy || '-'}</td>
                      <td>{student.type || '-'}</td>
                      <td>
                        {student.hasError ? (
                          <Badge bg="danger">Lỗi</Badge>
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
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
=======
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
>>>>>>> origin/Namvv-teacher-class-management
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
                onClick={() => navigate('/academic/student-management')} 
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

