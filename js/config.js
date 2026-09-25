/**
 * =========================================================================
 * ගලපිටියාගම සණස සමුපකාර සමිතිය - Cloud Sync Configuration
 * Galapitiyagama Sanasa Cooperative Society Ltd
 * =========================================================================
 * 
 * ඔබට ලැබුණු Google Apps Script Web App URL එක පහත "DEFAULT_CLOUD_SYNC_URL" එකට Paste කරන්න.
 * (උදාහරණයක් ලෙස: "https://script.google.com/macros/s/AKfycb.../exec")
 */

// ⬇️ මෙතනට ඔබගේ Google Apps Script Web App URL එක ඇතුළත් කරන්න ⬇️
const DEFAULT_CLOUD_SYNC_URL = "https://script.google.com/macros/s/AKfycbwv8RzWI3UoGsiEyLGUW3Gjz5MYWDawrMsM-opp5IB_EotMhPfwax0FgZx7zbFlzc5p/exec";

// Cloud Sync URL එක ලබා ගැනීමේ Helper ශ්‍රිතය
function getCloudSyncUrl() {
  const local = localStorage.getItem('sanasa_cloud_sync_url');
  if (local && local.trim()) return local.trim();
  if (typeof DEFAULT_CLOUD_SYNC_URL !== 'undefined' && DEFAULT_CLOUD_SYNC_URL.trim()) {
    return DEFAULT_CLOUD_SYNC_URL.trim();
  }
  return "";
}

// Cloud Sync URL එක Save කිරීමේ Helper ශ්‍රිතය
function setCloudSyncUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem('sanasa_cloud_sync_url', url.trim());
  } else {
    localStorage.removeItem('sanasa_cloud_sync_url');
  }
}
