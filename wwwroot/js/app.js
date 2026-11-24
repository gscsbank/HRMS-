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
  tasks: [],
  meetings: [],
  appraisals: [],
  surveys: [],
  payrollHistory: [],
  incentiveRecords: [],
  epfRemittances: [],
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

  // Realtime cross-tab sync when QR form is submitted in another tab on same device
  window.addEventListener('storage', (e) => {
    if (e.key === 'galapitiyagama_sanasa_hrms' && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (updated) {
          if (Array.isArray(updated.grievances)) appData.grievances = updated.grievances;
          if (Array.isArray(updated.memberFeedbacks)) appData.memberFeedbacks = updated.memberFeedbacks;
          if (Array.isArray(updated.surveys)) appData.surveys = updated.surveys;
          renderGrievancePortal();
          renderMemberFeedbackPortal();
          renderSatisfactionModule();
          renderDashboardStats();
        }
      } catch (err) {}
    }
  });
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
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';
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
    pill.innerHTML = `<span class="status-dot" style="background:#10b981;"></span> System Online`;
    pill.title = `System Online & Active`;
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
        if (data.latestBackupTime && data.latestBackupTime !== 'none' && data.latestBackupTime !== 'කිසිවක් නැත (None)') {
          localStorage.setItem('sanasa_last_cloud_backup_time', data.latestBackupTime);
        }
        if (typeof data.totalBackups !== 'undefined') {
          localStorage.setItem('sanasa_total_cloud_backups', data.totalBackups);
        }

        let newGrievancesCount = 0;
        let newFeedbacksCount = 0;
        let newSurveysCount = 0;

        const deletedGrvIds = new Set(JSON.parse(localStorage.getItem('sanasa_deleted_grv_ids') || '[]'));
        const deletedFbIds = new Set(JSON.parse(localStorage.getItem('sanasa_deleted_fb_ids') || '[]'));
        const deletedSurvIds = new Set(JSON.parse(localStorage.getItem('sanasa_deleted_surv_ids') || '[]'));
        const qrClearedTime = parseInt(localStorage.getItem('sanasa_qr_cleared_time') || '0', 10);

        if (Array.isArray(data.grievances) && data.grievances.length > 0) {
          if (!appData.grievances) appData.grievances = [];
          const existingIds = new Set(appData.grievances.map(g => g.id));
          data.grievances.forEach(g => {
            if (!existingIds.has(g.id) && !deletedGrvIds.has(g.id)) {
              if (qrClearedTime > 0 && g.timestamp) {
                const itemTime = new Date(g.timestamp.replace(' ', 'T')).getTime();
                if (!isNaN(itemTime) && itemTime <= qrClearedTime) {
                  return;
                }
              }
              appData.grievances.unshift(g);
              newGrievancesCount++;
            }
          });
        }

        if (Array.isArray(data.memberFeedbacks) && data.memberFeedbacks.length > 0) {
          if (!appData.memberFeedbacks) appData.memberFeedbacks = [];
          const existingFbIds = new Set(appData.memberFeedbacks.map(f => f.id));
          data.memberFeedbacks.forEach(f => {
            if (!existingFbIds.has(f.id) && !deletedFbIds.has(f.id)) {
              if (qrClearedTime > 0 && f.timestamp) {
                const itemTime = new Date(f.timestamp.replace(' ', 'T')).getTime();
                if (!isNaN(itemTime) && itemTime <= qrClearedTime) {
                  return;
                }
              }
              appData.memberFeedbacks.unshift(f);
              newFeedbacksCount++;
            }
          });
        }

        if (Array.isArray(data.surveys) && data.surveys.length > 0) {
          if (!appData.surveys) appData.surveys = [];
          const existingSurvIds = new Set(appData.surveys.map(s => s.id));
          data.surveys.forEach(s => {
            if (!existingSurvIds.has(s.id) && !deletedSurvIds.has(s.id)) {
              if (qrClearedTime > 0 && s.timestamp) {
                const itemTime = new Date(s.timestamp.replace(' ', 'T')).getTime();
                if (!isNaN(itemTime) && itemTime <= qrClearedTime) {
                  return;
                }
              }
              appData.surveys.unshift(s);
              newSurveysCount++;
            }
          });
        }

        if (newGrievancesCount > 0) localStorage.removeItem('sanasa_grv_all_cleared');
        if (newSurveysCount > 0) localStorage.removeItem('sanasa_surveys_all_cleared');
        if (newGrievancesCount > 0 || newFeedbacksCount > 0 || newSurveysCount > 0) {
          await persistData();
          renderGrievancePortal();
          renderMemberFeedbackPortal();
          renderSatisfactionModule();
          renderDashboardStats();
          if (!silent) {
            alert(currentLang === 'si' 
              ? `Google Sheet වෙතින් නව දත්ත සාර්ථකව එකතු විය!\n(නව ගැටළු: ${newGrievancesCount}, නව ප්‍රතිචාර: ${newFeedbacksCount}, නව සේවක තෘප්තිමත් සමීක්ෂණ: ${newSurveysCount})`
              : `Successfully synced new cloud data! (Grievances: ${newGrievancesCount}, Feedbacks: ${newFeedbacksCount}, Surveys: ${newSurveysCount})`);
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

  // Ensure all collections exist
  if (!appData.employees) appData.employees = [];
  if (!appData.tasks) appData.tasks = [];
  if (!appData.meetings) appData.meetings = [];
  if (!appData.users || appData.users.length === 0) {
    appData.users = JSON.parse(JSON.stringify(defaultSeedData.users));
  } else {
    // Purge legacy default manager and officer from cache
    appData.users = appData.users.filter(u => u.username !== 'manager' && u.username !== 'officer');
  }
  if (!appData.grievances) appData.grievances = [];
  if (!appData.memberFeedbacks) appData.memberFeedbacks = [];
  if (!appData.appraisals) appData.appraisals = [];
  if (!appData.surveys) appData.surveys = [];

  // Track and apply deleted IDs and cleared states so deleted items NEVER resurrect
  const deletedSurvIds = new Set(JSON.parse(localStorage.getItem('sanasa_deleted_surv_ids') || '[]'));
  const deletedGrvIds = new Set(JSON.parse(localStorage.getItem('sanasa_deleted_grv_ids') || '[]'));
  const isSurveysCleared = localStorage.getItem('sanasa_surveys_all_cleared') === 'true';
  const isGrvCleared = localStorage.getItem('sanasa_grv_all_cleared') === 'true';

  if (isSurveysCleared) {
    appData.surveys = [];
  } else if (deletedSurvIds.size > 0 && Array.isArray(appData.surveys)) {
    appData.surveys = appData.surveys.filter(s => !deletedSurvIds.has(s.id));
  }

  if (isGrvCleared) {
    appData.grievances = [];
  } else if (deletedGrvIds.size > 0 && Array.isArray(appData.grievances)) {
    appData.grievances = appData.grievances.filter(g => !deletedGrvIds.has(g.id));
  }

  // Initial one-time seed for wellbeing surveys (only when not yet seeded, never after user deleted or cleared)
  const wellbeingSeedDone = localStorage.getItem('sanasa_wellbeing_seed_done');
  if (!wellbeingSeedDone && !isSurveysCleared) {
    if (typeof seedWellbeingSurveys !== 'undefined' && Array.isArray(seedWellbeingSurveys) && seedWellbeingSurveys.length > 0) {
      const existingIds = new Set(appData.surveys.map(s => s.id));
      let added = 0;
      seedWellbeingSurveys.forEach(s => {
        if (!existingIds.has(s.id) && !deletedSurvIds.has(s.id)) {
          appData.surveys.push(s);
          added++;
        }
      });
      if (added > 0) {
        appData.surveys.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData)); } catch(e){}
      }
    }
    localStorage.setItem('sanasa_wellbeing_seed_done', 'true');
  }
  if (!appData.payrollHistory) appData.payrollHistory = [];
  if (!appData.incentiveRecords) appData.incentiveRecords = [];
  if (!appData.epfRemittances) appData.epfRemittances = [];
  if (!appData.payroll2026Configs) appData.payroll2026Configs = {};
  if (!appData.payroll2026History) appData.payroll2026History = [];

  // Initial one-time seed for grievances (only when not yet seeded, never after user deleted or cleared)
  const grvSeedDone = localStorage.getItem('sanasa_grv_seed_done');
  if (!grvSeedDone && !isGrvCleared) {
    if (typeof seedGrievances !== 'undefined' && Array.isArray(seedGrievances) && seedGrievances.length > 0) {
      const existingIds = new Set(appData.grievances.map(g => g.id));
      let added = 0;
      seedGrievances.forEach(g => {
        if (!existingIds.has(g.id) && !deletedGrvIds.has(g.id)) {
          appData.grievances.unshift(g);
          added++;
        }
      });
      if (added > 0) {
        appData.grievances.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData)); } catch(e){}
      }
    }
    localStorage.setItem('sanasa_grv_seed_done', 'true');
  }

  // Consolidate & normalize Nisansala Dulanjani's employee ID to 'Y14806 - 03'
  normalizeNisansalaEmpId(appData);
}

function normalizeNisansalaEmpId(data) {
  if (!data) return;
  const isTarget = (id) => /^Y14806\s*-\s*0?3$/i.test(String(id || '').trim());
  const TARGET_ID = 'Y14806 - 03';

  // 1. Employees: merge Y14806 - 3 into Y14806 - 03
  if (Array.isArray(data.employees)) {
    const targetEmps = data.employees.filter(e => isTarget(e.id) || (e.fullName && e.fullName.includes('Nisansala')));
    if (targetEmps.length > 0) {
      let primary = targetEmps.find(e => e.id === TARGET_ID) || targetEmps[0];
      primary.id = TARGET_ID;
      primary.designation = 'Assistant Manager';
      data.employees = data.employees.filter(e => (!isTarget(e.id) && !(e.fullName && e.fullName.includes('Nisansala'))) || e === primary);
    }
  }

  // 2. payrollHistory (2025 and earlier)
  if (Array.isArray(data.payrollHistory)) {
    data.payrollHistory.forEach(p => {
      if (isTarget(p.empId) || (p.empName && p.empName.includes('Nisansala'))) {
        p.empId = TARGET_ID;
      }
    });
  }

  // 3. payroll2026History
  if (Array.isArray(data.payroll2026History)) {
    data.payroll2026History.forEach(p => {
      if (isTarget(p.empId) || (p.empName && p.empName.includes('Nisansala'))) {
        p.empId = TARGET_ID;
        if (p.id && p.id.includes('Y14806 - 3')) {
          p.id = p.id.replace('Y14806 - 3', TARGET_ID);
        }
      }
    });
  }

  // 4. payroll2026Configs
  if (data.payroll2026Configs && typeof data.payroll2026Configs === 'object') {
    Object.keys(data.payroll2026Configs).forEach(key => {
      if (isTarget(key) && key !== TARGET_ID) {
        if (!data.payroll2026Configs[TARGET_ID]) {
          data.payroll2026Configs[TARGET_ID] = data.payroll2026Configs[key];
        }
        delete data.payroll2026Configs[key];
      }
    });
  }

  // 5. appraisals
  if (Array.isArray(data.appraisals)) {
    data.appraisals.forEach(a => {
      if (isTarget(a.employeeId) || (a.employeeName && a.employeeName.includes('Nisansala'))) {
        a.employeeId = TARGET_ID;
      }
    });
  }

  // 6. incentiveRecords
  if (Array.isArray(data.incentiveRecords)) {
    data.incentiveRecords.forEach(inc => {
      if (isTarget(inc.empId) || (inc.empName && inc.empName.includes('Nisansala'))) {
        inc.empId = TARGET_ID;
      }
    });
  }

  // 7. epfRemittances
  if (Array.isArray(data.epfRemittances)) {
    data.epfRemittances.forEach(r => {
      if (isTarget(r.empId) || (r.empName && r.empName.includes('Nisansala'))) {
        r.empId = TARGET_ID;
      }
    });
  }

  // 8. tasks
  if (Array.isArray(data.tasks)) {
    data.tasks.forEach(t => {
      if (isTarget(t.assignedTo)) {
        t.assignedTo = TARGET_ID;
      }
    });
  }

  try {
    localStorage.setItem('galapitiyagama_sanasa_hrms', JSON.stringify(data));
  } catch(e) {}
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
    grievance: 'Employee Issues & Suggestions QR (සේවක ගැටළු හා යෝජනා)',
    'member-feedback': 'Member Feedback QR',
    payroll: '2025 වර්ෂය මාසික වැටුප්, EPF/ETF (වැටුප් ලේඛනය)',
    'payroll-2026': '2026 වර්ෂයේ සිට මාසික වැටුප් හා EPF/ETF (ස්වයංක්‍රීය පද්ධතිය)',
    appraisals: 'Appraisals (කාර්යසාධනය)',
    satisfaction: 'Wellbeing (සේවක තෘප්තිය)',
    posters: 'QR පෝස්ටර් (Print-Ready)',
    'admin-panel': 'Admin Panel (පරිපාලක පාලනය)',
    'backup-restore': 'Backup & Restore (දත්ත උපස්ථ සහ ප්‍රතිසාධනය)'
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
  } else if (targetId === 'backup-restore') {
    setTimeout(renderBackupRestoreView, 50);
  } else if (targetId === 'satisfaction') {
    setTimeout(renderSatisfactionModule, 50);
  } else if (targetId === 'payroll-2026') {
    setTimeout(renderPayroll2026Module, 50);
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
    if (!meetings || meetings.length === 0) {
      eventsList.innerHTML = `
        <div style="text-align:center; padding:28px 12px; color:#9ca3af; font-size:12px;">
          <i class="fa-solid fa-calendar-xmark" style="font-size:26px; margin-bottom:8px; display:block; opacity:0.5;"></i>
          රැස්වීම් හෝ සිදුවීම් නොමැත (No upcoming meetings)
        </div>
      `;
    } else {
      eventsList.innerHTML = meetings.slice(0, 4).map(m => `
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
  }

  // 3. Birthdays List (Mockup Col 3) - Filtered by Month
  renderDashboardBirthdays();

  renderDashboardCharts();
}

// Render Birthdays Filtered by Selected Month
function renderDashboardBirthdays() {
  const bdayList = document.getElementById('dashboard-birthdays-list');
  if (!bdayList) return;

  const filterSelect = document.getElementById('dashboard-birthday-filter');
  const filterVal = filterSelect ? filterSelect.value : 'this-month';

  const emps = appData?.employees || [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1 - 12
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  function parseEmpBirth(dobStr) {
    if (!dobStr) return null;
    const parts = String(dobStr).trim().split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return { month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) };
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        return { month: parseInt(parts[1], 10), day: parseInt(parts[0], 10) };
      }
    }
    const d = new Date(dobStr);
    if (!isNaN(d.getTime())) {
      return { month: d.getMonth() + 1, day: d.getDate() };
    }
    return null;
  }

  // Filter employees according to selected filter
  const filtered = emps.filter(e => {
    const b = parseEmpBirth(e.dob);
    if (!b || isNaN(b.month)) return false;
    if (filterVal === 'this-month') {
      return b.month === currentMonth;
    } else if (filterVal === 'next-month') {
      return b.month === nextMonth;
    } else if (filterVal === 'all') {
      return true; // All Year
    } else {
      const targetMonth = parseInt(filterVal, 10);
      return !isNaN(targetMonth) ? b.month === targetMonth : true;
    }
  });

  // Sort chronologically by day
  filtered.sort((a, b) => {
    const bA = parseEmpBirth(a.dob) || { day: 99 };
    const bB = parseEmpBirth(b.dob) || { day: 99 };
    return bA.day - bB.day;
  });

  if (filtered.length === 0) {
    const monthNames = ['', 'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
    let emptyMsg = 'උපන් දින සටහන් කර නොමැත (No birthdays found)';
    if (filterVal === 'this-month') {
      emptyMsg = 'මෙම මාසයේ උපන් දින නොමැත (No birthdays this month)';
    } else if (filterVal === 'next-month') {
      emptyMsg = 'ලබන මාසයේ උපන් දින නොමැත (No birthdays next month)';
    } else if (!isNaN(parseInt(filterVal, 10))) {
      const mIdx = parseInt(filterVal, 10);
      emptyMsg = `${monthNames[mIdx] || ''} මාසයේ උපන් දින නොමැත (No birthdays in selected month)`;
    }
    bdayList.innerHTML = `
      <div style="text-align:center; padding:28px 12px; color:#9ca3af; font-size:12px;">
        <i class="fa-solid fa-cake-candles" style="font-size:26px; margin-bottom:8px; display:block; opacity:0.5; color:#f59e0b;"></i>
        ${emptyMsg}
      </div>
    `;
    return;
  }

  bdayList.innerHTML = filtered.map(e => {
    const hasPhoto = e.photo && e.photo.length > 20;
    const bInfo = parseEmpBirth(e.dob);
    const isToday = bInfo && bInfo.month === currentMonth && bInfo.day === now.getDate();

    return `
      <div style="background:${isToday ? '#fef3c7' : '#f9fafb'}; border:1px solid ${isToday ? '#fcd34d' : '#f3f4f6'}; border-radius:12px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:34px; height:34px; border-radius:50%; background:#059669; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; overflow:hidden; flex-shrink:0;">
            ${hasPhoto ? `<img src="${e.photo}" style="width:100%; height:100%; object-fit:cover;">` : (e.callingName || e.fullName || 'S').charAt(0)}
          </div>
          <div>
            <div style="font-size:12px; font-weight:700; color:#111827;">${e.callingName || e.fullName}</div>
            <div style="font-size:10.5px; color:#6b7280;">${e.designation || ''}</div>
          </div>
        </div>
        <div style="font-size:10.5px; font-weight:700; color:${isToday ? '#b45309' : '#059669'}; background:${isToday ? '#fde68a' : '#e6f4ea'}; padding:3px 8px; border-radius:12px; white-space:nowrap;">
          ${isToday ? '🎂 Today! ' : ''}${e.dob || ''}
        </div>
      </div>
    `;
  }).join('');
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
  document.getElementById('emp-original-id').value = '';
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
  document.getElementById('emp-original-id').value = emp.id;
  document.getElementById('emp-full-name').value = emp.fullName || '';
  document.getElementById('emp-calling-name').value = emp.callingName || '';
  document.getElementById('emp-nic').value = emp.nic || '';
  document.getElementById('emp-gender').value = emp.gender || 'Female';
  document.getElementById('emp-dob').value = emp.dob || '1992-05-15';
  document.getElementById('emp-phone').value = emp.phone || '';
  document.getElementById('emp-address').value = emp.address || '';
  document.getElementById('emp-designation').value = emp.designation || '';
  document.getElementById('emp-department').value = emp.department || 'OAD — මෙහෙයුම් හා පරිපාලන අංශය (Operations and Administration Division)';
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
  const id = (document.getElementById('emp-id-input').value || '').trim();

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
    // Use original ID to find the employee (in case the user changed the EMP ID)
    const originalId = (document.getElementById('emp-original-id').value || '').trim();
    let idx = appData.employees.findIndex(e => e.id === originalId);
    if (idx === -1) idx = appData.employees.findIndex(e => e.id.trim() === originalId.trim());
    if (idx === -1) idx = appData.employees.findIndex(e => e.id === id); // fallback: search by new id
    if (idx !== -1) {
      empData.skills = appData.employees[idx].skills || empData.skills;
      empData.deductions = appData.employees[idx].deductions || empData.deductions;
      appData.employees[idx] = empData;
    } else {
      // Fallback: push if somehow not found (should not happen)
      console.warn('Edit mode: employee not found by id, pushing as new:', id);
      appData.employees.push(empData);
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
  educationLevel: { name: "අධ්‍යාපනය / න්‍යායාත්මක දැනුම (Education / Knowledge)", course: "3. සමුපකාර කළමනාකරණ ඩිප්ලෝමා (Diploma in Cooperative Management)" },
  microfinance: { name: "ක්ෂුද්‍ර මූල්‍ය හා තැන්පතු කළමනාකරණය (Microfinance & Deposits)", course: "4. ක්ෂුද්‍ර මූල්‍ය හා ණය කළමනාකරණ පුහුණු (Microfinance & Credit Management Training)" },
  creditAppraisal: { name: "ණය තක්සේරුව හා අවදානම් කළමනාකරණය (Credit Assessment & Risk)", course: "4. ක්ෂුද්‍ර මූල්‍ය හා ණය කළමනාකරණ පුහුණු (Microfinance & Credit Management Training)" },
  accounting: { name: "ගිණුම්කරණය (Accounting)", course: "5. ගිණුම්කරණය සහ අභ්‍යන්තර විගණන පුහුණු (Accounting & Internal Audit Training)" },
  audit: { name: "විගණනය හා අභ්‍යන්තර පාලනය (Audit & Compliance)", course: "5. ගිණුම්කරණය සහ අභ්‍යන්තර විගණන පුහුණු (Accounting & Internal Audit Training)" },
  bankingSoftware: { name: "බැංකු MIS / මෘදුකාංග භාවිතය (Banking MIS & Software)", course: "6. සමිති මෘදුකාංග (MIS) සහ IT/Excel පුහුණු (Banking MIS & IT Skills Training)" },
  excel: { name: "Excel / තොරතුරු තාක්ෂණය (Excel / IT Skills)", course: "6. සමිති මෘදුකාංග (MIS) සහ IT/Excel පුහුණු (Banking MIS & IT Skills Training)" },
  teamLeadership: { name: "නායකත්වය හා තීරණ ගැනීමේ හැකියාව (Leadership & Decision Making)", course: "9. නායකත්ව සහ කළමනාකරණ සංවර්ධන පුහුණු (Leadership & Management Development)" },
  customerCare: { name: "සාමාජික සත්කාර හා සන්නිවේදනය (Member Care & Communication)", course: "8. සාමාජික සත්කාර සහ සන්නිවේදන පුහුණු (Member Care & Customer Relations Training)" },
  legalRecovery: { name: "නීතිමය හා අයකරගැනීම් (Legal & Recovery)", course: "7. ණය අයකරගැනීමේ සහ නීතිමය කටයුතු පිළිබඳ පුහුණු (Debt Recovery & Legal Compliance Training)" }
};

const defaultTrainingCatalog = [
  {
    id: "TRN-C01",
    no: "01",
    nameSi: "සමුපකාර සාමාන්‍ය පෙළ",
    nameEn: "Cooperative Ordinary Level",
    fullName: "1. සමුපකාර සාමාන්‍ය පෙළ (Cooperative Ordinary Level)",
    category: "මූලික දැනුම (Foundation)",
    icon: "fa-book-open",
    badgeColor: "#64748b",
    isCustom: false
  },
  {
    id: "TRN-C02",
    no: "02",
    nameSi: "සමුපකාර උසස් පෙළ",
    nameEn: "Cooperative Advanced Level",
    fullName: "2. සමුපකාර උසස් පෙළ (Cooperative Advanced Level)",
    category: "උසස් දැනුම (Advanced)",
    icon: "fa-book",
    badgeColor: "#2563eb",
    isCustom: false
  },
  {
    id: "TRN-C03",
    no: "03",
    nameSi: "සමුපකාර කළමනාකරණ ඩිප්ලෝමා",
    nameEn: "Diploma in Cooperative Management",
    fullName: "3. සමුපකාර කළමනාකරණ ඩිප්ලෝමා (Diploma in Cooperative Management)",
    category: "ඩිප්ලෝමා (Diploma)",
    icon: "fa-user-tie",
    badgeColor: "#7c3aed",
    isCustom: false
  },
  {
    id: "TRN-C04",
    no: "04",
    nameSi: "ක්ෂුද්‍ර මූල්‍ය හා ණය කළමනාකරණ පුහුණු",
    nameEn: "Microfinance & Credit Management Training",
    fullName: "4. ක්ෂුද්‍ර මූල්‍ය හා ණය කළමනාකරණ පුහුණු (Microfinance & Credit Management Training)",
    category: "මූල්‍ය හා ණය මෙහෙයුම්",
    icon: "fa-hand-holding-dollar",
    badgeColor: "#059669",
    isCustom: false
  },
  {
    id: "TRN-C05",
    no: "05",
    nameSi: "ගිණුම්කරණය සහ අභ්‍යන්තර විගණන පුහුණු",
    nameEn: "Accounting & Internal Audit Training",
    fullName: "5. ගිණුම්කරණය සහ අභ්‍යන්තර විගණන පුහුණු (Accounting & Internal Audit Training)",
    category: "ගිණුම් හා විගණනය",
    icon: "fa-file-invoice-dollar",
    badgeColor: "#0891b2",
    isCustom: false
  },
  {
    id: "TRN-C06",
    no: "06",
    nameSi: "සමිති මෘදුකාංග (MIS) සහ IT/Excel පුහුණු",
    nameEn: "Banking MIS & IT Skills Training",
    fullName: "6. සමිති මෘදුකාංග (MIS) සහ IT/Excel පුහුණු (Banking MIS & IT Skills Training)",
    category: "තොරතුරු තාක්ෂණ හා MIS",
    icon: "fa-laptop-code",
    badgeColor: "#4f46e5",
    isCustom: false
  },
  {
    id: "TRN-C07",
    no: "07",
    nameSi: "ණය අයකරගැනීමේ සහ නීතිමය කටයුතු පිළිබඳ පුහුණු",
    nameEn: "Debt Recovery & Legal Compliance Training",
    fullName: "7. ණය අයකරගැනීමේ සහ නීතිමය කටයුතු පිළිබඳ පුහුණු (Debt Recovery & Legal Compliance Training)",
    category: "නීතිමය හා අයකරගැනීම්",
    icon: "fa-scale-balanced",
    badgeColor: "#dc2626",
    isCustom: false
  },
  {
    id: "TRN-C08",
    no: "08",
    nameSi: "සාමාජික සත්කාර සහ සන්නිවේදන පුහුණු",
    nameEn: "Member Care & Customer Relations Training",
    fullName: "8. සාමාජික සත්කාර සහ සන්නිවේදන පුහුණු (Member Care & Customer Relations Training)",
    category: "සාමාජික සත්කාර හා PR",
    icon: "fa-headset",
    badgeColor: "#d97706",
    isCustom: false
  },
  {
    id: "TRN-C09",
    no: "09",
    nameSi: "නායකත්ව සහ කළමනාකරණ සංවර්ධන පුහුණු",
    nameEn: "Leadership & Management Development",
    fullName: "9. නායකත්ව සහ කළමනාකරණ සංවර්ධන පුහුණු (Leadership & Management Development)",
    category: "නායකත්වය හා කළමනාකරණය",
    icon: "fa-users-gear",
    badgeColor: "#9333ea",
    isCustom: false
  },
  {
    id: "TRN-C10",
    no: "10",
    nameSi: "ව්‍යවසායකත්ව ප්‍රවර්ධනය සහ ව්‍යාපෘති කළමනාකරණ පුහුණු",
    nameEn: "Entrepreneurship & Project Management Training",
    fullName: "10. ව්‍යවසායකත්ව ප්‍රවර්ධනය සහ ව්‍යාපෘති කළමනාකරණ පුහුණු (Entrepreneurship & Project Management Training)",
    category: "ව්‍යාපෘති හා ව්‍යවසායකත්වය",
    icon: "fa-chart-line",
    badgeColor: "#ea580c",
    isCustom: false
  }
];

function getTrainingCatalog() {
  if (!appData.trainingCatalog || !Array.isArray(appData.trainingCatalog) || appData.trainingCatalog.length === 0) {
    appData.trainingCatalog = JSON.parse(JSON.stringify(defaultTrainingCatalog));
  }
  return appData.trainingCatalog;
}

function renderApprovedTrainingCatalog() {
  const container = document.getElementById('approved-training-catalog-grid');
  if (!container) return;

  const catalog = getTrainingCatalog();

  const countBadge = document.getElementById('training-courses-count-badge');
  if (countBadge) {
    countBadge.textContent = `${catalog.length} Courses`;
  }

  container.innerHTML = catalog.map((c, idx) => `
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:12px 14px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 6px rgba(0,0,0,0.03); transition:transform 0.2s, box-shadow 0.2s; position:relative;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div style="width:36px; height:36px; border-radius:10px; background:${c.badgeColor}15; color:${c.badgeColor}; display:flex; align-items:center; justify-content:center; font-size:15px;">
            <i class="fa-solid ${c.icon || 'fa-graduation-cap'}"></i>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:10px; font-weight:800; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:6px; letter-spacing:0.5px;">NO. ${c.no || String(idx + 1).padStart(2, '0')}</span>
            ${c.isCustom ? `
              <button onclick="deleteCatalogCourse('${c.id}')" title="පාඨමාලාව ඉවත් කරන්න (Delete Course)" style="border:none; background:#fee2e2; color:#dc2626; width:22px; height:22px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; font-size:10px;">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : ''}
          </div>
        </div>
        <div style="font-weight:800; color:#1e1b4b; font-size:13px; line-height:1.35; margin-bottom:3px;">
          ${c.nameSi}
        </div>
        <div style="font-size:11px; color:#64748b; font-style:italic; margin-bottom:8px;">
          ${c.nameEn || ''}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e2e8f0; padding-top:8px; margin-top:6px;">
        <span style="font-size:10.5px; font-weight:700; color:${c.badgeColor}; background:${c.badgeColor}12; padding:3px 8px; border-radius:8px;">
          ${c.category}
        </span>
        <button class="btn-smart btn-smart-light" style="padding:4px 10px; font-size:11px; color:#7c3aed; border-color:#e9d5ff;" onclick="openManualNominationModal('${(c.fullName || `${c.nameSi} (${c.nameEn})`).replace(/'/g, "\\'")}')">
          <i class="fa-solid fa-user-plus"></i> යොමු කරන්න
        </button>
      </div>
    </div>
  `).join('');
}

function openAddCourseModal() {
  const form = document.getElementById('form-smart-add-course');
  if (form) form.reset();
  openSmartModal('modal-smart-add-course');
}

async function saveNewCourse(e) {
  e.preventDefault();
  const nameSi = document.getElementById('course-name-si')?.value?.trim();
  const nameEn = document.getElementById('course-name-en')?.value?.trim();
  const category = document.getElementById('course-category')?.value || 'වෙනත් විශේෂිත පුහුණු';
  const icon = document.getElementById('course-icon')?.value || 'fa-graduation-cap';
  const color = document.getElementById('course-color')?.value || '#7c3aed';

  if (!nameSi || !nameEn) {
    alert(currentLang === 'si' ? 'කරුණාකර පාඨමාලාවේ නම් සිංහලෙන් හා ඉංග්‍රීසියෙන් ඇතුළත් කරන්න.' : 'Please enter course names in both languages.');
    return;
  }

  const catalog = getTrainingCatalog();
  const nextNumber = catalog.length + 1;
  const newCourse = {
    id: `TRN-C${Date.now().toString().slice(-5)}`,
    no: String(nextNumber).padStart(2, '0'),
    nameSi: nameSi,
    nameEn: nameEn,
    fullName: `${nextNumber}. ${nameSi} (${nameEn})`,
    category: category,
    icon: icon,
    badgeColor: color,
    isCustom: true
  };

  catalog.push(newCourse);
  appData.trainingCatalog = catalog;
  await persistData();

  closeSmartModal('modal-smart-add-course');
  renderApprovedTrainingCatalog();
  populateNominationCoursesDropdown(newCourse.fullName);

  alert(currentLang === 'si' 
    ? `"${nameSi}" පාඨමාලාව සාර්ථකව අනුමත නාමාවලියට එක් කරන ලදී!` 
    : `"${nameSi}" successfully added to the course catalog!`);
}

async function deleteCatalogCourse(courseId) {
  const catalog = getTrainingCatalog();
  const course = catalog.find(c => c.id === courseId);
  if (!course) return;

  const msg = currentLang === 'si' 
    ? `"${course.nameSi}" පාඨමාලාව නාමාවලියෙන් ඉවත් කිරීමට අවශ්‍යද?` 
    : `Are you sure you want to remove "${course.nameSi}" from the catalog?`;
  if (!confirm(msg)) return;

  appData.trainingCatalog = catalog.filter(c => c.id !== courseId);
  
  // Re-number remaining items cleanly
  appData.trainingCatalog.forEach((c, i) => {
    c.no = String(i + 1).padStart(2, '0');
    c.fullName = `${i + 1}. ${c.nameSi} (${c.nameEn})`;
  });

  await persistData();
  renderApprovedTrainingCatalog();
  populateNominationCoursesDropdown();
}

function populateNominationCoursesDropdown(selectedValue) {
  const courseSelect = document.getElementById('nom-manual-course');
  if (!courseSelect) return;

  const catalog = getTrainingCatalog();
  courseSelect.innerHTML = catalog.map(c => `
    <option value="${c.fullName || `${c.nameSi} (${c.nameEn})`}">${c.fullName || `${c.nameSi} (${c.nameEn})`}</option>
  `).join('');

  if (selectedValue) {
    courseSelect.value = selectedValue;
  }
}

function openManualNominationModal(preselectedCourse) {
  const empSelect = document.getElementById('nom-manual-emp');
  if (empSelect) {
    if (!appData.employees || appData.employees.length === 0) {
      empSelect.innerHTML = '<option value="">-- සේවකයින් නොමැත --</option>';
    } else {
      empSelect.innerHTML = appData.employees.map(e => `
        <option value="${e.id}">${e.callingName || e.fullName} — ${e.designation} (${e.branch || 'Head Office'})</option>
      `).join('');
    }
  }

  populateNominationCoursesDropdown(preselectedCourse);

  const dateInput = document.getElementById('nom-manual-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  openSmartModal('modal-smart-manual-nomination');
}

async function saveManualNomination(e) {
  e.preventDefault();
  const empId = document.getElementById('nom-manual-emp').value;
  const courseName = document.getElementById('nom-manual-course').value;
  const priority = document.getElementById('nom-manual-priority').value;
  const date = document.getElementById('nom-manual-date').value || new Date().toISOString().split('T')[0];
  const notes = document.getElementById('nom-manual-notes').value;

  const emp = appData.employees.find(x => x.id === empId);
  if (!emp) {
    alert(currentLang === 'si' ? 'කරුණාකර වලංගු සේවකයෙකු තෝරන්න.' : 'Please select an employee.');
    return;
  }

  if (!appData.trainingNominations) appData.trainingNominations = [];

  const newNom = {
    id: `TRN-${Date.now().toString().slice(-4)}`,
    empId: emp.id,
    empName: emp.callingName || emp.fullName,
    skillKey: 'general',
    skillName: 'අනුමත පුහුණු පාඨමාලාව (Approved Course)',
    courseName: courseName,
    priority: priority,
    date: date,
    notes: notes,
    status: "Nominated"
  };

  appData.trainingNominations.unshift(newNom);
  await persistData();
  closeSmartModal('modal-smart-manual-nomination');
  renderTrainingNeedsAnalysis();
  alert(currentLang === 'si' ? `${emp.callingName || emp.fullName} සාර්ථකව "${courseName}" පුහුණුව සඳහා ලියාපදිංචි කරන ලදී!` : `Successfully nominated ${emp.fullName} for training!`);
}

async function deleteTrainingNomination(nomId) {
  if (!confirm(currentLang === 'si' ? 'මෙම පුහුණු සටහන ලොගයෙන් ඉවත් කිරීමට අවශ්‍යද?' : 'Are you sure you want to remove this training record?')) return;
  appData.trainingNominations = (appData.trainingNominations || []).filter(n => n.id !== nomId);
  await persistData();
  renderTrainingNeedsAnalysis();
}

function renderTrainingNeedsAnalysis() {
  renderApprovedTrainingCatalog();

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
          const isAlreadyNominated = (appData.trainingNominations || []).some(n => n.empId === emp.id && n.courseName === skillMetaMap[key].course && n.status === "Nominated");
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
          <td style="white-space:nowrap;">
            ${n.status !== 'Completed' ? `
              <button class="btn-smart btn-smart-success" style="padding:4px 8px; font-size:11px;" onclick="markTrainingCompleted('${n.id}')">
                <i class="fa-solid fa-check-double"></i> අවසන්
              </button>
            ` : `
              <span style="font-size:11px; color:#166534; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Upgrade</span>
            `}
            <button class="btn-smart btn-smart-light" style="padding:4px 8px; font-size:11px; color:#dc2626; border-color:#fecaca; margin-left:4px;" onclick="deleteTrainingNomination('${n.id}')" title="ඉවත් කරන්න">
              <i class="fa-solid fa-trash-can"></i>
            </button>
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
        <td colspan="12" style="text-align:center; padding:30px; color:#94a3b8;">
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
        <td>${renderStars(s.audit || 3)}</td>
        <td>${renderStars(s.bankingSoftware || 4)}</td>
        <td>${renderStars(s.excel || 4)}</td>
        <td>${renderStars(s.teamLeadership || 4)}</td>
        <td>${renderStars(s.customerCare || 5)}</td>
        <td>${renderStars(s.legalRecovery || 3)}</td>
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

  const labels = [
    'අධ්‍යාපනය (Education)',
    'ක්ෂුද්‍ර මූල්‍ය (Microfinance)',
    'ණය තක්සේරු (Credit)',
    'ගිණුම්කරණය (Accounting)',
    'විගණනය (Audit)',
    'බැංකු MIS (Banking MIS)',
    'Excel / IT',
    'නායකත්වය (Leadership)',
    'සාමාජික සත්කාර (Member Care)',
    'නීතිමය (Legal/Recovery)'
  ];
  const avgData = [4.2, 4.5, 4.2, 3.8, 3.5, 4.4, 4.2, 4.3, 4.8, 3.7];

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
// Robust date parser & formatter: handles ISO, Google Sheets Date string, etc.
function parseDateSafe(ts) {
  if (!ts) return null;
  const s = ts.toString().trim();
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  d = new Date(s.replace(' ', 'T'));
  if (!isNaN(d.getTime())) return d;
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (m) {
    const d2 = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]), parseInt(m[4] || '0'), parseInt(m[5] || '0'), parseInt(m[6] || '0'));
    if (!isNaN(d2.getTime())) return d2;
  }
  return null;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const d = parseDateSafe(ts);
  if (!d) return ts;
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoDateTimeLocal(ts) {
  if (!ts) return '';
  const d = parseDateSafe(ts);
  if (!d) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderGrievancePortal() {
  renderGrievanceQR();
  const tbody = document.querySelector('#table-grievance-body');
  if (!tbody) return;

  if (!appData.grievances || appData.grievances.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:36px; color:#94a3b8;">
          <i class="fa-solid fa-inbox" style="font-size:32px; margin-bottom:8px; display:block; opacity:0.6;"></i>
          ගැටළු හෝ යෝජනා කිසිවක් නැත (No staff grievances yet)
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = appData.grievances.map(g => {
    const actionText = g.actionTaken || g.boardNotes || '';
    const fmtTime = formatTimestamp(g.timestamp);
    return `
    <tr>
      <td><strong>${g.id}</strong></td>
      <td><span style="font-size:11px; color:#64748b;">${fmtTime}</span></td>
      <td>
        <strong style="color:${g.isAnonymous ? '#7c3aed' : '#1e1b4b'};">
          ${g.isAnonymous ? '<i class="fa-solid fa-user-shield" style="margin-right:4px; color:#7c3aed;"></i>නිර්නාමික (Anonymous)' : g.employeeName}
        </strong>
      </td>
      <td><span class="badge-pill badge-purple">${g.targetRecipient}</span></td>
      <td>
        <div style="font-weight:700;">${g.title}</div>
        <div style="font-size:11.5px; color:#64748b;">${(g.description||'').substring(0, 65)}...</div>
      </td>
      <td><span class="badge-pill ${getBadgeClass(g.status)}">${g.status}</span></td>
      <td style="min-width:240px;">
        ${actionText 
          ? `<div style="font-size:12px; color:#0f766e; font-weight:600; margin-bottom:5px; line-height:1.4; background:#f0fdf4; padding:6px 10px; border-radius:8px; border:1px solid #bbf7d0;">
               <i class="fa-solid fa-circle-check"></i> ${actionText}
             </div>` 
          : `<span style="font-size:11px; color:#94a3b8; font-style:italic; display:block; margin-bottom:5px;">ක්‍රියාමාර්ගයක් සටහන් කර නැත</span>`}
        <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
          <button class="btn-smart btn-smart-light" style="padding:3px 9px; font-size:11px;" onclick="openGrievanceReviewModal('${g.id}')">
            <i class="fa-solid ${actionText ? 'fa-pen-to-square' : 'fa-plus'}"></i> ${actionText ? 'ක්‍රියාව' : 'ක්‍රියාව +'}
          </button>
          <button class="btn-smart btn-smart-light" style="padding:3px 8px; font-size:12px; color:#7c3aed; border-color:#e9d5ff;" onclick="openEditGrievanceModal('${g.id}')" title="සංස්කරණය කරන්න (Edit)">
            <i class="fa-solid fa-file-pen"></i>
          </button>
          <button class="btn-smart btn-smart-light" style="padding:3px 8px; font-size:12px; color:#dc2626; border-color:#fecaca;" onclick="deleteSingleGrievance('${g.id}')" title="ඉවත් කරන්න (Delete)">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
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
  document.getElementById('review-grv-sender').innerHTML = g.isAnonymous ? '<i class="fa-solid fa-user-shield" style="color:#7c3aed; margin-right:4px;"></i> නිර්නාමික (100% Confidential Anonymous Staff)' : escapeHtml(g.employeeName);
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

  if (!appData.memberFeedbacks || appData.memberFeedbacks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:36px; color:#94a3b8;">
          <i class="fa-solid fa-comments" style="font-size:32px; margin-bottom:8px; display:block; opacity:0.6;"></i>
          සාමාජික අදහස් හෝ ප්‍රතිචාර කිසිවක් නැත (No member feedback yet)
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = appData.memberFeedbacks.map(f => {
    const actionText = f.actionTaken || '';
    const fmtTime = formatTimestamp(f.timestamp);
    return `
    <tr>
      <td><strong>${f.id}</strong></td>
      <td><span style="font-size:11px; color:#64748b;">${fmtTime}</span></td>
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
      <td style="min-width:240px;">
        ${actionText 
          ? `<div style="font-size:12px; color:#0f766e; font-weight:600; margin-bottom:5px; line-height:1.4; background:#f0fdf4; padding:6px 10px; border-radius:8px; border:1px solid #bbf7d0;">
               <i class="fa-solid fa-circle-check"></i> ${actionText}
             </div>` 
          : `<span style="font-size:11px; color:#94a3b8; font-style:italic; display:block; margin-bottom:5px;">ක්‍රියාමාර්ගයක් සටහන් කර නැත</span>`}
        <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap;">
          <button class="btn-smart btn-smart-light" style="padding:3px 9px; font-size:11px;" onclick="openMemberFeedbackReviewModal('${f.id}')">
            <i class="fa-solid ${actionText ? 'fa-pen-to-square' : 'fa-plus'}"></i> ${actionText ? 'ක්‍රියාව' : 'ක්‍රියාව +'}
          </button>
          <button class="btn-smart btn-smart-light" style="padding:3px 8px; font-size:12px; color:#059669; border-color:#a7f3d0;" onclick="openEditMemberFeedbackModal('${f.id}')" title="සංස්කරණය කරන්න (Edit)">
            <i class="fa-solid fa-file-pen"></i>
          </button>
          <button class="btn-smart btn-smart-light" style="padding:3px 8px; font-size:12px; color:#dc2626; border-color:#fecaca;" onclick="deleteSingleMemberFeedback('${f.id}')" title="ඉවත් කරන්න (Delete)">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
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
  document.getElementById('review-fb-date').textContent = formatTimestamp(f.timestamp) || '';
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

// =========================================================================
// 2025 RENDER FORM 1 - MAIN PAYROLL (MANUAL DATA ENTRY & EXACT 2025 COLUMNS)
// =========================================================================
function renderPayrollModule() {
  const tbody = document.querySelector('#table-payroll-body');
  if (!tbody) return;

  const monthSelect = document.getElementById('payroll-month-select');
  const selectedMonth = monthSelect ? monthSelect.value : '2025-12';
  const isYearView = (selectedMonth === '2025-YEAR');

  const history = appData.payrollHistory || [];
  const monthRecords = isYearView
    ? history.filter(r => (r.month || '').startsWith('2025-'))
    : history.filter(r => r.month === selectedMonth);

  // Registered employees
  let emps = appData.employees || [];

  // Filter based on schedule if selected
  if (currentPayrollFilter === 'perm') {
    emps = emps.filter(isPermanentEmp);
  } else if (currentPayrollFilter === 'nonperm') {
    emps = emps.filter(e => !isPermanentEmp(e));
  }

  const normEmpId = (id) => /^Y14806\s*-\s*0?3$/i.test(String(id || '').trim()) ? 'Y14806 - 03' : String(id || '').trim();

  // Merge any manual employees from monthRecords that are not yet in emps list
  const allDisplayList = [...emps];
  monthRecords.forEach(rec => {
    const rNorm = normEmpId(rec.empId);
    if (!allDisplayList.some(e => normEmpId(e.id) === rNorm)) {
      allDisplayList.push({
        id: rNorm,
        fullName: rec.empName || rNorm,
        designation: rec.designation || 'සේවකයා',
        employmentType: 'අතින් ඇතුළත් කළ',
        basicSalary: rec.basic || 0
      });
    }
  });

  if (allDisplayList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="20" style="text-align:center; padding:35px; color:#94a3b8;">
          <i class="fa-solid fa-file-invoice-dollar" style="font-size:32px; margin-bottom:10px; display:block; opacity:0.6;"></i>
          ${isYearView ? '2025 වර්ෂය සඳහා වැටුප් දත්ත කිසිවක් හමු නොවීය.' : `2025 ${selectedMonth} මාසය සඳහා වැටුප් දත්ත නොමැත — ඉහත <strong>'+ 2025 වැටුප් දත්ත ඇතුළත් කරන්න'</strong> බොත්තම ඔබා සේවක වැටුප් සටහන් කරන්න.`}
        </td>
      </tr>
    `;
    const tfoot = document.querySelector('#table-payroll-footer');
    if (tfoot) tfoot.innerHTML = '';
    const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setStat('payroll-stat-basic', 'රු. 0');
    setStat('payroll-stat-gross', 'රු. 0');
    setStat('payroll-stat-epf8', 'රු. 0');
    setStat('payroll-stat-epf12', 'රු. 0');
    setStat('payroll-stat-pension', 'රු. 0');
    setStat('payroll-stat-net', 'රු. 0');
    return;
  }

  let totBasic = 0, totIncentive = 0, totAllowance1 = 0, totAllowance2 = 0, totAtt = 0, totInterim = 0;
  let totGross = 0, totEpf20 = 0, totEmployer12 = 0;
  let totEmployee8 = 0, totEmployer25 = 0, totEmployer3 = 0, totEmployer6 = 0, totBudget = 0, totEtf3 = 0;
  let totDeductions = 0, totOt = 0, totNet = 0;

  tbody.innerHTML = allDisplayList.map(emp => {
    let dateStr, basic, incentive, allowance1, allowance2, att, interim, gross, epf20, employer12, employee8, employer25, employer3, employer6, budget, etf3, deductions, ot, net, hasSaved;

    if (isYearView) {
      const empRecs = monthRecords.filter(r => normEmpId(r.empId) === normEmpId(emp.id));
      const monthsCount = empRecs.length;
      dateStr = `<span class="badge" style="background:#e0e7ff; color:#3730a3; padding:2px 6px; font-weight:700; font-size:10px;">2025 (${monthsCount} මසක්)</span>`;

      basic = empRecs.reduce((s, r) => s + (parseFloat(r.basic) || 0), 0);
      incentive = empRecs.reduce((s, r) => s + (parseFloat(r.incentive) || 0), 0);
      allowance1 = empRecs.reduce((s, r) => s + (parseFloat(r.allowance1) || 0), 0);
      allowance2 = empRecs.reduce((s, r) => s + (parseFloat(r.allowance2) || 0), 0);
      att = empRecs.reduce((s, r) => s + (parseFloat(r.att) || 0), 0);
      interim = empRecs.reduce((s, r) => s + (parseFloat(r.interim) || 0), 0);
      gross = empRecs.reduce((s, r) => s + (parseFloat(r.gross) || 0), 0);
      epf20 = empRecs.reduce((s, r) => s + (parseFloat(r.epf20) || 0), 0);
      employer12 = empRecs.reduce((s, r) => s + (parseFloat(r.employer12) || 0), 0);
      employee8 = empRecs.reduce((s, r) => s + (parseFloat(r.employee8) || 0), 0);
      employer25 = empRecs.reduce((s, r) => s + (parseFloat(r.employer25) || 0), 0);
      employer3 = empRecs.reduce((s, r) => s + (parseFloat(r.employer3) || 0), 0);
      employer6 = empRecs.reduce((s, r) => s + (parseFloat(r.employer6) || 0), 0);
      budget = empRecs.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0);
      etf3 = empRecs.reduce((s, r) => s + (parseFloat(r.etf3) || 0), 0);
      deductions = empRecs.reduce((s, r) => s + (parseFloat(r.deductions) || 0), 0);
      ot = empRecs.reduce((s, r) => s + (parseFloat(r.ot) || 0), 0);
      net = empRecs.reduce((s, r) => s + (parseFloat(r.net) || 0), 0);
      hasSaved = monthsCount > 0;
    } else {
      const rec = monthRecords.find(r => normEmpId(r.empId) === normEmpId(emp.id));
      const isPerm = isPermanentEmp(emp);
      const defaultDate = isPerm ? `${selectedMonth}-25` : `${selectedMonth}-10`;
      dateStr = rec ? (rec.date || defaultDate) : defaultDate;

      basic = rec ? (parseFloat(rec.basic) || 0) : (parseFloat(emp.basicSalary) || 0);
      incentive = rec ? (parseFloat(rec.incentive) || 0) : 0;
      allowance1 = rec ? (parseFloat(rec.allowance1) || 0) : 0;
      allowance2 = rec ? (parseFloat(rec.allowance2) || 0) : 0;
      att = rec ? (parseFloat(rec.att) || 0) : 0;
      interim = rec ? (parseFloat(rec.interim) || 0) : 0;
      gross = rec ? (parseFloat(rec.gross) || 0) : (basic + incentive + allowance1 + allowance2 + att + interim);
      epf20 = rec ? (parseFloat(rec.epf20) || 0) : 0;
      employer12 = rec ? (parseFloat(rec.employer12) || 0) : 0;
      employee8 = rec ? (parseFloat(rec.employee8) || 0) : 0;
      employer25 = rec ? (parseFloat(rec.employer25) || 0) : 0;
      employer3 = rec ? (parseFloat(rec.employer3) || 0) : 0;
      employer6 = rec ? (parseFloat(rec.employer6) || 0) : 0;
      budget = rec ? (parseFloat(rec.budget) || 0) : 0;
      etf3 = rec ? (parseFloat(rec.etf3) || 0) : 0;
      deductions = rec ? (parseFloat(rec.deductions) || 0) : 0;
      ot = rec ? (parseFloat(rec.ot) || 0) : 0;
      net = rec ? (parseFloat(rec.net) || 0) : ((gross + budget + ot) - deductions);
      hasSaved = !!rec;
    }

    totBasic += basic;
    totIncentive += incentive;
    totAllowance1 += allowance1;
    totAllowance2 += allowance2;
    totAtt += att;
    totInterim += interim;
    totGross += gross;
    totEpf20 += epf20;
    totEmployer12 += employer12;
    totEmployee8 += employee8;
    totEmployer25 += employer25;
    totEmployer3 += employer3;
    totEmployer6 += employer6;
    totBudget += budget;
    totEtf3 += etf3;
    totDeductions += deductions;
    totOt += ot;
    totNet += net;

    return `
      <tr style="${hasSaved ? '' : 'opacity:0.92;'}">
        <td style="font-family:monospace; font-size:11px; white-space:nowrap;">${dateStr}</td>
        <td>
          <div style="font-weight:700; color:#1e1b4b;">${emp.fullName}</div>
          <div style="font-size:10.5px; color:#64748b;">${emp.id} • ${emp.designation || 'සේවක'}</div>
        </td>
        <td style="text-align:right;">${basic > 0 ? 'රු. ' + basic.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${incentive > 0 ? 'රු. ' + incentive.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${allowance1 > 0 ? 'රු. ' + allowance1.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${allowance2 > 0 ? 'රු. ' + allowance2.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${att > 0 ? 'රු. ' + att.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${interim > 0 ? 'රු. ' + interim.toLocaleString() : '-'}</td>
        <td style="text-align:right; background:#f5f3ff; font-weight:700; color:#7c3aed;">${gross > 0 ? 'රු. ' + gross.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${epf20 > 0 ? 'රු. ' + epf20.toLocaleString() : '-'}</td>
        <td style="text-align:right; color:#16a34a; font-weight:700;">${employer12 > 0 ? 'රු. ' + employer12.toLocaleString() : '-'}</td>
        <td style="text-align:right; color:#dc2626; font-weight:700;">${employee8 > 0 ? 'රු. ' + employee8.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${employer25 > 0 ? 'රු. ' + employer25.toLocaleString() : '-'}</td>
        <td style="text-align:right; color:#7c3aed;">${employer3 > 0 ? 'රු. ' + employer3.toLocaleString() : '-'}</td>
        <td style="text-align:right; color:#7c3aed;">${employer6 > 0 ? 'රු. ' + employer6.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${budget > 0 ? 'රු. ' + budget.toLocaleString() : '-'}</td>
        <td style="text-align:right; color:#0284c7; font-weight:700;">${etf3 > 0 ? 'රු. ' + etf3.toLocaleString() : '-'}</td>
        <td style="text-align:right; color:#dc2626; font-weight:700; background:#fef2f2;">${deductions > 0 ? 'රු. ' + deductions.toLocaleString() : '-'}</td>
        <td style="text-align:right;">${ot > 0 ? 'රු. ' + ot.toLocaleString() : '-'}</td>
        <td style="text-align:right; background:#f0fdf4; font-weight:800; color:#15803d; font-size:12.5px;">${net > 0 ? 'රු. ' + net.toLocaleString() : '-'}</td>
        <td style="text-align:center; white-space:nowrap;">
          ${isYearView ? `
            <button class="btn-smart btn-smart-primary" onclick="viewEmployeeAnnualStatement('${emp.id}')" title="2025 සේවක වාර්ෂික විස්තරය බලන්න" style="padding:4px 8px; font-size:11px;">
              <i class="fa-solid fa-file-invoice"></i> වාර්ෂික පත්‍රිකාව
            </button>
          ` : `
            <button class="btn-smart btn-smart-light" onclick="openAddPayrollEntryModal('${emp.id}', '${selectedMonth}')" title="දත්ත ඇතුළත් / සංස්කරණය" style="padding:4px 7px; font-size:11px; margin-right:3px;">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-smart btn-smart-primary" onclick="viewPayslipForEmp('${emp.id}', '${selectedMonth}')" title="පඩිපත බලන්න" style="padding:4px 7px; font-size:11px; margin-right:3px;">
              <i class="fa-solid fa-file-invoice"></i>
            </button>
            ${hasSaved ? `
              <button class="btn-smart btn-smart-light" onclick="deletePayrollEntry('${emp.id}', '${selectedMonth}')" title="මෙම මාසයේ දත්ත ඉවත් කරන්න" style="padding:4px 6px; font-size:11px; color:#dc2626;">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : ''}
          `}
        </td>
      </tr>
    `;
  }).join('');

  // Table Footer Grand Totals Row
  const tfoot = document.querySelector('#table-payroll-footer');
  if (tfoot) {
    tfoot.innerHTML = `
      <tr style="background:#f1f5f9; font-weight:bold; border-top:2px solid #cbd5e1; font-size:11.5px;">
        <td colspan="2" style="text-align:center; padding:8px 4px;">එකතුව (Grand Total)</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totBasic.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totIncentive.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totAllowance1.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totAllowance2.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totAtt.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totInterim.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px; color:#7c3aed;">රු. ${totGross.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totEpf20.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px; color:#16a34a;">රු. ${totEmployer12.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px; color:#dc2626;">රු. ${totEmployee8.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totEmployer25.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totEmployer3.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totEmployer6.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totBudget.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px; color:#0284c7;">රු. ${totEtf3.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px; color:#dc2626;">රු. ${totDeductions.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px;">රු. ${totOt.toLocaleString()}</td>
        <td style="text-align:right; padding:8px 4px; color:#15803d; font-size:12.5px;">රු. ${totNet.toLocaleString()}</td>
        <td></td>
      </tr>
    `;
  }

  // Update Summary Stats
  const setStat = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setStat('payroll-stat-basic', `රු. ${Math.round(totBasic).toLocaleString()}`);
  setStat('payroll-stat-gross', `රු. ${Math.round(totGross).toLocaleString()}`);
  setStat('payroll-stat-epf8', `රු. ${Math.round(totEmployee8).toLocaleString()}`);
  setStat('payroll-stat-epf12', `රු. ${Math.round(totEmployer12).toLocaleString()}`);
  setStat('payroll-stat-pension', `රු. ${Math.round(totEmployer25 + totEmployer3 + totEmployer6 + totEtf3).toLocaleString()}`);
  setStat('payroll-stat-net', `රු. ${Math.round(totNet).toLocaleString()}`);
}

function openAddPayrollEntryModal(empId = '', month = '') {
  const empSelect = document.getElementById('pay-entry-emp');
  const monthInput = document.getElementById('pay-entry-month');
  if (!empSelect || !monthInput) return;

  const rawMonth = month || (document.getElementById('payroll-month-select')?.value || '2025-12');
  const currentMonth = (rawMonth === '2025-YEAR') ? '2025-12' : rawMonth;
  monthInput.value = currentMonth;

  const emps = appData.employees || [];
  empSelect.innerHTML = '<option value="">-- සේවකයෙකු තෝරන්න --</option>' +
    emps.map(e => {
      const isPerm = isPermanentEmp(e);
      const tag = isPerm ? '[ස්ථිර]' : '[ස්ථිර නොවන]';
      return `<option value="${e.id}" ${e.id === empId ? 'selected' : ''}>${e.fullName} (${e.designation || 'සේවක'}) ${tag}</option>`;
    }).join('') +
    '<option value="NEW_MANUAL" style="font-weight:bold; color:#7c3aed; border-top:1px solid #e2e8f0;">+ නව සේවකයෙකු අතින් ඇතුළත් කරන්න (Manual Staff Entry)</option>';

  if (empId) {
    empSelect.value = empId;
  } else if (emps.length > 0) {
    empSelect.value = emps[0].id;
  }

  onPayrollEntryEmpChange();
  openSmartModal('modal-smart-payroll-entry');
}

function onPayrollEntryMonthChange() {
  const month = document.getElementById('pay-entry-month')?.value || '2025-12';
  const dateInput = document.getElementById('pay-entry-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = `${month}-25`;
  }
  onPayrollEntryEmpChange();
}

function onPayrollEntryEmpChange() {
  const empId = document.getElementById('pay-entry-emp')?.value;
  const month = document.getElementById('pay-entry-month')?.value || '2025-12';
  const manualRow = document.getElementById('pay-manual-emp-row');
  const dateInput = document.getElementById('pay-entry-date');

  // Handle NEW_MANUAL selection
  if (empId === 'NEW_MANUAL') {
    if (manualRow) manualRow.style.display = 'block';
    if (dateInput) dateInput.value = `${month}-25`;
    // Clear fields
    ['pay-entry-basic','pay-entry-incentive','pay-entry-allowance1','pay-entry-allowance2','pay-entry-att','pay-entry-interim','pay-entry-gross','pay-entry-epf20','pay-entry-employer12','pay-entry-employee8','pay-entry-employer25','pay-entry-employer3','pay-entry-employer6','pay-entry-budget','pay-entry-etf3','pay-entry-deductions','pay-entry-ot','pay-entry-net']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = 0; });
    return;
  }

  if (manualRow) manualRow.style.display = 'none';

  const emp = (appData.employees || []).find(e => e.id === empId);
  const history = appData.payrollHistory || [];
  const rec = history.find(r => r.empId === empId && r.month === month);

  const isPerm = emp ? isPermanentEmp(emp) : true;
  const defaultDate = isPerm ? `${month}-25` : `${month}-10`;

  if (dateInput) {
    dateInput.value = rec ? (rec.date || defaultDate) : defaultDate;
  }

  const basic = rec ? (rec.basic ?? (emp?.basicSalary || 0)) : (emp?.basicSalary || 0);
  const incentive = rec ? (rec.incentive || 0) : 0;
  const allowance1 = rec ? (rec.allowance1 || 0) : 0;
  const allowance2 = rec ? (rec.allowance2 || 0) : 0;
  const att = rec ? (rec.att || 0) : 0;
  const interim = rec ? (rec.interim || 0) : 0;
  const gross = rec ? (rec.gross ?? (basic + incentive + allowance1 + allowance2 + att + interim)) : (basic + incentive + allowance1 + allowance2 + att + interim);
  const epf20 = rec ? (rec.epf20 || 0) : 0;
  const employer12 = rec ? (rec.employer12 || 0) : 0;
  const employee8 = rec ? (rec.employee8 || 0) : 0;
  const employer25 = rec ? (rec.employer25 || 0) : 0;
  const employer3 = rec ? (rec.employer3 || 0) : 0;
  const employer6 = rec ? (rec.employer6 || 0) : 0;
  const budget = rec ? (rec.budget || 0) : 0;
  const etf3 = rec ? (rec.etf3 || 0) : 0;
  const deductions = rec ? (rec.deductions || 0) : 0;
  const ot = rec ? (rec.ot || 0) : 0;
  const net = rec ? (rec.net || 0) : ((gross + budget + ot) - deductions);

  const setV = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setV('pay-entry-basic', basic);
  setV('pay-entry-incentive', incentive);
  setV('pay-entry-allowance1', allowance1);
  setV('pay-entry-allowance2', allowance2);
  setV('pay-entry-att', att);
  setV('pay-entry-interim', interim);
  setV('pay-entry-gross', gross);
  setV('pay-entry-epf20', epf20);
  setV('pay-entry-employer12', employer12);
  setV('pay-entry-employee8', employee8);
  setV('pay-entry-employer25', employer25);
  setV('pay-entry-employer3', employer3);
  setV('pay-entry-employer6', employer6);
  setV('pay-entry-budget', budget);
  setV('pay-entry-etf3', etf3);
  setV('pay-entry-deductions', deductions);
  setV('pay-entry-ot', ot);
  setV('pay-entry-net', net);
}

// Optional helper to prefill standard calculated numbers if the user wants quick assistance
function autoFillPayroll2025Values() {
  const basic = parseFloat(document.getElementById('pay-entry-basic')?.value) || 0;
  const incentive = parseFloat(document.getElementById('pay-entry-incentive')?.value) || 0;
  const allowance1 = parseFloat(document.getElementById('pay-entry-allowance1')?.value) || 0;
  const allowance2 = parseFloat(document.getElementById('pay-entry-allowance2')?.value) || 0;
  const att = parseFloat(document.getElementById('pay-entry-att')?.value) || 0;
  const interim = parseFloat(document.getElementById('pay-entry-interim')?.value) || 0;
  const budget = parseFloat(document.getElementById('pay-entry-budget')?.value) || 0;
  const ot = parseFloat(document.getElementById('pay-entry-ot')?.value) || 0;

  const gross = Math.round(basic + incentive + allowance1 + allowance2 + att + interim);
  const epf20 = Math.round(basic * 0.20);
  const employer12 = Math.round(basic * 0.12);
  const employee8 = Math.round(basic * 0.08);
  const employer25 = Math.round(basic * 0.025);
  const employer3 = Math.round(basic * 0.03);
  const employer6 = Math.round(basic * 0.06);
  const etf3 = Math.round(basic * 0.03);
  const deductions = Math.round(employee8 + employer25);
  const net = Math.round((gross + budget + ot) - deductions);

  const setV = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setV('pay-entry-gross', gross);
  setV('pay-entry-epf20', epf20);
  setV('pay-entry-employer12', employer12);
  setV('pay-entry-employee8', employee8);
  setV('pay-entry-employer25', employer25);
  setV('pay-entry-employer3', employer3);
  setV('pay-entry-employer6', employer6);
  setV('pay-entry-etf3', etf3);
  setV('pay-entry-deductions', deductions);
  setV('pay-entry-net', net);
}

async function savePayrollEntry(e) {
  e.preventDefault();
  let empId = document.getElementById('pay-entry-emp').value;
  const month = document.getElementById('pay-entry-month').value;
  if (!empId || !month) return;

  let empName = '';
  let empDesig = '';

  // Handle manual new employee creation
  if (empId === 'NEW_MANUAL') {
    const manualId = document.getElementById('pay-manual-id')?.value?.trim();
    const manualName = document.getElementById('pay-manual-name')?.value?.trim();
    const manualDesig = document.getElementById('pay-manual-desig')?.value?.trim();
    const manualType = document.getElementById('pay-manual-type')?.value?.trim() || 'ස්ථිර';

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
        startDate: '2025-01-01',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
    }
    empId = manualId;
    empName = manualName;
    empDesig = manualDesig;
  } else {
    const foundEmp = (appData.employees || []).find(e => e.id === empId);
    if (foundEmp) {
      empName = foundEmp.fullName;
      empDesig = foundEmp.designation;
    }
  }

  const date = document.getElementById('pay-entry-date')?.value?.trim() || `${month}-25`;
  const basic = parseFloat(document.getElementById('pay-entry-basic')?.value) || 0;
  const incentive = parseFloat(document.getElementById('pay-entry-incentive')?.value) || 0;
  const allowance1 = parseFloat(document.getElementById('pay-entry-allowance1')?.value) || 0;
  const allowance2 = parseFloat(document.getElementById('pay-entry-allowance2')?.value) || 0;
  const att = parseFloat(document.getElementById('pay-entry-att')?.value) || 0;
  const interim = parseFloat(document.getElementById('pay-entry-interim')?.value) || 0;
  const gross = parseFloat(document.getElementById('pay-entry-gross')?.value) || 0;
  const epf20 = parseFloat(document.getElementById('pay-entry-epf20')?.value) || 0;
  const employer12 = parseFloat(document.getElementById('pay-entry-employer12')?.value) || 0;
  const employee8 = parseFloat(document.getElementById('pay-entry-employee8')?.value) || 0;
  const employer25 = parseFloat(document.getElementById('pay-entry-employer25')?.value) || 0;
  const employer3 = parseFloat(document.getElementById('pay-entry-employer3')?.value) || 0;
  const employer6 = parseFloat(document.getElementById('pay-entry-employer6')?.value) || 0;
  const budget = parseFloat(document.getElementById('pay-entry-budget')?.value) || 0;
  const etf3 = parseFloat(document.getElementById('pay-entry-etf3')?.value) || 0;
  const deductions = parseFloat(document.getElementById('pay-entry-deductions')?.value) || 0;
  const ot = parseFloat(document.getElementById('pay-entry-ot')?.value) || 0;
  const net = parseFloat(document.getElementById('pay-entry-net')?.value) || 0;

  if (!appData.payrollHistory) appData.payrollHistory = [];

  // Remove existing record for this emp+month
  appData.payrollHistory = appData.payrollHistory.filter(r => !(r.empId === empId && r.month === month));

  appData.payrollHistory.push({
    id: 'PAY-' + Date.now(),
    empId,
    empName,
    designation: empDesig,
    month,
    date,
    basic,
    incentive,
    allowance1,
    allowance2,
    att,
    interim,
    gross,
    epf20,
    employer12,
    employee8,
    employer25,
    employer3,
    employer6,
    budget,
    etf3,
    deductions,
    ot,
    net,
    updatedAt: new Date().toISOString()
  });

  await persistData();
  closeSmartModal('modal-smart-payroll-entry');
  renderPayrollModule();
  alert(currentLang === 'si' ? '2025 වැටුප් දත්ත සාර්ථකව සුරකින ලදී!' : '2025 payroll data saved successfully!');
}

async function deletePayrollEntry(empId, month) {
  if (!confirm(`මෙම සේවකයාගේ (${empId}) ${month} වැටුප් දත්ත ඉවත් කිරීමට ඔබට සහතිකද?`)) return;
  appData.payrollHistory = (appData.payrollHistory || []).filter(r => !(r.empId === empId && r.month === month));
  await persistData();
  renderPayrollModule();
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
    '<option value="NEW_MANUAL" style="font-weight:bold; color:#7c3aed;">+ නව ස්ථිර සේවකයෙකු අතින් ඇතුළත් කරන්න (Manual Staff)</option>';

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
  const month = document.getElementById('payroll-month-select')?.value || '2025-12';
  if (month === '2025-YEAR') {
    printAnnual2025Report();
    return;
  }
  const history = appData.payrollHistory || [];
  const monthRecords = history.filter(r => r.month === month);

  let emps = appData.employees || [];
  const allDisplayList = [...emps];
  monthRecords.forEach(rec => {
    if (!allDisplayList.some(e => e.id === rec.empId)) {
      allDisplayList.push({
        id: rec.empId,
        fullName: rec.empName || rec.empId,
        designation: rec.designation || 'සේවකයා'
      });
    }
  });

  const titleEl = document.getElementById('sheet-print-title');
  if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-file-invoice-dollar" style="color:#7c3aed;"></i> 2025 වර්ෂයේ මාසික වැටුප් සහ EPF/ETF නිල ලේඛනය (Form 1)';

  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  let totBasic = 0, totIncentive = 0, totAllowance1 = 0, totAllowance2 = 0, totAtt = 0, totInterim = 0;
  let totGross = 0, totEpf20 = 0, totEmployer12 = 0;
  let totEmployee8 = 0, totEmployer25 = 0, totEmployer3 = 0, totEmployer6 = 0, totBudget = 0, totEtf3 = 0;
  let totDeductions = 0, totOt = 0, totNet = 0;

  const rowsHTML = allDisplayList.map(emp => {
    const rec = monthRecords.find(r => r.empId === emp.id);
    const isPerm = isPermanentEmp(emp);
    const defaultDate = isPerm ? `${month}-25` : `${month}-10`;
    const dateStr = rec ? (rec.date || defaultDate) : defaultDate;

    const basic = rec ? (parseFloat(rec.basic) || 0) : (parseFloat(emp.basicSalary) || 0);
    const incentive = rec ? (parseFloat(rec.incentive) || 0) : 0;
    const allowance1 = rec ? (parseFloat(rec.allowance1) || 0) : 0;
    const allowance2 = rec ? (parseFloat(rec.allowance2) || 0) : 0;
    const att = rec ? (parseFloat(rec.att) || 0) : 0;
    const interim = rec ? (parseFloat(rec.interim) || 0) : 0;
    const gross = rec ? (parseFloat(rec.gross) || 0) : (basic + incentive + allowance1 + allowance2 + att + interim);
    const epf20 = rec ? (parseFloat(rec.epf20) || 0) : 0;
    const employer12 = rec ? (parseFloat(rec.employer12) || 0) : 0;
    const employee8 = rec ? (parseFloat(rec.employee8) || 0) : 0;
    const employer25 = rec ? (parseFloat(rec.employer25) || 0) : 0;
    const employer3 = rec ? (parseFloat(rec.employer3) || 0) : 0;
    const employer6 = rec ? (parseFloat(rec.employer6) || 0) : 0;
    const budget = rec ? (parseFloat(rec.budget) || 0) : 0;
    const etf3 = rec ? (parseFloat(rec.etf3) || 0) : 0;
    const deductions = rec ? (parseFloat(rec.deductions) || 0) : 0;
    const ot = rec ? (parseFloat(rec.ot) || 0) : 0;
    const net = rec ? (parseFloat(rec.net) || 0) : ((gross + budget + ot) - deductions);

    totBasic += basic;
    totIncentive += incentive;
    totAllowance1 += allowance1;
    totAllowance2 += allowance2;
    totAtt += att;
    totInterim += interim;
    totGross += gross;
    totEpf20 += epf20;
    totEmployer12 += employer12;
    totEmployee8 += employee8;
    totEmployer25 += employer25;
    totEmployer3 += employer3;
    totEmployer6 += employer6;
    totBudget += budget;
    totEtf3 += etf3;
    totDeductions += deductions;
    totOt += ot;
    totNet += net;

    return `
      <tr>
        <td style="padding:4px 2px; font-size:9.5px; white-space:nowrap;">${dateStr}</td>
        <td style="text-align:left; padding:4px; font-size:9.5px;"><strong>${emp.id}</strong> - ${emp.fullName}</td>
        <td style="padding:4px 2px; text-align:right;">${basic > 0 ? basic.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${incentive > 0 ? incentive.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${allowance1 > 0 ? allowance1.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${allowance2 > 0 ? allowance2.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${att > 0 ? att.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${interim > 0 ? interim.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right; font-weight:bold; background:#f9f9f9;">${gross > 0 ? gross.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${epf20 > 0 ? epf20.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer12 > 0 ? employer12.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employee8 > 0 ? employee8.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer25 > 0 ? employer25.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer3 > 0 ? employer3.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer6 > 0 ? employer6.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${budget > 0 ? budget.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${etf3 > 0 ? etf3.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right; font-weight:bold;">${deductions > 0 ? deductions.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${ot > 0 ? ot.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right; font-weight:bold; font-size:10.5px; background:#f9f9f9;">${net > 0 ? net.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; width:70px;"></td>
      </tr>
    `;
  }).join('');

  content.innerHTML = `
    <div style="background:#fff; font-family:'Segoe UI',Arial,sans-serif; color:#000; min-width:1100px;">
      <!-- GSCS Official Boxed Header -->
      <div style="border:2px solid #000; padding:10px 14px; margin-bottom:12px; text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:20px;">
          <img src="images/gscs_logo.png" alt="GSCS Logo" style="height:50px;">
          <div>
            <h3 style="font-size:15px; font-weight:800; margin:0 0 2px;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</h3>
            <div style="font-size:12px; font-weight:700; letter-spacing:0.5px;">GALAPITIYAGAMA THRIFT & CREDIT CO-OPERATIVE SOCIETY</div>
            <div style="font-size:11px; margin-top:3px;">
              <strong>Reg No: කුලි/395</strong> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Reg Date: 1987/03/24</strong>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:11.5px; font-weight:700;">
        <span>2025 වර්ෂයේ මාසික වැටුප්, EPF/ETF හා දීමනා නිල ලේඛනය (Monthly Salary Register - ${month})</span>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:5px 2px; width:70px;">දිනය</th>
            <th style="padding:5px 4px; text-align:left;">සේවා අංකය සහ නම</th>
            <th style="padding:5px 2px;">මූලික වැටුප</th>
            <th style="padding:5px 2px;">දිරිදීමනා / වැටුප් වර්ධක</th>
            <th style="padding:5px 2px;">දීමනා 01</th>
            <th style="padding:5px 2px;">දීමනා 02</th>
            <th style="padding:5px 2px;">පැමිණීමේ දීමනා</th>
            <th style="padding:5px 2px;">අන්තර් දීමනාව</th>
            <th style="padding:5px 2px; background:#e6e6e6;">එකතුව</th>
            <th style="padding:5px 2px;">අර්ථසාධක 20%</th>
            <th style="padding:5px 2px;">සේව්‍ය 12%</th>
            <th style="padding:5px 2px;">සේවක 8%</th>
            <th style="padding:5px 2px;">සේව්‍ය 2.5%</th>
            <th style="padding:5px 2px;">සේව්‍ය 3%</th>
            <th style="padding:5px 2px;">සේව්‍ය 6%</th>
            <th style="padding:5px 2px;">අයවැය දීමනා</th>
            <th style="padding:5px 2px;">සේවක භාරකාර 3%</th>
            <th style="padding:5px 2px;">අඩු කිරීම් එකතුව</th>
            <th style="padding:5px 2px;">අතිකාල ගෙවීම්</th>
            <th style="padding:5px 2px; font-weight:bold; background:#e6e6e6;">ශුද්ධ වැටුප</th>
            <th style="padding:5px 2px; width:70px;">අත්සන</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
        <tfoot>
          <tr style="background:#f2f2f2; font-weight:bold; border-top:2px solid #000;">
            <td colspan="2" style="padding:5px 4px; text-align:center;">එකතුව (Grand Total)</td>
            <td style="padding:5px 2px; text-align:right;">${totBasic > 0 ? totBasic.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totIncentive > 0 ? totIncentive.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totAllowance1 > 0 ? totAllowance1.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totAllowance2 > 0 ? totAllowance2.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totAtt > 0 ? totAtt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totInterim > 0 ? totInterim.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${totGross > 0 ? totGross.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEpf20 > 0 ? totEpf20.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer12 > 0 ? totEmployer12.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployee8 > 0 ? totEmployee8.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer25 > 0 ? totEmployer25.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer3 > 0 ? totEmployer3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer6 > 0 ? totEmployer6.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totBudget > 0 ? totBudget.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEtf3 > 0 ? totEtf3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${totDeductions > 0 ? totDeductions.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totOt > 0 ? totOt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold; font-size:10.5px;">${totNet > 0 ? totNet.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px;"></td>
          </tr>
        </tfoot>
      </table>

      <div style="display:flex; justify-content:space-between; margin-top:35px; font-size:10.5px; text-align:center;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (Internal Audit)</div>
        <div>...................................<br>අනුමත කළේ (General Manager / Chairman)</div>
      </div>

      <div style="border-top:1.5px solid #000; margin-top:20px; padding-top:5px; display:flex; justify-content:space-between; font-size:9px; color:#333;">
        <span>ගලපිටියාගම සණස සමුපකාර සමිතිය</span>
        <span style="font-weight:700;">Report generated by Galapitiyagama Sanasa Cooperative HRMS System (2025 Ledger)</span>
        <span>පිටුව: 1</span>
      </div>
    </div>
  `;

  openSmartModal('modal-smart-sheet-print');
}


let currentAnnualReportTab = 'both';

function switchAnnualReportTab(tab) {
  currentAnnualReportTab = tab;
  printAnnual2025Report(tab);
}

function printAnnual2025Report(viewMode = null) {
  if (viewMode) currentAnnualReportTab = viewMode;
  const tab = currentAnnualReportTab || 'both';

  const history = appData.payrollHistory || [];
  const yearRecords = history.filter(r => (r.month || '').startsWith('2025-'));
  const emps = appData.employees || [];

  const titleEl = document.getElementById('sheet-print-title');
  if (titleEl) {
    titleEl.innerHTML = '<i class="fa-solid fa-calendar-check" style="color:#2563eb;"></i> 2025 වර්ෂයේ වාර්ෂික වැටුප් සහ EPF/ETF නිල ලේඛනය (Annual Payroll Register - 2025)';
  }

  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  const months = [
    { code: '2025-01', name: '2025 ජනවාරි' },
    { code: '2025-02', name: '2025 පෙබරවාරි' },
    { code: '2025-03', name: '2025 මාර්තු' },
    { code: '2025-04', name: '2025 අප්‍රේල්' },
    { code: '2025-05', name: '2025 මැයි' },
    { code: '2025-06', name: '2025 ජූනි' },
    { code: '2025-07', name: '2025 ජූලි' },
    { code: '2025-08', name: '2025 අගෝස්තු' },
    { code: '2025-09', name: '2025 සැප්තැම්බර්' },
    { code: '2025-10', name: '2025 ඔක්තෝබර්' },
    { code: '2025-11', name: '2025 නොවැම්බර්' },
    { code: '2025-12', name: '2025 දෙසැම්බර්' }
  ];

  let totYearBasic = 0, totYearIncentive = 0, totYearAllowance1 = 0, totYearAllowance2 = 0, totYearAtt = 0, totYearInterim = 0;
  let totYearGross = 0, totYearEpf20 = 0, totYearEmployer12 = 0;
  let totYearEmployee8 = 0, totYearEmployer25 = 0, totYearEmployer3 = 0, totYearEmployer6 = 0, totYearBudget = 0, totYearEtf3 = 0;
  let totYearDeductions = 0, totYearOt = 0, totYearNet = 0;
  let totEmpMonthsCount = 0;

  const monthlyRowsHTML = months.map((m, idx) => {
    const mRecs = yearRecords.filter(r => r.month === m.code);
    const empCount = mRecs.length;
    totEmpMonthsCount += empCount;

    const basic = mRecs.reduce((s, r) => s + (parseFloat(r.basic) || 0), 0);
    const incentive = mRecs.reduce((s, r) => s + (parseFloat(r.incentive) || 0), 0);
    const allowance1 = mRecs.reduce((s, r) => s + (parseFloat(r.allowance1) || 0), 0);
    const allowance2 = mRecs.reduce((s, r) => s + (parseFloat(r.allowance2) || 0), 0);
    const att = mRecs.reduce((s, r) => s + (parseFloat(r.att) || 0), 0);
    const interim = mRecs.reduce((s, r) => s + (parseFloat(r.interim) || 0), 0);
    const gross = mRecs.reduce((s, r) => s + (parseFloat(r.gross) || 0), 0);
    const epf20 = mRecs.reduce((s, r) => s + (parseFloat(r.epf20) || 0), 0);
    const employer12 = mRecs.reduce((s, r) => s + (parseFloat(r.employer12) || 0), 0);
    const employee8 = mRecs.reduce((s, r) => s + (parseFloat(r.employee8) || 0), 0);
    const employer25 = mRecs.reduce((s, r) => s + (parseFloat(r.employer25) || 0), 0);
    const employer3 = mRecs.reduce((s, r) => s + (parseFloat(r.employer3) || 0), 0);
    const employer6 = mRecs.reduce((s, r) => s + (parseFloat(r.employer6) || 0), 0);
    const budget = mRecs.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0);
    const etf3 = mRecs.reduce((s, r) => s + (parseFloat(r.etf3) || 0), 0);
    const deductions = mRecs.reduce((s, r) => s + (parseFloat(r.deductions) || 0), 0);
    const ot = mRecs.reduce((s, r) => s + (parseFloat(r.ot) || 0), 0);
    const net = mRecs.reduce((s, r) => s + (parseFloat(r.net) || 0), 0);

    totYearBasic += basic;
    totYearIncentive += incentive;
    totYearAllowance1 += allowance1;
    totYearAllowance2 += allowance2;
    totYearAtt += att;
    totYearInterim += interim;
    totYearGross += gross;
    totYearEpf20 += epf20;
    totYearEmployer12 += employer12;
    totYearEmployee8 += employee8;
    totYearEmployer25 += employer25;
    totYearEmployer3 += employer3;
    totYearEmployer6 += employer6;
    totYearBudget += budget;
    totYearEtf3 += etf3;
    totYearDeductions += deductions;
    totYearOt += ot;
    totYearNet += net;

    return `
      <tr>
        <td style="padding:5px 3px; font-weight:700;">${idx + 1}</td>
        <td style="text-align:left; padding:5px 6px; font-weight:700;">${m.name}</td>
        <td style="padding:5px 2px; text-align:center;">${empCount > 0 ? empCount : '<span style="color:#94a3b8;">-</span>'}</td>
        <td style="padding:5px 2px; text-align:right;">${basic > 0 ? basic.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${incentive > 0 ? incentive.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${allowance1 > 0 ? allowance1.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${allowance2 > 0 ? allowance2.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${att > 0 ? att.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${interim > 0 ? interim.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right; font-weight:bold; background:#f9f9f9;">${gross > 0 ? gross.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${epf20 > 0 ? epf20.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer12 > 0 ? employer12.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employee8 > 0 ? employee8.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer25 > 0 ? employer25.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer3 > 0 ? employer3.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer6 > 0 ? employer6.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${budget > 0 ? budget.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${etf3 > 0 ? etf3.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right; font-weight:bold;">${deductions > 0 ? deductions.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${ot > 0 ? ot.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right; font-weight:bold; font-size:10.5px; background:#f9f9f9;">${net > 0 ? net.toLocaleString() : '-'}</td>
      </tr>
    `;
  }).join('');

  // Staff-wise aggregation
  const normEmpId = (id) => /^Y14806\s*-\s*0?3$/i.test(String(id || '').trim()) ? 'Y14806 - 03' : String(id || '').trim();
  const allStaffMap = {};
  emps.forEach(e => {
    const nid = normEmpId(e.id);
    allStaffMap[nid] = { id: nid, fullName: e.fullName || nid, designation: e.designation || '-' };
  });
  yearRecords.forEach(r => {
    const nid = normEmpId(r.empId);
    if (!allStaffMap[nid]) {
      allStaffMap[nid] = { id: nid, fullName: r.empName || nid, designation: r.designation || '-' };
    }
  });

  const staffList = Object.values(allStaffMap);
  let staffTotBasic = 0, staffTotIncentive = 0, staffTotAllowance1 = 0, staffTotAllowance2 = 0, staffTotAtt = 0, staffTotInterim = 0;
  let staffTotGross = 0, staffTotEpf20 = 0, staffTotEmployer12 = 0;
  let staffTotEmployee8 = 0, staffTotEmployer25 = 0, staffTotEmployer3 = 0, staffTotEmployer6 = 0, staffTotBudget = 0, staffTotEtf3 = 0;
  let staffTotDeductions = 0, staffTotOt = 0, staffTotNet = 0;

  const staffRowsHTML = staffList.map((emp, sIdx) => {
    const eRecs = yearRecords.filter(r => normEmpId(r.empId) === emp.id);
    const monthsCount = eRecs.length;

    const basic = eRecs.reduce((s, r) => s + (parseFloat(r.basic) || 0), 0);
    const incentive = eRecs.reduce((s, r) => s + (parseFloat(r.incentive) || 0), 0);
    const allowance1 = eRecs.reduce((s, r) => s + (parseFloat(r.allowance1) || 0), 0);
    const allowance2 = eRecs.reduce((s, r) => s + (parseFloat(r.allowance2) || 0), 0);
    const att = eRecs.reduce((s, r) => s + (parseFloat(r.att) || 0), 0);
    const interim = eRecs.reduce((s, r) => s + (parseFloat(r.interim) || 0), 0);
    const gross = eRecs.reduce((s, r) => s + (parseFloat(r.gross) || 0), 0);
    const epf20 = eRecs.reduce((s, r) => s + (parseFloat(r.epf20) || 0), 0);
    const employer12 = eRecs.reduce((s, r) => s + (parseFloat(r.employer12) || 0), 0);
    const employee8 = eRecs.reduce((s, r) => s + (parseFloat(r.employee8) || 0), 0);
    const employer25 = eRecs.reduce((s, r) => s + (parseFloat(r.employer25) || 0), 0);
    const employer3 = eRecs.reduce((s, r) => s + (parseFloat(r.employer3) || 0), 0);
    const employer6 = eRecs.reduce((s, r) => s + (parseFloat(r.employer6) || 0), 0);
    const budget = eRecs.reduce((s, r) => s + (parseFloat(r.budget) || 0), 0);
    const etf3 = eRecs.reduce((s, r) => s + (parseFloat(r.etf3) || 0), 0);
    const deductions = eRecs.reduce((s, r) => s + (parseFloat(r.deductions) || 0), 0);
    const ot = eRecs.reduce((s, r) => s + (parseFloat(r.ot) || 0), 0);
    const net = eRecs.reduce((s, r) => s + (parseFloat(r.net) || 0), 0);

    staffTotBasic += basic;
    staffTotIncentive += incentive;
    staffTotAllowance1 += allowance1;
    staffTotAllowance2 += allowance2;
    staffTotAtt += att;
    staffTotInterim += interim;
    staffTotGross += gross;
    staffTotEpf20 += epf20;
    staffTotEmployer12 += employer12;
    staffTotEmployee8 += employee8;
    staffTotEmployer25 += employer25;
    staffTotEmployer3 += employer3;
    staffTotEmployer6 += employer6;
    staffTotBudget += budget;
    staffTotEtf3 += etf3;
    staffTotDeductions += deductions;
    staffTotOt += ot;
    staffTotNet += net;

    return `
      <tr>
        <td style="padding:5px 3px;">${sIdx + 1}</td>
        <td style="text-align:left; padding:5px 4px; font-size:9.5px;">
          <strong>${emp.id}</strong> - ${emp.fullName}
          <div style="font-size:8.5px; color:#555;">${emp.designation || '-'}</div>
        </td>
        <td style="padding:5px 2px; text-align:center;">${monthsCount > 0 ? `${monthsCount} මසක්` : '<span style="color:#94a3b8;">-</span>'}</td>
        <td style="padding:5px 2px; text-align:right;">${basic > 0 ? basic.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${incentive > 0 ? incentive.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${allowance1 > 0 ? allowance1.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${allowance2 > 0 ? allowance2.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${att > 0 ? att.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${interim > 0 ? interim.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right; font-weight:bold; background:#f9f9f9;">${gross > 0 ? gross.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${epf20 > 0 ? epf20.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer12 > 0 ? employer12.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employee8 > 0 ? employee8.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer25 > 0 ? employer25.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer3 > 0 ? employer3.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${employer6 > 0 ? employer6.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${budget > 0 ? budget.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${etf3 > 0 ? etf3.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right; font-weight:bold;">${deductions > 0 ? deductions.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right;">${ot > 0 ? ot.toLocaleString() : '-'}</td>
        <td style="padding:5px 2px; text-align:right; font-weight:bold; font-size:10.5px; background:#f9f9f9;">${net > 0 ? net.toLocaleString() : '-'}</td>
      </tr>
    `;
  }).join('');

  // Headers & Bodies
  const sectionHeader = `
    <!-- GSCS Official Boxed Header -->
    <div style="border:2px solid #000; padding:10px 14px; margin-bottom:12px; text-align:center;">
      <div style="display:flex; align-items:center; justify-content:center; gap:20px;">
        <img src="images/gscs_logo.png" alt="GSCS Logo" style="height:50px;">
        <div>
          <h3 style="font-size:15px; font-weight:800; margin:0 0 2px;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</h3>
          <div style="font-size:12px; font-weight:700; letter-spacing:0.5px;">GALAPITIYAGAMA THRIFT & CREDIT CO-OPERATIVE SOCIETY</div>
          <div style="font-size:11px; margin-top:3px;">
            <strong>Reg No: කුලි/395</strong> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Reg Date: 1987/03/24</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  const monthlyTableHTML = `
    <div style="margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11.5px; font-weight:700;">
        <span><i class="fa-solid fa-calendar-days" style="color:#2563eb; margin-right:6px;"></i>1. 2025 මාසික සාරාංශ ලේඛනය (Month-by-Month Annual Breakdown - 12 Months)</span>
        <span>වාර්ෂික ලේඛනය: 2025</span>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:5px 2px; width:28px;">#</th>
            <th style="padding:5px 4px; text-align:left;">මාසය</th>
            <th style="padding:5px 2px; width:45px;">සේවක ගණන</th>
            <th style="padding:5px 2px;">මූලික වැටුප</th>
            <th style="padding:5px 2px;">දිරිදීමනා / වැටුප් වර්ධක</th>
            <th style="padding:5px 2px;">දීමනා 01</th>
            <th style="padding:5px 2px;">දීමනා 02</th>
            <th style="padding:5px 2px;">පැමිණීමේ දීමනා</th>
            <th style="padding:5px 2px;">අන්තර් දීමනාව</th>
            <th style="padding:5px 2px; background:#e6e6e6;">එකතුව</th>
            <th style="padding:5px 2px;">අර්ථසාධක 20%</th>
            <th style="padding:5px 2px;">සේව්‍ය 12%</th>
            <th style="padding:5px 2px;">සේවක 8%</th>
            <th style="padding:5px 2px;">සේව්‍ය 2.5%</th>
            <th style="padding:5px 2px;">සේව්‍ය 3%</th>
            <th style="padding:5px 2px;">සේව්‍ය 6%</th>
            <th style="padding:5px 2px;">අයවැය දීමනා</th>
            <th style="padding:5px 2px;">සේවක භාරකාර 3%</th>
            <th style="padding:5px 2px;">අඩු කිරීම් එකතුව</th>
            <th style="padding:5px 2px;">අතිකාල ගෙවීම්</th>
            <th style="padding:5px 2px; font-weight:bold; background:#e6e6e6;">ශුද්ධ වැටුප</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyRowsHTML}
        </tbody>
        <tfoot>
          <tr style="background:#f2f2f2; font-weight:bold; border-top:2px solid #000;">
            <td colspan="2" style="padding:5px 4px; text-align:center;">වසරේ මුළු එකතුව (2025 Annual Total)</td>
            <td style="padding:5px 2px; text-align:center;">${totEmpMonthsCount}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearBasic > 0 ? totYearBasic.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearIncentive > 0 ? totYearIncentive.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearAllowance1 > 0 ? totYearAllowance1.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearAllowance2 > 0 ? totYearAllowance2.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearAtt > 0 ? totYearAtt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearInterim > 0 ? totYearInterim.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${totYearGross > 0 ? totYearGross.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearEpf20 > 0 ? totYearEpf20.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearEmployer12 > 0 ? totYearEmployer12.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearEmployee8 > 0 ? totYearEmployee8.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearEmployer25 > 0 ? totYearEmployer25.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearEmployer3 > 0 ? totYearEmployer3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearEmployer6 > 0 ? totYearEmployer6.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearBudget > 0 ? totYearBudget.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearEtf3 > 0 ? totYearEtf3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${totYearDeductions > 0 ? totYearDeductions.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totYearOt > 0 ? totYearOt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold; font-size:10.5px;">${totYearNet > 0 ? totYearNet.toLocaleString() : '-'}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const staffTableHTML = `
    <div style="margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11.5px; font-weight:700;">
        <span><i class="fa-solid fa-users" style="color:#7c3aed; margin-right:6px;"></i>2. 2025 සේවක අනුව වාර්ෂික වැටුප් සාරාංශය (Staff Cumulative Annual Summary)</span>
        <span>සේවකයින් ගණන: ${staffList.length}</span>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:5px 2px; width:28px;">#</th>
            <th style="padding:5px 4px; text-align:left;">සේවා අංකය සහ නම</th>
            <th style="padding:5px 2px; width:50px;">ගෙවූ මාස</th>
            <th style="padding:5px 2px;">මූලික වැටුප</th>
            <th style="padding:5px 2px;">දිරිදීමනා / වැටුප් වර්ධක</th>
            <th style="padding:5px 2px;">දීමනා 01</th>
            <th style="padding:5px 2px;">දීමනා 02</th>
            <th style="padding:5px 2px;">පැමිණීමේ දීමනා</th>
            <th style="padding:5px 2px;">අන්තර් දීමනාව</th>
            <th style="padding:5px 2px; background:#e6e6e6;">එකතුව</th>
            <th style="padding:5px 2px;">අර්ථසාධක 20%</th>
            <th style="padding:5px 2px;">සේව්‍ය 12%</th>
            <th style="padding:5px 2px;">සේවක 8%</th>
            <th style="padding:5px 2px;">සේව්‍ය 2.5%</th>
            <th style="padding:5px 2px;">සේව්‍ය 3%</th>
            <th style="padding:5px 2px;">සේව්‍ය 6%</th>
            <th style="padding:5px 2px;">අයවැය දීමනා</th>
            <th style="padding:5px 2px;">සේවක භාරකාර 3%</th>
            <th style="padding:5px 2px;">අඩු කිරීම් එකතුව</th>
            <th style="padding:5px 2px;">අතිකාල ගෙවීම්</th>
            <th style="padding:5px 2px; font-weight:bold; background:#e6e6e6;">ශුද්ධ වැටුප</th>
          </tr>
        </thead>
        <tbody>
          ${staffRowsHTML}
        </tbody>
        <tfoot>
          <tr style="background:#f2f2f2; font-weight:bold; border-top:2px solid #000;">
            <td colspan="2" style="padding:5px 4px; text-align:center;">වසරේ මුළු එකතුව (2025 Annual Total)</td>
            <td style="padding:5px 2px; text-align:center;">-</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotBasic > 0 ? staffTotBasic.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotIncentive > 0 ? staffTotIncentive.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotAllowance1 > 0 ? staffTotAllowance1.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotAllowance2 > 0 ? staffTotAllowance2.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotAtt > 0 ? staffTotAtt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotInterim > 0 ? staffTotInterim.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${staffTotGross > 0 ? staffTotGross.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotEpf20 > 0 ? staffTotEpf20.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotEmployer12 > 0 ? staffTotEmployer12.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotEmployee8 > 0 ? staffTotEmployee8.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotEmployer25 > 0 ? staffTotEmployer25.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotEmployer3 > 0 ? staffTotEmployer3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotEmployer6 > 0 ? staffTotEmployer6.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotBudget > 0 ? staffTotBudget.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotEtf3 > 0 ? staffTotEtf3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${staffTotDeductions > 0 ? staffTotDeductions.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${staffTotOt > 0 ? staffTotOt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold; font-size:10.5px;">${staffTotNet > 0 ? staffTotNet.toLocaleString() : '-'}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const toolbarHTML = `
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:8px 12px; border-radius:8px; margin-bottom:14px;">
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="font-size:12px; font-weight:700; color:#334155;"><i class="fa-solid fa-filter"></i> පෙන්වන වාර්තාව:</span>
        <button class="btn-smart ${tab === 'monthly' ? 'btn-smart-primary' : 'btn-smart-light'}" onclick="switchAnnualReportTab('monthly')" style="padding:4px 10px; font-size:11.5px; display:inline-flex; align-items:center; gap:5px;">
          <i class="fa-solid fa-calendar-days"></i> මාස 12 සාරාංශය
        </button>
        <button class="btn-smart ${tab === 'staff' ? 'btn-smart-primary' : 'btn-smart-light'}" onclick="switchAnnualReportTab('staff')" style="padding:4px 10px; font-size:11.5px; display:inline-flex; align-items:center; gap:5px;">
          <i class="fa-solid fa-users"></i> සේවක අනුව සාරාංශය
        </button>
        <button class="btn-smart ${tab === 'both' ? 'btn-smart-primary' : 'btn-smart-light'}" onclick="switchAnnualReportTab('both')" style="padding:4px 10px; font-size:11.5px; display:inline-flex; align-items:center; gap:5px;">
          <i class="fa-solid fa-file-lines"></i> සම්පූර්ණ වාර්තාව (Both)
        </button>
      </div>
      <div style="font-size:11.5px; color:#475569; font-weight:600;">
        2025 මුළු ශුද්ධ වැටුප: <strong style="color:#15803d;">රු. ${totYearNet.toLocaleString()}</strong>
      </div>
    </div>
  `;

  const signoffHTML = `
    <div style="display:flex; justify-content:space-between; margin-top:35px; font-size:10.5px; text-align:center;">
      <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
      <div>...................................<br>පරීක්ෂා කළේ (Internal Audit)</div>
      <div>...................................<br>අනුමත කළේ (General Manager / Chairman)</div>
    </div>

    <div style="border-top:1.5px solid #000; margin-top:20px; padding-top:5px; display:flex; justify-content:space-between; font-size:9px; color:#333;">
      <span>ගලපිටියාගම සණස සමුපකාර සමිතිය</span>
      <span style="font-weight:700;">Report generated by Galapitiyagama Sanasa Cooperative HRMS System (2025 Annual Audit Report)</span>
    </div>
  `;

  let mainBodyHTML = '';
  if (tab === 'monthly') {
    mainBodyHTML = `${sectionHeader}${monthlyTableHTML}${signoffHTML}`;
  } else if (tab === 'staff') {
    mainBodyHTML = `${sectionHeader}${staffTableHTML}${signoffHTML}`;
  } else {
    // Both
    mainBodyHTML = `
      ${sectionHeader}
      ${monthlyTableHTML}
      <div style="page-break-before: always; margin-top:30px; padding-top:10px;"></div>
      ${sectionHeader}
      ${staffTableHTML}
      ${signoffHTML}
    `;
  }

  content.innerHTML = `
    <div style="background:#fff; font-family:'Segoe UI',Arial,sans-serif; color:#000; min-width:1150px;">
      ${toolbarHTML}
      ${mainBodyHTML}
    </div>
  `;

  openSmartModal('modal-smart-sheet-print');
}

function viewEmployeeAnnualStatement(empId) {
  const normId = (id) => /^Y14806\s*-\s*0?3$/i.test(String(id || '').trim()) ? 'Y14806 - 03' : String(id || '').trim();
  const targetId = normId(empId);
  const emp = (appData.employees || []).find(e => normId(e.id) === targetId) || { id: targetId, fullName: targetId, designation: '-' };
  const history = appData.payrollHistory || [];
  const empRecords = history.filter(r => normId(r.empId) === targetId && (r.month || '').startsWith('2025-'));

  const months = [
    { code: '2025-01', name: '2025 ජනවාරි' },
    { code: '2025-02', name: '2025 පෙබරවාරි' },
    { code: '2025-03', name: '2025 මාර්තු' },
    { code: '2025-04', name: '2025 අප්‍රේල්' },
    { code: '2025-05', name: '2025 මැයි' },
    { code: '2025-06', name: '2025 ජූනි' },
    { code: '2025-07', name: '2025 ජූලි' },
    { code: '2025-08', name: '2025 අගෝස්තු' },
    { code: '2025-09', name: '2025 සැප්තැම්බර්' },
    { code: '2025-10', name: '2025 ඔක්තෝබර්' },
    { code: '2025-11', name: '2025 නොවැම්බර්' },
    { code: '2025-12', name: '2025 දෙසැම්බර්' }
  ];

  let totBasic = 0, totIncentive = 0, totAllowance1 = 0, totAllowance2 = 0, totAtt = 0, totInterim = 0;
  let totGross = 0, totEpf20 = 0, totEmployer12 = 0;
  let totEmployee8 = 0, totEmployer25 = 0, totEmployer3 = 0, totEmployer6 = 0, totBudget = 0, totEtf3 = 0;
  let totDeductions = 0, totOt = 0, totNet = 0;

  const rowsHTML = months.map((m, idx) => {
    const rec = empRecords.find(r => r.month === m.code);
    const basic = rec ? (parseFloat(rec.basic) || 0) : 0;
    const incentive = rec ? (parseFloat(rec.incentive) || 0) : 0;
    const allowance1 = rec ? (parseFloat(rec.allowance1) || 0) : 0;
    const allowance2 = rec ? (parseFloat(rec.allowance2) || 0) : 0;
    const att = rec ? (parseFloat(rec.att) || 0) : 0;
    const interim = rec ? (parseFloat(rec.interim) || 0) : 0;
    const gross = rec ? (parseFloat(rec.gross) || 0) : 0;
    const epf20 = rec ? (parseFloat(rec.epf20) || 0) : 0;
    const employer12 = rec ? (parseFloat(rec.employer12) || 0) : 0;
    const employee8 = rec ? (parseFloat(rec.employee8) || 0) : 0;
    const employer25 = rec ? (parseFloat(rec.employer25) || 0) : 0;
    const employer3 = rec ? (parseFloat(rec.employer3) || 0) : 0;
    const employer6 = rec ? (parseFloat(rec.employer6) || 0) : 0;
    const budget = rec ? (parseFloat(rec.budget) || 0) : 0;
    const etf3 = rec ? (parseFloat(rec.etf3) || 0) : 0;
    const deductions = rec ? (parseFloat(rec.deductions) || 0) : 0;
    const ot = rec ? (parseFloat(rec.ot) || 0) : 0;
    const net = rec ? (parseFloat(rec.net) || 0) : 0;

    totBasic += basic;
    totIncentive += incentive;
    totAllowance1 += allowance1;
    totAllowance2 += allowance2;
    totAtt += att;
    totInterim += interim;
    totGross += gross;
    totEpf20 += epf20;
    totEmployer12 += employer12;
    totEmployee8 += employee8;
    totEmployer25 += employer25;
    totEmployer3 += employer3;
    totEmployer6 += employer6;
    totBudget += budget;
    totEtf3 += etf3;
    totDeductions += deductions;
    totOt += ot;
    totNet += net;

    return `
      <tr>
        <td style="padding:4px 3px;">${idx + 1}</td>
        <td style="text-align:left; padding:4px 6px; font-weight:700;">${m.name}</td>
        <td style="padding:4px 2px; text-align:right;">${basic > 0 ? basic.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${incentive > 0 ? incentive.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${allowance1 > 0 ? allowance1.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${allowance2 > 0 ? allowance2.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${att > 0 ? att.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${interim > 0 ? interim.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right; font-weight:bold; background:#f9f9f9;">${gross > 0 ? gross.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${epf20 > 0 ? epf20.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer12 > 0 ? employer12.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employee8 > 0 ? employee8.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer25 > 0 ? employer25.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer3 > 0 ? employer3.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${employer6 > 0 ? employer6.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${budget > 0 ? budget.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${etf3 > 0 ? etf3.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right; font-weight:bold;">${deductions > 0 ? deductions.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right;">${ot > 0 ? ot.toLocaleString() : '-'}</td>
        <td style="padding:4px 2px; text-align:right; font-weight:bold; font-size:10.5px; background:#f9f9f9;">${net > 0 ? net.toLocaleString() : '-'}</td>
      </tr>
    `;
  }).join('');

  const titleEl = document.getElementById('sheet-print-title');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-user-check" style="color:#2563eb;"></i> 2025 සේවක වාර්ෂික වැටුප් විස්තරය - ${emp.fullName}`;
  }

  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  content.innerHTML = `
    <div style="background:#fff; font-family:'Segoe UI',Arial,sans-serif; color:#000; min-width:1100px;">
      <div style="border:2px solid #000; padding:10px 14px; margin-bottom:12px; text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:20px;">
          <img src="images/gscs_logo.png" alt="GSCS Logo" style="height:50px;">
          <div>
            <h3 style="font-size:15px; font-weight:800; margin:0 0 2px;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</h3>
            <div style="font-size:12px; font-weight:700; letter-spacing:0.5px;">GALAPITIYAGAMA THRIFT & CREDIT CO-OPERATIVE SOCIETY</div>
            <div style="font-size:11px; margin-top:3px;">
              <strong>Reg No: කුලි/395</strong> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Reg Date: 1987/03/24</strong>
            </div>
          </div>
        </div>
      </div>

      <div style="border:1px solid #000; padding:8px 12px; margin-bottom:10px; background:#fafafa; display:flex; justify-content:space-between; font-size:11px;">
        <div><strong>සේවා අංකය:</strong> ${emp.id} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>සේවක නම:</strong> ${emp.fullName}</div>
        <div><strong>තනතුර:</strong> ${emp.designation || '-'} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>අදාළ වර්ෂය:</strong> 2025</div>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:5px 2px; width:30px;">#</th>
            <th style="padding:5px 4px; text-align:left;">මාසය</th>
            <th style="padding:5px 2px;">මූලික වැටුප</th>
            <th style="padding:5px 2px;">දිරිදීමනා / වැටුප් වර්ධක</th>
            <th style="padding:5px 2px;">දීමනා 01</th>
            <th style="padding:5px 2px;">දීමනා 02</th>
            <th style="padding:5px 2px;">පැමිණීමේ දීමනා</th>
            <th style="padding:5px 2px;">අන්තර් දීමනාව</th>
            <th style="padding:5px 2px; background:#e6e6e6;">එකතුව</th>
            <th style="padding:5px 2px;">අර්ථසාධක 20%</th>
            <th style="padding:5px 2px;">සේව්‍ය 12%</th>
            <th style="padding:5px 2px;">සේවක 8%</th>
            <th style="padding:5px 2px;">සේව්‍ය 2.5%</th>
            <th style="padding:5px 2px;">සේව්‍ය 3%</th>
            <th style="padding:5px 2px;">සේව්‍ය 6%</th>
            <th style="padding:5px 2px;">අයවැය දීමනා</th>
            <th style="padding:5px 2px;">සේවක භාරකාර 3%</th>
            <th style="padding:5px 2px;">අඩු කිරීම් එකතුව</th>
            <th style="padding:5px 2px;">අතිකාල ගෙවීම්</th>
            <th style="padding:5px 2px; font-weight:bold; background:#e6e6e6;">ශුද්ධ වැටුප</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
        <tfoot>
          <tr style="background:#f2f2f2; font-weight:bold; border-top:2px solid #000;">
            <td colspan="2" style="padding:5px 4px; text-align:center;">වසරේ එකතුව (Annual Total)</td>
            <td style="padding:5px 2px; text-align:right;">${totBasic > 0 ? totBasic.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totIncentive > 0 ? totIncentive.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totAllowance1 > 0 ? totAllowance1.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totAllowance2 > 0 ? totAllowance2.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totAtt > 0 ? totAtt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totInterim > 0 ? totInterim.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${totGross > 0 ? totGross.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEpf20 > 0 ? totEpf20.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer12 > 0 ? totEmployer12.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployee8 > 0 ? totEmployee8.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer25 > 0 ? totEmployer25.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer3 > 0 ? totEmployer3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEmployer6 > 0 ? totEmployer6.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totBudget > 0 ? totBudget.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totEtf3 > 0 ? totEtf3.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold;">${totDeductions > 0 ? totDeductions.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right;">${totOt > 0 ? totOt.toLocaleString() : '-'}</td>
            <td style="padding:5px 2px; text-align:right; font-weight:bold; font-size:10.5px;">${totNet > 0 ? totNet.toLocaleString() : '-'}</td>
          </tr>
        </tfoot>
      </table>

      <div style="display:flex; justify-content:space-between; margin-top:35px; font-size:10.5px; text-align:center;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (Internal Audit)</div>
        <div>...................................<br>අනුමත කළේ (General Manager / Chairman)</div>
      </div>

      <div style="border-top:1.5px solid #000; margin-top:20px; padding-top:5px; display:flex; justify-content:space-between; font-size:9px; color:#333;">
        <span>ගලපිටියාගම සණස සමුපකාර සමිතිය</span>
        <span style="font-weight:700;">Report generated by Galapitiyagama Sanasa Cooperative HRMS System (2025 Employee Annual Statement)</span>
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

      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11px; text-align:center; padding:0 60px;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (General Manager / Chairman)</div>
      </div>

      <div style="border-top:1.5px solid #000; margin-top:25px; padding-top:6px; display:flex; justify-content:space-between; font-size:9.5px; color:#333;">
        <span>ගලපිටියාගම සණස සමුපකාර සමිතිය</span>
        <span style="font-weight:700;">Report generated by Galapitiyagama Sanasa Cooperative HRMS System</span>
        <span>පිටුව: 1</span>
      </div>
    </div>
  `;

  openSmartModal('modal-smart-sheet-print');
}

function viewPayslipForEmp(empId, month = '') {
  const normId = (id) => /^Y14806\s*-\s*0?3$/i.test(String(id || '').trim()) ? 'Y14806 - 03' : String(id || '').trim();
  const targetId = normId(empId);
  let emp = (appData.employees || []).find(e => normId(e.id) === targetId);

  const currentMonth = month || (document.getElementById('payroll-month-select')?.value || '2025-12');
  const history = appData.payrollHistory || [];
  const rec = history.find(r => normId(r.empId) === targetId && r.month === currentMonth);

  if (!emp && rec) {
    emp = {
      id: rec.empId,
      fullName: rec.empName || rec.empId,
      designation: rec.designation || 'සේවකයා',
      employmentType: 'අතින් ඇතුළත් කළ'
    };
  }
  if (!emp) return;

  const isPerm = isPermanentEmp(emp);
  const defaultDate = isPerm ? `${currentMonth}-25` : `${currentMonth}-10`;
  const dateStr = rec ? (rec.date || defaultDate) : defaultDate;

  const basic = rec ? (parseFloat(rec.basic) || 0) : (parseFloat(emp.basicSalary) || 0);
  const incentive = rec ? (parseFloat(rec.incentive) || 0) : 0;
  const allowance1 = rec ? (parseFloat(rec.allowance1) || 0) : 0;
  const allowance2 = rec ? (parseFloat(rec.allowance2) || 0) : 0;
  const att = rec ? (parseFloat(rec.att) || 0) : 0;
  const interim = rec ? (parseFloat(rec.interim) || 0) : 0;
  const gross = rec ? (parseFloat(rec.gross) || 0) : (basic + incentive + allowance1 + allowance2 + att + interim);
  const epf20 = rec ? (parseFloat(rec.epf20) || 0) : 0;
  const employer12 = rec ? (parseFloat(rec.employer12) || 0) : 0;
  const employee8 = rec ? (parseFloat(rec.employee8) || 0) : 0;
  const employer25 = rec ? (parseFloat(rec.employer25) || 0) : 0;
  const employer3 = rec ? (parseFloat(rec.employer3) || 0) : 0;
  const employer6 = rec ? (parseFloat(rec.employer6) || 0) : 0;
  const budget = rec ? (parseFloat(rec.budget) || 0) : 0;
  const etf3 = rec ? (parseFloat(rec.etf3) || 0) : 0;
  const deductions = rec ? (parseFloat(rec.deductions) || 0) : 0;
  const ot = rec ? (parseFloat(rec.ot) || 0) : 0;
  const net = rec ? (parseFloat(rec.net) || 0) : ((gross + budget + ot) - deductions);

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
          <div style="margin-top:4px;"><strong>තනතුර:</strong> ${emp.designation || 'සේවක'}</div>
        </div>
        <div>
          <div><strong>සම්පූර්ණ නම:</strong> ${emp.fullName}</div>
          <div style="margin-top:4px;"><strong>ගෙවීම් දිනය:</strong> ${dateStr}</div>
        </div>
      </div>

      <div style="text-align:center; font-weight:800; font-size:13px; color:#1e1b4b; margin-bottom:12px; background:#f1f5f9; padding:5px; border-radius:6px;">
        2025 වර්ෂයේ මාසික වැටුප් පත්‍රිකාව (Form 1) - ${currentMonth}
      </div>

      <!-- 2025 Breakdown Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; font-size:12px;">
        <div style="border:1px solid #cbd5e1; border-radius:8px; padding:12px;">
          <h5 style="color:#166534; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">උපැයීම් හා දීමනා (Earnings)</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>මූලික වැටුප:</span><span>${basic > 0 ? 'රු. ' + basic.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>දිරිදීමනා / වැටුප් වර්ධක:</span><span>${incentive > 0 ? 'රු. ' + incentive.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>දීමනා 01:</span><span>${allowance1 > 0 ? 'රු. ' + allowance1.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>දීමනා 02:</span><span>${allowance2 > 0 ? 'රු. ' + allowance2.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>පැමිණීමේ දීමනා:</span><span>${att > 0 ? 'රු. ' + att.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>අන්තර් දීමනාව:</span><span>${interim > 0 ? 'රු. ' + interim.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1px dashed #cbd5e1; padding-top:6px; margin-top:6px; color:#7c3aed;">
            <span>එකතුව (Gross):</span><span>${gross > 0 ? 'රු. ' + gross.toLocaleString() : '-'}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:6px; margin-bottom:4px;"><span>අයවැය දීමනා:</span><span>${budget > 0 ? 'රු. ' + budget.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>අතිකාල ගෙවීම් (OT):</span><span>${ot > 0 ? 'රු. ' + ot.toLocaleString() : '-'}</span></div>
        </div>

        <div style="border:1px solid #cbd5e1; border-radius:8px; padding:12px;">
          <h5 style="color:#dc2626; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:8px;">අඩුකිරීම් හා දායකත්ව (Deductions)</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සේවක EPF 8%:</span><span>${employee8 > 0 ? 'රු. ' + employee8.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-weight:700; color:#dc2626;"><span>අඩු කිරීම් එකතුව:</span><span>${deductions > 0 ? 'රු. ' + deductions.toLocaleString() : '-'}</span></div>
          <h5 style="color:#2563eb; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-top:10px; margin-bottom:8px;">සමිතියේ දායකත්ව (Statutory by Society)</h5>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>අර්ථසාධක 20% (EPF Total):</span><span>${epf20 > 0 ? 'රු. ' + epf20.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සේව්‍ය EPF 12%:</span><span>${employer12 > 0 ? 'රු. ' + employer12.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සේව්‍ය 2.5%:</span><span>${employer25 > 0 ? 'රු. ' + employer25.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සේව්‍ය 3%:</span><span>${employer3 > 0 ? 'රු. ' + employer3.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සේව්‍ය 6%:</span><span>${employer6 > 0 ? 'රු. ' + employer6.toLocaleString() : '-'}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>සේවක භාරකාර ETF 3%:</span><span>${etf3 > 0 ? 'රු. ' + etf3.toLocaleString() : '-'}</span></div>
        </div>
      </div>

      <!-- Net Salary Box -->
      <div style="background:#f0fdf4; border:1.5px solid #16a34a; border-radius:8px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <span style="font-weight:800; font-size:14px; color:#15803d;">සේවකයා වෙත ගෙවන ශුද්ධ වැටුප (Net Payable):</span>
        <strong style="font-size:19px; color:#15803d; font-family:monospace;">${net > 0 ? 'රු. ' + net.toLocaleString() : '-'}</strong>
      </div>

      <!-- Signatures Footer -->
      <div style="display:flex; justify-content:space-between; margin-top:25px; font-size:11px; text-align:center;">
        <div>...................................<br>සේවක අත්සන (Employee Signature)</div>
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>අනුමත කළේ (Chairman / GM)</div>
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

  if (!appData.appraisals) appData.appraisals = [];

  const appraisals = appData.appraisals;

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
    incrementRecommended: document.getElementById('appraisal-increment-check')?.checked ?? (totalScore >= 70),
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

function formatYearMonthSinhala(ym) {
  if (!ym || ym === 'ALL') return 'සියලුම මාස (All Months)';
  const parts = ym.split('-');
  if (parts.length < 2) return ym;
  const yr = parts[0];
  const mo = parts[1];
  const monthNames = {
    '01': 'ජනවාරි', '02': 'පෙබරවාරි', '03': 'මාර්තු', '04': 'අප්‍රේල්',
    '05': 'මැයි', '06': 'ජූනි', '07': 'ජූලි', '08': 'අගෝස්තු',
    '09': 'සැප්තැම්බර්', '10': 'ඔක්තෝබර්', '11': 'නොවැම්බර්', '12': 'දෙසැම්බර්'
  };
  return `${yr} ${monthNames[mo] || mo} (${ym})`;
}

function formatYearMonthEnglish(ym) {
  if (!ym || ym === 'ALL') return 'All Months';
  const parts = ym.split('-');
  if (parts.length < 2) return ym;
  const yr = parts[0];
  const mo = parts[1];
  const monthNames = {
    '01': 'January', '02': 'February', '03': 'March', '04': 'April',
    '05': 'May', '06': 'June', '07': 'July', '08': 'August',
    '09': 'September', '10': 'October', '11': 'November', '12': 'December'
  };
  return `${monthNames[mo] || mo} ${yr}`;
}

function onWellbeingMonthFilterChange() {
  renderSatisfactionModule();
}

function onPrintSheetWellbeingMonthChange(val) {
  const mainSel = document.getElementById('filter-wellbeing-month');
  if (mainSel) mainSel.value = val;
  renderSatisfactionModule();
  printCurrentPageReport();
}

function renderSatisfactionModule() {
  const allSurveys = appData.surveys || [];
  const tbody = document.querySelector('#table-survey-body');
  if (!tbody) return;

  // Populate Month Filter Dropdown dynamically from all surveys
  const monthSelect = document.getElementById('filter-wellbeing-month');
  if (monthSelect) {
    const currentVal = monthSelect.value || 'ALL';
    const monthsSet = new Set();
    allSurveys.forEach(s => {
      const ts = s.timestamp || s.date || '';
      const m = ts.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(m)) monthsSet.add(m);
    });
    const uniqueMonths = Array.from(monthsSet).sort().reverse();

    const expected = ['ALL', ...uniqueMonths];
    const existing = Array.from(monthSelect.options).map(o => o.value);
    if (existing.join(',') !== expected.join(',')) {
      monthSelect.innerHTML = `<option value="ALL">සියලුම මාස (All Months)</option>` +
        uniqueMonths.map(m => `<option value="${m}">${formatYearMonthSinhala(m)}</option>`).join('');
      if (expected.includes(currentVal)) {
        monthSelect.value = currentVal;
      }
    }
  }

  const selectedMonth = monthSelect ? monthSelect.value : 'ALL';
  const surveys = (selectedMonth && selectedMonth !== 'ALL')
    ? allSurveys.filter(s => (s.timestamp || s.date || '').startsWith(selectedMonth))
    : allSurveys;

  // Update summary stats based on displayed surveys
  const total = surveys.length;
  let avgOverall = 0, avgWork = 0, avgMgmt = 0;
  if (total > 0) {
    let sumOverall = 0, sumWork = 0, sumMgmt = 0;
    surveys.forEach(s => {
      const w = s.ratings?.workEnvironment ?? s.workEnvironment ?? 4;
      const m = s.ratings?.managementSupport ?? s.managementSupport ?? 4;
      const sal = s.ratings?.salaryFairness ?? s.salaryFairness ?? 4;
      const g = s.ratings?.careerGrowth ?? s.ratings?.coopDirection ?? s.careerGrowth ?? s.coopDirection ?? 4;
      const avg = s.averageScore || Number(((w + m + sal + g) / 4).toFixed(1));
      sumOverall += avg;
      sumWork += w;
      sumMgmt += m;
    });
    avgOverall = (sumOverall / total).toFixed(1);
    avgWork = (sumWork / total).toFixed(1);
    avgMgmt = (sumMgmt / total).toFixed(1);
  }

  const elOverall = document.getElementById('stat-wellbeing-overall');
  const elWork = document.getElementById('stat-wellbeing-work');
  const elMgmt = document.getElementById('stat-wellbeing-mgmt');
  const elTotal = document.getElementById('stat-wellbeing-total');

  if (elOverall) elOverall.textContent = total > 0 ? `${avgOverall} / 5.0` : '0.0 / 5.0';
  if (elWork) elWork.textContent = total > 0 ? `${avgWork} / 5.0` : '0.0 / 5.0';
  if (elMgmt) elMgmt.textContent = total > 0 ? `${avgMgmt} / 5.0` : '0.0 / 5.0';
  if (elTotal) elTotal.textContent = String(total);

  if (total === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:36px; color:#94a3b8;">
          <i class="fa-solid fa-heart-pulse" style="font-size:32px; margin-bottom:10px; display:block; opacity:0.6; color:#059669;"></i>
          ${selectedMonth !== 'ALL' ? formatYearMonthSinhala(selectedMonth) + ' මාසය සඳහා ' : ''}තෘප්තිමත්භාවය පිළිබඳ සමීක්ෂණ ප්‍රතිඵල නොමැත<br>
          <span style="font-size:12px; color:#64748b; margin-top:6px; display:inline-block;">ඉහත <strong>'WhatsApp මඟින් සේවකයින්ට යවන්න'</strong> හෝ <strong>'+ සටහනක් එක් කරන්න'</strong> ඔබන්න.</span>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = surveys.map(s => {
    const w = s.ratings?.workEnvironment ?? s.workEnvironment ?? 4;
    const m = s.ratings?.managementSupport ?? s.managementSupport ?? 4;
    const sal = s.ratings?.salaryFairness ?? s.salaryFairness ?? 4;
    const g = s.ratings?.careerGrowth ?? s.ratings?.coopDirection ?? s.careerGrowth ?? s.coopDirection ?? 4;
    const avg = s.averageScore || Number(((w + m + sal + g) / 4).toFixed(1));
    const fmtTime = formatTimestamp(s.timestamp || s.date);
    const empName = s.employeeName || (s.isAnonymous ? '<i class="fa-solid fa-user-shield" style="color:#7c3aed; margin-right:4px;"></i>නිර්නාමික' : 'කාර්ය මණ්ඩලය');

    return `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td><span style="font-size:11px; color:#64748b;">${fmtTime}</span></td>
        <td>
          <strong style="color:${s.isAnonymous ? '#059669' : '#1e1b4b'}; font-size:12px;">${empName}</strong>
          ${s.department ? `<br><span style="font-size:10px; color:#94a3b8;">${s.department}</span>` : ''}
        </td>
        <td><span style="color:#f59e0b; font-size:12px;">${'★'.repeat(w)}</span> <span style="font-size:10.5px; color:#64748b;">(${w})</span></td>
        <td><span style="color:#f59e0b; font-size:12px;">${'★'.repeat(m)}</span> <span style="font-size:10.5px; color:#64748b;">(${m})</span></td>
        <td><span style="color:#f59e0b; font-size:12px;">${'★'.repeat(sal)}</span> <span style="font-size:10.5px; color:#64748b;">(${sal})</span></td>
        <td><span style="color:#f59e0b; font-size:12px;">${'★'.repeat(g)}</span> <span style="font-size:10.5px; color:#64748b;">(${g})</span></td>
        <td>
          <span class="badge-pill ${avg >= 4 ? 'badge-green' : (avg >= 3 ? 'badge-blue' : 'badge-orange')}" style="font-weight:700;">
            ${avg} / 5
          </span>
        </td>
        <td><div style="font-size:12px; color:#334155; max-width:240px; word-break:break-word;">${s.comments || '<span style="color:#cbd5e1; font-style:italic;">සටහන් කර නැත</span>'}</div></td>
        <td style="text-align:right; white-space:nowrap;">
          <button class="btn-smart btn-smart-light" style="padding:3px 8px; font-size:12px; color:#059669; border-color:#a7f3d0;" onclick="openEditSurveyModal('${s.id}')" title="සංස්කරණය (Edit)">
            <i class="fa-solid fa-file-pen"></i>
          </button>
          <button class="btn-smart btn-smart-light" style="padding:3px 8px; font-size:12px; color:#dc2626; border-color:#fecaca;" onclick="deleteSingleSurvey('${s.id}')" title="ඉවත් කරන්න (Delete)">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function loadDefaultWellbeingSurveys() {
  if (typeof seedWellbeingSurveys !== 'undefined' && Array.isArray(seedWellbeingSurveys) && seedWellbeingSurveys.length > 0) {
    if (!appData.surveys) appData.surveys = [];
    const existingIds = new Set(appData.surveys.map(s => s.id));
    let added = 0;
    seedWellbeingSurveys.forEach(s => {
      if (!existingIds.has(s.id)) {
        appData.surveys.push(s);
        added++;
      }
    });
    appData.surveys.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    persistData();
    renderSatisfactionModule();
    alert(currentLang === 'si'
      ? `✅ 2025/02 සිට 2026/10 දක්වා සේවක තෘප්තිමත් සමීක්ෂණ දත්ත (${appData.surveys.length}) සාර්ථකව පූරණය කරන ලදී!`
      : `✅ Wellbeing survey data (${appData.surveys.length}) loaded successfully!`);
  } else {
    alert(currentLang === 'si' ? 'සමීක්ෂණ බීජ දත්ත (Seed data) සොයා ගැනීමට නොහැකි විය.' : 'Seed survey data not found.');
  }
}

// =========================================================================
// WELLBEING / SATISFACTION HUB FUNCTIONS
// =========================================================================

function openWellbeingWhatsAppModal() {
  const url = getOnlinePageUrl('wellbeing.html');
  const urlBox = document.getElementById('wellbeing-share-url-text');
  if (urlBox) urlBox.textContent = url;

  const staffContainer = document.getElementById('wellbeing-whatsapp-staff-list');
  if (!staffContainer) return;

  const emps = appData.employees || [];
  if (emps.length === 0) {
    staffContainer.innerHTML = `
      <div style="padding:24px; text-align:center; color:#94a3b8; font-size:12px;">
        <i class="fa-solid fa-user-xmark" style="font-size:24px; margin-bottom:6px; display:block; opacity:0.6;"></i>
        ලියාපදිංචි සේවකයින් නොමැත. කරුණාකර සේවක මණ්ඩලය (Employees) අංශයෙන් සේවකයින් ලියාපදිංචි කරන්න හෝ ඉහත ඇති <strong>'කාර්ය මණ්ඩල WhatsApp සමූහයට පණිවිඩය පිටපත් කරන්න'</strong> බොත්තම භාවිත කරන්න.
      </div>
    `;
  } else {
    staffContainer.innerHTML = emps.map(e => {
      let rawPhone = String(e.mobilePhone || e.phone || '').trim().replace(/[^0-9]/g, '');
      let waPhone = '';
      if (rawPhone.startsWith('0')) {
        waPhone = '94' + rawPhone.substring(1);
      } else if (rawPhone.startsWith('94')) {
        waPhone = rawPhone;
      } else if (rawPhone.length >= 9) {
        waPhone = '94' + rawPhone;
      }

      const msg = `ආයුබෝවන් ${e.callingName || e.fullName} මහත්මයාණෙනි/මහත්මියනි,\n\nගලපිටියාගම සණස සමුපකාර සමිතියේ සේවක තෘප්තිමත්භාවය හා සුවතාවය (Employee Wellbeing) පිළිබඳ කෙටි සමීක්ෂණයට පහත සබැඳිය ඔස්සේ පිවිස ඔබගේ වටිනා අදහස් ඉදිරිපත් කරන්න:\n\n🔗 ${url}\n\n(මෙහිදී ඔබගේ රහස්‍යභාවය 100% ක් සුරැකෙන පරිදි නිර්නාමිකවද අදහස් ඉදිරිපත් කළ හැක)\n\nස්තූතියි!\nපරිපාලන අංශය,\nගලපිටියාගම සණස සමුපකාර සමිතිය.`;

      const waLink = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}` : '#';

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; border-bottom:1px solid #f1f5f9;">
          <div>
            <div style="font-size:12.5px; font-weight:700; color:#1e1b4b;">${e.fullName}</div>
            <div style="font-size:11px; color:#64748b;">${e.designation || 'කාර්ය මණ්ඩල සාමාජික'} ${e.mobilePhone ? '• ' + e.mobilePhone : '<span style="color:#ef4444;">(දුරකථන අංකයක් නැත)</span>'}</div>
          </div>
          <div>
            ${waPhone ? `
              <a href="${waLink}" target="_blank" class="btn-smart" style="background:#25D366; color:#fff; font-size:11.5px; font-weight:700; padding:5px 12px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp යවන්න
              </a>
            ` : `
              <button class="btn-smart btn-smart-light" style="font-size:11px; opacity:0.5;" disabled>අංකයක් නැත</button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  openSmartModal('modal-wellbeing-whatsapp');
}

function copyWellbeingSurveyLink() {
  const url = getOnlinePageUrl('wellbeing.html');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  } else {
    const inp = document.createElement('input');
    inp.value = url;
    document.body.appendChild(inp);
    inp.select();
    document.execCommand('copy');
    inp.remove();
  }
  alert(currentLang === 'si' ? '✅ සේවක තෘප්තිමත් සමීක්ෂණ සබැඳිය (URL) සාර්ථකව පිටපත් කරන ලදී!' : 'Survey link copied to clipboard!');
}

function copyWellbeingWhatsAppGroupMessage() {
  const url = getOnlinePageUrl('wellbeing.html');
  const msg = `ආයුබෝවන් ගලපිටියාගම සණස සමස්ත කාර්ය මණ්ඩලය වෙත,\n\nආයතනික වැඩ පරිසරය, කළමනාකාරීත්ව සහයෝගය, වැටුප් හා සේවක සුභසාධනය පිළිබඳ ඔබගේ වටිනා අදහස් ලබාගැනීම උදෙසා සකස් කළ 'සේවක තෘප්තිමත්භාවය හා සුවතාවය පිළිබඳ සමීක්ෂණයට' පහත සබැඳිය ඔස්සේ පිවිස සහභාගී වන මෙන් කාරුණිකව ඉල්ලා සිටිමු.\n\n🔗 සමීක්ෂණ පෝරමය: ${url}\n\n🔒 මෙහිදී ඔබගේ පෞද්ගලික අනන්‍යතාවය හෙළි නොකර 100% ක් නිර්නාමිකවද ප්‍රතිචාර දැක්විය හැක.\n\nස්තූතියි!\nපරිපාලන අංශය,\nගලපිටියාගම සණස සමුපකාර සමිතිය (වගකීම සීමිත).`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg);
  } else {
    const inp = document.createElement('textarea');
    inp.value = msg;
    document.body.appendChild(inp);
    inp.select();
    document.execCommand('copy');
    inp.remove();
  }
  alert(currentLang === 'si' ? '✅ කාර්ය මණ්ඩල WhatsApp Group පණිවිඩය සාර්ථකව පිටපත් කරන ලදී! දැන් ඔබගේ WhatsApp සමූහයට Paste කරන්න.' : 'Group message copied! Paste to WhatsApp.');
}

function openWellbeingQRModal() {
  const url = getOnlinePageUrl('wellbeing.html');
  const container = document.getElementById('qr-wellbeing-modal-container');
  const textDisplay = document.getElementById('qr-wellbeing-url-display');
  if (textDisplay) textDisplay.textContent = url;

  if (container) {
    container.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(container, {
        text: url,
        width: 200,
        height: 200,
        colorDark: "#047857",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }

  openSmartModal('modal-wellbeing-qr');
}

function openAddManualSurveyModal() {
  const form = document.getElementById('form-add-manual-survey');
  if (form) form.reset();
  const timeInput = document.getElementById('manual-surv-time');
  if (timeInput) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    timeInput.value = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  openSmartModal('modal-add-manual-survey');
}

async function saveManualSurveyForm(e) {
  e.preventDefault();
  const refNo = `WLB-2026-${Math.floor(100 + Math.random() * 900)}`;
  const emp = document.getElementById('manual-surv-emp').value || 'කාර්ය මණ්ඩල සාමාජික';
  const tsRaw = document.getElementById('manual-surv-time').value;
  const timeStr = tsRaw ? tsRaw.replace('T', ' ') : formatTimestamp(new Date());

  const w = parseInt(document.getElementById('manual-surv-work').value, 10) || 4;
  const m = parseInt(document.getElementById('manual-surv-mgmt').value, 10) || 4;
  const sal = parseInt(document.getElementById('manual-surv-salary').value, 10) || 4;
  const g = parseInt(document.getElementById('manual-surv-growth').value, 10) || 4;
  const comments = document.getElementById('manual-surv-comments').value || '';
  const avg = Number(((w + m + sal + g) / 4).toFixed(1));

  const newSurvey = {
    id: refNo,
    timestamp: timeStr,
    employeeName: emp,
    department: '',
    isAnonymous: emp.includes('නිර්නාමික') || emp.toLowerCase().includes('anon'),
    ratings: {
      workEnvironment: w,
      managementSupport: m,
      salaryFairness: sal,
      careerGrowth: g
    },
    averageScore: avg,
    comments: comments
  };

  if (!appData.surveys) appData.surveys = [];
  localStorage.removeItem('sanasa_surveys_all_cleared');
  appData.surveys.unshift(newSurvey);
  await persistData();
  closeSmartModal('modal-add-manual-survey');
  renderSatisfactionModule();
  alert(currentLang === 'si' ? '✅ සමීක්ෂණ සටහන සාර්ථකව ඇතුළත් කරන ලදී!' : 'Survey added successfully!');
}

function openEditSurveyModal(id) {
  const s = (appData.surveys || []).find(item => item.id === id);
  if (!s) return;

  document.getElementById('edit-surv-id').value = s.id;
  document.getElementById('edit-surv-employeeName').value = s.employeeName || '';
  document.getElementById('edit-surv-timestamp').value = toIsoDateTimeLocal(s.timestamp);
  document.getElementById('edit-surv-work').value = s.ratings?.workEnvironment || 4;
  document.getElementById('edit-surv-mgmt').value = s.ratings?.managementSupport || 4;
  document.getElementById('edit-surv-salary').value = s.ratings?.salaryFairness || 4;
  document.getElementById('edit-surv-growth').value = s.ratings?.careerGrowth || 4;
  document.getElementById('edit-surv-comments').value = s.comments || '';
  document.getElementById('edit-surv-modal-label').textContent = `${s.id}`;

  openSmartModal('modal-edit-survey');
}

async function saveEditSurveyForm(e) {
  e.preventDefault();
  const id = document.getElementById('edit-surv-id').value;
  const s = (appData.surveys || []).find(x => x.id === id);
  if (!s) return;

  s.employeeName = document.getElementById('edit-surv-employeeName').value;
  const tsRaw = document.getElementById('edit-surv-timestamp').value;
  if (tsRaw) s.timestamp = tsRaw.replace('T', ' ');

  const w = parseInt(document.getElementById('edit-surv-work').value, 10) || 4;
  const m = parseInt(document.getElementById('edit-surv-mgmt').value, 10) || 4;
  const sal = parseInt(document.getElementById('edit-surv-salary').value, 10) || 4;
  const g = parseInt(document.getElementById('edit-surv-growth').value, 10) || 4;

  s.ratings = {
    workEnvironment: w,
    managementSupport: m,
    salaryFairness: sal,
    careerGrowth: g
  };
  s.averageScore = Number(((w + m + sal + g) / 4).toFixed(1));
  s.comments = document.getElementById('edit-surv-comments').value || '';

  await persistData();
  closeSmartModal('modal-edit-survey');
  renderSatisfactionModule();
  alert(currentLang === 'si' ? '✅ සමීක්ෂණ සටහන සාර්ථකව සංස්කරණය කරන ලදී!' : 'Survey updated successfully!');
}

async function deleteSingleSurvey(id) {
  const conf = confirm(currentLang === 'si'
    ? `"${id}" - මෙම සමීක්ෂණ සටහන ස්ථිරවම ඉවත් කිරීමට අවශ්‍යද?`
    : `Permanently delete survey "${id}"?`);
  if (!conf) return;

  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_surv_ids') || '[]');
  localStorage.setItem('sanasa_deleted_surv_ids', JSON.stringify([...new Set([...prev, id])]));

  appData.surveys = (appData.surveys || []).filter(x => x.id !== id);
  await persistData();
  renderSatisfactionModule();

  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'delete_survey', id: id })
      });
    }
  } catch (err) {}

  alert(currentLang === 'si' ? '✅ සමීක්ෂණ සටහන ඉවත් කරන ලදී.' : 'Survey deleted.');
}

async function clearAllSurveys() {
  if (!appData.surveys || appData.surveys.length === 0) {
    alert(currentLang === 'si' ? 'ඉවත් කිරීමට සමීක්ෂණ ප්‍රතිචාර කිසිවක් නැත.' : 'No surveys to clear.');
    return;
  }
  const conf = confirm(currentLang === 'si'
    ? '⚠️ අවධානයට!\n\nසියලුම සේවක තෘප්තිමත් සමීක්ෂණ ප්‍රතිචාර ස්ථිරවම ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්නද?'
    : 'Are you sure you want to clear ALL wellbeing survey responses?');
  if (!conf) return;

  const allIds = appData.surveys.map(x => x.id).filter(Boolean);
  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_surv_ids') || '[]');
  localStorage.setItem('sanasa_deleted_surv_ids', JSON.stringify([...new Set([...prev, ...allIds])]));
  localStorage.setItem('sanasa_surveys_all_cleared', 'true');

  appData.surveys = [];
  await persistData();
  renderSatisfactionModule();

  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'clear_survey_data' })
      });
    }
  } catch (err) {}

  alert(currentLang === 'si' ? '✅ සියලුම සමීක්ෂණ දත්ත සාර්ථකව ඉවත් කරන ලදී.' : 'All survey data cleared.');
}

// =========================================================================
// 8. PRINTABLE POSTERS
// =========================================================================
function renderPrintablePosters() {
  renderPosterQRs();
}

// =========================================================================
// OFFICIAL REPORT PRINT PREVIEW & PRINTING (Form 1 Header Style)
// =========================================================================

// Prints the content currently inside modal-smart-sheet-print via isolated iframe
function printModalSheetContent() {
  const contentEl = document.getElementById('sheet-print-content');
  if (!contentEl) {
    window.print();
    return;
  }

  let frame = document.getElementById('report-print-iframe');
  if (!frame) {
    frame = document.createElement('iframe');
    frame.id = 'report-print-iframe';
    frame.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(frame);
  }

  const baseHref = window.location.href.replace(/\/[^/]*$/, '/');
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <base href="${baseHref}">
  <title>Official Report - Galapitiyagama Sanasa HRMS</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #000;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }
    th, td {
      border: 1px solid #000 !important;
    }
    .no-print {
      display: none !important;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  ${contentEl.innerHTML}
</body>
</html>`);
  doc.close();

  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }, 400);
}

// Opens the Form 1 Style Preview Modal for whatever page is currently active
function printCurrentPageReport() {
  const activeSection = document.querySelector('.view-section.active');
  const activeId = activeSection ? activeSection.id.replace('view-', '') : 'employees';

  if (activeId === 'dashboard') {
    showToast('Dashboard ලේඛනගත කිරීමක් නොමැත. කරුණාකර වෙනත් Page එකක් තෝරන්න.', 'info');
    return;
  }

  // If currently in payroll, open Form 1 directly
  if (activeId === 'payroll') {
    printForm1OfficialSheet();
    return;
  }
  if (activeId === 'payroll-2026') {
    openPayroll2026PrintModal('monthly');
    return;
  }

  const dateNow = new Date().toLocaleDateString('en-GB');
  let titleSinhala = '';
  let titleEnglish = '';
  let tableHTML = '';

  if (activeId === 'employees') {
    titleSinhala = 'නිල සේවක නාමාවලිය සහ පැතිකඩ ලේඛනය';
    titleEnglish = 'Official Employee Directory & Staff Register';
    const emps = appData.employees || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 4px; width:75px;">සේවා අංකය</th>
            <th style="padding:6px 6px; text-align:left;">සේවකයාගේ නම</th>
            <th style="padding:6px 4px;">තනතුර</th>
            <th style="padding:6px 4px;">අංශය</th>
            <th style="padding:6px 4px;">ජා.හැ. අංකය</th>
            <th style="padding:6px 4px;">දුරකථන අංකය</th>
            <th style="padding:6px 4px;">මූලික වැටුප (රු.)</th>
            <th style="padding:6px 4px;">සේවා තත්වය</th>
          </tr>
        </thead>
        <tbody>
          ${emps.map((e, idx) => `
            <tr>
              <td style="padding:5px 4px;">${idx + 1}</td>
              <td style="padding:5px 4px; font-weight:bold;">${e.id || '-'}</td>
              <td style="padding:5px 6px; text-align:left; font-weight:600;">${e.fullName || e.name || '-'}</td>
              <td style="padding:5px 4px;">${e.designation || e.role || '-'}</td>
              <td style="padding:5px 4px;">${e.department || '-'}</td>
              <td style="padding:5px 4px;">${e.nic || '-'}</td>
              <td style="padding:5px 4px;">${e.mobile || e.phone || '-'}</td>
              <td style="padding:5px 4px; text-align:right;">${e.basicSalary ? Number(e.basicSalary).toLocaleString() : '-'}</td>
              <td style="padding:5px 4px;">${e.status || 'ස්ථිර (Permanent)'}</td>
            </tr>
          `).join('')}
          ${emps.length === 0 ? '<tr><td colspan="9" style="padding:16px; color:#888;">සේවක දත්ත වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else if (activeId === 'grievance') {
    titleSinhala = 'සේවක ගැටළු, සංවර්ධන යෝජනා හා සුභසාධන ඉල්ලීම් ලේඛනය';
    titleEnglish = 'Employee Grievances, Suggestions & Welfare Register';
    const grvs = appData.grievances || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 4px; width:90px;">යොමු අංකය</th>
            <th style="padding:6px 4px; width:80px;">දිනය</th>
            <th style="padding:6px 4px;">ඉදිරිපත් කළේ</th>
            <th style="padding:6px 4px;">යොමු කළ පාර්ශ්වය</th>
            <th style="padding:6px 6px; text-align:left;">ශීර්ෂය හා විස්තරය</th>
            <th style="padding:6px 4px; width:80px;">තත්වය</th>
            <th style="padding:6px 6px; text-align:left;">ගත් ක්‍රියාමාර්ගය</th>
          </tr>
        </thead>
        <tbody>
          ${grvs.map((g, idx) => `
            <tr>
              <td style="padding:5px 4px;">${idx + 1}</td>
              <td style="padding:5px 4px; font-weight:bold;">${g.id || '-'}</td>
              <td style="padding:5px 4px;">${g.date || '-'}</td>
              <td style="padding:5px 4px;">${g.isAnonymous ? 'නිර්නාමික (Anonymous)' : (g.submittedBy || 'නාමික')}</td>
              <td style="padding:5px 4px; font-weight:600;">${g.target || g.targetOfficial || 'ගරු සභාපතිතුමා'}</td>
              <td style="padding:5px 6px; text-align:left;"><strong>${g.subject || '-'}</strong><br><span style="font-size:9px; color:#444;">${g.description || ''}</span></td>
              <td style="padding:5px 4px;">${g.status || 'නව (New)'}</td>
              <td style="padding:5px 6px; text-align:left;">${g.actionTaken || 'ක්‍රියාමාර්ගයක් සටහන් කර නැත'}</td>
            </tr>
          `).join('')}
          ${grvs.length === 0 ? '<tr><td colspan="8" style="padding:16px; color:#888;">සේවක ගැටළු හෝ යෝජනා වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else if (activeId === 'member-feedback') {
    titleSinhala = 'සාමාජික අදහස් හා තරු ලකුණු සේවා ඇගයීම් ලේඛනය';
    titleEnglish = 'Member Feedback & Service Satisfaction Register';
    const fbs = appData.memberFeedbacks || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 4px; width:90px;">යොමු අංකය</th>
            <th style="padding:6px 4px; width:80px;">දිනය</th>
            <th style="padding:6px 4px;">සාමාජිකයා</th>
            <th style="padding:6px 4px;">ශාඛාව</th>
            <th style="padding:6px 4px; width:80px;">තරු ඇගයීම</th>
            <th style="padding:6px 6px; text-align:left;">සාමාජික අදහස් හා යෝජනා</th>
            <th style="padding:6px 4px; width:80px;">තත්වය</th>
            <th style="padding:6px 6px; text-align:left;">ගත් ක්‍රියාමාර්ගය</th>
          </tr>
        </thead>
        <tbody>
          ${fbs.map((f, idx) => `
            <tr>
              <td style="padding:5px 4px;">${idx + 1}</td>
              <td style="padding:5px 4px; font-weight:bold;">${f.id || '-'}</td>
              <td style="padding:5px 4px;">${f.date || '-'}</td>
              <td style="padding:5px 4px; font-weight:600;">${f.memberId || f.memberName || '-'}</td>
              <td style="padding:5px 4px;">${f.branch || 'ප්‍රධාන කාර්යාලය'}</td>
              <td style="padding:5px 4px; font-weight:bold; color:#b45309;">${f.rating ? f.rating + ' / 5 ★' : '-'}</td>
              <td style="padding:5px 6px; text-align:left;">${f.feedback || f.comments || '-'}</td>
              <td style="padding:5px 4px;">${f.status || 'ලැබුණි (Received)'}</td>
              <td style="padding:5px 6px; text-align:left;">${f.actionTaken || 'ක්‍රියාමාර්ගයක් සටහන් කර නැත'}</td>
            </tr>
          `).join('')}
          ${fbs.length === 0 ? '<tr><td colspan="9" style="padding:16px; color:#888;">සාමාජික ප්‍රතිචාර වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else if (activeId === 'satisfaction') {
    const selectedMonth = document.getElementById('filter-wellbeing-month')?.value || 'ALL';
    const allSurveys = appData.surveys || [];
    const surveys = (selectedMonth !== 'ALL')
      ? allSurveys.filter(s => (s.timestamp || s.date || '').startsWith(selectedMonth))
      : allSurveys;

    const monthLabelSi = (selectedMonth !== 'ALL') ? ` - ${formatYearMonthSinhala(selectedMonth)}` : ' (සමස්ත වාර්තාව)';
    const monthLabelEn = (selectedMonth !== 'ALL') ? ` - ${formatYearMonthEnglish(selectedMonth)}` : ' (Comprehensive Report)';

    titleSinhala = `සේවක තෘප්තිමත්භාවය හා සුවතා සමීක්ෂණ ලේඛනය${monthLabelSi}`;
    titleEnglish = `Employee Wellbeing & Satisfaction Survey Report${monthLabelEn}`;

    // Unique months list for print modal selector
    const monthsSet = new Set();
    allSurveys.forEach(s => {
      const ts = s.timestamp || s.date || '';
      const m = ts.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(m)) monthsSet.add(m);
    });
    const uniqueMonths = Array.from(monthsSet).sort().reverse();

    const monthSelectBarHtml = `
      <div class="no-print" style="margin-bottom:14px; padding:10px 14px; background:#f0fdf4; border:1.5px solid #86efac; border-radius:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; font-size:12.5px; color:#065f46;"><i class="fa-solid fa-calendar-days" style="color:#059669;"></i> වාර්තා මාසය තෝරන්න (Select Month):</span>
          <select id="print-wellbeing-month-select" onchange="onPrintSheetWellbeingMonthChange(this.value)" style="padding:5px 12px; font-size:12px; font-weight:700; border-radius:6px; border:1.5px solid #059669; color:#065f46; background:#fff; cursor:pointer;">
            <option value="ALL" ${selectedMonth === 'ALL' ? 'selected' : ''}>සියලුම මාස (All Months - ${allSurveys.length})</option>
            ${uniqueMonths.map(m => `<option value="${m}" ${selectedMonth === m ? 'selected' : ''}>${formatYearMonthSinhala(m)}</option>`).join('')}
          </select>
        </div>
        <div style="font-size:11.5px; color:#475569; font-weight:600;">
          <i class="fa-solid fa-check-circle" style="color:#059669;"></i> වාර්තා ගණන: <strong>${surveys.length}</strong>
        </div>
      </div>
    `;

    tableHTML = `
      ${monthSelectBarHtml}
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 4px; width:80px;">දිනය</th>
            <th style="padding:6px 6px; text-align:left;">සේවකයා</th>
            <th style="padding:6px 4px; width:65px;">වැඩ පරිසරය</th>
            <th style="padding:6px 4px; width:75px;">කළමනාකාරීත්වය</th>
            <th style="padding:6px 4px; width:75px;">වැටුප් සාධාරණත්වය</th>
            <th style="padding:6px 4px; width:75px;">දිශාව හා අභිප්‍රේරණය</th>
            <th style="padding:6px 4px; width:60px; font-weight:800;">සාමාන්‍යය</th>
            <th style="padding:6px 6px; text-align:left;">සේවක අදහස්</th>
          </tr>
        </thead>
        <tbody>
          ${surveys.map((s, idx) => {
            const rawTs = s.timestamp || s.date || '';
            const dateStr = rawTs.includes(' ') ? rawTs.split(' ')[0] : (rawTs.includes('T') ? rawTs.split('T')[0] : (rawTs || '-'));
            const w = s.ratings?.workEnvironment ?? s.workEnvironment ?? 4;
            const m = s.ratings?.managementSupport ?? s.managementSupport ?? 4;
            const sal = s.ratings?.salaryFairness ?? s.salaryFairness ?? 4;
            const g = s.ratings?.careerGrowth ?? s.ratings?.coopDirection ?? s.careerGrowth ?? s.coopDirection ?? 4;
            const avg = s.averageScore ? Number(s.averageScore).toFixed(1) : Number(((w + m + sal + g) / 4).toFixed(1));
            const empName = s.employeeName || (s.employeeId ? 'සේවක #' + s.employeeId : (s.isAnonymous ? 'නිර්නාමික' : 'කාර්ය මණ්ඩලය'));
            const dept = s.department ? `<br><span style="font-size:9px; color:#555; font-weight:normal;">${s.department}</span>` : '';

            return `
              <tr>
                <td style="padding:5px 4px;">${idx + 1}</td>
                <td style="padding:5px 4px; font-weight:600; white-space:nowrap;">${dateStr}</td>
                <td style="padding:5px 6px; text-align:left; font-weight:600;">${empName}${dept}</td>
                <td style="padding:5px 4px;">${w} / 5</td>
                <td style="padding:5px 4px;">${m} / 5</td>
                <td style="padding:5px 4px;">${sal} / 5</td>
                <td style="padding:5px 4px;">${g} / 5</td>
                <td style="padding:5px 4px; font-weight:bold; background:#f8fafc;">${avg} / 5</td>
                <td style="padding:5px 6px; text-align:left; font-size:9.5px;">${s.comments || '-'}</td>
              </tr>
            `;
          }).join('')}
          ${surveys.length === 0 ? '<tr><td colspan="9" style="padding:16px; color:#888;">තෝරාගත් මාසය සඳහා සුවතා සමීක්ෂණ දත්ත වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else if (activeId === 'skills') {
    titleSinhala = 'සේවක නිපුණතා න්‍යාසය සහ පුහුණු අවශ්‍යතා ලේඛනය';
    titleEnglish = 'Employee Competency & Skills Matrix Report';
    const emps = appData.employees || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 3px; width:30px;">#</th>
            <th style="padding:6px 4px; text-align:left;">සේවකයා හා තනතුර</th>
            <th style="padding:5px 2px; font-size:8.5px;">අධ්‍යාපනය</th>
            <th style="padding:5px 2px; font-size:8.5px;">ක්ෂුද්‍ර මූල්‍ය</th>
            <th style="padding:5px 2px; font-size:8.5px;">ණය තක්සේරු</th>
            <th style="padding:5px 2px; font-size:8.5px;">ගිණුම්කරණය</th>
            <th style="padding:5px 2px; font-size:8.5px;">විගණනය</th>
            <th style="padding:5px 2px; font-size:8.5px;">බැංකු MIS</th>
            <th style="padding:5px 2px; font-size:8.5px;">Excel/IT</th>
            <th style="padding:5px 2px; font-size:8.5px;">නායකත්වය</th>
            <th style="padding:5px 2px; font-size:8.5px;">සාමාජික සත්කාර</th>
            <th style="padding:5px 2px; font-size:8.5px;">නීති/අයකරගැනීම්</th>
            <th style="padding:5px 3px; font-weight:800;">සාමාන්‍යය</th>
          </tr>
        </thead>
        <tbody>
          ${emps.map((e, idx) => {
            const sm = e.skillsMatrix || {};
            const scores = [
              sm.education || 3, sm.microfinance || 3, sm.creditAssessment || 3,
              sm.accounting || 3, sm.audit || 3, sm.bankingMis || 3,
              sm.excelIt || 3, sm.leadership || 3, sm.memberCare || 3, sm.legalRecovery || 3
            ];
            const avg = (scores.reduce((a, b) => a + Number(b), 0) / scores.length).toFixed(1);
            return `
              <tr>
                <td style="padding:5px 2px;">${idx + 1}</td>
                <td style="padding:5px 4px; text-align:left;"><strong>${e.id}</strong> - ${e.fullName || e.name}<br><span style="font-size:8.5px; color:#555;">${e.designation || e.role || ''}</span></td>
                <td style="padding:5px 2px;">${scores[0]}</td>
                <td style="padding:5px 2px;">${scores[1]}</td>
                <td style="padding:5px 2px;">${scores[2]}</td>
                <td style="padding:5px 2px;">${scores[3]}</td>
                <td style="padding:5px 2px;">${scores[4]}</td>
                <td style="padding:5px 2px;">${scores[5]}</td>
                <td style="padding:5px 2px;">${scores[6]}</td>
                <td style="padding:5px 2px;">${scores[7]}</td>
                <td style="padding:5px 2px;">${scores[8]}</td>
                <td style="padding:5px 2px;">${scores[9]}</td>
                <td style="padding:5px 2px; font-weight:bold; font-size:10px;">${avg} / 5</td>
              </tr>
            `;
          }).join('')}
          ${emps.length === 0 ? '<tr><td colspan="13" style="padding:16px; color:#888;">දත්ත වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else if (activeId === 'appraisals') {
    titleSinhala = 'නිල සේවක කාර්යසාධන ඇගයීම් ලේඛනය';
    titleEnglish = 'Employee Performance Appraisals Report';
    const apps = appData.appraisals || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 4px; width:80px;">දිනය</th>
            <th style="padding:6px 4px;">සේවකයා</th>
            <th style="padding:6px 4px;">තනතුර</th>
            <th style="padding:6px 4px;">ඇගයූ කාලසීමාව</th>
            <th style="padding:6px 4px; font-weight:800;">මුළු ලකුණු (100)</th>
            <th style="padding:6px 4px;">ශ්‍රේණිය</th>
            <th style="padding:6px 6px; text-align:left;">නිරීක්ෂණ හා නිර්දේශ</th>
          </tr>
        </thead>
        <tbody>
          ${apps.map((a, idx) => `
            <tr>
              <td style="padding:5px 4px;">${idx + 1}</td>
              <td style="padding:5px 4px;">${a.date || '-'}</td>
              <td style="padding:5px 4px; font-weight:600;">${a.employeeName || '-'}</td>
              <td style="padding:5px 4px;">${a.designation || '-'}</td>
              <td style="padding:5px 4px;">${a.period || '-'}</td>
              <td style="padding:5px 4px; font-weight:bold;">${a.score || a.totalScore || '-'}%</td>
              <td style="padding:5px 4px; font-weight:bold;">${a.grade || '-'}</td>
              <td style="padding:5px 6px; text-align:left;">${a.comments || a.recommendations || '-'}</td>
            </tr>
          `).join('')}
          ${apps.length === 0 ? '<tr><td colspan="8" style="padding:16px; color:#888;">කාර්යසාධන ඇගයීම් දත්ත වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else if (activeId === 'projects') {
    titleSinhala = 'ක්‍රියාත්මක ව්‍යාපෘති සහ රාජකාරි ප්‍රගති ලේඛනය';
    titleEnglish = 'Work Progress & Action Projects Status Report';
    const tasks = appData.tasks || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 6px; text-align:left;">ව්‍යාපෘතිය / රාජකාරිය</th>
            <th style="padding:6px 4px;">පැවරුණු සේවකයා</th>
            <th style="padding:6px 4px;">ප්‍රමුඛතාවය</th>
            <th style="padding:6px 4px;">තත්වය</th>
            <th style="padding:6px 4px;">නියමිත දිනය</th>
            <th style="padding:6px 4px; font-weight:800;">ප්‍රගතිය %</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map((t, idx) => `
            <tr>
              <td style="padding:5px 4px;">${idx + 1}</td>
              <td style="padding:5px 6px; text-align:left; font-weight:600;">${t.title || '-'}<br><span style="font-size:9px; color:#555;">${t.description || ''}</span></td>
              <td style="padding:5px 4px;">${t.assignedTo || '-'}</td>
              <td style="padding:5px 4px;">${t.priority || 'සාමාන්‍ය'}</td>
              <td style="padding:5px 4px;">${t.status || 'ක්‍රියාත්මකයි'}</td>
              <td style="padding:5px 4px;">${t.dueDate || '-'}</td>
              <td style="padding:5px 4px; font-weight:bold;">${t.progress != null ? t.progress + '%' : '-'}</td>
            </tr>
          `).join('')}
          ${tasks.length === 0 ? '<tr><td colspan="7" style="padding:16px; color:#888;">ව්‍යාපෘති දත්ත වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else if (activeId === 'meetings') {
    titleSinhala = 'නිල රැස්වීම් සහ දින දර්ශන ලේඛනය';
    titleEnglish = 'Official Meetings & Schedule Report';
    const meetings = appData.meetings || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 6px; text-align:left;">රැස්වීම් නාමය</th>
            <th style="padding:6px 4px;">වර්ගය</th>
            <th style="padding:6px 4px;">දිනය හා වේලාව</th>
            <th style="padding:6px 4px;">ස්ථානය</th>
            <th style="padding:6px 6px; text-align:left;">න්‍යාය පත්‍රය</th>
            <th style="padding:6px 4px;">තත්වය</th>
          </tr>
        </thead>
        <tbody>
          ${meetings.map((m, idx) => `
            <tr>
              <td style="padding:5px 4px;">${idx + 1}</td>
              <td style="padding:5px 6px; text-align:left; font-weight:600;">${m.title || '-'}</td>
              <td style="padding:5px 4px;">${m.type || '-'}</td>
              <td style="padding:5px 4px;">${m.date || ''} ${m.time || ''}</td>
              <td style="padding:5px 4px;">${m.venue || '-'}</td>
              <td style="padding:5px 6px; text-align:left;">${m.agenda || '-'}</td>
              <td style="padding:5px 4px;">${m.status || 'සැලසුම් කර ඇත'}</td>
            </tr>
          `).join('')}
          ${meetings.length === 0 ? '<tr><td colspan="7" style="padding:16px; color:#888;">රැස්වීම් දත්ත වාර්තා වී නොමැත.</td></tr>' : ''}
        </tbody>
      </table>
    `;
  } else {
    showToast('මෙම පිටුව සඳහා නිල වාර්තාවක් නොමැත.', 'info');
    return;
  }

  // Populate the exact preview modal
  const titleEl = document.getElementById('sheet-print-title');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-print" style="color:#7c3aed;"></i> ${titleSinhala} (${titleEnglish})`;
  }

  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  content.innerHTML = `
    <div style="background:#fff; font-family:'Segoe UI', Arial, sans-serif; color:#000; min-width:980px;">
      <!-- GSCS Boxed Header matching Form 1 -->
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
        <span>${titleSinhala} - ${titleEnglish}</span>
      </div>

      ${tableHTML}

      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11px; text-align:center; padding:0 60px;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (General Manager / Chairman)</div>
      </div>

      <div style="border-top:1.5px solid #000; margin-top:25px; padding-top:6px; display:flex; justify-content:space-between; font-size:9.5px; color:#333;">
        <span>ගලපිටියාගම සණස සමුපකාර සමිතිය</span>
        <span style="font-weight:700;">Report generated by Galapitiyagama Sanasa Cooperative HRMS System</span>
        <span>පිටුව: 1</span>
      </div>
    </div>
  `;

  openSmartModal('modal-smart-sheet-print');
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

  const tasks = appData?.tasks || [];
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
  if (dueDateInput) dueDateInput.value = '';

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

  const meetings = appData?.meetings || [];
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

  const idInput = document.getElementById('meet-id');
  if (idInput) idInput.value = '';

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
  document.getElementById('pay-entry-month')?.addEventListener('change', onPayrollEntryMonthChange);
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
// 2026 ONWARD AUTOMATED PAYROLL MODULE
// =========================================================================

// ---- Config Helpers ----
function getEmpSalaryConfig2026(empId, forMonth) {
  if (/^Y14806\s*-\s*0?3$/i.test(String(empId || '').trim())) empId = 'Y14806 - 03';
  if (!appData.payroll2026Configs) appData.payroll2026Configs = {};
  if (!appData.payroll2026Configs[empId]) {
    const emp = (appData.employees || []).find(e => e.id === empId);
    const isContract = emp && (emp.employmentType || '').toLowerCase().includes('contract');
    const baseBasic = parseFloat(emp?.basicSalary || emp?.basic || 0);
    appData.payroll2026Configs[empId] = {
      empType: isContract ? 'contract' : 'permanent',
      basicSalary: baseBasic,
      // Permanent criteria flags & amounts
      perm_allowance1_enabled: true,  perm_allowance1: 0,
      perm_allowance2_enabled: true,  perm_allowance2: 0,
      perm_interim_enabled: true,     perm_interim: 0,
      perm_secAllowance_enabled: true,perm_secAllowance: 0,
      perm_increment_enabled: true,   perm_increment: 0,
      perm_budget_enabled: true,      perm_budget: 0,
      perm_ot_enabled: true,
      // Contract criteria flags & amounts
      con_allowance1_enabled: true,   con_allowance1: 0,
      con_allowance2_enabled: true,   con_allowance2: 0,
      con_ot_enabled: true,
      con_dailyRate: 1000,
      con_defaultDays: 25,
      revisions: [
        {
          effectiveMonth: '2026-01',
          empType: isContract ? 'contract' : 'permanent',
          basicSalary: baseBasic,
          perm_allowance1_enabled: true,  perm_allowance1: 0,
          perm_allowance2_enabled: true,  perm_allowance2: 0,
          perm_interim_enabled: true,     perm_interim: 0,
          perm_secAllowance_enabled: true,perm_secAllowance: 0,
          perm_increment_enabled: true,   perm_increment: 0,
          perm_budget_enabled: true,      perm_budget: 0,
          perm_ot_enabled: true,
          con_allowance1_enabled: true,   con_allowance1: 0,
          con_allowance2_enabled: true,   con_allowance2: 0,
          con_ot_enabled: true,
          con_dailyRate: 1000,
          con_defaultDays: 25
        }
      ]
    };
  }
  const rootCfg = appData.payroll2026Configs[empId];
  if (!rootCfg.revisions || rootCfg.revisions.length === 0) {
    const { revisions, ...baseProps } = rootCfg;
    rootCfg.revisions = [{
      effectiveMonth: '2026-01',
      ...baseProps
    }];
  }

  if (forMonth && rootCfg.revisions && rootCfg.revisions.length > 0) {
    const sorted = [...rootCfg.revisions].sort((a,b) => (a.effectiveMonth||'').localeCompare(b.effectiveMonth||''));
    let matched = null;
    for (const rev of sorted) {
      if (rev.effectiveMonth && rev.effectiveMonth <= forMonth) {
        matched = rev;
      }
    }
    if (matched) {
      return { ...rootCfg, ...matched };
    } else {
      return { ...rootCfg, ...sorted[0] };
    }
  }

  return rootCfg;
}

// ---- Core Calculation ----
function calculatePayroll2026ForEmp(emp, cfg, overrides) {
  overrides = overrides || {};
  const isContract = cfg.empType === 'contract';

  if (isContract) {
    const basic = parseFloat(cfg.basicSalary) || 0;
    const attendedDays = parseFloat(overrides.attendedDays || 0);
    const dailyRate = parseFloat(cfg.con_dailyRate || 1000);
    const attendanceAllo = attendedDays * dailyRate;
    const allow1 = cfg.con_allowance1_enabled ? (parseFloat(cfg.con_allowance1) || 0) : 0;
    const allow2 = cfg.con_allowance2_enabled ? (parseFloat(cfg.con_allowance2) || 0) : 0;
    const ot    = cfg.con_ot_enabled ? (parseFloat(overrides.ot || 0)) : 0;

    const gross = basic + attendanceAllo + allow1 + allow2 + ot;
    const epfBase = basic + attendanceAllo;
    const empEpf8 = Math.round(epfBase * 0.08 * 100) / 100;
    const empEpf12 = Math.round(epfBase * 0.12 * 100) / 100;
    const etf3 = Math.round(epfBase * 0.03 * 100) / 100;
    const totalDeductions = empEpf8;
    const netSalary = gross - totalDeductions;
    const employerTotal = empEpf12 + etf3;
    const totalCost = gross + employerTotal;

    return {
      isContract: true,
      basic, attendanceAllo, attendedDays, dailyRate,
      allow1, allow2, ot,
      gross, epfBase,
      empEpf8, empEpf12, etf3,
      employerTotal, totalCost,
      totalDeductions, netSalary,
      empPension6: 0, empPension3: 0, pensionBase: 0, epfTotal20: empEpf8 + empEpf12,
      payDate: 10
    };
  } else {
    // Permanent
    const basic = parseFloat(cfg.basicSalary) || 0;
    const allow1  = cfg.perm_allowance1_enabled  ? (parseFloat(cfg.perm_allowance1)  || 0) : 0;
    const allow2  = cfg.perm_allowance2_enabled  ? (parseFloat(cfg.perm_allowance2)  || 0) : 0;
    const interim = cfg.perm_interim_enabled     ? (parseFloat(cfg.perm_interim)     || 0) : 0;
    const sec     = cfg.perm_secAllowance_enabled? (parseFloat(cfg.perm_secAllowance)|| 0) : 0;
    const incr    = cfg.perm_increment_enabled   ? (parseFloat(cfg.perm_increment)   || 0) : 0;
    const budget  = cfg.perm_budget_enabled      ? (parseFloat(cfg.perm_budget)      || 0) : 0;
    const ot      = cfg.perm_ot_enabled          ? (parseFloat(overrides.ot || 0))         : 0;

    const gross = basic + allow1 + allow2 + interim + sec + incr + budget + ot;

    // EPF base: basic + lekham(sec) + allow1 + allow2 + wetupwardhakaya(incr) + interim
    // budget(ayaweya dimanawa) EPF/Pension base ගෙ ඇතුළත් නොවේ
    const epfBase = basic + interim + allow1 + allow2 + sec + incr;
    const epfTotal20 = Math.round(epfBase * 0.20 * 100) / 100;
    const empEpf12   = Math.round(epfBase * 0.12 * 100) / 100;  // employer 12%
    const empEpf8    = Math.round(epfBase * 0.08 * 100) / 100;  // employee 8%

    // Pension base: same as EPF base (budget/ayaweya dimanawa නොමැත) — employee 6%, employer 3%
    const pensionBase  = basic + interim + allow1 + allow2 + sec + incr;
    const empPension3  = Math.round(pensionBase * 0.03 * 100) / 100;  // employer 3%
    const empPension6  = Math.round(pensionBase * 0.06 * 100) / 100;  // employee 6%

    const totalDeductions = empEpf8 + empPension6;
    const netSalary = gross - totalDeductions;
    const employerTotal = empEpf12 + empPension3;
    const totalCost = gross + employerTotal;

    return {
      isContract: false,
      basic, allow1, allow2, interim, sec, incr, budget, ot,
      gross, epfBase, epfTotal20, empEpf12, empEpf8,
      pensionBase, empPension3, empPension6,
      employerTotal, totalCost,
      attendanceAllo: 0, attendedDays: 0, etf3: 0,
      totalDeductions, netSalary,
      payDate: 25
    };
  }
}

// ---- Global handlers for 2026 Payroll controls ----
function onPayroll2026MonthChange(val) {
  window.currentPayroll2026Month = val;
  renderPayroll2026Module();
}

function onPayroll2026TypeChange(val) {
  window.currentPayroll2026Type = val;
  renderPayroll2026Module();
}

function togglePayroll2026ViewMode(mode) {
  window.payroll2026ViewMode = mode;
  renderPayroll2026Module();
}

// ---- Main Render ----
function renderPayroll2026Module() {
  const container = document.getElementById('view-payroll-2026');
  if (!container) return;

  const emps = appData.employees || [];
  if (!appData.payroll2026Configs) appData.payroll2026Configs = {};
  if (!appData.payroll2026History) appData.payroll2026History = [];

  // Determine current active month, employee type filter, and view mode
  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const selMonth = window.currentPayroll2026Month || 
                   container.querySelector('#p26-month-select')?.value || 
                   `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; // Default: current month
  window.currentPayroll2026Month = selMonth;

  const selType  = window.currentPayroll2026Type || 
                  container.querySelector('#p26-type-filter')?.value || 
                  'all';
  window.currentPayroll2026Type = selType;

  const viewMode = window.payroll2026ViewMode || 'compact'; // 'compact' (fits screen without scroll) or 'full' (all 22 columns)
  window.payroll2026ViewMode = viewMode;

  // Build month options dynamically from 2026 January onwards
  const monthNames = ['ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි',
                      'ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'];

  let monthOpts = '';
  for (let y = 2026; y <= Math.max(2028, now.getFullYear() + 1); y++) {
    for (let m = 1; m <= 12; m++) {
      const ym = `${y}-${String(m).padStart(2,'0')}`;
      const sel = ym === selMonth ? 'selected' : '';
      monthOpts += `<option value="${ym}" ${sel}>${y} ${monthNames[m-1]}</option>`;
    }
  }

  let displayEmps = emps;
  if (selType === 'perm')     displayEmps = emps.filter(e => !isContractEmp2026(e));
  if (selType === 'contract') displayEmps = emps.filter(e => isContractEmp2026(e));

  // KPI computation
  let totalBasic=0, totalGross=0, totalNet=0, totalEmpEpf8=0, totalEmpPension6=0, totalDeductions=0;
  let totalEmployerEpf12=0, totalEmployerPension3=0, totalEmployerEtf3=0, totalEmployerStatutory=0, totalOverallCost=0;

  let rowsHtml = '';
  if (viewMode === 'compact') {
    rowsHtml = displayEmps.map(emp => {
      const cfg = getEmpSalaryConfig2026(emp.id, selMonth);
      const saved = (appData.payroll2026History||[]).find(r => r.empId===emp.id && r.month===selMonth);
      const overrides = saved ? { ot: saved.ot||0, attendedDays: saved.attendedDays||0 } : {};
      const calculated = calculatePayroll2026ForEmp(emp, cfg, overrides);
      const r = (saved && saved.basic !== undefined && saved.netSalary !== undefined)
        ? { ...calculated, ...saved }
        : calculated;

      totalBasic              += r.basic;
      totalGross              += r.gross;
      totalNet                += r.netSalary;
      totalEmpEpf8            += r.empEpf8;
      totalEmpPension6        += (r.empPension6||0);
      totalDeductions         += r.totalDeductions;
      totalEmployerEpf12      += r.empEpf12;
      totalEmployerPension3   += (r.empPension3||0);
      totalEmployerEtf3       += (r.etf3||0);
      const empStatutory       = r.empEpf12 + (r.empPension3||0) + (r.etf3||0);
      totalEmployerStatutory  += empStatutory;
      totalOverallCost        += (r.gross + empStatutory);

      const typeBadge = cfg.empType==='contract'
        ? `<span style="background:#fef9c3;color:#854d0e;border:1px solid #fde047;padding:2px 7px;border-radius:999px;font-size:10.5px;font-weight:700;">කොන්ත්‍රාත්</span>`
        : `<span style="background:#dcfce7;color:#166534;border:1px solid #86efac;padding:2px 7px;border-radius:999px;font-size:10.5px;font-weight:700;">ස්ථිර</span>`;
      const payDateBadge = `<span style="font-size:10.5px;font-weight:700;color:${r.payDate===25?'#15803d':'#b45309'};">ගෙවීම: ${r.payDate} වන දින</span>`;

      const totalAllow = r.gross - r.basic;
      let allowDetails = '';
      if (r.isContract) {
        allowDetails = `<div style="font-size:10px;color:#475569;margin-top:2px;line-height:1.4;">
          <span style="color:#0f766e;font-weight:700;">පැමිණීම (${r.attendedDays}d): ${fmt(r.attendanceAllo)}</span>
          ${r.allow1 ? ` | <span>දීම1: ${fmt(r.allow1)}</span>` : ''}
          ${r.allow2 ? ` | <span>දීම2: ${fmt(r.allow2)}</span>` : ''}
          ${r.ot ? ` | <span style="color:#b45309;font-weight:700;">අතිකාල: ${fmt(r.ot)}</span>` : ''}
        </div>`;
      } else {
        const parts = [];
        if (r.interim) parts.push(`<span style="color:#0f766e;font-weight:700;">අන්තර්: ${fmt(r.interim)}</span>`);
        if (r.allow1)  parts.push(`<span>දීම1: ${fmt(r.allow1)}</span>`);
        if (r.allow2)  parts.push(`<span>දීම2: ${fmt(r.allow2)}</span>`);
        if (r.sec)     parts.push(`<span>ලේඛම්: ${fmt(r.sec)}</span>`);
        if (r.incr)    parts.push(`<span>වර්ධක: ${fmt(r.incr)}</span>`);
        if (r.budget)  parts.push(`<span>අයවැය: ${fmt(r.budget)}</span>`);
        if (r.ot)      parts.push(`<span style="color:#b45309;font-weight:700;">අතිකාල: ${fmt(r.ot)}</span>`);
        allowDetails = `<div style="font-size:10px;color:#475569;margin-top:2px;line-height:1.4;">${parts.length ? parts.join(' | ') : '<span style="color:#94a3b8;">දීමනා නැත</span>'}</div>`;
      }

      return `<tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
        <td style="padding:10px 8px;">
          <div style="font-weight:800;color:#1e1b4b;font-size:11px;">${emp.id}</div>
          <div style="font-weight:700;color:#0f172a;font-size:12.5px;margin:2px 0;">${emp.fullName||emp.callingName||''}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:2px;">${typeBadge} <span style="font-size:10.5px;color:#cbd5e1;">•</span> ${payDateBadge}</div>
        </td>
        <td style="padding:10px 8px;text-align:right;font-size:12px;font-weight:800;color:#1e1b4b;vertical-align:middle;">
          ${fmt(r.basic)}
        </td>
        <td style="padding:10px 8px;text-align:right;vertical-align:middle;">
          <div style="font-size:12px;font-weight:800;color:#0f766e;">${fmt(totalAllow)}</div>
          ${allowDetails}
        </td>
        <td style="padding:10px 8px;text-align:right;background:#f5f3ff;vertical-align:middle;">
          <div style="font-size:13px;font-weight:900;color:#4338ca;">${fmt(r.gross)}</div>
        </td>
        <td style="padding:10px 8px;text-align:right;background:#fffcfc;vertical-align:middle;">
          <div style="font-size:12px;font-weight:800;color:#dc2626;">(${fmt(r.totalDeductions)})</div>
          <div style="font-size:10px;color:#64748b;margin-top:2px;">
            <span>EPF 8%: <strong>${fmt(r.empEpf8)}</strong></span>
            ${r.isContract ? '' : ` | <span>විශ්‍රාම 6%: <strong>${fmt(r.empPension6)}</strong></span>`}
          </div>
        </td>
        <td style="padding:10px 8px;text-align:right;background:#ecfdf5;vertical-align:middle;">
          <div style="font-size:13.5px;font-weight:900;color:#065f46;background:#d1fae5;padding:5px 8px;border-radius:8px;display:inline-block;border:1px solid #a7f3d0;white-space:nowrap;">
            රු. ${fmt(r.netSalary)}
          </div>
        </td>
        <td style="padding:10px 8px;text-align:right;background:#f0f9ff;vertical-align:middle;">
          <div style="font-size:12px;font-weight:800;color:#0369a1;">රු. ${fmt(empStatutory)}</div>
          <div style="font-size:10px;color:#475569;margin-top:2px;">
            <span>EPF 12%: <strong>${fmt(r.empEpf12)}</strong></span> | 
            ${r.isContract ? `<span>ETF 3%: <strong>${fmt(r.etf3)}</strong></span>` : `<span>විශ්‍රාම 3%: <strong>${fmt(r.empPension3)}</strong></span>`}
          </div>
        </td>
        <td style="padding:10px 8px;text-align:center;white-space:nowrap;vertical-align:middle;">
          <div style="display:flex;gap:3px;justify-content:center;align-items:center;">
            <button onclick="openPayroll2026CriteriaModal('${emp.id}','${selMonth}')" style="border:none;background:#ede9fe;color:#6d28d9;padding:5px 8px;border-radius:6px;font-size:12px;cursor:pointer;" title="නිර්ණායක වෙනස් කරන්න"><i class="fa-solid fa-sliders"></i></button>
            <button onclick="openAddPayroll2026EntryModal('${emp.id}','${selMonth}')" style="border:none;background:#dbeafe;color:#1d4ed8;padding:5px 8px;border-radius:6px;font-size:12px;cursor:pointer;" title="අතිකාල / දින ඇතුළත් කරන්න"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="viewPayroll2026Payslip('${emp.id}','${selMonth}')" style="border:none;background:#10b981;color:#fff;padding:5px 9px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:5px;" title="වැටුප් පත්‍රිකාව (Pay Sheet)"><i class="fa-solid fa-file-invoice"></i> Pay Sheet</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } else {
    // 22-column full view
    rowsHtml = displayEmps.map(emp => {
      const cfg = getEmpSalaryConfig2026(emp.id, selMonth);
      const saved = (appData.payroll2026History||[]).find(r => r.empId===emp.id && r.month===selMonth);
      const overrides = saved ? { ot: saved.ot||0, attendedDays: saved.attendedDays||0 } : {};
      const calculated = calculatePayroll2026ForEmp(emp, cfg, overrides);
      const r = (saved && saved.basic !== undefined && saved.netSalary !== undefined)
        ? { ...calculated, ...saved }
        : calculated;

      totalBasic              += r.basic;
      totalGross              += r.gross;
      totalNet                += r.netSalary;
      totalEmpEpf8            += r.empEpf8;
      totalEmpPension6        += (r.empPension6||0);
      totalDeductions         += r.totalDeductions;
      totalEmployerEpf12      += r.empEpf12;
      totalEmployerPension3   += (r.empPension3||0);
      totalEmployerEtf3       += (r.etf3||0);
      const empStatutory       = r.empEpf12 + (r.empPension3||0) + (r.etf3||0);
      totalEmployerStatutory  += empStatutory;
      totalOverallCost        += (r.gross + empStatutory);

      const typeBadge = cfg.empType==='contract'
        ? `<span style="background:#fef9c3;color:#854d0e;border:1px solid #fde047;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;">කොන්ත්‍රාත්</span>`
        : `<span style="background:#dcfce7;color:#166534;border:1px solid #86efac;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;">ස්ථිර</span>`;
      const payDateBadge = `<span style="font-size:11px;font-weight:700;color:${r.payDate===25?'#15803d':'#b45309'};">${r.payDate} වන</span>`;

      return `<tr style="border-bottom:1px solid #f1f5f9; transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
        <td style="font-size:11.5px;font-weight:800;color:#1e1b4b;padding:8px 6px;">${emp.id}</td>
        <td style="font-size:12px;font-weight:700;color:#0f172a;padding:8px 6px;">${emp.fullName||emp.callingName||''}</td>
        <td style="text-align:center;padding:8px 6px;">${typeBadge}</td>
        <td style="text-align:right;font-size:11.5px;padding:8px 6px;">${fmt(r.basic)}</td>
        <td style="text-align:right;font-size:11.5px;color:#0f766e;font-weight:600;padding:8px 6px;">${fmt(r.isContract ? r.attendanceAllo : r.interim)}</td>
        <td style="text-align:right;font-size:11.5px;padding:8px 6px;">${fmt(r.allow1)}</td>
        <td style="text-align:right;font-size:11.5px;padding:8px 6px;">${fmt(r.allow2)}</td>
        <td style="text-align:right;font-size:11.5px;padding:8px 6px;">${fmt(r.isContract ? 0 : r.sec)}</td>
        <td style="text-align:right;font-size:11.5px;padding:8px 6px;">${fmt(r.isContract ? 0 : r.incr)}</td>
        <td style="text-align:right;font-size:11.5px;padding:8px 6px;">${fmt(r.isContract ? 0 : r.budget)}</td>
        <td style="text-align:right;font-size:11.5px;color:#b45309;font-weight:600;padding:8px 6px;">${fmt(r.ot)}</td>
        <td style="text-align:right;font-size:12px;font-weight:800;color:#4338ca;background:#f5f3ff;padding:8px 6px;">${fmt(r.gross)}</td>
        <td style="text-align:right;font-size:11.5px;color:#dc2626;padding:8px 6px;">(${fmt(r.empEpf8)})</td>
        <td style="text-align:right;font-size:11.5px;color:#7c3aed;padding:8px 6px;">${r.isContract ? '-' : `(${fmt(r.empPension6)})`}</td>
        <td style="text-align:right;font-size:11.5px;color:#b91c1c;font-weight:700;background:#fef2f2;padding:8px 6px;">(${fmt(r.totalDeductions)})</td>
        <td style="text-align:right;font-size:12.5px;font-weight:800;color:#15803d;background:#ecfdf5;padding:8px 6px;">${fmt(r.netSalary)}</td>
        <td style="text-align:right;font-size:11.5px;color:#16a34a;font-weight:700;padding:8px 6px;">${fmt(r.empEpf12)}</td>
        <td style="text-align:right;font-size:11.5px;color:#d97706;font-weight:700;padding:8px 6px;">${r.isContract ? '-' : fmt(r.empPension3)}</td>
        <td style="text-align:right;font-size:11.5px;color:#0284c7;font-weight:700;padding:8px 6px;">${r.isContract ? fmt(r.etf3) : '-'}</td>
        <td style="text-align:right;font-size:12px;font-weight:800;color:#1e3a8a;background:#eff6ff;padding:8px 6px;">${fmt(empStatutory)}</td>
        <td style="text-align:center;padding:8px 6px;">${payDateBadge}</td>
        <td style="text-align:center;white-space:nowrap;padding:8px 6px;">
          <button onclick="openPayroll2026CriteriaModal('${emp.id}','${selMonth}')" style="border:none;background:#ede9fe;color:#6d28d9;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;margin-right:3px;" title="නිර්ණායක වෙනස් කරන්න"><i class="fa-solid fa-sliders"></i></button>
          <button onclick="openAddPayroll2026EntryModal('${emp.id}','${selMonth}')" style="border:none;background:#dbeafe;color:#1d4ed8;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;margin-right:3px;" title="අතිකාල / දින ඇතුළත් කරන්න"><i class="fa-solid fa-pen-to-square"></i></button>
          <button onclick="viewPayroll2026Payslip('${emp.id}','${selMonth}')" style="border:none;background:#d1fae5;color:#065f46;padding:4px 9px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;" title="වැටුප් පත්‍රිකාව (Pay Sheet)"><i class="fa-solid fa-file-invoice"></i> Pay Sheet</button>
        </td>
      </tr>`;
    }).join('');
  }

  // Grand Total Row
  const totalRow = viewMode === 'compact' ? `
    <tr style="background:#1e1b4b;color:#fff;font-weight:800;border-top:2px solid #312e81;">
      <td colspan="2" style="text-align:right;font-size:12px;padding:10px 8px;">මුළු එකතුව (Grand Total):</td>
      <td style="text-align:right;font-size:12px;color:#99f6e4;padding:10px 8px;">${fmt(totalGross - totalBasic)}</td>
      <td style="text-align:right;font-size:13px;color:#c7d2fe;background:#312e81;padding:10px 8px;">${fmt(totalGross)}</td>
      <td style="text-align:right;font-size:12px;color:#fca5a5;padding:10px 8px;">(${fmt(totalDeductions)})</td>
      <td style="text-align:right;font-size:14px;color:#a7f3d0;background:#064e3b;padding:10px 8px;">${fmt(totalNet)}</td>
      <td style="text-align:right;font-size:13px;color:#bfdbfe;background:#1e3a8a;padding:10px 8px;">${fmt(totalEmployerStatutory)}</td>
      <td></td>
    </tr>` : `
    <tr style="background:#1e1b4b;color:#fff;font-weight:800;border-top:2px solid #312e81;">
      <td colspan="3" style="text-align:right;font-size:12.5px;padding:10px 8px;">මුළු එකතුව (Grand Total)</td>
      <td style="text-align:right;font-size:11.5px;color:#e2e8f0;">${fmt(totalBasic)}</td>
      <td colspan="7"></td>
      <td style="text-align:right;font-size:12.5px;color:#c7d2fe;background:#312e81;">${fmt(totalGross)}</td>
      <td style="text-align:right;color:#fca5a5;">(${fmt(totalEmpEpf8)})</td>
      <td style="text-align:right;color:#ddd6fe;">(${fmt(totalEmpPension6)})</td>
      <td style="text-align:right;color:#f87171;">(${fmt(totalDeductions)})</td>
      <td style="text-align:right;font-size:13px;color:#a7f3d0;background:#064e3b;">${fmt(totalNet)}</td>
      <td style="text-align:right;color:#86efac;">${fmt(totalEmployerEpf12)}</td>
      <td style="text-align:right;color:#fde047;">${fmt(totalEmployerPension3)}</td>
      <td style="text-align:right;color:#7dd3fc;">${fmt(totalEmployerEtf3)}</td>
      <td style="text-align:right;font-size:12.5px;color:#bfdbfe;background:#1e3a8a;">${fmt(totalEmployerStatutory)}</td>
      <td></td>
      <td></td>
    </tr>`;

  // Table header according to view mode
  const tableThead = viewMode === 'compact' ? `
    <thead style="background:#1e1b4b;color:#fff;">
      <tr>
        <th style="padding:10px 8px;text-align:left;width:20%;">සේවකයා (Employee)</th>
        <th style="padding:10px 8px;text-align:right;width:10%;">මූලික වැටුප</th>
        <th style="padding:10px 8px;text-align:right;width:22%;">දීමනා හා අතිකාල විස්තර</th>
        <th style="padding:10px 8px;text-align:right;width:10%;background:#312e81;color:#c7d2fe;">මුළු ඉපැයීම් (Gross)</th>
        <th style="padding:10px 8px;text-align:right;width:12%;color:#fca5a5;">සේවක අඩු කිරීම්</th>
        <th style="padding:10px 8px;text-align:right;width:11%;background:#064e3b;color:#a7f3d0;font-size:12px;">ශුද්ධ වැටුප (Net)</th>
        <th style="padding:10px 8px;text-align:right;width:15%;background:#1e3a8a;color:#bfdbfe;">ආයතනික දායකත්ව</th>
        <th style="padding:10px 8px;text-align:center;width:10%;">ක්‍රියා</th>
      </tr>
    </thead>` : `
    <thead style="background:#1e1b4b;color:#fff;">
      <tr>
        <th style="padding:10px 8px;text-align:left;width:75px;">ID</th>
        <th style="text-align:left;min-width:170px;">සේවක නම</th>
        <th style="text-align:center;width:95px;">වර්ගය</th>
        <th style="text-align:right;width:95px;">මූලික වැටුප</th>
        <th style="text-align:right;width:105px;">අන්තර්/පැමිණීම</th>
        <th style="text-align:right;width:80px;">දීම 01</th>
        <th style="text-align:right;width:80px;">දීම 02</th>
        <th style="text-align:right;width:85px;">ලේඛම්</th>
        <th style="text-align:right;width:85px;">වර්ධකය</th>
        <th style="text-align:right;width:85px;">අයවැය</th>
        <th style="text-align:right;width:85px;">අතිකාල</th>
        <th style="text-align:right;width:110px;background:#312e81;color:#c7d2fe;font-weight:800;">මුළු ඉපැයීම්</th>
        <th style="text-align:right;width:95px;color:#fca5a5;">සේවක EPF 8%</th>
        <th style="text-align:right;width:95px;color:#ddd6fe;">විශ්‍රාම 6%</th>
        <th style="text-align:right;width:95px;color:#f87171;font-weight:700;">අඩුකිරීම්</th>
        <th style="text-align:right;width:115px;background:#064e3b;color:#a7f3d0;font-weight:800;font-size:12px;">ශුද්ධ වැටුප</th>
        <th style="text-align:right;width:95px;color:#86efac;font-weight:700;">ආ. EPF 12%</th>
        <th style="text-align:right;width:95px;color:#fde047;font-weight:700;">ආ. විශ්‍රාම 3%</th>
        <th style="text-align:right;width:95px;color:#7dd3fc;font-weight:700;">ආ. ETF 3%</th>
        <th style="text-align:right;width:110px;background:#1e3a8a;color:#bfdbfe;font-weight:800;">ආයතනික එකතුව</th>
        <th style="text-align:center;width:75px;">දිනය</th>
        <th style="text-align:center;width:130px;">ක්‍රියා</th>
      </tr>
    </thead>`;

  const tableColspan = viewMode === 'compact' ? 8 : 22;
  const tableStyle = viewMode === 'compact' 
    ? 'width:100%;border-collapse:collapse;font-size:11.5px;' 
    : 'width:100%;border-collapse:collapse;font-size:11px;min-width:1850px;';
  const tableWrapperStyle = viewMode === 'compact'
    ? 'overflow-x:hidden;border-radius:12px;border:1.5px solid #cbd5e1;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.03);'
    : 'overflow-x:auto;border-radius:12px;border:1.5px solid #cbd5e1;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.03);';

  container.innerHTML = `
  <div style="padding:16px;">
    <!-- Header Banner -->
    <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);color:#fff;border-radius:16px;padding:20px 24px;margin-bottom:18px;box-shadow:0 8px 24px rgba(30,27,75,0.18);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
        <div>
          <div style="font-size:20px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:10px;">
            <span><i class="fa-solid fa-money-check-dollar" style="color:#60a5fa;margin-right:8px;"></i>2026 වර්ෂයේ සිට මාසික වැටුප් හා EPF/ETF/විශ්‍රාම ක්‍රමවේදය</span>
            <span style="font-size:11px;background:#10b981;color:#fff;padding:3px 10px;border-radius:999px;font-weight:700;">ස්වයංක්‍රීය පද්ධතිය</span>
          </div>
          <div style="font-size:12.5px;opacity:0.9;line-height:1.6;">
            • <strong>ස්ථිර සේවකයින් (25 වන දින):</strong> මූලික + අන්තර් + දීමනා 1,2 + ලේඛම් + වර්ධක + අයවැය මත <strong>EPF 12%+8%</strong> සහ <strong>විශ්‍රාම 3%+6%</strong><br>
            • <strong>කොන්ත්‍රාත් සේවකයින් (10 වන දින):</strong> මූලික + පැමිණීම (දින x 1000) මත <strong>EPF 12%+8%</strong> සහ <strong>ETF 3% (ආයතනයෙන්)</strong>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button onclick="openPayroll2026CriteriaModal()" style="background:#ffffff20;border:1.5px solid #ffffff60;color:#fff;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px);display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-solid fa-sliders"></i> සේවක නිර්ණායක පාලනය
          </button>
          <button onclick="openPayroll2026PrintModal('monthly')" style="background:#2563eb;border:none;color:#fff;padding:8px 16px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,0.3);display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-solid fa-print"></i> මාසික වාර්තාව මුද්‍රණය
          </button>
          <button onclick="openPayroll2026PrintModal('annual')" style="background:#7c3aed;border:none;color:#fff;padding:8px 16px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(124,58,237,0.3);display:inline-flex;align-items:center;gap:6px;">
            <i class="fa-solid fa-chart-line"></i> වාර්ෂික වාර්තාව මුද්‍රණය
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Statistics (Employee Side & Employer Side) -->
    <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;margin-bottom:12px;">
      <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-size:11px;color:#64748b;font-weight:700;margin-bottom:4px;">සේවකයින් ගණන</div>
        <div style="font-size:17px;font-weight:800;color:#1e1b4b;">${displayEmps.length}</div>
        <div style="font-size:10.5px;color:#94a3b8;">තෝරාගත් කාණ්ඩය</div>
      </div>
      <div style="background:#f5f3ff;border:1.5px solid #ddd6fe;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-size:11px;color:#6d28d9;font-weight:700;margin-bottom:4px;">මුළු ඉපැයීම් (Gross)</div>
        <div style="font-size:17px;font-weight:800;color:#5b21b6;">Rs. ${fmt(totalGross)}</div>
        <div style="font-size:10.5px;color:#7c3aed;">මූලික + සියලු දීමනා</div>
      </div>
      <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-size:11px;color:#dc2626;font-weight:700;margin-bottom:4px;">සේවක අඩුකිරීම් (EPF 8% + විශ්‍රාම 6%)</div>
        <div style="font-size:17px;font-weight:800;color:#b91c1c;">Rs. ${fmt(totalDeductions)}</div>
        <div style="font-size:10.5px;color:#ef4444;">EPF: ${fmt(totalEmpEpf8)} | විශ්‍රාම: ${fmt(totalEmpPension6)}</div>
      </div>
      <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-size:11px;color:#047857;font-weight:700;margin-bottom:4px;">මුළු ශුද්ධ වැටුප (Net Salary)</div>
        <div style="font-size:18px;font-weight:900;color:#065f46;">Rs. ${fmt(totalNet)}</div>
        <div style="font-size:10.5px;color:#059669;">සේවකයින්ට ගෙවිය යුතු මුදල</div>
      </div>
      <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:12px;text-align:center;">
        <div style="font-size:11px;color:#1e40af;font-weight:700;margin-bottom:4px;">ආයතනික දායකත්ව එකතුව</div>
        <div style="font-size:17px;font-weight:800;color:#1d4ed8;">Rs. ${fmt(totalEmployerStatutory)}</div>
        <div style="font-size:10.5px;color:#2563eb;">ආයතනයෙන් දරන මුදල</div>
      </div>
    </div>

    <!-- Employer Contribution Detail Bar -->
    <div style="background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:12px;padding:10px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;font-size:12px;">
      <div style="font-weight:800;color:#1e3a8a;display:flex;align-items:center;gap:6px;">
        <i class="fa-solid fa-building-columns"></i> ආයතනයෙන් දරන ව්‍යවස්ථාපිත දායකත්ව (Employer Contributions):
      </div>
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;">
        <div><span style="color:#64748b;">ආයතනික EPF 12%:</span> <strong style="color:#16a34a;font-size:13px;">Rs. ${fmt(totalEmployerEpf12)}</strong></div>
        <div><span style="color:#64748b;">ආයතනික විශ්‍රාම 3% (ස්ථිර):</span> <strong style="color:#d97706;font-size:13px;">Rs. ${fmt(totalEmployerPension3)}</strong></div>
        <div><span style="color:#64748b;">ආයතනික ETF 3% (කොන්ත්‍රාත්):</span> <strong style="color:#0284c7;font-size:13px;">Rs. ${fmt(totalEmployerEtf3)}</strong></div>
        <div style="border-left:1px solid #cbd5e1;padding-left:14px;"><span style="color:#64748b;">ආයතනික මුළු පිරිවැය (Cost):</span> <strong style="color:#4338ca;font-size:13.5px;">Rs. ${fmt(totalOverallCost)}</strong></div>
      </div>
    </div>

    <!-- Controls Row -->
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:14px;background:#fff;padding:12px 16px;border-radius:12px;border:1px solid #e2e8f0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <label style="font-size:12px;font-weight:700;color:#475569;">අදාළ මාසය:</label>
        <select id="p26-month-select" class="form-input-pill" style="width:190px;font-size:12.5px;" onchange="onPayroll2026MonthChange(this.value)">
          ${monthOpts}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <label style="font-size:12px;font-weight:700;color:#475569;">සේවක වර්ගය:</label>
        <select id="p26-type-filter" class="form-input-pill" style="width:170px;font-size:12.5px;" onchange="onPayroll2026TypeChange(this.value)">
          <option value="all" ${selType==='all'?'selected':''}>සියලු සේවකයින්</option>
          <option value="perm" ${selType==='perm'?'selected':''}>ස්ථිර සේවකයින් (25)</option>
          <option value="contract" ${selType==='contract'?'selected':''}>කොන්ත්‍රාත් සේවකයින් (10)</option>
        </select>
      </div>
      <div style="display:flex;align-items:center;background:#f1f5f9;border-radius:8px;padding:3px;border:1px solid #cbd5e1;margin-left:auto;">
        <button type="button" onclick="togglePayroll2026ViewMode('compact')" style="border:none;background:${viewMode==='compact'?'#1e1b4b':'transparent'};color:${viewMode==='compact'?'#fff':'#64748b'};padding:6px 12px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;transition:all 0.15s;" title="තිරයට ගැළපෙන සම්පිණ්ඩිත පෙනුම (Scroll නොමැත)">
          <i class="fa-solid fa-table-columns"></i> සම්පිණ්ඩිත (Fit Screen)
        </button>
        <button type="button" onclick="togglePayroll2026ViewMode('full')" style="border:none;background:${viewMode==='full'?'#1e1b4b':'transparent'};color:${viewMode==='full'?'#fff':'#64748b'};padding:6px 12px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;transition:all 0.15s;" title="සියලු තීරු 22 සහිත විස්තීරණ ලේඛනය">
          <i class="fa-solid fa-table"></i> විස්තීරණ (22 Cols)
        </button>
      </div>
      <div style="display:flex;gap:8px;">
        <button onclick="openAddPayroll2026EntryModal()" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">
          <i class="fa-solid fa-circle-plus"></i> අතිකාල / වෙනස්කම් ඇතුළත් කිරීම
        </button>
      </div>
    </div>

    <!-- Official Payroll Table -->
    <div style="${tableWrapperStyle}">
      <table style="${tableStyle}">
        ${tableThead}
        <tbody id="p26-tbody">
          ${rowsHtml || `<tr><td colspan="${tableColspan}" style="text-align:center;padding:30px;color:#94a3b8;font-size:13px;">සේවකයින් කිසිවෙකු ලියාපදිංචි කර නොමැත.</td></tr>`}
        </tbody>
        <tfoot>${totalRow}</tfoot>
      </table>
    </div>
  </div>`;
}

function isContractEmp2026(emp) {
  const cfg = appData.payroll2026Configs?.[emp.id];
  if (cfg) return cfg.empType === 'contract';
  return (emp.employmentType||'').toLowerCase().includes('contract');
}

function fmt(v) {
  if (isNaN(v) || v === null || v === undefined) return '0.00';
  return parseFloat(v).toLocaleString('en-LK', {minimumFractionDigits:2, maximumFractionDigits:2});
}

// ---- Auto Generate ----
function autoGeneratePayroll2026Month() {
  const container = document.getElementById('view-payroll-2026');
  const selMonth = window.currentPayroll2026Month || container?.querySelector('#p26-month-select')?.value;
  if (!selMonth) { alert('කරුණාකර මාසය තෝරන්න.'); return; }
  if (!confirm(`${selMonth} මාස සඳහා සියලු සේවකයින්ගේ වැටුප් ස්වයංක්‍රීයව ගණනය කරන්නද?`)) return;

  const emps = appData.employees || [];
  emps.forEach(emp => {
    const cfg = getEmpSalaryConfig2026(emp.id, selMonth);
    const existing = (appData.payroll2026History||[]).find(r => r.empId===emp.id && r.month===selMonth);
    const overrides = existing ? {ot: existing.ot||0, attendedDays: existing.attendedDays||0} : {};
    const r = calculatePayroll2026ForEmp(emp, cfg, overrides);
    const rec = {
      id: `P26-${emp.id}-${selMonth}`,
      empId: emp.id,
      empName: emp.fullName || emp.callingName,
      month: selMonth,
      empType: cfg.empType,
      ot: overrides.ot||0,
      attendedDays: overrides.attendedDays||0,
      ...r,
      createdAt: new Date().toISOString()
    };
    // Update or insert
    const idx = (appData.payroll2026History||[]).findIndex(r => r.empId===emp.id && r.month===selMonth);
    if (!appData.payroll2026History) appData.payroll2026History = [];
    if (idx >= 0) appData.payroll2026History[idx] = rec;
    else appData.payroll2026History.push(rec);

    // Also push into legacy payrollHistory for EPF tracker compatibility
    const legacyIdx = (appData.payrollHistory||[]).findIndex(x => x.empId===emp.id && x.month===selMonth);
    const legacy = {
      id: rec.id, empId: emp.id,
      empName: rec.empName, month: selMonth,
      gross: r.gross, net: r.netSalary,
      epf20: r.epfTotal20||0, employer12: r.empEpf12, employee8: r.empEpf8,
      pension3: r.empPension3||0, pension6: r.empPension6||0, etf3: r.etf3||0,
      basic: r.basic, createdAt: rec.createdAt
    };
    if (!appData.payrollHistory) appData.payrollHistory = [];
    if (legacyIdx >= 0) appData.payrollHistory[legacyIdx] = legacy;
    else appData.payrollHistory.push(legacy);
  });

  persistData();
  renderPayroll2026Module();
  alert(`${selMonth} — සේවකයින් ${emps.length} දෙනාගේ වැටුප් සාර්ථකව ගණනය කෙරිණ!`);
}

// ---- Criteria Modal ----
function openPayroll2026CriteriaModal(empId, month) {
  if (!empId && appData.employees && appData.employees.length > 0) {
    empId = appData.employees[0].id;
  }
  const emp = (appData.employees||[]).find(e => e.id===empId);
  if (!emp) return;

  const container = document.getElementById('view-payroll-2026');
  if (!month) {
    month = window.currentPayroll2026Month ||
            container?.querySelector('#p26-month-select')?.value ||
            '2026-01';
  }

  const modal = document.getElementById('modal-payroll2026-criteria');
  if (!modal) { alert('Criteria modal not found in HTML.'); return; }

  // Populate month options for effective month dropdown
  const monthSel = document.getElementById('p2026-cfg-effective-month');
  if (monthSel) {
    const monthNames = ['ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි',
                        'ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'];
    let mOpts = '';
    const nowY = new Date().getFullYear();
    for (let y = 2026; y <= Math.max(2028, nowY + 1); y++) {
      for (let m = 1; m <= 12; m++) {
        const ym = `${y}-${String(m).padStart(2,'0')}`;
        const sel = ym === month ? 'selected' : '';
        mOpts += `<option value="${ym}" ${sel}>${y} ${monthNames[m-1]} සිට</option>`;
      }
    }
    monthSel.innerHTML = mOpts;
    monthSel.value = month;
  }

  // Populate employee dropdown (actual HTML id: p2026-cfg-emp)
  const empSel = document.getElementById('p2026-cfg-emp');
  if (empSel) {
    empSel.innerHTML = (appData.employees||[]).map(e =>
      `<option value="${e.id}" ${e.id===empId?'selected':''}>${e.fullName||e.callingName} (${e.id})</option>`
    ).join('');
    empSel.value = empId;
  }

  loadPayroll2026CfgForm(empId, month);
  modal.classList.add('active');
}

function loadPayroll2026CfgForm(empId, month) {
  if (!empId) empId = document.getElementById('p2026-cfg-emp')?.value;
  if (!month) month = document.getElementById('p2026-cfg-effective-month')?.value || window.currentPayroll2026Month || '2026-01';
  if (!empId) return;

  const cfg = getEmpSalaryConfig2026(empId, month);

  // Set type select
  const typeSel = document.getElementById('p2026-cfg-type');
  if (typeSel) typeSel.value = cfg.empType === 'contract' ? 'CONTRACT' : 'PERMANENT';

  // Set basic salary
  const basicInp = document.getElementById('p2026-cfg-basic');
  if (basicInp) basicInp.value = cfg.basicSalary || 0;

  // Fill panel values and toggle panels
  _p26FillPanelValues(cfg);
  _p26TogglePanels(cfg.empType === 'contract');
  updatePayroll2026LivePreview();
}

function onPayroll2026CfgMonthChange() {
  const empId = document.getElementById('p2026-cfg-emp')?.value;
  const month = document.getElementById('p2026-cfg-effective-month')?.value;
  loadPayroll2026CfgForm(empId, month);
}

function onPayroll2026CfgEmpChange() {
  const empId = document.getElementById('p2026-cfg-emp')?.value;
  const month = document.getElementById('p2026-cfg-effective-month')?.value;
  loadPayroll2026CfgForm(empId, month);
}

function _p26FillPanelValues(cfg) {
  const isContract = cfg.empType === 'contract';
  const sv = (id, v) => { const el=document.getElementById(id); if(el) el.value=v||0; };
  const sc = (id, v) => { const el=document.getElementById(id); if(el) el.checked=!!v; };
  if (!isContract) {
    sc('p2026-cfg-chk-allowance1', cfg.perm_allowance1_enabled); sv('p2026-cfg-val-allowance1', cfg.perm_allowance1);
    sc('p2026-cfg-chk-allowance2', cfg.perm_allowance2_enabled); sv('p2026-cfg-val-allowance2', cfg.perm_allowance2);
    sc('p2026-cfg-chk-interim',    cfg.perm_interim_enabled);    sv('p2026-cfg-val-interim',    cfg.perm_interim);
    sc('p2026-cfg-chk-sec',        cfg.perm_secAllowance_enabled);sv('p2026-cfg-val-sec',       cfg.perm_secAllowance);
    sc('p2026-cfg-chk-inc',        cfg.perm_increment_enabled);  sv('p2026-cfg-val-inc',        cfg.perm_increment);
    sc('p2026-cfg-chk-budget',     cfg.perm_budget_enabled);     sv('p2026-cfg-val-budget',     cfg.perm_budget);
  } else {
    sc('p2026-cfg-chk-att',   true);                               sv('p2026-cfg-val-attrate', cfg.con_dailyRate||1000);
    sc('p2026-cfg-chk-callw1',cfg.con_allowance1_enabled);         sv('p2026-cfg-val-callw1',  cfg.con_allowance1);
    sc('p2026-cfg-chk-callw2',cfg.con_allowance2_enabled);         sv('p2026-cfg-val-callw2',  cfg.con_allowance2);
    sv('p2026-cfg-val-attdays', cfg.con_defaultDays||25);
  }
}

function _p26TogglePanels(isContract) {
  const permPanel = document.getElementById('p2026-cfg-perm-panel');
  const conPanel  = document.getElementById('p2026-cfg-contract-panel');
  if (permPanel) permPanel.style.display = isContract ? 'none' : 'block';
  if (conPanel)  conPanel.style.display  = isContract ? 'block' : 'none';
}

function _renderP26CfgForm(modal, empId) {
  // Legacy wrapper — now delegates to the proper HTML-aware functions
  const cfg = getEmpSalaryConfig2026(empId);
  const typeSel = document.getElementById('p2026-cfg-type');
  if (typeSel) typeSel.value = cfg.empType === 'contract' ? 'CONTRACT' : 'PERMANENT';
  const basicInp = document.getElementById('p2026-cfg-basic');
  if (basicInp) basicInp.value = cfg.basicSalary || 0;
  _p26FillPanelValues(cfg);
  _p26TogglePanels(cfg.empType === 'contract');
  updatePayroll2026LivePreview();
}

function _p26CfgRow(key, label, enabled, amount) {
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
    <input type="checkbox" id="p26cfg-${key}-enabled" ${enabled?'checked':''} onchange="updatePayroll2026LivePreview()" style="accent-color:#6d28d9;width:16px;height:16px;">
    <label for="p26cfg-${key}-enabled" style="font-size:12px;font-weight:600;min-width:200px;">${label}</label>
    <input type="number" step="0.01" id="p26cfg-${key}" class="form-input-pill" value="${amount||0}" style="width:130px;" oninput="updatePayroll2026LivePreview()">
  </div>`;
}

function _p26CfgRowNoAmt(key, label, enabled) {
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
    <input type="checkbox" id="p26cfg-${key}-enabled" ${enabled?'checked':''} onchange="updatePayroll2026LivePreview()" style="accent-color:#6d28d9;width:16px;height:16px;">
    <label for="p26cfg-${key}-enabled" style="font-size:12px;font-weight:600;">${label}</label>
  </div>`;
}

function onPayroll2026CfgTypeChange() {
  const typeSel = document.getElementById('p2026-cfg-type');
  const isContract = typeSel?.value === 'CONTRACT';
  _p26TogglePanels(isContract);
  updatePayroll2026LivePreview();
}

function updatePayroll2026LivePreview() {
  const empId = document.getElementById('p2026-cfg-emp')?.value;
  const cfg = _readP26CfgFromForm();
  if (!cfg) return;
  const r = calculatePayroll2026ForEmp({id: empId||''}, cfg, {});
  // Update live preview using existing HTML elements
  const setEl = (id, val) => { const el=document.getElementById(id); if(el) el.textContent='රු. '+fmt(val); };
  setEl('p2026-prev-gross', r.gross);
  setEl('p2026-prev-epf8',  r.empEpf8);
  setEl('p2026-prev-epf12', r.empEpf12);
  setEl('p2026-prev-net',   r.netSalary);
  const extraLbl = document.getElementById('p2026-prev-extra-lbl');
  const extraVal = document.getElementById('p2026-prev-extra-val');
  if (r.isContract) {
    if (extraLbl) extraLbl.textContent = 'ETF 3% (ආ.):';
    if (extraVal) extraVal.textContent = 'රු. '+fmt(r.etf3||0);
  } else {
    if (extraLbl) extraLbl.textContent = 'සේවක විශ්‍රාම 6%:';
    if (extraVal) extraVal.textContent = 'රු. '+fmt(r.empPension6||0);
  }
}

function _readP26CfgFromForm() {
  const typeSel = document.getElementById('p2026-cfg-type');
  const isContract = typeSel?.value === 'CONTRACT';
  const basicSalary = parseFloat(document.getElementById('p2026-cfg-basic')?.value)||0;
  const G = id => document.getElementById(id);
  const cfg = { empType: isContract ? 'contract' : 'permanent', basicSalary };
  if (!isContract) {
    cfg.perm_allowance1_enabled = G('p2026-cfg-chk-allowance1')?.checked ?? false;
    cfg.perm_allowance1 = parseFloat(G('p2026-cfg-val-allowance1')?.value)||0;
    cfg.perm_allowance2_enabled = G('p2026-cfg-chk-allowance2')?.checked ?? false;
    cfg.perm_allowance2 = parseFloat(G('p2026-cfg-val-allowance2')?.value)||0;
    cfg.perm_interim_enabled = G('p2026-cfg-chk-interim')?.checked ?? false;
    cfg.perm_interim = parseFloat(G('p2026-cfg-val-interim')?.value)||0;
    cfg.perm_secAllowance_enabled = G('p2026-cfg-chk-sec')?.checked ?? false;
    cfg.perm_secAllowance = parseFloat(G('p2026-cfg-val-sec')?.value)||0;
    cfg.perm_increment_enabled = G('p2026-cfg-chk-inc')?.checked ?? false;
    cfg.perm_increment = parseFloat(G('p2026-cfg-val-inc')?.value)||0;
    cfg.perm_budget_enabled = G('p2026-cfg-chk-budget')?.checked ?? false;
    cfg.perm_budget = parseFloat(G('p2026-cfg-val-budget')?.value)||0;
    cfg.perm_ot_enabled = true;
  } else {
    cfg.con_allowance1_enabled = G('p2026-cfg-chk-callw1')?.checked ?? false;
    cfg.con_allowance1 = parseFloat(G('p2026-cfg-val-callw1')?.value)||0;
    cfg.con_allowance2_enabled = G('p2026-cfg-chk-callw2')?.checked ?? false;
    cfg.con_allowance2 = parseFloat(G('p2026-cfg-val-callw2')?.value)||0;
    cfg.con_dailyRate = parseFloat(G('p2026-cfg-val-attrate')?.value)||1000;
    cfg.con_defaultDays = parseFloat(G('p2026-cfg-val-attdays')?.value)||25;
    cfg.con_ot_enabled = true;
  }
  return cfg;
}

function savePayroll2026Criteria(e) {
  e.preventDefault();
  const empId = document.getElementById('p2026-cfg-emp')?.value;
  if (!empId) { alert('සේවකයෙකු තෝරන්න!'); return; }
  const effectiveMonth = document.getElementById('p2026-cfg-effective-month')?.value ||
                         window.currentPayroll2026Month || '2026-01';
  const cfg = _readP26CfgFromForm();
  if (!appData.payroll2026Configs) appData.payroll2026Configs = {};
  if (!appData.payroll2026Configs[empId]) getEmpSalaryConfig2026(empId);
  
  const root = appData.payroll2026Configs[empId];
  if (!root.revisions) {
    const { revisions, ...baseProps } = root;
    root.revisions = [{
      effectiveMonth: '2026-01',
      ...baseProps
    }];
  }

  const newRev = { ...cfg, effectiveMonth };
  const revIndex = root.revisions.findIndex(r => r.effectiveMonth === effectiveMonth);
  if (revIndex >= 0) {
    root.revisions[revIndex] = { ...root.revisions[revIndex], ...newRev };
  } else {
    root.revisions.push(newRev);
  }

  root.revisions.sort((a,b) => (a.effectiveMonth||'').localeCompare(b.effectiveMonth||''));

  // Update root with latest revision
  const latestRev = root.revisions[root.revisions.length - 1];
  Object.assign(root, latestRev);

  persistData();
  document.getElementById('modal-payroll2026-criteria')?.classList.remove('active');
  renderPayroll2026Module();
  alert(`සේවක වැටුප් නිර්ණායක (${effectiveMonth} සිට වලංගු වන පරිදි) සාර්ථකව සුරකින ලදී!`);
}

// ---- Monthly Entry Modal ----
function openAddPayroll2026EntryModal(empId, month) {
  const modal = document.getElementById('modal-payroll2026-entry');
  if (!modal) { alert('Entry modal not found.'); return; }

  const container = document.getElementById('view-payroll-2026');
  if (!month) {
    // Always use the globally tracked month (from main table dropdown)
    month = window.currentPayroll2026Month ||
            container?.querySelector('#p26-month-select')?.value ||
            `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
  }
  if (!empId && appData.employees && appData.employees.length > 0) {
    empId = appData.employees[0].id;
  }

  // Populate employee dropdown — actual HTML id: p2026-entry-emp
  const empSel = document.getElementById('p2026-entry-emp');
  if (empSel) {
    empSel.innerHTML = (appData.employees||[]).map(e =>
      `<option value="${e.id}" ${e.id===empId?'selected':''}>${e.fullName||e.callingName} (${e.id})</option>`
    ).join('');
    empSel.value = empId;
  }

  // Set month — actual HTML id: p2026-entry-month
  const monthSel = document.getElementById('p2026-entry-month');
  if (monthSel) monthSel.value = month;

  // Auto-set date — smart pay date with weekend skip
  const cfg = getEmpSalaryConfig2026(empId, month);
  const isContract = cfg.empType === 'contract';
  const [yr, mo] = (month||'2026-01').split('-');
  const payDay = isContract ? 10 : 25;
  // If pay day falls on Saturday(6) → Monday(+2), Sunday(0) → Monday(+1)
  let payDate = new Date(parseInt(yr), parseInt(mo)-1, payDay);
  const dow = payDate.getDay();
  if (dow === 6) payDate.setDate(payDay + 2); // Saturday → Monday
  else if (dow === 0) payDate.setDate(payDay + 1); // Sunday → Monday
  const payDateStr = payDate.toISOString().slice(0,10);
  const dateEl = document.getElementById('p2026-entry-date');
  if (dateEl) dateEl.value = payDateStr;

  // Show/hide attended-days field
  const attBox = document.getElementById('p2026-entry-attdays-container');
  if (attBox) attBox.style.display = isContract ? 'block' : 'none';

  // Update type badge
  const badge = document.getElementById('p2026-entry-type-badge');
  if (badge) {
    badge.textContent = isContract ? 'කොන්ත්‍රාත්' : 'ස්ථිර';
    badge.style.background = isContract ? '#d97706' : '#7c3aed';
  }

  // Load saved values
  const saved = (appData.payroll2026History||[]).find(r => r.empId===empId && r.month===month);
  const otInp   = document.getElementById('p2026-entry-ot');
  const daysInp = document.getElementById('p2026-entry-attdays');
  if (otInp)   otInp.value   = saved?.ot || 0;
  if (daysInp) daysInp.value = saved?.attendedDays || cfg.con_defaultDays || 25;
  if (saved?.date && dateEl) dateEl.value = saved.date;

  recalcPayroll2026EntryModal();
  modal.classList.add('active');
}

function onPayroll2026EntryEmpChange() {
  const empId = document.getElementById('p2026-entry-emp')?.value;
  const month = document.getElementById('p2026-entry-month')?.value;
  if (!empId) return;

  const cfg = getEmpSalaryConfig2026(empId, month);
  const isContract = cfg.empType === 'contract';

  // Load saved values if exists
  const saved = (appData.payroll2026History || []).find(r => r.empId === empId && r.month === month);
  const otInp   = document.getElementById('p2026-entry-ot');
  const daysInp = document.getElementById('p2026-entry-attdays');
  const dateEl  = document.getElementById('p2026-entry-date');

  if (otInp)   otInp.value   = saved?.ot || 0;
  if (daysInp) daysInp.value = saved?.attendedDays || cfg.con_defaultDays || 25;

  if (saved?.date && dateEl) {
    dateEl.value = saved.date;
  } else if (dateEl && month) {
    const [yr, mo] = month.split('-');
    const payDay = isContract ? 10 : 25;
    let payDate = new Date(parseInt(yr), parseInt(mo) - 1, payDay);
    const dow = payDate.getDay();
    if (dow === 6) payDate.setDate(payDay + 2); // Saturday -> Monday
    else if (dow === 0) payDate.setDate(payDay + 1); // Sunday -> Monday
    dateEl.value = payDate.toISOString().slice(0, 10);
  }

  // Show/hide attended-days field
  const attBox = document.getElementById('p2026-entry-attdays-container');
  if (attBox) attBox.style.display = isContract ? 'block' : 'none';

  // Update type badge
  const badge = document.getElementById('p2026-entry-type-badge');
  if (badge) {
    badge.textContent = isContract ? 'කොන්ත්‍රාත්' : 'ස්ථිර';
    badge.style.background = isContract ? '#d97706' : '#7c3aed';
  }

  recalcPayroll2026EntryModal();
}

function recalcPayroll2026EntryModal() {
  const empId = document.getElementById('p2026-entry-emp')?.value;
  const month = document.getElementById('p2026-entry-month')?.value;
  if (!empId) return;
  const cfg = getEmpSalaryConfig2026(empId, month);
  const ot   = parseFloat(document.getElementById('p2026-entry-ot')?.value)||0;
  const days = parseFloat(document.getElementById('p2026-entry-attdays')?.value)||0;
  const r = calculatePayroll2026ForEmp({id:empId}, cfg, {ot, attendedDays: days});

  // Show/hide attended-days field based on type
  const attBoxR = document.getElementById('p2026-entry-attdays-container');
  if (attBoxR) attBoxR.style.display = cfg.empType === 'contract' ? 'block' : 'none';

  // Update attendance label
  const attLbl = document.getElementById('p2026-entry-attamount-lbl');
  if (attLbl) attLbl.textContent = `= රු. ${fmt(r.attendanceAllo)}`;

  const setEl = (id, val) => { const el=document.getElementById(id); if(el) el.textContent='රු. '+fmt(val); };
  setEl('p2026-modal-basic',     r.basic);
  setEl('p2026-modal-allowances', r.isContract ? r.attendanceAllo : (r.allow1+r.allow2+(r.interim||0)+(r.sec||0)+(r.incr||0)+(r.budget||0)));
  setEl('p2026-modal-ot',        r.ot);
  setEl('p2026-modal-gross',     r.gross);
  setEl('p2026-modal-epfbase',   r.epfBase);
  setEl('p2026-modal-epf12',     r.empEpf12);
  setEl('p2026-modal-epf8',      r.empEpf8);

  const extraLbl = document.getElementById('p2026-modal-extra-lbl');
  const extraEl  = document.getElementById('p2026-modal-extra');
  if (r.isContract) {
    if (extraLbl) extraLbl.textContent = 'ETF 3% (ආ.):';
    if (extraEl)  extraEl.textContent  = 'රු. '+fmt(r.etf3||0);
  } else {
    if (extraLbl) extraLbl.textContent = 'විශ්‍රාම 6% (සේවක):';
    if (extraEl)  extraEl.textContent  = 'රු. '+fmt(r.empPension6||0);
  }

  const netEl = document.getElementById('p2026-modal-net');
  if (netEl) netEl.textContent = 'රු. '+fmt(r.netSalary);
}

function savePayroll2026MonthlyEntry(e) {
  e.preventDefault();
  const empId = document.getElementById('p2026-entry-emp')?.value;
  const month = document.getElementById('p2026-entry-month')?.value;
  const payDateVal = document.getElementById('p2026-entry-date')?.value || '';
  if (!empId || !month) return;
  const cfg = getEmpSalaryConfig2026(empId, month);
  const ot   = parseFloat(document.getElementById('p2026-entry-ot')?.value)||0;
  const days = parseFloat(document.getElementById('p2026-entry-attdays')?.value)||0;
  const r = calculatePayroll2026ForEmp({id:empId}, cfg, {ot, attendedDays: days});
  const emp = (appData.employees||[]).find(e=>e.id===empId);
  const rec = {
    id: `P26-${empId}-${month}`, empId, month,
    date: payDateVal,
    empName: emp?.fullName||emp?.callingName||empId,
    empType: cfg.empType, ot, attendedDays: days, ...r,
    createdAt: new Date().toISOString()
  };
  if (!appData.payroll2026History) appData.payroll2026History = [];
  const idx = appData.payroll2026History.findIndex(x => x.empId===empId && x.month===month);
  if (idx>=0) appData.payroll2026History[idx] = rec;
  else appData.payroll2026History.push(rec);

  // Legacy sync for EPF tracker
  if (!appData.payrollHistory) appData.payrollHistory = [];
  const li = appData.payrollHistory.findIndex(x => x.empId===empId && x.month===month);
  const legacy = { id: rec.id, empId, empName: rec.empName, month,
    gross: r.gross, net: r.netSalary, epf20: r.epfTotal20||0,
    employer12: r.empEpf12, employee8: r.empEpf8,
    pension3: r.empPension3||0, pension6: r.empPension6||0, etf3: r.etf3||0,
    basic: r.basic, createdAt: rec.createdAt };
  if (li>=0) appData.payrollHistory[li] = legacy;
  else appData.payrollHistory.push(legacy);

  persistData();
  document.getElementById('modal-payroll2026-entry')?.classList.remove('active');
  renderPayroll2026Module();
  alert(`${emp?.callingName||empId} — ${month} දැනුම්පත් දත්ත සාර්ථකව සුරකින ලදී!`);
}

// ---- Official 2026 Pay Sheet (Payslip) View ----
function viewPayroll2026Payslip(empId, month) {
  const container = document.getElementById('view-payroll-2026');
  const selMonth = month || window.currentPayroll2026Month || container?.querySelector('#p26-month-select')?.value;
  const emp = (appData.employees||[]).find(e=>e.id===empId);
  if (!emp) return;
  const cfg = getEmpSalaryConfig2026(empId, selMonth);
  const saved = (appData.payroll2026History||[]).find(r=>r.empId===empId && r.month===selMonth);
  const overrides = saved ? {ot:saved.ot||0, attendedDays:saved.attendedDays||0} : {};
  const calculated = calculatePayroll2026ForEmp(emp, cfg, overrides);
  const r = (saved && saved.basic !== undefined && saved.netSalary !== undefined)
    ? { ...calculated, ...saved }
    : calculated;
  const mn = ['','ජනවාරි','පෙබරවාරි','මාර්තු','අප්‍රේල්','මැයි','ජූනි','ජූලි','අගෝස්තු','සැප්තැම්බර්','ඔක්තෝබර්','නොවැම්බර්','දෙසැම්බර්'];
  const [yr,mo] = selMonth.split('-');
  const monthLabel = `${yr} ${mn[parseInt(mo)]}`;

  const modal = document.getElementById('modal-payroll2026-payslip');
  const body  = modal?.querySelector('#payroll2026-payslip-content');
  if (!modal||!body) { alert('Payslip modal not found.'); return; }

  // Earnings Rows
  const earningsRows = r.isContract ? `
    <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;">මූලික වැටුප (Basic Salary)</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.basic)}</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;">පැමිණීමේ දීමනාව (${r.attendedDays} x රු. ${fmt(r.dailyRate)})</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#0f766e;">${fmt(r.attendanceAllo)}</td></tr>
    ${r.allow1 ? `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;">දීමනාව 01</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.allow1)}</td></tr>` : ''}
    ${r.allow2 ? `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;">දීමනාව 02</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.allow2)}</td></tr>` : ''}
    ${r.ot ? `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;">අතිකාල දීමනාව (Overtime)</td><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#b45309;">${fmt(r.ot)}</td></tr>` : ''}
  ` : `
    <tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">මූලික වැටුප (Basic Salary)</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.basic)}</td></tr>
    ${r.interim  ? `<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">අන්තර් දීමනාව</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#0f766e;">${fmt(r.interim)}</td></tr>` : ''}
    ${r.allow1   ? `<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">දීමනාව 01</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.allow1)}</td></tr>` : ''}
    ${r.allow2   ? `<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">දීමනාව 02</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.allow2)}</td></tr>` : ''}
    ${r.sec      ? `<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">ලේඛම් දීමනාව</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.sec)}</td></tr>` : ''}
    ${r.incr     ? `<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">වැටුප් වර්ධකය</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.incr)}</td></tr>` : ''}
    ${r.budget   ? `<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">අයවැය දීමනාව</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${fmt(r.budget)}</td></tr>` : ''}
    ${r.ot       ? `<tr><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;">අතිකාල දීමනාව (Overtime)</td><td style="padding:5px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#b45309;">${fmt(r.ot)}</td></tr>` : ''}
  `;

  // Deductions Rows
  const deductRows = r.isContract ? `
    <tr><td style="padding:6px 0;border-bottom:1px solid #fef2f2;color:#dc2626;">සේවක අර්ථසාධක (EPF 8%)</td><td style="padding:6px 0;border-bottom:1px solid #fef2f2;text-align:right;color:#dc2626;font-weight:700;">(${fmt(r.empEpf8)})</td></tr>
  ` : `
    <tr><td style="padding:6px 0;border-bottom:1px solid #fef2f2;color:#dc2626;">සේවක අර්ථසාධක (EPF 8%)</td><td style="padding:6px 0;border-bottom:1px solid #fef2f2;text-align:right;color:#dc2626;font-weight:700;">(${fmt(r.empEpf8)})</td></tr>
    <tr><td style="padding:6px 0;border-bottom:1px solid #fef2f2;color:#7c3aed;">සේවක විශ්‍රාම වැටුප් (Pension 6%)</td><td style="padding:6px 0;border-bottom:1px solid #fef2f2;text-align:right;color:#7c3aed;font-weight:700;">(${fmt(r.empPension6)})</td></tr>
  `;

  // Employer Contributions Section (As requested by user: "ayathanen etf epf wishrama wetup wage ayathen dana ewath penwanna ona")
  const employerStatutoryTotal = r.empEpf12 + (r.empPension3 || 0) + (r.etf3 || 0);
  const totalCostToSociety = r.gross + employerStatutoryTotal;

  const employerRows = r.isContract ? `
    <tr><td style="padding:5px 0;border-bottom:1px solid #eff6ff;color:#166534;"><i class="fa-solid fa-check" style="font-size:10px;margin-right:4px;"></i> ආයතනික අර්ථසාධක (EPF 12%)</td><td style="padding:5px 0;border-bottom:1px solid #eff6ff;text-align:right;font-weight:800;color:#166534;">රු. ${fmt(r.empEpf12)}</td></tr>
    <tr><td style="padding:5px 0;border-bottom:1px solid #eff6ff;color:#0284c7;"><i class="fa-solid fa-check" style="font-size:10px;margin-right:4px;"></i> ආයතනික සේවක භාරකාර (ETF 3%)</td><td style="padding:5px 0;border-bottom:1px solid #eff6ff;text-align:right;font-weight:800;color:#0284c7;">රු. ${fmt(r.etf3)}</td></tr>
    <tr><td style="padding:5px 0;color:#64748b;">විශ්‍රාම වැටුප් (Pension)</td><td style="padding:5px 0;text-align:right;color:#94a3b8;">අදාළ නොවේ</td></tr>
  ` : `
    <tr><td style="padding:5px 0;border-bottom:1px solid #eff6ff;color:#166534;"><i class="fa-solid fa-check" style="font-size:10px;margin-right:4px;"></i> ආයතනික අර්ථසාධක (EPF 12%)</td><td style="padding:5px 0;border-bottom:1px solid #eff6ff;text-align:right;font-weight:800;color:#166534;">රු. ${fmt(r.empEpf12)}</td></tr>
    <tr><td style="padding:5px 0;border-bottom:1px solid #eff6ff;color:#d97706;"><i class="fa-solid fa-check" style="font-size:10px;margin-right:4px;"></i> ආයතනික විශ්‍රාම වැටුප් (Pension 3%)</td><td style="padding:5px 0;border-bottom:1px solid #eff6ff;text-align:right;font-weight:800;color:#d97706;">රු. ${fmt(r.empPension3)}</td></tr>
    <tr><td style="padding:5px 0;color:#64748b;">සේවක භාරකාර (ETF)</td><td style="padding:5px 0;text-align:right;color:#94a3b8;">අදාළ නොවේ (විශ්‍රාම සහිතයි)</td></tr>
  `;

  body.innerHTML = `
  <div style="text-align:right;margin-bottom:10px;">
    <button onclick="printPayroll2026SinglePayslip()" style="background:#2563eb;color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,0.25);">
      <i class="fa-solid fa-print"></i> මෙම Pay Sheet එක Print කරන්න
    </button>
  </div>

  <div id="p26payslip-printable" style="font-family:'Noto Sans Sinhala',sans-serif;max-width:700px;margin:0 auto;border:2px solid #1e1b4b;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
    <!-- Society Official Header -->
    <div style="background:linear-gradient(135deg,#1e1b4b,#312e81);color:#fff;padding:18px 24px;text-align:center;">
      <div style="font-size:18px;font-weight:800;letter-spacing:0.3px;margin-bottom:3px;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</div>
      <div style="font-size:12px;opacity:0.9;">ලියාපදිංචි අංකය: කුලි/395 | ගලපිටියාගම, කුරුණෑගල</div>
      <div style="display:inline-block;background:#ffffff20;padding:4px 16px;border-radius:20px;font-size:12.5px;font-weight:700;margin-top:8px;border:1px solid #ffffff40;">
        2026 මාසික වැටුප් පත්‍රිකාව (Official Pay Sheet) — ${monthLabel}
      </div>
    </div>

    <!-- Employee Information Bar -->
    <div style="padding:14px 20px;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid #e2e8f0;flex-wrap:wrap;gap:10px;">
      <div>
        <div style="font-size:15px;font-weight:800;color:#0f172a;">${emp.fullName||emp.callingName}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">
          තනතුර: <strong style="color:#1e1b4b;">${emp.designation||'නිලධාරී'}</strong> &nbsp;|&nbsp; සේවා අංකය: <strong style="color:#2563eb;">${emp.id}</strong>
        </div>
      </div>
      <div style="text-align:right;">
        <span style="display:inline-block;font-size:11.5px;font-weight:800;color:${r.isContract?'#92400e':'#166534'};background:${r.isContract?'#fef3c7':'#dcfce7'};padding:3px 12px;border-radius:999px;border:1px solid ${r.isContract?'#fde68a':'#86efac'};">
          ${r.isContract?'කොන්ත්‍රාත් සේවක (Contract)':'ස්ථිර සේවක (Permanent)'}
        </span>
        <div style="font-size:11px;color:#64748b;margin-top:4px;">ගෙවීම් දිනය: <strong>${saved?.date || `සෑම මසකම ${r.payDate} වන දින`}</strong></div>
      </div>
    </div>

    <!-- Earnings & Deductions 2-Column Grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">
      <!-- Left: Earnings -->
      <div style="padding:16px 20px;border-right:1px solid #e2e8f0;">
        <div style="font-size:12.5px;font-weight:800;color:#15803d;margin-bottom:10px;padding-bottom:4px;border-bottom:2px solid #86efac;display:flex;justify-content:space-between;">
          <span><i class="fa-solid fa-money-bill-wave"></i> වැටුප් හා දීමනා (Earnings):</span>
          <span>රු.</span>
        </div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          ${earningsRows}
        </table>
        <div style="border-top:2px solid #1e1b4b;margin-top:12px;padding-top:8px;display:flex;justify-content:space-between;font-weight:800;font-size:13px;color:#1e1b4b;">
          <span>මුළු ඉපැයීම් එකතුව (Gross):</span>
          <span style="color:#4338ca;">රු. ${fmt(r.gross)}</span>
        </div>
      </div>

      <!-- Right: Deductions -->
      <div style="padding:16px 20px;background:#fffcfc;">
        <div style="font-size:12.5px;font-weight:800;color:#dc2626;margin-bottom:10px;padding-bottom:4px;border-bottom:2px solid #fecaca;display:flex;justify-content:space-between;">
          <span><i class="fa-solid fa-circle-minus"></i> සේවක අඩු කිරීම් (Deductions):</span>
          <span>රු.</span>
        </div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          ${deductRows}
        </table>
        <div style="border-top:2px solid #dc2626;margin-top:12px;padding-top:8px;display:flex;justify-content:space-between;font-weight:800;font-size:13px;color:#dc2626;">
          <span>මුළු අඩු කිරීම් එකතුව:</span>
          <span>(රු. ${fmt(r.totalDeductions)})</span>
        </div>

        <!-- Net Salary Display -->
        <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:10px;padding:10px 14px;margin-top:14px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11px;font-weight:700;color:#047857;">සේවකයා වෙත ගෙවන ශුද්ධ මුදල:</div>
            <div style="font-size:13px;font-weight:800;color:#065f46;">ශුද්ධ වැටුප (Net Pay)</div>
          </div>
          <div style="font-size:19px;font-weight:900;color:#065f46;">
            රු. ${fmt(r.netSalary)}
          </div>
        </div>
      </div>
    </div>

    <!-- Employer Statutory Contributions Section (Highlighted) -->
    <div style="background:#f0f9ff;border-top:2px solid #bae6fd;padding:14px 20px;">
      <div style="font-size:12.5px;font-weight:800;color:#0369a1;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <span><i class="fa-solid fa-building-columns"></i> ආයතනයෙන් දරන ව්‍යවස්ථාපිත දායකත්ව (Employer Contributions):</span>
        <span style="font-size:11px;font-weight:600;color:#64748b;">(සේවක වැටුපෙන් අඩු නොවේ)</span>
      </div>
      <table style="width:100%;font-size:12px;border-collapse:collapse;">
        ${employerRows}
      </table>
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid #7dd3fc;margin-top:8px;padding-top:6px;font-weight:800;font-size:12.5px;">
        <span style="color:#0369a1;">ආයතනික දායකත්ව එකතුව:</span>
        <span style="color:#0369a1;">රු. ${fmt(employerStatutoryTotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:11.5px;color:#475569;">
        <span>සේවකයා වෙනුවෙන් ආයතනයේ මුළු පිරිවැය (Total Employer Cost = Gross + Contributions):</span>
        <strong style="color:#1e3a8a;font-size:12.5px;">රු. ${fmt(totalCostToSociety)}</strong>
      </div>
    </div>

    <!-- Official Signatures Footer -->
    <div style="padding:22px 24px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;text-align:center;font-size:11px;color:#64748b;">
      <div>
        <div style="border-bottom:1px dashed #94a3b8;height:26px;margin-bottom:6px;"></div>
        <strong>සේවක අත්සන</strong><br>(Employee Signature)
      </div>
      <div>
        <div style="border-bottom:1px dashed #94a3b8;height:26px;margin-bottom:6px;"></div>
        <strong>සකස් කළේ</strong><br>(Prepared By)
      </div>
      <div>
        <div style="border-bottom:1px dashed #94a3b8;height:26px;margin-bottom:6px;"></div>
        <strong>කළමනාකරු</strong><br>(Manager)
      </div>
    </div>
  </div>`;

  modal.classList.add('active');
}

function printPayroll2026SinglePayslip() {
  const content = document.getElementById('p26payslip-printable')?.outerHTML;
  if (!content) { alert('Pay sheet content not found.'); return; }
  const w = window.open('','_blank','width=850,height=900');
  w.document.write(`<!DOCTYPE html><html><head><title>GSCS Pay Sheet</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
      /* ===== SCREEN VIEW ===== */
      body { font-family:'Noto Sans Sinhala',sans-serif; margin:0; padding:20px; background:#fff; color:#000; }

      /* ===== PRINT: B&W A4 ===== */
      @media print {
        @page { size: A4 portrait; margin: 12mm 14mm; }
        body { padding:0; margin:0; color:#000 !important; background:#fff !important; font-size:11px; }

        /* Remove all colors — force black on white */
        * {
          color:#000 !important;
          background:#fff !important;
          background-color:#fff !important;
          background-image:none !important;
          border-color:#000 !important;
          box-shadow:none !important;
          -webkit-print-color-adjust:exact;
          print-color-adjust:exact;
        }

        /* Header: keep border, make bg white with black text */
        [style*="linear-gradient"] {
          background:#fff !important;
          border:2px solid #000 !important;
          color:#000 !important;
        }

        /* Dashed sign lines keep visible */
        [style*="dashed"] {
          border-bottom:1px dashed #000 !important;
        }

        /* Table borders */
        table { border-collapse:collapse !important; }
        td, th { border:1px solid #000 !important; }

        /* Net pay box — bordered instead of colored */
        [style*="ecfdf5"], [style*="f0f9ff"], [style*="f8fafc"] {
          background:#fff !important;
          border:1px solid #000 !important;
        }

        button, .no-print { display:none !important; }
      }
    </style>
  </head><body>
    ${content}
  </body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// =========================================================================
// 2026 PAYROLL REPORTING SYSTEM (MONTHLY & ANNUAL)
// =========================================================================

function getPayroll2026MonthData(selMonth) {
  const emps = appData.employees || [];
  let totalBasic = 0, totalInterimOrAtt = 0, totalOtherAllow = 0, totalOt = 0, totalGross = 0;
  let totalEmpEpf8 = 0, totalEmpPension6 = 0, totalDeductions = 0, totalNet = 0;
  let totalEmployerEpf12 = 0, totalEmployerPension3 = 0, totalEmployerEtf3 = 0, totalEmployerStatutory = 0, totalCost = 0;

  const normEmpId = (id) => /^Y14806\s*-\s*0?3$/i.test(String(id || '').trim()) ? 'Y14806 - 03' : String(id || '').trim();
  const records = emps.map(emp => {
    const cfg = getEmpSalaryConfig2026(emp.id, selMonth);
    const saved = (appData.payroll2026History || []).find(r => normEmpId(r.empId) === normEmpId(emp.id) && r.month === selMonth);
    const overrides = saved ? { ot: saved.ot || 0, attendedDays: saved.attendedDays || 0 } : {};
    const calculated = calculatePayroll2026ForEmp(emp, cfg, overrides);
    const r = (saved && saved.basic !== undefined && saved.netSalary !== undefined)
      ? { ...calculated, ...saved }
      : calculated;

    const interimOrAtt = r.isContract ? (r.attendanceAllo || 0) : (r.interim || 0);
    const otherAllow = Math.max(0, (r.gross || 0) - (r.basic || 0) - interimOrAtt - (r.ot || 0));
    const empStatutory = (r.empEpf12 || 0) + (r.empPension3 || 0) + (r.etf3 || 0);
    const empTotalCost = (r.gross || 0) + empStatutory;

    totalBasic += (r.basic || 0);
    totalInterimOrAtt += interimOrAtt;
    totalOtherAllow += otherAllow;
    totalOt += (r.ot || 0);
    totalGross += (r.gross || 0);
    totalEmpEpf8 += (r.empEpf8 || 0);
    totalEmpPension6 += (r.empPension6 || 0);
    totalDeductions += (r.totalDeductions || 0);
    totalNet += (r.netSalary || 0);
    totalEmployerEpf12 += (r.empEpf12 || 0);
    totalEmployerPension3 += (r.empPension3 || 0);
    totalEmployerEtf3 += (r.etf3 || 0);
    totalEmployerStatutory += empStatutory;
    totalCost += empTotalCost;

    return {
      emp,
      cfg,
      r,
      interimOrAtt,
      otherAllow,
      empStatutory,
      empTotalCost
    };
  });

  return {
    month: selMonth,
    records,
    totals: {
      basic: totalBasic,
      interimOrAtt: totalInterimOrAtt,
      otherAllow: totalOtherAllow,
      ot: totalOt,
      gross: totalGross,
      empEpf8: totalEmpEpf8,
      empPension6: totalEmpPension6,
      deductions: totalDeductions,
      net: totalNet,
      employerEpf12: totalEmployerEpf12,
      employerPension3: totalEmployerPension3,
      employerEtf3: totalEmployerEtf3,
      employerStatutory: totalEmployerStatutory,
      totalCost: totalCost
    }
  };
}

function openPayroll2026PrintModal(mode = 'monthly') {
  const container = document.getElementById('view-payroll-2026');
  const selMonth = window.currentPayroll2026Month || container?.querySelector('#p26-month-select')?.value || '2026-01';

  let selectedValue = mode;
  if (mode === 'monthly') selectedValue = selMonth;
  if (mode === 'annual') selectedValue = 'annual-both';

  renderPayroll2026PrintContent(selectedValue);
  openSmartModal('modal-smart-sheet-print');
}

function onPayroll2026PrintSelectChange(val) {
  renderPayroll2026PrintContent(val);
}

function renderPayroll2026PrintContent(selectedVal) {
  const titleEl = document.getElementById('sheet-print-title');
  const content = document.getElementById('sheet-print-content');
  if (!content) return;

  const monthNamesSi = ['', 'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
  const monthNamesEn = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const monthCodes = [];
  for (let m = 1; m <= 12; m++) {
    monthCodes.push(`2026-${String(m).padStart(2, '0')}`);
  }

  const isAnnual = String(selectedVal || '').startsWith('annual');
  let currentMonthCode = isAnnual ? (window.currentPayroll2026Month || '2026-01') : selectedVal;
  if (!monthCodes.includes(currentMonthCode)) currentMonthCode = '2026-01';

  const selectorHtml = `
    <div class="no-print" style="margin-bottom:16px; padding:12px 16px; background:#eff6ff; border:1.5px solid #93c5fd; border-radius:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-weight:700; font-size:12.5px; color:#1e40af;">
          <i class="fa-solid fa-file-invoice-dollar" style="color:#2563eb;"></i> වාර්තාව තෝරන්න (Select Report / Month):
        </span>
        <select id="p26-print-report-select" onchange="onPayroll2026PrintSelectChange(this.value)" style="padding:6px 14px; font-size:12.5px; font-weight:700; border-radius:8px; border:1.5px solid #2563eb; color:#1e3a8a; background:#fff; cursor:pointer;">
          <optgroup label="-- 2026 මාසික වැටුප් වාර්තා (Monthly Registers) --">
            ${monthCodes.map(code => {
              const mNum = parseInt(code.split('-')[1], 10);
              const label = `2026 ${monthNamesSi[mNum]} (${code})`;
              return `<option value="${code}" ${selectedVal === code ? 'selected' : ''}>${label}</option>`;
            }).join('')}
          </optgroup>
          <optgroup label="-- 2026 වාර්ෂික වැටුප් වාර්තා (Annual Registers) --">
            <option value="annual-both" ${selectedVal === 'annual-both' ? 'selected' : ''}>2026 සම්පූර්ණ වාර්ෂික වාර්තාව (Annual Comprehensive Report)</option>
            <option value="annual-monthly" ${selectedVal === 'annual-monthly' ? 'selected' : ''}>2026 මාසික සාරාංශ වාර්තාව (12-Month Summary Table)</option>
            <option value="annual-employee" ${selectedVal === 'annual-employee' ? 'selected' : ''}>2026 සේවක අනුව වාර්ෂික වාර්තාව (Employee Annual Breakdown)</option>
          </optgroup>
        </select>
      </div>
      <div style="font-size:12px; color:#475569; font-weight:700;">
        <span style="background:#dbeafe; color:#1e40af; padding:4px 10px; border-radius:6px;">
          <i class="fa-solid fa-building-columns"></i> 2026 ස්වයංක්‍රීය වැටුප් පද්ධතිය
        </span>
      </div>
    </div>
  `;

  const gscsHeader = `
    <div style="border:2px solid #000; padding:10px 14px; margin-bottom:14px; text-align:center;">
      <div style="display:flex; align-items:center; justify-content:center; gap:20px;">
        <img src="images/gscs_logo.png" alt="GSCS Logo" style="height:50px;">
        <div>
          <h3 style="font-size:15px; font-weight:800; margin:0 0 2px;">සීමා රහිත ගලපිටියාගම සකසුරුවම් හා ණය ගනුදෙනු පිළිබඳ සමුපකාර සමිතිය</h3>
          <div style="font-size:12px; font-weight:700; letter-spacing:0.5px;">GALAPITIYAGAMA THRIFT & CREDIT CO-OPERATIVE SOCIETY</div>
          <div style="font-size:11px; margin-top:3px;">
            <strong>Reg No: කුලි/395</strong> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Reg Date: 1987/03/24</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  const signaturesFooter = `
    <div style="margin-top:36px; display:flex; justify-content:space-around; font-size:11px; text-align:center; padding-top:10px;">
      <div>
        <div style="border-bottom:1px dotted #000; width:220px; height:28px; margin:0 auto 6px;"></div>
        <strong>සකස් කළේ (HR / Accounts)</strong>
      </div>
      <div>
        <div style="border-bottom:1px dotted #000; width:220px; height:28px; margin:0 auto 6px;"></div>
        <strong>පරීක්ෂා කළේ (General Manager / Chairman)</strong>
      </div>
    </div>
  `;

  if (!isAnnual) {
    const mNum = parseInt(selectedVal.split('-')[1], 10);
    const monthLabelSi = `${selectedVal.split('-')[0]} ${monthNamesSi[mNum]}`;
    const monthLabelEn = `${monthNamesEn[mNum]} ${selectedVal.split('-')[0]}`;

    if (titleEl) {
      titleEl.innerHTML = `<i class="fa-solid fa-print" style="color:#2563eb;"></i> 2026 වර්ෂය – ${monthLabelSi} මාසික නිල වැටුප් හා EPF/ETF ලේඛනය`;
    }

    const monthData = getPayroll2026MonthData(selectedVal);
    const t = monthData.totals;

    const rowsHtml = monthData.records.map((rec, idx) => {
      const e = rec.emp;
      const r = rec.r;
      const typeLabel = r.isContract ? 'කොන්ත්‍රාත් (10)' : 'ස්ථිර (25)';
      const allowBreakdown = [];
      if (r.isContract) {
        if (r.attendanceAllo) allowBreakdown.push(`පැමිණීම: ${fmt(r.attendanceAllo)}`);
        if (r.allow1) allowBreakdown.push(`දීම1: ${fmt(r.allow1)}`);
        if (r.allow2) allowBreakdown.push(`දීම2: ${fmt(r.allow2)}`);
      } else {
        if (r.interim) allowBreakdown.push(`අන්තර්: ${fmt(r.interim)}`);
        if (r.sec) allowBreakdown.push(`ලේඛම්: ${fmt(r.sec)}`);
        if (r.incr) allowBreakdown.push(`වර්ධක: ${fmt(r.incr)}`);
        if (r.budget) allowBreakdown.push(`අයවැය: ${fmt(r.budget)}`);
        if (r.allow1) allowBreakdown.push(`දීම1: ${fmt(r.allow1)}`);
        if (r.allow2) allowBreakdown.push(`දීම2: ${fmt(r.allow2)}`);
      }
      const allowStr = allowBreakdown.length ? allowBreakdown.join(' | ') : '-';
      const employerContribStr = r.isContract
        ? `EPF: ${fmt(r.empEpf12)} | ETF: ${fmt(r.etf3)}`
        : `EPF: ${fmt(r.empEpf12)} | විශ්‍රාම: ${fmt(r.empPension3)}`;

      return `
        <tr>
          <td style="padding:6px 3px;">${idx + 1}</td>
          <td style="padding:6px 5px; text-align:left;">
            <strong>${e.id}</strong><br>
            <span style="font-size:10.5px; font-weight:600;">${e.fullName || e.callingName}</span>
          </td>
          <td style="padding:6px 4px; text-align:left;">
            ${e.designation || '-'}<br>
            <span style="font-size:9px; color:#555;">${typeLabel}</span>
          </td>
          <td style="padding:6px 4px; text-align:right; font-weight:600;">${fmt(r.basic)}</td>
          <td style="padding:6px 4px; text-align:right;">
            <div style="font-weight:700; color:#0f766e;">${fmt(rec.interimOrAtt + rec.otherAllow)}</div>
            <div style="font-size:8.5px; color:#64748b;">${allowStr}</div>
          </td>
          <td style="padding:6px 4px; text-align:right;">${r.ot > 0 ? fmt(r.ot) : '-'}</td>
          <td style="padding:6px 4px; text-align:right; font-weight:800; background:#f8fafc;">${fmt(r.gross)}</td>
          <td style="padding:6px 4px; text-align:right; color:#dc2626;">
            <div>(${fmt(r.totalDeductions)})</div>
            <div style="font-size:8.5px; color:#64748b;">EPF 8%: ${fmt(r.empEpf8)}${r.empPension6 ? ' | විශ්‍රාම: ' + fmt(r.empPension6) : ''}</div>
          </td>
          <td style="padding:6px 4px; text-align:right; font-weight:900; background:#f0fdf4; color:#166534; font-size:11px;">${fmt(r.netSalary)}</td>
          <td style="padding:6px 4px; text-align:right; color:#1e40af;">
            <div style="font-weight:700;">${fmt(rec.empStatutory)}</div>
            <div style="font-size:8.5px; color:#64748b;">${employerContribStr}</div>
          </td>
          <td style="padding:6px 4px; text-align:right; font-weight:800; background:#faf5ff; color:#6b21a8;">${fmt(rec.empTotalCost)}</td>
          <td style="padding:6px 4px; width:65px;"></td>
        </tr>
      `;
    }).join('');

    content.innerHTML = `
      <div style="background:#fff; font-family:'Segoe UI',Arial,sans-serif; color:#000; min-width:1100px;">
        ${selectorHtml}
        ${gscsHeader}

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:12px; font-weight:700;">
          <span>2026 වර්ෂය – ${monthLabelSi} මාසික නිල වැටුප්, EPF/ETF හා ව්‍යවස්ථාපිත දායකත්ව ලේඛනය</span>
          <span style="font-size:11px; color:#475569;">Monthly Payroll & Statutory Register (${monthLabelEn})</span>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center;" border="1" bordercolor="#000">
          <thead>
            <tr style="background:#f2f2f2; font-weight:bold;">
              <th style="padding:6px 3px; width:30px;">#</th>
              <th style="padding:6px 5px; text-align:left; width:170px;">සේවා අංකය සහ නම</th>
              <th style="padding:6px 4px; text-align:left; width:120px;">තනතුර / වර්ගය</th>
              <th style="padding:6px 4px;">මූලික වැටුප</th>
              <th style="padding:6px 4px;">දීමනා එකතුව</th>
              <th style="padding:6px 4px;">අතිකාල</th>
              <th style="padding:6px 4px; background:#e2e8f0;">දළ වැටුප (Gross)</th>
              <th style="padding:6px 4px;">සේවක අඩු කිරීම් (EPF/විශ්‍රාම)</th>
              <th style="padding:6px 4px; background:#dcfce7; color:#14532d; font-size:10.5px;">ශුද්ධ වැටුප (Net Pay)</th>
              <th style="padding:6px 4px;">ආයතනික දායකත්ව (EPF/විශ්‍රාම/ETF)</th>
              <th style="padding:6px 4px; background:#f3e8ff; color:#581c87;">ආයතනික මුළු පිරිවැය</th>
              <th style="padding:6px 4px; width:65px;">අත්සන</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background:#f1f5f9; font-weight:bold; font-size:10px; border-top:2px solid #000;">
              <td colspan="3" style="padding:8px 6px; text-align:right;">මුළු එකතුව (Grand Total):</td>
              <td style="padding:8px 4px; text-align:right;">${fmt(t.basic)}</td>
              <td style="padding:8px 4px; text-align:right;">${fmt(t.interimOrAtt + t.otherAllow)}</td>
              <td style="padding:8px 4px; text-align:right;">${fmt(t.ot)}</td>
              <td style="padding:8px 4px; text-align:right; font-size:11px; font-weight:900; background:#e2e8f0;">${fmt(t.gross)}</td>
              <td style="padding:8px 4px; text-align:right; color:#dc2626;">(${fmt(t.deductions)})</td>
              <td style="padding:8px 4px; text-align:right; font-size:11.5px; font-weight:900; background:#dcfce7; color:#14532d;">${fmt(t.net)}</td>
              <td style="padding:8px 4px; text-align:right; color:#1e40af;">${fmt(t.employerStatutory)}</td>
              <td style="padding:8px 4px; text-align:right; font-size:11px; font-weight:900; background:#f3e8ff; color:#581c87;">${fmt(t.totalCost)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        ${signaturesFooter}
      </div>
    `;
  } else {
    // ---- ANNUAL REPORT ----
    if (titleEl) {
      titleEl.innerHTML = `<i class="fa-solid fa-chart-line" style="color:#7c3aed;"></i> 2026 වර්ෂයේ වාර්ෂික වැටුප් හා EPF/ETF නිල වාර්තාව (Annual Payroll Report - 2026)`;
    }

    const allMonthsData = monthCodes.map(code => getPayroll2026MonthData(code));

    let aBasic = 0, aAllow = 0, aOt = 0, aGross = 0, aEmpEpf8 = 0, aEmpPension6 = 0, aDeductions = 0, aNet = 0;
    let aEmployerEpf12 = 0, aEmployerPension3 = 0, aEmployerEtf3 = 0, aEmployerStatutory = 0, aTotalCost = 0;

    allMonthsData.forEach(md => {
      const t = md.totals;
      aBasic += t.basic;
      aAllow += (t.interimOrAtt + t.otherAllow);
      aOt += t.ot;
      aGross += t.gross;
      aEmpEpf8 += t.empEpf8;
      aEmpPension6 += t.empPension6;
      aDeductions += t.deductions;
      aNet += t.net;
      aEmployerEpf12 += t.employerEpf12;
      aEmployerPension3 += t.employerPension3;
      aEmployerEtf3 += t.employerEtf3;
      aEmployerStatutory += t.employerStatutory;
      aTotalCost += t.totalCost;
    });

    const monthlySummaryRowsHtml = allMonthsData.map((md, idx) => {
      const mNum = idx + 1;
      const mLabel = `2026 ${monthNamesSi[mNum]}`;
      const t = md.totals;
      return `
        <tr>
          <td style="padding:5px 3px;">${mNum}</td>
          <td style="padding:5px 6px; text-align:left; font-weight:700;">${mLabel}</td>
          <td style="padding:5px 4px;">${md.records.length}</td>
          <td style="padding:5px 4px; text-align:right;">${fmt(t.basic)}</td>
          <td style="padding:5px 4px; text-align:right;">${fmt(t.interimOrAtt + t.otherAllow + t.ot)}</td>
          <td style="padding:5px 4px; text-align:right; font-weight:800; background:#f8fafc;">${fmt(t.gross)}</td>
          <td style="padding:5px 4px; text-align:right; color:#dc2626;">(${fmt(t.deductions)})</td>
          <td style="padding:5px 4px; text-align:right; font-weight:900; background:#f0fdf4; color:#166534;">${fmt(t.net)}</td>
          <td style="padding:5px 4px; text-align:right; color:#1e40af;">${fmt(t.employerEpf12)}</td>
          <td style="padding:5px 4px; text-align:right; color:#d97706;">${fmt(t.employerPension3 + t.employerEtf3)}</td>
          <td style="padding:5px 4px; text-align:right; font-weight:800; background:#faf5ff; color:#6b21a8;">${fmt(t.totalCost)}</td>
        </tr>
      `;
    }).join('');

    const emps = appData.employees || [];
    const empAnnualMap = {};
    emps.forEach(e => {
      empAnnualMap[e.id] = {
        emp: e,
        basic: 0,
        allow: 0,
        gross: 0,
        deductions: 0,
        empEpf8: 0,
        empPension6: 0,
        net: 0,
        employerEpf12: 0,
        employerPension3: 0,
        employerEtf3: 0,
        statutory: 0,
        totalCost: 0
      };
    });

    allMonthsData.forEach(md => {
      md.records.forEach(rec => {
        const item = empAnnualMap[rec.emp.id];
        if (item) {
          const r = rec.r;
          item.basic += (r.basic || 0);
          item.allow += ((r.gross || 0) - (r.basic || 0));
          item.gross += (r.gross || 0);
          item.deductions += (r.totalDeductions || 0);
          item.empEpf8 += (r.empEpf8 || 0);
          item.empPension6 += (r.empPension6 || 0);
          item.net += (r.netSalary || 0);
          item.employerEpf12 += (r.empEpf12 || 0);
          item.employerPension3 += (r.empPension3 || 0);
          item.employerEtf3 += (r.etf3 || 0);
          item.statutory += rec.empStatutory;
          item.totalCost += rec.empTotalCost;
        }
      });
    });

    const empAnnualRowsHtml = emps.map((e, idx) => {
      const item = empAnnualMap[e.id] || {};
      const typeLabel = isContractEmp2026(e) ? 'කොන්ත්‍රාත්' : 'ස්ථිර';
      return `
        <tr>
          <td style="padding:5px 3px;">${idx + 1}</td>
          <td style="padding:5px 6px; text-align:left;">
            <strong>${e.id}</strong> - ${e.fullName || e.callingName}
          </td>
          <td style="padding:5px 4px; text-align:left;">
            ${e.designation || '-'}<br>
            <span style="font-size:9px; color:#64748b;">${typeLabel}</span>
          </td>
          <td style="padding:5px 4px; text-align:right;">${fmt(item.basic)}</td>
          <td style="padding:5px 4px; text-align:right;">${fmt(item.allow)}</td>
          <td style="padding:5px 4px; text-align:right; font-weight:800; background:#f8fafc;">${fmt(item.gross)}</td>
          <td style="padding:5px 4px; text-align:right; color:#dc2626;">(${fmt(item.deductions)})</td>
          <td style="padding:5px 4px; text-align:right; font-weight:900; background:#f0fdf4; color:#166534;">${fmt(item.net)}</td>
          <td style="padding:5px 4px; text-align:right; color:#1e40af;">${fmt(item.statutory)}</td>
          <td style="padding:5px 4px; text-align:right; font-weight:800; background:#faf5ff; color:#6b21a8;">${fmt(item.totalCost)}</td>
        </tr>
      `;
    }).join('');

    const showMonthlyTable = (selectedVal === 'annual-both' || selectedVal === 'annual-monthly');
    const showEmployeeTable = (selectedVal === 'annual-both' || selectedVal === 'annual-employee');

    content.innerHTML = `
      <div style="background:#fff; font-family:'Segoe UI',Arial,sans-serif; color:#000; min-width:1100px;">
        ${selectorHtml}
        ${gscsHeader}

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:12px; font-weight:700;">
          <span>2026 වර්ෂයේ පූර්ණ වාර්ෂික වැටුප්, EPF/ETF හා ව්‍යවස්ථාපිත දායකත්ව වාර්තාව</span>
          <span style="font-size:11px; color:#475569;">Annual Payroll & Statutory Contribution Report (2026 Full Year)</span>
        </div>

        ${showMonthlyTable ? `
          <div style="margin-bottom:8px; font-weight:800; font-size:12px; color:#1e1b4b; display:flex; align-items:center; gap:6px;">
            <span><i class="fa-solid fa-calendar-days" style="color:#2563eb; margin-right:6px;"></i>1. 2026 මාසික වැටුප් හා දායකත්ව ප්‍රගති සාරාංශය (Monthly Progression Summary)</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center; margin-bottom:20px;" border="1" bordercolor="#000">
            <thead>
              <tr style="background:#f2f2f2; font-weight:bold;">
                <th style="padding:5px 3px; width:30px;">#</th>
                <th style="padding:5px 6px; text-align:left;">මාසය (Month)</th>
                <th style="padding:5px 4px; width:50px;">කාර්ය මණ්ඩලය</th>
                <th style="padding:5px 4px;">මූලික වැටුප</th>
                <th style="padding:5px 4px;">දීමනා හා අතිකාල</th>
                <th style="padding:5px 4px; background:#e2e8f0;">දළ වැටුප (Gross)</th>
                <th style="padding:5px 4px;">සේවක අඩු කිරීම්</th>
                <th style="padding:5px 4px; background:#dcfce7; color:#14532d;">ශුද්ධ වැටුප (Net Pay)</th>
                <th style="padding:5px 4px;">ආයතනික EPF 12%</th>
                <th style="padding:5px 4px;">විශ්‍රාම 3% / ETF 3%</th>
                <th style="padding:5px 4px; background:#f3e8ff; color:#581c87;">ආයතනික මුළු පිරිවැය</th>
              </tr>
            </thead>
            <tbody>
              ${monthlySummaryRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#f1f5f9; font-weight:bold; font-size:10px; border-top:2px solid #000;">
                <td colspan="3" style="padding:7px 6px; text-align:right;">වාර්ෂික මුළු එකතුව (Annual Total):</td>
                <td style="padding:7px 4px; text-align:right;">${fmt(aBasic)}</td>
                <td style="padding:7px 4px; text-align:right;">${fmt(aAllow + aOt)}</td>
                <td style="padding:7px 4px; text-align:right; font-weight:900; background:#e2e8f0;">${fmt(aGross)}</td>
                <td style="padding:7px 4px; text-align:right; color:#dc2626;">(${fmt(aDeductions)})</td>
                <td style="padding:7px 4px; text-align:right; font-weight:900; background:#dcfce7; color:#14532d;">${fmt(aNet)}</td>
                <td style="padding:7px 4px; text-align:right; color:#1e40af;">${fmt(aEmployerEpf12)}</td>
                <td style="padding:7px 4px; text-align:right; color:#d97706;">${fmt(aEmployerPension3 + aEmployerEtf3)}</td>
                <td style="padding:7px 4px; text-align:right; font-weight:900; background:#f3e8ff; color:#581c87;">${fmt(aTotalCost)}</td>
              </tr>
            </tfoot>
          </table>
        ` : ''}

        ${showEmployeeTable ? `
          <div style="margin-bottom:8px; font-weight:800; font-size:12px; color:#1e1b4b; display:flex; align-items:center; gap:6px;">
            <span><i class="fa-solid fa-users" style="color:#7c3aed; margin-right:6px;"></i>2. 2026 සේවක අනුව වාර්ෂික වැටුප් හා දායකත්ව එකතුව (Employee-wise Annual Breakdown)</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px; text-align:center;" border="1" bordercolor="#000">
            <thead>
              <tr style="background:#f2f2f2; font-weight:bold;">
                <th style="padding:5px 3px; width:30px;">#</th>
                <th style="padding:5px 6px; text-align:left; width:220px;">සේවා අංකය සහ නම</th>
                <th style="padding:5px 4px; text-align:left;">තනතුර / වර්ගය</th>
                <th style="padding:5px 4px;">වාර්ෂික මූලික වැටුප</th>
                <th style="padding:5px 4px;">වාර්ෂික දීමනා</th>
                <th style="padding:5px 4px; background:#e2e8f0;">වාර්ෂික දළ වැටුප</th>
                <th style="padding:5px 4px;">වාර්ෂික අඩුකිරීම්</th>
                <th style="padding:5px 4px; background:#dcfce7; color:#14532d;">වාර්ෂික ශුද්ධ වැටුප</th>
                <th style="padding:5px 4px;">ආයතනික දායකත්ව</th>
                <th style="padding:5px 4px; background:#f3e8ff; color:#581c87;">ආයතනික මුළු පිරිවැය</th>
              </tr>
            </thead>
            <tbody>
              ${empAnnualRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#f1f5f9; font-weight:bold; font-size:10px; border-top:2px solid #000;">
                <td colspan="3" style="padding:7px 6px; text-align:right;">වාර්ෂික මුළු එකතුව (Grand Total):</td>
                <td style="padding:7px 4px; text-align:right;">${fmt(aBasic)}</td>
                <td style="padding:7px 4px; text-align:right;">${fmt(aAllow + aOt)}</td>
                <td style="padding:7px 4px; text-align:right; font-weight:900; background:#e2e8f0;">${fmt(aGross)}</td>
                <td style="padding:7px 4px; text-align:right; color:#dc2626;">(${fmt(aDeductions)})</td>
                <td style="padding:7px 4px; text-align:right; font-weight:900; background:#dcfce7; color:#14532d;">${fmt(aNet)}</td>
                <td style="padding:7px 4px; text-align:right; color:#1e40af;">${fmt(aEmployerStatutory)}</td>
                <td style="padding:7px 4px; text-align:right; font-weight:900; background:#f3e8ff; color:#581c87;">${fmt(aTotalCost)}</td>
              </tr>
            </tfoot>
          </table>
        ` : ''}

        ${signaturesFooter}
      </div>
    `;
  }
}

// ---- Print Register (Full Monthly Pay Sheet) ----
function printPayroll2026Register() {
  openPayroll2026PrintModal('monthly');
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
  const basic = payRec ? payRec.basic : (getEmpSalaryConfig2026(empId, month).basicSalary || emp.basicSalary || 0);
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
    const basic = payRec ? payRec.basic : (getEmpSalaryConfig2026(empId, month).basicSalary || emp.basicSalary || 0);
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
      ? `<span style="color:#15803d; font-weight:700;"><i class="fa-solid fa-circle-check"></i> ගෙවා ඇත</span>`
      : `<span style="color:#dc2626; font-weight:700;"><i class="fa-solid fa-circle-xmark"></i> හිඟ (Pending)</span>`;

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
    const statusText = rec?.status === 'paid' ? '<i class="fa-solid fa-circle-check"></i> ගෙවා ඇත' : '<i class="fa-solid fa-circle-xmark"></i> හිඟ (Pending)';

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

// =========================================================================
// DATA BACKUP & RESTORE MODULE (GOOGLE APPS SCRIPT CLOUD & LOCAL JSON)
// =========================================================================
let pendingRestoreData = null;

function renderBackupRestoreView() {
  if (!appData) return;

  // 1. Update Database Records Counters
  const empEl = document.getElementById('stat-count-employees');
  const payEl = document.getElementById('stat-count-payroll');
  const tskEl = document.getElementById('stat-count-tasks');
  const meetEl = document.getElementById('stat-count-meetings');
  const grvEl = document.getElementById('stat-count-grievances');
  const fbEl = document.getElementById('stat-count-feedbacks');

  if (empEl) empEl.textContent = (appData.employees || []).length;
  if (payEl) payEl.textContent = (appData.payrollHistory || []).length;
  if (tskEl) tskEl.textContent = (appData.tasks || []).length;
  if (meetEl) meetEl.textContent = (appData.meetings || []).length;
  if (grvEl) grvEl.textContent = (appData.grievances || []).length;
  if (fbEl) fbEl.textContent = (appData.memberFeedbacks || []).length;

  // 2. Cloud Configuration Status & Stats
  const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
  const badge = document.getElementById('badge-cloud-config-status');
  if (badge) {
    if (cloudUrl && cloudUrl.trim()) {
      badge.className = 'badge-pill badge-green';
      badge.innerHTML = '<i class="fa-solid fa-cloud-check"></i> Cloud Ready';
    } else {
      badge.className = 'badge-pill badge-red';
      badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> URL එක සකසා නැත';
    }
  }

  const lastBackupTime = localStorage.getItem('sanasa_last_cloud_backup_time') || 'පරීක්ෂා කර නොමැත';
  const totalBackups = localStorage.getItem('sanasa_total_cloud_backups') || '-';

  const lastBkpElem = document.getElementById('display-cloud-last-backup');
  const totBkpElem = document.getElementById('display-cloud-total-backups');
  if (lastBkpElem) lastBkpElem.textContent = lastBackupTime;
  if (totBkpElem) totBkpElem.textContent = totalBackups;
}

// Perform Cloud Backup to Google Apps Script / Google Sheets
async function performCloudBackup() {
  const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
  if (!cloudUrl || !cloudUrl.trim()) {
    alert(currentLang === 'si'
      ? 'කරුණාකර පළමුව Google Cloud සැකසුම් (Cloud Settings) වෙත ගොස් ඔබගේ Google Apps Script Web App URL එක ඇතුළත් කරන්න.'
      : 'Please configure your Google Apps Script Web App URL in Cloud Settings first.');
    openSmartModal('modal-online-settings');
    return;
  }

  const btn = document.getElementById('btn-cloud-backup-action');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Iraasoft Cloud වෙත Backup වෙමින් පවතී...';
    btn.disabled = true;
  }

  try {
    const now = new Date();
    const timestampStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    const backupId = 'BKP-' + now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '-' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const empCount = (appData.employees || []).length;
    const payCount = (appData.payrollHistory || []).length;
    const tskCount = (appData.tasks || []).length;
    const grvCount = (appData.grievances || []).length;
    const fbCount = (appData.memberFeedbacks || []).length;

    const payload = {
      type: 'backup',
      backupId: backupId,
      timestamp: timestampStr,
      note: `Dashboard Backup (සේවකයින්: ${empCount}, වැටුප්: ${payCount}, ගැටළු: ${grvCount})`,
      summary: {
        employeesCount: empCount,
        payrollCount: payCount,
        tasksCount: tskCount,
        meetingsCount: (appData.meetings || []).length,
        grievancesCount: grvCount,
        feedbacksCount: fbCount
      },
      data: appData
    };

    await fetch(cloudUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    localStorage.setItem('sanasa_last_cloud_backup_time', timestampStr);
    const prevCount = parseInt(localStorage.getItem('sanasa_total_cloud_backups') || '0', 10);
    localStorage.setItem('sanasa_total_cloud_backups', String(prevCount + 1));

    renderBackupRestoreView();

    alert(currentLang === 'si'
      ? `✅ Iraasoft Cloud Backup එක සාර්ථකව සුරකින ලදී!\n\nඋපස්ථ අංකය: ${backupId}\nදිනය හා වේලාව: ${timestampStr}\nසේවකයින්: ${empCount}\nවැටුප් වාර්තා: ${payCount}\nගැටළු හා යෝජනා: ${grvCount}`
      : `✅ Iraasoft Cloud Backup successfully created!\n\nBackup ID: ${backupId}\nTime: ${timestampStr}\nEmployees: ${empCount}\nPayroll Records: ${payCount}`);

  } catch (err) {
    console.error('Cloud backup error:', err);
    alert(currentLang === 'si'
      ? 'Iraasoft Cloud Backup කිරීමේදී දෝෂයක් මතු විය: ' + err.message
      : 'Error creating Iraasoft Cloud Backup: ' + err.message);
  } finally {
    if (btn) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
  }
}

// Perform Cloud Restore from Google Apps Script
async function performCloudRestore(backupId) {
  const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
  if (!cloudUrl || !cloudUrl.trim()) {
    alert(currentLang === 'si'
      ? 'කරුණාකර පළමුව Google Apps Script Web App URL එක සකසන්න.'
      : 'Please configure your Google Apps Script URL first.');
    openSmartModal('modal-online-settings');
    return;
  }

  const btn = document.getElementById('btn-cloud-restore-action');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cloud එකෙන් කියවමින් පවතී...';
    btn.disabled = true;
  }

  try {
    const url = cloudUrl + (cloudUrl.includes('?') ? '&' : '?') +
      'action=restore' +
      (backupId ? '&backupId=' + encodeURIComponent(backupId) : '') +
      '&t=' + Date.now();

    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP error ' + res.status);

    const result = await res.json();
    if (result.status === 'success' && result.data) {
      pendingRestoreData = result.data;
      closeSmartModal('modal-cloud-backups-list');

      const sourceLabel = 'Google Sheet Cloud Backup ' + (result.backupId ? '(' + result.backupId + ')' : '(නවතම)');
      const timeLabel = result.timestamp || 'මෑතකදී';

      showRestorePreviewModal(sourceLabel, timeLabel, result.data);
    } else {
      alert(currentLang === 'si'
        ? 'Google Sheet එකෙන් Restore කිරීමට උපස්ථ දත්ත සොයාගත නොහැකි විය: ' + (result.message || 'හිස් දත්ත')
        : 'Could not find backup data in Google Sheets: ' + (result.message || 'No data'));
    }

  } catch (err) {
    console.error('Cloud restore fetch error:', err);
    alert(currentLang === 'si'
      ? 'Google Sheet එකෙන් දත්ත කියවීමේදී දෝෂයක් මතු විය: ' + err.message
      : 'Error reading cloud backup: ' + err.message);
  } finally {
    if (btn) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
  }
}

// Open Cloud Backups History Modal & Load List
function openCloudBackupsHistoryModal() {
  openSmartModal('modal-cloud-backups-list');
  loadCloudBackupsHistory();
}

async function loadCloudBackupsHistory() {
  const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
  const tbody = document.getElementById('table-cloud-backups-body');
  const iconRefresh = document.getElementById('icon-refresh-cloud-backups');

  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Google Sheet එකෙන් උපස්ථ ලැයිස්තුව කියවමින් පවතී...</td></tr>`;

  if (!cloudUrl || !cloudUrl.trim()) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Google Apps Script Web App URL එක සකසා නැත.</td></tr>`;
    return;
  }

  if (iconRefresh) iconRefresh.classList.add('fa-spin');

  try {
    const url = cloudUrl + (cloudUrl.includes('?') ? '&' : '?') + 'action=list_backups&t=' + Date.now();
    const res = await fetch(url);
    const result = await res.json();

    if (result.status === 'success' && Array.isArray(result.backups) && result.backups.length > 0) {
      localStorage.setItem('sanasa_total_cloud_backups', String(result.backups.length));
      localStorage.setItem('sanasa_last_cloud_backup_time', result.backups[0].timestamp || '');
      renderBackupRestoreView();

      tbody.innerHTML = result.backups.map(b => `
        <tr>
          <td style="font-weight:700; color:#1e1b4b; font-size:12px;">${escapeHtml(b.timestamp || '')}</td>
          <td style="font-family:monospace; font-size:11px; color:#6d28d9;">${escapeHtml(b.backupId || '')}</td>
          <td style="text-align:center;"><span class="badge-pill badge-green">${b.employeesCount || 0}</span></td>
          <td style="text-align:center;"><span class="badge-pill badge-purple">${b.payrollCount || 0}</span></td>
          <td style="text-align:center;"><span class="badge-pill badge-blue">${b.tasksCount || 0}</span></td>
          <td style="text-align:center;"><span class="badge-pill badge-orange">${b.grievancesCount || 0}</span></td>
          <td>
            <button type="button" class="btn-smart btn-smart-primary" style="font-size:11px; padding:4px 10px; background:#d97706;" onclick="performCloudRestore('${escapeHtml(b.backupId)}')">
              <i class="fa-solid fa-rotate-left"></i> Restore
            </button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b;"><i class="fa-solid fa-inbox"></i> Google Sheet එකෙහි මෙතෙක් උපස්ථ (Backups) කිසිවක් හමු නොවීය. ඉහත "Google Sheet වෙත දැන් Backup කරන්න" ඔබා නව උපස්ථයක් සාදන්න.</td></tr>`;
    }
  } catch (err) {
    console.warn('Failed to load cloud backup list:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#ef4444;"><i class="fa-solid fa-triangle-exclamation"></i> Google Sheet වෙතින් උපස්ථ ලැයිස්තුව ලබා ගැනීමේදී දෝෂයක් මතු විය: ${escapeHtml(err.message)}</td></tr>`;
  } finally {
    if (iconRefresh) iconRefresh.classList.remove('fa-spin');
  }
}

// Show Modal with Restore Preview
function showRestorePreviewModal(sourceText, timeText, data) {
  const srcEl = document.getElementById('restore-preview-source');
  const timeEl = document.getElementById('restore-preview-time');
  const empEl = document.getElementById('restore-preview-emp');
  const payEl = document.getElementById('restore-preview-pay');
  const tskEl = document.getElementById('restore-preview-tasks');
  const meetEl = document.getElementById('restore-preview-meetings');
  const grvEl = document.getElementById('restore-preview-grv');
  const fbEl = document.getElementById('restore-preview-fb');

  if (srcEl) srcEl.textContent = sourceText;
  if (timeEl) timeEl.textContent = timeText;
  if (empEl) empEl.textContent = (data.employees || []).length;
  if (payEl) payEl.textContent = (data.payrollHistory || []).length;
  if (tskEl) tskEl.textContent = (data.tasks || []).length;
  if (meetEl) meetEl.textContent = (data.meetings || []).length;
  if (grvEl) grvEl.textContent = (data.grievances || []).length;
  if (fbEl) fbEl.textContent = (data.memberFeedbacks || []).length;

  openSmartModal('modal-restore-preview');
}

// Execute Confirmed Restore Action
async function executeConfirmedRestore() {
  if (!pendingRestoreData) {
    alert('ප්‍රතිසාධනය සඳහා දත්ත නොමැත (No pending restore data).');
    closeSmartModal('modal-restore-preview');
    return;
  }

  try {
    appData = JSON.parse(JSON.stringify(pendingRestoreData));

    // Ensure all required collections exist
    if (!appData.employees) appData.employees = [];
    if (!appData.tasks) appData.tasks = [];
    if (!appData.meetings) appData.meetings = [];
    if (!appData.users) appData.users = [];
    if (!appData.grievances) appData.grievances = [];
    if (!appData.memberFeedbacks) appData.memberFeedbacks = [];
    if (!appData.appraisals) appData.appraisals = [];
    if (!appData.surveys) appData.surveys = [];
    if (!appData.payrollHistory) appData.payrollHistory = [];
    if (!appData.incentiveRecords) appData.incentiveRecords = [];
    if (!appData.epfRemittances) appData.epfRemittances = [];

    await persistData();

    closeSmartModal('modal-restore-preview');
    pendingRestoreData = null;

    // Refresh all portals & views
    if (typeof renderDashboardStats === 'function') renderDashboardStats();
    if (typeof renderEmployees === 'function') renderEmployees();
    if (typeof renderProjectsView === 'function') renderProjectsView();
    if (typeof renderMeetingsView === 'function') renderMeetingsView();
    if (typeof renderGrievancePortal === 'function') renderGrievancePortal();
    if (typeof renderMemberFeedbackPortal === 'function') renderMemberFeedbackPortal();
    if (typeof renderPayroll === 'function') renderPayroll();
    if (typeof renderAdminPanel === 'function') renderAdminPanel();
    renderBackupRestoreView();

    alert(currentLang === 'si'
      ? '🎉 පද්ධති දත්ත සාර්ථකව ප්‍රතිසාධනය (Restore) කරන ලදී!\nසියලුම සේවක, වැටුප් හා QR තොරතුරු යාවත්කාලීන විය.'
      : '🎉 System data was successfully restored!');

  } catch (err) {
    console.error('Error executing restore:', err);
    alert('Restore කිරීමේදී දෝෂයක් මතු විය: ' + err.message);
  }
}

// Download Local JSON Backup
function downloadLocalBackup() {
  if (!appData) return;

  const now = new Date();
  const dateStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');

  const fileName = `Sanasa_HRMS_Backup_${dateStr}.json`;
  const jsonContent = JSON.stringify(appData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Handle Local Backup File Selected from File Input
function handleLocalBackupFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || (typeof parsed !== 'object') || (!parsed.organization && !parsed.employees)) {
        throw new Error('මෙම ගොනුව නිවැරදි HRMS Backup ගොනුවක් නොවේ.');
      }

      pendingRestoreData = parsed;
      const fileDate = file.lastModified ? new Date(file.lastModified).toLocaleString() : 'නොදනී';
      showRestorePreviewModal('පරිගණක ගොනුව: ' + file.name, fileDate, parsed);

    } catch (err) {
      alert('Backup ගොනුව කියවීමේ දෝෂයකි: ' + err.message);
    } finally {
      event.target.value = ''; // Reset input
    }
  };
  reader.readAsText(file);
}

// Create Local Server Snapshot via C# API
async function createLocalServerSnapshot() {
  try {
    const res = await fetch('/api/backup/create', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      alert(currentLang === 'si'
        ? `✅ පරිගණක සේවාදායකයේ Snapshot පිටපතක් සාර්ථකව සුරකින ලදී!\nගොනු නාමය: ${data.fileName}\nවේලාව: ${data.timestamp}`
        : `✅ Local server snapshot created: ${data.fileName}`);
    } else {
      // Server API unreachable -> offer direct JSON download
      downloadLocalBackup();
    }
  } catch (e) {
    downloadLocalBackup();
  }
}

// Prompt Factory Reset
async function promptResetSystemData() {
  const conf1 = confirm(currentLang === 'si'
    ? '⚠️ අනතුරුදායකයි!\n\nඔබගේ සියලුම වත්මන් සේවක, වැටුප්, QR ගැටළු හා සාමාජික ප්‍රතිචාර ඇතුළු සියලු දත්ත ඉවත් කර පද්ධතිය මුල් ආදර්ශන තත්වයට (Factory Seed Defaults) පත් කිරීමට අවශ්‍ය බව තහවුරු කරන්නද?'
    : '⚠️ Danger Zone!\n\nAre you sure you want to reset ALL data (including grievances & feedbacks) to default state?');

  if (!conf1) return;

  const conf2 = confirm(currentLang === 'si'
    ? 'මෙමගින් ඔබගේ සියලු QR ගැටළු, සාමාජික ප්‍රතිචාර සහ සේවක දත්ත ස්ථිරවම ඉවත් වේ.\n\nඉදිරියට යාමට සම්පූර්ණයෙන්ම විශ්වාසද?'
    : 'This will permanently delete ALL grievances, feedbacks and staff data. Are you sure?');

  if (!conf2) return;

  // Clear deleted-ID and backup tracking
  localStorage.removeItem('sanasa_deleted_grv_ids');
  localStorage.removeItem('sanasa_deleted_fb_ids');
  localStorage.removeItem('sanasa_deleted_surv_ids');
  localStorage.removeItem('sanasa_last_cloud_backup_time');
  localStorage.removeItem('sanasa_total_cloud_backups');
  // Mark current time as the clear timestamp so cloud sync skips old QR entries
  localStorage.setItem('sanasa_qr_cleared_time', String(Date.now()));

  // Completely clean all collections
  appData = {
    organization: JSON.parse(JSON.stringify(defaultSeedData.organization)),
    employees: [],
    grievances: [],
    memberFeedbacks: [],
    tasks: [],
    meetings: [],
    appraisals: [],
    surveys: [],
    payrollHistory: [],
    incentiveRecords: [],
    epfRemittances: [],
    users: JSON.parse(JSON.stringify(defaultSeedData.users))
  };

  await persistData();

  // Silently try to notify Google Sheets to clear QR data too
  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'clear_qr_data' })
      });
    }
  } catch (e) { /* non-fatal */ }

  alert(currentLang === 'si'
    ? '✅ පද්ධතිය සාර්ථකව පෙරනිමි තත්වයට පත් කරන ලදී.\nසේවක ගැටළු, සාමාජික ප්‍රතිචාර සහ සේවක දත්ත ඉවත් කරන ලදී.'
    : '✅ System has been factory reset. All grievances, feedbacks and staff data cleared.');
  window.location.reload();
}

// Clear ALL Grievances (from local + cloud)
async function clearAllGrievances() {
  if (!appData.grievances || appData.grievances.length === 0) {
    alert(currentLang === 'si' ? 'ඉවත් කිරීමට ගැටළු / යෝජනා කිසිවක් නැත.' : 'No grievances to clear.');
    return;
  }
  const conf = confirm(currentLang === 'si'
    ? `⚠️ ලැයිස්තුවේ ඇති සියලු ගැටළු / යෝජනා ${appData.grievances.length}ක් ස්ථිරවම ඉවත් කිරීමට අවශ්‍යද?`
    : `Delete all ${appData.grievances.length} grievances permanently?`);
  if (!conf) return;

  // Track all deleted IDs to suppress future cloud sync
  const allIds = appData.grievances.map(g => g.id);
  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_grv_ids') || '[]');
  localStorage.setItem('sanasa_deleted_grv_ids', JSON.stringify([...new Set([...prev, ...allIds])]));
  localStorage.setItem('sanasa_qr_cleared_time', String(Date.now()));
  localStorage.setItem('sanasa_grv_all_cleared', 'true');

  appData.grievances = [];
  await persistData();

  // Silently notify cloud
  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'clear_qr_data' })
      });
    }
  } catch(e) {}

  renderGrievancePortal();
  renderDashboardStats();
  alert(currentLang === 'si'
    ? '✅ සේවක ගැටළු / යෝජනා ලැයිස්තුව සාර්ථකව ඉවත් කරන ලදී!'
    : '✅ All grievances cleared successfully!');
}

// Clear ALL Member Feedbacks
async function clearAllMemberFeedbacks() {
  if (!appData.memberFeedbacks || appData.memberFeedbacks.length === 0) {
    alert(currentLang === 'si' ? 'ඉවත් කිරීමට සාමාජික ප්‍රතිචාර කිසිවක් නැත.' : 'No feedbacks to clear.');
    return;
  }
  const conf = confirm(currentLang === 'si'
    ? `⚠️ ලැයිස්තුවේ ඇති සියලු සාමාජික ප්‍රතිචාර ${appData.memberFeedbacks.length}ක් ස්ථිරවම ඉවත් කිරීමට අවශ්‍යද?`
    : `Delete all ${appData.memberFeedbacks.length} member feedbacks permanently?`);
  if (!conf) return;

  const allIds = appData.memberFeedbacks.map(f => f.id);
  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_fb_ids') || '[]');
  localStorage.setItem('sanasa_deleted_fb_ids', JSON.stringify([...new Set([...prev, ...allIds])]));
  localStorage.setItem('sanasa_qr_cleared_time', String(Date.now()));

  appData.memberFeedbacks = [];
  await persistData();

  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'clear_qr_data' })
      });
    }
  } catch(e) {}

  renderMemberFeedbackPortal();
  renderDashboardStats();
  alert(currentLang === 'si'
    ? '✅ සාමාජික ප්‍රතිචාර ලැයිස්තුව සාර්ථකව ඉවත් කරන ලදී!'
    : '✅ All member feedbacks cleared successfully!');
}

// Delete Single Grievance from review modal
async function handleDeleteCurrentGrievance() {
  const id = document.getElementById('review-grv-id')?.value;
  if (!id) return;

  const conf = confirm(currentLang === 'si'
    ? `"${id}" - මෙම ගැටළු/යෝජනා සටහන ස්ථිරවම ඉවත් කිරීමට අවශ්‍යද?`
    : `Permanently delete grievance "${id}"?`);
  if (!conf) return;

  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_grv_ids') || '[]');
  localStorage.setItem('sanasa_deleted_grv_ids', JSON.stringify([...new Set([...prev, id])]));

  appData.grievances = (appData.grievances || []).filter(g => g.id !== id);
  await persistData();
  closeSmartModal('modal-smart-grievance-review');
  renderGrievancePortal();
  renderDashboardStats();

  // Silently delete from cloud
  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'delete_grievance', id: id })
      });
    }
  } catch(e) {}

  alert(currentLang === 'si' ? '✅ ගැටළු/යෝජනා සටහන ඉවත් කරන ලදී.' : '✅ Grievance deleted.');
}

// Delete Single Member Feedback from review modal
async function handleDeleteCurrentMemberFeedback() {
  const id = document.getElementById('review-fb-id')?.value;
  if (!id) return;

  const conf = confirm(currentLang === 'si'
    ? `"${id}" - මෙම සාමාජික ප්‍රතිචාරය ස්ථිරවම ඉවත් කිරීමට අවශ්‍යද?`
    : `Permanently delete feedback "${id}"?`);
  if (!conf) return;

  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_fb_ids') || '[]');
  localStorage.setItem('sanasa_deleted_fb_ids', JSON.stringify([...new Set([...prev, id])]));

  appData.memberFeedbacks = (appData.memberFeedbacks || []).filter(f => f.id !== id);
  await persistData();
  closeSmartModal('modal-smart-member-feedback-review');
  renderMemberFeedbackPortal();
  renderDashboardStats();

  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'delete_member_feedback', id: id })
      });
    }
  } catch(e) {}

  alert(currentLang === 'si' ? '✅ සාමාජික ප්‍රතිචාරය ඉවත් කරන ලදී.' : '✅ Member feedback deleted.');
}

// =========================================================================
// PER-ROW EDIT & DELETE — GRIEVANCES
// =========================================================================

function openEditGrievanceModal(id) {
  const g = appData.grievances.find(item => item.id === id);
  if (!g) return;

  document.getElementById('edit-grv-id').value = g.id;
  document.getElementById('edit-grv-employeeName').value = g.isAnonymous ? '' : (g.employeeName || '');
  document.getElementById('edit-grv-isAnonymous').checked = !!g.isAnonymous;
  document.getElementById('edit-grv-department').value = g.department || '';
  document.getElementById('edit-grv-targetRecipient').value = g.targetRecipient || '';
  document.getElementById('edit-grv-category').value = g.category || '';
  document.getElementById('edit-grv-title').value = g.title || '';
  document.getElementById('edit-grv-description').value = g.description || '';
  document.getElementById('edit-grv-status').value = g.status || 'නව (New)';
  document.getElementById('edit-grv-timestamp').value = toIsoDateTimeLocal(g.timestamp);
  document.getElementById('edit-grv-modal-label').textContent = `${g.id}: ${g.title}`;

  openSmartModal('modal-edit-grievance');
}

async function saveEditGrievanceForm(e) {
  e.preventDefault();
  const id = document.getElementById('edit-grv-id').value;
  const g = appData.grievances.find(x => x.id === id);
  if (!g) return;

  const isAnon = document.getElementById('edit-grv-isAnonymous').checked;
  g.isAnonymous = isAnon;
  g.employeeName = isAnon ? 'නිර්නාමික (Anonymous)' : document.getElementById('edit-grv-employeeName').value;
  g.department = document.getElementById('edit-grv-department').value;
  g.targetRecipient = document.getElementById('edit-grv-targetRecipient').value;
  g.category = document.getElementById('edit-grv-category').value;
  g.title = document.getElementById('edit-grv-title').value;
  g.description = document.getElementById('edit-grv-description').value;
  g.status = document.getElementById('edit-grv-status').value;
  const tsRaw = document.getElementById('edit-grv-timestamp').value;
  if (tsRaw) g.timestamp = tsRaw.replace('T', ' ');

  await persistData();
  closeSmartModal('modal-edit-grievance');
  renderGrievancePortal();
  renderDashboardStats();
  alert('✅ ගැටළු/යෝජනා සටහන සාර්ථකව සංස්කරණය කරන ලදී. | Grievance updated successfully.');
}

async function deleteSingleGrievance(id) {
  const g = appData.grievances.find(item => item.id === id);
  const label = g ? `"${g.title || id}"` : `"${id}"`;
  const conf = confirm(currentLang === 'si'
    ? `${label} - මෙම ගැටළු/යෝජනා සටහන ස්ථිරවම ඉවත් කිරීමට අවශ්‍යද?`
    : `Permanently delete grievance ${label}?`);
  if (!conf) return;

  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_grv_ids') || '[]');
  localStorage.setItem('sanasa_deleted_grv_ids', JSON.stringify([...new Set([...prev, id])]));

  appData.grievances = (appData.grievances || []).filter(x => x.id !== id);
  await persistData();
  renderGrievancePortal();
  renderDashboardStats();

  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'delete_grievance', id: id })
      });
    }
  } catch(e) {}

  alert(currentLang === 'si' ? '✅ ගැටළු/යෝජනා සටහන ඉවත් කරන ලදී.' : '✅ Grievance deleted.');
}

// =========================================================================
// PER-ROW EDIT & DELETE — MEMBER FEEDBACK
// =========================================================================

function openEditMemberFeedbackModal(id) {
  const f = appData.memberFeedbacks.find(item => item.id === id);
  if (!f) return;

  document.getElementById('edit-fb-id').value = f.id;
  document.getElementById('edit-fb-memberName').value = f.memberName || '';
  document.getElementById('edit-fb-memberNo').value = f.memberNo || '';
  document.getElementById('edit-fb-branch').value = f.branch || '';
  document.getElementById('edit-fb-phone').value = f.phone || '';
  document.getElementById('edit-fb-overallRating').value = f.overallRating || 5;
  document.getElementById('edit-fb-feedbackType').value = f.feedbackType || '';
  document.getElementById('edit-fb-comments').value = f.comments || '';
  document.getElementById('edit-fb-status').value = f.status || 'ලැබුණි (Received)';
  document.getElementById('edit-fb-timestamp').value = toIsoDateTimeLocal(f.timestamp);
  document.getElementById('edit-fb-modal-label').textContent = `${f.id}: ${f.memberName}`;

  openSmartModal('modal-edit-member-feedback');
}

async function saveEditMemberFeedbackForm(e) {
  e.preventDefault();
  const id = document.getElementById('edit-fb-id').value;
  const f = appData.memberFeedbacks.find(x => x.id === id);
  if (!f) return;

  f.memberName = document.getElementById('edit-fb-memberName').value;
  f.memberNo = document.getElementById('edit-fb-memberNo').value;
  f.branch = document.getElementById('edit-fb-branch').value;
  f.phone = document.getElementById('edit-fb-phone').value;
  f.overallRating = parseInt(document.getElementById('edit-fb-overallRating').value, 10) || 5;
  f.feedbackType = document.getElementById('edit-fb-feedbackType').value;
  f.comments = document.getElementById('edit-fb-comments').value;
  f.status = document.getElementById('edit-fb-status').value;
  const tsRaw = document.getElementById('edit-fb-timestamp').value;
  if (tsRaw) f.timestamp = tsRaw.replace('T', ' ');

  await persistData();
  closeSmartModal('modal-edit-member-feedback');
  renderMemberFeedbackPortal();
  renderDashboardStats();
  alert('✅ සාමාජික ප්‍රතිචාරය සාර්ථකව සංස්කරණය කරන ලදී. | Feedback updated successfully.');
}

async function deleteSingleMemberFeedback(id) {
  const f = appData.memberFeedbacks.find(item => item.id === id);
  const label = f ? `"${f.memberName || id}"` : `"${id}"`;
  const conf = confirm(currentLang === 'si'
    ? `${label} - මෙම සාමාජික ප්‍රතිචාරය ස්ථිරවම ඉවත් කිරීමට අවශ්‍යද?`
    : `Permanently delete feedback from ${label}?`);
  if (!conf) return;

  const prev = JSON.parse(localStorage.getItem('sanasa_deleted_fb_ids') || '[]');
  localStorage.setItem('sanasa_deleted_fb_ids', JSON.stringify([...new Set([...prev, id])]));

  appData.memberFeedbacks = (appData.memberFeedbacks || []).filter(x => x.id !== id);
  await persistData();
  renderMemberFeedbackPortal();
  renderDashboardStats();

  try {
    const cloudUrl = typeof getCloudSyncUrl === 'function' ? getCloudSyncUrl() : '';
    if (cloudUrl) {
      fetch(cloudUrl, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'delete_member_feedback', id: id })
      });
    }
  } catch(e) {}

  alert(currentLang === 'si' ? '✅ සාමාජික ප්‍රතිචාරය ඉවත් කරන ලදී.' : '✅ Member feedback deleted.');
}

// Global modal & action registrations
window.renderBackupRestoreView = renderBackupRestoreView;
window.performCloudBackup = performCloudBackup;
window.performCloudRestore = performCloudRestore;
window.openCloudBackupsHistoryModal = openCloudBackupsHistoryModal;
window.loadCloudBackupsHistory = loadCloudBackupsHistory;
window.downloadLocalBackup = downloadLocalBackup;
window.handleLocalBackupFileSelected = handleLocalBackupFileSelected;
window.showRestorePreviewModal = showRestorePreviewModal;
window.executeConfirmedRestore = executeConfirmedRestore;
window.createLocalServerSnapshot = createLocalServerSnapshot;
window.promptResetSystemData = promptResetSystemData;
window.clearAllGrievances = clearAllGrievances;
window.clearAllMemberFeedbacks = clearAllMemberFeedbacks;
window.handleDeleteCurrentGrievance = handleDeleteCurrentGrievance;
window.handleDeleteCurrentMemberFeedback = handleDeleteCurrentMemberFeedback;
window.openEditGrievanceModal = openEditGrievanceModal;
window.saveEditGrievanceForm = saveEditGrievanceForm;
window.deleteSingleGrievance = deleteSingleGrievance;
window.openEditMemberFeedbackModal = openEditMemberFeedbackModal;
window.saveEditMemberFeedbackForm = saveEditMemberFeedbackForm;
window.deleteSingleMemberFeedback = deleteSingleMemberFeedback;
window.formatTimestamp = formatTimestamp;
window.toIsoDateTimeLocal = toIsoDateTimeLocal;
window.openWellbeingWhatsAppModal = openWellbeingWhatsAppModal;
window.copyWellbeingSurveyLink = copyWellbeingSurveyLink;
window.copyWellbeingWhatsAppGroupMessage = copyWellbeingWhatsAppGroupMessage;
window.openWellbeingQRModal = openWellbeingQRModal;
window.openAddManualSurveyModal = openAddManualSurveyModal;
window.saveManualSurveyForm = saveManualSurveyForm;
window.openEditSurveyModal = openEditSurveyModal;
window.saveEditSurveyForm = saveEditSurveyForm;
window.deleteSingleSurvey = deleteSingleSurvey;
window.clearAllSurveys = clearAllSurveys;

// =========================================================================
// ULTRA-MODERN SMART TOAST & NOTIFICATION SYSTEM
// =========================================================================

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getOrCreateToastContainer() {
  let container = document.getElementById('smart-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'smart-toast-container';
    document.body.appendChild(container);
  }
  return container;
}

// Gentle pleasant audio chime using Web Audio API
function playNotificationChime(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // Pleasant dual tone chime for success / info
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch (e) {
    // Autoplay restrictions or unsupported audio
  }
}

function showSmartNotification(rawMessage, forcedType, duration) {
  const container = getOrCreateToastContainer();
  const text = String(rawMessage || '').trim();
  if (!text) return;

  // Determine Notification Type
  let type = forcedType;
  if (!type) {
    if (text.includes('සාර්ථක') || text.includes('success') || text.includes('සුරකින') || text.includes('යාවත්කාලීන') || text.includes('✅') || text.includes('🎉')) {
      type = 'success';
    } else if (text.includes('දෝෂ') || text.includes('error') || text.includes('වැරදි') || text.includes('අවලංගු') || text.includes('අසාර්ථක') || text.includes('කළ නොහැකි') || text.includes('❌')) {
      type = 'error';
    } else if (text.includes('අවධානය') || text.includes('අවවාදය') || text.includes('warning') || text.includes('අනතුරු') || text.includes('⚠️')) {
      type = 'warning';
    } else {
      type = 'info';
    }
  }

  // Titles & Icons based on type
  let title = 'ගලපිටියාගම සණස HRMS';
  let iconHtml = '<i class="fa-solid fa-bell"></i>';

  if (type === 'success') {
    title = 'සාර්ථකයි (Success)';
    iconHtml = '<i class="fa-solid fa-circle-check"></i>';
  } else if (type === 'error') {
    title = 'දෝෂයක් (Error)';
    iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
  } else if (type === 'warning') {
    title = 'අවධානය පිණිසයි (Warning)';
    iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
  } else if (type === 'info') {
    title = 'පද්ධති දැනුම්දීම (Notification)';
    iconHtml = '<i class="fa-solid fa-circle-info"></i>';
  }

  // Calculate auto-dismiss duration
  const autoDuration = duration || Math.min(8500, Math.max(4000, text.length * 60));

  // Build Toast DOM
  const toast = document.createElement('div');
  toast.className = `smart-toast-item toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon-box">${iconHtml}</div>
    <div class="toast-content">
      <div class="toast-title">
        <span>${title}</span>
      </div>
      <div class="toast-message">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
    </div>
    <button type="button" class="toast-close-btn" title="Close / වසන්න">&times;</button>
    <div class="toast-progress-bar">
      <div class="toast-progress-fill" style="animation-duration: ${autoDuration}ms;"></div>
    </div>
  `;

  // Close helper
  let closed = false;
  const dismissToast = () => {
    if (closed) return;
    closed = true;
    toast.classList.add('toast-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  };

  const closeBtn = toast.querySelector('.toast-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast();
    });
  }

  toast.addEventListener('click', () => {
    dismissToast();
  });

  let timer = setTimeout(dismissToast, autoDuration);

  // Pause on hover
  toast.addEventListener('mouseenter', () => {
    const fill = toast.querySelector('.toast-progress-fill');
    if (fill) fill.style.animationPlayState = 'paused';
    clearTimeout(timer);
  });

  toast.addEventListener('mouseleave', () => {
    const fill = toast.querySelector('.toast-progress-fill');
    if (fill) fill.style.animationPlayState = 'running';
    timer = setTimeout(dismissToast, 2000);
  });

  container.appendChild(toast);
  playNotificationChime(type);
}

// Override Native Window Alert to automatically use Smart Notifications!
const nativeAlert = window.alert;
window.alert = function(msg) {
  showSmartNotification(msg);
};

window.showSmartNotification = showSmartNotification;
window.showNotification = showSmartNotification;
window.showToast = showSmartNotification;
window.escapeHtml = escapeHtml;
window.renderDashboardBirthdays = renderDashboardBirthdays;
window.printAnnual2025Report = printAnnual2025Report;
window.switchAnnualReportTab = switchAnnualReportTab;
window.viewEmployeeAnnualStatement = viewEmployeeAnnualStatement;
window.openPayroll2026PrintModal = openPayroll2026PrintModal;
window.onPayroll2026PrintSelectChange = onPayroll2026PrintSelectChange;
window.renderPayroll2026PrintContent = renderPayroll2026PrintContent;
window.getPayroll2026MonthData = getPayroll2026MonthData;


