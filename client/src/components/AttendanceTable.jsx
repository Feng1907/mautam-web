/**
 * Bảng điểm danh dạng lưới: hàng = học sinh, cột = các ngày Chúa Nhật.
 * Hỗ trợ scroll ngang khi số tuần nhiều.
 */
const AttendanceTable = ({ students, sundays, records, onToggle, canEdit }) => {
  const getStatus = (studentId, date) =>
    records.find((r) => r.studentId === studentId && r.date === date)?.present;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Họ tên</th>
            {sundays.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.hoTen}</td>
              {sundays.map((d) => {
                const present = getStatus(s._id, d);
                return (
                  <td key={d} style={{ textAlign: 'center' }}>
                    {canEdit ? (
                      <input
                        type="checkbox"
                        checked={!!present}
                        onChange={() => onToggle(s._id, d, !present)}
                      />
                    ) : present ? '✓' : '✗'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
