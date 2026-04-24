import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import AttendanceTable from '../components/AttendanceTable';
import GradeForm from '../components/GradeForm';
import { useAuth } from '../store/AuthContext';

const ClassDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [lopData, setLopData] = useState(null);
  const [students, setStudents] = useState([]);
  const [sundays, setSundays] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('diem-danh');

  const canEdit =
    user?.vaiTro === 'admin' ||
    (user?.vaiTro === 'giaoly' && user?.lopPhuTrach?.includes(id));

  useEffect(() => {
    Promise.all([
      api.get(`/classes/${id}`),
      api.get(`/classes/${id}/students`),
      api.get(`/classes/${id}/sundays`),
      api.get(`/classes/${id}/attendance`),
    ]).then(([lop, sv, sun, att]) => {
      setLopData(lop.data.data);
      setStudents(sv.data.data);
      setSundays(sun.data.data);
      setAttendanceRecords(att.data.data);
    });
  }, [id]);

  const handleToggleAttendance = (studentId, date, present) => {
    api.post(`/attendance`, { studentId, lopId: id, date, present }).then((r) => {
      setAttendanceRecords((prev) => {
        const idx = prev.findIndex((x) => x.studentId === studentId && x.date === date);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = r.data.data;
          return updated;
        }
        return [...prev, r.data.data];
      });
    });
  };

  if (!lopData) return <p>Đang tải...</p>;

  return (
    <main>
      <h2>Lớp {lopData.tenLop}</h2>
      <p>Huynh trưởng: {lopData.huynhTruong?.hoTen} | Sĩ số: {students.length}</p>

      <div className="tabs">
        <button onClick={() => setActiveTab('diem-danh')}>Điểm danh</button>
        <button onClick={() => setActiveTab('bang-diem')}>Bảng điểm</button>
      </div>

      {activeTab === 'diem-danh' && (
        <AttendanceTable
          students={students}
          sundays={sundays}
          records={attendanceRecords}
          onToggle={handleToggleAttendance}
          canEdit={canEdit}
        />
      )}

      {activeTab === 'bang-diem' && (
        <div>
          {canEdit && (
            <GradeForm
              lopId={id}
              studentId={null}
              onSave={(data) => api.post('/grades', data)}
            />
          )}
        </div>
      )}
    </main>
  );
};

export default ClassDetail;
