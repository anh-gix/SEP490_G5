/**
 * FilterBar Component
 *
 * Thanh filter với dropdown cho status, role, program, v.v.
 *
 * @param {array} filters - Mảng các filter config
 * @param {object} values - Object chứa giá trị hiện tại của các filter
 * @param {function} onChange - Callback khi thay đổi filter (filterKey, value)
 * @param {function} onReset - Callback khi reset tất cả filters
 */
const FilterBar = ({ filters = [], values = {}, onChange, onReset }) => {
  const handleFilterChange = (filterKey, value) => {
    if (onChange) {
      onChange(filterKey, value);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const hasActiveFilters = Object.values(values).some(val => val && val !== "all");

  return (
    <div className="filter-bar d-flex align-items-center gap-3 flex-wrap">
      {filters.map((filter) => (
        <div key={filter.key} className="filter-item">
          <select
            className="form-select"
            value={values[filter.key] || "all"}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          >
            <option value="all">{filter.label}: Tất cả</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-link text-neutral-600 text-decoration-none"
          onClick={handleReset}
        >
          <i className="ph ph-x-circle me-1"></i>
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default FilterBar;

/**
 * USAGE EXAMPLE:
 *
 * const filters = [
 *   {
 *     key: "status",
 *     label: "Trạng thái",
 *     options: [
 *       { value: "active", label: "Đang hoạt động" },
 *       { value: "inactive", label: "Không hoạt động" },
 *     ]
 *   },
 *   {
 *     key: "role",
 *     label: "Vai trò",
 *     options: [
 *       { value: "teacher", label: "Giảng viên" },
 *       { value: "student", label: "Học viên" },
 *     ]
 *   }
 * ];
 *
 * const [filterValues, setFilterValues] = useState({});
 *
 * <FilterBar
 *   filters={filters}
 *   values={filterValues}
 *   onChange={(key, value) => setFilterValues({...filterValues, [key]: value})}
 *   onReset={() => setFilterValues({})}
 * />
 */
