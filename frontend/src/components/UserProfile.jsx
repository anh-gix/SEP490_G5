import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile">
      <div className="dropdown">
        <button 
          className="btn btn-outline-primary dropdown-toggle" 
          type="button" 
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {user.username || user.email}
        </button>
        <ul className="dropdown-menu">
          <li><h6 className="dropdown-header">Thông tin tài khoản</h6></li>
          <li><span className="dropdown-item-text">Email: {user.email}</span></li>
          {user.phone && <li><span className="dropdown-item-text">Phone: {user.phone}</span></li>}
          {user.address && <li><span className="dropdown-item-text">Address: {user.address}</span></li>}
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button 
              className="dropdown-item text-danger" 
              onClick={handleLogout}
            >
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
