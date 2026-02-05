/**
 * Shared constants for Jiggle Me extension.
 * Single source of truth for storage keys, defaults, and bounds.
 * Add new feature keys and defaults here when extending.
 */

const JiggleMe = (typeof globalThis !== 'undefined' ? globalThis : window).JiggleMe || {};
JiggleMe.constants = {
  /** Native messaging host name (must match native_host manifest) */
  NATIVE_HOST_NAME: 'com.jiggleme.host',

  /** Storage keys – add new keys here when adding features */
  STORAGE_KEYS: {
    ENABLED: 'enabled',
    INTERVAL: 'interval',
    PIXELS: 'pixels',
  },

  /** Default values – used when storage is empty */
  DEFAULTS: {
    enabled: false,
    interval: 30,
    pixels: 5,
  },

  /** Bounds for validation – extend when adding new numeric options */
  BOUNDS: {
    interval: { min: 5, max: 300 },
    pixels: { min: 1, max: 50 },
  },

  /** Message types for chrome.runtime.sendMessage / onMessage */
  MESSAGE_TYPES: {
    CONFIG: 'config',
    PING: 'ping',
  },

  /** Alarm name for jiggle timer */
  ALARM_JIGGLE: 'jiggle',

  /** Reconnect delay (ms) after native host disconnect */
  RECONNECT_DELAY_MS: 5000,
};

if (typeof globalThis !== 'undefined') globalThis.JiggleMe = JiggleMe;
if (typeof window !== 'undefined') window.JiggleMe = JiggleMe;
