# 📊 Google Sheets Realtime Cloud Sync සැකසුම් මාර්ගෝපදේශය
### Galapitiyagama Sanasa Cooperative HRMS - Cloud Data Integration Guide

ඔබගේ ජංගම දුරකථනයෙන් QR Code එක Scan කර Submit කරන සියලුම **සභාපති වෙත යොමු වන ගැටළු / යෝජනා (Grievances)** සහ **සාමාජික ප්‍රතිචාර (Member Feedback)** සෘජුවම නොමිලේ ඔබගේ **Google Sheet** එකට සහ **HRMS Dashboard** එකට Realtime එකතු කර ගැනීමට පහත පියවර 5 අනුගමනය කරන්න.

---

### පියවර 1: අලුත් Google Sheet එකක් විවෘත කරන්න
1. ඔබගේ Browser එකෙන් [sheets.new](https://sheets.new) වෙත යන්න (හෝ Google Drive වෙත ගොස් New Google Sheet එකක් විවෘත කරන්න).
2. Sheet එකේ නම ලෙස **`ගලපිටියාගම සණස HRMS - QR Data`** ලෙස දෙන්න.

---

### පියවර 2: Apps Script විවෘත කරන්න
1. ඉහළ මෙනුවේ ඇති **`Extensions`** (දිගු) මත ක්ලික් කරන්න.
2. එහි ඇති **`Apps Script`** තෝරන්න.
3. අලුත් Tab එකකින් Script Editor එක විවෘත වේ.
4. එහි ඇති පෙරනිමි කේතය (Code) සම්පූර්ණයෙන්ම Delete කර හිස් කරන්න.

---

### පියවර 3: Code එක Copy කර Paste කරන්න
1. මෙම Project ෆෝල්ඩරයේ ඇති **`google_apps_script.js`** ගොනුව විවෘත කරන්න.
2. එහි ඇති සම්පූර්ණ Code එක Select කර Copy කරගෙන Apps Script Editor එකට **Paste කරන්න**.
3. ඉහළ ඇති **Save (💾)** අයිකනය ඔබන්න.

---

### පියවර 4: Web App එකක් ලෙස Deploy කරන්න (ඉතා වැදගත්)
1. ඉහළ දකුණු කෙළවරේ ඇති නිල් පාට **`Deploy`** බොත්තම ඔබා **`New deployment`** තෝරන්න.
2. වම් පැත්තේ ඇති Settings (⚙️) අයිකනය ඔබා **`Web app`** තෝරන්න.
3. පහත තොරතුරු සකසන්න:
   * **Description:** `HRMS Cloud Sync`
   * **Execute as:** `Me (ඔබගේ Gmail ලිපිනය)`
   * **Who has access:** ⚠️ **`Anyone`** (ඕනෑම අයෙකුට) ලෙස තෝරන්න. *(මෙය 'Anyone' ලෙස තැබිය යුත්තේ ඕනෑම සේවකයෙකුට හෝ සාමාජිකයෙකුට Login වීමකින් තොරව Phone එකෙන් Data Submit කිරීමට හැකි වීම සඳහාය)*
4. පහළ ඇති නිල් පාට **`Deploy`** බොත්තම ඔබන්න.
5. Google මගින් අවසර (Authorization) ඉල්ලුවහොත්:
   * **Authorize Access** ඔබන්න.
   * ඔබගේ Google Account එක තෝරන්න.
   * "Google hasn't verified this app" කියා ආවොත්, පහළ ඇති **`Advanced`** ක්ලික් කර **`Go to Untitled project (unsafe)`** ක්ලික් කරන්න.
   * ඉන්පසු **`Allow`** ක්ලික් කරන්න.
6. සාර්ථක වූ පසු ඔබට **Web App URL** එකක් ලැබෙනු ඇත:
   (උදා: `https://script.google.com/macros/s/AKfycb.../exec`)
7. එම **Web App URL** එක **Copy** කරගන්න.

---

### පියවර 5: URL එක HRMS පද්ධතියට සම්බන්ධ කරන්න
1. මෙම Project එකේ **`js/config.js`** ගොනුව විවෘත කරන්න.
2. එහි ඉහළ ඇති `DEFAULT_CLOUD_SYNC_URL` හි double quotes ("") ඇතුළට ඔබ Copy කරගත් URL එක Paste කරන්න:
   ```javascript
   const DEFAULT_CLOUD_SYNC_URL = "https://script.google.com/macros/s/ඔබේ-URL-එක/exec";
   ```
3. ගොනුව Save කරන්න.
4. එසේම Dashboard එකේ ඉහළ දකුණු කෙළවරේ ඇති **`Cloud Online`** බොත්තම (හෝ Grievance/Feedback හි ඇති **`Online & Cloud සැකසුම්`**) ක්ලික් කර එම URL එක එතැනටද Paste කර **"සැකසුම් සුරකින්න"** ඔබන්න.

---

### 🚀 දැන් පරීක්ෂා කර බලන්න:
1. ජංගම දුරකථනයෙන් QR එක Scan කර Grievance හෝ Feedback එකක් Submit කරන්න.
2. විගසින් ඔබගේ Google Sheet එකේ අලුත් Row එකක් එකතු වේ!
3. HRMS Dashboard එකේ Grievance සහ Member Feedback ලේඛනවල එම දත්ත සැනින් පෙන්වනු ඇත!
