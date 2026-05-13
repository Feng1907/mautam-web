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

export const DEFAULT_OG_IMAGE = toAbsoluteUrl('/logos/logos doan thieu nhi MT.jpg');
