const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

export const SITE_URL = trimTrailingSlash(
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '')
);

export const toAbsoluteUrl = (url = '') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export const pageUrl = (path = '') => toAbsoluteUrl(path || '/');

export const DEFAULT_OG_IMAGE = 'https://res.cloudinary.com/dy5umkes6/image/upload/v1779085354/logos_doan_thieu_nhi_MT_azith6.jpg';
