# Jiggle Me (Teams Edition)

A simple Chrome extension to keep your Microsoft Teams session active.

## Features
- **Keep Teams Awake**: Simulates subtle activity on `teams.microsoft.com` and `teams.live.com` to prevent your status from going to "Away".
- **Configurable Interval**: Choose how often to simulate activity (default: 30 seconds).
- **No System Permissions**: Runs entirely within the browser. No native host or software installation required.

## Installation

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select this folder (`JiggleMe`).

## Usage

1. Open Microsoft Teams in your browser.
2. Click the **Jiggle Me** extension icon.
3. Toggle the switch to **Status: Keep Awake enabled**.
4. Adjust the interval if needed.

The extension will periodically simulate a small interaction to keep your session alive. You can see logs in the developer console (F12) if you want to verify it's working.

## Troubleshooting

- **Not working?** Ensure you are on the Teams web page. The extension only runs on `teams.microsoft.com` and `teams.live.com`.
- **Status still changes?** Try lowering the interval to 30 seconds or less.
pyautogui`.  
    - Fedora: `sudo dnf install python3-tkinter` and `pip install pyautogui`.

---

## Project structure (scalable)
Extension code lives under `src/`. Shared code is reused by popup and background so new features stay consistent.

```
JiggleMe/
├── manifest.json                 # Entry: points to src/background, src/popup
├── src/
│   ├── shared/                   # Used by popup + background
│   │   ├── constants.js          # Storage keys, defaults, bounds, message types
│   │   └── storage.js            # getConfig / setConfig, clamp helpers
│   ├── background/
│   │   ├── background.js        # Entry: importScripts, wire Chrome APIs
│   │   ├── config.js            # In-memory config, load/apply from storage
│   │   ├── nativeHost.js        # Connect to native host, send jiggle
│   │   └── scheduler.js         # Start/stop alarm, tick → jiggle
│   └── popup/
│       ├── popup.html
│       ├── popup.css
│       └── popup.js              # Form ↔ storage, sendMessage(CONFIG/PING)
└── native_host/
    ├── jiggle_host.py
    ├── install_*.sh / install_windows.ps1
    └── requirements.txt
```

**Adding a feature**

1. **New option (e.g. “only when idle”)**  
   Add key + default in `src/shared/constants.js` (STORAGE_KEYS, DEFAULTS, BOUNDS).  
   Extend `src/shared/storage.js` (clamp + get/set).  
   Use in popup form and in `src/background/config.js` + scheduler/nativeHost as needed.

2. **New scheduled action (e.g. keyboard nudge)**  
   Add a module under `src/background/` (e.g. `keyboardHost.js`).  
   In `background.js`, add `importScripts('keyboardHost.js')`, wire alarms or storage, and call the new module from the alarm listener or from scheduler.

3. **New UI section**  
   Add markup and styles in `src/popup/`, bind in `popup.js` using the same storage helpers.

---

## Privacy

The extension only talks to the local native host. No data is sent to the internet. Settings (on/off, interval, pixels) are stored in Chrome’s local storage.
