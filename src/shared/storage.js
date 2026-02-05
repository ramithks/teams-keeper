/**
 * Shared storage helpers. Use in popup and background.
 * Clamps values to bounds from constants; add new keys in constants.js.
 */

(function (global) {
  const C = (global.JiggleMe && global.JiggleMe.constants) || {};
  const KEYS = C.STORAGE_KEYS || {};
  const DEFAULTS = C.DEFAULTS || {};
  const BOUNDS = C.BOUNDS || {};

  function clampInterval(v) {
    const b = BOUNDS.interval;
    if (!b) return v;
    const n = parseInt(v, 10);
    return isNaN(n) ? DEFAULTS.interval : Math.max(b.min, Math.min(b.max, n));
  }

  function clampPixels(v) {
    const b = BOUNDS.pixels;
    if (!b) return v;
    const n = parseInt(v, 10);
    return isNaN(n) ? DEFAULTS.pixels : Math.max(b.min, Math.min(b.max, n));
  }

  /** Return a clamped config object from raw storage values */
  function clampConfig(raw) {
    return {
      enabled: !!raw[KEYS.ENABLED],
      interval: clampInterval(raw[KEYS.INTERVAL]),
      pixels: clampPixels(raw[KEYS.PIXELS]),
    };
  }

  /** Get storage key list for chrome.storage.local.get */
  function getStorageKeysList() {
    return Object.values(KEYS);
  }

  /** Read config from chrome.storage.local (callback) */
  function getConfig(callback) {
    chrome.storage.local.get(getStorageKeysList(), function (r) {
      callback(clampConfig(r));
    });
  }

  /** Write config to chrome.storage.local (callback) */
  function setConfig(config, callback) {
    const out = {
      [KEYS.ENABLED]: !!config.enabled,
      [KEYS.INTERVAL]: clampInterval(config.interval),
      [KEYS.PIXELS]: clampPixels(config.pixels),
    };
    chrome.storage.local.set(out, callback || function () {});
  }

  const api = {
    clampConfig,
    getStorageKeysList,
    getConfig,
    setConfig,
    DEFAULTS,
    BOUNDS,
    KEYS,
  };

  if (global.JiggleMe) global.JiggleMe.storage = api;
  global.JiggleMeStorage = api;
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
