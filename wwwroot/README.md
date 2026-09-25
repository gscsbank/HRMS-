# ගලපිටියාගම සණස සමුපකාර සමිතිය - Smart HRMS Web Platform
### Galapitiyagama Sanasa Cooperative Society Ltd - Modern Cloud HRMS

---

## 🎨 Ultra-Modern Smart Dashboard UI (නවීන අතුරුමුහුණත)
මෙම පද්ධතිය Neumorphic / Glassmorphic Card UI සහ Soft Pastel Glow තේමාවකින් නිර්මාණය කර ඇත:
* **Welcome Hero Banner**: සණස කළමනාකරණ කටයුතු ක්ෂණිකව දැක්වෙන ආකර්ෂණීය Header Card එක.
* **Horizontal Vibrant Stat Pills**:
  - 🟣 **Purple Pill**: `∑ 8` Total Staff / සේවක මණ්ඩලය
  - 🟠 **Orange Pill**: `⏱ 3` In Progress Duties / ක්‍රියාකාරී රාජකාරි
  - 🔵 **Blue Pill**: `⌛ 2` Pending Grievances / සභාපති අවධානයට ඇති ගැටළු
  - 🟢 **Green Pill**: `✔ 4.8` Member CSAT / සාමාජික තෘප්තිමත්භාවය
* **Smooth Spline Curve Chart**: මාසික කාර්යසාධන ප්‍රවණතාවය (Total Work).
* **Skills Concentric Radial Chart**: ක්ෂුද්‍ර මූල්‍ය, ණය තක්සේරු, ගිණුම්කරණය සහ Core Banking MIS නිපුණතා ව්‍යාප්තිය.
* **Working Status Circular Gauge**: සේවක සක්‍රීයත්වය 75% පෙන්වන රවුම් දර්ශකය.
* **Interactive Mini Calendar**: අද දිනය රවුම් Violet Badge එකකින් සලකුණු වූ දින දර්ශනය සහ Cooperative Events Timeline එක.

---

## 🔐 පරිපාලක Login පද්ධතිය (Administrator Access Only)
පද්ධතියට පිවිසීම සඳහා **පරිපාලක (Admin)** ගිණුම පමණක් වෙන් කර ඇති අතර, මුරපදය පරීක්ෂා කිරීමේ පහසුව සඳහා Show/Hide Password සහ Auto-fill පහසුකම ඇතුළත්ය:

| පරිශීලක භූමිකාව (Role) | පරිශීලක නාමය (Username) | පෙරනිමි මුරපදය (Default Password) | බලතල (Permissions) |
|---|---|---|---|
| **🛡️ ප්‍රධාන පරිපාලක (System Administrator)** | `admin` | `admin123` | සභාපති වෙත ලැබුණු ගැටළු, සේවක ලියාපදිංචිය, Skills Matrix, වැටුප් (EPF/ETF), සාමාජික අදහස් හා සම්පූර්ණ පද්ධති පාලනය |

---

## 🌐 Online QR පද්ධතිය (Wi-Fi අවශ්‍ය නැත - No Wi-Fi Needed)
* මෙම පද්ධතියේ QR කේත **100% Online Cloud URL** මගින් ක්‍රියාත්මක වේ.
* ඔබගේ දුරකථනයට හෝ සේවකයාගේ දුරකථනයට එකම Wi-Fi එකේ සිටීම අවශ්‍ය නොවේ. 4G/5G ඕනෑම අන්තර්ජාල සම්බන්ධතාවයකින් QR එක scan කළ හැක.
* **ස්වයංක්‍රීය හඳුනාගැනීම**: ඔබ GitHub Pages (උදා: `https://username.github.io/HRMS/`) හි host කළ විට, QR කේතය ස්වයංක්‍රීයව එම GitHub Pages හි `grievance.html` සහ `feedback.html` වෙත යොමු වේ.
* **Online URL Configurator**: ඉහළ දකුණු කෙළවරේ ඇති `Online QR 100%` බොත්තම ක්ලික් කර ඔබගේ GitHub Pages හෝ Custom Domain ලිපිනය පහසුවෙන් ඇතුළත් කළ හැක.

---

## 🚀 GitHub Pages මගින් නොමිලේ Online Host කරන ආකාරය (Deployment Guide)

1. **GitHub වෙත ගොස් New Repository එකක් සාදන්න**:
   - Repository Name: `HRMS` (හෝ කැමති නමක්)
   - Public ලෙස තෝරන්න.
2. **මෙම ෆෝල්ඩරයේ ඇති ගොනු Upload කරන්න**:
   - `c:\Users\iraaf\Desktop\HRMS` ෆෝල්ඩරයේ ඇති සියලුම ගොනු (`index.html`, `grievance.html`, `feedback.html`, `css/`, `js/`, `webfonts/`, `data/`) GitHub Repo එකට Push හෝ Drag & Drop කර Commit කරන්න.
3. **GitHub Pages සක්‍රීය කරන්න**:
   - Repository එකේ **Settings** -> **Pages** වෙත යන්න.
   - **Branch** යටතේ `main` (හෝ `master`) තෝරා `/ (root)` තෝරා **Save** කරන්න.
4. විනාඩියකින් ඔබගේ සජීවී වෙබ් අඩවිය ක්‍රියාත්මක වේ:
   👉 **`https://<your-username>.github.io/HRMS/`**
5. ඔබගේ සජීවී වෙබ් අඩවියට ගිය විට QR කේත සියල්ල සම්පූර්ණයෙන්ම Online සක්‍රීයව ක්‍රියාත්මක වේ!

---

## 💻 පරිගණකයේ සෘජුව ක්‍රියාත්මක කිරීමට (Offline / Local Run):
* ෆෝල්ඩරයේ ඇති **`Start_HRMS.bat`** මත Double Click කරන්න හෝ කෙලින්ම **`index.html`** ඕනෑම Browser එකකින් Open කරන්න.
