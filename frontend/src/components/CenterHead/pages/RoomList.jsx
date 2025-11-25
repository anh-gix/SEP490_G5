import { useEffect, useState } from 'react';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import ActionMenu from '../compo/ActionMenu';
import { mockRooms, mockRoomStats, simulateApiDelay } from '../../../helper/mockdataExtended';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(400);
      setRooms(mockRooms);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý phòng học', path: '/center-head/rooms' },
  ];

  const columns = [
    {
      header: 'Phòng học',
      field: 'room_name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">{row.room_name}</div>
          <div className="text-sm text-neutral-600">{row.location}</div>
        </div>
      ),
    },
    {
      header: 'Sức chứa',
      field: 'capacity',
      render: (row) => (
        <span className="text-neutral-700">{row.capacity} người</span>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Sử dụng hôm nay',
      field: 'todayUsage',
      render: (row) => (
        <div>
          <span className="text-neutral-900">{row.todayUsage.used}/{row.todayUsage.total} slots</span>
          <div className="progress mt-4" style={{ height: '4px' }}>
            <div
              className="progress-bar bg-main-600"
              style={{ width: `${(row.todayUsage.used / row.todayUsage.total) * 100}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <ActionMenu
          actions={[
            {
              label: "Xem lịch sử",
              icon: "ph ph-clock-clockwise",
              onClick: () => console.log('View history', row._id)
            },
            {
              label: "Chỉnh sửa",
              icon: "ph ph-pencil-simple",
              onClick: () => console.log('Edit', row._id)
            },
            {
              label: row.status === 'maintenance' ? 'Kích hoạt' : 'Bảo trì',
              icon: row.status === 'maintenance' ? 'ph ph-check' : 'ph ph-wrench',
              onClick: () => console.log('Toggle maintenance', row._id)
            },
          ]}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  return (
    <div className="room-list-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý phòng học</h4>
          <p className="text-neutral-600 mb-0">Quản lý và tối ưu hóa phòng học</p>
        </div>
        <Button variant="primary" icon="ph ph-plus">
          Thêm phòng
        </Button>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-24">
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Tổng phòng</h6>
            <h4 className="text-neutral-900 fw-bold mb-0">{mockRoomStats.total}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Có sẵn</h6>
            <h4 className="text-success-600 fw-bold mb-0">{mockRoomStats.available}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Đang sử dụng</h6>
            <h4 className="text-main-600 fw-bold mb-0">{mockRoomStats.inUse}</h4>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <h6 className="text-neutral-600 mb-8">Bảo trì</h6>
            <h4 className="text-warning-600 fw-bold mb-0">{mockRoomStats.maintenance}</h4>
          </Card>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table columns={columns} data={rooms} />
      </Card>
    </div>
  );
};

export default RoomList;
