/**
 * =========================================================================
 * ගලපිටියාගම සණස සමුපකාර සමිතිය - Smart HRMS Google Cloud Sync Script
 * Galapitiyagama Sanasa Cooperative Society Ltd - Cloud Webhook & API
 * =========================================================================
 * 
 * මෙම Code එක Google Apps Script එකට Copy & Paste කර "Deploy as Web App" කරන්න.
 * එවිට QR Code එකෙන් Phone එකෙන් යවන සියලුම Grievance සහ Member Feedback
 * සෘජුවම ඔබගේ Google Sheet එකට සහ HRMS Dashboard එකට Realtime එකතු වේ.
 */

// 1. Phone එකෙන් Submit කරන විට දත්ත Google Sheet එකට එකතු කිරීම
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var contents;
    if (e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else {
      contents = JSON.parse(e.parameter.data || "{}");
    }

    var type = contents.type;
    var data = contents.data;

    // සභාපති හා අධ්‍යක්ෂ මණ්ඩල QR ගැටළු සහ යෝජනා (Grievances)
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

      grvSheet.appendRow([
        data.id || ("GRV-2026-" + Math.floor(100 + Math.random() * 900)),
        data.timestamp || Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm"),
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

      return ContentService.createTextOutput(JSON.stringify({ status: "success", type: "grievance", id: data.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // සාමාජික අදහස් විමසීම් (Member Feedback)
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

      fbSheet.appendRow([
        data.id || ("MFB-2026-" + Math.floor(100 + Math.random() * 900)),
        data.timestamp || Utilities.formatDate(new Date(), "Asia/Colombo", "yyyy-MM-dd HH:mm"),
        data.memberName || "සමුපකාර සාමාජික",
        data.memberNo || "",
        data.branch || "ප්‍රධාන කාර්යාලය",
        data.phone || "",
        data.overallRating || 5,
        data.feedbackType || "",
        data.comments || "",
        data.status || "නව (New)"
      ]);

      return ContentService.createTextOutput(JSON.stringify({ status: "success", type: "member_feedback", id: data.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. HRMS Dashboard එකට Google Sheet එකේ ඇති දත්ත කියවා Realtime යැවීම
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // Grievances කියවීම
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

    // Member Feedback කියවීම
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

    var output = ContentService.createTextOutput(JSON.stringify({
      status: "success",
      organization: "Galapitiyagama Sanasa Cooperative Society Ltd",
      grievances: grievances,
      memberFeedbacks: feedbacks,
      totalGrievances: grievances.length,
      totalFeedbacks: feedbacks.length,
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
