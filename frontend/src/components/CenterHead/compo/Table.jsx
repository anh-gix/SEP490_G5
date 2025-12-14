import React from 'react';

const Table = ({ columns, data, onRowClick, className = '' }) => {
  // Helper function to get responsive class for column visibility
  const getColumnClass = (column) => {
    const baseClass = `px-24 py-16 ${column.cellClassName || ''}`;
    // hideOnMobile: hide column on screens < md (768px)
    if (column.hideOnMobile) {
      return `${baseClass} d-none d-md-table-cell`;
    }
    // hideOnTablet: hide column on screens < lg (992px)
    if (column.hideOnTablet) {
      return `${baseClass} d-none d-lg-table-cell`;
    }
    return baseClass;
  };

  const getHeaderClass = (column) => {
    const baseClass = `px-24 py-16 text-neutral-700 fw-semibold ${column.className || ''}`;
    if (column.hideOnMobile) {
      return `${baseClass} d-none d-md-table-cell`;
    }
    if (column.hideOnTablet) {
      return `${baseClass} d-none d-lg-table-cell`;
    }
    return baseClass;
  };

  // Handle cell click - stop propagation for actions column
  const handleCellClick = (e, column) => {
    // If this is an actions column (has field 'actions'), stop propagation
    if (column.field === 'actions') {
      e.stopPropagation();
    }
  };

  return (
    <div className={`table-responsive ${className}`}>
      <table className="table table-hover border border-neutral-40">
        <thead className="bg-neutral-20">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={getHeaderClass(column)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={getColumnClass(column)}
                    onClick={(e) => handleCellClick(e, column)}
                  >
                    {column.render ? column.render(row) : row[column.field]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-32 text-neutral-500">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;