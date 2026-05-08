const PREFIX_MAP = [
  [/^XT\b/, 'Xưng Tội'],
  [/^CN\b/, 'Chiên Non'],
  [/^TN\b/, 'Thiếu Nhi'],
  [/^NS\b/, 'Nghĩa Sĩ'],
  [/^HS\b/, 'Hiệp Sĩ'],
];

export const formatClassName = (name = '') => {
  const n = (name || '').normalize('NFC');
  for (const [re, full] of PREFIX_MAP) {
    if (re.test(n)) return n.replace(re, full);
  }
  return n;
};
