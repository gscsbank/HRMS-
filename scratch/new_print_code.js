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
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
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
              <td style="padding:5px 4px;">${g.isAnonymous ? '🔒 නිර්නාමික (Anonymous)' : (g.submittedBy || 'නාමික')}</td>
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
    titleSinhala = 'සේවක තෘප්තිමත්භාවය හා සුවතා සමීක්ෂණ ලේඛනය';
    titleEnglish = 'Employee Wellbeing & Satisfaction Survey Report';
    const surveys = appData.surveys || [];
    tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:10px; text-align:center;" border="1" bordercolor="#000">
        <thead>
          <tr style="background:#f2f2f2; font-weight:bold;">
            <th style="padding:6px 4px; width:35px;">අංකය</th>
            <th style="padding:6px 4px; width:80px;">දිනය</th>
            <th style="padding:6px 4px;">සේවකයා</th>
            <th style="padding:6px 4px;">වැඩ පරිසරය</th>
            <th style="padding:6px 4px;">කළමනාකාරීත්වය</th>
            <th style="padding:6px 4px;">වැටුප් සාධාරණත්වය</th>
            <th style="padding:6px 4px;">දිශාව හා අභිප්‍රේරණය</th>
            <th style="padding:6px 4px; font-weight:800;">සාමාන්‍යය</th>
            <th style="padding:6px 6px; text-align:left;">සේවක අදහස්</th>
          </tr>
        </thead>
        <tbody>
          ${surveys.map((s, idx) => `
            <tr>
              <td style="padding:5px 4px;">${idx + 1}</td>
              <td style="padding:5px 4px;">${s.date || '-'}</td>
              <td style="padding:5px 4px; font-weight:600;">${s.employeeName || (s.employeeId ? 'සේවක #' + s.employeeId : 'Anonymous')}</td>
              <td style="padding:5px 4px;">${s.workEnvironment || '-'} / 5</td>
              <td style="padding:5px 4px;">${s.managementSupport || '-'} / 5</td>
              <td style="padding:5px 4px;">${s.salaryFairness || '-'} / 5</td>
              <td style="padding:5px 4px;">${s.coopDirection || '-'} / 5</td>
              <td style="padding:5px 4px; font-weight:bold;">${s.averageScore ? Number(s.averageScore).toFixed(1) + ' / 5' : '-'}</td>
              <td style="padding:5px 6px; text-align:left;">${s.comments || '-'}</td>
            </tr>
          `).join('')}
          ${surveys.length === 0 ? '<tr><td colspan="9" style="padding:16px; color:#888;">සුවතා සමීක්ෂණ දත්ත වාර්තා වී නොමැත.</td></tr>' : ''}
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
        <span>මුද්‍රණ දිනය: ${dateNow}</span>
      </div>

      ${tableHTML}

      <div style="display:flex; justify-content:space-between; margin-top:40px; font-size:11px; text-align:center;">
        <div>...................................<br>සකස් කළේ (HR / Accounts)</div>
        <div>...................................<br>පරීක්ෂා කළේ (Internal Audit)</div>
        <div>...................................<br>අනුමත කළේ (General Manager / Chairman)</div>
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

