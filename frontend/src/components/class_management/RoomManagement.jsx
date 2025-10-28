import React, { useState } from 'react';
import './RoomManagement.css';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content room-management-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quản lý phòng học</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Add/Edit Form */}
          {showAddForm && (
            <form onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom} className="room-form">
              <h4>{editingRoom ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tên phòng <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Room 101"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Sức chứa <span className="required">*</span></label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Số lượng học viên"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Hoạt động</option>
                    <option value="maintenance">Bảo trì</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Thiết bị</label>
                <div className="equipment-selector">
                  {equipmentOptions.map(equipment => (
                    <label key={equipment} className="equipment-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.equipment.includes(equipment)}
                        onChange={() => handleEquipmentToggle(equipment)}
                      />
                      <span>{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          )}

          {/* Add button */}
          {!showAddForm && (
            <button 
              className="btn btn-primary add-room-btn"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus"></i> Thêm phòng học mới
            </button>
          )}

          {/* Room list */}
          <div className="rooms-list">
            <h4>Danh sách phòng học ({roomList.length})</h4>
            
            <div className="rooms-grid">
              {roomList.map(room => (
                <div key={room.id} className={`room-card status-${room.status || 'active'}`}>
                  <div className="room-header">
                    <h5>{room.name}</h5>
                    <span className={`status-badge status-${room.status || 'active'}`}>
                      {room.status === 'active' && 'Hoạt động'}
                      {room.status === 'maintenance' && 'Bảo trì'}
                      {room.status === 'inactive' && 'Không hoạt động'}
                    </span>
                  </div>

                  <div className="room-info">
                    <div className="info-item">
                      <i className="fas fa-users"></i>
                      <span>Sức chứa: {room.capacity} người</span>
                    </div>
                    
                    {room.equipment && room.equipment.length > 0 && (
                      <div className="info-item">
                        <i className="fas fa-tools"></i>
                        <div className="equipment-list">
                          {room.equipment.map((eq, index) => (
                            <span key={index} className="equipment-tag">{eq}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="room-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditRoom(room)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteRoom(room.id)}
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

              {roomList.length === 0 && (
                <div className="no-rooms">
                  <i className="fas fa-door-open"></i>
                  <p>Chưa có phòng học nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
