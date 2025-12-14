import React from 'react';
import { Card, Table, Pagination, Button } from 'react-bootstrap';

/**
 * TeacherListView Component
 * Component hiển thị list/table view của giảng viên với pagination
 */
const TeacherListView = ({ teachers, page, totalPages, onViewDetail, onPageChange }) => {
  return (
    <Card className="bg-white border-0 rounded-12 box-shadow-sm">
      <Card.Body className="p-0">
        <Table hover className="mb-0">
          <thead>
            <tr className="bg-neutral-25">
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Giảng viên</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Email</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Số điện thoại</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Lớp học</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-40 text-neutral-500">
                  Không có giảng viên nào
                </td>
              </tr>
            ) : (
              teachers.map(teacher => (
                <tr key={teacher._id}>
                  <td className="px-20 py-16">
                    <div className="d-flex align-items-center gap-12">
                      <div 
                        className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className="fas fa-user-tie text-primary"></i>
                      </div>
                      <div className="text-neutral-900 fw-semibold text-14">{teacher.username}</div>
                    </div>
                  </td>
                  <td className="px-20 py-16 text-neutral-700 text-14">{teacher.email}</td>
                  <td className="px-20 py-16 text-neutral-700 text-14">{teacher.phone || 'N/A'}</td>
                  <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                    {teacher.stats?.classCount || 0}
                  </td>
                  <td className="px-20 py-16">
                    <div className="d-flex gap-8">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => onViewDetail(teacher)}
                      >
                        <i className="fas fa-eye me-1"></i>
                        Chi tiết
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
      {/* Pagination */}
      {totalPages > 1 && (
        <Card.Footer className="bg-neutral-25 border-0 px-20 py-16">
          <div className="d-flex justify-content-center">
            <Pagination className="mb-0">
              <Pagination.First 
                onClick={() => onPageChange(1)} 
                disabled={page === 1}
              />
              <Pagination.Prev 
                onClick={() => onPageChange(Math.max(1, page - 1))} 
                disabled={page === 1}
              />
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === page}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                } else if (
                  pageNum === page - 2 ||
                  pageNum === page + 2
                ) {
                  return <Pagination.Ellipsis key={pageNum} />;
                }
                return null;
              })}
              <Pagination.Next 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))} 
                disabled={page === totalPages}
              />
              <Pagination.Last 
                onClick={() => onPageChange(totalPages)} 
                disabled={page === totalPages}
              />
            </Pagination>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default TeacherListView;

