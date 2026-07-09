import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles, 
  GraduationCap, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import { Student, Grade, Teacher } from '../schoolData';
import { playInteractiveSound } from './AudioEngine';

interface PerformanceDashboardProps {
  students: Student[];
  grades: Grade[];
  selectedGrade: string;
  selectedSection: string;
  teachers: Teacher[];
  schoolConfig: any;
  currentUserRole: string;
  currentUserEmail: string;
  activeTheme: any;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  students,
  grades,
  selectedGrade,
  selectedSection,
  teachers,
  schoolConfig,
  currentUserRole,
  currentUserEmail,
  activeTheme
}) => {
  // Setup standard subjects list
  const subjectsList = useMemo(() => {
    return schoolConfig?.subjects || ['Mathematics', 'English', 'Amharic', 'Science', 'Social Studies'];
  }, [schoolConfig]);

  // Find current teacher's subjects if teacher role
  const currentTeacher = useMemo(() => {
    if (currentUserRole !== 'teacher' || !currentUserEmail || !teachers) return null;
    return teachers.find(t => t.email === currentUserEmail) || null;
  }, [currentUserRole, currentUserEmail, teachers]);

  const selectableSubjects = useMemo(() => {
    if (currentTeacher) {
      return currentTeacher.subjects;
    }
    return subjectsList;
  }, [currentTeacher, subjectsList]);

  // States
  const [selectedSubject, setSelectedSubject] = useState<string>(selectableSubjects[0] || 'Mathematics');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Make sure selectedSubject is valid
  React.useEffect(() => {
    if (selectableSubjects.length > 0 && !selectableSubjects.includes(selectedSubject)) {
      setSelectedSubject(selectableSubjects[0]);
    }
  }, [selectableSubjects, selectedSubject]);

  // Class & Section Filtered Students
  const classStudents = useMemo(() => {
    let result = students;
    if (selectedGrade !== 'All') {
      result = result.filter(s => s.grade === selectedGrade);
    }
    return result.filter(s => s.section === selectedSection);
  }, [students, selectedGrade, selectedSection]);

  // Set default student for trend tracking
  React.useEffect(() => {
    if (classStudents.length > 0 && (!selectedStudentId || !classStudents.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents, selectedStudentId]);

  // Get current terms list based on evaluationMode (semester = 2 terms, quarter = 4 terms)
  const isSemester = schoolConfig?.evaluationMode === 'semester';
  const termsList = useMemo(() => {
    return isSemester ? [1, 2] : [1, 2, 3, 4];
  }, [isSemester]);

  // State to filter metrics by a specific term or average (annual)
  const [selectedTermFilter, setSelectedTermFilter] = useState<number | 'all'>(1);

  // Filter grades to current class & section
  const classGrades = useMemo(() => {
    const studentIds = new Set(classStudents.map(s => s.id));
    return grades.filter(g => studentIds.has(g.studentId));
  }, [grades, classStudents]);

  // Calculate stats for the selected subject and selected term
  const stats = useMemo(() => {
    const subjectGrades = classGrades.filter(g => {
      const matchSub = g.subject === selectedSubject;
      const gTerm = g.term || 1;
      const matchTerm = selectedTermFilter === 'all' ? true : gTerm === selectedTermFilter;
      return matchSub && matchTerm;
    });

    if (subjectGrades.length === 0) {
      return {
        avg: 0,
        passRate: 0,
        highest: 0,
        lowest: 0,
        totalCount: 0,
        passCount: 0,
        failCount: 0,
        gradesList: []
      };
    }

    const totals = subjectGrades.map(g => g.total);
    const sum = totals.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / totals.length);
    const highest = Math.max(...totals);
    const lowest = Math.min(...totals);
    const passCount = totals.filter(t => t >= 50).length;
    const failCount = totals.length - passCount;
    const passRate = Math.round((passCount / totals.length) * 100);

    return {
      avg,
      passRate,
      highest,
      lowest,
      totalCount: totals.length,
      passCount,
      failCount,
      gradesList: subjectGrades
    };
  }, [classGrades, selectedSubject, selectedTermFilter]);

  // 1. Grade Distribution Data
  const distributionData = useMemo(() => {
    const ranges = [
      { name: 'A+ (90-100)', count: 0, studentsList: [] as string[], color: '#10b981' },
      { name: 'A (85-89)', count: 0, studentsList: [] as string[], color: '#34d399' },
      { name: 'B+ (80-84)', count: 0, studentsList: [] as string[], color: '#6366f1' },
      { name: 'B (75-79)', count: 0, studentsList: [] as string[], color: '#4f46e5' },
      { name: 'C+ (65-74)', count: 0, studentsList: [] as string[], color: '#fbbf24' },
      { name: 'C (60-64)', count: 0, studentsList: [] as string[], color: '#f59e0b' },
      { name: 'D (50-59)', count: 0, studentsList: [] as string[], color: '#f97316' },
      { name: 'F (<50)', count: 0, studentsList: [] as string[], color: '#ef4444' }
    ];

    stats.gradesList.forEach(g => {
      const score = g.total;
      if (score >= 90) {
        ranges[0].count++;
        ranges[0].studentsList.push(g.studentName);
      } else if (score >= 85) {
        ranges[1].count++;
        ranges[1].studentsList.push(g.studentName);
      } else if (score >= 80) {
        ranges[2].count++;
        ranges[2].studentsList.push(g.studentName);
      } else if (score >= 75) {
        ranges[3].count++;
        ranges[3].studentsList.push(g.studentName);
      } else if (score >= 65) {
        ranges[4].count++;
        ranges[4].studentsList.push(g.studentName);
      } else if (score >= 60) {
        ranges[5].count++;
        ranges[5].studentsList.push(g.studentName);
      } else if (score >= 50) {
        ranges[6].count++;
        ranges[6].studentsList.push(g.studentName);
      } else {
        ranges[7].count++;
        ranges[7].studentsList.push(g.studentName);
      }
    });

    return ranges;
  }, [stats.gradesList]);

  // 2. Student Progress Trend Data (over Terms/Semesters)
  const studentTrendData = useMemo(() => {
    if (!selectedStudentId) return [];

    const student = classStudents.find(s => s.id === selectedStudentId);
    if (!student) return [];

    // Map each term to score data
    return termsList.map(term => {
      // Find selected student's score in the selected subject
      const subGradeObj = classGrades.find(g => 
        g.studentId === selectedStudentId && 
        g.subject === selectedSubject && 
        (g.term || 1) === term
      );

      // Find selected student's average across ALL subjects in this term
      const allSubGrades = classGrades.filter(g => 
        g.studentId === selectedStudentId && 
        (g.term || 1) === term
      );
      const studentTermAvg = allSubGrades.length > 0
        ? Math.round(allSubGrades.reduce((sum, g) => sum + g.total, 0) / allSubGrades.length)
        : null;

      // Class average in the selected subject for this term
      const classSubGrades = classGrades.filter(g => 
        g.subject === selectedSubject && 
        (g.term || 1) === term
      );
      const classTermAvg = classSubGrades.length > 0
        ? Math.round(classSubGrades.reduce((sum, g) => sum + g.total, 0) / classSubGrades.length)
        : null;

      return {
        termLabel: isSemester ? `${term}ኛ ሴሚስተር` : `${term}ኛ ሩብ ዓመት`,
        term,
        studentSubjectScore: subGradeObj ? subGradeObj.total : null,
        studentOverallAverage: studentTermAvg,
        classSubjectAverage: classTermAvg
      };
    });
  }, [selectedStudentId, classStudents, selectedSubject, classGrades, termsList, isSemester]);

  // 3. Subject-wise Averages (Bar Chart comparing different subjects)
  const subjectsComparisonData = useMemo(() => {
    return selectableSubjects.map(sub => {
      const subGrades = classGrades.filter(g => {
        const matchSub = g.subject === sub;
        const gTerm = g.term || 1;
        const matchTerm = selectedTermFilter === 'all' ? true : gTerm === selectedTermFilter;
        return matchSub && matchTerm;
      });

      const avg = subGrades.length > 0
        ? Math.round(subGrades.reduce((sum, g) => sum + g.total, 0) / subGrades.length)
        : 0;

      return {
        subject: sub,
        average: avg
      };
    });
  }, [classGrades, selectableSubjects, selectedTermFilter]);

  // 4. Students Delta / Improvement Tracking (Term 1 -> Latest Term)
  const improvementLeaders = useMemo(() => {
    const list: Array<{
      studentId: string;
      studentName: string;
      startScore: number;
      endScore: number;
      delta: number;
      subject: string;
    }> = [];

    const firstTerm = 1;
    const lastTerm = isSemester ? 2 : 4;

    classStudents.forEach(st => {
      selectableSubjects.forEach(sub => {
        const startGrade = classGrades.find(g => g.studentId === st.id && g.subject === sub && (g.term || 1) === firstTerm);
        const endGrade = classGrades.find(g => g.studentId === st.id && g.subject === sub && (g.term || 1) === lastTerm);

        if (startGrade && endGrade) {
          const delta = endGrade.total - startGrade.total;
          list.push({
            studentId: st.id,
            studentName: st.name,
            startScore: startGrade.total,
            endScore: endGrade.total,
            delta,
            subject: sub
          });
        }
      });
    });

    // Sort by delta descending
    return list.sort((a, b) => b.delta - a.delta).slice(0, 5);
  }, [classStudents, classGrades, selectableSubjects, isSemester]);

  // 5. Students Needing Attention (Lowest overall average score or failing counts)
  const studentLeaderboard = useMemo(() => {
    return classStudents.map(st => {
      const stGrades = classGrades.filter(g => {
        const gTerm = g.term || 1;
        const matchTerm = selectedTermFilter === 'all' ? true : gTerm === selectedTermFilter;
        return g.studentId === st.id && matchTerm;
      });

      const average = stGrades.length > 0
        ? Math.round(stGrades.reduce((sum, g) => sum + g.total, 0) / stGrades.length)
        : 0;

      const failingSubjectsCount = stGrades.filter(g => g.total < 50).length;

      return {
        studentId: st.id,
        studentName: st.name,
        gender: st.gender,
        average,
        failingSubjectsCount
      };
    }).sort((a, b) => a.average - b.average); // Sort ascending (lowest averages first, showing who needs help)
  }, [classStudents, classGrades, selectedTermFilter]);

  const strugglingStudents = useMemo(() => {
    return studentLeaderboard.filter(s => s.average < 50 || s.failingSubjectsCount > 0).slice(0, 5);
  }, [studentLeaderboard]);

  const topStudents = useMemo(() => {
    // Sort descending for top students
    return [...studentLeaderboard].sort((a, b) => b.average - a.average).slice(0, 5);
  }, [studentLeaderboard]);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataObj = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white p-3 rounded-xl border border-stone-800 text-xs shadow-md space-y-1 max-w-[260px]">
          <p className="font-extrabold text-stone-300">{dataObj.name}</p>
          <p className="font-black text-amber-400 text-base">{dataObj.count === 1 ? '1 ተማሪ' : `${dataObj.count} ተማሪዎች`}</p>
          {dataObj.studentsList && dataObj.studentsList.length > 0 ? (
            <div className="pt-1.5 border-t border-stone-800">
              <span className="text-[10px] text-stone-400 font-bold uppercase block mb-0.5">የተማሪዎች ስም፡</span>
              <p className="text-[11px] leading-tight text-stone-200">
                {dataObj.studentsList.slice(0, 5).join(', ')}
                {dataObj.studentsList.length > 5 ? ` እና ሌሎች ${dataObj.studentsList.length - 5}...` : ''}
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-stone-500 italic">በዚህ ደረጃ ውስጥ ያለ ተማሪ የለም</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Filter & Select Row */}
      <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-indigo-950 flex items-center gap-2">
              <TrendingUp className="w-5.5 h-5.5 text-indigo-600" />
              የተማሪዎች ውጤት አፈጻጸም ዳሽቦርድ (Academic Performance)
            </h3>
            <p className="text-stone-500 text-xs">
              {selectedGrade === 'All' ? 'የሁሉም ክፍሎች' : `የ${selectedGrade}`} - ሴክሽን {selectedSection} ተማሪዎችን የውጤት ስርጭት፣ የእድገት ሁኔታና ጠንካራ/ደካማ ጎን በአሃዝ እና በግራፍ ይከታተሉ።
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Term selector filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500">ምዘና፡</span>
              <select
                value={selectedTermFilter}
                onChange={(e) => {
                  playInteractiveSound('click');
                  setSelectedTermFilter(e.target.value === 'all' ? 'all' : Number(e.target.value));
                }}
                className="bg-stone-50 border border-stone-200 text-xs font-bold p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {termsList.map(t => (
                  <option key={t} value={t}>
                    {isSemester ? `${t}ኛ ሴሚስተር` : `${t}ኛ ሩብ ዓመት`}
                  </option>
                ))}
                <option value="all">የዓመቱ አጠቃላይ ድምር (Annual / Cumulative)</option>
              </select>
            </div>

            {/* Subject Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-500">የትምህርት አይነት:</span>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  playInteractiveSound('click');
                  setSelectedSubject(e.target.value);
                }}
                className="bg-stone-50 border border-stone-200 text-xs font-bold p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {selectableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Class Average */}
        <div className="bg-white border border-stone-200/80 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">የክፍሉ አማካይ</span>
            <span className="bg-indigo-50 text-indigo-700 p-1.5 rounded-xl shrink-0">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-indigo-950">{stats.avg}%</h4>
            <p className="text-[10px] text-stone-400 font-semibold mt-1">የክፍሉ አጠቃላይ የውጤት ድምር</p>
          </div>
        </div>

        {/* Metric 2: Pass Rate */}
        <div className="bg-white border border-stone-200/80 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">የማለፊያ ምጣኔ</span>
            <span className="bg-emerald-50 text-emerald-700 p-1.5 rounded-xl shrink-0">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-emerald-600">{stats.passRate}%</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-emerald-700 font-bold">{stats.passCount} ተማሪ አልፏል</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Highest Grade */}
        <div className="bg-white border border-stone-200/80 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">ከፍተኛ ውጤት</span>
            <span className="bg-amber-50 text-amber-700 p-1.5 rounded-xl shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-amber-600">{stats.highest}%</h4>
            <p className="text-[10px] text-stone-400 font-semibold mt-1">የላቀ ውጤት ያስመዘገበ ተማሪ</p>
          </div>
        </div>

        {/* Metric 4: Lowest Grade */}
        <div className="bg-white border border-stone-200/80 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">ዝቅተኛ ውጤት</span>
            <span className="bg-rose-50 text-rose-700 p-1.5 rounded-xl shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-rose-500">{stats.lowest}%</h4>
            <p className="text-[10px] text-stone-400 font-semibold mt-1">ደካማ የክፍል ውስጥ ውጤት</p>
          </div>
        </div>

        {/* Metric 5: Total Evaluated */}
        <div className="bg-white border border-stone-200/80 p-4.5 rounded-2xl shadow-3xs flex flex-col justify-between space-y-3 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">የተገመገሙ</span>
            <span className="bg-stone-50 text-stone-700 p-1.5 rounded-xl shrink-0">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h4 className="text-2xl font-black text-stone-900">{stats.totalCount} ተማሪ</h4>
            <p className="text-[10px] text-stone-400 font-semibold mt-1">ውጤት የተመዘገበላቸው ተማሪዎች</p>
          </div>
        </div>
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Grade Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>📊 የውጤት ስርጭት ግራፍ ({selectedSubject})</span>
            </h4>
            <p className="text-[11px] text-stone-400">
              ውጤታቸው በተለያዩ ደረጃዎች ውስጥ የሚገኝ ተማሪዎችን ስርጭት ያሳያል። ስማቸውን ለማየት የአሞሌዎቹ ላይ ያንዣብቡ።
            </p>
          </div>

          {stats.totalCount === 0 ? (
            <div className="h-72 border border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 text-xs">
              <p className="italic">ለዚህ ትምህርት አይነትና የክፍለ ጊዜ ውጤት አልተመዘገበም</p>
              <p className="text-[10px] mt-1">እባክዎን ከላይ ሌላ ሩብ አመት ወይም ትምህርት ይምረጡ</p>
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 8, fontWeight: 'bold', fill: '#57534e' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#78716c' }} axisLine={false} tickLine={false} />
                  <Tooltip content={customTooltip} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Subject comparison scorecard */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>📐 የሁሉም ትምህርቶች አማካይ ንፅፅር</span>
            </h4>
            <p className="text-[11px] text-stone-400">
              የዚህ ክፍል ተማሪዎች በተለያዩ የትምህርት አይነቶች ያላቸውን አማካይ ውጤት ያነጻጽሩ።
            </p>
          </div>

          <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
            {subjectsComparisonData.map((item, idx) => {
              const colors = [
                { bg: 'bg-emerald-500', text: 'text-emerald-700' },
                { bg: 'bg-indigo-500', text: 'text-indigo-700' },
                { bg: 'bg-amber-500', text: 'text-amber-700' },
                { bg: 'bg-rose-500', text: 'text-rose-700' },
                { bg: 'bg-purple-500', text: 'text-purple-700' },
                { bg: 'bg-blue-500', text: 'text-blue-700' }
              ];
              const clr = colors[idx % colors.length];

              return (
                <div key={item.subject} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-stone-800">📚 {item.subject}</span>
                    <span className={`font-black ${item.average >= 75 ? 'text-emerald-600' : item.average >= 50 ? 'text-indigo-600' : 'text-rose-600'}`}>
                      {item.average}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${clr.bg} transition-all duration-500`} 
                      style={{ width: `${item.average}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Student Trend over Terms & Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Student Termly Improvement Tracker */}
        <div className="lg:col-span-8 bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>📈 የተናጠል ተማሪ የውጤት ዕድገት መከታተያ (Student Progress)</span>
              </h4>
              <p className="text-[11px] text-stone-400">
                የአንድን ተማሪ ውጤት ከክፍሉ አማካይና ከልጁ አጠቃላይ አማካይ ጋር በየሩብ ዓመቱ ያነጻጽሩ።
              </p>
            </div>

            {/* Student Dropdown */}
            <select
              value={selectedStudentId}
              onChange={(e) => {
                playInteractiveSound('click');
                setSelectedStudentId(e.target.value);
              }}
              className="bg-stone-50 border border-stone-200 text-xs font-bold p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px]"
            >
              <option value="">-- ተማሪ ይምረጡ (Select Student) --</option>
              {classStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
          </div>

          {!selectedStudentId ? (
            <div className="h-72 border border-dashed border-stone-200 rounded-xl flex items-center justify-center text-stone-400 text-xs italic">
              እባክዎን የውጤት እድገት ሁኔታውን ለማየት ተማሪ ይምረጡ።
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studentTrendData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="termLabel" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#57534e' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#78716c' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#2e2a24', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                    
                    {/* Student Subject score line */}
                    <Line 
                      name={`${selectedSubject} ውጤት`} 
                      type="monotone" 
                      dataKey="studentSubjectScore" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      activeDot={{ r: 8 }} 
                      connectNulls
                    />
                    
                    {/* Student overall average line */}
                    <Line 
                      name="አጠቃላይ አማካይ ውጤታቸው (Overall Avg)" 
                      type="monotone" 
                      dataKey="studentOverallAverage" 
                      stroke="#059669" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      connectNulls
                    />

                    {/* Class average for subject line */}
                    <Line 
                      name="የክፍሉ አማካይ ውጤት (Class Avg)" 
                      type="monotone" 
                      dataKey="classSubjectAverage" 
                      stroke="#d97706" 
                      strokeWidth={1.5} 
                      strokeDasharray="3 3"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Mini analysis box for selected student */}
              {(() => {
                const studentScoresObj = studentTrendData.filter(d => d.studentSubjectScore !== null);
                if (studentScoresObj.length < 2) return null;
                const firstScoreObj = studentScoresObj[0];
                const lastScoreObj = studentScoresObj[studentScoresObj.length - 1];
                const firstScore = firstScoreObj.studentSubjectScore || 0;
                const lastScore = lastScoreObj.studentSubjectScore || 0;
                const change = lastScore - firstScore;

                return (
                  <div className="p-3.5 bg-stone-50 border border-stone-200/60 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <div className="text-left">
                        <span className="font-extrabold text-xs text-stone-800 block">የውጤት ትንተና ማሳሰቢያ፡</span>
                        <span className="text-[10px] text-stone-500 block">
                          የዚህ ተማሪ የ{selectedSubject} ውጤት ከመጀመሪያው ምዘና ወደ መጨረሻው ምዘና ሲታይ {' '}
                          <span className={`font-black ${change > 0 ? 'text-emerald-700' : change < 0 ? 'text-rose-700' : 'text-stone-700'}`}>
                            {change > 0 ? `በ +${change}% ጨምሯል` : change < 0 ? `በ ${change}% ቀንሷል` : 'ምንም ለውጥ አላሳየም'}
                          </span>።
                        </span>
                      </div>
                    </div>
                    <div>
                      {change > 0 ? (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-100 animate-pulse">
                          <TrendingUp className="w-3 h-3" /> ማሻሻል የታየበት
                        </span>
                      ) : change < 0 ? (
                        <span className="bg-rose-50 text-rose-800 text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 border border-rose-100">
                          <TrendingDown className="w-3 h-3" /> ድጋፍ የሚፈልግ
                        </span>
                      ) : (
                        <span className="bg-stone-100 text-stone-700 text-[10px] font-black uppercase px-2 py-1 rounded-md inline-block">
                          የተረጋጋ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Card: Improvement Leaders & Struggles lists */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Box 1: Improvement Leaders */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div>
              <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                <Sparkles className="w-3.5 h-3.5" /> በከፍተኛ ደረጃ ያሻሻሉ ተማሪዎች (Top Improvers)
              </h4>
              <p className="text-[10px] text-stone-400 mt-1">
                ከምዘና 1 እስከ ምዘና 4 በውጤታቸው ላይ የላቀ ብልጫ ያሳዩ ተማሪዎች።
              </p>
            </div>

            {improvementLeaders.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">በቂ ምዘናዎች አልተመዘገቡም (Terms 1 & 4 needed)</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {improvementLeaders.map((lead, idx) => (
                  <div key={`${lead.studentId}-${lead.subject}`} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-stone-900 block">{lead.studentName}</span>
                      <span className="text-[10px] text-stone-400 block font-bold">📚 {lead.subject}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-600 font-black block">+{lead.delta}% እድገት</span>
                      <span className="text-[9px] text-stone-400 font-mono font-bold block">
                        {lead.startScore}% ➜ {lead.endScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 2: Struggling Students Needing immediate attention */}
          <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div>
              <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-md inline-block">
                <AlertTriangle className="w-3.5 h-3.5" /> ከፍተኛ ድጋፍ የሚሹ ተማሪዎች (Needs Support)
              </h4>
              <p className="text-[10px] text-stone-400 mt-1">
                አማካይ ውጤታቸው ከ50% በታች የሆኑ ወይም የወደቁባቸው የትምህርት ክፍሎች የበዙ።
              </p>
            </div>

            {strugglingStudents.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-emerald-600 font-bold">🎉 ሁሉም ተማሪዎች ማለፊያ ነጥብ ላይ ናቸው!</p>
                <p className="text-[9px] text-stone-400">ከ 50% በታች የሆነ አማካይ ውጤት አልተገኘም።</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {strugglingStudents.map((st) => (
                  <div key={st.studentId} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-stone-950 block">{st.studentName}</span>
                      <span className="text-[9px] font-mono font-bold text-stone-400 block">ID: {st.studentId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-600 font-black block">አማካይ፡ {st.average}%</span>
                      {st.failingSubjectsCount > 0 && (
                        <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-100 font-bold">
                          {st.failingSubjectsCount} ት/ት የወደቀ
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 5. Teachers & Classroom Metadata Checklist Box */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/20 border border-indigo-100/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1.5">
            <GraduationCap className="w-4.5 h-4.5 text-indigo-700" />
            የአስተማሪ ትንታኔ ማስታወሻ (Instructor's Analytics Action Pad)
          </h4>
          <p className="text-[11px] text-stone-500 leading-relaxed max-w-2xl">
            እነዚህ የስታቲስቲክስ መረጃዎች በቀጥታ ከተመዘገቡት የልጅዎን ማርክ ሊስቶች የተቀመሩ ናቸው። ደካማ ጎን የታየባቸውን ተማሪዎች ለይተው በማውጣት ማጠናከሪያ (Tutorial) ለመስጠት፣ ወላጆችን ለማነጋገር፣ ወይም የክፍል አፈጻጸሙን ደረጃ ለማሳደግ ይጠቀሙባቸው።
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playInteractiveSound('success');
              alert('የተማሪዎች ውጤት ትንታኔ ሪፖርት በተሳካ ሁኔታ ተዘጋጅቷል!');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition-all hover:scale-[1.02]"
          >
            📊 የትንታኔ ሪፖርት አውጣ (Generate Report)
          </button>
        </div>
      </div>

    </div>
  );
};
