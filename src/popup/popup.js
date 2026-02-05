/**
 * Popup UI: user-friendly controls; storage drives background and content script.
 */
(function () {
  const C = window.JiggleMe && window.JiggleMe.constants;
  const Storage = window.JiggleMe && window.JiggleMe.storage;
  if (!C || !Storage) return;

  const enabledEl = document.getElementById('enabled');
  const intervalEl = document.getElementById('interval');
  const statusEl = document.getElementById('status');
  const teamsNoticeEl = document.getElementById('teams-notice');
  const presets = document.querySelectorAll('.preset');

  var TEAMS_PATTERNS = [
    /^https:\/\/[^/]*\.?teams\.microsoft\.com(\/|$)/,
    /^https:\/\/teams\.live\.com(\/|$)/,
    /^https:\/\/teams\.cloud\.microsoft(\/|$)/
  ];

  function isTeamsTab(url) {
    if (!url || typeof url !== 'string') return false;
    return TEAMS_PATTERNS.some(function (re) { return re.test(url); });
  }

  function showStatus(msg) {
    statusEl.textContent = msg;
    statusEl.hidden = false;
  }

  function setTeamsNotice(show) {
    teamsNoticeEl.hidden = !show;
  }

  function getIntervalFromUI() {
    var n = parseInt(intervalEl.value, 10);
    return isNaN(n) ? C.DEFAULTS.interval : Math.max(C.BOUNDS.interval.min, Math.min(C.BOUNDS.interval.max, n));
  }

  function load() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      var onTeams = tab && tab.url && isTeamsTab(tab.url);
      setTeamsNotice(!onTeams);

      Storage.getConfig(function (c) {
        enabledEl.checked = c.enabled;
        var interval = Math.max(C.BOUNDS.interval.min, Math.min(C.BOUNDS.interval.max, c.interval));
        intervalEl.value = interval;
        presets.forEach(function (btn) {
          var sec = parseInt(btn.getAttribute('data-seconds'), 10);
          btn.classList.toggle('active', sec === interval);
        });
        if (onTeams) {
          showStatus(c.enabled ? 'Active — you\'ll stay available.' : 'Turn on when Teams is open.');
        } else {
          showStatus('Open a Teams tab, then turn on.');
        }
      });
    });
  }

  function save(config, statusMsg) {
    config.interval = Math.max(C.BOUNDS.interval.min, Math.min(C.BOUNDS.interval.max, config.interval));
    Storage.setConfig(config, function () {
      showStatus(statusMsg || (config.enabled ? 'Active — you\'ll stay available.' : 'Paused.'));
      presets.forEach(function (btn) {
        var sec = parseInt(btn.getAttribute('data-seconds'), 10);
        btn.classList.toggle('active', sec === config.interval);
      });
    });
  }

  enabledEl.addEventListener('change', function () {
    save({
      enabled: enabledEl.checked,
      interval: getIntervalFromUI()
    });
  });

  presets.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var seconds = parseInt(btn.getAttribute('data-seconds'), 10);
      intervalEl.value = seconds;
      save({
        enabled: enabledEl.checked,
        interval: seconds
      });
    });
  });

  intervalEl.addEventListener('change', function () {
    save({
      enabled: enabledEl.checked,
      interval: getIntervalFromUI()
    });
  });
  intervalEl.addEventListener('blur', function () {
    var v = getIntervalFromUI();
    intervalEl.value = v;
    save({
      enabled: enabledEl.checked,
      interval: v
    });
  });

  load();
})();
