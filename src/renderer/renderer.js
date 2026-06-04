const browserContainer = document.getElementById('browser-container');
const contentArea = document.getElementById('content-area');
const tabsList = document.getElementById('tabs-list');
const newTabBtn = document.getElementById('new-tab-btn');
const urlInput = document.getElementById('url-input');
const newtabView = document.getElementById('newtab-view');

// Navigasyonlar
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');

// Ayarlar
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const searchEngineSelect = document.getElementById('search-engine-select');
const tabsPositionSelect = document.getElementById('tabs-position-select');
const wallpaperInput = document.getElementById('wallpaper-input');

const searchEngines = {
    brave: 'https://search.brave.com/search?q=',
    google: 'https://www.google.com/search?q=',
    ddg: 'https://duckduckgo.com/?q='
};

let tabs = [];
let activeTabId = null;

// Ayarları Yükle
let currentEngine = localStorage.getItem('selectedEngine') || 'brave';
searchEngineSelect.value = currentEngine;

let currentTabsPosition = localStorage.getItem('tabsPosition') || 'top';
tabsPositionSelect.value = currentTabsPosition;
browserContainer.className = `tabs-${currentTabsPosition}`;

let currentWallpaper = localStorage.getItem('saberWallpaper') || '';
wallpaperInput.value = currentWallpaper;
applyWallpaper(currentWallpaper);

function applyWallpaper(url) {
    if (url) {
        newtabView.style.backgroundImage = `url('${url}')`;
    } else {
        newtabView.style.backgroundImage = 'none';
    }
}

// --- SEKME MOTORU ---

function createTab(url = 'saber://newtab') {
    const id = 'tab-' + Date.now() + Math.random().toString(36).substr(2, 5);
    
    const webview = document.createElement('webview');
    webview.id = 'view-' + id;
    webview.className = 'wv-hidden';
    
    // Eğer doğrudan web sitesiyse yükle, ana menüyse boş bırak
    if (url !== 'saber://newtab') {
        webview.src = url;
    } else {
        webview.src = 'about:blank';
    }

    webview.addEventListener('did-start-loading', () => {
        if (activeTabId === id && tabs.find(t => t.id === id).url !== 'saber://newtab') {
            urlInput.value = webview.getURL();
        }
    });

    webview.addEventListener('did-navigate', (e) => {
        const tab = tabs.find(t => t.id === id);
        if (tab) {
            tab.url = e.url;
            if (activeTabId === id) urlInput.value = e.url;
            updateTabTitle(id, webview.getTitle() || e.url);
        }
    });

    webview.addEventListener('page-title-updated', (e) => {
        updateTabTitle(id, e.title);
    });

    contentArea.appendChild(webview);

    const newTab = { id, title: url === 'saber://newtab' ? 'Ana Menü' : 'Yükleniyor...', webview, url };
    tabs.push(newTab);

    renderTabs();
    switchTab(id);
}

function renderTabs() {
    tabsList.innerHTML = '';
    tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab-item ${tab.id === activeTabId ? 'active' : ''}`;
        tabEl.addEventListener('click', () => switchTab(tab.id));

        const titleSpan = document.createElement('span');
        titleSpan.className = 'tab-title';
        titleSpan.innerText = tab.title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-tab-btn';
        closeBtn.innerText = '✕';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        });

        tabEl.appendChild(titleSpan);
        tabEl.appendChild(closeBtn);
        tabsList.appendChild(tabEl);
    });
}

function switchTab(id) {
    activeTabId = id;
    tabs.forEach(tab => {
        if (tab.id === id) {
            if (tab.url === 'saber://newtab') {
                // Ana menüyü göster, webview'i gizle
                newtabView.classList.remove('hidden');
                tab.webview.className = 'wv-hidden';
                urlInput.value = '';
                urlInput.placeholder = "Excalibur ile ara veya URL yaz...";
            } else {
                // Sitedeysek ana menüyü gizle, webview'i aç
                newtabView.classList.add('hidden');
                tab.webview.className = 'wv-active';
                urlInput.value = tab.webview.getURL() || tab.url;
            }
        } else {
            tab.webview.className = 'wv-hidden';
        }
    });
    renderTabs();
}

function closeTab(id) {
    if (tabs.length === 1) {
        const index = tabs.findIndex(t => t.id === id);
        tabs[index].webview.remove();
        tabs = [];
        createTab();
        return;
    }

    const index = tabs.findIndex(t => t.id === id);
    tabs[index].webview.remove();
    tabs.splice(index, 1);

    if (activeTabId === id) {
        const nextActiveIndex = index === 0 ? 0 : index - 1;
        switchTab(tabs[nextActiveIndex].id);
    } else {
        renderTabs();
    }
}

function updateTabTitle(id, title) {
    const tab = tabs.find(t => t.id === id);
    if (tab && tab.url !== 'saber://newtab') {
        tab.title = title;
        renderTabs();
    }
}

function getActiveTab() {
    return tabs.find(t => t.id === activeTabId);
}

// --- ETKİNLİK DİNLEYİCİLERİ ---

newTabBtn.addEventListener('click', () => createTab());

urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        let url = urlInput.value.trim();
        const activeTab = getActiveTab();
        
        if (activeTab && url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                if (url.includes('.') && !url.includes(' ')) {
                    url = 'https://' + url;
                } else {
                    url = searchEngines[currentEngine] + encodeURIComponent(url);
                }
            }
            
            activeTab.url = url;
            newtabView.classList.add('hidden');
            activeTab.webview.className = 'wv-active';
            activeTab.webview.src = url; // Güvenli ve kararlı element tetikleme metodu
            settingsPanel.classList.add('hidden');
        }
    }
});

backBtn.addEventListener('click', () => {
    const tab = getActiveTab();
    if (tab && tab.url !== 'saber://newtab' && tab.webview.canGoBack()) tab.webview.goBack();
});

forwardBtn.addEventListener('click', () => {
    const tab = getActiveTab();
    if (tab && tab.url !== 'saber://newtab' && tab.webview.canGoForward()) tab.webview.goForward();
});

reloadBtn.addEventListener('click', () => {
    const tab = getActiveTab();
    if (tab && tab.url !== 'saber://newtab') tab.webview.reload();
});

settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsPanel.classList.add('hidden'));

searchEngineSelect.addEventListener('change', (e) => {
    currentEngine = e.target.value;
    localStorage.setItem('selectedEngine', currentEngine);
});

tabsPositionSelect.addEventListener('change', (e) => {
    currentTabsPosition = e.target.value;
    browserContainer.className = `tabs-${currentTabsPosition}`;
    localStorage.setItem('tabsPosition', currentTabsPosition);
});

// Duvar Kağıdı Girişini Dinle
wallpaperInput.addEventListener('input', (e) => {
    const res = e.target.value.trim();
    localStorage.setItem('saberWallpaper', res);
    applyWallpaper(res);
});

// --- ROFI ENTEGRASYONU: AÇILIŞTA PARAMETRE KONTROLÜ ---
const urlParams = new URLSearchParams(window.location.search);
const startUrl = urlParams.get('startUrl');

if (startUrl) {
    let targetUrl = startUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
            targetUrl = 'https://' + targetUrl;
        } else {
            targetUrl = searchEngines[currentEngine] + encodeURIComponent(targetUrl);
        }
    }
    createTab(targetUrl);
} else {
    createTab();
}