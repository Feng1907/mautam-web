const LICH_LE = [
  {
    ngay: 'Ngày thường',
    icon: '📅',
    gio: ['05:30', '18:00'],
  },
  {
    ngay: 'Chúa Nhật',
    icon: '⛪',
    gio: ['05:30', '09:00', '17:00', '18:30'],
  },
];

const LOI_CHUA_PLACEHOLDER = [
  { label: 'Bài đọc 1', icon: '📖', noi_dung: 'Sẽ cập nhật hàng tuần bởi Ban Điều Hành.' },
  { label: 'Thánh vịnh',  icon: '🎵', noi_dung: 'Sẽ cập nhật hàng tuần bởi Ban Điều Hành.' },
  { label: 'Bài đọc 2', icon: '📖', noi_dung: 'Sẽ cập nhật hàng tuần bởi Ban Điều Hành.' },
  { label: 'Phúc Âm',   icon: '✝',  noi_dung: 'Sẽ cập nhật hàng tuần bởi Ban Điều Hành.' },
];

const Liturgy = () => (
  <main className="flex-1 page-container">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Giờ Lễ & Lời Chúa</h1>

    {/* Lịch lễ */}
    <section className="mb-8">
      <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide mb-4">
        🕯️ Lịch Thánh Lễ
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {LICH_LE.map((l) => (
          <div key={l.ngay} className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{l.icon}</span>
              <h3 className="font-bold text-gray-800">{l.ngay}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {l.gio.map((g) => (
                <span key={g} className="bg-red-50 text-red-700 font-mono font-semibold text-sm px-3 py-1 rounded-full border border-red-100">
                  {g}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Lời Chúa */}
    <section>
      <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide mb-4">
        📖 Lời Chúa Chúa Nhật
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {LOI_CHUA_PLACEHOLDER.map((item) => (
          <div key={item.label} className="card">
            <div className="flex items-center gap-2 mb-2">
              <span>{item.icon}</span>
              <h3 className="font-semibold text-gray-700 text-sm">{item.label}</h3>
            </div>
            <p className="text-sm text-gray-400 italic">{item.noi_dung}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">
        Nội dung Lời Chúa sẽ được Ban Điều Hành cập nhật mỗi tuần.
      </p>
    </section>
  </main>
);

export default Liturgy;
