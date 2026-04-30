import { useState } from 'react';

// Dùng fetch trực tiếp để tải file blob — axios không xử lý tốt với attachment
const ExportButton = ({ url, fileName, label, variant = 'ghost' }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Tải file thất bại');
      }

      const blob   = await res.blob();
      const href   = URL.createObjectURL(blob);
      const a      = document.createElement('a');
      a.href       = href;
      a.download   = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cls = variant === 'primary' ? 'btn-primary' : 'btn-ghost';

  return (
    <button onClick={handleClick} disabled={loading} className={`${cls} flex items-center gap-1.5 text-sm`}>
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Đang xuất...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3M3 17a9 9 0 0118 0v1H3v-1z"/>
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

export default ExportButton;
