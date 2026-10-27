/**
 * =========================================================================
 * ගලපිටියාගම සණස සමුපකාර සමිතිය - Smart HRMS Google Cloud Sync & Backup Engine
 * Galapitiyagama Sanasa Cooperative Society Ltd - Cloud Webhook, API & Backup
 * =========================================================================
 * 
 * මෙම Code එක Google Apps Script එකට Copy & Paste කර "Deploy as Web App" කරන්න.
 * විශේෂාංග (Features):
 * 1. Mobile Phone Grievance / Feedback QR Submissions real-time sync
 * 2. Full System Data Backup (පද්ධතියේ සියලුම දත්ත Cloud Backup කිරීම)
 * 3. Full System Data Restore (Google Sheet එකෙන් නැවත පද්ධතිය Restore කිරීම)
 * 4. Human-readable Sheets Auto-Generation (Employees, Payroll, Tasks, Meetings)
 * 5. Automatic Payload Chunking (Google Sheets cell character limits bypass)
 */

var CHUNK_SIZE = 40000; // 40,000 characters per cell chunk (Sheets cell limit: 50,000)

// =========================================================================
// 1. POST HANDLER: Data Submission & Full System Backup
// =========================================================================
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents;
    if (e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else {
      contents = JSON.parse(e.parameter.data || "{}");
    }

    var type = contents.type || contents.action;
    var data = contents.data;

    // ---------------------------------------------------------------------
    // A. FULL SYSTEM BACKUP (පූර්ණ පද්ධති උපස්ථය)
    // ---------------------------------------------------------------------
    if (type === "backup" || type === "backup_full") {
      var backupResult = handleSystemBackup(ss, contents);
      return ContentService.createTextOutput(JSON.stringify(backupResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // B. CLEAR / WIPE ALL QR SUBMISSIONS (Factory Reset Support)
    // ---------------------------------------------------------------------
    if (type === "clear_qr_data" || type === "reset_qr_data") {
      var grvSheet = ss.getSheetByName("Grievances");
      if (grvSheet && grvSheet.getLastRow() > 1) {
        grvSheet.deleteRows(2, grvSheet.getLastRow() - 1);
      }
      var fbSheet = ss.getSheetByName("MemberFeedback");
      if (fbSheet && fbSheet.getLastRow() > 1) {
        fbSheet.deleteRows(2, fbSheet.getLastRow() - 1);
      }
      var wlbSheet = ss.getSheetByName("Wellbeing");
      if (wlbSheet && wlbSheet.getLastRow() > 1) {
        wlbSheet.deleteRows(2, wlbSheet.getLastRow() - 1);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "QR grievances, feedback and wellbeing surveys cleared from Google Sheet" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // C. DELETE SINGLE GRIEVANCE
    // ---------------------------------------------------------------------
    if (type === "delete_grievance") {
      var grvSheet = ss.getSheetByName("Grievances");
      var targetId = String((data && data.id) || contents.id || "");
      if (grvSheet && grvSheet.getLastRow() > 1 && targetId) {
        var values = grvSheet.getRange(2, 1, grvSheet.getLastRow() - 1, 1).getValues();
        for (var r = 0; r < values.length; r++) {
          if (String(values[r][0]).trim() === targetId.trim()) {
            grvSheet.deleteRow(r + 2);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", id: targetId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // D. DELETE SINGLE MEMBER FEEDBACK
    // ---------------------------------------------------------------------
    if (type === "delete_member_feedback") {
      var fbSheet = ss.getSheetByName("MemberFeedback");
      var targetFbId = String((data && data.id) || contents.id || "");
      if (fbSheet && fbSheet.getLastRow() > 1 && targetFbId) {
        var fbVals = fbSheet.getRange(2, 1, fbSheet.getLastRow() - 1, 1).getValues();
        for (var f = 0; f < fbVals.length; f++) {
          if (String(fbVals[f][0]).trim() === targetFbId.trim()) {
            fbSheet.deleteRow(f + 2);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", id: targetFbId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // E. DELETE SINGLE WELLBEING SURVEY
    // ---------------------------------------------------------------------
    if (type === "delete_survey" || type === "delete_wellbeing") {
      var wlbSheet = ss.getSheetByName("Wellbeing");
      var targetSurvId = String((data && data.id) || contents.id || "");
      if (wlbSheet && wlbSheet.getLastRow() > 1 && targetSurvId) {
        var wlbVals = wlbSheet.getRange(2, 1, wlbSheet.getLastRow() - 1, 1).getValues();
        for (var w = 0; w < wlbVals.length; w++) {
          if (String(wlbVals[w][0]).trim() === targetSurvId.trim()) {
            wlbSheet.deleteRow(w + 2);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", id: targetSurvId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // B. GRIEVANCE SUBMISSION (සභාපති වෙත යොමු වන ගැටළු / යෝජනා)
    // ---------------------------------------------------------------------
    if (type === "grievance") {
      var grvSheet = ss.getSheetByName("Grievances");
      if (!grvSheet) {
        grvSheet = ss.insertSheet("Grievances");
        grvSheet.appendRow([
          "යොමු අංකය (ID)",
          "දිනය හා වේලාව (Date & Time)",
          "නිර්නාමිකද (Is Anonymous)",
          "සේවක නම (Employee Name)",
          "අංශය (Department)",
          "අවධානය පිණිස (Target Recipient)",
          "වර්ගය (Category)",
          "ශීර්ෂය (Subject)",
          "විස්තරය (Description)",
          "තත්ත්වය (Status)",
          "අධ්‍යක්ෂ මණ්ඩල සටහන (Board Notes)"
        ]);
        grvSheet.getRange("A1:K1").setFontWeight("bold").setBackground("#ede9fe").setFontColor("#5b21b6");
        grvSheet.setFrozenRows(1);
      }

      var grvId = data.id || ("GRV-2026-" + Math.floor(100 + Math.random() * 900));
      var grvTime = data.timestamp || Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm");

      grvSheet.appendRow([
        grvId,
        grvTime,
        data.isAnonymous ? "ඔව් (Yes)" : "නැත (No)",
        data.employeeName || "නිර්නාමික කාර්ය මණ්ඩල සාමාජික",
        data.department || "",
        data.targetRecipient || "ගරු සභාපතිතුමා",
        data.category || "",
        data.title || "",
        data.description || "",
        data.status || "නව (New)",
        data.boardNotes || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({ status: "success", type: "grievance", id: grvId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // C. MEMBER FEEDBACK (සාමාජික අදහස් විමසීම්)
    // ---------------------------------------------------------------------
    if (type === "member_feedback") {
      var fbSheet = ss.getSheetByName("MemberFeedback");
      if (!fbSheet) {
        fbSheet = ss.insertSheet("MemberFeedback");
        fbSheet.appendRow([
          "යොමු අංකය (ID)",
          "දිනය හා වේලාව (Date & Time)",
          "සාමාජික නම (Member Name)",
          "සාමාජික අංකය (Member No)",
          "ශාඛාව (Branch)",
          "දුරකථන අංකය (Phone)",
          "තරු අගය (Rating 1-5)",
          "අදහස් වර්ගය (Feedback Type)",
          "සටහන (Comments)",
          "තත්ත්වය (Status)"
        ]);
        fbSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#ecfdf5").setFontColor("#065f46");
        fbSheet.setFrozenRows(1);
      }

      var fbId = data.id || ("MFB-2026-" + Math.floor(100 + Math.random() * 900));
      var fbTime = data.timestamp || Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm");

      fbSheet.appendRow([
        fbId,
        fbTime,
        data.memberName || "සමුපකාර සාමාජික",
        data.memberNo || "",
        data.branch || "ප්‍රධාන කාර්යාලය",
        data.phone || "",
        data.overallRating || 5,
        data.feedbackType || "",
        data.comments || "",
        data.status || "නව (New)"
      ]);

      return ContentService.createTextOutput(JSON.stringify({ status: "success", type: "member_feedback", id: fbId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // D. EMPLOYEE WELLBEING SURVEY (සේවක තෘප්තිමත්භාවය හා සුවතාවය)
    // ---------------------------------------------------------------------
    if (type === "survey" || type === "wellbeing") {
      var wlbSheet = ss.getSheetByName("Wellbeing");
      if (!wlbSheet) {
        wlbSheet = ss.insertSheet("Wellbeing");
        wlbSheet.appendRow([
          "යොමු අංකය (ID)",
          "දිනය හා වේලාව (Date & Time)",
          "සේවක නම (Employee Name)",
          "දෙපාර්තමේන්තුව (Department)",
          "වැඩ පරිසරය (Work Environment 1-5)",
          "කළමනාකාරීත්වය (Management Support 1-5)",
          "වැටුප් සාධාරණත්වය (Salary Fairness 1-5)",
          "වෘත්තීය දියුණුව (Career Growth 1-5)",
          "සාමාන්‍ය ලකුණ (Average Score)",
          "අදහස් හා යෝජනා (Comments)"
        ]);
        wlbSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#dcfce7").setFontColor("#065f46");
        wlbSheet.setFrozenRows(1);
      }

      var wlbId = data.id || ("WLB-2026-" + Math.floor(100 + Math.random() * 900));
      var wlbTime = data.timestamp || Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm");
      var ratings = data.ratings || {};

      wlbSheet.appendRow([
        wlbId,
        wlbTime,
        data.employeeName || "නිර්නාමික කාර්ය මණ්ඩල සාමාජික",
        data.department || "",
        Number(ratings.workEnvironment) || 4,
        Number(ratings.managementSupport) || 4,
        Number(ratings.salaryFairness) || 4,
        Number(ratings.careerGrowth) || 4,
        Number(data.averageScore) || 4.0,
        data.comments || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({ status: "success", type: "survey", id: wlbId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored", message: "Unknown action or type" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// 2. GET HANDLER: Data Fetch, Cloud Restore & Backup History
// =========================================================================
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action.toLowerCase() : "";

    // ---------------------------------------------------------------------
    // A. RESTORE FROM CLOUD BACKUP (දත්ත ප්‍රතිසාධනය)
    // ---------------------------------------------------------------------
    if (action === "restore" || action === "get_backup") {
      var requestedId = e.parameter.backupId || "";
      var restoreResult = handleSystemRestore(ss, requestedId);
      var outRestore = ContentService.createTextOutput(JSON.stringify(restoreResult));
      outRestore.setMimeType(ContentService.MimeType.JSON);
      return outRestore;
    }

    // ---------------------------------------------------------------------
    // B. LIST AVAILABLE CLOUD BACKUPS (උපස්ථ ලැයිස්තුව ලබා ගැනීම)
    // ---------------------------------------------------------------------
    if (action === "list_backups") {
      var listResult = handleListBackups(ss);
      var outList = ContentService.createTextOutput(JSON.stringify(listResult));
      outList.setMimeType(ContentService.MimeType.JSON);
      return outList;
    }

    // ---------------------------------------------------------------------
    // C. PING / STATUS CHECK (සබඳතා පරීක්ෂාව)
    // ---------------------------------------------------------------------
    if (action === "ping" || action === "status") {
      var backupStats = getBackupStats(ss);
      var outStatus = ContentService.createTextOutput(JSON.stringify({
        status: "success",
        online: true,
        sheetName: ss.getName(),
        organization: "Galapitiyagama Sanasa Cooperative Society Ltd",
        serverTime: Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm:ss"),
        totalBackups: backupStats.totalBackups,
        latestBackupTime: backupStats.latestBackupTime
      }));
      outStatus.setMimeType(ContentService.MimeType.JSON);
      return outStatus;
    }

    // ---------------------------------------------------------------------
    // D. DEFAULT: Grievances & Member Feedback Realtime Sync
    // ---------------------------------------------------------------------
    var grievances = [];
    var grvSheet = ss.getSheetByName("Grievances");
    if (grvSheet && grvSheet.getLastRow() > 1) {
      var grvValues = grvSheet.getDataRange().getValues();
      for (var i = 1; i < grvValues.length; i++) {
        var row = grvValues[i];
        if (row[0]) {
          var dateVal = row[1];
          if (dateVal instanceof Date) {
            dateVal = Utilities.formatDate(dateVal, "Asia/Colombo", "yyyy-MM-dd HH:mm");
          }
          grievances.unshift({
            id: String(row[0]),
            timestamp: String(dateVal || ""),
            isAnonymous: String(row[2]).indexOf("ඔව්") !== -1 || String(row[2]).toLowerCase() === "yes",
            employeeName: String(row[3] || ""),
            department: String(row[4] || ""),
            targetRecipient: String(row[5] || ""),
            category: String(row[6] || ""),
            title: String(row[7] || ""),
            description: String(row[8] || ""),
            status: String(row[9] || "නව (New)"),
            boardNotes: String(row[10] || "")
          });
        }
      }
    }

    var feedbacks = [];
    var fbSheet = ss.getSheetByName("MemberFeedback");
    if (fbSheet && fbSheet.getLastRow() > 1) {
      var fbValues = fbSheet.getDataRange().getValues();
      for (var j = 1; j < fbValues.length; j++) {
        var fRow = fbValues[j];
        if (fRow[0]) {
          var fDateVal = fRow[1];
          if (fDateVal instanceof Date) {
            fDateVal = Utilities.formatDate(fDateVal, "Asia/Colombo", "yyyy-MM-dd HH:mm");
          }
          feedbacks.unshift({
            id: String(fRow[0]),
            timestamp: String(fDateVal || ""),
            memberName: String(fRow[2] || ""),
            memberNo: String(fRow[3] || ""),
            branch: String(fRow[4] || ""),
            phone: String(fRow[5] || ""),
            overallRating: Number(fRow[6]) || 5,
            feedbackType: String(fRow[7] || ""),
            comments: String(fRow[8] || ""),
            status: String(fRow[9] || "නව (New)")
          });
        }
      }
    }

    var surveys = [];
    var wlbSheet = ss.getSheetByName("Wellbeing");
    if (wlbSheet && wlbSheet.getLastRow() > 1) {
      var wlbValues = wlbSheet.getDataRange().getValues();
      for (var k = 1; k < wlbValues.length; k++) {
        var wRow = wlbValues[k];
        if (wRow[0]) {
          var wDateVal = wRow[1];
          if (wDateVal instanceof Date) {
            wDateVal = Utilities.formatDate(wDateVal, "Asia/Colombo", "yyyy-MM-dd HH:mm");
          }
          surveys.unshift({
            id: String(wRow[0]),
            timestamp: String(wDateVal || ""),
            employeeName: String(wRow[2] || ""),
            department: String(wRow[3] || ""),
            ratings: {
              workEnvironment: Number(wRow[4]) || 4,
              managementSupport: Number(wRow[5]) || 4,
              salaryFairness: Number(wRow[6]) || 4,
              careerGrowth: Number(wRow[7]) || 4
            },
            averageScore: Number(wRow[8]) || 4.0,
            comments: String(wRow[9] || "")
          });
        }
      }
    }

    var bStats = getBackupStats(ss);

    var output = ContentService.createTextOutput(JSON.stringify({
      status: "success",
      organization: "Galapitiyagama Sanasa Cooperative Society Ltd",
      grievances: grievances,
      memberFeedbacks: feedbacks,
      surveys: surveys,
      totalGrievances: grievances.length,
      totalFeedbacks: feedbacks.length,
      totalSurveys: surveys.length,
      totalBackups: bStats.totalBackups,
      latestBackupTime: bStats.latestBackupTime,
      serverTime: Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm:ss")
    }));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;

  } catch (error) {
    var errOutput = ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    }));
    errOutput.setMimeType(ContentService.MimeType.JSON);
    return errOutput;
  }
}

// =========================================================================
// 3. BACKUP ENGINE IMPLEMENTATION
// =========================================================================
function handleSystemBackup(ss, payload) {
  var bkpSheet = ss.getSheetByName("SystemBackups");
  if (!bkpSheet) {
    bkpSheet = ss.insertSheet("SystemBackups");
    bkpSheet.appendRow([
      "බැකප් අංකය (Backup ID)",
      "දිනය හා වේලාව (Date & Time)",
      "සේවක ගණන (Employees)",
      "වැටුප් වාර්තා (Payroll)",
      "ගැටළු (Grievances)",
      "ප්‍රතිචාර (Feedback)",
      "ව්‍යාපෘති (Tasks)",
      "සාරාංශය (Summary)",
      "සම්පූර්ණ JSON දත්ත (Payload Part 1)",
      "Payload Part 2",
      "Payload Part 3"
    ]);
    bkpSheet.getRange("A1:K1").setFontWeight("bold").setBackground("#1e3a6e").setFontColor("#ffffff");
    bkpSheet.setFrozenRows(1);
  }

  var nowStr = Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm:ss");
  var backupId = payload.backupId || ("BKP-" + Utilities.formatDate(new Date(), "Asia/Colombo", "yyyyMMdd-HHmmss"));
  
  var data = payload.data || {};
  var summary = payload.summary || {};
  
  var empCount = (data.employees && data.employees.length) || summary.employeesCount || 0;
  var payrollCount = (data.payrollHistory && data.payrollHistory.length) || summary.payrollCount || 0;
  var grvCount = (data.grievances && data.grievances.length) || summary.grievancesCount || 0;
  var fbCount = (data.memberFeedbacks && data.memberFeedbacks.length) || summary.feedbacksCount || 0;
  var taskCount = (data.tasks && data.tasks.length) || summary.tasksCount || 0;
  var summaryText = payload.note || ("සම්පූර්ණ උපස්ථය: සේවකයින් " + empCount + " | වැටුප් " + payrollCount + " | ගැටළු " + grvCount);

  // Stringify the full system data
  var fullJson = JSON.stringify(data);

  // Insert a new row at Row 2 (keeps newest backup on top)
  bkpSheet.insertRowBefore(2);
  var metaCols = [
    backupId,
    nowStr,
    empCount,
    payrollCount,
    grvCount,
    fbCount,
    taskCount,
    summaryText
  ];
  bkpSheet.getRange(2, 1, 1, metaCols.length).setValues([metaCols]);

  // Store JSON chunks starting at Column 9 (I)
  storeJsonChunks(bkpSheet, 2, 9, fullJson);

  // Sync human-readable sheets for Excel/Sheet view
  try {
    syncHumanReadableSheets(ss, data);
  } catch (syncErr) {
    // Non-fatal if readable mirror fails
  }

  return {
    status: "success",
    type: "backup",
    backupId: backupId,
    timestamp: nowStr,
    summary: {
      employees: empCount,
      payroll: payrollCount,
      grievances: grvCount,
      feedbacks: fbCount,
      tasks: taskCount
    },
    message: "Cloud Backup successfully created in Google Sheets!"
  };
}

// Helper: Split and store JSON string across columns
function storeJsonChunks(sheet, row, startCol, jsonString) {
  var chunks = [];
  for (var i = 0; i < jsonString.length; i += CHUNK_SIZE) {
    chunks.push(jsonString.substring(i, i + CHUNK_SIZE));
  }
  if (chunks.length === 0) chunks.push("{}");
  sheet.getRange(row, startCol, 1, chunks.length).setValues([chunks]);
}

// Helper: Read and join JSON chunks from row
function readJsonChunks(sheet, row, startCol) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < startCol) return "{}";
  var numCols = lastCol - startCol + 1;
  var values = sheet.getRange(row, startCol, 1, numCols).getValues()[0];
  var fullString = "";
  for (var i = 0; i < values.length; i++) {
    if (values[i]) {
      fullString += String(values[i]);
    }
  }
  return fullString;
}

// =========================================================================
// 4. RESTORE ENGINE IMPLEMENTATION
// =========================================================================
function handleSystemRestore(ss, requestedBackupId) {
  var bkpSheet = ss.getSheetByName("SystemBackups");
  if (!bkpSheet || bkpSheet.getLastRow() <= 1) {
    return {
      status: "error",
      message: "No cloud backups found in Google Sheets."
    };
  }

  var targetRow = 2; // Default: latest backup
  var lastRow = bkpSheet.getLastRow();

  if (requestedBackupId && requestedBackupId.trim()) {
    var idValues = bkpSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var found = false;
    for (var r = 0; r < idValues.length; r++) {
      if (String(idValues[r][0]).trim() === requestedBackupId.trim()) {
        targetRow = r + 2;
        found = true;
        break;
      }
    }
    if (!found) {
      return {
        status: "error",
        message: "Backup ID '" + requestedBackupId + "' was not found."
      };
    }
  }

  var meta = bkpSheet.getRange(targetRow, 1, 1, 8).getValues()[0];
  var backupId = String(meta[0]);
  var backupTime = String(meta[1]);
  var rawJson = readJsonChunks(bkpSheet, targetRow, 9);

  var parsedData = {};
  try {
    parsedData = JSON.parse(rawJson);
  } catch (parseErr) {
    return {
      status: "error",
      message: "Corrupted backup JSON payload: " + parseErr.toString()
    };
  }

  return {
    status: "success",
    action: "restore",
    backupId: backupId,
    timestamp: backupTime,
    summary: {
      employees: Number(meta[2]) || 0,
      payroll: Number(meta[3]) || 0,
      grievances: Number(meta[4]) || 0,
      feedbacks: Number(meta[5]) || 0,
      tasks: Number(meta[6]) || 0,
      note: String(meta[7] || "")
    },
    data: parsedData
  };
}

// List available backups
function handleListBackups(ss) {
  var bkpSheet = ss.getSheetByName("SystemBackups");
  if (!bkpSheet || bkpSheet.getLastRow() <= 1) {
    return { status: "success", backups: [], count: 0 };
  }

  var maxRows = Math.min(25, bkpSheet.getLastRow() - 1);
  var rows = bkpSheet.getRange(2, 1, maxRows, 8).getValues();
  var list = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r[0]) {
      var dVal = r[1];
      if (dVal instanceof Date) {
        dVal = Utilities.formatDate(dVal, "Asia/Colombo", "yyyy-MM-dd HH:mm:ss");
      }
      list.push({
        backupId: String(r[0]),
        timestamp: String(dVal || ""),
        employeesCount: Number(r[2]) || 0,
        payrollCount: Number(r[3]) || 0,
        grievancesCount: Number(r[4]) || 0,
        feedbacksCount: Number(r[5]) || 0,
        tasksCount: Number(r[6]) || 0,
        summary: String(r[7] || "")
      });
    }
  }

  return { status: "success", backups: list, count: list.length };
}

// Helper: Backup Stats
function getBackupStats(ss) {
  var bkpSheet = ss.getSheetByName("SystemBackups");
  if (!bkpSheet || bkpSheet.getLastRow() <= 1) {
    return { totalBackups: 0, latestBackupTime: "කිසිවක් නැත (None)" };
  }
  var count = bkpSheet.getLastRow() - 1;
  var topDate = bkpSheet.getRange(2, 2).getValue();
  if (topDate instanceof Date) {
    topDate = Utilities.formatDate(topDate, "Asia/Colombo", "yyyy-MM-dd HH:mm:ss");
  }
  return { totalBackups: count, latestBackupTime: String(topDate || "") };
}

// =========================================================================
// 5. HUMAN-READABLE SHEETS AUTO-GENERATION (Spreadsheet View Mirror)
// =========================================================================
function syncHumanReadableSheets(ss, data) {
  // --- Employees Sheet ---
  if (data.employees && Array.isArray(data.employees)) {
    var empSheet = ss.getSheetByName("Employees");
    if (!empSheet) {
      empSheet = ss.insertSheet("Employees");
    }
    empSheet.clear();
    empSheet.appendRow([
      "සේවක අංකය (ID)",
      "සම්පූර්ණ නම (Full Name)",
      "තනතුර (Designation)",
      "අංශය (Department)",
      "ශාඛාව (Branch)",
      "මූලික වැටුප (Basic Salary)",
      "දුරකථන අංකය (Phone)",
      "NIC අංකය",
      "සේවා තත්වය (Type)"
    ]);
    empSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
    empSheet.setFrozenRows(1);

    var empRows = [];
    for (var e = 0; e < data.employees.length; e++) {
      var emp = data.employees[e];
      empRows.push([
        emp.id || "",
        emp.name || emp.nameSi || "",
        emp.designation || "",
        emp.department || "",
        emp.branch || "",
        emp.basicSalary || 0,
        emp.phone || "",
        emp.nic || "",
        emp.type || "Permanent"
      ]);
    }
    if (empRows.length > 0) {
      empSheet.getRange(2, 1, empRows.length, 9).setValues(empRows);
    }
  }

  // --- Payroll Sheet ---
  if (data.payrollHistory && Array.isArray(data.payrollHistory) && data.payrollHistory.length > 0) {
    var paySheet = ss.getSheetByName("Payroll");
    if (!paySheet) {
      paySheet = ss.insertSheet("Payroll");
    }
    paySheet.clear();
    paySheet.appendRow([
      "මාසය (Month)",
      "සේවක අංකය (ID)",
      "නම (Name)",
      "මූලික වැටුප (Basic)",
      "මුළු වැටුප (Gross)",
      "EPF 8% (සේවක)",
      "EPF 12% (සේවායෝජක)",
      "ETF 3% (සේවායෝජක)",
      "ශුද්ධ වැටුප (Net Pay)"
    ]);
    paySheet.getRange("A1:I1").setFontWeight("bold").setBackground("#881337").setFontColor("#ffffff");
    paySheet.setFrozenRows(1);

    var payRows = [];
    for (var p = 0; p < data.payrollHistory.length; p++) {
      var pay = data.payrollHistory[p];
      payRows.push([
        pay.month || "",
        pay.empId || "",
        pay.name || "",
        pay.basicSalary || pay.basic || 0,
        pay.grossSalary || pay.gross || 0,
        pay.epfEmployee || 0,
        pay.epfEmployer || 0,
        pay.etfEmployer || 0,
        pay.netSalary || pay.net || 0
      ]);
    }
    if (payRows.length > 0) {
      paySheet.getRange(2, 1, payRows.length, 9).setValues(payRows);
    }
  }

  // --- Tasks Sheet ---
  if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
    var tskSheet = ss.getSheetByName("Tasks");
    if (!tskSheet) {
      tskSheet = ss.insertSheet("Tasks");
    }
    tskSheet.clear();
    tskSheet.appendRow([
      "කාර්ය අංකය (ID)",
      "ශීර්ෂය (Title)",
      "අංශය (Department)",
      "භාර නිලධාරී (Assigned Staff)",
      "අවසන් දිනය (Due Date)",
      "ප්‍රගතිය % (Progress)",
      "විස්තරය (Description)"
    ]);
    tskSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
    tskSheet.setFrozenRows(1);

    var tskRows = [];
    for (var t = 0; t < data.tasks.length; t++) {
      var tsk = data.tasks[t];
      tskRows.push([
        tsk.id || "",
        tsk.title || "",
        tsk.department || "",
        tsk.assignedStaffName || "",
        tsk.dueDate || "",
        tsk.progress || 0,
        tsk.description || ""
      ]);
    }
    if (tskRows.length > 0) {
      tskSheet.getRange(2, 1, tskRows.length, 7).setValues(tskRows);
    }
  }

  // --- Meetings Sheet ---
  if (data.meetings && Array.isArray(data.meetings) && data.meetings.length > 0) {
    var meetSheet = ss.getSheetByName("Meetings");
    if (!meetSheet) {
      meetSheet = ss.insertSheet("Meetings");
    }
    meetSheet.clear();
    meetSheet.appendRow([
      "රැස්වීම් අංකය (ID)",
      "ශීර්ෂය (Title)",
      "දිනය (Date)",
      "වේලාව (Time)",
      "මූලාසනය (Chair)",
      "ස්ථානය (Venue)",
      "න්‍යාය පත්‍රය (Agenda)"
    ]);
    meetSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#7c3aed").setFontColor("#ffffff");
    meetSheet.setFrozenRows(1);

    var meetRows = [];
    for (var m = 0; m < data.meetings.length; m++) {
      var mt = data.meetings[m];
      meetRows.push([
        mt.id || "",
        mt.title || "",
        mt.date || "",
        mt.time || "",
        mt.chair || "",
        mt.venue || "",
        mt.agenda || ""
      ]);
    }
    if (meetRows.length > 0) {
      meetSheet.getRange(2, 1, meetRows.length, 7).setValues(meetRows);
    }
  }
}
