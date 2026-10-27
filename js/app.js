// Galapitiyagama Sanasa Cooperative Society HRMS
// Smart UI Engine (Matching Modern Reference Design & GitHub Pages Online Support)

let currentLang = 'si';
let currentUser = null;
let appData = null;
let charts = {};
let customOnlineBaseUrl = '';

// Default Seed Data
const defaultSeedData = {
  organization: {
    nameEn: "Galapitiyagama Sanasa Cooperative Society Ltd",
    nameSi: "ගලපිටියාගම සණස සමුපකාර සමිතිය (වගකීම සීමිත)",
    regNo: "කු/ස/1429",
    addressEn: "Galapitiyagama, Kurunegala, Sri Lanka",
    addressSi: "ගලපිටියාගම, කුරුණෑගල",
    phone: "037-2298711 / 077-4567890",
    email: "info@galapitiyagamasanasa.lk",
    chairman: "ඒ. එම්. දයාරත්න බණ්ඩා මහතා (Hon. Chairman)",
    gm: "කේ. ආර්. විජේසුන්දර මහත්මිය (General Manager)"
  },
  employees: [],
  grievances: [],
  memberFeedbacks: [],
  tasks: [
    {
      id: "TSK-001",
      title: "ගලපිටියාගම කෘෂිකාර්මික හා ව්‍යාපාරික ණය ප්‍රතිසාධන වැඩසටහන",
      department: "ණය සහ ක්ෂුද්‍ර මූල්‍ය අංශය",
      assignedStaffName: "කළමනාකාරීත්වය හා ක්ෂේත්‍ර නිලධාරීන්",
      dueDate: "2026-10-15",
      progress: 65,
      description: "ප්‍රමාද වූ ක්ෂුද්‍ර මූල්‍ය ණය අයකර ගැනීම සහ ක්ෂේත්‍ර පරීක්ෂණ කඩිනම් කිරීමේ විශේෂ වැඩපිළිවෙල."
    },
    {
      id: "TSK-002",
      title: "සමස්ත සාමාජික තොරතුරු පරිගණකගත කිරීම සහ ඩිජිටල්කරණය",
      department: "පරිපාලන හා මෙහෙයුම්",
      assignedStaffName: "පරිපාලන කාර්ය මණ්ඩලය",
      dueDate: "2026-11-01",
      progress: 40,
      description: "සමිතියේ සාමාජික ලිපිගොනු සහ ණය ඉතිහාසය පූර්ණ ඩිජිටල් පද්ධතියකට ඇතුළත් කිරීම."
    },
    {
      id: "TSK-003",
      title: "වාර්ෂික මහා සභා රැස්වීමට අදාළ අභ්‍යන්තර ගිණුම් විගණනය",
      department: "ගිණුම් හා විගණන අංශය",
      assignedStaffName: "ගිණුම් අංශය",
      dueDate: "2026-10-05",
      progress: 80,
      description: "2025/2026 මූල්‍ය වර්ෂයේ ගිණුම් ශේෂ සහ මූල්‍ය ප්‍රකාශන සම්පූර්ණ කිරීම."
    }
  ],
  meetings: [
    {
      id: "MEET-001",
      title: "අධ්‍යක්ෂ මණ්ඩල මාසික නිල රැස්වීම (Board Meeting)",
      date: "2026-09-28",
      time: "09:30 AM - 12:30 PM",
      chair: "ඒ. එම්. දයාරත්න බණ්ඩා මහතා (Hon. Chairman)",
      venue: "ගලපිටියාගම සණස ප්‍රධාන ශ්‍රවණාගාරය",
      agenda: "1. පසුගිය මස වාර්තා සම්මත කිරීම\n2. ක්ෂුද්‍ර මූල්‍ය ණය අනුමත කිරීම\n3. නව සාමාජික අයදුම්පත් සමාලෝචනය"
    },
    {
      id: "MEET-002",
      title: "ණය කමිටු සහ ක්ෂේත්‍ර නිලධාරී සමාලෝචනය",
      date: "2026-10-02",
      time: "02:00 PM - 04:30 PM",
      chair: "කේ. ආර්. විජේසුන්දර මහත්මිය (General Manager)",
      venue: "ගලපිටියාගම සණස කමිටු ශාලාව",
      agenda: "1. ක්ෂේත්‍ර ණය අයවීම් ප්‍රගතිය\n2. විශේෂ සහන ණය යෝජනා සමාලෝචනය"
    },
    {
      id: "MEET-003",
      title: "කාර්ය මණ්ඩල සුභසාධන සහ ප්‍රගති සමාලෝචනය",
      date: "2026-10-08",
      time: "03:00 PM - 05:00 PM",
      chair: "ඒ. එම්. දයාරත්න බණ්ඩා මහතා (Hon. Chairman)",
      venue: "ප්‍රධාන රැස්වීම් ශාලාව",
      agenda: "1. සේවක කාර්යසාධන සහ සුභසාධන පහසුකම්\n2. ඉදිරි මාසයේ ඉලක්ක සැලසුම් කිරීම"
    }
  ],
  users: [
    {
      id: "USR-001",
      username: "admin",
      name: "ප්‍රධාන පරිපාලක (Administrator)",
      createdDate: "2026-09-24",
      status: "Active",
      roleTitle: "සණස ප්‍රධාන පරිපාලක (Full Admin Access)",
      role: "admin",
      password: "admin123"
    },
    {
      id: "USR-002",
      username: "manager",
      name: "කේ. ආර්. විජේසුන්දර (General Manager)",
      createdDate: "2026-09-24",
      status: "Active",
      roleTitle: "සාමාන්‍යාධිකාරී (Manager Access)",
      role: "manager",
      password: "sanasa123"
    },
    {
      id: "USR-003",
      username: "officer",
      name: "ණය හා ක්ෂේත්‍ර නිලධාරී (Credit Officer)",
      createdDate: "2026-09-24",
      status: "Active",
      roleTitle: "ක්ෂේත්‍ර නිලධාරී (Officer Access)",
      role: "officer",
      password: "officer123"
    }
  ],
  appraisals: [],
  surveys: [],
  payrollHistory: [],
  incentiveRecords: [],
  epfRemittances: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupLanguageSwitchers();
  setupNavigation();
  checkAuthSession();
  setupOnlineUrlDetection();
  await loadApplicationData();
  renderMiniCalendar();
  renderAllViews();
  setupEventListeners();

  // Realtime Cloud Sync from Google Sheets
  if (typeof syncFromCloud === 'function') {
    setTimeout(() => syncFromCloud(true), 1500);
    setInterval(() => syncFromCloud(true), 25000);
  }
});

// =========================================================================
// AUTHENTICATION & LOGIN SYSTEM
// =========================================================================
function checkAuthSession() {
  const session = localStorage.getItem('sanasa_hrms_user');
  if (session) {
    try {
      currentUser = JSON.parse(session);
      updateUserSidebarUI();
      hideLoginModal();
    } catch (e) {
      showLoginModal();
    }
  } else {
    // Show login modal by default
    showLoginModal();
  }
}

function showLoginModal() {
  const overlay = document.getElementById('login-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideLoginModal() {
  const overlay = document.getElementById('login-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

function togglePasswordVisibility() {
  const pwd = document.getElementById('login-password');
  const icon = document.getElementById('toggle-pwd-btn');
  if (pwd) {
    if (pwd.type === 'password') {
      pwd.type = 'text';
      if (icon) icon.className = 'fa-solid fa-eye-slash';
    } else {
      pwd.type = 'password';
      if (icon) icon.className = 'fa-solid fa-eye';
    }
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  // Validate from registered users or default credentials
  const usersList = appData?.users || defaultSeedData.users;
  const foundUser = usersList.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (foundUser || (username === 'admin' && (password === 'admin123' || password === 'admin'))) {
    currentUser = {
      username: foundUser ? foundUser.username : 'admin',
      name: foundUser ? foundUser.name : 'ප්‍රධාන පරිපාලක (Administrator)',
      roleTitle: foundUser ? (foundUser.roleTitle || 'පරිපාලක') : 'සණස ප්‍රධාන පරිපාලක (Full Admin Access)',
      role: foundUser ? foundUser.role : 'admin',
      avatar: (foundUser?.name || 'A').charAt(0)
    };

    localStorage.setItem('sanasa_hrms_user', JSON.stringify(currentUser));
    updateUserSidebarUI();
    hideLoginModal();
    renderAllViews();
  } else {
    alert(currentLang === 'si' ? 'අවලංගු පරිශීලක තොරතුරු! කරුණාකර නිවැරදි Username සහ Password ඇතුළත් කරන්න.' : 'Invalid Credentials! Please enter valid Username and Password.');
  }
}

function handleLogout() {
  if (confirm(currentLang === 'si' ? 'ඔබට පද්ධතියෙන් ඉවත් වීමට (Logout) අවශ්‍යද?' : 'Are you sure you want to log out?')) {
    localStorage.removeItem('sanasa_hrms_user');
    currentUser = null;
    showLoginModal();
  }
}

function updateUserSidebarUI() {
  if (!currentUser) return;
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');

  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.roleTitle;
  if (avatarEl) avatarEl.textContent = currentUser.avatar || 'ස';
}

// =========================================================================
// ONLINE QR & GITHUB PAGES URL DETECTION & GOOGLE CLOUD SYNC
// =========================================================================
function setupOnlineUrlDetection() {
  // If hosted online (GitHub Pages or Custom Domain), detect base URL automatically
  const savedCustom = localStorage.getItem('sanasa_online_base_url');
  if (savedCustom) {
    customOnlineBaseUrl = savedCustom;
  } else {
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    customOnlineBaseUrl = origin + path;
  }

  // If running locally, attempt to auto-detect LAN Wi-Fi IP from /api/status
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost && !savedCustom) {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.localIps && data.localIps.length > 0) {
          const lanIp = data.localIps[0];
          customOnlineBaseUrl = `http://${lanIp}:5000`;
          const urlInput = document.getElementById('custom-online-url-input');
          if (urlInput) urlInput.value = customOnlineBaseUrl;
          renderGrievanceQR();
          renderMemberFeedbackQR();
          renderPosterQRs();
        }
      })
      .catch(() => {});
  }

  const urlInput = document.getElementById('custom-online-url-input');
  if (urlInput) {
    urlInput.value = customOnlineBaseUrl;
  }

  const cloudInput = document.getElementById('custom-cloud-sync-url-input');
  if (cloudInput && typeof getCloudSyncUrl === 'function') {
    cloudInput.value = getCloudSyncUrl();
  }

  updateOnlinePillUI();
}

function updateOnlinePillUI() {
  const pill = document.getElementById('online-status-pill');
  if (pill) {
    const isCloudSynced = typeof getCloudSyncUrl === 'function' && getCloudSyncUrl();
    const isGithub = customOnlineBaseUrl.includes('github.io');
    if (isCloudSynced) {
      pill.innerHTML = `<span class="status-dot" style="background:#10b981;"></span> Cloud Sync Active`;
      pill.title = `Google Sheet Realtime Sync Active & Hosted at: ${customOnlineBaseUrl}`;
    } else if (isGithub) {
      pill.innerHTML = `<span class="status-dot" style="background:#3b82f6;"></span> GitHub Pages Online`;
      pill.title = `Online URL: ${customOnlineBaseUrl}`;
    } else {
      pill.innerHTML = `<span class="status-dot"></span> QR Configured`;
      pill.title = `Target URL: ${customOnlineBaseUrl}`;
    }
  }
}

function saveCustomOnlineSettings() {
  const baseInput = document.getElementById('custom-online-url-input');
  const cloudInput = document.getElementById('custom-cloud-sync-url-input');

  if (baseInput && baseInput.value.trim()) {
    let url = baseInput.value.trim().replace(/\/$/, '');
    customOnlineBaseUrl = url;
    localStorage.setItem('sanasa_online_base_url', customOnlineBaseUrl);
  }

  if (cloudInput && typeof setCloudSyncUrl === 'function') {
    setCloudSyncUrl(cloudInput.value.trim());
  }

  updateOnlinePillUI();
  renderGrievanceQR();
  renderMemberFeedbackQR();
  renderPosterQRs();
  closeSmartModal('modal-online-settings');

  alert(currentLang === 'si' ? 'Online & Cloud සැකසුම් සාර්ථකව සුරකින ලදී!' : 'Online & Cloud settings saved successfully!');

  if (typeof getCloudSyncUrl === 'function' && getCloudSyncUrl()) {
    syncFromCloud(false);
  }
}

function saveCustomOnlineUrl() {
  saveCustomOnlineSettings();
}

async function testCloudSyncConnection() {
  const input = document.getElementById('custom-cloud-sync-url-input');
  const statusMsg = document.getElementById('cloud-sync-status-msg');
  if (!input || !input.value.trim()) {
    if (statusMsg) {
      statusMsg.textContent = 'කරුණාකර වලංගු Web App URL එකක් ඇතුළත් කරන්න.';
      statusMsg.style.color = '#ef4444';
    }
    return;
  }
  const testUrl = input.value.trim();
  if (statusMsg) {
    statusMsg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> පරීක්ෂා කරමින් පවතී...';
    statusMsg.style.color = '#7c3aed';
  }

  try {
    const res = await fetch(testUrl + (testUrl.includes('?') ? '&' : '?') + 'test=1&t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        if (statusMsg) {
          statusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> සාර්ථකයි! (Grievances: ${data.totalGrievances || 0}, Feedbacks: ${data.totalFeedbacks || 0})`;
          statusMsg.style.color = '#16a34a';
        }
        return;
      }
    }
    if (statusMsg) {
      statusMsg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> දෝෂයක් මතු විය (Not valid JSON output).';
      statusMsg.style.color = '#ef4444';
    }
  } catch (e) {
    if (statusMsg) {
      statusMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> සබඳතාව අසාර්ථකයි (URL එක හෝ Access Permissions පරීක්ෂා කරන්න).';
      statusMsg.style.color = '#ef4444';
    }
  }
}

let isSyncingCloud = false;
async function syncFromCloud(silent = false) {
  const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
  if (!cloudUrl || isSyncingCloud) return;

  const iconGrv = document.getElementById('sync-icon-grv');
  const iconFb = document.getElementById('sync-icon-fb');
  if (iconGrv) iconGrv.classList.add('fa-spin');
  if (iconFb) iconFb.classList.add('fa-spin');
  isSyncingCloud = true;

  try {
    const res = await fetch(cloudUrl + (cloudUrl.includes('?') ? '&' : '?') + 't=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        let newGrievancesCount = 0;
        let newFeedbacksCount = 0;

        if (Array.isArray(data.grievances) && data.grievances.length > 0) {
          if (!appData.grievances) appData.grievances = [];
          const existingIds = new Set(appData.grievances.map(g => g.id));
          data.grievances.forEach(g => {
            if (!existingIds.has(g.id)) {
              appData.grievances.unshift(g);
              newGrievancesCount++;
            }
          });
        }

        if (Array.isArray(data.memberFeedbacks) && data.memberFeedbacks.length > 0) {
          if (!appData.memberFeedbacks) appData.memberFeedbacks = [];
          const existingFbIds = new Set(appData.memberFeedbacks.map(f => f.id));
          data.memberFeedbacks.forEach(f => {
            if (!existingFbIds.has(f.id)) {
              appData.memberFeedbacks.unshift(f);
              newFeedbacksCount++;
            }
          });
        }

        if (newGrievancesCount > 0 || newFeedbacksCount > 0) {
          await persistData();
          renderGrievancePortal();
          renderMemberFeedbackPortal();
          renderDashboardStats();
          if (!silent) {
            alert(currentLang === 'si' 
              ? `Google Sheet වෙතින් නව දත්ත සාර්ථකව එකතු විය!\n(නව ගැටළු: ${newGrievancesCount}, නව ප්‍රතිචාර: ${newFeedbacksCount})`
              : `Successfully synced new cloud data! (Grievances: ${newGrievancesCount}, Feedbacks: ${newFeedbacksCount})`);
          }
        } else if (!silent) {
          alert(currentLang === 'si' ? 'Google Sheet දත්ත පරික්ෂා කරන ලදී. සියලු දත්ත දැනටමත් යාවත්කාලීනයි!' : 'Google Sheet is already in sync.');
        }
      }
    }
  } catch (err) {
    console.warn('Cloud sync error:', err);
    if (!silent) {
      alert(currentLang === 'si' ? 'Google Sheet සබඳතාවයේ දෝෂයක් මතු විය. කරුණාකර Web App URL එක නිවැරදිදැයි පරීක්ෂා කරන්න.' : 'Error connecting to Google Sheets.');
    }
  } finally {
    isSyncingCloud = false;
    if (iconGrv) iconGrv.classList.remove('fa-spin');
    if (iconFb) iconFb.classList.remove('fa-spin');
  }
}

function getOnlinePageUrl(pageFileName) {
  let base = customOnlineBaseUrl;
  if (!base || base === 'null') {
    base = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  }
  return `${base}/${pageFileName}`;
}

// =========================================================================
// DATA PERSISTENCE & LOADING
// =========================================================================
async function loadApplicationData() {
  const LOCAL_STORAGE_KEY = 'galapitiyagama_sanasa_hrms';
  let localData = null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      localData = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not parse local data', e);
  }

  let serverData = null;
  try {
    const res = await fetch('/api/data?t=' + Date.now());
    if (res.ok) {
      serverData = await res.json();
    }
  } catch (e) {
    // API not reachable (offline / GitHub Pages mode)
  }

  if (serverData && serverData.organization) {
    // Live API returned data
    const localEmpCount = localData?.employees?.length || 0;
    const serverEmpCount = serverData?.employees?.length || 0;

    // If local storage has employees that aren't yet in server data, preserve local data!
    if (localData && localEmpCount > serverEmpCount) {
      appData = localData;
      // Sync local to server in background
      persistData();
    } else {
      appData = serverData;
      // Also update local cache
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
      } catch (e) {}
    }
  } else if (localData && localData.organization) {
    // Server is offline, but we have valid local storage!
    appData = localData;
  } else {
    // Neither server nor local storage has data - load from static seed file
    try {
      const res = await fetch('data/hrms_data.json?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        if (json && json.organization) {
          appData = json;
        }
      }
    } catch (e) {}

    if (!appData || !appData.organization) {
      appData = JSON.parse(JSON.stringify(defaultSeedData));
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {}
  }

  // Ensure all collections exist with fallback to seed data
  if (!appData.employees) appData.employees = [];
  if (!appData.tasks || appData.tasks.length === 0) {
    appData.tasks = JSON.parse(JSON.stringify(defaultSeedData.tasks));
  }
  if (!appData.meetings || appData.meetings.length === 0) {
    appData.meetings = JSON.parse(JSON.stringify(defaultSeedData.meetings));
  }
  if (!appData.users || appData.users.length === 0) {
    appData.users = JSON.parse(JSON.stringify(defaultSeedData.users));
  }
  if (!appData.grievances) appData.grievances = [];
  if (!appData.memberFeedbacks) appData.memberFeedbacks = [];
  if (!appData.appraisals) appData.appraisals = [];
  if (!appData.surveys) appData.surveys = [];
  if (!appData.payrollHistory) appData.payrollHistory = [];
  if (!appData.incentiveRecords) appData.incentiveRecords = [];
  if (!appData.epfRemittances) appData.epfRemittances = [];
}

async function persistData() {
  if (!appData) return;
  try {
    localStorage.setItem('galapitiyagama_sanasa_hrms', JSON.stringify(appData));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }

  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
  } catch (e) {
    // Graceful offline fallback
  }
}

// =========================================================================
// LANGUAGE SWITCHER
// =========================================================================
function setupLanguageSwitchers() {
  const btnSi = document.getElementById('lang-btn-si');
  const btnEn = document.getElementById('lang-btn-en');

  btnSi?.addEventListener('click', () => switchLanguage('si'));
  btnEn?.addEventListener('click', () => switchLanguage('en'));
}

function switchLanguage(lang) {
  currentLang = lang;
  document.getElementById('lang-btn-si')?.classList.toggle('active', lang === 'si');
  document.getElementById('lang-btn-en')?.classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  renderAllViews();
}

function t(key) {
  if (translations[currentLang] && translations[currentLang][key]) {
    return translations[currentLang][key];
  }
  return translations['si'][key] || key;
}

// =========================================================================
// NAVIGATION
// =========================================================================
function setupNavigation() {
  const links = document.querySelectorAll('.menu-item[data-target]');
  links.forEach(l => {
    l.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(l.getAttribute('data-target'));
    });
  });
}

function switchView(targetId) {
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));

  const activeLink = document.querySelector(`.menu-item[data-target="${targetId}"]`);
  const activeView = document.getElementById(`view-${targetId}`);

  if (activeLink) activeLink.classList.add('active');
  if (activeView) activeView.classList.add('active');

  // Update top bar title
  const titles = {
    dashboard: 'Dashboard (පාලක පුවරුව)',
    employees: 'Employees (සේවක මණ්ඩලය)',
    projects: 'Work Progress (ක්‍රියාත්මක ව්‍යාපෘති)',
    meetings: 'Upcoming Meetings (නිල රැස්වීම්)',
    skills: 'Skills Matrix (නිපුණතා න්‍යාසය)',
    grievance: 'Board QR Portal (ගැටළු/යෝජනා)',
    'member-feedback': 'Member Feedback QR',
    payroll: 'Payroll & EPF/ETF (වැටුප්)',
    appraisals: 'Appraisals (කාර්යසාධනය)',
    satisfaction: 'Wellbeing (සේවක තෘප්තිය)',
    posters: 'QR පෝස්ටර් (Print-Ready)',
    'admin-panel': 'Admin Panel (පරිපාලක පාලනය)'
  };
  const topH1 = document.querySelector('.top-bar-left h1');
  if (topH1 && titles[targetId]) {
    topH1.textContent = titles[targetId];
  }

  // Scroll viewport to top
  const scroller = document.querySelector('.viewport-scroll');
  if (scroller) scroller.scrollTop = 0;

  if (targetId === 'dashboard') {
    setTimeout(renderDashboardCharts, 100);
  } else if (targetId === 'skills') {
    setTimeout(renderSkillsCharts, 100);
  } else if (targetId === 'grievance') {
    renderGrievanceQR();
  } else if (targetId === 'member-feedback') {
    renderMemberFeedbackQR();
  } else if (targetId === 'posters') {
    renderPosterQRs();
  } else if (targetId === 'projects') {
    setTimeout(renderProjectsView, 50);
  } else if (targetId === 'meetings') {
    setTimeout(renderMeetingsView, 50);
  } else if (targetId === 'admin-panel') {
    setTimeout(renderAdminPanel, 50);
  }
}

// =========================================================================
// MINI CALENDAR (MATCHING REFERENCE IMAGE)
// =========================================================================
function renderMiniCalendar() {
  const monthTitle = document.getElementById('cal-month-title');
  const datesContainer = document.getElementById('cal-dates-container');
  if (!monthTitle || !datesContainer) return;

  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthTitle.textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  let html = '';
  // Padding for first day of week (Saturday index alignment as per image SAT SUN MON TUE WED THU FRI)
  const offset = (firstDayIndex + 1) % 7; 
  for (let i = 0; i < offset; i++) {
    html += `<div class="cal-date-cell" style="opacity:0.25;">${28 + i}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === currentDay;
    html += `<div class="cal-date-cell ${isToday ? 'active-today' : ''}">${d < 10 ? '0' + d : d}</div>`;
  }

  datesContainer.innerHTML = html;
}

// =========================================================================
// MASTER RENDER
// =========================================================================
function renderAllViews() {
  if (!appData) return;
  renderDashboard();
  renderEmployeesTable();
  renderSkillsMatrix();
  renderGrievancePortal();
  renderMemberFeedbackPortal();
  renderPayrollModule();
  renderAppraisalModule();
  renderSatisfactionModule();
  renderPrintablePosters();
  renderProjectsView();
  renderMeetingsView();
  renderAdminPanel();
}

// =========================================================================
// 1. DASHBOARD
// =========================================================================
function renderDashboard() {
  const emps = appData.employees || [];
  const grievances = appData.grievances || [];
  const feedbacks = appData.memberFeedbacks || [];
  const tasks = appData.tasks || [];
  const meetings = appData.meetings || [];

  // Dynamic Greeting Banner based on Time of Day
  const greetingTitle = document.getElementById('dashboard-greeting-title');
  if (greetingTitle) {
    greetingTitle.textContent = 'HELLO HR DEPARTMENT !';
  }
  const greetingMsg = document.getElementById('dashboard-greeting-msg');
  if (greetingMsg) {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17 || hour < 5) {
      timeGreeting = 'Good evening';
    }
    greetingMsg.textContent = `${timeGreeting}! You have active HR operations & staff applications today. So let's get started.`;
  }

  // Top Metric Cards
  const pillTotalStaff = document.getElementById('stat-pill-total-staff');
  if (pillTotalStaff) pillTotalStaff.textContent = emps.length;

  const pillTotalPresent = document.getElementById('stat-pill-total-present');
  if (pillTotalPresent) pillTotalPresent.textContent = emps.filter(e => e.status === 'Active' || !e.status).length;

  const pillTotalAbsent = document.getElementById('stat-pill-total-absent');
  if (pillTotalAbsent) pillTotalAbsent.textContent = emps.filter(e => e.status === 'Absent').length;

  const pillTotalLeave = document.getElementById('stat-pill-total-leave');
  if (pillTotalLeave) pillTotalLeave.textContent = emps.filter(e => e.status === 'On Leave').length;

  // 1. Employee Status Table (Mockup Col 1)
  const statusBody = document.getElementById('dashboard-emp-status-body');
  if (statusBody) {
    if (emps.length === 0) {
      statusBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:20px; color:#94a3b8;">
            ලියාපදිංචි සේවකයින් නොමැත
          </td>
        </tr>
      `;
    } else {
      statusBody.innerHTML = emps.slice(0, 5).map((e, idx) => {
        const idNum = `25${63 + idx}`;
        const hasPhoto = e.photo && e.photo.length > 20;
        return `
          <tr>
            <td><strong style="color:#059669; font-weight:800;">${idNum}</strong></td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:28px; height:28px; border-radius:50%; background:#059669; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; overflow:hidden; flex-shrink:0;">
                  ${hasPhoto ? `<img src="${e.photo}" style="width:100%; height:100%; object-fit:cover;">` : (e.callingName || e.fullName || 'S').charAt(0)}
                </div>
                <div style="font-weight:700; color:#111827; font-size:12px;">${e.fullName}</div>
              </div>
            </td>
            <td style="font-size:11.5px; color:#4b5563;">${e.designation}</td>
            <td><span class="badge-pill badge-green" style="font-size:10px;">Active</span></td>
            <td style="font-size:11.5px; color:#6b7280;">${e.department ? e.department.split(' ')[0] : 'සණස'}</td>
            <td>
              <button class="btn-smart btn-smart-light" onclick="viewEmployeeProfile('${e.id}')" style="padding:3px 6px; font-size:11px;">
                <i class="fa-solid fa-eye"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 2. Events and Meetings List (Mockup Col 2)
  const eventsList = document.getElementById('dashboard-events-meetings-list');
  if (eventsList) {
    const list = meetings.length > 0 ? meetings : [
      { title: "ණය කමිටු සහ ක්ෂේත්‍ර සමාලෝචනය", date: "07/10/2026", time: "8:00 am" },
      { title: "අධ්‍යක්ෂ මණ්ඩල මාසික නිල රැස්වීම", date: "08/10/2026", time: "10:00 am" },
      { title: "කාර්ය මණ්ඩල සුභසාධන හමුව", date: "10/10/2026", time: "11:30 am" }
    ];
    eventsList.innerHTML = list.slice(0, 4).map(m => `
      <div style="background:#f9fafb; border:1px solid #f3f4f6; border-radius:12px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; background:#e6f4ea; border-radius:10px; color:#059669; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0;">
            <i class="fa-solid fa-calendar-day"></i>
          </div>
          <div>
            <div style="font-size:12px; font-weight:700; color:#111827;">${m.title}</div>
            <div style="font-size:10.5px; color:#6b7280;">Meeting</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; font-weight:700; color:#111827;">${m.time || '9:00 am'}</div>
          <div style="font-size:10px; color:#9ca3af;">${m.date || ''}</div>
        </div>
      </div>
    `).join('');
  }

  // 3. Birthdays List (Mockup Col 3)
  const bdayList = document.getElementById('dashboard-birthdays-list');
  if (bdayList) {
    const sampleBdays = (emps.length > 0 ? emps : [
      { fullName: "කේ. ආර්. විජේසුන්දර", designation: "General Manager", dob: "12/08/2026" },
      { fullName: "එස්. බී. හේරත්", designation: "ප්‍රධාන ණය නිලධාරී", dob: "20/08/2026" },
      { fullName: "ඩබ්. ඒ. නිමල් පෙරේරා", designation: "ගිණුම් සහකාර නිලධාරී", dob: "22/08/2026" }
    ]);
    bdayList.innerHTML = sampleBdays.slice(0, 4).map(e => {
      const hasPhoto = e.photo && e.photo.length > 20;
      return `
        <div style="background:#f9fafb; border:1px solid #f3f4f6; border-radius:12px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:50%; background:#059669; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; overflow:hidden; flex-shrink:0;">
              ${hasPhoto ? `<img src="${e.photo}" style="width:100%; height:100%; object-fit:cover;">` : (e.callingName || e.fullName || 'S').charAt(0)}
            </div>
            <div>
              <div style="font-size:12px; font-weight:700; color:#111827;">${e.callingName || e.fullName}</div>
              <div style="font-size:10.5px; color:#6b7280;">${e.designation}</div>
            </div>
          </div>
          <div style="font-size:10.5px; font-weight:700; color:#059669; background:#e6f4ea; padding:3px 8px; border-radius:12px;">
            ${e.dob || '15/08'}
          </div>
        </div>
      `;
    }).join('');
  }

  renderDashboardCharts();
}

function renderDashboardCharts() {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Team Performance Line Curve
  const ctxCurve = document.getElementById('chart-total-work');
  if (ctxCurve) {
    if (charts['curve']) charts['curve'].destroy();

    const ctx = ctxCurve.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 140);
    gradient.addColorStop(0, 'rgba(5, 150, 105, 0.25)');
    gradient.addColorStop(1, 'rgba(5, 150, 105, 0.0)');

    charts['curve'] = new Chart(ctxCurve, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Designer Team',
            data: [40, 45, 52, 48, 38, 45, 55, 48, 42, 45, 50, 55],
            borderColor: '#059669',
            borderWidth: 2.5,
            fill: true,
            backgroundColor: gradient,
            tension: 0.45,
            pointRadius: 0
          },
          {
            label: 'Developer Team',
            data: [60, 68, 62, 55, 42, 50, 75, 60, 65, 78, 68, 72],
            borderColor: '#6b7280',
            borderWidth: 2,
            fill: false,
            tension: 0.45,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#f3f4f6' }, min: 20, max: 100 }
        }
      }
    });
  }

  // Chart 2: Department Distribution Doughnut (Live dynamic calculation)
  const ctxRings = document.getElementById('chart-task-percentage');
  if (ctxRings) {
    if (charts['rings']) charts['rings'].destroy();

    const deptCounts = {};
    (appData.employees || []).forEach(e => {
      const d = e.department || 'වෙනත්';
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    const deptLabels = Object.keys(deptCounts);
    const deptData = Object.values(deptCounts);
    const defaultColors = ['#ec4899', '#f97316', '#0284c7', '#8b5cf6', '#10b981', '#6366f1'];

    charts['rings'] = new Chart(ctxRings, {
      type: 'doughnut',
      data: {
        labels: deptLabels.length > 0 ? deptLabels : ['සේවකයින් එකතු කර නොමැත'],
        datasets: [{
          data: deptData.length > 0 ? deptData : [1],
          backgroundColor: deptLabels.length > 0 ? defaultColors.slice(0, deptLabels.length) : ['#e2e8f0'],
          borderRadius: 8,
          borderWidth: 4,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        layout: {
          padding: { left: 0, right: 2, top: 0, bottom: 0 }
        },
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 6,
              font: { family: "'Segoe UI', system-ui, sans-serif", size: 10.5, weight: '600' },
              color: '#334155',
              generateLabels: function(chart) {
                const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                return original.map(item => {
                  if (item.text && item.text.length > 25) {
                    item.text = item.text.substring(0, 23) + '...';
                  }
                  return item;
                });
              }
            }
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return deptLabels[context[0].dataIndex] || '';
              }
            }
          }
        }
      }
    });
  }
}

function handleStaffPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUri = e.target.result;
    document.getElementById('emp-photo-data').value = dataUri;
    const img = document.getElementById('emp-photo-preview');
    const icon = document.getElementById('emp-photo-placeholder-icon');
    if (img) {
      img.src = dataUri;
      img.style.display = 'block';
    }
    if (icon) icon.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function sendWhatsAppMessage(empId) {
  const emp = (appData.employees || []).find(e => e.id === empId);
  if (!emp || !emp.phone) {
    alert(currentLang === 'si' ? 'මෙම සේවකයා සඳහා දුරකථන අංකයක් ඇතුළත් කර නොමැත.' : 'No phone number available for this staff member.');
    return;
  }

  const rawPhone = emp.phone.replace(/[^0-9]/g, '');
  let formattedPhone = rawPhone;
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '94' + formattedPhone.substring(1);
  }

  const msg = `ගලපිටියාගම සණස සමුපකාර සමිතිය - මානව සම්පත් අංශයේ නිල දැනුම්දීම:\n\nගරු ${emp.fullName} (${emp.designation}) මහතා/මහත්මිය වෙත,\n\nඔබගේ සේවා තොරතුරු හා රාජකාරි සම්බන්ධයෙන් පද්ධතියෙන් කෙරෙන දැනුම්දීමයි.`;

  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

async function deleteEmployee(id) {
  const emp = (appData.employees || []).find(e => e.id === id);
  const name = emp ? emp.fullName : id;

  if (confirm(currentLang === 'si' ? `"${name}" සේවකයා පද්ධතියෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීමට ඔබට සහතිකද?` : `Are you sure you want to delete staff member "${name}"?`)) {
    appData.employees = (appData.employees || []).filter(e => e.id !== id);
    await persistData();
    renderEmployeesTable();
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderSkillsMatrix === 'function') renderSkillsMatrix();
    alert(currentLang === 'si' ? 'සේවකයා සාර්ථකව ඉවත් කරන ලදී!' : 'Employee deleted successfully!');
  }
}

// =========================================================================
// 2. EMPLOYEE DIRECTORY
// =========================================================================
function renderEmployeesTable() {
  const tbody = document.querySelector('#table-employees-body');
  if (!tbody) return;

  const searchTerm = (document.getElementById('search-employee-input')?.value || '').toLowerCase();
  const deptFilter = document.getElementById('filter-employee-dept')?.value || 'ALL';

  const filtered = (appData.employees || []).filter(e => {
    const matchSearch = (e.fullName || '').toLowerCase().includes(searchTerm) ||
      (e.id || '').toLowerCase().includes(searchTerm) ||
      (e.designation || '').toLowerCase().includes(searchTerm) ||
      (e.nic || '').toLowerCase().includes(searchTerm);
    const matchDept = (deptFilter === 'ALL') || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:35px 20px; color:#94a3b8;">
          <i class="fa-solid fa-users" style="font-size:36px; margin-bottom:12px; opacity:0.6; display:block;"></i>
          <p style="font-size:14px; font-weight:700; color:#64748b; margin-bottom:6px;">සේවකයින් කිසිවෙකු ලියාපදිංචි කර නොමැත</p>
          <p style="font-size:12px; color:#94a3b8; margin-bottom:14px;">ගලපිටියාගම සණස සමිතියේ සේවක තොරතුරු ඇතුළත් කිරීමට පහත බොත්තම ඔබන්න.</p>
          <button class="btn-smart btn-smart-primary" onclick="openAddEmployeeModal()">
            <i class="fa-solid fa-user-plus"></i> + පළමු සේවකයා ලියාපදිංචි කරන්න
          </button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(emp => {
    const hasPhoto = emp.photo && emp.photo.length > 20;

    return `
      <tr>
        <td><strong style="color:var(--primary);">${emp.id}</strong></td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:38px; height:38px; border-radius:50%; background:#7c3aed; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; overflow:hidden; border:2px solid #e2e8f0; flex-shrink:0;">
              ${hasPhoto ? `<img src="${emp.photo}" style="width:100%; height:100%; object-fit:cover;">` : (emp.callingName || emp.fullName || 'S').charAt(0)}
            </div>
            <div>
              <div style="font-weight:700; color:#1e1b4b;">${emp.fullName}</div>
              <div style="font-size:11px; color:#64748b;">NIC: ${emp.nic} | ${emp.gender}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:600;">${emp.designation}</div>
          <div style="font-size:11px; color:#7c3aed; font-weight:600;">${emp.department}</div>
        </td>
        <td>${emp.phone || '-'}</td>
        <td><span class="badge-pill badge-green">${emp.employmentType || 'ස්ථිර (Permanent)'}</span></td>
        <td>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">
            <button class="btn-smart btn-smart-light" onclick="viewEmployeeProfile('${emp.id}')" title="පැතිකඩ">
              <i class="fa-solid fa-id-card"></i>
            </button>
            <button class="btn-smart" onclick="sendWhatsAppMessage('${emp.id}')" title="WhatsApp පණිවිඩයක් යවන්න" style="background:#25D366; color:#fff; border:none; padding:4px 8px; font-size:11px;">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
            <button class="btn-smart btn-smart-light" onclick="editEmployee('${emp.id}')" title="සංස්කරණය" style="padding:4px 8px; font-size:11px;">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-smart" onclick="deleteEmployee('${emp.id}')" title="ඉවත් කරන්න" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; font-size:11px;">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddEmployeeModal() {
  document.getElementById('form-smart-employee').reset();
  document.getElementById('emp-id-input').value = `EMP-00${(appData.employees || []).length + 1}`;
  document.getElementById('emp-mode').value = 'create';
  document.getElementById('emp-photo-data').value = '';

  const img = document.getElementById('emp-photo-preview');
  const icon = document.getElementById('emp-photo-placeholder-icon');
  if (img) { img.src = ''; img.style.display = 'none'; }
  if (icon) icon.style.display = 'block';

  openSmartModal('modal-smart-employee');
}

function editEmployee(id) {
  const emp = appData.employees.find(e => e.id === id);
  if (!emp) return;

  document.getElementById('emp-mode').value = 'edit';
  document.getElementById('emp-id-input').value = emp.id;
  document.getElementById('emp-full-name').value = emp.fullName || '';
  document.getElementById('emp-calling-name').value = emp.callingName || '';
  document.getElementById('emp-nic').value = emp.nic || '';
  document.getElementById('emp-gender').value = emp.gender || 'Female';
  document.getElementById('emp-dob').value = emp.dob || '1992-05-15';
  document.getElementById('emp-phone').value = emp.phone || '';
  document.getElementById('emp-address').value = emp.address || '';
  document.getElementById('emp-designation').value = emp.designation || '';
  document.getElementById('emp-department').value = emp.department || 'ණය සහ ක්ෂුද්‍ර මූල්‍ය අංශය';
  document.getElementById('emp-appointment-date').value = emp.appointmentDate || '2020-01-01';
  document.getElementById('emp-type').value = emp.employmentType || 'ස්ථිර (Permanent)';
  document.getElementById('emp-basic-salary').value = emp.basicSalary || 55000;
  document.getElementById('emp-acc-no').value = emp.bankDetails?.accountNo || '';
  document.getElementById('emp-photo-data').value = emp.photo || '';

  const img = document.getElementById('emp-photo-preview');
  const icon = document.getElementById('emp-photo-placeholder-icon');
  if (emp.photo && emp.photo.length > 20) {
    if (img) { img.src = emp.photo; img.style.display = 'block'; }
    if (icon) icon.style.display = 'none';
  } else {
    if (img) { img.src = ''; img.style.display = 'none'; }
    if (icon) icon.style.display = 'block';
  }

  openSmartModal('modal-smart-employee');
}

async function saveSmartEmployeeForm(e) {
  e.preventDefault();
  const mode = document.getElementById('emp-mode').value;
  const id = document.getElementById('emp-id-input').value;

  const empData = {
    id: id,
    fullName: document.getElementById('emp-full-name').value,
    callingName: document.getElementById('emp-calling-name').value || document.getElementById('emp-full-name').value,
    nic: document.getElementById('emp-nic').value,
    gender: document.getElementById('emp-gender').value,
    photo: document.getElementById('emp-photo-data').value || '',
    dob: document.getElementById('emp-dob').value,
    phone: document.getElementById('emp-phone').value,
    address: document.getElementById('emp-address').value,
    designation: document.getElementById('emp-designation').value,
    department: document.getElementById('emp-department').value,
    branch: 'ගලපිටියාගම ප්‍රධාන ශාඛාව',
    appointmentDate: document.getElementById('emp-appointment-date').value,
    employmentType: document.getElementById('emp-type').value,
    status: 'Active',
    basicSalary: parseFloat(document.getElementById('emp-basic-salary').value) || 50000,
    allowances: {
      bra: 5000,
      attendance: 5000,
      travelling: 6000,
      phone: 2500,
      costOfLiving: 12500
    },
    deductions: {
      staffLoan: 0,
      welfareFund: 1000,
      advance: 0
    },
    bankDetails: {
      bankName: 'සණස සමුපකාර බැංකුව',
      accountNo: document.getElementById('emp-acc-no').value,
      epfNo: `EPF-GSS-${id.replace('EMP-', '')}`
    },
    skills: {
      educationLevel: 4,
      microfinance: 4,
      creditAppraisal: 4,
      accounting: 3,
      audit: 3,
      bankingSoftware: 4,
      excel: 4,
      teamLeadership: 4,
      customerCare: 5,
      legalRecovery: 3
    }
  };

  if (mode === 'create') {
    appData.employees.push(empData);
  } else {
    const idx = appData.employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      empData.skills = appData.employees[idx].skills || empData.skills;
      empData.deductions = appData.employees[idx].deductions || empData.deductions;
      appData.employees[idx] = empData;
    }
  }

  await persistData();
  closeSmartModal('modal-smart-employee');
  renderAllViews();
  alert(currentLang === 'si' ? 'සේවක තොරතුරු සාර්ථකව සුරකින ලදී!' : 'Employee saved successfully!');
}

function viewEmployeeProfile(id) {
  const emp = appData.employees.find(e => e.id === id);
  if (!emp) return;

  const area = document.getElementById('profile-view-body');
  if (!area) return;

  area.innerHTML = `
    <div style="display:flex; gap:16px; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:18px; margin-bottom:18px;">
      <div style="width:60px; height:60px; background:var(--primary-gradient); color:#fff; border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800;">
        ${emp.callingName ? emp.callingName.charAt(0) : 'E'}
      </div>
      <div>
        <h3 style="color:#1e1b4b; font-size:18px; font-weight:800;">${emp.fullName}</h3>
        <p style="color:#64748b; font-size:13px;">${emp.designation} | <strong>${emp.id}</strong></p>
        <div style="display:flex; gap:6px; margin-top:4px;">
          <span class="badge-pill badge-green">${emp.employmentType}</span>
          <span class="badge-pill badge-purple">${emp.department}</span>
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:13px;">
      <div style="background:#f8fafc; padding:14px; border-radius:14px;">
        <h5 style="color:#7c3aed; margin-bottom:8px; font-weight:700;">පුද්ගලික තොරතුරු</h5>
        <p><strong>NIC:</strong> ${emp.nic}</p>
        <p><strong>උපන් දිනය:</strong> ${emp.dob} (${emp.gender})</p>
        <p><strong>දුරකථනය:</strong> ${emp.phone}</p>
        <p><strong>ලිපිනය:</strong> ${emp.address}</p>
      </div>

      <div style="background:#f8fafc; padding:14px; border-radius:14px;">
        <h5 style="color:#7c3aed; margin-bottom:8px; font-weight:700;">සේවා හා වැටුප්</h5>
        <p><strong>අංශය:</strong> ${emp.department}</p>
        <p><strong>පත්වීම් දිනය:</strong> ${emp.appointmentDate}</p>
        <p><strong>මූලික වැටුප:</strong> රු. ${(emp.basicSalary || 0).toLocaleString()}</p>
        <p><strong>ගිණුම් අංකය:</strong> ${emp.bankDetails?.accountNo || '-'}</p>
      </div>
    </div>
  `;

  openSmartModal('modal-smart-profile');
}

// =========================================================================
// 3. COMPETENCY MANAGEMENT, TRAINING & SMART ALLOCATOR
// =========================================================================
function switchSkillsSubTab(tabName) {
  const tabs = ['matrix', 'training', 'allocator'];
  tabs.forEach(t => {
    const btn = document.getElementById(`subtab-btn-${t}`);
    const panel = document.getElementById(`subtab-panel-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.classList.remove('btn-smart-light');
        btn.classList.add('btn-smart-primary');
      } else {
        btn.classList.remove('btn-smart-primary');
        btn.classList.add('btn-smart-light');
      }
    }
    if (panel) {
      panel.style.display = (t === tabName) ? 'block' : 'none';
    }
  });

  if (tabName === 'training') {
    renderTrainingNeedsAnalysis();
  } else if (tabName === 'allocator') {
    calculateTaskMatching();
  } else if (tabName === 'matrix') {
    setTimeout(renderSkillsCharts, 100);
  }
}

const skillMetaMap = {
  microfinance: { name: "ක්ෂුද්‍ර මූල්‍ය මෙහෙයුම්", course: "Microfinance & Rural Credit Mastery Workshop" },
  creditAppraisal: { name: "ණය තක්සේරුව & අවදානම්", course: "Advanced Credit Appraisal & Risk Management" },
  accounting: { name: "ගිණුම්කරණය & මූල්‍ය", course: "Cooperative Accounting & Statutory Audit Training" },
  bankingSoftware: { name: "බැංකු MIS පද්ධති", course: "Bank MIS & Software Operations Certification" },
  excel: { name: "Excel & IT හැකියාවන්", course: "Advanced Excel, Dashboards & Data Analysis" },
  teamLeadership: { name: "නායකත්වය & කණ්ඩායම්", course: "Leadership, Team Management & HR Ethics" },
  customerCare: { name: "සාමාජික සත්කාරය", course: "Member Care, Service Excellence & Communication" }
};

function renderTrainingNeedsAnalysis() {
  if (!appData.trainingNominations) {
    appData.trainingNominations = [];
  }

  const recContainer = document.getElementById('tna-recommendations-list');
  if (recContainer) {
    let gaps = [];
    (appData.employees || []).forEach(emp => {
      const s = emp.skills || {};
      Object.keys(skillMetaMap).forEach(key => {
        const val = s[key] || 3;
        if (val < 3) {
          const isAlreadyNominated = (appData.trainingNominations || []).some(n => n.empId === emp.id && n.skillKey === key && n.status === "Nominated");
          gaps.push({
            emp,
            skillKey: key,
            skillName: skillMetaMap[key].name,
            courseName: skillMetaMap[key].course,
            score: val,
            isAlreadyNominated
          });
        }
      });
    });

    if (gaps.length === 0) {
      recContainer.innerHTML = `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:16px; border-radius:12px; font-size:13px; font-weight:700; text-align:center;">
          <i class="fa-solid fa-circle-check" style="margin-right:6px; font-size:16px;"></i>
          සියලුම සේවකයින්ගේ ප්‍රධාන නිපුණතාවයන් යහපත් මට්ටමක (3/5 හෝ ඊට වැඩි) පවතී. හදිසි පුහුණු හිඟයක් හඳුනාගෙන නොමැත.
        </div>
      `;
    } else {
      recContainer.innerHTML = gaps.map(g => `
        <div style="background:#fff; border:1px solid #fed7aa; border-radius:12px; padding:12px 16px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-weight:800; color:#1e1b4b; font-size:13.5px;">
              ${g.emp.callingName || g.emp.fullName} <span style="font-size:11px; color:#64748b; font-weight:normal;">(${g.emp.designation})</span>
            </div>
            <div style="font-size:12px; color:#d97706; margin-top:2px;">
              අඩු නිපුණතාවය: <strong>${g.skillName}</strong> — ලකුණු: <strong>${g.score}/5</strong>
            </div>
            <div style="font-size:11.5px; color:#475569; margin-top:2px;">
              නිර්දේශිත පුහුණුව: <strong>${g.courseName}</strong>
            </div>
          </div>
          <div>
            ${g.isAlreadyNominated ? `
              <span class="badge-pill badge-warning"><i class="fa-solid fa-clock"></i> යොමු කර ඇත (Pending)</span>
            ` : `
              <button class="btn-smart btn-smart-primary" onclick="nominateForTraining('${g.emp.id}', '${g.skillKey}', '${g.courseName.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-graduation-cap"></i> පුහුණුවට යොමු කරන්න
              </button>
            `}
          </div>
        </div>
      `).join('');
    }
  }

  // Render Training Log Table
  const tbody = document.getElementById('table-training-log-body');
  if (tbody) {
    const list = appData.trainingNominations || [];
    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:25px; color:#94a3b8;">
            ලියාපදිංචි කළ පුහුණු සටහන් නොමැත
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = list.map(n => `
        <tr>
          <td style="font-weight:700; color:#1e1b4b;">${n.empName}</td>
          <td style="font-weight:600; color:#7c3aed;">${n.courseName}</td>
          <td>${n.skillName}</td>
          <td><span class="badge-pill badge-warning">${n.priority || 'High'} Priority</span></td>
          <td>${n.date}</td>
          <td>
            ${n.status === 'Completed' ? `
              <span class="badge-pill badge-success"><i class="fa-solid fa-check"></i> සම්පූර්ණයි</span>
            ` : `
              <span class="badge-pill badge-warning"><i class="fa-solid fa-spinner"></i> නොමිනේට් කර ඇත</span>
            `}
          </td>
          <td>
            ${n.status !== 'Completed' ? `
              <button class="btn-smart btn-smart-success" onclick="markTrainingCompleted('${n.id}')">
                <i class="fa-solid fa-check-double"></i> අවසන් බව ලකුණු කරන්න
              </button>
            ` : `
              <span style="font-size:11px; color:#166534; font-weight:700;">★ Level Upgraded</span>
            `}
          </td>
        </tr>
      `).join('');
    }
  }
}

async function nominateForTraining(empId, skillKey, courseName) {
  const emp = appData.employees.find(e => e.id === empId);
  if (!emp) return;

  if (!appData.trainingNominations) appData.trainingNominations = [];

  const newNom = {
    id: `TRN-${Date.now().toString().slice(-4)}`,
    empId: emp.id,
    empName: emp.callingName || emp.fullName,
    skillKey: skillKey,
    skillName: skillMetaMap[skillKey]?.name || skillKey,
    courseName: courseName,
    priority: "High",
    date: new Date().toISOString().split('T')[0],
    status: "Nominated"
  };

  appData.trainingNominations.push(newNom);
  await persistData();
  renderTrainingNeedsAnalysis();
  alert(currentLang === 'si' ? `${emp.callingName || emp.fullName} සාර්ථකව ${courseName} පුහුණුව සඳහා යොමු කරන ලදී!` : `Successfully nominated ${emp.fullName} for training!`);
}

async function markTrainingCompleted(nomId) {
  if (!appData.trainingNominations) return;
  const nom = appData.trainingNominations.find(n => n.id === nomId);
  if (!nom) return;

  nom.status = "Completed";

  const emp = appData.employees.find(e => e.id === nom.empId);
  if (emp && emp.skills) {
    emp.skills[nom.skillKey] = Math.max((emp.skills[nom.skillKey] || 1) + 2, 4);
  }

  await persistData();
  renderSkillsMatrix();
  renderTrainingNeedsAnalysis();
  alert(currentLang === 'si' ? `පුහුණුව සාර්ථකව අවසන් කළ බව සටහන් විය! සේවක නිපුණතා මට්ටම 4/5 දක්වා ඉහළ නැංවිණි.` : `Training marked as completed! Skill rating upgraded.`);
}

function renderSkillsMatrix() {
  const tbody = document.querySelector('#table-skills-body');
  if (!tbody) return;

  if (!appData.employees || appData.employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:30px; color:#94a3b8;">
          <i class="fa-solid fa-users" style="font-size:28px; margin-bottom:8px; display:block; opacity:0.6;"></i>
          දත්ත නොමැත — පළමුව සේවකයින් ලියාපදිංචි කරන්න
        </td>
      </tr>
    `;
    const taskSelect = document.getElementById('smart-task-select');
    if (taskSelect) taskSelect.innerHTML = '<option value="">-- ව්‍යාපෘති නොමැත --</option>';
    return;
  }

  tbody.innerHTML = appData.employees.map(emp => {
    const s = emp.skills || {};
    return `
      <tr>
        <td>
          <div style="font-weight:700; color:#1e1b4b;">${emp.callingName || emp.fullName}</div>
          <div style="font-size:11px; color:#64748b;">${emp.designation}</div>
        </td>
        <td>${renderStars(s.educationLevel || 3)}</td>
        <td>${renderStars(s.microfinance || 4)}</td>
        <td>${renderStars(s.creditAppraisal || 4)}</td>
        <td>${renderStars(s.accounting || 3)}</td>
        <td>${renderStars(s.bankingSoftware || 4)}</td>
        <td>${renderStars(s.excel || 4)}</td>
        <td>${renderStars(s.teamLeadership || 4)}</td>
        <td>${renderStars(s.customerCare || 5)}</td>
        <td>
          <button class="btn-smart btn-smart-light" onclick="openEditSkillsModal('${emp.id}')">
            <i class="fa-solid fa-sliders"></i> වෙනස් කරන්න
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const taskSelect = document.getElementById('smart-task-select');
  if (taskSelect && appData.tasks) {
    taskSelect.innerHTML = appData.tasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
    calculateTaskMatching();
  }

  renderTrainingNeedsAnalysis();
  renderSkillsCharts();
}

function renderStars(level) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += i <= level ? '★' : '☆';
  }
  return `<span style="color:#f59e0b; font-size:12px; letter-spacing:1px;">${s}</span> <span style="font-size:10px; font-weight:700;">(${level})</span>`;
}

function openEditSkillsModal(empId) {
  const emp = appData.employees.find(e => e.id === empId);
  if (!emp) return;

  document.getElementById('skill-edit-emp-id').value = emp.id;
  document.getElementById('skill-edit-emp-name').textContent = `${emp.fullName} (${emp.designation})`;

  const fields = ['educationLevel', 'microfinance', 'creditAppraisal', 'accounting', 'audit', 'bankingSoftware', 'excel', 'teamLeadership', 'customerCare', 'legalRecovery'];
  fields.forEach(f => {
    const el = document.getElementById(`skill-val-${f}`);
    if (el) el.value = emp.skills?.[f] || 3;
  });

  openSmartModal('modal-smart-skills-edit');
}

async function saveSkillsForm(e) {
  e.preventDefault();
  const id = document.getElementById('skill-edit-emp-id').value;
  const emp = appData.employees.find(e => e.id === id);
  if (!emp) return;

  emp.skills = {
    educationLevel: parseInt(document.getElementById('skill-val-educationLevel').value),
    microfinance: parseInt(document.getElementById('skill-val-microfinance').value),
    creditAppraisal: parseInt(document.getElementById('skill-val-creditAppraisal').value),
    accounting: parseInt(document.getElementById('skill-val-accounting').value),
    audit: parseInt(document.getElementById('skill-val-audit').value),
    bankingSoftware: parseInt(document.getElementById('skill-val-bankingSoftware').value),
    excel: parseInt(document.getElementById('skill-val-excel').value),
    teamLeadership: parseInt(document.getElementById('skill-val-teamLeadership').value),
    customerCare: parseInt(document.getElementById('skill-val-customerCare').value),
    legalRecovery: parseInt(document.getElementById('skill-val-legalRecovery').value)
  };

  await persistData();
  closeSmartModal('modal-smart-skills-edit');
  renderSkillsMatrix();
  alert(currentLang === 'si' ? 'Skills Matrix සාර්ථකව යාවත්කාලීන විය!' : 'Skills Matrix updated!');
}

function calculateTaskMatching() {
  const taskId = document.getElementById('smart-task-select')?.value;
  if (!taskId || !appData.tasks) return;

  const task = appData.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('smart-task-desc').textContent = task.description;

  const req = task.requiredSkills || {};
  const reqKeys = Object.keys(req);

  const list = appData.employees.map(emp => {
    const s = emp.skills || {};
    let totalPoss = 0, totalEarn = 0;
    reqKeys.forEach(k => {
      const weight = (req[k] || 3) * 5;
      totalPoss += weight;
      totalEarn += (s[k] || 1) * 5;
    });
    const pct = totalPoss > 0 ? Math.min(100, Math.round((totalEarn / totalPoss) * 100)) : 85;
    return { emp, pct, isAssigned: task.assignedTo === emp.id };
  });

  list.sort((a, b) => b.pct - a.pct);

  const container = document.getElementById('smart-matching-results');
  if (!container) return;

  container.innerHTML = list.map((cand, idx) => {
    const isTop = idx === 0;
    return `
      <div style="background:${isTop ? '#f5f3ff' : '#ffffff'}; border:1px solid ${isTop ? '#8b5cf6' : '#e2e8f0'}; border-radius:14px; padding:12px 16px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="color:#1e1b4b; font-size:13.5px;">${cand.emp.fullName}</strong>
            ${isTop ? '<span class="badge-pill badge-purple">★ Top Match (වඩාත්ම ගැළපෙන)</span>' : ''}
            ${cand.isAssigned ? '<span class="badge-pill badge-green">දැනට පවරා ඇත</span>' : ''}
          </div>
          <div style="font-size:11.5px; color:#64748b; margin-top:2px;">
            ${cand.emp.designation} | ${cand.emp.branch}
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:14px;">
          <div style="text-align:right;">
            <strong style="font-size:14px; color:${cand.pct >= 85 ? '#16a34a' : '#ea580c'};">${cand.pct}% Match</strong>
            <div style="font-size:10px; color:#94a3b8;">නිපුණතා ගැළපුම</div>
          </div>
          <button class="btn-smart btn-smart-primary" onclick="assignDuty('${task.id}', '${cand.emp.id}')">
            ${cand.isAssigned ? 'නැවත අනුයුක්ත' : 'රාජකාරිය පවරන්න'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function assignDuty(taskId, empId) {
  const task = appData.tasks.find(t => t.id === taskId);
  const emp = appData.employees.find(e => e.id === empId);
  if (!task || !emp) return;

  task.assignedTo = emp.id;
  task.assignedName = emp.fullName;
  await persistData();
  calculateTaskMatching();
  alert(currentLang === 'si' ? `රාජකාරිය සාර්ථකව ${emp.callingName} වෙත පවරන ලදී!` : `Assigned to ${emp.callingName}!`);
}

function renderSkillsCharts() {
  if (typeof Chart === 'undefined') return;

  const ctx = document.getElementById('chart-skills-radar-full');
  if (!ctx) return;

  if (charts['radarFull']) charts['radarFull'].destroy();

  const labels = ['Microfinance', 'Credit', 'Accounting', 'Audit', 'Core Banking', 'Excel', 'Leadership', 'Member Care'];
  const avgData = [4.5, 4.2, 3.8, 3.4, 4.4, 4.2, 4.3, 4.8];

  charts['radarFull'] = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'ආයතනික නිපුණතා මට්ටම (Average / 5.0)',
        data: avgData,
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderColor: '#7c3aed',
        pointBackgroundColor: '#f59e0b',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: { r: { min: 0, max: 5 } }
    }
  });
}

// =========================================================================
// 4. ONLINE QR GRIEVANCE PORTAL
// =========================================================================
function renderGrievancePortal() {
  renderGrievanceQR();
  const tbody = document.querySelector('#table-grievance-body');
  if (!tbody) return;

  tbody.innerHTML = appData.grievances.map(g => {
    const actionText = g.actionTaken || g.boardNotes || '';
    return `
    <tr>
      <td><strong>${g.id}</strong></td>
      <td><span style="font-size:11px; color:#64748b;">${g.timestamp}</span></td>
      <td>
        <strong style="color:${g.isAnonymous ? '#7c3aed' : '#1e1b4b'};">
          ${g.isAnonymous ? '🔒 නිර්නාමික (Anonymous)' : g.employeeName}
        </strong>
      </td>
      <td><span class="badge-pill badge-purple">${g.targetRecipient}</span></td>
      <td>
        <div style="font-weight:700;">${g.title}</div>
        <div style="font-size:11.5px; color:#64748b;">${g.description.substring(0, 65)}...</div>
      </td>
      <td><span class="badge-pill ${getBadgeClass(g.status)}">${g.status}</span></td>
      <td style="min-width:210px;">
        ${actionText 
          ? `<div style="font-size:12px; color:#0f766e; font-weight:600; margin-bottom:5px; line-height:1.4; background:#f0fdf4; padding:6px 10px; border-radius:8px; border:1px solid #bbf7d0;">
               <i class="fa-solid fa-circle-check"></i> ${actionText}
             </div>` 
          : `<span style="font-size:11px; color:#94a3b8; font-style:italic; display:block; margin-bottom:5px;">ක්‍රියාමාර්ගයක් සටහන් කර නැත</span>`}
        <button class="btn-smart btn-smart-light" style="padding:4px 10px; font-size:11.5px;" onclick="openGrievanceReviewModal('${g.id}')">
          <i class="fa-solid ${actionText ? 'fa-pen-to-square' : 'fa-plus'}"></i> ${actionText ? 'වෙනස් කරන්න' : 'ක්‍රියාමාර්ගයක් එක් කරන්න'}
        </button>
      </td>
    </tr>
  `;
  }).join('');
}

function renderGrievanceQR() {
  const container = document.getElementById('qr-online-grievance');
  const linkText = document.getElementById('qr-online-grievance-url');
  if (!container) return;

  const url = getOnlinePageUrl('grievance.html');
  if (linkText) linkText.textContent = url;

  container.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: url,
      width: 180,
      height: 180,
      colorDark: "#7c3aed",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

function openGrievanceReviewModal(id) {
  const g = appData.grievances.find(item => item.id === id);
  if (!g) return;

  document.getElementById('review-grv-id').value = g.id;
  document.getElementById('review-grv-title').innerHTML = `<i class="fa-solid fa-gavel" style="color:#7c3aed;"></i> ${g.id}: ${g.title}`;
  document.getElementById('review-grv-sender').textContent = g.isAnonymous ? '🔒 නිර්නාමික (100% Confidential Anonymous Staff)' : g.employeeName;
  document.getElementById('review-grv-target').textContent = g.targetRecipient;
  document.getElementById('review-grv-desc').textContent = g.description;
  document.getElementById('review-grv-status').value = g.status;
  document.getElementById('review-grv-notes').value = g.actionTaken || g.boardNotes || '';

  openSmartModal('modal-smart-grievance-review');
}

async function saveGrievanceReviewForm(e) {
  e.preventDefault();
  const id = document.getElementById('review-grv-id').value;
  const g = appData.grievances.find(x => x.id === id);
  if (!g) return;

  g.status = document.getElementById('review-grv-status').value;
  g.actionTaken = document.getElementById('review-grv-notes').value;
  g.boardNotes = g.actionTaken;

  await persistData();
  closeSmartModal('modal-smart-grievance-review');
  renderAllViews();
  alert(currentLang === 'si' ? 'සේවක ගැටළුව/යෝජනාව පිළිබඳ ගත් ක්‍රියාමාර්ගය සාර්ථකව සුරකින ලදී!' : 'Resolution / Action notes saved successfully!');
}

function getBadgeClass(status) {
  if (status.includes('Resolved') || status.includes('විසඳුම්')) return 'badge-green';
  if (status.includes('Review') || status.includes('සලකා')) return 'badge-orange';
  return 'badge-blue';
}

// =========================================================================
// 5. ONLINE QR MEMBER FEEDBACK PORTAL
// =========================================================================
function renderMemberFeedbackPortal() {
  renderMemberFeedbackQR();
  const tbody = document.querySelector('#table-member-feedback-body');
  if (!tbody) return;

  tbody.innerHTML = appData.memberFeedbacks.map(f => {
    const actionText = f.actionTaken || '';
    return `
    <tr>
      <td><strong>${f.id}</strong></td>
      <td><span style="font-size:11px; color:#64748b;">${f.timestamp}</span></td>
      <td>
        <strong>${f.memberName}</strong><br>
        <span style="font-size:10.5px; color:#94a3b8;">${f.memberNo || ''}</span>
      </td>
      <td><span class="badge-pill badge-purple">${f.branch}</span></td>
      <td>
        <span style="color:#f59e0b; font-size:12px;">${'★'.repeat(f.overallRating || 5)}</span> (${f.overallRating}/5)
      </td>
      <td>
        <span class="badge-pill badge-blue">${f.feedbackType}</span>
        <div style="font-size:12px; margin-top:2px;">${f.comments}</div>
      </td>
      <td><span class="badge-pill ${getFeedbackBadgeClass(f.status)}">${f.status || 'ලැබුණි (Received)'}</span></td>
      <td style="min-width:210px;">
        ${actionText 
          ? `<div style="font-size:12px; color:#0f766e; font-weight:600; margin-bottom:5px; line-height:1.4; background:#f0fdf4; padding:6px 10px; border-radius:8px; border:1px solid #bbf7d0;">
               <i class="fa-solid fa-circle-check"></i> ${actionText}
             </div>` 
          : `<span style="font-size:11px; color:#94a3b8; font-style:italic; display:block; margin-bottom:5px;">ක්‍රියාමාර්ගයක් සටහන් කර නැත</span>`}
        <button class="btn-smart btn-smart-light" style="padding:4px 10px; font-size:11.5px;" onclick="openMemberFeedbackReviewModal('${f.id}')">
          <i class="fa-solid ${actionText ? 'fa-pen-to-square' : 'fa-plus'}"></i> ${actionText ? 'වෙනස් කරන්න' : 'ක්‍රියාමාර්ගයක් එක් කරන්න'}
        </button>
      </td>
    </tr>
  `;
  }).join('');
}

function getFeedbackBadgeClass(status) {
  if (!status) return 'badge-blue';
  if (status.includes('Resolved') || status.includes('විසඳුම්') || status.includes('Action Taken') || status.includes('ක්‍රියාමාර්ග')) return 'badge-green';
  if (status.includes('Review') || status.includes('සලකා')) return 'badge-orange';
  if (status.includes('Noted') || status.includes('සටහන්')) return 'badge-purple';
  return 'badge-blue';
}

function openMemberFeedbackReviewModal(id) {
  const f = appData.memberFeedbacks.find(item => item.id === id);
  if (!f) return;

  document.getElementById('review-fb-id').value = f.id;
  document.getElementById('review-fb-title').innerHTML = `<i class="fa-solid fa-comments" style="color:#059669;"></i> ${f.id}: සාමාජික අදහස් සමාලෝචනය`;
  document.getElementById('review-fb-member').textContent = `${f.memberName} ${f.memberNo ? '(' + f.memberNo + ')' : ''}`;
  document.getElementById('review-fb-branch').textContent = f.branch || 'ප්‍රධාන කාර්යාලය';
  document.getElementById('review-fb-date').textContent = f.timestamp || '';
  document.getElementById('review-fb-rating').textContent = `${'★'.repeat(f.overallRating || 5)} (${f.overallRating || 5}/5)`;
  document.getElementById('review-fb-type').textContent = f.feedbackType || 'අදහස්';
  document.getElementById('review-fb-comments').textContent = f.comments || '';
  document.getElementById('review-fb-status').value = f.status || 'ලැබුණි (Received)';
  document.getElementById('review-fb-action').value = f.actionTaken || '';

  openSmartModal('modal-smart-member-feedback-review');
}

async function saveMemberFeedbackReviewForm(e) {
  e.preventDefault();
  const id = document.getElementById('review-fb-id').value;
  const f = appData.memberFeedbacks.find(x => x.id === id);
  if (!f) return;

  f.status = document.getElementById('review-fb-status').value;
  f.actionTaken = document.getElementById('review-fb-action').value;

  await persistData();
  closeSmartModal('modal-smart-member-feedback-review');
  renderAllViews();
  alert(currentLang === 'si' ? 'සාමාජික අදහස පිළිබඳ ගත් ක්‍රියාමාර්ගය සාර්ථකව සුරකින ලදී!' : 'Member feedback action saved successfully!');
}

function renderMemberFeedbackQR() {
  const container = document.getElementById('qr-online-member');
  const linkText = document.getElementById('qr-online-member-url');
  if (!container) return;

  const url = getOnlinePageUrl('feedback.html');
  if (linkText) linkText.textContent = url;

  container.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: url,
      width: 180,
      height: 180,
      colorDark: "#1e3a8a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// =========================================================================
// 6. PAYROLL & EPF/ETF (FORM 1 & FORM 2 - SANASA SPECIFIC)
// =========================================================================

let currentPayrollFilter = 'all';
let currentPayrollSubTab = 'form1';

// Helper to determine if employee is permanent
function isPermanentEmp(emp) {
  if (!emp) return false;
  const t = (emp.employmentType || '').toLowerCase();
  return t.includes('ස්ථිර') || t.includes('perm') || (!t.includes('පරිවාස') && !t.includes('prob') && !t.includes('කොන්') && !t.includes('contract'));
}

// Sub Tab switcher
function switchPayrollSubTab(tab) {
  currentPayrollSubTab = tab;
  const btn1 = document.getElementById('btn-tab-payroll-form1');
  const btn2 = document.getElementById('btn-tab-payroll-form2');
  const btn3 = document.getElementById('btn-tab-payroll-epf');
  const panel1 = document.getElementById('payroll-panel-form1');
  const panel2 = document.getElementById('payroll-panel-form2');
  const panel3 = document.getElementById('payroll-panel-epf');

  [btn1, btn2, btn3].forEach(b => { if (b) b.classList.remove('active'); });
  [panel1, panel2, panel3].forEach(p => { if (p) p.style.display = 'none'; });

  if (tab === 'form1') {
    if (btn1) btn1.classList.add('active');
    if (panel1) panel1.style.display = 'block';
    renderPayrollModule();
  } else if (tab === 'form2') {
    if (btn2) btn2.classList.add('active');
    if (panel2) panel2.style.display = 'block';
    renderIncentivesTable();
  } else if (tab === 'epf') {
    if (btn3) btn3.classList.add('active');
    if (panel3) panel3.style.display = 'block';
    renderEpfTrackerModule();
  }
}

// Schedule Filter (All / Perm 25th / Non-Perm 10th)
function filterPayrollSchedule(type) {
  currentPayrollFilter = type;
  const bAll = document.getElementById('btn-filter-pay-all');
  const bPerm = document.getElementById('btn-filter-pay-perm');
  const bNon = document.getElementById('btn-filter-pay-nonperm');

  [bAll, bPerm, bNon].forEach(b => {
    if (b) {
      b.style.background = '#f1f5f9';
      b.style.color = '#475569';
      b.style.fontWeight = 'normal';
    }
  });

  const activeBtn = type === 'perm' ? bPerm : (type === 'nonperm' ? bNon : bAll);
  if (activeBtn) {
    activeBtn.style.background = '#ffffff';
    activeBtn.style.color = '#1e1b4b';
    activeBtn.style.fontWeight = '700';
  }

  renderPayrollModule();
}

// RENDER FORM 1 - MAIN PAYROLL
function renderPayrollModule() {
  const tbody = document.querySelector('#table-payroll-body');
  if (!tbody) return;

  const monthSelect = document.getElementById('payroll-month-select');
  const selectedMonth = monthSelect ? monthSelect.value : '2026-09';

  let emps = appData.employees || [];

  if (emps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="19" style="text-align:center; padding:35px; color:#94a3b8;">
          <i class="fa-solid fa-file-invoice-dollar" style="font-size:32px; margin-bottom:10px; display:block; opacity:0.6;"></i>
          දත්ත නොමැත — පළමුව සේවකයින් ලියාපදිංචි කර හෝ ඉහත <strong>'+ වැටුප් දත්ත ඇතුළත් කරන්න'</strong> බොත්තම ඔබා මාසික වැටුප් සටහන් කරන්න.
        </td>
      </tr>
    `;
    const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setStat('payroll-stat-basic', 'රු. 0');
    setStat('payroll-stat-gross', 'රු. 0');
    setStat('payroll-stat-epf8', 'රු. 0');
    setStat('payroll-stat-epf12', 'රු. 0');
    setStat('payroll-stat-pension', 'රු. 0');
    setStat('payroll-stat-net', 'රු. 0');
    return;
  }

  // Filter based on schedule
  if (currentPayrollFilter === 'perm') {
    emps = emps.filter(isPermanentEmp);
  } else if (currentPayrollFilter === 'nonperm') {
    emps = emps.filter(e => !isPermanentEmp(e));
  }

  let totBasic = 0, totGross = 0, totEpf8 = 0, totEpf12 = 0, totPension = 0, totNet = 0;

  tbody.innerHTML = emps.map(emp => {
    const isPerm = isPermanentEmp(emp);
    const payBadge = isPerm 
      ? '<span class="badge-pill badge-green"><i class="fa-solid fa-calendar-check"></i> ස්ථිර (25 දින)</span>'
      : '<span class="badge-pill badge-amber"><i class="fa-solid fa-calendar-day"></i> ස්ථිර නොවන (10 දින)</span>';

    // Check if entered record exists for this employee + month
    const history = appData.payrollHistory || [];
    const savedRec = history.find(r => r.empId === emp.id && r.month === selectedMonth);

    const basic = savedRec ? savedRec.basic : (emp.basicSalary || 0);
    const att = savedRec ? savedRec.att : 0;
    const allowances = savedRec ? savedRec.allowances : 0;
    const gross = basic + att + allowances;

    const epf20 = basic * 0.20;
    const epf12 = basic * 0.12;
    const epf8 = basic * 0.08;
    const pen25 = basic * 0.025;
    const pen5 = basic * 0.05;
    const etf3 = basic * 0.03;

    const advance = savedRec ? savedRec.advance : 0;
    const ded1 = savedRec ? savedRec.ded1 : 0;
    const ded2 = savedRec ? savedRec.ded2 : 0;
    const totDeductions = epf8 + pen5 + advance + ded1 + ded2;
    const otherAdd = savedRec ? savedRec.otherAdd : 0;
    const net = (gross - totDeductions) + otherAdd;

    totBasic += basic;
    totGross += gross;
    totEpf8 += epf8;
    totEpf12 += epf12;
    totPension += (pen25 + pen5);
    totNet += net;

    return `
      <tr>
        <td><strong style="color:var(--primary); font-family:monospace;">${emp.id}</strong></td>
        <td>
          <div style="font-weight:700; color:#1e1b4b;">${emp.fullName}</div>
          <div style="font-size:11px; color:#64748b;">${emp.designation}</div>
        </td>
        <td>${payBadge}</td>
        <td>රු. ${basic.toLocaleString()}</td>
        <td>රු. ${att.toLocaleString()}</td>
        <td>රු. ${allowances.toLocaleString()}</td>
        <td style="background:#f5f3ff; font-weight:700; color:#7c3aed;">රු. ${gross.toLocaleString()}</td>
        <td>රු. ${Math.round(epf20).toLocaleString()}</td>
        <td style="color:#16a34a; font-weight:700;">රු. ${Math.round(epf12).toLocaleString()}</td>
        <td style="color:#dc2626; font-weight:700;">රු. ${Math.round(epf8).toLocaleString()}</td>
        <td>රු. ${Math.round(pen25).toLocaleString()}</td>
        <td style="color:#dc2626;">රු. ${Math.round(pen5).toLocaleString()}</td>
        <td style="color:#0284c7; font-weight:700;">රු. ${Math.round(etf3).toLocaleString()}</td>
        <td>${advance > 0 ? `රු. ${advance.toLocaleString()}` : '-'}</td>
        <td>${(ded1 + ded2) > 0 ? `රු. ${(ded1 + ded2).toLocaleString()}` : '-'}</td>
        <td style="color:#dc2626; font-weight:700;">රු. ${Math.round(totDeductions).toLocaleString()}</td>
        <td>${otherAdd > 0 ? `රු. ${otherAdd.toLocaleString()}` : '-'}</td>
        <td style="background:#f0fdf4; font-weight:800; color:#15803d; font-size:12.5px;">රු. ${Math.round(net).toLocaleString()}</td>
        <td style="text-align:center; white-space:nowrap;">
          <button class="btn-smart btn-smart-primary" onclick="viewPayslipForEmp('${emp.id}', '${selectedMonth}')" title="පඩිපත බලන්න" style="padding:4px 8px; font-size:11px; margin-right:4px;">
            <i class="fa-solid fa-file-invoice"></i> පඩිපත
          </button>
          <button class="btn-smart btn-smart-light" onclick="openAddPayrollEntryModal('${emp.id}', '${selectedMonth}')" title="දත්ත ඇතුළත් / සංස්කරණය" style="padding:4px 8px; font-size:11px;">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Update Summary Stats
  const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setStat('payroll-stat-basic', `රු. ${Math.round(totBasic).toLocaleString()}`);
  setStat('payroll-stat-gross', `රු. ${Math.round(totGross).toLocaleString()}`);
  setStat('payroll-stat-epf8', `රු. ${Math.round(totEpf8).toLocaleString()}`);
  setStat('payroll-stat-epf12', `රු. ${Math.round(totEpf12).toLocaleString()}`);
  setStat('payroll-stat-pension', `රු. ${Math.round(totPension).toLocaleString()}`);
  setStat('payroll-stat-net', `රු. ${Math.round(totNet).toLocaleString()}`);
}

function openAddPayrollEntryModal(empId = '', month = '') {
  const empSelect = document.getElementById('pay-entry-emp');
  const monthInput = document.getElementById('pay-entry-month');
  if (!empSelect || !monthInput) return;

  const currentMonth = month || (document.getElementById('payroll-month-select')?.value || '2026-09');
  monthInput.value = currentMonth;

  const emps = appData.employees || [];
  empSelect.innerHTML = '<option value="">-- සේවකයෙකු තෝරන්න --</option>' +
    emps.map(e => {
      const isPerm = isPermanentEmp(e);
      const tag = isPerm ? '[ස්ථිර - 25 වන දින]' : '[ස්ථිර නොවන - 10 වන දින]';
      return `<option value="${e.id}" ${e.id === empId ? 'selected' : ''}>${e.fullName} (${e.designation}) ${tag}</option>`;
    }).join('') +
    '<option value="NEW_MANUAL" style="font-weight:bold; color:#7c3aed; border-top:1px solid #e2e8f0;">➕ නව සේවකයෙකු අතින් ඇතුළත් කරන්න (Manual Entry)</option>';

  if (empId) {
    empSelect.value = empId;
  } else if (emps.length > 0) {
    empSelect.value = emps[0].id;
  }

  onPayrollEntryEmpChange();
  openSmartModal('modal-smart-payroll-entry');
}

function onPayrollEntryEmpChange() {
  const empId = document.getElementById('pay-entry-emp')?.value;
  const month = document.getElementById('pay-entry-month')?.value || '2026-09';
  const notice = document.getElementById('pay-entry-policy-notice');
  const calcDateBadge = document.getElementById('pay-entry-calc-date');
  const manualRow = document.getElementById('pay-manual-emp-row');

  // Handle NEW_MANUAL selection
  if (empId === 'NEW_MANUAL') {
    if (manualRow) manualRow.style.display = 'block';
    if (notice) notice.innerHTML = '🟣 <strong>නව සේවකයෙකු (Manual Entry)</strong>: පහත ක්ෂේත්‍ර පුරවා සේවකයා ලියාපදිංචි කරන්න. මෙම සේවකයා ස්ථිරව පද්ධතියේ සුරකිනු ලැබේ.';
    if (calcDateBadge) {
      calcDateBadge.textContent = 'Manual Entry';
      calcDateBadge.className = 'badge-pill badge-amber';
    }
    // Clear payroll form fields for new entry
    ['pay-entry-basic','pay-entry-att','pay-entry-allowances','pay-entry-advance','pay-entry-ded1','pay-entry-ded2','pay-entry-other-add']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = 0; });
    recalculatePayrollForm1();
    return;
  }

  if (manualRow) manualRow.style.display = 'none';

  const emp = (appData.employees || []).find(e => e.id === empId);
  if (!emp) {
    if (notice) notice.innerHTML = 'කරුණාකර සේවකයෙකු තෝරන්න.';
    return;
  }

  const isPerm = isPermanentEmp(emp);
  if (isPerm) {
    if (notice) notice.innerHTML = `🟢 <strong>ස්ථිර සේවකයෙකි (Permanent Staff)</strong>: රෙගුලාසි අනුව මෙම පත්‍රිකාවේ වැටුප් ගණනය වන්නේ <strong>සෑම මසකම 25 වන දිනටය</strong>. (මීට අමතරව 10 වන දින දිරි දීමනා හිමිවේ).`;
    if (calcDateBadge) {
      calcDateBadge.textContent = 'ගෙවීම් දිනය: 25 වන දින';
      calcDateBadge.className = 'badge-pill badge-green';
    }
  } else {
    if (notice) notice.innerHTML = `🟡 <strong>ස්ථිර නොවන සේවකයෙකි (Probation / Contract)</strong>: රෙගුලාසි අනුව මෙම පත්‍රිකාවේ වැටුප් ගණනය වන්නේ <strong>සෑම මසකම 10 වන දිනටය</strong>. (දිරි දීමනා හිමි නොවේ).`;
    if (calcDateBadge) {
      calcDateBadge.textContent = 'ගෙවීම් දිනය: 10 වන දින';
      calcDateBadge.className = 'badge-pill badge-amber';
    }
  }

  // Check if saved record exists
  const history = appData.payrollHistory || [];
  const rec = history.find(r => r.empId === emp.id && r.month === month);

  document.getElementById('pay-entry-basic').value = rec ? rec.basic : (emp.basicSalary || 0);
  document.getElementById('pay-entry-att').value = rec ? rec.att : 0;
  document.getElementById('pay-entry-allowances').value = rec ? rec.allowances : 0;
  document.getElementById('pay-entry-advance').value = rec ? rec.advance : 0;
  document.getElementById('pay-entry-ded1').value = rec ? rec.ded1 : 0;
  document.getElementById('pay-entry-ded2').value = rec ? rec.ded2 : 0;
  document.getElementById('pay-entry-other-add').value = rec ? rec.otherAdd : 0;

  recalculatePayrollForm1();
}

function recalculatePayrollForm1() {
  const basic = parseFloat(document.getElementById('pay-entry-basic')?.value) || 0;
  const att = parseFloat(document.getElementById('pay-entry-att')?.value) || 0;
  const allowances = parseFloat(document.getElementById('pay-entry-allowances')?.value) || 0;
  const advance = parseFloat(document.getElementById('pay-entry-advance')?.value) || 0;
  const ded1 = parseFloat(document.getElementById('pay-entry-ded1')?.value) || 0;
  const ded2 = parseFloat(document.getElementById('pay-entry-ded2')?.value) || 0;
  const otherAdd = parseFloat(document.getElementById('pay-entry-other-add')?.value) || 0;

  const gross = basic + att + allowances;
  const epf20 = basic * 0.20;
  const epf12 = basic * 0.12;
  const epf8 = basic * 0.08;
  const pen25 = basic * 0.025;
  const pen5 = basic * 0.05;
  const etf3 = basic * 0.03;
  const totDed = epf8 + pen5 + advance + ded1 + ded2;
  const net = (gross - totDed) + otherAdd;

  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setT('pay-calc-gross', `රු. ${gross.toLocaleString()}`);
  setT('pay-calc-epf20', `රු. ${Math.round(epf20).toLocaleString()}`);
  setT('pay-calc-epf12', `රු. ${Math.round(epf12).toLocaleString()}`);
  setT('pay-calc-epf8', `රු. ${Math.round(epf8).toLocaleString()}`);
  setT('pay-calc-pen25', `රු. ${Math.round(pen25).toLocaleString()}`);
  setT('pay-calc-pen5', `රු. ${Math.round(pen5).toLocaleString()}`);
  setT('pay-calc-etf3', `රු. ${Math.round(etf3).toLocaleString()}`);
  setT('pay-calc-tot-ded', `රු. ${Math.round(totDed).toLocaleString()}`);
  setT('pay-calc-net', `රු. ${Math.round(net).toLocaleString()}`);
}

async function savePayrollEntry(e) {
  e.preventDefault();
  let empId = document.getElementById('pay-entry-emp').value;
  const month = document.getElementById('pay-entry-month').value;
  if (!empId || !month) return;

  // Handle manual new employee creation
  if (empId === 'NEW_MANUAL') {
    const manualId = document.getElementById('pay-manual-id')?.value?.trim();
    const manualName = document.getElementById('pay-manual-name')?.value?.trim();
    const manualDesig = document.getElementById('pay-manual-desig')?.value?.trim();
    const manualType = document.getElementById('pay-manual-type')?.value?.trim() || 'ස්ථිර නොවන';

    if (!manualId || !manualName) {
      alert('සේවා අංකය සහ සම්පූර්ණ නම ඇතුළත් කරන්න!');
      return;
    }

    if (!appData.employees) appData.employees = [];
    const existing = appData.employees.find(emp => emp.id === manualId);
    if (!existing) {
      appData.employees.push({
        id: manualId,
        fullName: manualName,
        designation: manualDesig || 'සේවකයා',
        employmentType: manualType,
        basicSalary: parseFloat(document.getElementById('pay-entry-basic')?.value) || 0,
        department: 'සාමාන්‍ය',
        branch: 'ප්‍රධාන',
        startDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        createdAt: new Date().toISOString()
      });
    }
    empId = manualId;
  }

  const basic = parseFloat(document.getElementById('pay-entry-basic').value) || 0;
  const att = parseFloat(document.getElementById('pay-entry-att').value) || 0;
  const allowances = parseFloat(document.getElementById('pay-entry-allowances').value) || 0;
  const advance = parseFloat(document.getElementById('pay-entry-advance').value) || 0;
  const ded1 = parseFloat(document.getElementById('pay-entry-ded1').value) || 0;
  const ded2 = parseFloat(document.getElementById('pay-entry-ded2').value) || 0;
  const otherAdd = parseFloat(document.getElementById('pay-entry-other-add').value) || 0;

  if (!appData.payrollHistory) appData.payrollHistory = [];

  // Remove existing record for this emp+month
  appData.payrollHistory = appData.payrollHistory.filter(r => !(r.empId === empId && r.month === month));

  appData.payrollHistory.push({
    id: 'PAY-' + Date.now(),
    empId,
    month,
    basic,
    att,
    allowances,
    advance,
    ded1,
    ded2,
    otherAdd,
    updatedAt: new Date().toISOString()
  });

  await persistData();
  closeSmartModal('modal-smart-payroll-entry');
  renderPayrollModule();
  alert(currentLang === 'si' ? 'වැටුප් දත්ත සාර්ථකව සුරකින ලදී!' : 'Payroll data saved successfully!');
}

// =========================================================================
// FORM 2: INCENTIVE ALLOWANCE CRITERIA MATRIX (PERMANENT STAFF ONLY)
// =========================================================================
const incentiveCriteriaList = [
  { id: 'c1', num: '01', name: 'මාසික ලාභය මත දිරි දීමනාව' },
  { id: 'c2', num: '02', name: 'උපරිම සේවා කාලය' },
  { id: 'c3', num: '03', name: 'දෛනික දීමනා' },
  { id: 'c4', num: '04', name: 'කල්පසු ණය ක්‍රියා මාර්ග' },
  { id: 'c5', num: '05', name: 'යතුරු ධාරණය' },
  { id: 'c6', num: '06', name: 'කාරක සභා තීරණ ක්‍රියාත්මක කිරීම' },
  { id: 'c7', num: '07', name: 'පිරිසිදු කිරීමේ දීමනා' },
  { id: 'c8', num: '08', name: 'ලිපිගොනු පවත්වාගෙන යාමේ දීමනා' },
  { id: 'c9', num: '09', name: 'උපකරණ භාරකාරීත්වය හා නඩත්තුව' },
  { id: 'c10', num: '10', name: 'නිල ඇඳුම් භාවිතය' },
  { id: 'c11', num: '11', name: 'ප්‍රමාද නොවීම්' },
  { id: 'c12', num: '12', name: 'විශේෂිත දිනයන්හි පැමිණීමේ දීමනා' },
  { id: 'c13', num: '13', name: 'අමතර දිරි දීමනා 1' },
  { id: 'c14', num: '14', name: 'අමතර දිරි දීමනා 2' }
];

function renderIncentivesTable() {
  const wrapper = document.getElementById('incentive-table-wrapper');
  if (!wrapper) return;

  const monthSelect = document.getElementById('incentive-month-select');
  const selectedMonth = monthSelect ? monthSelect.value : '2026-09';

  // Only Permanent Staff get Form 2!
  const permEmps = (appData.employees || []).filter(isPermanentEmp);

  if (permEmps.length === 0) {
    wrapper.innerHTML = `
      <div style="text-align:center; padding:40px; color:#94a3b8;">
        <i class="fa-solid fa-award" style="font-size:36px; margin-bottom:12px; display:block; opacity:0.6; color:#7c3aed;"></i>
        <h4 style="font-size:15px; font-weight:700; color:#1e1b4b; margin-bottom:6px;">ස්ථිර සේවකයින් ලියාපදිංචි කර නොමැත</h4>
        <p style="font-size:12.5px; color:#64748b;">රෙගුලාසි අනුව දිරි දීමනා හිමිවන්නේ <strong>ස්ථිර සේවකයින්ට පමණි</strong>. පළමුව සේවකයින් ස්ථිර සේවා තත්වයෙන් ලියාපදිංචි කරන්න.</p>
      </div>
    `;
    return;
  }

  const incRecords = appData.incentiveRecords || [];

  let html = `
    <table class="smart-table" style="font-size:12px; width:100%; border:1px solid #e2e8f0;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="width:340px; text-align:left; padding:12px 16px;">සේවක දිරි දීමනා නිර්ණායක (Form 2)</th>
          ${permEmps.map(emp => `
            <th style="text-align:center; min-width:140px; padding:12px 8px;">
              <div style="color:#7c3aed; font-weight:800;">${emp.fullName}</div>
              <div style="font-size:11px; color:#64748b; font-weight:normal;">${emp.designation}</div>
              <div style="margin-top:6px;">
                <button class="btn-smart btn-smart-light" onclick="openAddIncentiveEntryModal('${emp.id}', '${selectedMonth}')" style="padding:2px 8px; font-size:10px;">
                  <i class="fa-solid fa-pen"></i> දත්ත යොදන්න
                </button>
              </div>
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  // Render 14 Criteria Rows
  incentiveCriteriaList.forEach(crit => {
    html += `
      <tr>
        <td style="font-weight:700; color:#1e1b4b; background:#fafafa; padding:8px 16px;">
          ${crit.num}. ${crit.name}
        </td>
        ${permEmps.map(emp => {
          const rec = incRecords.find(r => r.empId === emp.id && r.month === selectedMonth);
          const val = rec && rec.criteria ? (rec.criteria[crit.id] || 0) : 0;
          return `<td style="text-align:center; padding:8px;">${val > 0 ? 'රු. ' + val.toLocaleString() : '-'}</td>`;
        }).join('')}
      </tr>
    `;
  });

  // Bottom Total Row: දීමනා එකතුව
  html += `
      <tr style="background:#ede9fe; font-weight:800; border-top:2px solid #7c3aed;">
        <td style="font-size:13.5px; color:#5b21b6; padding:12px 16px;">දීමනා එකතුව (Total Incentive Allowance):</td>
        ${permEmps.map(emp => {
          const rec = incRecords.find(r => r.empId === emp.id && r.month === selectedMonth);
          let sum = 0;
          if (rec && rec.criteria) {
            Object.values(rec.criteria).forEach(v => { sum += (parseFloat(v) || 0); });
          }
          return `<td style="text-align:center; font-size:14px; color:#7c3aed; padding:12px 8px;">රු. ${sum.toLocaleString()}</td>`;
        }).join('')}
      </tr>
    </tbody>
  </table>
  `;

  wrapper.innerHTML = html;
}

function openAddIncentiveEntryModal(empId = '', month = '') {
  const empSelect = document.getElementById('inc-entry-emp');
  const monthInput = document.getElementById('inc-entry-month');
  if (!empSelect || !monthInput) return;

  const currentMonth = month || (document.getElementById('incentive-month-select')?.value || '2026-09');
  monthInput.value = currentMonth;

  // Only Permanent Employees
  const permEmps = (appData.employees || []).filter(isPermanentEmp);
  empSelect.innerHTML = '<option value="">-- ස්ථිර සේවකයෙකු තෝරන්න --</option>' +
    permEmps.map(e => `<option value="${e.id}" ${e.id === empId ? 'selected' : ''}>${e.fullName} (${e.designation})</option>`).join('') +
    '<option value="NEW_MANUAL" style="font-weight:bold; color:#7c3aed;">➕ නව ස්ථිර සේවකයෙකු අතින් ඇතුළත් කරන්න (Manual Staff)</option>';

  if (empId) {
    empSelect.value = empId;
  } else if (permEmps.length > 0) {
    empSelect.value = permEmps[0].id;
  }

  onIncentiveEmpChange();
  openSmartModal('modal-smart-incentive-entry');
}

function onIncentiveEmpChange() {
  const empId = document.getElementById('inc-entry-emp')?.value;
  const month = document.getElementById('inc-entry-month')?.value || '2026-09';
  const manualRow = document.getElementById('inc-manual-emp-row');

  if (!empId) return;

  // Handle NEW_MANUAL selection
  if (empId === 'NEW_MANUAL') {
    if (manualRow) manualRow.style.display = 'block';
    // Clear all criteria for fresh entry
    incentiveCriteriaList.forEach(c => {
      const input = document.getElementById('inc-' + c.id);
      if (input) input.value = 0;
    });
    recalculateIncentiveTotal();
    return;
  }

  if (manualRow) manualRow.style.display = 'none';

  const incRecords = appData.incentiveRecords || [];
  const rec = incRecords.find(r => r.empId === empId && r.month === month);

  document.getElementById('inc-meta-profit').value = rec?.metaProfit || '';
  document.getElementById('inc-meta-recovery').value = rec?.metaRecovery || '';

  incentiveCriteriaList.forEach(c => {
    const input = document.getElementById('inc-' + c.id);
    if (input) {
      input.value = rec && rec.criteria ? (rec.criteria[c.id] || 0) : 0;
    }
  });

  recalculateIncentiveTotal();
}

function recalculateIncentiveTotal() {
  let total = 0;
  incentiveCriteriaList.forEach(c => {
    const input = document.getElementById('inc-' + c.id);
    if (input) {
      total += (parseFloat(input.value) || 0);
    }
  });

  const totEl = document.getElementById('inc-calc-total');
  if (totEl) totEl.textContent = `රු. ${total.toLocaleString()}`;
}

async function saveIncentiveEntry(e) {
  e.preventDefault();
  let empId = document.getElementById('inc-entry-emp').value;
  const month = document.getElementById('inc-entry-month').value;
  if (!empId || !month) return;

  // Handle manual new permanent employee creation
  if (empId === 'NEW_MANUAL') {
    const manualId = document.getElementById('inc-manual-id')?.value?.trim();
    const manualName = document.getElementById('inc-manual-name')?.value?.trim();
    const manualDesig = document.getElementById('inc-manual-desig')?.value?.trim();

    if (!manualId || !manualName) {
      alert('සේවා අංකය සහ සම්පූර්ණ නම ඇතුළත් කරන්න!');
      return;
    }

    if (!appData.employees) appData.employees = [];
    const existing = appData.employees.find(emp => emp.id === manualId);
    if (!existing) {
      appData.employees.push({
        id: manualId,
        fullName: manualName,
        designation: manualDesig || 'සේවකයා',
        employmentType: 'ස්ථිර (Permanent)',
        basicSalary: 0,
        department: 'සාමාන්‍ය',
        branch: 'ප්‍රධාන',
        startDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        createdAt: new Date().toISOString()
      });
    }
    empId = manualId;
  }

  const criteria = {};
  incentiveCriteriaList.forEach(c => {
    const input = document.getElementById('inc-' + c.id);
    criteria[c.id] = parseFloat(input?.value) || 0;
  });

  if (!appData.incentiveRecords) appData.incentiveRecords = [];
  appData.incentiveRecords = appData.incentiveRecords.filter(r => !(r.empId === empId && r.month === month));

  appData.incentiveRecords.push({
    id: 'INC-' + Date.now(),
    empId,
    month,
    metaProfit: document.getElementById('inc-meta-profit')?.value || '',
    metaRecovery: document.getElementById('inc-meta-recovery')?.value || '',
    criteria,
    updatedAt: new Date().toISOString()
  });

  await persistData();
  closeSmartModal('modal-smart-incentive-entry');
  renderIncentivesTable();
  alert(currentLang === 'si' ? 'දිරි දීමනා සාර්ථකව සුරකින ලදී!' : 'Incentives saved successfully!');
}

// =========================================================================
// OFFICIAL SHEET & PAYSLIP PRINTING MATCHING PHYSICAL FORMS
// =========================================================================

function printForm1OfficialSheet() {
  const month = document.getElementById('payroll-month-select')?.value || '2026-09';
  const emps = appData.employees || [];
  const history = appData.payrollHistory || [];

  const titleEl = document.getElementById('sheet-print-title');
  if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-file-invoice-dollar" style="color:#7c3aed;"></i> නිල මාසික වැටුප් ලේඛනය (Form 1 - Monthly Salary Sheet)';

  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  content.innerHTML = `
    <div style="background:#fff; font-family:'Segoe UI',sans-serif; color:#000; min-width:980px;">
      <!-- GSCS Boxed Header matching media_1790236815371.png -->
      <div style="border:2px solid #000; padding:12px; margin-bottom:16px; text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:20px;">
          <img src="images/gscs_logo.png" alt="GSCS Logo" style="height:55px;">
          <div>
            <h3 style="font-size:16px; font-weight:800; margin:0 0 2px;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</h3>
            <div style="font-size:13px; font-weight:700; letter-spacing:0.5px;">GALAPITIYAGAMA THRIFT & CREDIT CO-OPERATIVE SOCIETY</div>
            <div style="font-size:11.5px; margin-top:4px;">
              <strong>Reg No: කුලි/395</strong> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Reg Date: 1987/03/24</strong>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:12px; font-weight:700;">
        <span>මාසික වැටුප්, EPF/ETF හා විශ්‍රාම අරමුදල් ලේඛනය - ${month}</span>
        <span>මුද්‍රණ දිනය: ${new Date().toLocaleDateString('en-GB')}</span>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th rowspan="2" style="padding:6px 4px;">දිනය</th>
            <th rowspan="2" style="padding:6px 4px;">සේවා අංකය & නම</th>
            <th rowspan="2" style="padding:6px 4px;">මූලික වැටුප</th>
            <th rowspan="2" style="padding:6px 4px;">පැමිණීමේ දීමනාව</th>
            <th rowspan="2" style="padding:6px 4px;">දීමනා</th>
            <th rowspan="2" style="padding:6px 4px;">එකතුව</th>
            <th rowspan="2" style="padding:6px 4px;">අර්ථසාධක 20%</th>
            <th colspan="2" style="padding:4px;">අර්ථසාධක</th>
            <th colspan="2" style="padding:4px;">විශ්‍රාම</th>
            <th rowspan="2" style="padding:6px 4px;">සේවක භාරකාර 3%</th>
            <th rowspan="2" style="padding:6px 4px;">අඩුකිරීම් එකතුව</th>
            <th rowspan="2" style="padding:6px 4px;">අත්තිකාරම්</th>
            <th colspan="2" style="padding:4px;">වෙනත් අඩු</th>
            <th rowspan="2" style="padding:6px 4px;">වෙනත් දීමනා</th>
            <th rowspan="2" style="padding:6px 4px; font-weight:800;">ශුද්ධ වැටුප</th>
            <th rowspan="2" style="padding:6px 4px; width:70px;">අත්සන</th>
          </tr>
          <tr style="background:#f2f2f2; font-size:9px;">
            <th style="padding:4px;">සේවායෝජක 12%</th>
            <th style="padding:4px;">සේවක 8%</th>
            <th style="padding:4px;">2.5%</th>
            <th style="padding:4px;">5%</th>
            <th style="padding:4px;">1</th>
            <th style="padding:4px;">2</th>
          </tr>
        </thead>
        <tbody>
          ${emps.map(emp => {
            const isPerm = isPermanentEmp(emp);
            const dateStr = isPerm ? `${month}-25` : `${month}-10`;
            const rec = history.find(r => r.empId === emp.id && r.month === month);
            const basic = rec ? rec.basic : (emp.basicSalary || 0);
            const att = rec ? rec.att : 0;
            const allowances = rec ? rec.allowances : 0;
            const gross = basic + att + allowances;
            const epf20 = basic * 0.20;
            const epf12 = basic * 0.12;
            const epf8 = basic * 0.08;
            const pen25 = basic * 0.025;
            const pen5 = basic * 0.05;
            const etf3 = basic * 0.03;
            const advance = rec ? rec.advance : 0;
            const ded1 = rec ? rec.ded1 : 0;
            const ded2 = rec ? rec.ded2 : 0;
            const totDed = epf8 + pen5 + advance + ded1 + ded2;
            const otherAdd = rec ? rec.otherAdd : 0;
            const net = (gross - totDed) + otherAdd;

            return `
              <tr>
                <td style="padding:5px 2px;">${dateStr}</td>
                <td style="text-align:left; padding:5px 4px;"><strong>${emp.id}</strong> - ${emp.fullName}</td>
                <td style="padding:5px 2px;">${basic.toLocaleString()}</td>
                <td style="padding:5px 2px;">${att > 0 ? att.toLocaleString() : '-'}</td>
                <td style="padding:5px 2px;">${allowances > 0 ? allowances.toLocaleString() : '-'}</td>
                <td style="padding:5px 2px; font-weight:bold;">${gross.toLocaleString()}</td>
                <td style="padding:5px 2px;">${Math.round(epf20).toLocaleString()}</td>
                <td style="padding:5px 2px;">${Math.round(epf12).toLocaleString()}</td>
                <td style="padding:5px 2px;">${Math.round(epf8).toLocaleString()}</td>
                <td style="padding:5px 2px;">${Math.round(pen25).toLocaleString()}</td>
                <td style="padding:5px 2px;">${Math.round(pen5).toLocaleString()}</td>
                <td style="padding:5px 2px;">${Math.round(etf3).toLocaleString()}</td>
                <td style="padding:5px 2px; font-weight:bold;">${Math.round(totDed).toLocaleString()}</td>
                <td style="padding:5px 2px;">${advance > 0 ? advance.toLocaleString() : '-'}</td>
                <td style="padding:5px 2px;">${ded1 > 0 ? ded1.toLocaleString() : '-'}</td>
                <td style="padding:5px 2px;">${ded2 > 0 ? ded2.toLocaleString() : '-'}</td>
                <td style="padding:5px 2px;">${otherAdd > 0 ? otherAdd.toLocaleString() : '-'}</td>
                <td style="padding:5px 2px; font-weight:bold; font-size:11px;">${Math.round(net).toLocaleString()}</td>
                <td style="padding:5px 2px;"></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11px; text-align:center;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (Internal Audit)</div>
        <div>...................................<br>අනුමත කළේ (General Manager / Chairman)</div>
      </div>
    </div>
  `;

  openSmartModal('modal-smart-sheet-print');
}

function printForm2OfficialSheet() {
  const month = document.getElementById('incentive-month-select')?.value || '2026-09';
  const permEmps = (appData.employees || []).filter(isPermanentEmp);
  const incRecords = appData.incentiveRecords || [];

  const titleEl = document.getElementById('sheet-print-title');
  if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-award" style="color:#7c3aed;"></i> නිල සේවක දිරි දීමනා නිර්ණායක ලේඛනය (Form 2)';

  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  content.innerHTML = `
    <div style="background:#fff; font-family:'Segoe UI',sans-serif; color:#000; min-width:850px;">
      <!-- GSCS Boxed Header matching media_1790236815376.png -->
      <div style="border:2px solid #000; padding:12px; margin-bottom:16px; text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:20px;">
          <img src="images/gscs_logo.png" alt="GSCS Logo" style="height:55px;">
          <div>
            <h3 style="font-size:16px; font-weight:800; margin:0 0 2px;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</h3>
            <div style="font-size:13px; font-weight:700; letter-spacing:0.5px;">GALAPITIYAGAMA THRIFT & CREDIT CO-OPERATIVE SOCIETY</div>
            <div style="font-size:11.5px; margin-top:4px;">
              <strong>Reg No: කුලි/395</strong> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Reg Date: 1987/03/24</strong>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:12px; font-weight:700;">
        <span>සේවක දිරි දීමනා නිර්ණායක පත්‍රිකාව (ස්ථිර සේවකයින් සඳහා) - ${month} (10 වන දින)</span>
        <span>මුද්‍රණ දිනය: ${new Date().toLocaleDateString('en-GB')}</span>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; text-align:center;">
            <th style="padding:8px 12px; text-align:left; width:340px;">සේවක දිරි දීමනා නිර්ණායක</th>
            ${permEmps.map(e => `<th style="padding:8px;">${e.fullName}<br><span style="font-weight:normal; font-size:10px;">${e.designation}</span></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${incentiveCriteriaList.map(crit => `
            <tr>
              <td style="padding:6px 12px; font-weight:bold;">${crit.num}. ${crit.name}</td>
              ${permEmps.map(emp => {
                const rec = incRecords.find(r => r.empId === emp.id && r.month === month);
                const val = rec && rec.criteria ? (rec.criteria[crit.id] || 0) : 0;
                return `<td style="padding:6px; text-align:center;">${val > 0 ? val.toLocaleString() : '-'}</td>`;
              }).join('')}
            </tr>
          `).join('')}
          <tr style="background:#f2f2f2; font-weight:bold; font-size:12px;">
            <td style="padding:10px 12px;">දීමනා එකතුව</td>
            ${permEmps.map(emp => {
              const rec = incRecords.find(r => r.empId === emp.id && r.month === month);
              let sum = 0;
              if (rec && rec.criteria) {
                Object.values(rec.criteria).forEach(v => { sum += (parseFloat(v) || 0); });
              }
              return `<td style="padding:10px; text-align:center;">${sum.toLocaleString()}</td>`;
            }).join('')}
          </tr>
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11px; text-align:center;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (Internal Audit)</div>
        <div>...................................<br>අනුමත කළේ (General Manager / Chairman)</div>
      </div>
    </div>
  `;

  openSmartModal('modal-smart-sheet-print');
}

function viewPayslipForEmp(empId, month = '') {
  const emp = (appData.employees || []).find(e => e.id === empId);
  if (!emp) return;

  const currentMonth = month || (document.getElementById('payroll-month-select')?.value || '2026-09');
  const isPerm = isPermanentEmp(emp);

  const history = appData.payrollHistory || [];
  const rec = history.find(r => r.empId === emp.id && r.month === currentMonth);

  const basic = rec ? rec.basic : (emp.basicSalary || 0);
  const att = rec ? rec.att : 0;
  const allowances = rec ? rec.allowances : 0;
  const gross = basic + att + allowances;

  const epf20 = basic * 0.20;
  const epf12 = basic * 0.12;
  const epf8 = basic * 0.08;
  const pen25 = basic * 0.025;
  const pen5 = basic * 0.05;
  const etf3 = basic * 0.03;

  const advance = rec ? rec.advance : 0;
  const ded1 = rec ? rec.ded1 : 0;
  const ded2 = rec ? rec.ded2 : 0;
  const totDed = epf8 + pen5 + advance + ded1 + ded2;
  const otherAdd = rec ? rec.otherAdd : 0;
  const net = (gross - totDed) + otherAdd;

  // Check incentive if permanent
  let incTotal = 0;
  let incRec = null;
  if (isPerm) {
    incRec = (appData.incentiveRecords || []).find(r => r.empId === emp.id && r.month === currentMonth);
    if (incRec && incRec.criteria) {
      Object.values(incRec.criteria).forEach(v => { incTotal += (parseFloat(v) || 0); });
    }
  }

  const renderArea = document.getElementById('payslip-modal-content');
  if (!renderArea) return;

  renderArea.innerHTML = `
    <div style="background:#fff; border:2px solid #000; padding:24px; border-radius:12px; font-family:'Segoe UI',sans-serif;">
      <!-- GSCS Official Boxed Header matching physical form -->
      <div style="border:2px solid #000; padding:10px; margin-bottom:16px; text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:16px;">
          <img src="images/gscs_logo.png" alt="GSCS Logo" style="height:50px;">
          <div>
            <h3 style="font-size:15px; font-weight:800; margin:0;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</h3>
            <div style="font-size:12px; font-weight:700;">GALAPITIYAGAMA THRIFT & CREDIT CO-OPERATIVE SOCIETY</div>
            <div style="font-size:11px; margin-top:2px;">Reg No: කුලි/395 &nbsp;&nbsp;|&nbsp;&nbsp; Reg Date: 1987/03/24</div>
          </div>
        </div>
      </div>

      <!-- Service Details matching form top lines -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; border-bottom:1.5px solid #000; padding-bottom:12px; margin-bottom:14px; font-size:12.5px;">
        <div>
          <div><strong>සේවා අංකය:</strong> ${emp.id}</div>
          <div style="margin-top:4px;"><strong>තනතුර:</strong> ${emp.designation}</div>
        </div>
        <div>
          <div><strong>සම්පූර්ණ නම:</strong> ${emp.fullName}</div>
          <div style="margin-top:4px;"><strong>ශ්‍රේණිය / සේවා තත්වය:</strong> ${emp.employmentType || (isPerm ? 'ස්ථිර (Permanent)' : 'ස්ථිර නොවන')}</div>
        </div>
      </div>

      <div style="text-align:center; font-weight:800; font-size:13px; color:#1e1b4b; margin-bottom:12px; background:#f1f5f9; padding:4px; border-radius:6px;">
        නිල මාසික වැටුප් පත්‍රිකාව (Form 1) - ${currentMonth} (${isPerm ? 'ගෙවීම් දිනය: 25 වන දින' : 'ගෙවීම් දිනය: 10 වන දින'})
      </div>

      <!-- Form 1 Breakdown Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; font-size:12px;">
        <div style="border:1px solid #cbd5e1; border-radius:8px; padding:10px;">
          <h5 style="color:#166534; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">උපැයීම් (Earnings)</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>මූලික වැටුප:</span><span>රු. ${basic.toLocaleString()}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>පැමිණීමේ දීමනාව:</span><span>රු. ${att.toLocaleString()}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සාමාන්‍ය දීමනා:</span><span>රු. ${allowances.toLocaleString()}</span></div>
          ${otherAdd > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>වෙනත් දීමනා:</span><span>රු. ${otherAdd.toLocaleString()}</span></div>` : ''}
          <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px dashed #cbd5e1; padding-top:6px; margin-top:6px; color:#166534;">
            <span>මුළු එකතුව (Gross):</span><span>රු. ${gross.toLocaleString()}</span>
          </div>
        </div>

        <div style="border:1px solid #cbd5e1; border-radius:8px; padding:10px;">
          <h5 style="color:#dc2626; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">අඩුකිරීම් (Deductions)</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සේවක EPF 8%:</span><span>රු. ${Math.round(epf8).toLocaleString()}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>විශ්‍රාම අරමුදල 5%:</span><span>රු. ${Math.round(pen5).toLocaleString()}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>අත්තිකාරම්:</span><span>${advance > 0 ? 'රු. ' + advance.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>වෙනත් අඩුකිරීම්:</span><span>${(ded1 + ded2) > 0 ? 'රු. ' + (ded1 + ded2).toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px dashed #cbd5e1; padding-top:6px; margin-top:6px; color:#dc2626;">
            <span>අඩුකිරීම් එකතුව:</span><span>රු. ${Math.round(totDed).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <!-- Society Contributions Summary -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 12px; margin-bottom:14px; font-size:11px; color:#475569; display:flex; justify-content:space-between;">
        <span><strong>අර්ථසාධක 20%:</strong> රු. ${Math.round(epf20).toLocaleString()}</span>
        <span><strong>සේවායෝජක EPF 12%:</strong> රු. ${Math.round(epf12).toLocaleString()}</span>
        <span><strong>සේවායෝජක ETF 3%:</strong> රු. ${Math.round(etf3).toLocaleString()}</span>
        <span><strong>විශ්‍රාම 2.5%:</strong> රු. ${Math.round(pen25).toLocaleString()}</span>
      </div>

      <!-- Net Salary Box -->
      <div style="background:#f0fdf4; border:2px solid #16a34a; border-radius:10px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <strong style="font-size:13.5px; color:#166534;">ශුද්ධ වැටුප (NET SALARY PAYABLE - ${isPerm ? '25 වන දින' : '10 වන දින'}):</strong>
        <span style="font-size:18px; font-weight:800; color:#15803d; font-family:monospace;">රු. ${Math.round(net).toLocaleString()}</span>
      </div>

      <!-- Form 2 Incentive Section for Permanent Staff -->
      ${isPerm ? `
        <div style="border:1.5px dashed #7c3aed; background:#faf5ff; border-radius:10px; padding:12px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:#6b21a8; font-size:12.5px;">🏆 සේවක දිරි දීමනා පත්‍රිකාව (Form 2 - 10 වන දින ගෙවීම):</strong>
            <span style="font-weight:800; color:#7c3aed; font-size:14px;">රු. ${incTotal.toLocaleString()}</span>
          </div>
          <div style="font-size:11px; color:#6b21a8;">
            මෙම දිරි දීමනාව සෑම මසකම 10 වන දිනට නියමිත නිර්ණායක 14 ට අනුව වෙනම ගණනය කර ලබා දෙනු ලැබේ.
          </div>
        </div>
      ` : ''}

      <div style="display:flex; justify-content:space-between; margin-top:28px; font-size:11px; color:#475569; text-align:center;">
        <div>...................................<br>සකස් කළේ (Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (Audit)</div>
        <div>...................................<br>සේවක අත්සන (Signature)</div>
      </div>
    </div>
  `;

  openSmartModal('modal-smart-payslip');
}

// =========================================================================
// 7. APPRAISALS & SATISFACTION
// =========================================================================
function renderAppraisalModule() {
  const tbody = document.querySelector('#table-appraisal-body');
  if (!tbody) return;

  // Initialize seed appraisals if empty
  if (!appData.appraisals || appData.appraisals.length === 0) {
    appData.appraisals = [
      {
        id: "APR-2026-001",
        employeeId: "EMP-001",
        employeeName: "කේ. ආර්. විජේසුන්දර",
        designation: "General Manager",
        period: "2025/2026 වාර්ෂික ඇගයීම",
        date: "2026-03-31",
        scores: { taskExecution: 24, creditRecovery: 23, customerCare: 19, teamwork: 14, attendance: 14 },
        totalScore: 94,
        grade: "Grade A - විශිෂ්ටයි",
        incrementRecommended: true,
        remarks: "කළමනාකාරීත්ව කාර්යක්ෂමතාව සහ ණය අයකර ගැනීමේ ඉලක්ක ඉහළින්ම සාක්ෂාත් කර ඇත."
      },
      {
        id: "APR-2026-002",
        employeeId: "EMP-002",
        employeeName: "එස්. බී. හේරත්",
        designation: "ප්‍රධාන ණය නිලධාරී",
        period: "2025/2026 වාර්ෂික ඇගයීම",
        date: "2026-03-31",
        scores: { taskExecution: 22, creditRecovery: 21, customerCare: 17, teamwork: 13, attendance: 14 },
        totalScore: 87,
        grade: "Grade A - විශිෂ්ටයි",
        incrementRecommended: true,
        remarks: "ණය තක්සේරු කටයුතු සහ ක්ෂේත්‍ර ණය අයවීම් ප්‍රගතිය ඉතා සතුටුදායකයි."
      },
      {
        id: "APR-2026-003",
        employeeId: "EMP-003",
        employeeName: "ඩබ්. ඒ. නිමල් පෙරේරා",
        designation: "ගිණුම් සහකාර නිලධාරී",
        period: "2025/2026 වාර්ෂික ඇගයීම",
        date: "2026-03-31",
        scores: { taskExecution: 18, creditRecovery: 18, customerCare: 15, teamwork: 12, attendance: 13 },
        totalScore: 76,
        grade: "Grade B - ඉතා හොඳයි",
        incrementRecommended: true,
        remarks: "ගිණුම්කරණ කාර්යයන් යහපත්ය. IT / Excel පුහුණුවට යොමු කිරීමට නිර්දේශ කෙරේ."
      }
    ];
  }

  const appraisals = appData.appraisals || [];

  // Update Stats Counters
  const elTotal = document.getElementById('stat-appraisal-total');
  const elGradeA = document.getElementById('stat-appraisal-grade-a');
  const elGradeB = document.getElementById('stat-appraisal-grade-b');
  const elIncs = document.getElementById('stat-appraisal-increments');

  if (elTotal) elTotal.textContent = appraisals.length;
  if (elGradeA) elGradeA.textContent = appraisals.filter(a => a.totalScore >= 85).length;
  if (elGradeB) elGradeB.textContent = appraisals.filter(a => a.totalScore >= 70 && a.totalScore < 85).length;
  if (elIncs) elIncs.textContent = appraisals.filter(a => a.incrementRecommended).length;

  if (appraisals.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding:30px; color:#94a3b8;">
          <i class="fa-solid fa-chart-line" style="font-size:28px; margin-bottom:8px; display:block; opacity:0.6;"></i>
          කාර්යසාධන ඇගයීම් වාර්තා නොමැත — "+ නව කාර්යසාධන ඇගයීමක්" ක්ලික් කර ඇතුළත් කරන්න
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = appraisals.map(a => `
      <tr>
        <td><strong style="color:#7c3aed;">${a.id}</strong></td>
        <td>
          <div style="font-weight:700; color:#1e1b4b;">${a.employeeName}</div>
          <div style="font-size:11px; color:#64748b;">${a.designation || 'සේවක සාමාජික'}</div>
        </td>
        <td><span class="badge-pill badge-purple" style="font-size:11px;">${a.period}</span></td>
        <td>${a.date}</td>
        <td><strong style="color:#10b981; font-size:15px;">${a.totalScore} / 100</strong></td>
        <td>
          <span class="badge-pill ${a.totalScore >= 85 ? 'badge-green' : (a.totalScore >= 70 ? 'badge-purple' : 'badge-orange')}">
            ${a.grade}
          </span>
        </td>
        <td>${a.incrementRecommended ? '<span class="badge-pill badge-green"><i class="fa-solid fa-check"></i> නිර්දේශිතයි</span>' : '<span class="badge-pill badge-red">නැත</span>'}</td>
        <td><span style="font-size:12px; color:#475569; max-width:250px; display:block;">${a.remarks}</span></td>
        <td>
          <button class="btn-smart" onclick="deleteAppraisal('${a.id}')" style="padding:4px 8px; font-size:11px; background:#ef4444; color:#fff; border:none; border-radius:6px;" title="ඉවත් කරන්න">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  const empSelect = document.getElementById('appraisal-emp-select');
  if (empSelect) {
    empSelect.innerHTML = (appData.employees || []).map(e => `<option value="${e.id}">${e.fullName} (${e.designation})</option>`).join('');
  }
}

function openAddAppraisalModal() {
  const empSelect = document.getElementById('appraisal-emp-select');
  if (empSelect) {
    empSelect.innerHTML = (appData.employees || []).map(e => `<option value="${e.id}">${e.fullName} (${e.designation})</option>`).join('');
  }

  const dateInput = document.getElementById('appraisal-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  calculateLiveAppraisalScore();
  openSmartModal('modal-smart-appraisal');
}

function calculateLiveAppraisalScore() {
  const task = parseInt(document.getElementById('appr-kpi-task')?.value || 0);
  const credit = parseInt(document.getElementById('appr-kpi-credit')?.value || 0);
  const service = parseInt(document.getElementById('appr-kpi-service')?.value || 0);
  const team = parseInt(document.getElementById('appr-kpi-team')?.value || 0);
  const att = parseInt(document.getElementById('appr-kpi-attendance')?.value || 0);

  const total = Math.min(100, Math.max(0, task + credit + service + team + att));
  const badge = document.getElementById('appraisal-live-score-badge');
  
  let grade = 'Grade D (වර්ධනය විය යුතුයි)';
  if (total >= 85) grade = 'Grade A (විශිෂ්ටයි)';
  else if (total >= 70) grade = 'Grade B (ඉතා හොඳයි)';
  else if (total >= 55) grade = 'Grade C (සාමාන්‍යයි)';
  
  if (badge) {
    badge.textContent = `මුළු ලකුණු: ${total}/100 — ${grade}`;
  }

  const incCheck = document.getElementById('appraisal-increment-check');
  if (incCheck) {
    incCheck.checked = (total >= 70);
  }

  return total;
}

async function saveAppraisalForm(e) {
  e.preventDefault();
  const empId = document.getElementById('appraisal-emp-select').value;
  const emp = (appData.employees || []).find(e => e.id === empId);

  const totalScore = calculateLiveAppraisalScore();

  let grade = 'Grade D - වර්ධනය විය යුතුයි';
  if (totalScore >= 85) grade = 'Grade A - විශිෂ්ටයි';
  else if (totalScore >= 70) grade = 'Grade B - ඉතා හොඳයි';
  else if (totalScore >= 55) grade = 'Grade C - සාමාන්‍යයි';

  const newAppraisal = {
    id: `APR-${Date.now().toString().slice(-5)}`,
    employeeId: empId,
    employeeName: emp ? emp.fullName : 'කාර්ය මණ්ඩල සාමාජික',
    designation: emp ? emp.designation : '',
    period: document.getElementById('appraisal-period').value,
    date: document.getElementById('appraisal-date').value,
    scores: {
      taskExecution: parseInt(document.getElementById('appr-kpi-task').value),
      creditRecovery: parseInt(document.getElementById('appr-kpi-credit').value),
      customerCare: parseInt(document.getElementById('appr-kpi-service').value),
      teamwork: parseInt(document.getElementById('appr-kpi-team').value),
      attendance: parseInt(document.getElementById('appr-kpi-attendance').value)
    },
    totalScore: totalScore,
    grade: grade,
    incrementRecommended: document.getElementById('appraisal-increment-check').checked,
    remarks: document.getElementById('appraisal-remarks').value.trim() || 'කාර්යසාධන ඇගයීම සාර්ථකව අවසන් කරන ලදී.'
  };

  if (!appData.appraisals) appData.appraisals = [];
  appData.appraisals.unshift(newAppraisal);

  await persistData();
  closeSmartModal('modal-smart-appraisal');
  renderAppraisalModule();
  alert(currentLang === 'si' ? 'කාර්යසාධන ඇගයීම සාර්ථකව සුරකින ලදී!' : 'Performance appraisal saved successfully!');
}

async function deleteAppraisal(id) {
  if (confirm(currentLang === 'si' ? 'මෙම කාර්යසාධන ඇගයීම් වාර්තාව ඉවත් කිරීමට ඔබට සහතිකද?' : 'Are you sure to delete this appraisal?')) {
    appData.appraisals = (appData.appraisals || []).filter(a => a.id !== id);
    await persistData();
    renderAppraisalModule();
  }
}

function renderSatisfactionModule() {
  const surveys = appData.surveys || [];
  const tbody = document.querySelector('#table-survey-body');
  if (!tbody) return;

  if (surveys.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">
          <i class="fa-solid fa-face-smile" style="font-size:28px; margin-bottom:8px; display:block; opacity:0.6;"></i>
          තෘප්තිමත්භාවය පිළිබඳ සමීක්ෂණ ප්‍රතිඵල නොමැත
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = surveys.map(s => `
    <tr>
      <td><strong>${s.id}</strong></td>
      <td>${s.timestamp}</td>
      <td><span style="color:#f59e0b;">${'★'.repeat(s.ratings?.workEnvironment || 4)}</span></td>
      <td><span style="color:#f59e0b;">${'★'.repeat(s.ratings?.managementSupport || 4)}</span></td>
      <td><span style="color:#f59e0b;">${'★'.repeat(s.ratings?.salaryFairness || 4)}</span></td>
      <td><span style="color:#f59e0b;">${'★'.repeat(s.ratings?.careerGrowth || 4)}</span></td>
      <td><span style="font-size:12px; color:#64748b;">${s.comments}</span></td>
    </tr>
  `).join('');
}

// =========================================================================
// 8. PRINTABLE POSTERS
// =========================================================================
function renderPrintablePosters() {
  renderPosterQRs();
}

// Print a single poster (grievance or feedback) cleanly on A4 in full solid black
function printPoster(type) {
  const isGrievance = (type === 'grievance');
  const orgName = isGrievance ? 'ගලපිටියාගම සණස සමුපකාර සමිතිය' : 'ගලපිටියාගම සණස බැංකුව';
  const posterTitle = isGrievance ? 'සේවක ගැටළු හා යෝජනා යොමු කිරීමේ ද්වාරය' : 'සාමාජික අදහස් හා ඇගයීම් යොමු කිරීමේ ද්වාරය';
  const instruction = isGrievance
    ? 'ඔබේ ජංගම දුරකථනයෙන් QR කේතය ස්කෑන් කර <strong>100% නිර්නාමිකව</strong> හෝ නාමිකව යොමු කරන්න.'
    : 'ඔබේ වටිනා අදහස් හා තරු ලකුණු අපට දන්වා සේවාව තවදුරටත් උසස් කිරීමට දායක වන්න.';

  // Generate 100% pure solid black (#000000) QR code for crisp official printing without gray fading
  const targetUrl = getOnlinePageUrl(isGrievance ? 'grievance.html' : 'feedback.html');
  const tempDiv = document.createElement('div');
  new QRCode(tempDiv, {
    text: targetUrl,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  let qrDataUrl = '';
  const img = tempDiv.querySelector('img');
  if (img && img.src && img.src.startsWith('data:')) {
    qrDataUrl = img.src;
  } else {
    const canvas = tempDiv.querySelector('canvas');
    if (canvas) {
      qrDataUrl = canvas.toDataURL('image/png');
    }
  }

  // Logo source
  const existingLogo = document.querySelector('.sidebar-brand img, #print-poster-grievance img, #print-poster-feedback img');
  const logoSrc = existingLogo ? existingLogo.src : 'images/gscs_logo.png';

  // Use hidden iframe for reliable, isolated A4 printing
  let frame = document.getElementById('poster-print-iframe');
  if (frame) frame.remove();

  frame = document.createElement('iframe');
  frame.id = 'poster-print-iframe';
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);

  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <title>${posterTitle}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Iskoola Pota', -apple-system, sans-serif;
    }
    body {
      background: #ffffff !important;
      color: #000000 !important;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .poster-container {
      width: 100%;
      max-width: 580px;
      margin: 0 auto;
      text-align: center;
      border: 3.5px dashed #000000;
      border-radius: 24px;
      padding: 44px 32px 36px;
      background: #ffffff;
      color: #000000;
    }
    .logo-container {
      background: #ffffff;
      border: 2px solid #000000;
      border-radius: 14px;
      padding: 8px 16px;
      width: 180px;
      margin: 0 auto 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    .org-title {
      font-size: 25px;
      font-weight: 900;
      color: #000000 !important;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    .poster-title {
      font-size: 17px;
      font-weight: 800;
      color: #000000 !important;
      margin: 0 0 24px 0;
      line-height: 1.4;
    }
    .qr-box {
      width: 240px;
      height: 240px;
      margin: 0 auto 22px;
      padding: 12px;
      background: #ffffff;
      border: 2px solid #000000;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-box img {
      width: 216px !important;
      height: 216px !important;
      max-width: 216px !important;
      max-height: 216px !important;
      display: block !important;
      object-fit: contain !important;
    }
    .instruction-text {
      font-size: 14px;
      font-weight: 600;
      color: #000000 !important;
      line-height: 1.6;
      max-width: 480px;
      margin: 0 auto 22px;
    }
    .instruction-text strong {
      color: #000000 !important;
      font-weight: 900;
    }
    .poster-footer {
      border-top: 1.5px solid #000000;
      padding-top: 14px;
      font-size: 12px;
      font-weight: 700;
      color: #000000 !important;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="logo-container">
      <img src="${logoSrc}" alt="GSCS Logo">
    </div>
    <h1 class="org-title">${orgName}</h1>
    <h2 class="poster-title">${posterTitle}</h2>
    <div class="qr-box">
      <img src="${qrDataUrl}" alt="QR Code">
    </div>
    <p class="instruction-text">${instruction}</p>
    <div class="poster-footer">
      <span>ගලපිටියාගම සණස &bull; Smart HRMS Portal</span>
    </div>
  </div>
</body>
</html>`);
  doc.close();

  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }, 400);
}

function renderPosterQRs() {
  const p1 = document.getElementById('poster-qr-grievance-area');
  const p2 = document.getElementById('poster-qr-feedback-area');

  if (p1 && typeof QRCode !== 'undefined') {
    p1.innerHTML = '';
    new QRCode(p1, {
      text: getOnlinePageUrl('grievance.html'),
      width: 200,
      height: 200,
      colorDark: "#7c3aed",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  if (p2 && typeof QRCode !== 'undefined') {
    p2.innerHTML = '';
    new QRCode(p2, {
      text: getOnlinePageUrl('feedback.html'),
      width: 200,
      height: 200,
      colorDark: "#1e3a8a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// =========================================================================
// 9. WORK PROGRESS & PROJECTS MODULE
// =========================================================================
function renderProjectsView() {
  const container = document.getElementById('projects-container');
  if (!container) return;

  const tasks = (appData?.tasks && appData.tasks.length > 0) ? appData.tasks : defaultSeedData.tasks;
  if (!tasks || tasks.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#94a3b8;">
        <i class="fa-solid fa-list-check" style="font-size:46px; margin-bottom:14px; opacity:0.6; display:block; color:#7c3aed;"></i>
        <h4 style="font-size:16px; font-weight:800; color:#1e1b4b; margin-bottom:6px;">ක්‍රියාත්මක ව්‍යාපෘති කිසිවක් නැත</h4>
        <p style="font-size:13px; color:#64748b; margin-bottom:18px;">සමිතියේ නව ව්‍යාපෘතියක් හෝ ක්ෂේත්‍ර ඉලක්කයක් එක් කිරීමට පහත බොත්තම ඔබන්න.</p>
        <button class="btn-smart btn-smart-primary" onclick="openAddProjectModal()">
          <i class="fa-solid fa-plus"></i> + නව ව්‍යාපෘතියක් එක් කරන්න
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px;">
      ${tasks.map(t => `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; box-shadow:0 2px 10px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <span class="badge-pill badge-purple">${t.department || 'සාමාන්‍ය'}</span>
              <button class="btn-smart btn-smart-light" onclick="deleteProject('${t.id}')" title="ඉවත් කරන්න" style="color:#dc2626; padding:4px 8px; font-size:11px;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <h4 style="font-size:15px; font-weight:800; color:#1e1b4b; margin-bottom:6px; line-height:1.35;">${t.title}</h4>
            <p style="font-size:12.5px; color:#64748b; line-height:1.5; margin-bottom:14px;">${t.description || 'විස්තරයක් ඇතුළත් කර නොමැත.'}</p>
          </div>

          <div>
            <div style="margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:6px;">
                <span style="color:#64748b;">ප්‍රගතිය (Progress)</span>
                <span style="color:#7c3aed;">${t.progress || 0}%</span>
              </div>
              <div style="width:100%; height:8px; background:#f1f5f9; border-radius:99px; overflow:hidden;">
                <div style="width:${t.progress || 0}%; height:100%; background:linear-gradient(90deg, #7c3aed, #a855f7); border-radius:99px;"></div>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:10px;">
              <span><i class="fa-solid fa-user" style="color:#7c3aed; margin-right:4px;"></i>${t.assignedStaffName || 'පවරා නැත'}</span>
              <span><i class="fa-solid fa-calendar-check" style="color:#7c3aed; margin-right:4px;"></i>${t.dueDate || 'දින නියම කර නැත'}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openAddProjectModal() {
  const form = document.getElementById('form-smart-project');
  if (form) form.reset();

  const staffSelect = document.getElementById('proj-assigned-staff');
  if (staffSelect) {
    const emps = appData?.employees || [];
    staffSelect.innerHTML = '<option value="">-- සේවකයෙකු තෝරන්න (හෝ සාමාන්‍ය කාර්ය මණ්ඩලය) --</option>' +
      '<option value="all">ගලපිටියාගම සණස ප්‍රධාන කාර්ය මණ්ඩලය</option>' +
      emps.map(e => `<option value="${e.id}">${e.fullName} (${e.designation})</option>`).join('');
  }

  const dueDateInput = document.getElementById('proj-due-date');
  if (dueDateInput) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    dueDateInput.value = d.toISOString().split('T')[0];
  }

  openSmartModal('modal-smart-project');
}

async function saveProjectForm(e) {
  e.preventDefault();
  const staffId = document.getElementById('proj-assigned-staff').value;
  const emp = (appData.employees || []).find(e => e.id === staffId);

  const reqMicro = parseInt(document.getElementById('proj-req-microfinance')?.value || 4);
  const reqCredit = parseInt(document.getElementById('proj-req-creditAppraisal')?.value || 4);
  const reqAcc = parseInt(document.getElementById('proj-req-accounting')?.value || 3);
  const reqExcel = parseInt(document.getElementById('proj-req-excel')?.value || 3);

  const newProject = {
    id: 'TSK-' + Date.now(),
    title: document.getElementById('proj-title').value.trim(),
    assignedStaffId: staffId,
    assignedStaffName: emp ? emp.fullName : (staffId === 'all' ? 'ගලපිටියාගම සණස ප්‍රධාන කාර්ය මණ්ඩලය' : 'කාර්ය මණ්ඩලය'),
    department: document.getElementById('proj-dept').value,
    dueDate: document.getElementById('proj-due-date').value,
    progress: parseInt(document.getElementById('proj-progress').value) || 0,
    description: document.getElementById('proj-desc').value.trim(),
    requiredSkills: {
      microfinance: reqMicro,
      creditAppraisal: reqCredit,
      accounting: reqAcc,
      excel: reqExcel,
      customerCare: 4
    }
  };

  if (!appData.tasks) appData.tasks = [];
  appData.tasks.push(newProject);
  await persistData();
  closeSmartModal('modal-smart-project');
  
  if (typeof renderProjectsView === 'function') renderProjectsView();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderSkillsMatrix === 'function') renderSkillsMatrix();

  const taskSelect = document.getElementById('smart-task-select');
  if (taskSelect) {
    taskSelect.value = newProject.id;
    if (typeof calculateTaskMatching === 'function') calculateTaskMatching();
  }

  alert(currentLang === 'si' ? 'නව රාජකාරිය / ව්‍යාපෘතිය සාර්ථකව ඇතුළත් විය!' : 'New Duty / Project saved successfully!');
}

async function deleteCurrentSelectedTask() {
  const taskId = document.getElementById('smart-task-select')?.value;
  if (!taskId) {
    alert(currentLang === 'si' ? 'ඉවත් කිරීමට තෝරාගත් රාජකාරියක් නොමැත.' : 'No duty selected to delete.');
    return;
  }
  const task = (appData.tasks || []).find(t => t.id === taskId);
  const title = task ? task.title : 'මෙම රාජකාරිය';

  if (confirm(currentLang === 'si' ? `"${title}" රාජකාරිය පද්ධතියෙන් ඉවත් කිරීමට ඔබට සහතිකද?` : `Are you sure you want to delete "${title}"?`)) {
    appData.tasks = (appData.tasks || []).filter(t => t.id !== taskId);
    await persistData();
    if (typeof renderSkillsMatrix === 'function') renderSkillsMatrix();
    if (typeof renderProjectsView === 'function') renderProjectsView();
    if (typeof renderDashboard === 'function') renderDashboard();
    alert(currentLang === 'si' ? 'රාජකාරිය සාර්ථකව ඉවත් කරන ලදී!' : 'Duty deleted successfully!');
  }
}

async function deleteProject(id) {
  if (confirm(currentLang === 'si' ? 'මෙම ව්‍යාපෘතිය ඉවත් කිරීමට ඔබට සහතිකද?' : 'Are you sure to delete this project?')) {
    appData.tasks = (appData.tasks || []).filter(t => t.id !== id);
    await persistData();
    renderProjectsView();
    renderDashboard();
    if (typeof renderSkillsMatrix === 'function') renderSkillsMatrix();
  }
}

// =========================================================================
// 10. MEETINGS MODULE
// =========================================================================
function renderMeetingsView() {
  const container = document.getElementById('meetings-container');
  if (!container) return;

  const meetings = (appData?.meetings && appData.meetings.length > 0) ? appData.meetings : defaultSeedData.meetings;
  if (!meetings || meetings.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#94a3b8;">
        <i class="fa-solid fa-calendar-days" style="font-size:46px; margin-bottom:14px; opacity:0.6; display:block; color:#7c3aed;"></i>
        <h4 style="font-size:16px; font-weight:800; color:#1e1b4b; margin-bottom:6px;">සැලසුම් කළ රැස්වීම් කිසිවක් නැත</h4>
        <p style="font-size:13px; color:#64748b; margin-bottom:18px;">අධ්‍යක්ෂ මණ්ඩල, ණය කමිටු හෝ කාර්ය මණ්ඩල රැස්වීමක් සැලසුම් කිරීමට පහත බොත්තම ඔබන්න.</p>
        <button class="btn-smart btn-smart-primary" onclick="openAddMeetingModal()">
          <i class="fa-solid fa-calendar-plus"></i> + නව රැස්වීමක් සැලසුම් කරන්න
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:18px;">
      ${meetings.map(m => `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:20px; box-shadow:0 2px 10px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
              <span class="badge-pill badge-green"><i class="fa-solid fa-calendar-check" style="margin-right:4px;"></i>${m.date}</span>
              <button class="btn-smart btn-smart-light" onclick="deleteMeeting('${m.id}')" title="ඉවත් කරන්න" style="color:#dc2626; padding:4px 8px; font-size:11px;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <h4 style="font-size:16px; font-weight:800; color:#1e1b4b; margin-bottom:8px; line-height:1.3;">${m.title}</h4>
            <div style="font-size:12px; color:#64748b; margin-bottom:12px; display:flex; flex-direction:column; gap:4px;">
              <div><i class="fa-solid fa-clock" style="color:#7c3aed; width:18px;"></i><strong>වේලාව:</strong> ${m.time}</div>
              <div><i class="fa-solid fa-user-tie" style="color:#7c3aed; width:18px;"></i><strong>ප්‍රධානත්වය:</strong> ${m.chair || 'ගරු සභාපතිතුමා'}</div>
              <div><i class="fa-solid fa-location-dot" style="color:#7c3aed; width:18px;"></i><strong>ස්ථානය:</strong> ${m.venue || 'ප්‍රධාන රැස්වීම් ශාලාව'}</div>
            </div>

            ${m.agenda ? `
              <div style="background:#f8fafc; border-radius:10px; padding:10px 12px; font-size:12px; color:#475569; line-height:1.5;">
                <strong style="color:#1e1b4b; display:block; margin-bottom:3px;">න්‍යාය පත්‍රය (Agenda):</strong>
                ${m.agenda.replace(/\\n/g, '<br>')}
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openAddMeetingModal() {
  const form = document.getElementById('form-smart-meeting');
  if (form) form.reset();

  const dateInput = document.getElementById('meet-date');
  if (dateInput) {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    dateInput.value = d.toISOString().split('T')[0];
  }

  const timeInput = document.getElementById('meet-time');
  if (timeInput) timeInput.value = '10:00 AM - 11:30 AM';

  const chairInput = document.getElementById('meet-chair');
  if (chairInput) chairInput.value = appData?.organization?.chairman || 'ඒ. එම්. දයාරත්න බණ්ඩා මහතා (Hon. Chairman)';

  const venueInput = document.getElementById('meet-venue');
  if (venueInput) venueInput.value = 'ගලපිටියාගම සණස ප්‍රධාන රැස්වීම් ශාලාව';

  openSmartModal('modal-smart-meeting');
}

async function saveMeetingForm(e) {
  e.preventDefault();
  const newMeeting = {
    id: 'MEET-' + Date.now(),
    title: document.getElementById('meet-title').value.trim(),
    date: document.getElementById('meet-date').value,
    time: document.getElementById('meet-time').value.trim(),
    chair: document.getElementById('meet-chair').value.trim(),
    venue: document.getElementById('meet-venue').value.trim(),
    agenda: document.getElementById('meet-agenda').value.trim()
  };

  if (!appData.meetings) appData.meetings = [];
  appData.meetings.push(newMeeting);
  await persistData();
  closeSmartModal('modal-smart-meeting');
  renderMeetingsView();
  renderDashboard();
  alert(currentLang === 'si' ? 'රැස්වීම සාර්ථකව සැලසුම් කරන ලදී!' : 'Meeting scheduled successfully!');
}

async function deleteMeeting(id) {
  if (confirm(currentLang === 'si' ? 'මෙම රැස්වීම ඉවත් කිරීමට ඔබට සහතිකද?' : 'Are you sure to delete this meeting?')) {
    appData.meetings = (appData.meetings || []).filter(m => m.id !== id);
    await persistData();
    renderMeetingsView();
    renderDashboard();
  }
}

// =========================================================================
// 11. ADMIN PANEL & USER MANAGEMENT
// =========================================================================
function renderAdminPanel() {
  const uName = document.getElementById('admin-profile-username');
  const dName = document.getElementById('admin-profile-name');
  const rTitle = document.getElementById('admin-profile-role');

  const curr = currentUser || (appData?.users && appData.users[0]) || {
    username: 'admin',
    name: 'ප්‍රධාන පරිපාලක (Administrator)',
    roleTitle: 'සණස ප්‍රධාන පරිපාලක (Full Admin Access)'
  };

  if (uName) uName.value = curr.username || 'admin';
  if (dName) dName.value = curr.name || 'ප්‍රධාන පරිපාලක (Administrator)';
  if (rTitle) rTitle.value = curr.roleTitle || 'සණස ප්‍රධාන පරිපාලක (Full Admin Access)';

  const tbody = document.getElementById('table-users-body');
  if (!tbody) return;

  const users = (appData?.users && appData.users.length > 0) ? appData.users : defaultSeedData.users;
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong style="color:var(--primary); font-family:monospace;">${u.username}</strong></td>
      <td>
        <div style="font-weight:700; color:#1e1b4b;">${u.name}</div>
        <div style="font-size:11px; color:#64748b;">ලියාපදිංචි දිනය: ${u.createdDate || '2026-09-24'}</div>
      </td>
      <td><span class="badge-pill ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}">${u.roleTitle || u.role}</span></td>
      <td><span class="badge-pill badge-green">${u.status || 'Active'}</span></td>
      <td>
        ${u.username === 'admin' ? '<span style="font-size:11.5px; color:#94a3b8; font-style:italic;">ප්‍රධාන ගිණුම (Protected)</span>' : `
          <button class="btn-smart btn-smart-light" onclick="deleteUser('${u.id}')" title="ඉවත් කරන්න" style="color:#dc2626;">
            <i class="fa-solid fa-trash"></i> ඉවත් කරන්න
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

function openAddUserModal() {
  const form = document.getElementById('form-smart-user');
  if (form) form.reset();
  openSmartModal('modal-smart-user');
}

async function saveUserForm(e) {
  e.preventDefault();
  const username = document.getElementById('user-new-username').value.trim();
  const fullname = document.getElementById('user-new-fullname').value.trim();
  const password = document.getElementById('user-new-password').value.trim();
  const role = document.getElementById('user-new-role').value;

  if (!appData.users) appData.users = JSON.parse(JSON.stringify(defaultSeedData.users));

  const exists = appData.users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    alert(currentLang === 'si' ? 'මෙම පරිශීලක නාමය (Username) දැනටමත් භාවිතයේ පවතී!' : 'This username already exists!');
    return;
  }

  const roleTitles = {
    admin: 'සණස ප්‍රධාන පරිපාලක (Full Admin Access)',
    manager: 'කළමනාකරු (Manager Access)',
    officer: 'නිලධාරී (Officer Access)'
  };

  const newUser = {
    id: 'USR-00' + (appData.users.length + 1),
    username: username,
    name: fullname,
    password: password,
    role: role,
    roleTitle: roleTitles[role] || role,
    status: 'Active',
    createdDate: new Date().toISOString().split('T')[0]
  };

  appData.users.push(newUser);
  await persistData();
  closeSmartModal('modal-smart-user');
  renderAdminPanel();
  alert(currentLang === 'si' ? 'නව පරිශීලකයා සාර්ථකව එක් කරන ලදී!' : 'User added successfully!');
}

async function deleteUser(id) {
  if (confirm(currentLang === 'si' ? 'මෙම පරිශීලකයා ඉවත් කිරීමට ඔබට සහතිකද?' : 'Are you sure to delete this user?')) {
    appData.users = (appData.users || []).filter(u => u.id !== id);
    await persistData();
    renderAdminPanel();
  }
}

async function saveAdminProfileForm(e) {
  e.preventDefault();
  const newName = document.getElementById('admin-profile-name').value.trim();
  const newRole = document.getElementById('admin-profile-role').value.trim();

  if (currentUser) {
    currentUser.name = newName;
    currentUser.roleTitle = newRole;
    localStorage.setItem('sanasa_hrms_user', JSON.stringify(currentUser));
  }

  const userObj = (appData.users || []).find(u => u.username === (currentUser?.username || 'admin'));
  if (userObj) {
    userObj.name = newName;
    userObj.roleTitle = newRole;
  }

  updateUserSidebarUI();
  await persistData();
  alert(currentLang === 'si' ? 'පරිපාලක තොරතුරු සාර්ථකව සුරකින ලදී!' : 'Admin profile saved successfully!');
}

async function saveAdminPasswordForm(e) {
  e.preventDefault();
  const currPwd = document.getElementById('admin-current-pwd').value.trim();
  const newPwd = document.getElementById('admin-new-pwd').value.trim();
  const confirmPwd = document.getElementById('admin-confirm-pwd').value.trim();

  const uname = currentUser?.username || 'admin';
  const userObj = (appData.users || []).find(u => u.username === uname);
  const realCurrentPwd = userObj?.password || 'admin123';

  if (currPwd !== realCurrentPwd) {
    alert(currentLang === 'si' ? 'වත්මන් මුරපදය වැරදියි!' : 'Current password is incorrect!');
    return;
  }

  if (newPwd !== confirmPwd) {
    alert(currentLang === 'si' ? 'නව මුරපද දෙක නොගැළපේ!' : 'New passwords do not match!');
    return;
  }

  if (newPwd.length < 4) {
    alert(currentLang === 'si' ? 'මුරපදය අවම වශයෙන් අක්ෂර 4ක් විය යුතුය!' : 'Password must be at least 4 characters long!');
    return;
  }

  if (userObj) {
    userObj.password = newPwd;
  }
  await persistData();
  document.getElementById('form-admin-password').reset();
  alert(currentLang === 'si' ? 'මුරපදය සාර්ථකව යාවත්කාලීන විය!' : 'Password updated successfully!');
}

// =========================================================================
// MODALS & EVENT HANDLERS
// =========================================================================
function openSmartModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.style.display = 'flex';
    m.classList.add('active');
  }
}

function closeSmartModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.style.display = 'none';
    m.classList.remove('active');
  }
}

function setupEventListeners() {
  // Live Date Widget
  const dateEl = document.getElementById('header-live-date');
  if (dateEl) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Quick Login form
  document.getElementById('smart-login-form')?.addEventListener('submit', handleLoginSubmit);

  // Search & Filters
  document.getElementById('search-employee-input')?.addEventListener('input', renderEmployeesTable);
  document.getElementById('filter-employee-dept')?.addEventListener('change', renderEmployeesTable);
  document.getElementById('filter-employee-branch')?.addEventListener('change', renderEmployeesTable);

  // Forms
  document.getElementById('form-smart-employee')?.addEventListener('submit', saveSmartEmployeeForm);
  document.getElementById('form-smart-skills-edit')?.addEventListener('submit', saveSkillsForm);
  document.getElementById('form-smart-grievance-review')?.addEventListener('submit', saveGrievanceReviewForm);
  document.getElementById('form-smart-member-feedback-review')?.addEventListener('submit', saveMemberFeedbackReviewForm);
  document.getElementById('form-smart-project')?.addEventListener('submit', saveProjectForm);
  document.getElementById('form-smart-meeting')?.addEventListener('submit', saveMeetingForm);
  document.getElementById('form-smart-user')?.addEventListener('submit', saveUserForm);
  document.getElementById('form-admin-profile')?.addEventListener('submit', saveAdminProfileForm);
  document.getElementById('form-admin-password')?.addEventListener('submit', saveAdminPasswordForm);

  // Payroll forms
  document.getElementById('form-smart-payroll-entry')?.addEventListener('submit', savePayrollEntry);
  document.getElementById('form-smart-incentive-entry')?.addEventListener('submit', saveIncentiveEntry);
  document.getElementById('pay-entry-emp')?.addEventListener('change', onPayrollEntryEmpChange);
  document.getElementById('inc-entry-emp')?.addEventListener('change', onIncentiveEmpChange);

  // EPF Payment form
  document.getElementById('form-smart-epf-payment')?.addEventListener('submit', saveEpfPayment);

  // Task allocation change
  document.getElementById('smart-task-select')?.addEventListener('change', calculateTaskMatching);

  // Close modals on outside click
  document.querySelectorAll('.smart-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
}

// =========================================================================
// EPF / ETF REMITTANCE TRACKER MODULE
// =========================================================================

function renderEpfTrackerModule() {
  const panel = document.getElementById('payroll-panel-epf');
  if (!panel) return;

  const monthSelect = document.getElementById('epf-month-select');
  const selectedMonth = monthSelect ? monthSelect.value : new Date().toISOString().slice(0, 7);

  const allEmps = (appData.employees || []).filter(isPermanentEmp);
  const remittances = appData.epfRemittances || [];

  // Count pending vs paid
  let pendingCount = 0;
  let paidCount = 0;
  allEmps.forEach(emp => {
    const rec = remittances.find(r => r.empId === emp.id && r.month === selectedMonth);
    if (rec && rec.status === 'paid') {
      paidCount++;
    } else {
      pendingCount++;
    }
  });

  // Update alert box
  const alertBox = document.getElementById('epf-alert-box');
  if (alertBox) {
    if (pendingCount > 0) {
      alertBox.style.display = 'flex';
      alertBox.style.background = '#fef2f2';
      alertBox.style.borderColor = '#dc2626';
      alertBox.querySelector ? null : null;
    } else {
      alertBox.style.display = 'flex';
      alertBox.style.background = '#f0fdf4';
      alertBox.style.borderColor = '#16a34a';
    }
  }

  const pendingBadge = document.getElementById('badge-epf-pending-count');
  const paidBadge = document.getElementById('badge-epf-paid-count');
  if (pendingBadge) pendingBadge.textContent = pendingCount;
  if (paidBadge) paidBadge.textContent = paidCount;

  // Update stat cards
  const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setStat('epf-stat-total-emps', allEmps.length);
  setStat('epf-stat-pending', pendingCount);
  setStat('epf-stat-paid', paidCount);

  // Calculate total EPF/ETF amounts for the month
  let totalEpf8 = 0, totalEpf12 = 0, totalEtf3 = 0;
  allEmps.forEach(emp => {
    const history = appData.payrollHistory || [];
    const payRec = history.find(r => r.empId === emp.id && r.month === selectedMonth);
    const basic = payRec ? payRec.basic : (emp.basicSalary || 0);
    totalEpf8 += Math.round(basic * 0.08);
    totalEpf12 += Math.round(basic * 0.12);
    totalEtf3 += Math.round(basic * 0.03);
  });
  setStat('epf-stat-total-epf', `රු. ${(totalEpf8 + totalEpf12).toLocaleString()}`);
  setStat('epf-stat-total-etf', `රු. ${totalEtf3.toLocaleString()}`);

  // Render table
  const tbody = document.getElementById('table-epf-tracker-body');
  if (!tbody) return;

  if (allEmps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:40px; color:#94a3b8;">
          <i class="fa-solid fa-shield-halved" style="font-size:36px; margin-bottom:12px; display:block; opacity:0.5;"></i>
          <strong>ස්ථිර සේවකයින් ලියාපදිංචි කර නොමැත</strong><br>
          <span style="font-size:12px;">EPF/ETF ලේඛනය ස්ථිර සේවකයින් සඳහා පමණක් අදාළ වේ.</span>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = allEmps.map((emp, idx) => {
    const history = appData.payrollHistory || [];
    const payRec = history.find(r => r.empId === emp.id && r.month === selectedMonth);
    const basic = payRec ? payRec.basic : (emp.basicSalary || 0);
    const epf8 = Math.round(basic * 0.08);
    const epf12 = Math.round(basic * 0.12);
    const epf20 = Math.round(basic * 0.20);
    const etf3 = Math.round(basic * 0.03);
    const total23 = epf20 + etf3;

    const rec = remittances.find(r => r.empId === emp.id && r.month === selectedMonth);
    const status = rec?.status || 'pending';
    const isPaid = status === 'paid';

    const statusBadge = isPaid
      ? `<span style="background:#dcfce7; color:#15803d; padding:4px 10px; border-radius:20px; font-weight:700; font-size:11px;">✅ ගෙවා ඇත (Paid)</span>`
      : `<span style="background:#fef2f2; color:#dc2626; padding:4px 10px; border-radius:20px; font-weight:700; font-size:11px;">🔴 ගෙවා නොමැත (Pending)</span>`;

    const paidDate = rec?.paidDate ? `<div style="font-size:10px; color:#64748b; margin-top:3px;">${rec.paidDate}</div>` : '';
    const refNo = rec?.refNo ? `<div style="font-size:10px; color:#7c3aed; margin-top:2px;">Ref: ${rec.refNo}</div>` : '';

    return `
      <tr style="border-bottom:1px solid #f1f5f9; ${idx % 2 === 0 ? 'background:#fafafa;' : ''}">
        <td style="padding:10px 14px; font-weight:700; color:var(--primary); font-family:monospace;">${emp.id}</td>
        <td style="padding:10px 14px;">
          <div style="font-weight:700; color:#1e1b4b;">${emp.fullName}</div>
          <div style="font-size:11px; color:#64748b;">${emp.designation}</div>
        </td>
        <td style="padding:10px 14px; text-align:right;">රු. ${basic.toLocaleString()}</td>
        <td style="padding:10px 14px; text-align:right; color:#dc2626;">රු. ${epf8.toLocaleString()}</td>
        <td style="padding:10px 14px; text-align:right; color:#16a34a;">රු. ${epf12.toLocaleString()}</td>
        <td style="padding:10px 14px; text-align:right; font-weight:700; color:#7c3aed;">රු. ${epf20.toLocaleString()}</td>
        <td style="padding:10px 14px; text-align:right; color:#0284c7;">රු. ${etf3.toLocaleString()}</td>
        <td style="padding:10px 14px; text-align:right; font-weight:800; color:#1e1b4b;">රු. ${total23.toLocaleString()}</td>
        <td style="padding:10px 14px; text-align:center;">
          ${statusBadge}
          ${paidDate}
          ${refNo}
        </td>
        <td style="padding:10px 14px; text-align:center; white-space:nowrap;">
          ${isPaid
            ? `<button class="btn-smart" onclick="quickMarkEpfPending('${emp.id}','${selectedMonth}')" style="background:#fef2f2; color:#dc2626; border:1px solid #fca5a5; padding:4px 8px; font-size:11px; border-radius:6px; cursor:pointer; margin-right:4px;" title="Pending ලෙස සලකුණු කරන්න">
                <i class="fa-solid fa-rotate-left"></i> Undo
              </button>`
            : `<button class="btn-smart btn-smart-primary" onclick="quickMarkEpfPaid('${emp.id}','${selectedMonth}')" style="padding:4px 8px; font-size:11px; margin-right:4px;" title="ගෙවා ඇත ලෙස සලකුණු කරන්න">
                <i class="fa-solid fa-check"></i> ගෙවා ඇත
              </button>`
          }
          <button class="btn-smart btn-smart-light" onclick="openEpfPaymentModal('${emp.id}','${selectedMonth}')" style="padding:4px 8px; font-size:11px; margin-right:4px;" title="විස්තරාත්මක ගෙවීම් සටහන">
            <i class="fa-solid fa-file-invoice"></i>
          </button>
          <button class="btn-smart" onclick="openEpfPassbookModal('${emp.id}')" style="background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd; padding:4px 8px; font-size:11px; border-radius:6px; cursor:pointer;" title="EPF/ETF Passbook">
            <i class="fa-solid fa-book"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

// Quick one-click mark as paid (today's date, no ref)
async function quickMarkEpfPaid(empId, month) {
  if (!appData.epfRemittances) appData.epfRemittances = [];
  const idx = appData.epfRemittances.findIndex(r => r.empId === empId && r.month === month);
  const today = new Date().toISOString().split('T')[0];

  if (idx >= 0) {
    appData.epfRemittances[idx].status = 'paid';
    appData.epfRemittances[idx].paidDate = today;
  } else {
    const emp = (appData.employees || []).find(e => e.id === empId);
    const history = appData.payrollHistory || [];
    const payRec = history.find(r => r.empId === empId && r.month === month);
    const basic = payRec ? payRec.basic : (emp?.basicSalary || 0);
    appData.epfRemittances.push({
      id: 'EPF-' + Date.now(),
      empId,
      month,
      basic,
      epf8: Math.round(basic * 0.08),
      epf12: Math.round(basic * 0.12),
      epf20: Math.round(basic * 0.20),
      etf3: Math.round(basic * 0.03),
      total23: Math.round(basic * 0.23),
      status: 'paid',
      paidDate: today,
      refNo: '',
      notes: '',
      updatedAt: new Date().toISOString()
    });
  }
  await persistData();
  renderEpfTrackerModule();
}

// Quick one-click revert to pending
async function quickMarkEpfPending(empId, month) {
  if (!appData.epfRemittances) appData.epfRemittances = [];
  const idx = appData.epfRemittances.findIndex(r => r.empId === empId && r.month === month);
  if (idx >= 0) {
    appData.epfRemittances[idx].status = 'pending';
    appData.epfRemittances[idx].paidDate = '';
    appData.epfRemittances[idx].refNo = '';
  }
  await persistData();
  renderEpfTrackerModule();
}

// Open detailed EPF payment modal
function openEpfPaymentModal(empId, month) {
  const emp = (appData.employees || []).find(e => e.id === empId);
  if (!emp) return;

  const history = appData.payrollHistory || [];
  const payRec = history.find(r => r.empId === empId && r.month === month);
  const basic = payRec ? payRec.basic : (emp.basicSalary || 0);
  const epf8 = Math.round(basic * 0.08);
  const epf12 = Math.round(basic * 0.12);
  const epf20 = Math.round(basic * 0.20);
  const etf3 = Math.round(basic * 0.03);
  const total23 = epf20 + etf3;

  const existing = (appData.epfRemittances || []).find(r => r.empId === empId && r.month === month);

  // Populate modal fields
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setVal('epf-pay-emp-id', empId);
  setVal('epf-pay-month', month);
  setText('epf-pay-emp-name', emp.fullName);
  setText('epf-pay-designation', emp.designation);
  setText('epf-pay-basic', `රු. ${basic.toLocaleString()}`);
  setText('epf-pay-epf8', `රු. ${epf8.toLocaleString()}`);
  setText('epf-pay-epf12', `රු. ${epf12.toLocaleString()}`);
  setText('epf-pay-epf20', `රු. ${epf20.toLocaleString()}`);
  setText('epf-pay-etf3', `රු. ${etf3.toLocaleString()}`);
  setText('epf-pay-total23', `රු. ${total23.toLocaleString()}`);

  setVal('epf-pay-paid-date', existing?.paidDate || new Date().toISOString().split('T')[0]);
  setVal('epf-pay-ref-no', existing?.refNo || '');
  setVal('epf-pay-notes', existing?.notes || '');

  openSmartModal('modal-smart-epf-payment');
}

async function saveEpfPayment(e) {
  e.preventDefault();
  const empId = document.getElementById('epf-pay-emp-id')?.value;
  const month = document.getElementById('epf-pay-month')?.value;
  if (!empId || !month) return;

  const paidDate = document.getElementById('epf-pay-paid-date')?.value || '';
  const refNo = document.getElementById('epf-pay-ref-no')?.value?.trim() || '';
  const notes = document.getElementById('epf-pay-notes')?.value?.trim() || '';

  if (!appData.epfRemittances) appData.epfRemittances = [];
  const idx = appData.epfRemittances.findIndex(r => r.empId === empId && r.month === month);

  const emp = (appData.employees || []).find(e => e.id === empId);
  const history = appData.payrollHistory || [];
  const payRec = history.find(r => r.empId === empId && r.month === month);
  const basic = payRec ? payRec.basic : (emp?.basicSalary || 0);

  const record = {
    id: idx >= 0 ? appData.epfRemittances[idx].id : ('EPF-' + Date.now()),
    empId,
    month,
    basic,
    epf8: Math.round(basic * 0.08),
    epf12: Math.round(basic * 0.12),
    epf20: Math.round(basic * 0.20),
    etf3: Math.round(basic * 0.03),
    total23: Math.round(basic * 0.23),
    status: 'paid',
    paidDate,
    refNo,
    notes,
    updatedAt: new Date().toISOString()
  };

  if (idx >= 0) {
    appData.epfRemittances[idx] = record;
  } else {
    appData.epfRemittances.push(record);
  }

  await persistData();
  closeSmartModal('modal-smart-epf-payment');
  renderEpfTrackerModule();
  alert('EPF/ETF ගෙවීම් සටහන සාර්ථකව සුරකින ලදී!');
}

// Open 12-month EPF/ETF passbook for an employee
function openEpfPassbookModal(empId) {
  const emp = (appData.employees || []).find(e => e.id === empId);
  if (!emp) return;

  const remittances = appData.epfRemittances || [];
  const currentYear = new Date().getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    return `${currentYear}-${m}`;
  });

  const monthNames = ['ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'];

  let totalEpf8 = 0, totalEpf12 = 0, totalEtf3 = 0, totalEpf20 = 0, totalTotal23 = 0;

  const rows = months.map((month, idx) => {
    const history = appData.payrollHistory || [];
    const payRec = history.find(r => r.empId === empId && r.month === month);
    const basic = payRec ? payRec.basic : (emp.basicSalary || 0);
    const epf8 = Math.round(basic * 0.08);
    const epf12 = Math.round(basic * 0.12);
    const epf20 = Math.round(basic * 0.20);
    const etf3 = Math.round(basic * 0.03);
    const total23 = epf20 + etf3;

    totalEpf8 += epf8;
    totalEpf12 += epf12;
    totalEpf20 += epf20;
    totalEtf3 += etf3;
    totalTotal23 += total23;

    const rec = remittances.find(r => r.empId === empId && r.month === month);
    const status = rec?.status || 'pending';
    const isPaid = status === 'paid';
    const statusCell = isPaid
      ? `<span style="color:#15803d; font-weight:700;">✅ ගෙවා ඇත</span>`
      : `<span style="color:#dc2626; font-weight:700;">🔴 Pending</span>`;

    return `
      <tr style="${idx % 2 === 0 ? 'background:#fafafa;' : ''}">
        <td style="padding:8px 12px; font-weight:600; color:#1e1b4b;">${monthNames[idx]}</td>
        <td style="text-align:right; padding:8px 12px;">රු. ${basic.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 12px; color:#dc2626;">රු. ${epf8.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 12px; color:#16a34a;">රු. ${epf12.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 12px; font-weight:700; color:#7c3aed;">රු. ${epf20.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 12px; color:#0284c7;">රු. ${etf3.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 12px; font-weight:800;">රු. ${total23.toLocaleString()}</td>
        <td style="text-align:center; padding:8px 12px;">${statusCell}</td>
        <td style="text-align:center; padding:8px 12px; font-size:11px; color:#64748b;">${rec?.paidDate || '-'}</td>
      </tr>`;
  }).join('');

  const contentArea = document.getElementById('epf-passbook-content');
  if (contentArea) {
    contentArea.innerHTML = `
      <div style="background:#fff; font-family:'Segoe UI',sans-serif;">
        <!-- Header -->
        <div style="border:2px solid #000; padding:10px; margin-bottom:14px; text-align:center;">
          <h3 style="font-size:14px; font-weight:800; margin:0;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු සමුපකාර සමිතිය</h3>
          <div style="font-size:12px; font-weight:700;">Reg No: කුලි/395 | Reg Date: 1987/03/24</div>
          <div style="font-size:11px; margin-top:4px; font-weight:700; color:#7c3aed;">EPF/ETF ගෙවීම් Passbook – ${currentYear}</div>
        </div>

        <!-- Employee Info -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12px; margin-bottom:14px; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
          <div><strong>සේවා අංකය:</strong> ${emp.id}</div>
          <div><strong>සම්පූර්ණ නම:</strong> ${emp.fullName}</div>
          <div><strong>තනතුර:</strong> ${emp.designation}</div>
          <div><strong>සේවා තත්වය:</strong> ${emp.employmentType || 'ස්ථිර (Permanent)'}</div>
        </div>

        <!-- Passbook Table -->
        <table style="width:100%; border-collapse:collapse; font-size:11.5px;" border="1" bordercolor="#e2e8f0">
          <thead>
            <tr style="background:#7c3aed; color:#fff; font-weight:700;">
              <th style="padding:10px; text-align:left;">මාසය</th>
              <th style="padding:10px; text-align:right;">මූලික</th>
              <th style="padding:10px; text-align:right;">EPF 8%<br><small>(සේවකයා)</small></th>
              <th style="padding:10px; text-align:right;">EPF 12%<br><small>(සමිතිය)</small></th>
              <th style="padding:10px; text-align:right;">EPF 20%<br><small>(එකතුව)</small></th>
              <th style="padding:10px; text-align:right;">ETF 3%<br><small>(සමිතිය)</small></th>
              <th style="padding:10px; text-align:right;">23% එකතුව</th>
              <th style="padding:10px; text-align:center;">තත්ත්වය</th>
              <th style="padding:10px; text-align:center;">ගෙවූ දිනය</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background:#f0f9ff; font-weight:800; border-top:2px solid #0284c7;">
              <td style="padding:10px 12px; color:#0284c7;">වාර්ෂික එකතුව</td>
              <td style="text-align:right; padding:10px 12px;">-</td>
              <td style="text-align:right; padding:10px 12px; color:#dc2626;">රු. ${totalEpf8.toLocaleString()}</td>
              <td style="text-align:right; padding:10px 12px; color:#16a34a;">රු. ${totalEpf12.toLocaleString()}</td>
              <td style="text-align:right; padding:10px 12px; color:#7c3aed;">රු. ${totalEpf20.toLocaleString()}</td>
              <td style="text-align:right; padding:10px 12px; color:#0284c7;">රු. ${totalEtf3.toLocaleString()}</td>
              <td style="text-align:right; padding:10px 12px; font-size:13px; color:#1e1b4b;">රු. ${totalTotal23.toLocaleString()}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:30px; display:flex; justify-content:space-between; font-size:11px; text-align:center; color:#475569;">
          <div>...................................<br>සකස් කළේ (Accounts)</div>
          <div>...................................<br>ලේකම් (Secretary)</div>
          <div>...................................<br>සභාපති (Chairman)</div>
        </div>
      </div>`;
  }

  // Update modal title
  const titleEl = document.getElementById('epf-passbook-title');
  if (titleEl) titleEl.textContent = `EPF/ETF Passbook – ${emp.fullName} (${currentYear})`;

  openSmartModal('modal-smart-epf-passbook');
}

// Print monthly EPF/ETF C-Form remittance summary
function printEpfMonthlySummary() {
  const monthSelect = document.getElementById('epf-month-select');
  const selectedMonth = monthSelect ? monthSelect.value : new Date().toISOString().slice(0, 7);

  const allEmps = (appData.employees || []).filter(isPermanentEmp);
  const remittances = appData.epfRemittances || [];

  const monthNames = {
    '01':'ජනවාරි','02':'පෙබරවාරි','03':'මාර්තු','04':'අප්‍රේල්','05':'මැයි','06':'ජූනි',
    '07':'ජූලි','08':'අගෝස්තු','09':'සැප්තැම්බර්','10':'ඔක්තෝබර්','11':'නොවැම්බර්','12':'දෙසැම්බර්'
  };
  const [yr, mo] = selectedMonth.split('-');
  const monthLabel = `${monthNames[mo] || mo} ${yr}`;

  let rows = '';
  let totBasic = 0, totEpf8 = 0, totEpf12 = 0, totEpf20 = 0, totEtf3 = 0, totTotal23 = 0;

  allEmps.forEach((emp, i) => {
    const history = appData.payrollHistory || [];
    const payRec = history.find(r => r.empId === emp.id && r.month === selectedMonth);
    const basic = payRec ? payRec.basic : (emp.basicSalary || 0);
    const epf8 = Math.round(basic * 0.08);
    const epf12 = Math.round(basic * 0.12);
    const epf20 = Math.round(basic * 0.20);
    const etf3 = Math.round(basic * 0.03);
    const total23 = epf20 + etf3;

    totBasic += basic; totEpf8 += epf8; totEpf12 += epf12;
    totEpf20 += epf20; totEtf3 += etf3; totTotal23 += total23;

    const rec = remittances.find(r => r.empId === emp.id && r.month === selectedMonth);
    const statusText = rec?.status === 'paid' ? '✅ ගෙවා ඇත' : '🔴 Pending';

    rows += `
      <tr>
        <td style="text-align:center;">${i + 1}</td>
        <td style="font-family:monospace; font-weight:700;">${emp.id}</td>
        <td>${emp.fullName}</td>
        <td>${emp.designation}</td>
        <td style="text-align:right;">රු. ${basic.toLocaleString()}</td>
        <td style="text-align:right; color:#dc2626;">රු. ${epf8.toLocaleString()}</td>
        <td style="text-align:right; color:#16a34a;">රු. ${epf12.toLocaleString()}</td>
        <td style="text-align:right; font-weight:700; color:#7c3aed;">රු. ${epf20.toLocaleString()}</td>
        <td style="text-align:right; color:#0284c7;">රු. ${etf3.toLocaleString()}</td>
        <td style="text-align:right; font-weight:800;">රු. ${total23.toLocaleString()}</td>
        <td style="text-align:center;">${statusText}</td>
      </tr>`;
  });

  const titleEl = document.getElementById('sheet-print-title');
  if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-shield-halved" style="color:#7c3aed;"></i> EPF/ETF C-Form – මාසික ගෙවීම් ලේඛනය';

  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  content.innerHTML = `
    <div style="background:#fff; font-family:'Segoe UI',sans-serif; color:#000; min-width:960px;">
      <div style="border:2px solid #000; padding:10px; margin-bottom:14px; text-align:center;">
        <h3 style="font-size:15px; font-weight:800; margin:0;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු සමුපකාර සමිතිය</h3>
        <div style="font-size:12px; font-weight:700;">Reg No: කුලි/395 | Reg Date: 1987/03/24</div>
        <div style="font-weight:800; font-size:13px; margin-top:6px; color:#7c3aed;">EPF/ETF C-Form – ${monthLabel} – මාසික ගෙවීම් ලේඛනය</div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:10px;">
        <span>මාසය: ${monthLabel}</span>
        <span>මුද්‍රණ දිනය: ${new Date().toLocaleDateString('en-GB')}</span>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold; text-align:center;">
            <th style="padding:8px;">#</th>
            <th style="padding:8px;">සේවා අංකය</th>
            <th style="padding:8px;">සම්පූර්ණ නම</th>
            <th style="padding:8px;">තනතුර</th>
            <th style="padding:8px;">මූලික වැටුප</th>
            <th style="padding:8px;">EPF 8%<br>(සේවකයා)</th>
            <th style="padding:8px;">EPF 12%<br>(සමිතිය)</th>
            <th style="padding:8px;">EPF 20%<br>(එකතුව)</th>
            <th style="padding:8px;">ETF 3%</th>
            <th style="padding:8px;">23% එකතුව</th>
            <th style="padding:8px;">තත්ත්වය</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr style="background:#fffbeb; font-weight:800; border-top:2px solid #000; text-align:right;">
            <td colspan="4" style="text-align:left; padding:8px 12px; color:#7c3aed;">මාසික එකතුව (Grand Total):</td>
            <td style="padding:8px;">රු. ${totBasic.toLocaleString()}</td>
            <td style="padding:8px; color:#dc2626;">රු. ${totEpf8.toLocaleString()}</td>
            <td style="padding:8px; color:#16a34a;">රු. ${totEpf12.toLocaleString()}</td>
            <td style="padding:8px; color:#7c3aed;">රු. ${totEpf20.toLocaleString()}</td>
            <td style="padding:8px; color:#0284c7;">රු. ${totEtf3.toLocaleString()}</td>
            <td style="padding:8px; font-size:13px;">රු. ${totTotal23.toLocaleString()}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11px; text-align:center; color:#475569;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>ලේකම් (Secretary)</div>
        <div>...................................<br>සභාපති (Chairman)</div>
      </div>
    </div>`;

  openSmartModal('modal-smart-sheet-print');
}

// Global modal handlers
window.openGrievanceReviewModal = openGrievanceReviewModal;
window.openMemberFeedbackReviewModal = openMemberFeedbackReviewModal;
