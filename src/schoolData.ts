export interface Student {
  id: string; // ID-XXXX
  name: string;
  grade: string;
  section: string; // 'A', 'B', 'C'
  gender: 'Male' | 'Female';
  registeredBy: string;
  timestamp: string;
  parentEmail?: string; // Parent account email
  age?: number; // Student age
}

export interface Teacher {
  id: string; // TCH-XXXX
  name: string;
  gender?: 'Male' | 'Female'; // Teacher gender
  age?: number; // Teacher age
  educationLevel: string; // e.g. Diploma, Degree, Masters
  phone: string;
  email?: string; // e.g. teacher@school.com
  subjects: string[]; // e.g. ['Math', 'English']
  assignedClass: string; // e.g. 'Grade 8'
  assignedSection: string; // e.g. 'A'
  isHomeroomTeacher: boolean;
  registeredBy: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'Parents' | 'Teachers' | 'Both';
  postedBy: string;
  timestamp: string;
}

export interface ClassSetup {
  id: string;
  grade: string; // e.g. Grade 8
  section: string; // e.g. A
  stream: string; // e.g. General, Natural Science, Social Science
  subjects: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subject: string; // e.g. Mathematics, English, etc.
  quiz: number; // max 10
  cw: number;   // max 10 (Classwork)
  hw: number;   // max 10 (Homework)
  mid: number;  // max 20
  final: number;// max 50
  total: number;// percentage sum
  teacher: string;
  timestamp: string;
  term?: number; // 1, 2, 3, or 4
  isApproved?: boolean;
}

export interface DefectDetail {
  id: string;
  titleAmh: string;
  titleEng: string;
  severity: 'Critical' | 'Medium' | 'Low';
  descriptionAmh: string;
  descriptionEng: string;
  buggyCode: string;
  fixedCode: string;
  explanationAmh: string;
}

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'ID-4021',
    name: 'ዮናስ ካሳሁን',
    grade: 'Grade 8',
    section: 'A',
    gender: 'Male',
    registeredBy: 'principal@school.com',
    timestamp: '2026-06-28T09:00:00.000Z',
    parentEmail: 'yonas_parent@school.com'
  },
  {
    id: 'ID-1082',
    name: 'ሂወት ገበያ',
    grade: 'Grade 7',
    section: 'B',
    gender: 'Female',
    registeredBy: 'principal@school.com',
    timestamp: '2026-06-29T10:30:00.000Z',
    parentEmail: 'hiwot_parent@school.com'
  },
  {
    id: 'ID-8843',
    name: 'አቤል ተስፋዬ',
    grade: 'Grade 8',
    section: 'A',
    gender: 'Male',
    registeredBy: 'principal@school.com',
    timestamp: '2026-06-30T08:15:00.000Z',
    parentEmail: 'abel_parent@school.com'
  },
  {
    id: 'ID-5531',
    name: 'ሰላማዊት ደምሴ',
    grade: 'Grade 6',
    section: 'A',
    gender: 'Female',
    registeredBy: 'principal@school.com',
    timestamp: '2026-07-01T14:20:00.000Z',
    parentEmail: 'parent@school.com'
  },
  {
    id: 'ID-9011',
    name: 'በረከት አስማረ',
    grade: 'Grade 8',
    section: 'B',
    gender: 'Male',
    registeredBy: 'principal@school.com',
    timestamp: '2026-07-01T15:00:00.000Z',
    parentEmail: 'bereket_parent@school.com'
  },
  {
    id: 'ID-3245',
    name: 'ሊዲያ ዮሐንስ',
    grade: 'Grade 8',
    section: 'A',
    gender: 'Female',
    registeredBy: 'principal@school.com',
    timestamp: '2026-07-01T16:10:00.000Z',
    parentEmail: 'lidya_parent@school.com'
  },
  {
    id: 'ID-9901',
    name: 'ዮሴፍ አልማዝ',
    grade: 'Grade 10',
    section: 'A',
    gender: 'Male',
    registeredBy: 'principal@school.com',
    timestamp: '2026-07-01T16:20:00.000Z',
    parentEmail: 'yosef_parent@school.com'
  },
  {
    id: 'ID-9902',
    name: 'ሰብለወንጌል ተሾመ',
    grade: 'Grade 12',
    section: 'B',
    gender: 'Female',
    registeredBy: 'principal@school.com',
    timestamp: '2026-07-01T16:30:00.000Z',
    parentEmail: 'seble_parent@school.com'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'TCH-1021',
    name: 'ግርማ በቀለ',
    educationLevel: 'Degree',
    phone: '0911223344',
    email: 'teacher@school.com',
    subjects: ['Mathematics', 'Physics'],
    assignedClass: 'Grade 8',
    assignedSection: 'A',
    isHomeroomTeacher: true,
    registeredBy: 'principal@school.com',
    timestamp: '2026-06-20T08:00:00.000Z'
  },
  {
    id: 'TCH-5542',
    name: 'ዘነበች አበራ',
    educationLevel: 'Masters',
    phone: '0912345678',
    email: 'teacher2@school.com',
    subjects: ['English', 'Amharic'],
    assignedClass: 'Grade 7',
    assignedSection: 'B',
    isHomeroomTeacher: false,
    registeredBy: 'principal@school.com',
    timestamp: '2026-06-22T09:30:00.000Z'
  },
  {
    id: 'TCH-9901',
    name: 'ኃይሌ ወልደጻድቅ',
    educationLevel: 'PhD',
    phone: '0911556677',
    email: 'teacher3@school.com',
    subjects: ['Mathematics', 'English'],
    assignedClass: 'Grade 10',
    assignedSection: 'A',
    isHomeroomTeacher: true,
    registeredBy: 'principal@school.com',
    timestamp: '2026-06-23T10:00:00.000Z'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'የወላጆች ስብሰባ ጥሪ (Parents Meeting)',
    content: 'የፊታችን እሁድ ሰኔ 28 ቀን ከጠዋቱ 2:30 ጀምሮ ጠቅላላ የወላጆች ስብሰባ በትምህርት ቤቱ አዳራሽ ስለሚካሄድ ወላጆች ሳይረፍዱ እንዲገኙ እናሳስባለን።',
    target: 'Parents',
    postedBy: 'principal@school.com',
    timestamp: '2026-06-25T11:00:00.000Z'
  },
  {
    id: 'ann-2',
    title: 'የፈተና ወረቀት አረምና ማርክ ሰብሚሽን (Grade Submission Deadline)',
    content: 'የመምህራን በሙሉ፡ የ2ኛው ኩዋርተር ማጠቃለያ ፈተና ውጤት እስከ ሐምሌ 5 ቀን ድረስ በሲስተሙ ላይ መሞላት እንዳለበት እናሳስባለን።',
    target: 'Teachers',
    postedBy: 'principal@school.com',
    timestamp: '2026-06-26T14:00:00.000Z'
  }
];

export const INITIAL_CLASSES: ClassSetup[] = [
  {
    id: 'cls-1',
    grade: 'Grade 8',
    section: 'A',
    stream: 'General',
    subjects: ['Mathematics', 'English', 'Amharic', 'Science', 'Social Studies']
  },
  {
    id: 'cls-2',
    grade: 'Grade 8',
    section: 'B',
    stream: 'General',
    subjects: ['Mathematics', 'English', 'Amharic', 'Science', 'Social Studies']
  },
  {
    id: 'cls-3',
    grade: 'Grade 7',
    section: 'A',
    stream: 'General',
    subjects: ['Mathematics', 'English', 'Amharic', 'Science']
  },
  {
    id: 'cls-4',
    grade: 'Grade 7',
    section: 'B',
    stream: 'General',
    subjects: ['Mathematics', 'English', 'Amharic', 'Science']
  },
  {
    id: 'cls-5',
    grade: 'Grade 10',
    section: 'A',
    stream: 'Natural Science',
    subjects: ['Mathematics', 'English', 'Amharic', 'Science']
  },
  {
    id: 'cls-6',
    grade: 'Grade 12',
    section: 'B',
    stream: 'Social Science',
    subjects: ['Mathematics', 'English', 'Amharic', 'Social Studies']
  }
];

export const INITIAL_GRADES: Grade[] = [
  {
    id: 'g-1',
    studentId: 'ID-4021',
    studentName: 'ዮናስ ካሳሁን',
    subject: 'Mathematics',
    quiz: 8,
    cw: 9,
    hw: 7,
    mid: 16,
    final: 42,
    total: 82,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-01T11:00:00.000Z'
  },
  {
    id: 'g-1-2',
    studentId: 'ID-4021',
    studentName: 'ዮናስ ካሳሁን',
    subject: 'English',
    quiz: 9,
    cw: 8,
    hw: 9,
    mid: 15,
    final: 40,
    total: 81,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-01T11:30:00.000Z'
  },
  {
    id: 'g-2',
    studentId: 'ID-1082',
    studentName: 'ሂወት ገበያ',
    subject: 'Mathematics',
    quiz: 9,
    cw: 8,
    hw: 9,
    mid: 18,
    final: 45,
    total: 89,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-02T09:30:00.000Z'
  },
  {
    id: 'g-2-2',
    studentId: 'ID-1082',
    studentName: 'ሂወት ገበያ',
    subject: 'English',
    quiz: 10,
    cw: 9,
    hw: 8,
    mid: 17,
    final: 44,
    total: 88,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-02T09:45:00.000Z'
  },
  {
    id: 'g-3',
    studentId: 'ID-8843',
    studentName: 'አቤል ተስፋዬ',
    subject: 'Mathematics',
    quiz: 6,
    cw: 7,
    hw: 8,
    mid: 14,
    final: 38,
    total: 73,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-02T10:00:00.000Z'
  },
  {
    id: 'g-3-2',
    studentId: 'ID-8843',
    studentName: 'አቤል ተስፋዬ',
    subject: 'English',
    quiz: 7,
    cw: 8,
    hw: 7,
    mid: 13,
    final: 35,
    total: 70,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-02T10:15:00.000Z'
  },
  {
    id: 'g-4',
    studentId: 'ID-3245',
    studentName: 'ሊዲያ ዮሐንስ',
    subject: 'Mathematics',
    quiz: 10,
    cw: 10,
    hw: 9,
    mid: 19,
    final: 48,
    total: 96,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-02T11:15:00.000Z'
  },
  {
    id: 'g-4-2',
    studentId: 'ID-3245',
    studentName: 'ሊዲያ ዮሐንስ',
    subject: 'English',
    quiz: 9,
    cw: 10,
    hw: 10,
    mid: 18,
    final: 46,
    total: 93,
    teacher: 'teacher@school.com',
    timestamp: '2026-07-02T11:30:00.000Z'
  },
  {
    id: 'g-5-1',
    studentId: 'ID-9901',
    studentName: 'ዮሴፍ አልማዝ',
    subject: 'Mathematics',
    quiz: 9,
    cw: 8,
    hw: 9,
    mid: 16,
    final: 43,
    total: 85,
    teacher: 'teacher3@school.com',
    timestamp: '2026-07-02T11:40:00.000Z'
  },
  {
    id: 'g-5-2',
    studentId: 'ID-9901',
    studentName: 'ዮሴፍ አልማዝ',
    subject: 'English',
    quiz: 8,
    cw: 9,
    hw: 7,
    mid: 15,
    final: 39,
    total: 78,
    teacher: 'teacher3@school.com',
    timestamp: '2026-07-02T11:45:00.000Z'
  },
  {
    id: 'g-6-1',
    studentId: 'ID-9902',
    studentName: 'ሰብለወንጌል ተሾመ',
    subject: 'Mathematics',
    quiz: 10,
    cw: 9,
    hw: 9,
    mid: 18,
    final: 44,
    total: 90,
    teacher: 'teacher3@school.com',
    timestamp: '2026-07-02T11:50:00.000Z'
  },
  {
    id: 'g-6-2',
    studentId: 'ID-9902',
    studentName: 'ሰብለወንጌል ተሾመ',
    subject: 'English',
    quiz: 9,
    cw: 9,
    hw: 10,
    mid: 17,
    final: 42,
    total: 87,
    teacher: 'teacher3@school.com',
    timestamp: '2026-07-02T11:55:00.000Z'
  }
];

export const DEFECTS_REPORT: DefectDetail[] = [
  {
    id: 'defect-1',
    titleAmh: 'የተማሪ ስም ፍለጋ ስህተት (Data Association Flaw)',
    titleEng: 'Vulnerability in Student Grade Lookup',
    severity: 'Critical',
    descriptionAmh: 'በዋናው ኮድ ውስጥ የተማሪ ውጤት የሚቀመጠውና የሚፈለገው በስም (studentName) አማካኝነት ነው። አስተማሪው በስህተት አንድ ፊደል ቢያሳስት ወይም ተመሳሳይ ስም ያላቸው ተማሪዎች ቢኖሩ ወላጆች የተሳሳተ ውጤት ያያሉ ወይም ውጤቱ በጭራሽ አይገኝም።',
    descriptionEng: 'In the original code, grades are saved and queried using the raw "studentName" string. If a teacher misspells a name or if multiple students share the same name, parent queries will fail or load the wrong student\'s details.',
    buggyCode: `// Saving grade with name
db.ref('Grades').push({
    studentName, // Only name, no unique ID linked
    ...
});

// Querying grade by name in search
db.ref('Grades').orderByChild('studentName').equalTo(student.name).once('value', ...)`,
    fixedCode: `// Linking by unique studentId
db.ref('Grades').push({
    studentId: student.id, // Linked with unique ID
    studentName: student.name,
    ...
});

// Querying using unique ID
db.ref('Grades').orderByChild('studentId').equalTo(student.id).once('value', ...)`,
    explanationAmh: 'መፍትሄ፡ እያንዳንዱን ውጤት ከተማሪው ልዩ መታወቂያ (studentId/ID-XXXX) ጋር ማገናኘት እና ፍለጋውን በስም ፈንታ በልዩ መታወቂያው ማካሄድ።'
  },
  {
    id: 'defect-2',
    titleAmh: 'አሉታዊ ቁጥሮች ማረጋገጫ አለመኖር (Negative Score Bypass)',
    titleEng: 'Missing Input Range Validation',
    severity: 'Critical',
    descriptionAmh: 'ውጤት በሚሞላበት ጊዜ ኮዱ ከፍተኛውን ገደብ (max value) ብቻ ያረጋግጣል፤ ነገር ግን ውጤቱ ከዜሮ በታች (ለምሳሌ -15) እንዳይሆን አይከለክልም። ይህም ተማሪው አሉታዊ ድምር ውጤት እንዲኖረው ሊያደርግ ይችላል።',
    descriptionEng: 'The score registration code checks if values exceed their maximum limits, but totally ignores negative values (e.g., entering -20 for a midterm exam), causing corrupted grade totals.',
    buggyCode: `// Buggy limit check: ignores negative values
if (quiz > 10 || cw > 10 || hw > 10 || mid > 20 || final > 50) {
    alert('❌ Scores exceed maximum');
    return;
}`,
    fixedCode: `// Improved strict range validation
const isInvalid = (val, max) => val < 0 || val > max || isNaN(val);

if (isInvalid(quiz, 10) || isInvalid(cw, 10) || isInvalid(hw, 10) || 
    isInvalid(mid, 20) || isInvalid(final, 50)) {
    alert('❌ ስህተት፡ እባክዎን ከ 0 በታች ወይም ከከፍተኛው ገደብ በላይ ውጤት አይሙሉ።');
    return;
}`,
    explanationAmh: 'መፍትሄ፡ እያንዳንዱ ውጤት ከ 0 ያላነሰ እና ከሚፈቀደው ከፍተኛ ነጥብ ያልበለጠ መሆኑን የሚያረጋግጥ የተሟላ የማጣሪያ ተግባር (isValid) መተግበር።'
  },
  {
    id: 'defect-3',
    titleAmh: 'የFirebase ውሂብ ጠቋሚ ጠፋት (Missing Database Indexes)',
    titleEng: 'Database Performance & Cost Warning',
    severity: 'Medium',
    descriptionAmh: 'በFirebase Realtime Database ውስጥ orderByChild() ስንጠቀም በባክኤንድ ህጎች (Database Rules) ላይ ኢንዴክስ (.indexOn) ካልተገለጸ Firebase ሙሉ ውሂቡን ወደ ተጠቃሚው ስልክ አውርዶ ይመርምራል። ይህም ውሂቡ ሲበዛ ሲስተሙን በጣም ያዘገየዋል፣ የኢንተርኔት ፍጆታንም ያባክናል።',
    descriptionEng: 'Querying Firebase collections using orderByChild WITHOUT declaring indexes inside Firebase Rules causes massive performance issues and high bandwidth costs, as Firebase is forced to download the entire database and filter on the client-side.',
    buggyCode: `// Queries used in client without indexes configured
db.ref('Grades').orderByChild('teacher').equalTo(...)
db.ref('Students').orderByChild('id').equalTo(...)`,
    fixedCode: `// Add this to your Firebase Realtime Database rules:
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "Students": {
      ".indexOn": ["id"]
    },
    "Grades": {
      ".indexOn": ["studentId", "teacher"]
    }
  }
}`,
    explanationAmh: 'መፍትሄ፡ በFirebase ኮንሶል Database Rules ውስጥ ለ "Students" (በ "id") እና ለ "Grades" (በ "studentId" እና "teacher") ኢንዴክሶችን መግለጽ።'
  },
  {
    id: 'defect-4',
    titleAmh: 'የደህንነት ክፍተት እና የደንበኛ-ወገን ቁጥጥር (Client-Side Role Spoofing)',
    titleEng: 'Security Risk of Client-Side Authorization',
    severity: 'Critical',
    descriptionAmh: 'የተጠቃሚው የስራ ድርሻ (Role) የሚመረመረው በብሮውዘር በኩል ብቻ ነው። ማንኛውም ተንኮለኛ ተጠቃሚ የብሮውዘር ኮንሶል በመክፈት currentRole = "principal" ወይም showDashboard() በማለት ብቻ ሁሉንም የተማሪዎችና የውጤት መረጃዎች ማየትና ማጥፋት ይችላል።',
    descriptionEng: 'Authentication checks are done fully on the client-side. An attacker can open the Developer Console, modify the "currentRole" global variable, or directly call "showDashboard()" to bypass the entire login screen.',
    buggyCode: `// Client-side local variables can be easily spoofed in Console
let currentUser = null;
let currentRole = null;

function showDashboard() {
    // Shows dashboards without backend validation...
}`,
    fixedCode: `// Configure secure Firebase Security Rules in backend:
{
  "rules": {
    "Grades": {
      // Only teachers can write grades
      ".write": "root.child('UserRoles/' + auth.uid).child('role').val() === 'teacher'",
      ".read": "auth != null"
    },
    "Students": {
      // Only principal can register students
      ".write": "root.child('UserRoles/' + auth.uid).child('role').val() === 'principal'",
      ".read": "auth != null"
    }
  }
}`,
    explanationAmh: 'መፍትሄ፡ የስራ ድርሻን (Authorization) በብሮውዘር ብቻ ሳይሆን በFirebase Security Rules በኩል በባክኤንድ ማረጋገጥና መገደብ።'
  }
];
