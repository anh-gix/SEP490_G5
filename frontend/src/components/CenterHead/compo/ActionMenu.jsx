import { useState, useRef, useEffect } from 'react';

/**
 * ActionMenu Component
 *
 * Dropdown menu với các action (Xem, Sửa, Xóa, v.v.)
 *
 * @param {array} actions - Mảng các action: [{ label, icon, onClick, variant }]
 * @param {string} triggerIcon - Icon cho nút trigger (default: ph-dots-three-vertical)
 * @param {string} align - Vị trí menu: left, right (default: right)
 */
const ActionMenu = ({
  actions = [],
  triggerIcon = "ph-dots-three-vertical",
  align = "right"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  const alignClass = align === "left" ? "start-0" : "end-0";

  return (
    <div className="action-menu position-relative" ref={menuRef}>
      <button
        type="button"
        className="btn btn-link text-neutral-600 p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className={`${triggerIcon} text-xl`}></i>
      </button>

      {isOpen && (
        <div
          className={`dropdown-menu show position-absolute ${alignClass} mt-2 shadow-sm border border-neutral-100`}
          style={{ minWidth: '180px', zIndex: 1000 }}
        >
          {actions.map((action, index) => {
            const variantClass = {
              danger: "text-danger-600",
              warning: "text-warning-600",
              primary: "text-main-600",
              success: "text-success-600",
            }[action.variant] || "text-neutral-900";

            return (
              <button
                key={index}
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2 ${variantClass}`}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
              >
                {action.icon && <i className={`${action.icon}`}></i>}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;

/**
 * USAGE EXAMPLE:
 *
 * const actions = [
 *   {
 *     label: "Xem chi tiết",
 *     icon: "ph ph-eye",
 *     onClick: () => navigate(`/detail/${id}`)
 *   },
 *   {
 *     label: "Chỉnh sửa",
 *     icon: "ph ph-pencil-simple",
 *     onClick: () => setShowEditModal(true)
 *   },
 *   {
 *     label: "Xóa",
 *     icon: "ph ph-trash",
 *     variant: "danger",
 *     onClick: () => handleDelete(id)
 *   }
 * ];
 *
 * <ActionMenu actions={actions} />
 */
