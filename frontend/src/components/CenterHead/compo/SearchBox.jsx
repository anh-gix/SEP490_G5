import { useState } from 'react';

/**
 * SearchBox Component
 *
 * Thanh tìm kiếm có thể tùy chỉnh với placeholder và callback
 *
 * @param {string} placeholder - Text hiển thị trong ô search
 * @param {function} onSearch - Callback function khi search (nhận keyword)
 * @param {string} value - Giá trị controlled (optional)
 * @param {function} onChange - Callback khi thay đổi (optional)
 * @param {string} className - Custom class (optional)
 */
const SearchBox = ({
  placeholder = "Tìm kiếm...",
  onSearch,
  value: controlledValue,
  onChange: controlledOnChange,
  className = ""
}) => {
  const [internalValue, setInternalValue] = useState("");

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (isControlled && controlledOnChange) {
      controlledOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    if (isControlled && controlledOnChange) {
      controlledOnChange("");
    } else {
      setInternalValue("");
    }
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`search-box ${className}`}>
      <div className="position-relative">
        <i className="ph ph-magnifying-glass position-absolute start-0 top-50 translate-middle-y ms-12 text-neutral-600"></i>
        <input
          type="text"
          className="form-control ps-40 pe-40"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
        {value && (
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-8 p-0 text-neutral-600"
            onClick={handleClear}
          >
            <i className="ph ph-x text-lg"></i>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBox;
