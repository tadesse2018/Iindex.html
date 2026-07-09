import React, { useState } from 'react';
import { PlusCircle, BookOpen, Layers, CheckSquare, Square, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { ClassSetup } from '../schoolData';
import { playInteractiveSound } from './AudioEngine';

interface ClassSetupSectionProps {
  classes: ClassSetup[];
  onAddClass: (classObj: ClassSetup) => void;
  onEditClass?: (classObj: ClassSetup) => void;
  onDeleteClass?: (id: string) => void;
  schoolConfig?: any;
}

export const ClassSetupSection: React.FC<ClassSetupSectionProps> = ({ 
  classes, 
  onAddClass, 
  onEditClass,
  onDeleteClass,
  schoolConfig 
}) => {
  const activeGradesList = schoolConfig?.schoolLevel === 'secondary'
    ? ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
    : ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

  // Registration states
  const [grade, setGrade] = useState(activeGradesList[0] || 'Grade 1');
  const [section, setSection] = useState('A');
  const [stream, setStream] = useState('General');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit states
  const [editingClass, setEditingClass] = useState<ClassSetup | null>(null);
  const [editGrade, setEditGrade] = useState('');
  const [editSection, setEditSection] = useState('A');
  const [editStream, setEditStream] = useState('General');
  const [editSelectedSubjects, setEditSelectedSubjects] = useState<string[]>([]);

  // Delete state
  const [deletingClass, setDeletingClass] = useState<ClassSetup | null>(null);

  // Sync default grade on schoolLevel change
  React.useEffect(() => {
    setGrade(activeGradesList[0] || 'Grade 1');
  }, [schoolConfig?.schoolLevel]);

  const availableSubjects = schoolConfig?.subjects || [
    'Mathematics', 
    'English', 
    'Amharic', 
    'Science', 
    'Social Studies',
    'Physics',
    'Chemistry',
    'Biology',
    'Civics'
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
    if (selectedSubjects.length === 0) {
      alert('እባክዎን ቢያንስ አንድ የትምህርት አይነት ይምረጡ (Select at least one subject)');
      return;
    }

    // Check if class with same grade and section exists
    const duplicate = classes.find(c => c.grade === grade && c.section === section);
    if (duplicate) {
      alert('ይህ ክፍል እና ሴክሽን ቀድሞ ተመዝግቧል (This Class and Section combo already exists)');
      return;
    }

    const newClass: ClassSetup = {
      id: 'cls-' + Math.floor(1000 + Math.random() * 9000),
      grade,
      section,
      stream,
      subjects: selectedSubjects
    };

    playInteractiveSound('register');
    onAddClass(newClass);
    setSuccessMsg(`✅ የ ${grade} - ${section} ክፍል የትምህርት መመዝገቢያ በተሳካ ሁኔታ ተፈጥሯል!`);
    
    // Reset subjects
    setSelectedSubjects([]);
    
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleOpenEdit = (cls: ClassSetup) => {
    playInteractiveSound('click');
    setEditingClass(cls);
    setEditGrade(cls.grade);
    setEditSection(cls.section);
    setEditStream(cls.stream || 'General');
    setEditSelectedSubjects(cls.subjects);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    if (editSelectedSubjects.length === 0) {
      alert('እባክዎን ቢያንስ አንድ የትምህርት አይነት ይምረጡ (Select at least one subject)');
      return;
    }

    // Check duplicate (ignore current item)
    const duplicate = classes.find(c => c.id !== editingClass.id && c.grade === editGrade && c.section === editSection);
    if (duplicate) {
      alert('ይህ ክፍል እና ሴክሽን ቀድሞ ተመዝግቧል (This Class and Section combo already exists)');
      return;
    }

    const updatedClass: ClassSetup = {
      ...editingClass,
      grade: editGrade,
      section: editSection,
      stream: editStream,
      subjects: editSelectedSubjects
    };

    onEditClass?.(updatedClass);
    playInteractiveSound('register');
    setEditingClass(null);
  };

  const handleOpenDelete = (cls: ClassSetup) => {
    playInteractiveSound('wrong');
    setDeletingClass(cls);
  };

  const handleDeleteConfirm = () => {
    if (deletingClass && onDeleteClass) {
      onDeleteClass(deletingClass.id);
      playInteractiveSound('click');
      setDeletingClass(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="class-setup-module">
      
      {/* Subject Registration Form */}
      <div className="lg:col-span-5 bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-xs">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">ርዕሰ መምህር ተግባር</span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <PlusCircle className="text-indigo-600 w-5 h-5" /> በክፍል የትምህርት መመዝገቢያ ፎርም
          </h3>
          <p className="text-stone-400 text-xs">Configure grade levels, streams, and academic subjects</p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold rounded-xl animate-pulse">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ክፍል (Grade Level):</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
              >
                {activeGradesList.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ሴክሽን (Section):</label>
              <select 
                value={section}
                onChange={(e) => setSection(e.target.value)}
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
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የትምህርት ዘርፍ (Stream):</label>
            <select 
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
            >
              <option value="General">ጠቅላላ (General)</option>
              <option value="Natural Science">የተፈጥሮ ሳይንስ (Natural Science)</option>
              <option value="Social Science">የማህበራዊ ሳይንስ (Social Science)</option>
            </select>
          </div>

          {/* CHECKBOXES FOR SUBJECT LIST SELECTION */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              የትምህርት አይነቶች (Select Academic Subjects):
            </label>
            <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/50 max-h-48 overflow-y-auto">
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
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            ➕ የክፍል ትምህርት ፍጠር (Create Class Setup)
          </button>
        </form>
      </div>

      {/* Class List Table */}
      <div className="lg:col-span-7 bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="text-indigo-600 w-5 h-5" /> በክፍል የትምህርት ምዝገባዎች ዝርዝር
          </h3>
          <p className="text-stone-400 text-xs">Currently Configured Class academic configurations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="p-3 border-b border-stone-100">የክፍል ኮድ (Code)</th>
                <th className="p-3 border-b border-stone-100">ክፍል እና ሴክሽን</th>
                <th className="p-3 border-b border-stone-100">ዘርፍ (Stream)</th>
                <th className="p-3 border-b border-stone-100">የተመደቡ የትምህርት አይነቶች</th>
                <th className="p-3 border-b border-stone-100 text-center">እርምጃዎች</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-indigo-50/20 border-b border-stone-100 text-stone-800 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-700 text-xs">{cls.id}</td>
                  <td className="p-3 font-semibold text-stone-900">
                    {cls.grade} - {cls.section}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                      {cls.stream}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {cls.subjects.map((sub, idx) => (
                        <span key={idx} className="bg-stone-100 text-[10px] px-2 py-0.5 rounded text-stone-600 font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="ማስተካከል (Edit)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(cls)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="ማጥፋት (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400 italic">ምንም ክፍል አልተዋቀረም (No class setups found)</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <span className="font-extrabold text-stone-800 text-sm">የክፍል መረጃ ማስተካከያ (Edit Class Setup)</span>
              <button 
                onClick={() => { playInteractiveSound('click'); setEditingClass(null); }}
                className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ክፍል (Grade):</label>
                  <select 
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
                  >
                    {activeGradesList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ሴክሽን (Section):</label>
                  <select 
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
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
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የትምህርት ዘርፍ (Stream):</label>
                <select 
                  value={editStream}
                  onChange={(e) => setEditStream(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-medium"
                >
                  <option value="General">ጠቅላላ (General)</option>
                  <option value="Natural Science">የተፈጥሮ ሳይንስ (Natural Science)</option>
                  <option value="Social Science">የማህበራዊ ሳይንስ (Social Science)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5 font-sans">የተመደቡ የትምህርት አይነቶች (Subjects):</label>
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200/50 max-h-48 overflow-y-auto">
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
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { playInteractiveSound('click'); setEditingClass(null); }}
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

      {/* Delete Confirmation Modal */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-extrabold text-xs uppercase tracking-wider">የክፍል ምዝገባ ማጥፊያ ማስጠንቀቂያ</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-stone-800 text-xs font-semibold leading-relaxed">
                ⚠️ <strong className="text-rose-700">ማስጠንቀቂያ፡</strong> ክፍል <strong className="text-stone-950 font-black">"{deletingClass.grade} - {deletingClass.section}"</strong>ን በቋሚነት ከሲስተሙ ማጥፋት ይፈልጋሉ?
              </p>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                ይህንን ክፍል ሲያጠፉ ተያያዥነት ያላቸው የትምህርት አይነቶች ውቅሮች ከሲስተሙ ሙሉ በሙሉ ይሰረዛሉ። ይህ ተግባር ወደ ነበረበት ሊመለስ አይችልም።
              </p>
              
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { playInteractiveSound('click'); setDeletingClass(null); }}
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
