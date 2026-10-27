# 📊 Google Sheets Cloud Sync & Data Backup/Restore සැකසුම් මාර්ගෝපදේශය
### Galapitiyagama Sanasa Cooperative HRMS - Cloud Data Integration & Backup Guide

මෙම යාවත්කාලීන කරන ලද Google Apps Script මගින්:
1. **ජංගම දුරකථන QR Submissions (Grievances & Feedback)** real-time Google Sheet එකට එකතු වේ.
2. **පූර්ණ පද්ධති Cloud Backup (Full System Backup):** HRMS පද්ධතියේ සියලුම සේවකයින්, වැටුප්, ව්‍යාපෘති, රැස්වීම් සහ QR තොරතුරු Google Sheet එකට Backup කර තබා ගත හැක.
3. **පූර්ණ පද්ධති Cloud Restore:** Google Sheet එකේ ඇති ඕනෑම Backup එකක් තෝරා එක ක්ලික් එකකින් පද්ධතිය Restore කරගත හැක.
4. **ස්වයංක්‍රීය පැතුරුම්පත් (Human-Readable Spreadsheets):** Backup කරන විට `Employees`, `Payroll`, `Tasks`, `Meetings` ලෙස Google Sheet එක තුළ වෙනම Sheets ද ස්වයංක්‍රීයව ලස්සනට සකස් වේ!

---

### පියවර 1: අලුත් Google Sheet එකක් විවෘත කරන්න
1. ඔබගේ Browser එකෙන් [sheets.new](https://sheets.new) වෙත යන්න (හෝ Google Drive වෙත ගොස් New Google Sheet එකක් විවෘත කරන්න).
2. Sheet එකේ නම ලෙස **`ගලපිටියාගම සණස HRMS - Database & Backups`** ලෙස දෙන්න.

---

### පියවර 2: Apps Script විවෘත කරන්න
1. Google Sheet එකේ ඉහළ මෙනුවේ ඇති **`Extensions`** (දිගු) මත ක්ලික් කරන්න.
2. එහි ඇති **`Apps Script`** තෝරන්න.
3. අලුත් Tab එකකින් Script Editor එක විවෘත වේ.
4. එහි ඇති පැරණි කේතය (Code) සම්පූර්ණයෙන්ම Delete කර හිස් කරන්න.

---

### පියවර 3: නව Backup & Restore Code එක Paste කරන්න
1. මෙම Project ෆෝල්ඩරයේ ඇති **`google_apps_script.js`** ගොනුව විවෘත කරන්න.
2. එහි ඇති සම්පූර්ණ Code එක Select කර Copy කරගෙන Apps Script Editor එකට **Paste කරන්න**.
3. ඉහළ ඇති **Save (💾)** අයිකනය ඔබන්න.

---

### පියවර 4: Web App එකක් ලෙස Deploy කරන්න (ඉතා වැදගත්)
1. ඉහළ දකුණු කෙළවරේ ඇති නිල් පාට **`Deploy`** බොත්තම ඔබා **`New deployment`** තෝරන්න.
2. වම් පැත්තේ ඇති Settings (⚙️) අයිකනය ඔබා **`Web app`** තෝරන්න.
3. පහත තොරතුරු සකසන්න:
   * **Description:** `HRMS Cloud Sync & Backup Engine`
   * **Execute as:** `Me (ඔබගේ Gmail ලිපිනය)`
   * **Who has access:** ⚠️ **`Anyone`** (ඕනෑම අයෙකුට) ලෙස තෝරන්න. *(මෙය 'Anyone' ලෙස තැබිය යුත්තේ Authentication බාධාවකින් තොරව Phone QR Submissions සහ Dashboard Cloud Sync/Backup ක්‍රියාත්මක වීම සඳහාය)*
4. පහළ ඇති නිල් පාට **`Deploy`** බොත්තම ඔබන්න.
5. Google මගින් අවසර (Authorization) ඉල්ලුවහොත්:
   * **Authorize Access** ඔබන්න.
   * ඔබගේ Google Account එක තෝරන්න.
   * "Google hasn't verified this app" කියා ආවොත්, පහළ ඇති **`Advanced`** ක්ලික් කර **`Go to Untitled project (unsafe)`** ක්ලික් කරන්න.
   * ඉන්පසු **`Allow`** ක්ලික් කරන්න.
6. සාර්ථක වූ පසු ඔබට **Web App URL** එකක් ලැබෙනු ඇත:
   (උදා: `https://script.google.com/macros/s/AKfycb.../exec`)
7. එම **Web App URL** එක **Copy** කරගන්න.

*(සටහන: ඔබ දැනටමත් පරණ Script එක Deploy කර ඇත්නම්, `Deploy` -> `Manage deployments` -> Edit (✏️) ඔබා Version එක `New version` ලෙස තෝරා Deploy කරන්න).*

---

### පියවර 5: URL එක HRMS පද්ධතියට සම්බන්ධ කරන්න
1. මෙම Project එකේ **`js/config.js`** ගොනුව විවෘත කරන්න.
2. එහි ඉහළ ඇති `DEFAULT_CLOUD_SYNC_URL` හි double quotes ("") ඇතුළට ඔබ Copy කරගත් URL එක Paste කරන්න:
   ```javascript
   const DEFAULT_CLOUD_SYNC_URL = "https://script.google.com/macros/s/ඔබේ-URL-එක/exec";
   ```
3. ගොනුව Save කරන්න.
4. එසේම Dashboard එකේ වම් මෙනුවේ ඇති **`Backup & Restore (දත්ත උපස්ථ)`** වෙත ගොස් ඉහළ ඇති **`Cloud Settings`** ක්ලික් කර එම URL එක එතැනටද Paste කර **"සැකසුම් සුරකින්න"** ඔබන්න.

---

### 🚀 Backup සහ Restore භාවිත කරන ආකාරය:

#### 1. Cloud Backup එකක් ලබා ගැනීම (Backup to Google Sheets):
* Dashboard එකේ වම් මෙනුවේ ඇති **`Backup & Restore`** වෙත යන්න.
* **`Google Sheet වෙත දැන් Backup කරන්න`** (හෝ Admin Panel එකේ ඇති `Cloud Backup`) බොත්තම ඔබන්න.
* තත්පර කිහිපයකින් පද්ධතියේ සියලුම සේවක, වැටුප්, ව්‍යාපෘති, රැස්වීම් සහ QR දත්ත ඔබගේ Google Sheet එකට Backup වේ!
* Google Sheet එක විවෘත කර බලන්න:
  - `SystemBackups` Sheet එකේ කාලය හා විස්තර සහිතව snapshot එකක් සෑදී ඇත.
  - `Employees`, `Payroll`, `Tasks`, `Meetings` යන Sheets ද සකස් වී Excel ආකාරයෙන් බලාගත හැක!

#### 2. Cloud Backup එකකින් දත්ත නැවත ලබා ගැනීම (Restore from Google Sheets):
* Dashboard එකේ **`Backup & Restore`** වෙත ගොස් **`Cloud වෙතින් Restore (නවතම)`** ඔබන්න.
* හෝ **`Backups ඉතිහාසය (History)`** ඔබා ඔබට අවශ්‍ය ඕනෑම දිනයක Backup එකක් තෝරා `Restore` ඔබන්න.
* එවිට තහවුරු කිරීමේ පෙරදසුනක් (Preview Modal) දිස්වේ. එහි ඇති සේවක සහ වැටුප් සංඛ්‍යාව පරීක්ෂා කර **`ඔව්, දත්ත Restore කරන්න`** ඔබන්න.
* සැනින් ඔබගේ පද්ධතිය එම Backup එකෙහි තත්වයට නැවත පත්වේ!

#### 3. පරිගණකයට Offline Backup ලබා ගැනීම (Local JSON File):
* අන්තර්ජාලය නොමැතිව වුවද **`පද්ධති Backup ගොනුව බාගන්න (Download .json)`** මගින් පරිගණකයට හෝ Pen Drive එකට Backup එකක් ලබාගත හැක.
* **`Backup ගොනුවකින් Restore කරන්න (Choose File)`** මගින් එම ගොනුව තෝරා ඕනෑම වෙලාවක නැවත Restore කරගත හැක.
