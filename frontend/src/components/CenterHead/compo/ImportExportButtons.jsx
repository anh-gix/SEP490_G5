/**
 * ImportExportButtons Component
 *
 * Nhóm nút Import và Export với icon
 *
 * @param {function} onImport - Callback khi click Import
 * @param {function} onExport - Callback khi click Export
 * @param {boolean} showImport - Hiển thị nút Import (default: true)
 * @param {boolean} showExport - Hiển thị nút Export (default: true)
 * @param {string} importLabel - Text cho nút Import
 * @param {string} exportLabel - Text cho nút Export
 * @param {boolean} loading - Trạng thái loading
 */
const ImportExportButtons = ({
  onImport,
  onExport,
  showImport = true,
  showExport = true,
  importLabel = "Import",
  exportLabel = "Export",
  loading = false
}) => {
  return (
    <div className="import-export-buttons d-flex align-items-center gap-2">
      {showImport && (
        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center gap-2"
          onClick={onImport}
          disabled={loading}
        >
          <i className="ph ph-upload-simple"></i>
          <span>{importLabel}</span>
        </button>
      )}

      {showExport && (
        <button
          type="button"
          className="btn btn-outline-success d-flex align-items-center gap-2"
          onClick={onExport}
          disabled={loading}
        >
          <i className="ph ph-download-simple"></i>
          <span>{exportLabel}</span>
        </button>
      )}
    </div>
  );
};

export default ImportExportButtons;
