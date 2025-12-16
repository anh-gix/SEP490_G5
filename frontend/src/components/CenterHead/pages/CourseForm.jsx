import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../compo/Breadcrumb";
import Card from "../compo/Card";
import Button from "../compo/Button";
import Modal from "../compo/Modal";
import Tabs from "../compo/Tabs";
import Badge from "../compo/Badge";
import programService from "../../../services/programService";
import courseService from "../../../services/courseService";
import sessionService from "../../../services/sessionService";
import camSessionService from "../../../services/camSessionService";

const CourseFormNew = ({ viewMode = 'center-head' }) => {
  const navigate = useNavigate();
  const { programId, courseId } = useParams();

  // Determine base path
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';

  // Only allow edit mode - redirect if no courseId
  useEffect(() => {
    if (!courseId) {
      alert('Vui lòng sử dụng Wizard để tạo học phần mới!');
      navigate(`${basePath}/programs/${programId || ''}`);
    }
  }, [courseId, programId, navigate, basePath]);

  const isEdit = Boolean(courseId);
  const [activeTab, setActiveTab] = useState("info");

  // Program data (PLOs từ Program)
  const [program, setProgram] = useState(null);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form state - CẬP NHẬT với các trường mới từ courseModel
  const [formData, setFormData] = useState({
    courseCode: "", // ← Đổi từ subjectCode thành courseCode
    name: "",
    description: "",
    numberOfSessions: 0, // ← MỚI
    timeAllocation: "", // ← MỚI
    preRequisite: "None", // ← MỚI
    studentTasks: "", // ← MỚI
    learningType: "offline",
    program: programId,
    status: "draft",
    clos: [],
    sessions: [],
    camSessions: [],
    materials: [], // ← CẬP NHẬT: Array of objects
    mocktestSessionOrders: [],
  });

  // Material Form - CẬP NHẬT structure
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    description: "",
    author: "",
    publisher: "",
    publishedDate: "",
    url: "",
    note: "",
    uploadType: "link", // "link" hoặc "file"
    file: null,
  });

  // CLO Form
  const [showCLOModal, setShowCLOModal] = useState(false);
  const [editingCLOIndex, setEditingCLOIndex] = useState(null);
  const [cloForm, setCloForm] = useState({
    code: "",
    name: "",
    detail: "",
    mappedPLOs: [],
  });

  // Session Form
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    title: "",
    order: 1,
    content: "",
    learningType: "theory",
    clos: [],
  });

  // Tabs configuration
  const tabs = [
    { id: "info", label: "Thông tin cơ bản", icon: "ph ph-info" },
    { id: "materials", label: "Tài liệu học tập", icon: "ph ph-book-open" },
    { id: "clo", label: "CLO & Mapping PLO", icon: "ph ph-target" },
    { id: "sessions", label: "Kế hoạch giảng dạy", icon: "ph ph-calendar" },
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: "Dashboard", path: `${basePath}/dashboard` },
    { label: "Quản lý chương trình", path: `${basePath}/programs` },
    {
      label: "Chi tiết chương trình",
      path: `${basePath}/programs/${programId}`,
    },
    { label: "Chỉnh sửa học phần" },
  ];

  // Load program data để lấy PLOs
  useEffect(() => {
    const fetchProgramData = async () => {
      setLoadingProgram(true);

      try {
        const response = await programService.getProgramById(programId);
        setProgram(response.data);
      } catch (error) {
        console.error("Error loading program:", error);
        alert("Không thể tải thông tin Program!");
        navigate("/center-head/programs");
      } finally {
        setLoadingProgram(false);
      }
    };

    fetchProgramData();
  }, [programId, navigate]);

  // Load course data if editing
  useEffect(() => {
    if (isEdit && !loadingProgram && courseId) {
      const fetchCourseData = async () => {
        try {
          setLoading(true);
          const response = await courseService.getCourseById(courseId);
          const courseData = response.data;

          // Redirect draft courses to wizard
          if (courseData.status === 'draft') {
            alert('Học phần chưa hoàn thành! Vui lòng tiếp tục tạo theo wizard.');
            navigate(`${basePath}/programs/${programId}/courses/${courseId}/edit`);
            return;
          }

          setFormData({
            courseCode: courseData.courseCode,
            name: courseData.name,
            description: courseData.description || "",
            numberOfSessions: courseData.numberOfSessions || 0,
            timeAllocation: courseData.timeAllocation || "",
            preRequisite: courseData.preRequisite || "None",
            studentTasks: courseData.studentTasks || "",
            learningType: courseData.learningType || "offline",
            program: programId,
            status: courseData.status,
            clos:
              courseData.clos?.map((clo) => ({
                _id: clo._id,
                code: clo.code,
                name: clo.name,
                detail: clo.detail,
                mappedPLOs: clo.mappedPLOs?.map((plo) => plo._id || plo) || [],
              })) || [],
            sessions:
              courseData.sessions?.map((session) => ({
                _id: session._id,
                title: session.title,
                order: session.order,
                content: session.content,
                learningType: session.learningType,
                clos: session.clos?.map((clo) => clo.code || clo) || [],
              })) || [],
            camSessions: courseData.camSessions || [],
            materials: courseData.materials || [],
            mocktestSessionOrders: courseData.mocktestSessionOrders || [],
          });
        } catch (error) {
          console.error("Error loading course:", error);
          alert("Không thể tải thông tin học phần!");
          navigate(`${basePath}/programs/${programId}/edit`);
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [isEdit, courseId, programId, loadingProgram, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================== MATERIAL MANAGEMENT ====================
  const handleAddMaterial = () => {
    setEditingMaterialIndex(null);
    setMaterialForm({
      description: "",
      author: "",
      publisher: "",
      publishedDate: "",
      url: "",
      note: "",
      uploadType: "link",
      file: null,
    });
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (index) => {
    setEditingMaterialIndex(index);
    const material = formData.materials[index];
    setMaterialForm({
      ...material,
      uploadType: material.url && material.url.startsWith('http') ? 'link' : 'file',
      file: null,
    });
    setShowMaterialModal(true);
  };

  const handleMaterialFormChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setMaterialForm((prev) => ({
        ...prev,
        file: files[0],
      }));
    } else {
      setMaterialForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveMaterial = () => {
    if (!materialForm.description) {
      alert("Vui lòng nhập tên/mô tả tài liệu!");
      return;
    }

    // Kiểm tra nếu chọn link thì phải có URL
    if (materialForm.uploadType === 'link' && !materialForm.url) {
      alert("Vui lòng nhập URL tài liệu!");
      return;
    }

    // Kiểm tra nếu chọn file thì phải có file (khi thêm mới)
    if (materialForm.uploadType === 'file' && editingMaterialIndex === null && !materialForm.file) {
      alert("Vui lòng chọn file để upload!");
      return;
    }

    // Tạo object material để lưu
    const materialData = {
      description: materialForm.description,
      author: materialForm.author,
      publisher: materialForm.publisher,
      publishedDate: materialForm.publishedDate,
      note: materialForm.note,
    };

    // Nếu là link thì lưu URL
    if (materialForm.uploadType === 'link') {
      materialData.url = materialForm.url;
    } else if (materialForm.file) {
      // Nếu là file, tạo URL tạm thời (trong thực tế sẽ upload lên server)
      // TODO: Implement file upload to server
      materialData.url = `file://${materialForm.file.name}`;
      materialData.fileName = materialForm.file.name;
      materialData.fileSize = materialForm.file.size;
      materialData.fileType = materialForm.file.type;

      // Lưu file object để upload sau
      materialData.fileObject = materialForm.file;
    }

    const materials = [...formData.materials];
    if (editingMaterialIndex !== null) {
      // Khi edit, giữ lại fileObject cũ nếu không upload file mới
      if (materialForm.uploadType === 'file' && !materialForm.file) {
        materialData.url = materials[editingMaterialIndex].url;
        materialData.fileName = materials[editingMaterialIndex].fileName;
        materialData.fileSize = materials[editingMaterialIndex].fileSize;
        materialData.fileType = materials[editingMaterialIndex].fileType;
        materialData.fileObject = materials[editingMaterialIndex].fileObject;
      }
      materials[editingMaterialIndex] = materialData;
    } else {
      materials.push(materialData);
    }

    setFormData((prev) => ({ ...prev, materials }));
    setShowMaterialModal(false);
  };

  const handleDeleteMaterial = (index) => {
    if (window.confirm("Bạn có chắc muốn xóa tài liệu này?")) {
      setFormData((prev) => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index),
      }));
    }
  };

  // ==================== CLO MANAGEMENT ====================
  const handleAddCLO = () => {
    setEditingCLOIndex(null);
    setCloForm({
      code: "",
      name: "",
      detail: "",
      mappedPLOs: [],
    });
    setShowCLOModal(true);
  };

  const handleEditCLO = (index) => {
    setEditingCLOIndex(index);
    setCloForm({ ...formData.clos[index] });
    setShowCLOModal(true);
  };

  const handleCLOFormChange = (e) => {
    const { name, value } = e.target;
    setCloForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePLOCheckbox = (ploId) => {
    setCloForm((prev) => {
      const mappedPLOs = prev.mappedPLOs.includes(ploId)
        ? prev.mappedPLOs.filter((id) => id !== ploId)
        : [...prev.mappedPLOs, ploId];
      return { ...prev, mappedPLOs };
    });
  };

  const handleSaveCLO = () => {
    if (!cloForm.code || !cloForm.name || !cloForm.detail) {
      alert("Vui lòng điền đầy đủ thông tin CLO!");
      return;
    }

    if (cloForm.mappedPLOs.length === 0) {
      alert("CLO phải mapping với ít nhất 1 PLO!");
      return;
    }

    // Check for duplicate CLO code
    const isDuplicate = formData.clos.some((clo, index) =>
      clo.code === cloForm.code && index !== editingCLOIndex
    );
    if (isDuplicate) {
      alert(`Mã CLO "${cloForm.code}" đã tồn tại trong giáo trình này!`);
      return;
    }

    const clos = [...formData.clos];
    if (editingCLOIndex !== null) {
      // Keep existing _id when editing
      clos[editingCLOIndex] = {
        ...cloForm,
        _id: clos[editingCLOIndex]._id
      };
    } else {
      // Add temporary _id for new CLO
      clos.push({
        ...cloForm,
        _id: `temp_${Date.now()}`
      });
    }

    setFormData((prev) => ({ ...prev, clos }));
    setShowCLOModal(false);
    alert(editingCLOIndex !== null ? 'Cập nhật CLO thành công!' : 'Thêm CLO mới thành công! Nhấn "Lưu" để lưu giáo trình.');
  };

  const handleDeleteCLO = (index) => {
    const cloCode = formData.clos[index].code;
    const sessionsUsingCLO = formData.sessions.filter((s) =>
      s.clos.includes(cloCode)
    );

    if (sessionsUsingCLO.length > 0) {
      alert(
        `Không thể xóa CLO này vì đang được sử dụng trong ${sessionsUsingCLO.length} session(s)!`
      );
      return;
    }

    if (window.confirm("Bạn có chắc muốn xóa CLO này?")) {
      setFormData((prev) => ({
        ...prev,
        clos: prev.clos.filter((_, i) => i !== index),
      }));
    }
  };

  // ==================== SESSION MANAGEMENT ====================
  const handleAddSession = () => {
    if (formData.clos.length === 0) {
      alert("Vui lòng tạo ít nhất 1 CLO trước khi tạo Session!");
      setActiveTab("clo");
      return;
    }

    // Kiểm tra không vượt quá số lượng buổi học
    const numberOfSessions = parseInt(formData.numberOfSessions) || 0;
    if (numberOfSessions > 0 && formData.sessions.length >= numberOfSessions) {
      alert(`Không thể thêm session! Đã đạt giới hạn ${numberOfSessions} buổi học.`);
      return;
    }

    // Tính toán order tiếp theo (tìm order lớn nhất + 1)
    const maxOrder = formData.sessions.length > 0
      ? Math.max(...formData.sessions.map(s => s.order || 0))
      : 0;
    const nextOrder = maxOrder + 1;

    setEditingSessionIndex(null);
    setSessionForm({
      title: "",
      order: nextOrder,
      content: "",
      learningType: "theory",
      clos: [],
    });
    setShowSessionModal(true);
  };

  const handleEditSession = (index) => {
    setEditingSessionIndex(index);
    setSessionForm({ ...formData.sessions[index] });
    setShowSessionModal(true);
  };

  const handleSessionFormChange = (e) => {
    const { name, value } = e.target;
    setSessionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSessionCLOCheckbox = (cloCode) => {
    setSessionForm((prev) => {
      const clos = prev.clos.includes(cloCode)
        ? prev.clos.filter((c) => c !== cloCode)
        : [...prev.clos, cloCode];
      return { ...prev, clos };
    });
  };

  const handleSaveSession = () => {
    if (!sessionForm.title || !sessionForm.content) {
      alert("Vui lòng điền đầy đủ thông tin Session!");
      return;
    }

    if (sessionForm.clos.length === 0) {
      alert("Session phải gán ít nhất 1 CLO!");
      return;
    }

    // Kiểm tra số lượng buổi học khi thêm mới
    const numberOfSessions = parseInt(formData.numberOfSessions) || 0;
    if (editingSessionIndex === null && numberOfSessions > 0 && formData.sessions.length >= numberOfSessions) {
      alert(`Không thể thêm session! Đã đạt giới hạn ${numberOfSessions} buổi học.`);
      return;
    }

    // Kiểm tra order không được vượt quá numberOfSessions
    if (numberOfSessions > 0 && sessionForm.order > numberOfSessions) {
      alert(`Order không được vượt quá số lượng buổi học (${numberOfSessions})!`);
      return;
    }

    const sessions = [...formData.sessions];
    if (editingSessionIndex !== null) {
      sessions[editingSessionIndex] = sessionForm;
    } else {
      sessions.push(sessionForm);
    }

    setFormData((prev) => ({ ...prev, sessions }));
    setShowSessionModal(false);
  };

  const handleDeleteSession = (index) => {
    if (window.confirm("Bạn có chắc muốn xóa Session này?")) {
      const updatedSessions = formData.sessions
        .filter((_, i) => i !== index)
        .map((session, idx) => ({
          ...session,
          order: idx + 1  // Reorder lại từ 1, 2, 3...
        }));

      setFormData((prev) => ({
        ...prev,
        sessions: updatedSessions,
      }));
    }
  };

  // Generate sessions tự động
  const handleGenerateSessions = () => {
    const numberOfSessions = parseInt(formData.numberOfSessions);

    if (!numberOfSessions || numberOfSessions <= 0) {
      alert("Vui lòng nhập số lượng buổi dạy!");
      return;
    }

    // Confirm nếu đã có sessions
    if (formData.sessions.length > 0) {
      if (!window.confirm(
        `Bạn đã có ${formData.sessions.length} buổi học. Tạo lại sẽ xóa tất cả sessions hiện tại. Bạn có chắc chắn?`
      )) {
        return;
      }
    }

    // Tạo sessions mới
    const newSessions = [];
    for (let i = 1; i <= numberOfSessions; i++) {
      const isMocktest = formData.mocktestSessionOrders.includes(i);

      newSessions.push({
        title: isMocktest ? `Mock Test ${i}` : `Buổi ${i}`,
        order: i,
        content: isMocktest ? "Kiểm tra giữa kỳ" : "",
        learningType: isMocktest ? "mocktest" : "theory",
        clos: [],
      });
    }

    setFormData((prev) => ({
      ...prev,
      sessions: newSessions,
    }));

    // Chuyển sang tab sessions
    setActiveTab("sessions");

    alert(`Đã tạo ${numberOfSessions} buổi học thành công! Vui lòng chỉnh sửa thông tin cho từng buổi.`);
  };

  const isCamOnlineCourse =
    program?.type === "cam" && formData.learningType === "online";

  // ==================== CAM SESSION QUICK CREATE (FORM VIEW) ====================
  const handleQuickCreateCamSession = async () => {
    if (!courseId) {
      alert("Không tìm thấy ID học phần. Vui lòng lưu học phần trước khi tạo CAM Session.");
      return;
    }

    const totalPlannedSessions = Number(formData.numberOfSessions) || 0;
    const currentCamSessions = formData.camSessions || [];

    if (totalPlannedSessions > 0 && currentCamSessions.length >= totalPlannedSessions) {
      alert(
        `Bạn đã tạo đủ CAM Session cho ${totalPlannedSessions} buổi học. ` +
        "Vui lòng tăng số lượng buổi học nếu muốn tạo thêm CAM Session."
      );
      return;
    }

    try {
      setLoading(true);

      const currentCamSessions = formData.camSessions || [];
      const nextOrder =
        currentCamSessions.length > 0
          ? Math.max(...currentCamSessions.map((cs) => cs.order || 0)) + 1
          : 1;

      const payload = {
        course: courseId,
        title: `CAM Session ${nextOrder}`,
        order: nextOrder,
        sessionType: "reading",
      };

      const created = await camSessionService.createCamSession(payload);
      const createdSession = created?.data || created;

      // Cập nhật course để liên kết CAM Session mới
      await courseService.updateCourse(courseId, {
        camSessions: [...currentCamSessions, createdSession].map((cs) => cs._id),
      });

      // Cập nhật state local
      setFormData((prev) => ({
        ...prev,
        camSessions: [...(prev.camSessions || []), createdSession],
      }));

      alert("Đã tạo CAM Session mới thành công!");
    } catch (error) {
      console.error("Error creating CAM Session:", error);
      alert(error.response?.data?.message || "Lỗi khi tạo CAM Session!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCamSessionRow = async (camSessionId) => {
    if (!camSessionId) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa CAM Session này?")) return;

    try {
      setLoading(true);

      const remaining = (formData.camSessions || []).filter(
        (cs) => cs._id !== camSessionId
      );

      // 1. Cập nhật course để bỏ liên kết CAM Session đã xóa
      if (courseId) {
        await courseService.updateCourse(courseId, {
          camSessions: remaining.map((cs) => cs._id),
        });
      }

      // 2. Xóa document CamSession sau khi đã gỡ khỏi course
      await camSessionService.deleteCamSession(camSessionId);

      setFormData((prev) => ({
        ...prev,
        camSessions: remaining,
      }));

      alert("Xóa CAM Session thành công!");
    } catch (error) {
      console.error("Error deleting CAM Session:", error);
      alert(error.response?.data?.message || "Lỗi khi xóa CAM Session!");
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.courseCode || !formData.name) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);

    try {
      // Build CLO code to _id map for session mapping
      const cloCodeToIdMap = {};
      formData.clos.forEach(clo => {
        cloCodeToIdMap[clo.code] = clo._id;
      });

      // 1. Tạo hoặc cập nhật tất cả Sessions
      const sessionIds = [];
      for (const session of formData.sessions) {
        // Convert mã CLO thành CLO _id
        const closIds = session.clos.map(cloCode => cloCodeToIdMap[cloCode]).filter(id => id);

        const sessionData = {
          title: session.title,
          order: session.order,
          content: session.content,
          learningType: session.learningType,
          clos: closIds, // Gửi mảng ObjectId của CLO (embedded trong course)
        };

        if (session._id) {
          // Session đã tồn tại, cập nhật
          await sessionService.updateSession(session._id, sessionData);
          sessionIds.push(session._id);
        } else {
          // Session mới, tạo mới
          const response = await sessionService.createSession(sessionData);
          sessionIds.push(response.data._id);
        }
      }

      // 2. Prepare CLOs data (embedded documents)
      const closData = formData.clos.map(clo => ({
        code: clo.code,
        name: clo.name,
        detail: clo.detail,
        mappedPLOs: clo.mappedPLOs // Array of PLO ObjectIds from program
      }));

      // 3. Tạo hoặc cập nhật Course
      const courseData = {
        courseCode: formData.courseCode,
        name: formData.name,
        description: formData.description,
        numberOfSessions: formData.numberOfSessions,
        timeAllocation: formData.timeAllocation,
        preRequisite: formData.preRequisite,
        studentTasks: formData.studentTasks,
        program: programId,
        clos: closData, // Embedded CLO objects
        sessions: sessionIds,
        materials: formData.materials,
        mocktestSessionOrders: formData.mocktestSessionOrders,
        status: formData.status,
      };

      // Thêm createdBy khi tạo mới (lấy từ localStorage)
      if (!isEdit) {
        const userStr = localStorage.getItem('user');

        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const userId = user._id || user.id;
            if (userId) {
              courseData.createdBy = userId;
            } else {
              console.error('No user ID found in localStorage');
              alert('Không tìm thấy thông tin user. Vui lòng đăng nhập lại!');
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            alert('Lỗi đọc thông tin user. Vui lòng đăng nhập lại!');
            setLoading(false);
            return;
          }
        } else {
          console.error('No user found in localStorage');
          alert('Vui lòng đăng nhập trước khi tạo course!');
          setLoading(false);
          return;
        }
      }

      if (isEdit) {
        await courseService.updateCourse(courseId, courseData);
        alert("Cập nhật học phần thành công!");
      } else {
        await courseService.createCourse(courseData);
        alert("Tạo học phần thành công!");
      }

      navigate(`${basePath}/programs/${programId}/edit`);
    } catch (error) {
      console.error("Error submitting course:", error);
      alert(error.message || "Lỗi khi lưu học phần!");
    } finally {
      setLoading(false);
    }
  };

  // Get PLO by ID
  const getPLOById = (ploId) => {
    if (!program) return { code: "N/A", name: "Unknown" };
    return (
      program.plos.find((p) => p._id === ploId) || {
        code: "N/A",
        name: "Unknown",
      }
    );
  };

  // CLO-PLO Matrix
  const renderCLOPLOMatrix = () => {
    if (!program || formData.clos.length === 0) return null;

    return (
      <div className="mt-4">
        <h6 className="mb-3">Ma trận CLO-PLO</h6>
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>CLO / PLO</th>
                {program.plos.map((plo) => (
                  <th key={plo._id} className="text-center">
                    {plo.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formData.clos.map((clo, index) => (
                <tr key={index}>
                  <td>
                    <strong>{clo.code}</strong>
                  </td>
                  {program.plos.map((plo) => (
                    <td key={plo._id} className="text-center">
                      {clo.mappedPLOs.includes(plo._id) && (
                        <i className="ph ph-check-circle text-success"></i>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loadingProgram) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-5">
        <i className="ph ph-warning-circle ph-3x text-warning mb-3"></i>
        <p>Không tìm thấy thông tin chương trình!</p>
        <Button onClick={() => navigate("/center-head/programs")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="course-form-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">
            {isEdit ? "Chỉnh sửa học phần" : "Tạo học phần mới"}
          </h4>
          <p className="text-neutral-600 mb-0">
            Chương trình:{" "}
            <strong>
              {program.code} - {program.program_name}
            </strong>
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            icon="ph ph-x-circle"
            onClick={() => navigate(`${basePath}/programs/${programId}`)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            icon="ph ph-check-circle"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu học phần"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="mt-24">
        {/* Tab 1: Thông tin cơ bản */}
        {activeTab === "info" && (
          <Card>
            <h5 className="mb-16 fw-semibold text-neutral-900">Thông tin học phần</h5>
            <div className="row g-4">
              {/* Row 1: Mã môn & Tên */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Mã môn học <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="courseCode"
                  className="form-control"
                  placeholder="VD: IELTS-B2-RW"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  required
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div className="col-md-8">
                <label className="form-label fw-semibold text-neutral-900">
                  Tên học phần <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="VD: IELTS Reading & Writing"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Row 2: Số buổi & Trạng thái */}
              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Số lượng buổi học <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfSessions"
                  className="form-control"
                  placeholder="30"
                  min="1"
                  value={formData.numberOfSessions}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Yêu cầu tiên quyết
                </label>
                <input
                  type="text"
                  name="preRequisite"
                  className="form-control"
                  placeholder="VD: IELTS 5.0"
                  value={formData.preRequisite}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Trạng thái
                </label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="pending_approval">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                </select>
              </div>

              {/* Row 3: Phân bổ thời gian */}
              <div className="col-12">
                <label className="form-label fw-semibold text-neutral-900">
                  Phân bổ thời gian
                </label>
                <input
                  type="text"
                  name="timeAllocation"
                  className="form-control"
                  placeholder="VD: Total 120 hours: 40h class + 1h final exam + 79h self-study"
                  value={formData.timeAllocation}
                  onChange={handleInputChange}
                />
                <small className="text-muted">
                  Tổng số giờ học = giờ lên lớp + giờ thi + giờ tự học
                </small>
              </div>

              {/* Row 4: Mock Test Sessions */}
              <div className="col-12">
                <label className="form-label fw-semibold text-neutral-900">
                  Các buổi Mock Test
                </label>
                <input
                  type="text"
                  name="mocktestSessionOrders"
                  className="form-control"
                  placeholder="VD: 5, 10, 15, 20, 25, 30"
                  value={formData.mocktestSessionOrders.join(", ")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const orders = value
                      .split(",")
                      .map((num) => parseInt(num.trim()))
                      .filter((num) => !isNaN(num));
                    setFormData((prev) => ({
                      ...prev,
                      mocktestSessionOrders: orders,
                    }));
                  }}
                />
                <small className="text-muted">
                  Nhập số thứ tự các buổi học là mock test, cách nhau bởi dấu phẩy
                </small>
              </div>

              <div className="col-12">
                <hr className="my-3" />
              </div>

              {/* Row 5: Mô tả */}
              <div className="col-12">
                <label className="form-label fw-semibold text-neutral-900">
                  Mô tả học phần
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  placeholder="Mô tả chi tiết về nội dung, mục tiêu và phương pháp giảng dạy của học phần..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Row 6: Nhiệm vụ sinh viên */}
              <div className="col-12">
                <label className="form-label fw-semibold text-neutral-900">
                  Nhiệm vụ sinh viên
                </label>
                <textarea
                  name="studentTasks"
                  className="form-control"
                  rows="6"
                  placeholder={"Ví dụ:\n- Tham gia ít nhất 80% buổi học\n- Hoàn thành bài tập sau mỗi buổi học\n- Tham gia đầy đủ các bài kiểm tra giữa kỳ và cuối kỳ\n- Chuẩn bị trước bài học tại nhà"}
                  value={formData.studentTasks}
                  onChange={handleInputChange}
                />
                <small className="text-muted">
                  Liệt kê các nhiệm vụ, yêu cầu mà sinh viên cần hoàn thành
                </small>
              </div>

              <div className="col-12">
                <hr className="my-3" />
              </div>

              {/* Row 7: Tạo kế hoạch giảng dạy */}
              <div className="col-12">
                <div className="p-16 bg-neutral-25 radius-4 border border-neutral-200">
                  <h6 className="mb-12 fw-semibold text-neutral-900">
                    <i className="ph ph-calendar me-2"></i>
                    Kế hoạch giảng dạy
                  </h6>
                  <p className="text-sm text-neutral-600 mb-12">
                    {formData.sessions.length > 0
                      ? `Đã có ${formData.sessions.length} buổi học được tạo. Click để tạo lại kế hoạch.`
                      : "Tự động tạo các buổi học dựa trên số lượng buổi đã nhập ở trên."}
                  </p>
                  <Button
                    variant="primary"
                    icon="ph ph-plus-circle"
                    onClick={handleGenerateSessions}
                    disabled={!formData.numberOfSessions || formData.numberOfSessions <= 0}
                  >
                    Tạo kế hoạch giảng dạy ({formData.numberOfSessions || 0} buổi)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: Materials */}
        {activeTab === "materials" && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Tài liệu học tập</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Sách giáo khoa và tài liệu tham khảo
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-plus"
                onClick={handleAddMaterial}
              >
                Thêm tài liệu
              </Button>
            </div>

            {formData.materials.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-book-open ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">
                  Chưa có tài liệu nào được thêm
                </p>
                <Button
                  variant="primary"
                  icon="ph ph-plus"
                  onClick={handleAddMaterial}
                >
                  Thêm tài liệu đầu tiên
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên/Mô tả</th>
                      <th style={{ width: "200px" }}>Tác giả</th>
                      <th style={{ width: "150px" }}>Nhà xuất bản</th>
                      <th style={{ width: "100px" }}>Năm</th>
                      <th style={{ width: "200px" }}>Ghi chú</th>
                      <th style={{ width: "120px" }} className="text-center">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.materials.map((material, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-semibold">
                            {material.description}
                          </div>
                          {material.url && (
                            <div className="mt-1">
                              {material.fileName ? (
                                <div className="text-sm">
                                  <i className="ph ph-file me-1 text-info"></i>
                                  <span className="text-muted">File: </span>
                                  <strong>{material.fileName}</strong>
                                  {material.fileSize && (
                                    <span className="text-muted ms-2">
                                      ({(material.fileSize / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <a
                                  href={material.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary"
                                >
                                  <i className="ph ph-link me-1"></i>
                                  {material.url.length > 40 ? material.url.substring(0, 40) + '...' : material.url}
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                        <td>{material.author || "-"}</td>
                        <td>{material.publisher || "-"}</td>
                        <td>{material.publishedDate || "-"}</td>
                        <td className="text-sm">{material.note || "-"}</td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              variant="ghost"
                              icon="ph ph-pencil"
                              size="sm"
                              onClick={() => handleEditMaterial(index)}
                            />
                            <Button
                              variant="ghost"
                              icon="ph ph-trash"
                              size="sm"
                              onClick={() => handleDeleteMaterial(index)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 3: CLO & Mapping PLO */}
        {activeTab === "clo" && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Course Learning Outcomes (CLO)</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Chuẩn đầu ra của học phần và ánh xạ với PLO
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-plus"
                onClick={handleAddCLO}
              >
                Thêm CLO
              </Button>
            </div>

            {formData.clos.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-target ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có CLO nào được thêm</p>
                <Button
                  variant="primary"
                  icon="ph ph-plus"
                  onClick={handleAddCLO}
                >
                  Thêm CLO đầu tiên
                </Button>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: "100px" }}>Mã CLO</th>
                        <th>Tên CLO</th>
                        <th>Chi tiết</th>
                        <th style={{ width: "200px" }}>Mapped PLOs</th>
                        <th style={{ width: "120px" }} className="text-center">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.clos.map((clo, index) => (
                        <tr key={index}>
                          <td>
                            <Badge variant="primary">{clo.code}</Badge>
                          </td>
                          <td className="fw-semibold">{clo.name}</td>
                          <td className="text-neutral-600">{clo.detail}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {clo.mappedPLOs.map((ploId) => {
                                const plo = getPLOById(ploId);
                                return (
                                  <Badge key={ploId} variant="info" size="sm">
                                    {plo.code}
                                  </Badge>
                                );
                              })}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                variant="ghost"
                                icon="ph ph-pencil"
                                size="sm"
                                onClick={() => handleEditCLO(index)}
                              />
                              <Button
                                variant="ghost"
                                icon="ph ph-trash"
                                size="sm"
                                onClick={() => handleDeleteCLO(index)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderCLOPLOMatrix()}
              </>
            )}
          </Card>
        )}

        {/* Tab 4: Sessions / CAM Sessions */}
        {activeTab === "sessions" && (
          <Card>
            {isCamOnlineCourse ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-2">CAM Sessions</h5>
                    <p className="text-neutral-600 text-sm mb-0">
                      Khóa học này thuộc chương trình CAM và là khóa online. Kế hoạch giảng dạy
                      được quản lý thông qua CAM Sessions.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    icon="ph ph-plus"
                    onClick={handleQuickCreateCamSession}
                    disabled={
                      loading ||
                      !formData.numberOfSessions ||
                      (formData.camSessions?.length || 0) >= (formData.numberOfSessions || 0)
                    }
                  >
                    Thêm CAM Session
                  </Button>
                </div>

                 {formData.camSessions && formData.camSessions.length > 0 ? (
                   <div className="table-responsive">
                     <table className="table table-hover">
                       <thead>
                         <tr>
                           <th style={{ width: "80px" }}>Order</th>
                           <th>Tiêu đề</th>
                           <th style={{ width: "160px" }}>Loại</th>
                           <th>Mô tả</th>
                           <th style={{ width: "200px" }}>Video / Media</th>
                         </tr>
                       </thead>
                       <tbody>
                         {formData.camSessions
                           .slice()
                           .sort((a, b) => (a.order || 0) - (b.order || 0))
                           .map((camSession, index) => (
                             <tr key={camSession._id || index}>
                               <td className="text-center">
                                 <Badge variant="secondary">
                                   {camSession.order ?? index + 1}
                                 </Badge>
                               </td>
                               <td className="fw-semibold">{camSession.title || "-"}</td>
                               <td>
                                 {camSession.sessionType ? (
                                   <Badge variant="info" size="sm">
                                     {camSession.sessionType.charAt(0).toUpperCase() +
                                       camSession.sessionType.slice(1)}
                                   </Badge>
                                 ) : (
                                   <span className="text-muted text-sm">Chưa phân loại</span>
                                 )}
                               </td>
                               <td className="text-neutral-600">
                                 {camSession.description || "-"}
                               </td>
                               <td>
                                 <div className="d-flex justify-content-between align-items-center gap-2">
                                   <div>
                                     {camSession.videoURL ? (
                                       <a
                                         href={camSession.videoURL}
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="text-primary text-sm d-inline-flex align-items-center"
                                         style={{ wordBreak: "break-all" }}
                                       >
                                         <i className="ph ph-play-circle me-1"></i>
                                         Xem video
                                       </a>
                                     ) : (
                                       <span className="text-muted text-sm">Chưa có video</span>
                                     )}
                                   </div>
                                   <div className="d-flex gap-1">
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       icon="ph ph-pencil"
                                       onClick={() =>
                                         camSession._id &&
                                         navigate(`${basePath}/cam-sessions/${camSession._id}/edit`)
                                       }
                                       disabled={loading}
                                     />
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       icon="ph ph-trash"
                                       onClick={() => handleDeleteCamSessionRow(camSession._id)}
                                       disabled={loading}
                                     />
                                   </div>
                                 </div>
                               </td>
                             </tr>
                           ))}
                       </tbody>
                     </table>
                   </div>
                 ) : (
                  <div className="text-center py-5">
                    <i className="ph ph-calendar ph-3x text-neutral-400 mb-3"></i>
                    <p className="text-neutral-600 mb-0">
                      Chưa có CAM Session nào được tạo cho học phần này.
                    </p>
                    <p className="text-neutral-500 text-sm mb-0">
                      Vui lòng sử dụng bước CAM Session trong wizard để tạo nội dung.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="mb-2">Kế hoạch giảng dạy (Sessions)</h5>
                    <p className="text-neutral-600 text-sm mb-0">
                      Các buổi học và gán CLO cho từng buổi
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    icon="ph ph-plus"
                    onClick={handleAddSession}
                    disabled={formData.clos.length === 0}
                  >
                    Thêm Session
                  </Button>
                </div>

                {formData.clos.length === 0 && (
                  <div className="alert alert-warning">
                    <i className="ph ph-warning-circle me-2"></i>
                    Vui lòng tạo ít nhất 1 CLO trước khi tạo Session!
                  </div>
                )}

                {formData.sessions.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="ph ph-calendar ph-3x text-neutral-400 mb-3"></i>
                    <p className="text-neutral-600 mb-3">
                      Chưa có session nào được thêm
                    </p>
                    {formData.numberOfSessions > 0 && (
                      <div className="alert alert-info d-inline-block">
                        <i className="ph ph-info me-2"></i>
                        Bạn đã nhập <strong>{formData.numberOfSessions} buổi học</strong>.
                        Vui lòng quay lại tab "Thông tin cơ bản" và click "Tạo kế hoạch giảng dạy"
                        để tự động tạo các buổi học.
                      </div>
                    )}
                    {formData.clos.length > 0 && (
                      <div className="mt-3">
                        <Button
                          variant="primary"
                          icon="ph ph-plus"
                          onClick={handleAddSession}
                        >
                          Hoặc thêm session thủ công
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: "80px" }}>Order</th>
                          <th>Tiêu đề</th>
                          <th>Nội dung</th>
                          <th style={{ width: "150px" }}>Loại hình</th>
                          <th style={{ width: "150px" }}>CLOs</th>
                          <th style={{ width: "120px" }} className="text-center">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.sessions
                          .sort((a, b) => a.order - b.order)
                          .map((session, index) => (
                            <tr key={index}>
                              <td className="text-center">
                                <Badge variant="secondary">{session.order}</Badge>
                              </td>
                              <td className="fw-semibold">{session.title}</td>
                              <td className="text-neutral-600">
                                {session.content}
                              </td>
                              <td>
                                <Badge
                                  variant={
                                    session.learningType === "mocktest"
                                      ? "danger"
                                      : session.learningType === "theory"
                                      ? "info"
                                      : session.learningType === "practice"
                                      ? "success"
                                      : "warning"
                                  }
                                >
                                  {session.learningType === "mocktest"
                                    ? "Mock Test"
                                    : session.learningType === "theory"
                                    ? "Lý thuyết"
                                    : session.learningType === "practice"
                                    ? "Thực hành"
                                    : session.learningType}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {session.clos.length === 0 ? (
                                    <span className="text-muted text-sm">Chưa gán CLO</span>
                                  ) : (
                                    session.clos.map((cloCode) => (
                                      <Badge
                                        key={cloCode}
                                        variant="primary"
                                        size="sm"
                                      >
                                        {cloCode}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex gap-1 justify-content-center">
                                  <Button
                                    variant="ghost"
                                    icon="ph ph-pencil"
                                    size="sm"
                                    onClick={() => handleEditSession(index)}
                                  />
                                  <Button
                                    variant="ghost"
                                    icon="ph ph-trash"
                                    size="sm"
                                    onClick={() => handleDeleteSession(index)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      </form>

      {/* Modal: Material Form */}
      <Modal
        show={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title={
          editingMaterialIndex !== null
            ? "Chỉnh sửa tài liệu"
            : "Thêm tài liệu mới"
        }
        size="lg"
      >
        <div className="modal-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold">
                Tên/Mô tả tài liệu <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="description"
                className="form-control"
                placeholder="VD: Cambridge IELTS 18"
                value={materialForm.description}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Tác giả</label>
              <input
                type="text"
                name="author"
                className="form-control"
                placeholder="VD: Cambridge University Press"
                value={materialForm.author}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Nhà xuất bản</label>
              <input
                type="text"
                name="publisher"
                className="form-control"
                placeholder="VD: Cambridge"
                value={materialForm.publisher}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Năm xuất bản</label>
              <input
                type="text"
                name="publishedDate"
                className="form-control"
                placeholder="VD: 2023"
                value={materialForm.publishedDate}
                onChange={handleMaterialFormChange}
              />
            </div>

            {/* Lựa chọn Link hoặc Upload File */}
            <div className="col-12">
              <hr className="my-2" />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Tài liệu <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-4 mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="uploadType"
                    id="uploadTypeLink"
                    value="link"
                    checked={materialForm.uploadType === 'link'}
                    onChange={handleMaterialFormChange}
                  />
                  <label className="form-check-label" htmlFor="uploadTypeLink">
                    <i className="ph ph-link me-1"></i>
                    Gán link
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="uploadType"
                    id="uploadTypeFile"
                    value="file"
                    checked={materialForm.uploadType === 'file'}
                    onChange={handleMaterialFormChange}
                  />
                  <label className="form-check-label" htmlFor="uploadTypeFile">
                    <i className="ph ph-upload me-1"></i>
                    Upload file
                  </label>
                </div>
              </div>

              {/* Hiển thị input tương ứng */}
              {materialForm.uploadType === 'link' ? (
                <div>
                  <input
                    type="url"
                    name="url"
                    className="form-control"
                    placeholder="https://example.com/document.pdf"
                    value={materialForm.url}
                    onChange={handleMaterialFormChange}
                  />
                  <small className="text-muted">
                    Nhập đường dẫn URL đến tài liệu
                  </small>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    name="file"
                    className="form-control"
                    onChange={handleMaterialFormChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                  />
                  <small className="text-muted">
                    Chọn file tài liệu (PDF, Word, Excel, PowerPoint, ZIP...)
                  </small>
                  {materialForm.file && (
                    <div className="mt-2 p-2 bg-light rounded border">
                      <i className="ph ph-file me-2"></i>
                      <strong>{materialForm.file.name}</strong>
                      <span className="text-muted ms-2">
                        ({(materialForm.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Ghi chú</label>
              <textarea
                name="note"
                className="form-control"
                rows="3"
                placeholder="VD: Sách chính, bắt buộc"
                value={materialForm.note}
                onChange={handleMaterialFormChange}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowMaterialModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveMaterial}>
            Lưu
          </Button>
        </div>
      </Modal>

      {/* Modal: CLO Form */}
      <Modal
        show={showCLOModal}
        onClose={() => setShowCLOModal(false)}
        title={editingCLOIndex !== null ? "Chỉnh sửa CLO" : "Thêm CLO mới"}
        size="lg"
      >
        <div className="modal-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Mã CLO <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="code"
                className="form-control"
                placeholder="VD: CLO1"
                value={cloForm.code}
                onChange={handleCLOFormChange}
              />
            </div>

            <div className="col-md-8">
              <label className="form-label fw-semibold">
                Tên CLO <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="VD: Reading Strategies"
                value={cloForm.name}
                onChange={handleCLOFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Chi tiết <span className="text-danger">*</span>
              </label>
              <textarea
                name="detail"
                className="form-control"
                rows="3"
                placeholder="Mô tả chi tiết về CLO..."
                value={cloForm.detail}
                onChange={handleCLOFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Mapping PLO <span className="text-danger">*</span>
              </label>
              <div className="border rounded p-3">
                {program.plos.map((plo) => (
                  <div key={plo._id} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`plo-${plo._id}`}
                      checked={cloForm.mappedPLOs.includes(plo._id)}
                      onChange={() => handlePLOCheckbox(plo._id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`plo-${plo._id}`}
                    >
                      <Badge variant="info" className="me-2">
                        {plo.code}
                      </Badge>
                      <span className="fw-semibold">{plo.name}</span>
                      <div className="text-sm text-neutral-600">
                        {plo.detail}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowCLOModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveCLO}>
            Lưu
          </Button>
        </div>
      </Modal>

      {/* Modal: Session Form */}
      <Modal
        show={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title={
          editingSessionIndex !== null
            ? "Chỉnh sửa Session"
            : "Thêm Session mới"
        }
        size="lg"
      >
        <div className="modal-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Order (Tự động)</label>
              <input
                type="number"
                name="order"
                className="form-control"
                min="1"
                value={sessionForm.order}
                onChange={handleSessionFormChange}
                readOnly
                disabled
                style={{ backgroundColor: '#e9ecef' }}
              />
              <small className="text-muted">Tự động tăng dần</small>
            </div>

            <div className="col-md-9">
              <label className="form-label fw-semibold">
                Tiêu đề <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="VD: Introduction to IELTS Reading"
                value={sessionForm.title}
                onChange={handleSessionFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Loại hình học tập
              </label>
              <select
                name="learningType"
                className="form-select"
                value={sessionForm.learningType}
                onChange={handleSessionFormChange}
              >
                <option value="theory">Theory (Lý thuyết)</option>
                <option value="mocktest">Mock Test (Kiểm tra)</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Nội dung <span className="text-danger">*</span>
              </label>
              <textarea
                name="content"
                className="form-control"
                rows="4"
                placeholder="Mô tả nội dung buổi học..."
                value={sessionForm.content}
                onChange={handleSessionFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Gán CLO <span className="text-danger">*</span>
              </label>
              <div className="border rounded p-3">
                {formData.clos.map((clo, index) => (
                  <div key={index} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`session-clo-${clo.code}`}
                      checked={sessionForm.clos.includes(clo.code)}
                      onChange={() => handleSessionCLOCheckbox(clo.code)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`session-clo-${clo.code}`}
                    >
                      <Badge variant="primary" className="me-2">
                        {clo.code}
                      </Badge>
                      <span className="fw-semibold">{clo.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowSessionModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveSession}>
            Lưu
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CourseFormNew;
