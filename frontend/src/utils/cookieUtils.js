import CryptoJS from 'crypto-js';

const COOKIE_SECRET = import.meta.env.VITE_COOKIE_SECRET || 'default-cookie-secret';

const encryptValue = (plainText) => {
  try {
    return CryptoJS.AES.encrypt(plainText, COOKIE_SECRET).toString();
  } catch (error) {
    console.error('Encrypt cookie failed', error);
    return plainText;
  }
};

const decryptValue = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, COOKIE_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (error) {
    console.error('Decrypt cookie failed', error);
    return null;
  }
};

// Cookie utility functions to replace localStorage operations

/**
 * Set a cookie with the given name and value
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Number of days until expiration (optional)
 * @param {boolean} secure - Whether to set secure flag (optional)
 * @param {boolean} httpOnly - Whether to set httpOnly flag (optional, but only server-side)
 */
export const setCookie = (name, value, days = 7, secure = false, httpOnly = false) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  const secureFlag = secure ? '; secure' : '';
  const httpOnlyFlag = httpOnly ? '; HttpOnly' : '';

  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${secureFlag}${httpOnlyFlag}`;
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

/**
 * Set encrypted cookie value using AES
 * @param {string} name - Cookie name
 * @param {string} value - Plain text value to encrypt
 * @param {number} days - Expiration in days
 * @param {boolean} secure - Secure flag
 */
export const setEncryptedCookie = (name, value, days = 7, secure = false) => {
  const encrypted = encryptValue(value);
  setCookie(name, encrypted, days, secure);
};

/**
 * Get and decrypt cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} - Decrypted value or null
 */
export const getDecryptedCookie = (name) => {
  const raw = getCookie(name);
  if (!raw) return null;
  return decryptValue(raw);
};

/**
 * Remove a cookie by name
 * @param {string} name - Cookie name
 */
export const removeCookie = (name) => {
  setCookie(name, '', -1);
};

/**
 * Check if cookies are enabled
 * @returns {boolean} - True if cookies are enabled
 */
export const areCookiesEnabled = () => {
  try {
    setCookie('test', 'test', 1);
    const result = getCookie('test') === 'test';
    removeCookie('test');
    return result;
  } catch (e) {
    return false;
  }
};
