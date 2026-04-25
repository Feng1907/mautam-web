// ─────────────────────────────────────────────────────────────────────────────
// Gallery Service — Firebase Storage + Firestore + nén ảnh tự động
// ─────────────────────────────────────────────────────────────────────────────
import imageCompression from 'browser-image-compression';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { storage, db } from './firebase';

const COLLECTION = 'gallery';

// ── Cấu hình nén ảnh ────────────────────────────────────────────────────────
// maxSizeMB: dung lượng tối đa sau nén (MB)
// maxWidthOrHeight: kích thước cạnh dài tối đa (px)
// useWebWorker: chạy nền, không block UI
const COMPRESS_OPTIONS = {
  maxSizeMB:          0.5,    // 500 KB
  maxWidthOrHeight:   1920,   // Full HD đủ dùng để xem web
  useWebWorker:       true,
  fileType:           'image/webp', // WebP nhỏ hơn JPG ~30%
  initialQuality:     0.82,
};

// ── Nén ảnh (trả về File đã nén, giữ nguyên tên gốc) ────────────────────────
// onProgress nhận 2 giai đoạn: compress (0-50%) và upload (50-100%)
export const compressImage = async (file, onCompressProgress) => {
  // Ảnh nhỏ hơn 200 KB thì bỏ qua nén
  if (file.size < 200 * 1024) return file;

  const compressed = await imageCompression(file, {
    ...COMPRESS_OPTIONS,
    onProgress: pct => onCompressProgress?.(pct),
  });

  // Trả về File thực sự để browser-image-compression không strip tên
  return new File(
    [compressed],
    file.name.replace(/\.[^/.]+$/, '.webp'),
    { type: 'image/webp' }
  );
};

// ── Thông tin nén để hiển thị UI ────────────────────────────────────────────
export const formatBytes = (bytes) => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// ── Lấy toàn bộ ảnh từ Firestore ────────────────────────────────────────────
export const fetchPhotos = async () => {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Upload 1 file: nén → Storage → Firestore ────────────────────────────────
// onProgress: (pct: number, phase: 'compress'|'upload') => void
export const uploadPhoto = ({ file, title, event, year, onProgress }) =>
  new Promise(async (resolve, reject) => {
    try {
      // ── Giai đoạn 1: Nén (0 → 50%) ────────────────────────────────────────
      const compressed = await compressImage(
        file,
        pct => onProgress?.(Math.round(pct / 2), 'compress')
      );

      const originalSize   = file.size;
      const compressedSize = compressed.size;

      // ── Giai đoạn 2: Upload (50 → 100%) ───────────────────────────────────
      const ext        = compressed.name.split('.').pop();
      const safeName   = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const storageRef = ref(storage, `gallery/${year}/${event}/${safeName}`);
      const task       = uploadBytesResumable(storageRef, compressed);

      task.on(
        'state_changed',
        snap => {
          const uploadPct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress?.(50 + Math.round(uploadPct / 2), 'upload');
        },
        reject,
        async () => {
          try {
            const url  = await getDownloadURL(task.snapshot.ref);
            const meta = {
              url,
              title:           title || file.name.replace(/\.[^/.]+$/, ''),
              event,
              year:            Number(year),
              timestamp:       new Date().toISOString().slice(0, 10),
              storagePath:     task.snapshot.ref.fullPath,
              originalSize,
              compressedSize,
            };
            const docRef = await addDoc(collection(db, COLLECTION), meta);
            resolve({ id: docRef.id, ...meta });
          } catch (err) { reject(err); }
        }
      );
    } catch (err) { reject(err); }
  });

// ── Xóa ảnh: Storage + Firestore ────────────────────────────────────────────
export const deletePhoto = async ({ id, storagePath }) => {
  if (storagePath) {
    try { await deleteObject(ref(storage, storagePath)); } catch { /* đã xóa */ }
  }
  await deleteDoc(doc(db, COLLECTION, id));
};
