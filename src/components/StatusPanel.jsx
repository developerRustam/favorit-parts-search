export default function StatusPanel({ text, loading = false, error = false, onRetry }) {
  return (
    <div className={`status-panel ${error ? 'alert alert-danger' : 'text-secondary'}`} role={error ? 'alert' : 'status'}>
      {loading && (
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
      )}
      <span>{text}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
