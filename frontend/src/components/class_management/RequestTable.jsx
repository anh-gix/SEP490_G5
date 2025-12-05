import React from 'react';
import { Card, Table, Pagination, Button } from 'react-bootstrap';
import { getStatusBadge, getTypeBadge, formatDate } from '../../utils/requestHelpers';

/**
 * RequestTable Component
 * Component table hiển thị danh sách đơn với pagination
 */
const RequestTable = ({
  requests,
  loading,
  error,
  page,
  totalPages,
  total,
  sortBy,
  processing,
  onViewDetails,
  onSortChange,
  onPageChange
}) => {
  if (loading) {
    return null; // Loading handled by parent
  }

  if (error) {
    return null; // Error handled by parent
  }

  return (
    <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
      <Card.Body className="p-0">
        <Table hover className="mb-0">
          <thead>
            <tr className="bg-neutral-25">
              <th 
                className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (sortBy === 'sender') {
                    onSortChange('sender-desc');
                  } else {
                    onSortChange('sender');
                  }
                }}
              >
                Người gửi
                {sortBy === 'sender' && <span className="ms-2">↑</span>}
                {sortBy === 'sender-desc' && <span className="ms-2">↓</span>}
              </th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Loại đơn</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Nội dung</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Ngày gửi</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Trạng thái</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Người duyệt</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Ngày duyệt</th>
              <th className="px-20 py-16 text-neutral-900 fw-semibold text-21 border-0">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-40 text-neutral-500">
                  Không có đơn nào
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request._id}>
                  <td className="px-20 py-16">
                    <div>
                      <div className="text-neutral-900 fw-medium">{request.sender?.username || '-'}</div>
                      <div className="text-neutral-600 text-12">{request.sender?.email || '-'}</div>
                    </div>
                  </td>
                  <td className="px-20 py-16">
                    {getTypeBadge(request.type)}
                  </td>
                  <td className="px-20 py-16">
                    <div className="text-neutral-700" style={{ maxWidth: '300px' }}>
                      {request.content}
                    </div>
                  </td>
                  <td className="px-20 py-16 text-neutral-600 text-13">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-20 py-16">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-20 py-16 text-neutral-600 text-13">
                    {request.approver?.username || '-'}
                  </td>
                  <td className="px-20 py-16 text-neutral-600 text-13">
                    {formatDate(request.approvedDate)}
                  </td>
                  <td className="px-20 py-16">
                    {request.status === 'pending' ? (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(request);
                        }}
                        disabled={processing}
                      >
                        Xem chi tiết
                      </Button>
                    ) : (
                      <span className="text-neutral-500 text-13">-</span>
                    )}
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
          <div className="text-center mt-12 text-neutral-600 text-12">
            Trang {page} / {totalPages} ({total} đơn)
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default RequestTable;

