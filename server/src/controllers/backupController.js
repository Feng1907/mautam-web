const mongoose = require('mongoose');

const EXCLUDED_COLLECTIONS = new Set(['sessions', 'conversations', 'chathistories']);

exports.exportJson = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const colInfos = await db.listCollections().toArray();

    const backup = {};
    await Promise.all(
      colInfos
        .filter(c => !EXCLUDED_COLLECTIONS.has(c.name.toLowerCase()))
        .map(async (c) => {
          backup[c.name] = await db.collection(c.name).find({}).toArray();
        })
    );

    const filename = `mautam_backup_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(backup);
  } catch (err) {
    console.error('[BackupController] exportJson error:', err.message);
    res.status(500).json({ success: false, message: 'Không thể xuất dữ liệu. Vui lòng thử lại.' });
  }
};
