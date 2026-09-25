// Bilingual Translations Dictionary for Galapitiyagama Sanasa HRMS
const translations = {
  si: {
    appTitle: "ගලපිටියාගම සණස සමුපකාර සමිතිය",
    appSubtitle: "මානව සම්පත් කළමනාකරණ පරිගණක පද්ධතිය (HRMS)",
    roleChairman: "ගරු සභාපති හා අධ්‍යක්ෂ මණ්ඩල ද්වාරය",
    roleHR: "මානව සම්පත් කළමනාකරු",
    roleEmployee: "සේවක ස්වයං සේවා ද්වාරය",
    
    // Nav items
    navDashboard: "ප්‍රධාන පාලක පුවරුව",
    navEmployees: "සේවක නාමාවලිය සහ පැතිකඩ",
    navSkills: "නිපුණතා, පුහුණු හා ස්මාර්ට් රාජකාරි අනුයුක්තය",
    navGrievance: "සභාපති/අධ්‍යක්ෂ මණ්ඩල QR ගැටළු ද්වාරය",
    navMemberFeedback: "සාමාජික අදහස් විමසීම් QR ද්වාරය",
    navPayroll: "වැටුප්, EPF/ETF හා පඩිපත්",
    navAppraisal: "කාර්යසාධන ඇගයීම් සහ ලකුණු",
    navSatisfaction: "සේවක තෘප්තිමත්භාවය හා සමීක්ෂණ",
    navPosters: "මුද්‍රණය කළ හැකි QR පෝස්ටර්",
    navBackup: "දත්ත උපස්ථ හා සැකසුම්",

    // Dashboard
    statsEmployees: "මුළු සේවක සංඛ්‍යාව",
    statsPermanent: "ස්ථිර කාර්ය මණ්ඩලය",
    statsPendingGrievances: "විසඳීමට ඇති ගැටළු/යෝජනා",
    statsMemberRating: "සාමාජික තෘප්තිමත් දර්ශකය",
    statsTotalEpfEtf: "මාසික EPF/ETF දායකත්වය",
    recentGrievancesTitle: "ගරු සභාපති හා අධ්‍යක්ෂ මණ්ඩලය වෙත ආ නව ගැටළු හා යෝජනා",
    memberFeedbackTitle: "මෑතකදී ලැබුණු සාමාජික අදහස්",
    skillsOverviewTitle: "ආයතනික නිපුණතා හා පුහුණු සංවර්ධනය (Skills Matrix)",
    deptDistributionTitle: "අංශ අනුව සේවක ව්‍යාප්තිය",

    // Employees
    btnNewEmployee: "+ නව සේවකයෙකු ලියාපදිංචි කිරීම",
    searchPlaceholder: "නම, සේවක අංකය හෝ තනතුර අනුව සොයන්න...",
    filterAllBranches: "සියලු ශාඛා",
    filterMainBranch: "ප්‍රධාන කාර්යාලය",
    filterNorthBranch: "උතුර ශාඛාව",
    filterSouthBranch: "දකුණ ශාඛාව",
    colEmpId: "සේවක අංකය",
    colName: "සම්පූර්ණ නම",
    colDesignation: "තනතුර",
    colBranch: "ශාඛාව",
    colPhone: "දුරකථන අංකය",
    colType: "සේවා තත්වය",
    colActions: "ක්‍රියාමාර්ග",
    btnViewProfile: "පැතිකඩ බලන්න",
    btnEdit: "සංස්කරණය",
    btnDelete: "ඉවත් කරන්න",

    // Skills Matrix & Training Needs Analysis (TNA)
    skillsMatrixTitle: "නිපුණතා කළමනාකරණය, පුහුණු අවශ්‍යතා හා ස්මාර්ට් රාජකාරි අනුයුක්තය",
    skillsMatrixDesc: "සේවක නිපුණතා ඇගයීම (1-5), පුහුණු අවශ්‍යතා හඳුනා ගැනීම (TNA) සහ AI පදනම් කරගත් ස්මාර්ට් රාජකාරි ගැළපීම",
    smartAllocatorTitle: "බුද්ධිමත් රාජකාරි අනුයුක්ත යෝජකය (Smart Task Allocator)",
    smartAllocatorDesc: "විශේෂිත ව්‍යාපෘතියක් හෝ රාජකාරියක් සඳහා අවශ්‍ය නිපුණතාවන්ට වඩාත්ම ගැළපෙන සේවකයින් ස්වයංක්‍රීයව ශ්‍රේණිගත කර හඳුනාගන්න.",
    selectTaskLabel: "රාජකාරිය / ව්‍යාපෘතිය තෝරන්න:",
    matchScore: "ගැළපීමේ ප්‍රතිශතය",
    btnAssignTask: "රාජකාරිය අනුයුක්ත කරන්න",

    // Grievance / Suggestion
    grievanceHeader: "සේවක ගැටළු, දුක්ගැනවිලි හා නව සංවර්ධන යෝජනා QR පද්ධතිය",
    grievanceSub: "සේවකයින්ට නාමිකව හෝ සම්පූර්ණයෙන්ම නිර්නාමිකව (Anonymous) ගරු සභාපතිතුමා හා අධ්‍යක්ෂ මණ්ඩලය වෙත සෘජුවම යොමු කළ හැක.",
    qrStaffNotice: "කාර්යාලයේ දැන්වීම් පුවරුවේ හෝ සේවක මේස මත ප්‍රදර්ශනය කළ හැකි සුවිශේෂී QR කේතය",
    btnScanSimulate: "📱 ජංගම දුරකථන පෝරමය විවෘත කරන්න",
    btnPrintPoster: "🖨️ QR දැන්වීම් පත්‍රිකාව මුද්‍රණය කරන්න",
    grievanceListTitle: "සභාපති හා අධ්‍යක්ෂ මණ්ඩල සමාලෝචන ලේඛනය",
    btnUpdateStatus: "තත්වය යාවත්කාලීන කරන්න",

    // Member Feedback
    memberFeedbackHeader: "සාමාජික අදහස් විමසීමේ QR පද්ධතිය (Member Feedback)",
    memberFeedbackSub: "සමුපකාර සමිතියේ සාමාජික සාමාජිකාවන්ට සහ ගනුදෙනුකරුවන්ට සේවාව පිළිබඳ තම අදහස්, යෝජනා හා ඇගයීම් සභාපතිතුමා වෙත සෘජුව යොමුකිරීමේ පහසුකම.",
    qrMemberNotice: "ශාඛා කවුන්ටර, පොරොත්තු ශාලා සහ සමිති පුවරු සඳහා QR පෝස්ටරය",
    memberRatingAvg: "සාමාන්‍ය සාමාජික තෘප්තිමත් අගය",
    csatSpeed: "සේවා වේගය",
    csatFriendliness: "කාර්ය මණ්ඩල සුහදශීලීත්වය",
    csatLoan: "ණය පහසුකම් කාර්යක්ෂමතාව",
    csatCleanliness: "පරිශ්‍ර පිරිසිදුකම",

    // Payroll & EPF/ETF
    payrollHeader: "මාසික වැටුප්, EPF/ETF හා පඩිපත් ගණනය කිරීම්",
    payrollSub: "ශ්‍රී ලංකා කම්කරු නීතියට හා සමුපකාර චක්‍රලේඛවලට අනුකූලව 8% සේවක EPF, 12% සේවායෝජක EPF, 3% ETF සහ අරමුදල් ගණනය කිරීම.",
    selectMonth: "වැටුප් මාසය තෝරන්න:",
    btnProcessPayroll: "මාසික වැටුප් ගණනය කරන්න",
    btnPrintAllSlips: "සියලු පඩිපත් මුද්‍රණය කරන්න",
    basicSalary: "මූලික වැටුප",
    braAllowance: "අයවැය සහන දීමනාව (BRA)",
    grossSalary: "මුළු වැටුප (Gross Earnings)",
    epfEmployee: "සේවක EPF (8%)",
    epfEmployer: "සේවායෝජක EPF (12%)",
    etfEmployer: "සේවායෝජක ETF (3%)",
    totalDeductions: "මුළු අඩු කිරීම්",
    netSalary: "ශුද්ධ වැටුප (Net Pay)",
    btnViewPayslip: "නිල පඩිපත (Payslip)",

    // Performance Appraisal
    appraisalHeader: "සේවක කාර්යසාධන ඇගයීම් සහ ලකුණු මට්ටම් (Performance Appraisals)",
    appraisalSub: "රාජකාරි කාර්යක්ෂමතාව, සාමාජික සත්කාරය, කණ්ඩායම් හැඟීම, මුදල් විනය සහ ඉලක්ක ජයගැනීම පදනම් කරගත් විධිමත් වාර්ෂික ඇගයීම්.",
    btnNewAppraisal: "+ නව කාර්යසාධන ඇගයීමක් ඇතුළත් කරන්න",
    gradeA: "Grade A - විශිෂ්ටයි (85 - 100%)",
    gradeB: "Grade B - ඉතා හොඳයි (70 - 84%)",
    gradeC: "Grade C - සතුටුදායකයි (50 - 69%)",
    gradeD: "Grade D - වැඩිදියුණු විය යුතුයි (<50%)",

    // Satisfaction
    satisfactionHeader: "සේවක තෘප්තිමත්භාවය සහ ආයතනික සුවතාවය මැන බැලීමේ ඩිජිටල් පෝරම",
    satisfactionSub: "සේවකයන්ගේ සතුට, වැඩ පරිසරය, කළමනාකාරීත්ව සබඳතා සහ ගැටළු විශ්ලේෂණය කර වඩාත් තෘප්තිමත් සේවා පරිසරයක් ගොඩනැගීම.",
    btnFillSurvey: "+ නව සේවක තෘප්තිමත් සමීක්ෂණයක් පුරවන්න",
    satisfactionIndex: "සේවක තෘප්තිමත් දර්ශකය (ESI)",

    // Generic
    save: "සුරකින්න",
    cancel: "අවලංගු කරන්න",
    close: "වසන්න",
    print: "මුද්‍රණය කරන්න",
    exportCsv: "Excel/CSV ලෙස බාගන්න",
    statusNew: "නව",
    statusReview: "සලකා බලමින්",
    statusResolved: "විසඳුම් ලබාදුන්",
    statusInProgress: "ක්‍රියාත්මක කරමින්",
    networkNotice: "ජංගම දුරකථන QR ස්කෑන් කිරීම සඳහා ඔබගේ පරිගණකය සහ දුරකථනය එකම Wi-Fi ජාලයට සම්බන්ධ කර තිබිය හැක."
  },
  en: {
    appTitle: "Galapitiyagama Sanasa Cooperative Society Ltd",
    appSubtitle: "Human Resource Management System (HRMS)",
    roleChairman: "Hon. Chairman & Board Portal",
    roleHR: "HR & Operations Manager",
    roleEmployee: "Employee Self-Service Portal",

    // Nav items
    navDashboard: "Executive Dashboard",
    navEmployees: "Employee Profiles & Records",
    navSkills: "Competency Management, Training & Smart Allocation",
    navGrievance: "Chairman/Board QR Grievance Portal",
    navMemberFeedback: "Member Feedback QR Portal",
    navPayroll: "Payroll, EPF/ETF & Payslips",
    navAppraisal: "Performance Appraisals & KPIs",
    navSatisfaction: "Employee Satisfaction & Wellbeing",
    navPosters: "Printable QR Posters",
    navBackup: "Data Backup & Settings",

    // Dashboard
    statsEmployees: "Total Workforce",
    statsPermanent: "Permanent Staff",
    statsPendingGrievances: "Pending Grievances/Ideas",
    statsMemberRating: "Member CSAT Rating",
    statsTotalEpfEtf: "Monthly EPF/ETF Obligations",
    recentGrievancesTitle: "Recent Grievances & Proposals to Chairman / Board",
    memberFeedbackTitle: "Recent Member & Public Feedbacks",
    skillsOverviewTitle: "Competency & Training Readiness Matrix",
    deptDistributionTitle: "Departmental Staff Distribution",

    // Employees
    btnNewEmployee: "+ Register New Employee",
    searchPlaceholder: "Search by Name, Staff ID, Designation...",
    filterAllBranches: "All Branches",
    filterMainBranch: "Main Office",
    filterNorthBranch: "North Branch",
    filterSouthBranch: "South Branch",
    colEmpId: "Staff ID",
    colName: "Full Name",
    colDesignation: "Designation",
    colBranch: "Branch",
    colPhone: "Contact",
    colType: "Status",
    colActions: "Actions",
    btnViewProfile: "View Profile",
    btnEdit: "Edit",
    btnDelete: "Delete",

    // Skills Matrix & Training Needs Analysis (TNA)
    skillsMatrixTitle: "Competency Management, Training Needs (TNA) & Smart Allocation",
    skillsMatrixDesc: "Employee competency evaluations (1-5), Training Needs Analysis (TNA) & AI-driven Smart Duty Matching",
    smartAllocatorTitle: "Smart Task & Duty Allocation Engine",
    smartAllocatorDesc: "Automatically matches project and operational duty requirements with the best-fit employees based on skills proficiency.",
    selectTaskLabel: "Select Task / Project Requirement:",
    matchScore: "Competency Match",
    btnAssignTask: "Assign Responsibility",

    // Grievance / Suggestion
    grievanceHeader: "Dedicated QR Grievance & Suggestion Portal for Chairman & Board",
    grievanceSub: "Empowering staff to submit concerns, grievances, and growth proposals either Nominally or 100% Anonymously directly to the Board.",
    qrStaffNotice: "High-resolution workplace QR code for staff notice boards, tables, and canteen",
    btnScanSimulate: "📱 Open Mobile Submission Portal",
    btnPrintPoster: "🖨️ Print QR Notice Poster",
    grievanceListTitle: "Board of Directors & Chairman Review Register",
    btnUpdateStatus: "Update Resolution Status",

    // Member Feedback
    memberFeedbackHeader: "Member & Customer Online QR Feedback System",
    memberFeedbackSub: "Enables cooperative members to share their service experience, suggestions, and complaints directly with the Chairman.",
    qrMemberNotice: "Printable QR standee for branch counters, customer lounges, and passbooks",
    memberRatingAvg: "Average Member Satisfaction Score",
    csatSpeed: "Speed of Service",
    csatFriendliness: "Staff Friendliness",
    csatLoan: "Loan Processing Ease",
    csatCleanliness: "Premises & Cleanliness",

    // Payroll & EPF/ETF
    payrollHeader: "Monthly Payroll, EPF/ETF & Fund Computations",
    payrollSub: "Compliant with Sri Lanka Cooperative & Labour standards: 8% Employee EPF, 12% Employer EPF, 3% ETF & Welfare fund.",
    selectMonth: "Select Payroll Month:",
    btnProcessPayroll: "Process Monthly Payroll",
    btnPrintAllSlips: "Print All Payslips",
    basicSalary: "Basic Salary",
    braAllowance: "Budgetary Relief Allowance (BRA)",
    grossSalary: "Gross Earnings",
    epfEmployee: "Employee EPF (8%)",
    epfEmployer: "Employer EPF (12%)",
    etfEmployer: "Employer ETF (3%)",
    totalDeductions: "Total Deductions",
    netSalary: "Net Salary Payable",
    btnViewPayslip: "Official Payslip",

    // Performance Appraisal
    appraisalHeader: "Performance Appraisal & Evaluation Matrix",
    appraisalSub: "Structured appraisal scoring across accuracy, member care, punctuality, teamwork, and business target achievement.",
    btnNewAppraisal: "+ Conduct New Performance Appraisal",
    gradeA: "Grade A - Excellent (85 - 100%)",
    gradeB: "Grade B - Very Good (70 - 84%)",
    gradeC: "Grade C - Satisfactory (50 - 69%)",
    gradeD: "Grade D - Needs Improvement (<50%)",

    // Satisfaction
    satisfactionHeader: "Employee Satisfaction & Institutional Wellbeing Surveys",
    satisfactionSub: "Digital surveys measuring work environment, managerial support, fairness, and professional growth.",
    btnFillSurvey: "+ Complete Employee Satisfaction Survey",
    satisfactionIndex: "Employee Satisfaction Index (ESI)",

    // Generic
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    print: "Print",
    exportCsv: "Export CSV / Excel",
    statusNew: "New",
    statusReview: "Under Review",
    statusResolved: "Resolved",
    statusInProgress: "In Progress",
    networkNotice: "For mobile QR code scanning, connect both your phone and PC to the same Wi-Fi network."
  }
};
