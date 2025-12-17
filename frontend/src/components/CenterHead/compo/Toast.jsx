import { useEffect } from 'react';

/**
 * Toast Component - Modern notification system
 *
 * @param {string} message - Toast message
 * @param {string} type - success | error | warning | info
 * @param {number} duration - Duration in ms (default: 3000)
 * @param {function} onClose - Callback when toast closes
 * @param {string} position - Position: top-right | top-left | bottom-right | bottom-left (default: top-right)
 */
const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      icon: 'ph ph-check-circle',
      bgColor: 'bg-success-subtle',
      textColor: 'text-success',
      borderColor: 'border-success'
    },
    error: {
      icon: 'ph ph-x-circle',
      bgColor: 'bg-danger-subtle',
      textColor: 'text-danger',
      borderColor: 'border-danger'
    },
    warning: {
      icon: 'ph ph-warning-circle',
      bgColor: 'bg-warning-subtle',
      textColor: 'text-warning',
      borderColor: 'border-warning'
    },
    info: {
      icon: 'ph ph-info',
      bgColor: 'bg-info-subtle',
      textColor: 'text-info',
      borderColor: 'border-info'
    }
  };

  const positionStyles = {
    'top-right': 'top-0 end-0 mt-3 me-3',
    'top-left': 'top-0 start-0 mt-3 ms-3',
    'bottom-right': 'bottom-0 end-0 mb-3 me-3',
    'bottom-left': 'bottom-0 start-0 mb-3 ms-3'
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`position-fixed ${positionStyles[position]}`}
      style={{ zIndex: 9999 }}
    >
      <div
        className={`toast show align-items-center ${style.bgColor} ${style.borderColor} border`}
        role="alert"
        style={{ minWidth: '300px' }}
      >
        <div className="d-flex p-3">
          <div className="toast-body d-flex align-items-center gap-2">
            <i className={`${style.icon} ${style.textColor} fs-5`}></i>
            <span className={`${style.textColor} fw-medium`}>{message}</span>
          </div>
          <button
            type="button"
            className={`btn-close btn-close-sm me-2 m-auto ${style.textColor}`}
            onClick={onClose}
          ></button>
        </div>
      </div>
    </div>
  );
};

/**
 * Toast Container - Manages multiple toasts
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default Toast;

/**
 * USAGE EXAMPLE:
 *
 * // In your component:
 * const [toasts, setToasts] = useState([]);
 *
 * const showToast = (message, type = 'info', duration = 3000) => {
 *   const newToast = {
 *     id: Date.now(),
 *     message,
 *     type,
 *     duration,
 *     position: 'top-right'
 *   };
 *   setToasts(prev => [...prev, newToast]);
 * };
 *
 * const removeToast = (id) => {
 *   setToasts(prev => prev.filter(toast => toast.id !== id));
 * };
 *
 * // In JSX:
 * <ToastContainer toasts={toasts} removeToast={removeToast} />
 *
 * // Show toast:
 * showToast('Tạo thành công!', 'success');
 */
