import React, { useState } from 'react';
import { Modal, Button, Form, Table, Badge } from 'react-bootstrap';

const RoomManagement = ({ rooms, onClose, onUpdate }) => {
  const [roomList, setRoomList] = useState(rooms);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    equipment: [],
    status: 'active'
  });

  const equipmentOptions = [
    'Projector',
    'Whiteboard',
    'Computer',
    'Sound System',
    'Air Conditioning',
    'TV',
    'Internet'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipmentToggle = (equipment) => {
    setFormData(prev => {
      const newEquipment = prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment];
      return { ...prev, equipment: newEquipment };
    });
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newRoom = await response.json();
      setRoomList([...roomList, newRoom]);
      resetForm();
      alert('Thêm phòng học thành công!');
      onUpdate();
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Có lỗi xảy ra khi thêm phòng học!');
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      equipment: room.equipment || [],
      status: room.status || 'active'
    });
    setShowAddForm(true);
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const updatedRoom = await response.json();
      setRoomList(roomList.map(r => r.id === updatedRoom.id ? updatedRoom : r));
      resetForm();
      alert('Cập nhật phòng học thành công!');
      onUpdate();
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Có lỗi xảy ra khi cập nhật phòng học!');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng học này?')) return;
    
    try {
      await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      setRoomList(roomList.filter(r => r.id !== roomId));
      alert('Xóa phòng học thành công!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Có lỗi xảy ra khi xóa phòng học!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      equipment: [],
      status: 'active'
    });
    setShowAddForm(false);
    setEditingRoom(null);
  };

  return (
    <Modal show={true} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Quản lý phòng học</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Add/Edit Form */}
        {showAddForm && (
          <Form 
            onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom}
            className="mb-4 p-3 border rounded bg-light"
          >
            <h5 className="mb-3">
              {editingRoom ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
            </h5>
            
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Tên phòng <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Room 101"
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Sức chứa <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Số lượng học viên"
                    required
                  />
                </Form.Group>
              </div>

              <div className="col-md-4">
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="inactive">Không hoạt động</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Thiết bị</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {equipmentOptions.map(equipment => (
                  <Form.Check
                    key={equipment}
                    type="checkbox"
                    id={`equipment-${equipment}`}
                    label={equipment}
                    checked={formData.equipment.includes(equipment)}
                    onChange={() => handleEquipmentToggle(equipment)}
                  />
                ))}
              </div>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={resetForm}>
                <i className="fas fa-times me-2"></i>Hủy
              </Button>
              <Button variant="primary" type="submit">
                <i className="fas fa-save me-2"></i>
                {editingRoom ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form>
        )}

        {/* Add button */}
        {!showAddForm && (
          <Button 
            variant="primary"
            className="mb-3"
            onClick={() => setShowAddForm(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Thêm phòng học mới
          </Button>
        )}

        {/* Room list */}
        <div>
          <h5 className="mb-3">Danh sách phòng học ({roomList.length})</h5>
          
          {roomList.length > 0 ? (
            <div className="row g-3">
              {roomList.map(room => (
                <div key={room.id} className="col-md-6 col-lg-4">
                  <div className={`card h-100 ${
                    room.status === 'maintenance' ? 'border-warning' :
                    room.status === 'inactive' ? 'border-danger' :
                    'border-success'
                  }`}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <strong>{room.name}</strong>
                      <Badge bg={
                        room.status === 'maintenance' ? 'warning' :
                        room.status === 'inactive' ? 'danger' :
                        'success'
                      }>
                        {room.status === 'active' && 'Hoạt động'}
                        {room.status === 'maintenance' && 'Bảo trì'}
                        {room.status === 'inactive' && 'Không hoạt động'}
                      </Badge>
                    </div>

                    <div className="card-body">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="fas fa-users text-muted"></i>
                        <span>Sức chứa: <strong>{room.capacity}</strong> người</span>
                      </div>
                      
                      {room.equipment && room.equipment.length > 0 && (
                        <div className="d-flex align-items-start gap-2">
                          <i className="fas fa-tools text-muted mt-1"></i>
                          <div className="d-flex flex-wrap gap-1">
                            {room.equipment.map((eq, index) => (
                              <Badge key={index} bg="secondary" pill className="small">
                                {eq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="card-footer bg-white d-flex gap-2 justify-content-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditRoom(room)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteRoom(room.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-door-open fa-4x text-muted mb-3 d-block"></i>
              <h5 className="text-muted">Chưa có phòng học nào</h5>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomManagement;
