/**
 * Background entry: Uses chrome.alarms so activity runs even when the Teams tab
 * is idle/background (setInterval in the tab is throttled).
 */
importScripts(
  '../shared/constants.js',
  '../shared/storage.js'
);

const ALARM_NAME = 'teams-keeper-activity';
const TEAMS_URL_PATTERNS = [
  'https://*.teams.microsoft.com/*',
  'https://teams.live.com/*',
  'https://teams.cloud.microsoft/*'
];

function makeIconImageData(bgHex) {
  const hexToRgb = function (hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const bg = hexToRgb(bgHex);
  const white = [255, 255, 255];
  const out = {};
  [16, 32].forEach(function (size) {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    const margin = Math.floor(size * 0.22);
    const bar = Math.max(1, Math.floor(size / 8));
    const cx = size / 2;
    const top = margin;
    const topBarBottom = top + bar;
    const bottom = size - margin;
    const left = margin;
    const right = size - margin;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const isTopBar = y >= top && y < topBarBottom && x >= left && x < right;
        const isStem = x >= cx - bar / 2 && x < cx + bar / 2 && y >= topBarBottom && y < bottom;
        const isT = isTopBar || isStem;
        const c = isT ? white : bg;
        data[i] = c[0];
        data[i + 1] = c[1];
        data[i + 2] = c[2];
        data[i + 3] = 255;
      }
    }
    out[size] = imageData;
  });
  return out;
}

function applyConfig() {
  chrome.storage.local.get(['enabled', 'interval'], function (result) {
    const enabled = result.enabled !== false;
    const interval = Math.max(5, parseInt(result.interval, 10) || 60);
    chrome.alarms.clear(ALARM_NAME);
    if (enabled) {
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: Math.max(1 / 60, interval / 60) });
      try {
        chrome.action.setIcon({ imageData: makeIconImageData('#22c55e') });
      } catch (e) {}
    } else {
      try {
        chrome.action.setIcon({ imageData: makeIconImageData('#6b7280') });
      } catch (e) {}
    }
  });
}

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name !== ALARM_NAME) return;
  chrome.tabs.query({ url: TEAMS_URL_PATTERNS }, function (tabs) {
    tabs.forEach(function (tab) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'runActivity' }).catch(function () {});
      }
    });
  });
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === 'local' && (changes.enabled || changes.interval)) {
    applyConfig();
  }
});

applyConfig();

