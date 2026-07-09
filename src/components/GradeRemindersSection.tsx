import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Send, AlertTriangle, CheckCircle, Clock, Info, Search, Filter, Users, BookOpen, Loader2, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { ParentNotificationService, SimulatedEmail } from '../lib/notificationService';
import { Student, Grade, ClassSetup } from '../schoolData';
import { motion, AnimatePresence } from 'motion/react';

interface GradeRemindersSectionProps {
  students: Student[];
  grades: Grade[];
  classes: ClassSetup[];
  schoolConfig: {
    nameAmh: string;
    nameEng: string;
    subjects: string[];
    evaluationMode: 'quarter' | 'semester';
    themeColor: string;
  };
}

const THEME_STYLES: Record<string, {
  primary: string;
  primaryText: string;
  text: string;
  lightBg: string;
  border: string;
  accent: string;
}> = {
  indigo: {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    primaryText: 'text-indigo-600',
    text: 'text-indigo-700',
    lightBg: 'bg-indigo-50/40',
    border: 'border-indigo-100',
    accent: 'bg-indigo-100 text-indigo-800'
  },
  emerald: {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    primaryText: 'text-emerald-600',
    text: 'text-emerald-700',
    lightBg: 'bg-emerald-50/40',
    border: 'border-emerald-100',
    accent: 'bg-emerald-100 text-emerald-800'
  },
  violet: {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white',
    primaryText: 'text-violet-600',
    text: 'text-violet-700',
    lightBg: 'bg-violet-50/40',
    border: 'border-violet-100',
    accent: 'bg-violet-100 text-violet-800'
  },
  amber: {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white',
    primaryText: 'text-amber-600',
    text: 'text-amber-700',
    lightBg: 'bg-amber-50/40',
    border: 'border-amber-100',
    accent: 'bg-amber-100 text-amber-800'
  },
  rose: {
    primary: 'bg-rose-600 hover:bg-rose-700 text-white',
    primaryText: 'text-rose-600',
    text: 'text-rose-700',
    lightBg: 'bg-rose-50/40',
    border: 'border-rose-100',
    accent: 'bg-rose-100 text-rose-800'
  },
  slate: {
    primary: 'bg-slate-700 hover:bg-slate-800 text-white',
    primaryText: 'text-slate-700',
    text: 'text-slate-850',
    lightBg: 'bg-slate-100/50',
    border: 'border-slate-200',
    accent: 'bg-slate-100 text-slate-800'
  }
};

export const GradeRemindersSection: React.FC<GradeRemindersSectionProps> = ({
  students,
  grades,
  classes,
  schoolConfig
}) => {
  const activeTheme = THEME_STYLES[schoolConfig.themeColor as keyof typeof THEME_STYLES] || THEME_STYLES.indigo;
  const isSemester = schoolConfig.evaluationMode === 'semester';
  
  // Terms logic
  const terms = isSemester ? [1, 2] : [1, 2, 3, 4];
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  
  // UI filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'complete'>('missing');
  const [sentFilter, setSentFilter] = useState<'all' | 'sent' | 'notsent'>('all');
  
  // Draft template panel toggle
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  
  // Persistent sent logs tracking (persisted in localStorage per term)
  const [sentLogs, setSentLogs] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('grade_reminders_sent_logs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('grade_reminders_sent_logs', JSON.stringify(sentLogs));
  }, [sentLogs]);

  // Sound play helper (interactive client sound effect if available in root)
  const triggerClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // ignore
    }
  };

  const triggerSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playTone(523.25, 0, 0.15); // C5
      playTone(659.25, 0.1, 0.15); // E5
      playTone(783.99, 0.2, 0.3); // G5
    } catch (e) {
      // ignore
    }
  };

  // Grade & Section list options for dropdown
  const gradeOptions = useMemo(() => {
    const gradesSet = new Set<string>();
    students.forEach(s => { if (s.grade) gradesSet.add(s.grade); });
    return Array.from(gradesSet).sort();
  }, [students]);

  const sectionOptions = useMemo(() => {
    const sectionsSet = new Set<string>();
    students.forEach(s => { if (s.section) sectionsSet.add(s.section); });
    return Array.from(sectionsSet).sort();
  }, [students]);

  // Compute student grade status for the selected term
  const studentsAnalysis = useMemo(() => {
    return students.map(student => {
      // 1. Get subjects list for student grade and section from classes
      const classSetup = classes.find(
        c => c.grade.toLowerCase() === student.grade.toLowerCase() && 
             c.section.toLowerCase() === student.section.toLowerCase()
      );
      const studentSubjects = classSetup && classSetup.subjects.length > 0 
        ? classSetup.subjects 
        : schoolConfig.subjects;

      // 2. See which subjects have grades in this term
      const missingSubjects: string[] = [];
      const completedSubjects: string[] = [];

      studentSubjects.forEach(subject => {
        const gradeRecord = grades.find(
          g => g.studentId === student.id && 
               g.subject.toLowerCase() === subject.toLowerCase() && 
               (g.term || 1) === selectedTerm
        );
        if (gradeRecord) {
          completedSubjects.push(subject);
        } else {
          missingSubjects.push(subject);
        }
      });

      const totalSubjects = studentSubjects.length;
      const isComplete = missingSubjects.length === 0;
      const progressPercent = totalSubjects > 0 
        ? Math.round((completedSubjects.length / totalSubjects) * 100) 
        : 100;

      // Check if reminder was already sent
      const lastSentTime = sentLogs[`${student.id}-${selectedTerm}`] || null;

      return {
        student,
        assignedSubjects: studentSubjects,
        completedSubjects,
        missingSubjects,
        isComplete,
        progressPercent,
        lastSentTime
      };
    });
  }, [students, grades, classes, selectedTerm, schoolConfig.subjects, sentLogs]);

  // Filtered lists
  const filteredStudents = useMemo(() => {
    return studentsAnalysis.filter(item => {
      // Search Query filter
      const matchesSearch = 
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Grade filter
      const matchesGrade = gradeFilter === 'all' || item.student.grade === gradeFilter;

      // Section filter
      const matchesSection = sectionFilter === 'all' || item.student.section === sectionFilter;

      // Status filter
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'missing' && !item.isComplete) ||
        (statusFilter === 'complete' && item.isComplete);

      // Sent filter
      const matchesSent =
        sentFilter === 'all' ||
        (sentFilter === 'sent' && item.lastSentTime) ||
        (sentFilter === 'notsent' && !item.lastSentTime);

      return matchesSearch && matchesGrade && matchesSection && matchesStatus && matchesSent;
    });
  }, [studentsAnalysis, searchQuery, gradeFilter, sectionFilter, statusFilter, sentFilter]);

  // Core metrics
  const totalStudentsCount = students.length;
  const missingGradesCount = studentsAnalysis.filter(s => !s.isComplete).length;
  const completeGradesCount = studentsAnalysis.filter(s => s.isComplete).length;
  const totalSentReminders = useMemo(() => {
    return Object.keys(sentLogs).filter(key => key.endsWith(`-${selectedTerm}`)).length;
  }, [sentLogs, selectedTerm]);

  // Individual Email Sender state
  const [sendingStudentId, setSendingStudentId] = useState<string | null>(null);

  // Bulk Email Sender states
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkProgressIndex, setBulkProgressIndex] = useState(0);
  const [bulkTargets, setBulkTargets] = useState<typeof studentsAnalysis>([]);
  const [bulkLogs, setBulkLogs] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Send single reminder handler
  const handleSendIndividualReminder = async (studentId: string) => {
    const target = studentsAnalysis.find(item => item.student.id === studentId);
    if (!target) return;

    triggerClickSound();
    setSendingStudentId(studentId);

    const termLabel = isSemester ? `ሴሚስተር ${selectedTerm}` : `ሩብ ዓመት ${selectedTerm}`;
    const parentEmail = target.student.parentEmail || `${target.student.name.replace(/\s+/g, '_').toLowerCase()}_parent@school.com`;

    try {
      // Small simulated artificial network delay of 800ms
      await new Promise(resolve => setTimeout(resolve, 800));

      await ParentNotificationService.sendGradeReminderEmail(
        target.student.name,
        target.student.id,
        target.student.grade,
        target.student.section,
        parentEmail,
        termLabel,
        target.missingSubjects,
        schoolConfig.nameAmh
      );

      // Save log timestamp
      const nowString = new Date().toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit' });
      setSentLogs(prev => ({
        ...prev,
        [`${studentId}-${selectedTerm}`]: nowString
      }));

      triggerSuccessSound();
    } catch (err) {
      console.error('Failed to send reminder', err);
    } finally {
      setSendingStudentId(null);
    }
  };

  // Start bulk sending process
  const handleStartBulkSending = () => {
    triggerClickSound();
    // Bulk targets are students who do NOT have complete grades for the current term and haven't had reminders sent yet (or we can send to all pending)
    const pendingTargets = studentsAnalysis.filter(s => !s.isComplete);
    
    if (pendingTargets.length === 0) {
      alert('ሁሉም ተማሪዎች ውጤት ተሞልቶላቸዋል! ማሳሰቢያ መላክ አያስፈልግም። (All students are fully graded! No reminders needed.)');
      return;
    }

    setBulkTargets(pendingTargets);
    setBulkProgressIndex(0);
    setBulkLogs([`[${new Date().toLocaleTimeString('am-ET')}] የጅምላ ማሳሰቢያ ተግባር ተጀምሯል... (Bulk reminder job initialized...)`]);
    setShowBulkModal(true);
    setIsSendingBulk(true);
  };

  // Process bulk queue
  useEffect(() => {
    if (!isSendingBulk || bulkTargets.length === 0) return;

    let isActive = true;

    const sendNext = async () => {
      if (bulkProgressIndex >= bulkTargets.length) {
        // Complete
        if (isActive) {
          setIsSendingBulk(false);
          setBulkLogs(prev => [...prev, `[${new Date().toLocaleTimeString('am-ET')}] ✅ ሁሉም ማሳሰቢያዎች በተሳካ ሁኔታ ተልከው ተጠናቀዋል! (All reminders successfully sent!)`]);
          triggerSuccessSound();
        }
        return;
      }

      const target = bulkTargets[bulkProgressIndex];
      const parentEmail = target.student.parentEmail || `${target.student.name.replace(/\s+/g, '_').toLowerCase()}_parent@school.com`;
      const termLabel = isSemester ? `ሴሚስተር ${selectedTerm}` : `ሩብ ዓመት ${selectedTerm}`;

      if (isActive) {
        setBulkLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString('am-ET')}] ለአስተማሪ/ተማሪ ${target.student.name} ወላጅ (${parentEmail}) በመላክ ላይ...`
        ]);
      }

      try {
        // Stagger delay of 700ms for realistic UI progression
        await new Promise(resolve => setTimeout(resolve, 700));

        await ParentNotificationService.sendGradeReminderEmail(
          target.student.name,
          target.student.id,
          target.student.grade,
          target.student.section,
          parentEmail,
          termLabel,
          target.missingSubjects,
          schoolConfig.nameAmh
        );

        if (isActive) {
          const nowString = new Date().toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit' });
          setSentLogs(prev => ({
            ...prev,
            [`${target.student.id}-${selectedTerm}`]: nowString
          }));
          
          setBulkLogs(prev => [
            ...prev,
            `  └─ ✅ በተሳካ ሁኔታ ተልኳል (Mail sent successfully)`
          ]);
          setBulkProgressIndex(prev => prev + 1);
        }
      } catch (err) {
        console.error('Bulk send error', err);
        if (isActive) {
          setBulkLogs(prev => [...prev, `  └─ ❌ መላክ አልተሳካም (Failed to send): ${err}`]);
          setBulkProgressIndex(prev => prev + 1);
        }
      }
    };

    sendNext();

    return () => {
      isActive = false;
    };
  }, [isSendingBulk, bulkProgressIndex, bulkTargets, selectedTerm, isSemester, schoolConfig.nameAmh]);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-6" id="grade-reminders-panel">
      
      {/* Header and Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h2 className="text-lg font-black text-stone-900 tracking-tight">
              የውጤት መግለጫ ወላጆች ማሳሰቢያ (Grade Submission Reminders)
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-2xl">
            በዚህ ክፍለ ጊዜ (ሩብ ዓመት/ሴሚስተር) ለአንዳንድ የትምህርት አይነቶች ውጤት ያልተሞላላቸውን ተማሪዎች ዝርዝር በመለየት፣ ለወላጆቻቸው በጅምላ ወይም በግል የኢሜይል የውጤት ማሳሰቢያዎችን ለመላክ ይጠቀሙበት።
          </p>
        </div>

        {/* Term Selector */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-xs font-bold text-stone-400">ወቅት (Active Term):</span>
          <div className="bg-stone-100 p-1 rounded-xl border border-stone-200/60 flex items-center gap-1">
            {terms.map(t => (
              <button
                key={t}
                onClick={() => { triggerClickSound(); setSelectedTerm(t); }}
                className={`py-1.5 px-3 text-xs font-extrabold rounded-lg transition-all ${
                  selectedTerm === t 
                    ? `${activeTheme.primary} shadow-2xs` 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {isSemester ? `ሴሚስተር ${t}` : `Q${t}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Statistics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Students Checked */}
        <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">የተማሪዎች ሁኔታ (Students Audited)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-stone-900">{totalStudentsCount}</span>
              <span className="text-xs text-stone-500">ተማሪዎች</span>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-xl ${activeTheme.lightBg} ${activeTheme.primaryText} flex items-center justify-center`}>
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Missing Grades Count */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          missingGradesCount > 0 
            ? 'bg-rose-50/40 border-rose-100 text-rose-900' 
            : 'bg-emerald-50/40 border-emerald-100 text-emerald-900'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">ውጤት ያልተሟላላቸው (Incomplete Grades)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black">
                {missingGradesCount}
              </span>
              <span className="text-xs">ተማሪዎች ({totalStudentsCount > 0 ? Math.round((missingGradesCount / totalStudentsCount) * 100) : 0}%)</span>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            missingGradesCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Sent Reminders Count */}
        <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/60 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">ማሳሰቢያ የተላከላቸው (Notified Parents)</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-stone-900">{totalSentReminders}</span>
              <span className="text-xs text-stone-500">ወላጆች</span>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-xl ${activeTheme.lightBg} ${activeTheme.primaryText} flex items-center justify-center`}>
            <Mail className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Collapsible Email Template Preview */}
      <div className="border border-stone-200/70 rounded-2xl overflow-hidden bg-stone-50/30">
        <button
          onClick={() => { triggerClickSound(); setShowDraftPreview(!showDraftPreview); }}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50/60 transition-all select-none"
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${activeTheme.primaryText}`} />
            <div>
              <span className="text-xs font-extrabold text-stone-800">የኢሜይል ማሳሰቢያ ይዘት ቅድመ-ዕይታ (Bilingual Email Template Preview)</span>
              <p className="text-[10px] text-stone-400 mt-0.5">የሚላከው ኢሜይል ይዘት እና መግለጫ ለማየት እዚህ ይጫኑ</p>
            </div>
          </div>
          {showDraftPreview ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </button>

        <AnimatePresence>
          {showDraftPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-stone-150 bg-white"
            >
              <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto">
                <div className="bg-slate-50 border border-stone-200/60 rounded-xl p-3 text-[11px] space-y-1.5">
                  <div>
                    <strong className="text-stone-500">ርዕስ (Subject):</strong> <span className="text-stone-800 font-extrabold">⚠️ የውጤት መግለጫ ማሳሰቢያ (Grade Submission Reminder) - [የተማሪ ስም]</span>
                  </div>
                  <div className="border-t border-stone-200/50 pt-1.5 mt-1.5">
                    <strong className="text-stone-500">ይዘት (Body):</strong>
                  </div>
                  <div className="text-stone-600 space-y-2 whitespace-pre-line leading-relaxed font-medium">
                    {`ሰላም ጤና ይስጥልን፣

ይህ ማሳሰቢያ የተላከው ከ${schoolConfig.nameAmh} ነው። ልጅዎ [የተማሪ ስም] ([ክፍል] - [ሴክሽን]) ለየሩብ ዓመቱ/ሴሚስተሩ መመዝገብ የሚገባቸው የትምህርት ውጤቶች ገና ሙሉ በሙሉ አልተጠናቀቁም።

📌 ያልተመዘገቡ የትምህርት አይነቶች (Missing Subjects)፡
• [የቀሩ የትምህርት አይነቶች ዝርዝር]

ውጤቶቹ እንደተጠናቀቁ በወላጅ ፖርታል (Parent Portal) ላይ የሚለቀቁ መሆኑን እንገልጻለን። መምህራን ውጤቶቹን በፍጥነት እንዲያጠናቅቁ ርዕሰ መምህሩ ክትትል እያደረጉ ይገኛሉ።

ክብር እና ምስጋና፣
የ${schoolConfig.nameAmh} አስተዳደር

---
Dear Parent,

This is a reminder from ${schoolConfig.nameEng} regarding your child [Student Name] ([Grade] - [Section]). The grade submission for [Active Term] has not been completed yet for some subjects.

📌 Outstanding/Missing Subjects:
• [List of Outstanding Subjects]

We will notify you as soon as the final grade roster is fully approved and released on the Parent Portal.

Best regards,
${schoolConfig.nameEng} Administration`}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="የተማሪ ስም ወይም መለያ ቁጥር ይፈልጉ..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-1.5 px-2 bg-white border border-stone-200 text-xs font-bold rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">ሁሉንም ተማሪዎች (All Students)</option>
              <option value="missing">ውጤት የጎደላቸው (Missing Grades Only)</option>
              <option value="complete">ውጤት የተሟላላቸው (Fully Graded Only)</option>
            </select>
          </div>

          {/* Grade Selector */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="py-1.5 px-2 bg-white border border-stone-200 text-xs font-bold rounded-xl focus:outline-hidden"
          >
            <option value="all">ክፍል: ሁሉም (All Grades)</option>
            {gradeOptions.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Section Selector */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="py-1.5 px-2 bg-white border border-stone-200 text-xs font-bold rounded-xl focus:outline-hidden"
          >
            <option value="all">ክፍል: ሁሉም (All Sections)</option>
            {sectionOptions.map(s => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>

          {/* Sent Filter */}
          <select
            value={sentFilter}
            onChange={(e) => setSentFilter(e.target.value as any)}
            className="py-1.5 px-2 bg-white border border-stone-200 text-xs font-bold rounded-xl focus:outline-hidden"
          >
            <option value="all">የማሳሰቢያ ሁኔታ (Notification Status)</option>
            <option value="sent">ተልኳል (Already Notified)</option>
            <option value="notsent">ያልተላከ (Pending Notification)</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Trigger Bar */}
      {statusFilter === 'missing' && filteredStudents.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-extrabold animate-bounce">
              ⚠️
            </div>
            <div>
              <span className="text-xs font-extrabold text-stone-800">የጅምላ ማሳሰቢያ እርምጃ (Bulk Email Trigger)</span>
              <p className="text-[10px] text-stone-500 mt-0.5">
                በአሁኑ ሰዓት በዝርዝሩ ውስጥ ለሚገኙ <strong>{filteredStudents.length}</strong> ውጤት የጎደላቸው ተማሪዎች ወላጆች በሙሉ ማሳሰቢያ በአንድ ጊዜ መላክ ይችላሉ።
              </p>
            </div>
          </div>
          
          <button
            onClick={handleStartBulkSending}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${activeTheme.primary}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>ለሁሉም በጅምላ ማሳሰቢያ ላክ (Send Bulk Emails)</span>
          </button>
        </div>
      )}

      {/* Students List Display */}
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/20">
          <div className="p-3 bg-stone-100 text-stone-400 rounded-full mb-3">
            <CheckCircle className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h4 className="text-sm font-bold text-stone-700">ተማሪዎች አልተገኙም</h4>
          <p className="text-xs text-stone-400 max-w-sm mt-1">
            በተመረጠው ማጣሪያ መሰረት ምንም ተማሪ አልተገኘም። ሁሉም ተማሪዎች ሙሉ ውጤት ተሞልቶላቸው ሊሆን ይችላል!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-150 text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">የተማሪ መረጃ (Student Info)</th>
                <th className="py-3 px-4">ክፍል (Grade/Sec)</th>
                <th className="py-3 px-4">የወላጅ ኢሜይል (Parent Email)</th>
                <th className="py-3 px-4">ውጤት የጎደላቸው ትምህርቶች (Missing Grades)</th>
                <th className="py-3 px-4 text-center">ሁኔታ (Status)</th>
                <th className="py-3 px-4 text-right">ድርጊት (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150">
              {filteredStudents.map((item) => (
                <tr key={item.student.id} className="hover:bg-stone-50/40 transition-colors text-xs text-stone-700">
                  {/* Info */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-stone-900">{item.student.name}</span>
                      <span className="text-[10px] font-mono text-stone-400 mt-0.5">{item.student.id}</span>
                    </div>
                  </td>

                  {/* Grade/Sec */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-800">
                      {item.student.grade} - {item.student.section}
                    </span>
                  </td>

                  {/* Parent Email */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-stone-600">
                      {item.student.parentEmail || `${item.student.name.replace(/\s+/g, '_').toLowerCase()}_parent@school.com`}
                    </span>
                  </td>

                  {/* Missing Subjects Badge List */}
                  <td className="py-3 px-4 max-w-[280px]">
                    {item.isComplete ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[10px]">
                        🟢 ሁሉም ተሞልቷል (Complete)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.missingSubjects.map(sub => (
                          <span key={sub} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-semibold">
                            {sub} ❌
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Last Sent Status */}
                  <td className="py-3 px-4 text-center">
                    {item.lastSentTime ? (
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                          ✉️ ተልኳል
                        </span>
                        <span className="text-[9px] text-stone-400 font-mono mt-0.5">{item.lastSentTime}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-stone-50 text-stone-400 font-bold px-2 py-0.5 rounded-full border border-stone-150">
                        ያልተላከ
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    {!item.isComplete && (
                      <button
                        onClick={() => handleSendIndividualReminder(item.student.id)}
                        disabled={sendingStudentId === item.student.id}
                        className={`py-1 px-2.5 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 ml-auto cursor-pointer ${
                          item.lastSentTime 
                            ? 'border border-indigo-100 text-indigo-700 bg-white hover:bg-indigo-50/30' 
                            : `${activeTheme.primary} shadow-3xs`
                        }`}
                      >
                        {sendingStudentId === item.student.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>እየተላከ ነው...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>{item.lastSentTime ? 'ደግመህ ላክ' : 'ማሳሰቢያ ላክ'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Progress Console Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-stone-200 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📤</span>
                  <h3 className="text-sm font-black text-stone-900">
                    የጅምላ ማሳሰቢያ መላኪያ ኮንሶል (Bulk Email Console)
                  </h3>
                </div>
                {!isSendingBulk && (
                  <button
                    onClick={() => { triggerClickSound(); setShowBulkModal(false); }}
                    className="text-stone-400 hover:text-stone-700 font-extrabold text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Progress and Logger */}
              <div className="p-5 space-y-4 flex-1">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-bold text-stone-700">
                    <span>ኢሜይሎች በመላክ ላይ... (Sending emails...)</span>
                    <span>
                      {bulkProgressIndex} / {bulkTargets.length} ({bulkTargets.length > 0 ? Math.round((bulkProgressIndex / bulkTargets.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
                    <div
                      className={`h-full transition-all duration-300 ${
                        bulkProgressIndex === bulkTargets.length ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${bulkTargets.length > 0 ? (bulkProgressIndex / bulkTargets.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Simulated Log Console */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">የሲስተም መዝገብ (Simulation Activity Log)</span>
                  <div className="bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-[10px] h-48 overflow-y-auto space-y-1 leading-relaxed">
                    {bulkLogs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {log}
                      </div>
                    ))}
                    {isSendingBulk && (
                      <div className="flex items-center gap-1 text-indigo-400 text-[10px] animate-pulse">
                        <span>●</span>
                        <span>እየሰራ ነው... (Processing...)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-2">
                {isSendingBulk ? (
                  <button
                    onClick={() => { triggerClickSound(); setIsSendingBulk(false); }}
                    className="px-4 py-2 text-xs font-bold border border-stone-200 bg-white text-stone-600 rounded-xl hover:bg-stone-50 cursor-pointer"
                  >
                    ሂደቱን አቁም (Stop/Cancel)
                  </button>
                ) : (
                  <button
                    onClick={() => { triggerClickSound(); setShowBulkModal(false); }}
                    className="px-5 py-2 text-xs font-black bg-stone-900 text-white rounded-xl hover:bg-stone-850 cursor-pointer"
                  >
                    ዝጋ (Close Console)
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
