import React, { useState } from 'react';
import { PlusCircle, Users, GraduationCap, Phone, CheckSquare, Square, Shield, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { Teacher } from '../schoolData';
import { playInteractiveSound } from './AudioEngine';

interface TeacherSectionProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onEditTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (id: string) => void;
  schoolConfig?: any;
}

export const TeacherSection: React.FC<TeacherSectionProps> = ({ 
  teachers, 
  onAddTeacher, 
  onEditTeacher,
  onDeleteTeacher,
  schoolConfig 
}) => {
  const activeGradesList = schoolConfig?.schoolLevel === 'secondary'
    ? ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
    : ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

  // Registration Form States
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState('');
  const [educationLevel, setEducationLevel] = useState('Degree');
  const [phone, setPhone] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [assignedClass, setAssignedClass] = useState(activeGradesList[0] || 'Grade 1');
  const [assignedSection, setAssignedSection] = useState('A');
  const [isHomeroom, setIsHomeroom] = useState('No');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit State & Modal States
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'Male' | 'Female'>('Male');
  const [editAge, setEditAge] = useState('');
  const [editEducationLevel, setEditEducationLevel] = useState('Degree');
  const [editPhone, setEditPhone] = useState('');
  const [editSelectedSubjects, setEditSelectedSubjects] = useState<string[]>([]);
  const [editAssignedClass, setEditAssignedClass] = useState('');
  const [editAssignedSection, setEditAssignedSection] = useState('A');
  const [editIsHomeroom, setEditIsHomeroom] = useState('No');

  // Delete State & Warning Modal
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Sync default grade on schoolLevel change
  React.useEffect(() => {
    setAssignedClass(activeGradesList[0] || 'Grade 1');
  }, [schoolConfig?.schoolLevel]);

  const availableSubjects = schoolConfig?.subjects || [
    'Mathematics', 
    'English', 
    'Amharic', 
    'Science', 
    'Social Studies',
    'Physics',
    'Chemistry'
  ];

  const handleSubjectToggle = (subject: string, isEdit: boolean = false) => {
    playInteractiveSound('click');
    if (isEdit) {
      if (editSelectedSubjects.includes(subject)) {
        setEditSelectedSubjects(editSelectedSubjects.filter(s => s !== subject));
      } else {
        setEditSelectedSubjects([...editSelectedSubjects, subject]);
      }
    } else {
      if (selectedSubjects.includes(subject)) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
      } else {
        setSelectedSubjects([...selectedSubjects, subject]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('እባክዎን የመምህሩን ስም ያስገቡ (Please enter teacher name)');
      return;
    }
    if (!phone.trim()) {
      alert('እባክዎን ስልክ ቁጥር ያስገቡ (Please enter phone number)');
      return;
    }
    if (selectedSubjects.length === 0) {
      alert('እባክዎን ቢያንስ አንድ የሚያስተምሩት የትምህርት አይነት ይምረጡ (Select at least one subject)');
      return;
    }

    // Check for duplicate teacher by Name (case-insensitive) or Phone
    const duplicateByName = teachers.some(t => t.name.trim().toLowerCase() === name.trim().toLowerCase());
    const duplicateByPhone = teachers.some(t => t.phone.trim() === phone.trim());

    if (duplicateByName) {
      playInteractiveSound('wrong');
      alert(`⚠️ መምህር "${name.trim()}" ቀደም ሲል በሲስተሙ ውስጥ ተመዝግቧል! (Teacher "${name.trim()}" is already registered!)`);
      return;
    }
    if (duplicateByPhone) {
      playInteractiveSound('wrong');
      alert(`⚠️ ይህ የስልክ ቁጥር (${phone.trim()}) በሌላ መምህር ተመዝግቧል! (This phone number is already registered!)`);
      return;
    }

    const randomId = 'TCH-' + Math.floor(1000 + Math.random() * 9000);
    const ageVal = age.trim() ? parseInt(age.trim(), 10) : undefined;
    const newTeacher: Teacher = {
      id: randomId,
      name: name.trim(),
      gender,
      age: ageVal && !isNaN(ageVal) ? ageVal : undefined,
      educationLevel,
      phone: phone.trim(),
      subjects: selectedSubjects,
      assignedClass,
      assignedSection,
      isHomeroomTeacher: isHomeroom === 'Yes',
      registeredBy: 'principal@school.com',
      timestamp: new Date().toISOString()
    };

    playInteractiveSound('register');
    onAddTeacher(newTeacher);
    setSuccessMsg(`✅ መምህር ${name} በተሳካ ሁኔታ ተመዝግቧል! መታወቂያው፡ ${randomId} ነው`);
    
    // Reset Form
    setName('');
    setPhone('');
    setSelectedSubjects([]);
    setEducationLevel('Degree');
    setIsHomeroom('No');
    setAge('');
    setGender('Male');
    
    setTimeout(() => setSuccessMsg(null), 6000);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    playInteractiveSound('click');
    setEditingTeacher(teacher);
    setEditName(teacher.name);
    setEditGender(teacher.gender || 'Male');
    setEditAge(teacher.age ? String(teacher.age) : '');
    setEditEducationLevel(teacher.educationLevel);
    setEditPhone(teacher.phone);
    setEditSelectedSubjects(teacher.subjects);
    setEditAssignedClass(teacher.assignedClass);
    setEditAssignedSection(teacher.assignedSection);
    setEditIsHomeroom(teacher.isHomeroomTeacher ? 'Yes' : 'No');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editName.trim()) {
      alert('እባክዎን የመምህሩን ስም ያስገቡ (Please enter teacher name)');
      return;
    }
    if (!editPhone.trim()) {
      alert('እባክዎን ስልክ ቁጥር ያስገቡ (Please enter phone number)');
      return;
    }
    if (editSelectedSubjects.length === 0) {
      alert('እባክዎን ቢያንስ አንድ የሚያስተምሩት የትምህርት አይነት ይምረጡ (Select at least one subject)');
      return;
    }

    const ageVal = editAge.trim() ? parseInt(editAge.trim(), 10) : undefined;
    const updatedTeacher: Teacher = {
      ...editingTeacher,
      name: editName.trim(),
      gender: editGender,
      age: ageVal && !isNaN(ageVal) ? ageVal : undefined,
      educationLevel: editEducationLevel,
      phone: editPhone.trim(),
      subjects: editSelectedSubjects,
      assignedClass: editAssignedClass,
      assignedSection: editAssignedSection,
      isHomeroomTeacher: editIsHomeroom === 'Yes'
    };

    onEditTeacher?.(updatedTeacher);
    playInteractiveSound('register');
    setEditingTeacher(null);
  };

  const handleOpenDelete = (teacher: Teacher) => {
    playInteractiveSound('wrong');
    setDeletingTeacher(teacher);
  };

  const handleDeleteConfirm = () => {
    if (deletingTeacher && onDeleteTeacher) {
      onDeleteTeacher(deletingTeacher.id);
      playInteractiveSound('click');
      setDeletingTeacher(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="teachers-module">
      
      {/* Registration Form */}
      <div className="lg:col-span-5 bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-xs">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">ርዕሰ መምህር ተግባር</span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <PlusCircle className="text-indigo-600 w-5 h-5" /> አዲስ መምህር መመዝገቢያ ፎርም
          </h3>
          <p className="text-stone-400 text-xs">Register and assign teaching staff roles and sections</p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold rounded-xl animate-pulse">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የመምህሩ ሙሉ ስም (Teacher Name):</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="አቶ በቀለ አስማማው"
              className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የትምህርት ደረጃ (Education):</label>
              <select 
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
              >
                <option value="Diploma">ዲፕሎማ (Diploma)</option>
                <option value="Degree">መጀመሪያ ዲግሪ (Degree)</option>
                <option value="Masters">ማስተርስ ዲግሪ (Masters)</option>
                <option value="PhD">ፒኤችዲ (PhD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ስልክ ቁጥር (Phone):</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0911XXXXXX"
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ጾታ (Gender):</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
              >
                <option value="Male">ወንድ (M)</option>
                <option value="Female">ሴት (F)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ዕድሜ (Age):</label>
              <input 
                type="number"
                min="18"
                max="80"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="32"
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50 font-medium"
              />
            </div>
          </div>

          {/* CHECKBOXES FOR SUBJECT SELECTION */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              የሚያስተምረው የትምህርት አይነት (Subjects taught):
            </label>
            <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/50 max-h-40 overflow-y-auto">
              {availableSubjects.map((sub) => {
                const isChecked = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubjectToggle(sub, false)}
                    className="flex items-center gap-2 text-left p-1.5 hover:bg-stone-100 rounded-lg text-xs text-stone-700 transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                    <span className="truncate">{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ክፍል (Class Allocation):</label>
              <select 
                value={assignedClass}
                onChange={(e) => setAssignedClass(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white"
              >
                {activeGradesList.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ሴክሽን (Section):</label>
              <select 
                value={assignedSection}
                onChange={(e) => setAssignedSection(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
          </div>

          {/* HOMEROOM TEACHER DROPDOWN */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              የክፍል አላፊ/ተጠሪ መምህር (Homeroom Teacher?):
            </label>
            <select 
              value={isHomeroom}
              onChange={(e) => setIsHomeroom(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
            >
              <option value="No">አይደለም (No)</option>
              <option value="Yes">አዎ የክፍል አላፊ ነው (Yes, Homeroom)</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            💾 መምህር መዝግብ (Register Teacher)
          </button>
        </form>
      </div>

      {/* Registered Teachers List */}
      <div className="lg:col-span-7 bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <Users className="text-indigo-600 w-5 h-5" /> በሲስተሙ የተመዘገቡ መምህራን ዝርዝር
          </h3>
          <p className="text-stone-400 text-xs">Active Teaching Staff Database</p>
        </div>

        {/* Mobile-Friendly Cards (Visible on mobile/tablet, hidden on desktop) */}
        <div className="lg:hidden space-y-4">
          {[...teachers].sort((a, b) => a.name.localeCompare(b.name, 'am')).map((teacher) => (
            <div key={teacher.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3.5 shadow-xs">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-mono font-black text-indigo-700 text-[10px] bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full">{teacher.id}</span>
                  <h4 className="font-bold text-stone-900 text-sm mt-1">{teacher.name}</h4>
                  {teacher.isHomeroomTeacher && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mt-1">
                      <Shield className="w-2.5 h-2.5" /> የክፍል አላፊ (Homeroom)
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => { playInteractiveSound('click'); handleOpenEdit(teacher); }}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                    title="ማስተካከል (Edit)"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { playInteractiveSound('click'); handleOpenDelete(teacher); }}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="ማጥፋት (Delete)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2.5 border-t border-stone-200/60 text-stone-700">
                <div>
                  <span className="text-stone-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">የት/ት ደረጃ</span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-bold">
                    {teacher.educationLevel}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">ስልክ ቁጥር</span>
                  <span className="font-mono text-[11px] font-medium text-stone-800">{teacher.phone}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">ጾታ እና ዕድሜ</span>
                  <span className="font-bold text-stone-850 text-[11px]">
                    {teacher.gender === 'Female' ? '👩 ሴት' : '👨 ወንድ'} {teacher.age ? `• ${teacher.age} ዓመት` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">ክፍል / ሴክሽን</span>
                  <span className="font-bold text-stone-850 text-[11px]">
                    {teacher.assignedClass} - {teacher.assignedSection}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 font-bold block text-[9px] uppercase tracking-wider mb-0.5">የሚያስተምረው</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {teacher.subjects.map((sub, idx) => (
                      <span key={idx} className="bg-stone-205 text-stone-700 border border-stone-200/50 text-[9px] px-1.5 py-0.5 rounded font-medium truncate">
                        {sub.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="p-8 text-center text-stone-400 italic text-xs">ምንም መምህር አልተመዘገበም (No teachers registered yet)</div>
          )}
        </div>

        {/* Desktop-Friendly Table (Hidden on mobile/tablet, visible on desktop) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3 border-b border-stone-100">አይዲ (ID)</th>
                <th className="p-3 border-b border-stone-100">የመምህር ስም</th>
                <th className="p-3 border-b border-stone-100">ጾታ</th>
                <th className="p-3 border-b border-stone-100">ዕድሜ</th>
                <th className="p-3 border-b border-stone-100">የት/ት ደረጃ</th>
                <th className="p-3 border-b border-stone-100">ስልክ ቁጥር</th>
                <th className="p-3 border-b border-stone-100">ክፍል / ሴክሽን</th>
                <th className="p-3 border-b border-stone-100">የሚያስተምረው</th>
                <th className="p-3 border-b border-stone-100 text-center">እርምጃዎች</th>
              </tr>
            </thead>
            <tbody>
              {[...teachers].sort((a, b) => a.name.localeCompare(b.name, 'am')).map((teacher) => (
                <tr key={teacher.id} className="hover:bg-indigo-50/20 border-b border-stone-100 text-stone-800 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-700 text-xs">{teacher.id}</td>
                  <td className="p-3 font-semibold text-stone-900">
                    <div className="flex flex-col">
                      <span>{teacher.name}</span>
                      {teacher.isHomeroomTeacher && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 w-max px-1.5 py-0.5 rounded mt-0.5">
                          <Shield className="w-2.5 h-2.5" /> የክፍል አላፊ (Homeroom)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-xs">{teacher.gender === 'Female' ? '👩 ሴት' : '👨 ወንድ'}</td>
                  <td className="p-3 text-xs font-bold text-stone-600">{teacher.age ? `${teacher.age} ዓመት` : '-'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                      {teacher.educationLevel}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs text-stone-600">{teacher.phone}</td>
                  <td className="p-3">
                    <span className="text-xs font-bold text-stone-700">
                      {teacher.assignedClass} - {teacher.assignedSection}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-40">
                      {teacher.subjects.map((sub, idx) => (
                        <span key={idx} className="bg-stone-100 text-[10px] px-1.5 py-0.5 rounded text-stone-600 truncate">
                          {sub.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(teacher)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="ማስተካከል (Edit)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(teacher)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="ማጥፋት (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-400 italic">ምንም መምህር አልተመዘገበም (No teachers registered yet)</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <span className="font-extrabold text-stone-800 text-sm">የመምህር መረጃ ማስተካከያ (Edit Teacher)</span>
              <button 
                onClick={() => { playInteractiveSound('click'); setEditingTeacher(null); }}
                className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የመምህሩ ሙሉ ስም (Teacher Name):</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የትምህርት ደረጃ:</label>
                  <select 
                    value={editEducationLevel}
                    onChange={(e) => setEditEducationLevel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
                  >
                    <option value="Diploma">ዲፕሎማ (Diploma)</option>
                    <option value="Degree">መጀመሪያ ዲግሪ (Degree)</option>
                    <option value="Masters">ማስተርስ ዲግሪ (Masters)</option>
                    <option value="PhD">ፒኤችዲ (PhD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ስልክ ቁጥር (Phone):</label>
                  <input 
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ጾታ (Gender):</label>
                  <select 
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
                  >
                    <option value="Male">ወንድ (M)</option>
                    <option value="Female">ሴት (F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ዕድሜ (Age):</label>
                  <input 
                    type="number"
                    min="18"
                    max="80"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">የሚያስተምረው የትምህርት አይነት (Subjects):</label>
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/50 max-h-40 overflow-y-auto">
                  {availableSubjects.map((sub) => {
                    const isChecked = editSelectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSubjectToggle(sub, true)}
                        className="flex items-center gap-2 text-left p-1.5 hover:bg-stone-100 rounded-lg text-xs text-stone-700 transition-colors"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                        <span className="truncate">{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ክፍል (Class):</label>
                  <select 
                    value={editAssignedClass}
                    onChange={(e) => setEditAssignedClass(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white"
                  >
                    {activeGradesList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ሴክሽን (Section):</label>
                  <select 
                    value={editAssignedSection}
                    onChange={(e) => setEditAssignedSection(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
                  >
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የክፍል አላፊ/ተጠሪ መምህር:</label>
                <select 
                  value={editIsHomeroom}
                  onChange={(e) => setEditIsHomeroom(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
                >
                  <option value="No">አይደለም (No)</option>
                  <option value="Yes">አዎ የክፍል አላፊ ነው (Yes, Homeroom)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { playInteractiveSound('click'); setEditingTeacher(null); }}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  ይቅር (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  💾 አስቀምጥ (Save Changes)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-extrabold text-xs uppercase tracking-wider">የመምህር መዝገብ ማጥፊያ ማስጠንቀቂያ</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-stone-800 text-xs font-semibold leading-relaxed">
                ⚠️ <strong className="text-rose-700">ማስጠንቀቂያ፡</strong> መምህር <strong className="text-stone-950 font-black">"{deletingTeacher.name}"</strong>ን በቋሚነት ከሲስተሙ ማጥፋት ይፈልጋሉ?
              </p>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                ይህንን መምህር ሲያጠፉ ተያያዥነት ያላቸው መዛግብቶች በሙሉ ከዳታቤዝ ይሰረዛሉ። ይህ ተግባር ወደ ነበረበት ሊመለስ አይችልም።
              </p>
              
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { playInteractiveSound('click'); setDeletingTeacher(null); }}
                  className="flex-1 py-2 border border-stone-200 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  አይ፣ ይቅር (Cancel)
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  አዎ፣ አጥፋ (Delete)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
