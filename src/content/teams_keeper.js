let keepAwakeInterval = null;
let chatClickIndex = 0;

function getChatListItems(doc) {
    if (!doc || !doc.body) return [];
    var root = doc.querySelector('#app') || doc.body;
    var out = [];
    var selectors = [
        '[role="listitem"]',
        '[role="treeitem"]',
        '[data-tid="chatListListItem"]',
        '[data-tid="conversationListListItem"]',
        '[class*="chatList"] [role="listitem"]',
        '[class*="conversation-list"] [role="listitem"]',
        '.ms-List-cell'
    ];
    for (var i = 0; i < selectors.length; i++) {
        var list = root.querySelectorAll(selectors[i]);
        for (var j = 0; j < list.length; j++) {
            var el = list[j];
            if (el && el.offsetParent !== null && out.indexOf(el) === -1) {
                out.push(el);
            }
        }
    }
    return out;
}

function simulateActivity() {
    try {
        if (window.focus) window.focus();
    } catch (e) {}

    var docs = [document];
    try {
        var iframe = document.querySelector('iframe[src*="teams"], iframe[src*="teams.microsoft"], #app iframe');
        if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
            docs.push(iframe.contentDocument);
        }
    } catch (e) {}

    var allChatItems = [];
    for (var d = 0; d < docs.length; d++) {
        var items = getChatListItems(docs[d]);
        for (var k = 0; k < items.length; k++) {
            if (allChatItems.indexOf(items[k]) === -1) allChatItems.push(items[k]);
        }
    }

    if (allChatItems.length > 0) {
        var idx = chatClickIndex % allChatItems.length;
        chatClickIndex = (chatClickIndex + 1) % Math.max(allChatItems.length, 1);
        var target = allChatItems[idx];
        var rect = target.getBoundingClientRect();
        var x = rect.left + rect.width / 2;
        var y = rect.top + rect.height / 2;
        var win = (target.ownerDocument && target.ownerDocument.defaultView) || document.defaultView || window;
        ['mousedown', 'mouseup', 'click'].forEach(function (eventType) {
            var ev = new MouseEvent(eventType, {
                view: win,
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                button: 0,
                buttons: eventType === 'mousedown' ? 1 : 0
            });
            target.dispatchEvent(ev);
        });
    } else {
        var root = document.querySelector('#app') || document.body;
        var win = document.defaultView || window;
        if (root) {
            var mouseEvent = new MouseEvent('mousemove', {
                view: win,
                bubbles: true,
                cancelable: true,
                clientX: 100,
                clientY: 100
            });
            root.dispatchEvent(mouseEvent);
        }
    }

    window.dispatchEvent(new Event('focus'));
    try {
        localStorage.setItem('ts.userActivity', Date.now());
    } catch (e) {}
}

function startKeepAwake(intervalSeconds) {
    stopKeepAwake();
    simulateActivity();
    keepAwakeInterval = setInterval(simulateActivity, intervalSeconds * 1000);
}

function stopKeepAwake() {
    if (keepAwakeInterval) {
        clearInterval(keepAwakeInterval);
        keepAwakeInterval = null;
    }
}

function syncConfig() {
    chrome.storage.local.get(['enabled', 'interval'], function (result) {
        var enabled = result.enabled !== false;
        var interval = Math.max(5, parseInt(result.interval, 10) || 60);
        if (enabled) {
            startKeepAwake(interval);
        } else {
            stopKeepAwake();
        }
    });
}

syncConfig();

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && (changes.enabled || changes.interval)) {
        syncConfig();
    }
});

chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
    if (msg && msg.type === 'runActivity') {
        simulateActivity();
        sendResponse({ ok: true });
    }
    return true;
});
