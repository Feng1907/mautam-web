const mongoose = require('mongoose');

const loiChuaSectionSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true },
    label: { type: String, trim: true },
    title: { type: String, trim: true },
    trich: { type: String, trim: true },
    text: { type: String, trim: true },
    html: { type: String },
  },
  { _id: false }
);

const loiChuaSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    title: { type: String, trim: true },
    season: { type: String, trim: true },
    color: { type: String, trim: true },
    keyVerse: { type: String, trim: true },
    tinMungTen: { type: String, trim: true },
    source: { type: String, trim: true },
    sourceUrl: { type: String, trim: true },
    sections: [loiChuaSectionSchema],
  },
  { timestamps: true }
);

loiChuaSchema.index(
  {
    title: 'text',
    keyVerse: 'text',
    tinMungTen: 'text',
    'sections.label': 'text',
    'sections.title': 'text',
    'sections.trich': 'text',
    'sections.text': 'text',
  },
  {
    name: 'loi_chua_text_index',
    default_language: 'none',
    weights: {
      title: 10,
      keyVerse: 8,
      tinMungTen: 6,
      'sections.title': 5,
      'sections.trich': 4,
      'sections.label': 3,
      'sections.text': 1,
    },
  }
);

module.exports = mongoose.model('LoiChua', loiChuaSchema);
