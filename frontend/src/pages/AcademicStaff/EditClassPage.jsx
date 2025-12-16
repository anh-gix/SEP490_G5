import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AcademicLayout from '../../components/class_management/AcademicLayout';
import EditClassForm from '../../components/class_management/EditClassModal';
import classService from '../../services/classService';
import { Spinner, Alert } from 'react-bootstrap';
<<<<<<< HEAD
=======
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
>>>>>>> origin/Namvv-teacher-class-management

const EditClassPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId) {
        setError('Không tìm thấy ID lớp học');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await classService.getClassById(classId);
        
        // Handle different response formats
        let fetchedClassData = null;
        if (response && response.success && response.class) {
          fetchedClassData = response.class;
        } else if (response && response.data) {
          fetchedClassData = response.data;
        } else if (response && response.class) {
          fetchedClassData = response.class;
        } else {
          fetchedClassData = response;
        }

        if (fetchedClassData) {
          // Transform to match EditClassForm expected format
          setClassData({
            ...fetchedClassData,
            id: fetchedClassData._id || fetchedClassData.id || classId
          });
        } else {
          setError('Không tìm thấy thông tin lớp học');
        }
      } catch (err) {
        console.error('Error fetching class data:', err);
        setError(err.message || 'Không thể tải thông tin lớp học');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  const handleSubmit = async (submitData) => {
    try {
      await classService.updateClass(submitData.id, submitData);
      alert('Cập nhật lớp học thành công!');
      navigate('/academic/class-management');
    } catch (err) {
      console.error('Error updating class:', err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật lớp học!');
      throw err; // Re-throw to let EditClassForm handle it
    }
  };

<<<<<<< HEAD
=======
  const handleDeleteClass = async (classIdToDelete) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa lớp học này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      await classService.deleteClass(classIdToDelete);
      toast.success('Xóa lớp học thành công!');
      navigate('/academic/class-management');
    } catch (err) {
      console.error('Error deleting class:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi xóa lớp học!');
    }
  };

>>>>>>> origin/Namvv-teacher-class-management
  if (loading) {
    return (
      <AcademicLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-neutral-500">Đang tải dữ liệu...</p>
        </div>
      </AcademicLayout>
    );
  }

  if (error) {
    return (
      <AcademicLayout>
        <Alert variant="danger" className="m-24">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </AcademicLayout>
    );
  }

  if (!classData) {
    return (
      <AcademicLayout>
        <Alert variant="warning" className="m-24">
          <Alert.Heading>Cảnh báo!</Alert.Heading>
          <p>Không tìm thấy thông tin lớp học</p>
        </Alert>
      </AcademicLayout>
    );
  }

  return (
    <AcademicLayout>
      <EditClassForm
        classData={classData}
        onSubmit={handleSubmit}
<<<<<<< HEAD
=======
        onDelete={handleDeleteClass}
        classId={classId}
>>>>>>> origin/Namvv-teacher-class-management
      />
    </AcademicLayout>
  );
};

export default EditClassPage;

