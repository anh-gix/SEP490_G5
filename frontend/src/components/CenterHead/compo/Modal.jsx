/**
 * Modal Component
 *
 * Modal tùy biến với header, body, footer
 *
 * @param {boolean} show - Hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {string} title - Tiêu đề modal
 * @param {node} children - Nội dung modal
 * @param {node} footer - Footer custom (optional)
 * @param {string} size - Kích thước: sm, md, lg, xl (default: md)
 * @param {boolean} closeOnBackdrop - Đóng khi click backdrop (default: true)
 */
const Modal = ({
  show,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true
}) => {
  if (!show) return null;

  const sizeClass = {
    sm: "modal-sm",
    md: "",
    lg: "modal-lg",
    xl: "modal-xl"
  }[size];

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleBackdropClick}
    >
      <div className={`modal-dialog modal-dialog-centered ${sizeClass}`}>
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header border-bottom border-neutral-100">
            <h5 className="modal-title text-neutral-900 fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="modal-footer border-top border-neutral-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;

/**
 * USAGE EXAMPLE:
 *
 * const [showModal, setShowModal] = useState(false);
 *
 * <Modal
 *   show={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Xác nhận xóa"
 *   footer={
 *     <>
 *       <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
 *         Hủy
 *       </button>
 *       <button className="btn btn-danger" onClick={handleDelete}>
 *         Xóa
 *       </button>
 *     </>
 *   }
 * >
 *   <p>Bạn có chắc chắn muốn xóa?</p>
 * </Modal>
 */
