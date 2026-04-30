const LoadingSpinner = ({ text = 'Đang tải...' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <svg className="animate-spin w-8 h-8 mb-3 text-red-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    <p className="text-sm">{text}</p>
  </div>
);

export default LoadingSpinner;
