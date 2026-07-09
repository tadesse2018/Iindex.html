import React, { useState } from 'react';
import { PlusCircle, Megaphone, Target, Calendar, User, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { Announcement } from '../schoolData';
import { playInteractiveSound } from './AudioEngine';

interface AnnouncementSectionProps {
  announcements: Announcement[];
  onAddAnnouncement: (ann: Announcement) => void;
  onEditAnnouncement?: (ann: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const AnnouncementSection: React.FC<AnnouncementSectionProps> = ({ 
  announcements, 
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement
}) => {
  // Post state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'Parents' | 'Teachers' | 'Both'>('Both');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit state
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTarget, setEditTarget] = useState<'Parents' | 'Teachers' | 'Both'>('Both');

  // Delete state
  const [deletingAnn, setDeletingAnn] = useState<Announcement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('እባክዎን ርዕስ እና ማብራሪያ ያስገቡ (Please fill all fields)');
      return;
    }

    const newAnn: Announcement = {
      id: 'ann-' + Math.floor(1000 + Math.random() * 9000),
      title: title.trim(),
      content: content.trim(),
      target,
      postedBy: 'principal@school.com',
      timestamp: new Date().toISOString()
    };

    playInteractiveSound('register');
    onAddAnnouncement(newAnn);
    setSuccessMsg(`✅ ማስታወቂያው በተሳካ ሁኔታ ተለጥፏል!`);
    
    // Reset form
    setTitle('');
    setContent('');
    setTarget('Both');

    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleOpenEdit = (ann: Announcement) => {
    playInteractiveSound('click');
    setEditingAnn(ann);
    setEditTitle(ann.title);
    setEditContent(ann.content);
    setEditTarget(ann.target);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;
    if (!editTitle.trim() || !editContent.trim()) {
      alert('እባክዎን ርዕስ እና ማብራሪያ ያስገቡ (Please fill all fields)');
      return;
    }

    const updatedAnn: Announcement = {
      ...editingAnn,
      title: editTitle.trim(),
      content: editContent.trim(),
      target: editTarget
    };

    onEditAnnouncement?.(updatedAnn);
    playInteractiveSound('register');
    setEditingAnn(null);
  };

  const handleOpenDelete = (ann: Announcement) => {
    playInteractiveSound('wrong');
    setDeletingAnn(ann);
  };

  const handleDeleteConfirm = () => {
    if (deletingAnn && onDeleteAnnouncement) {
      onDeleteAnnouncement(deletingAnn.id);
      playInteractiveSound('click');
      setDeletingAnn(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="announcements-module">
      
      {/* Post Announcement Form */}
      <div className="lg:col-span-5 bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-xs">
        <div>
          <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">ርዕሰ መምህር ተግባር</span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 mt-1">
            <PlusCircle className="text-amber-500 w-5 h-5" /> የማስታወቅያ መለጠፊያ ፎርም
          </h3>
          <p className="text-stone-400 text-xs">Broadcast urgent notices and newsletters to the community</p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-semibold rounded-xl">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የማስታወቂያው ርዕስ (Notice Title):</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="የወላጅና መምህራን ምክክር ስብሰባ"
              className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50"
              required
            />
          </div>

          {/* TARGET AUDIENCE DROPDOWN */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የማስታወቂያው ተደራሽነት (Target Audience):</label>
            <select 
              value={target}
              onChange={(e) => setTarget(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-semibold text-stone-800"
            >
              <option value="Both">ለሁሉም - መምህራን እና ወላጆች (Both Parents & Teachers)</option>
              <option value="Parents">ለወላጆች ብቻ (Parents Only)</option>
              <option value="Teachers">ለመምህራን ብቻ (Teachers Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ዝርዝር መግለጫ (Notice Description):</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="ዝርዝር መልዕክቱን እዚህ ይጻፉ..."
              className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            📢 ማስታወቂያውን ልጥፍ (Post Announcement)
          </button>
        </form>
      </div>

      {/* Announcements Board list */}
      <div className="lg:col-span-7 bg-white border border-stone-200 p-6 rounded-2xl space-y-4 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <Megaphone className="text-amber-500 w-5 h-5" /> የቀደሙ ማስታወቂያዎች ሰሌዳ (Notice Board)
          </h3>
          <p className="text-stone-400 text-xs">Urgent notices and memos currently active</p>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {announcements.map((ann) => (
            <div 
              key={ann.id} 
              className={`p-4 rounded-2xl border transition-all ${
                ann.target === 'Parents' ? 'bg-amber-50/30 border-amber-100' :
                ann.target === 'Teachers' ? 'bg-indigo-50/30 border-indigo-100' :
                'bg-stone-50/50 border-stone-200/60'
              }`}
            >
              <div className="flex justify-between items-start gap-2 flex-wrap mb-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-md border ${
                  ann.target === 'Parents' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                  ann.target === 'Teachers' ? 'bg-indigo-100 text-indigo-900 border-indigo-200' :
                  'bg-stone-100 text-stone-800 border-stone-200'
                }`}>
                  <Target className="w-3 h-3" />
                  <span>
                    {ann.target === 'Parents' ? 'ለወላጆች (Parents)' :
                     ann.target === 'Teachers' ? 'ለመምህራን (Teachers)' :
                     'ለሁሉም (Everyone)'}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-400 font-semibold font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(ann.timestamp).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-0.5 no-print">
                    <button
                      onClick={() => handleOpenEdit(ann)}
                      className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="ማስተካከል (Edit)"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(ann)}
                      className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                      title="ማጥፋት (Delete)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <h4 className="font-extrabold text-stone-900 text-sm md:text-base mb-1.5">{ann.title}</h4>
              <p className="text-xs md:text-sm text-stone-600 leading-relaxed whitespace-pre-line">{ann.content}</p>

              <div className="pt-2.5 mt-2.5 border-t border-stone-100 flex justify-between items-center text-[10px] text-stone-400 font-semibold">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> ርዕሰ መምህር</span>
                <span>ID: {ann.id}</span>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="text-center p-8 text-stone-400 italic">ምንም ማስታወቂያ አልተለጠፈም (No announcements posted)</div>
          )}
        </div>
      </div>

      {/* Edit Announcement Modal */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <span className="font-extrabold text-stone-800 text-sm">የማስታወቂያ መረጃ ማስተካከያ (Edit Notice)</span>
              <button 
                onClick={() => { playInteractiveSound('click'); setEditingAnn(null); }}
                className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የማስታወቂያው ርዕስ (Notice Title):</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">የማስታወቂያው ተደራሽነት:</label>
                <select 
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 outline-none bg-white font-semibold text-stone-800"
                >
                  <option value="Both">ለሁሉም - መምህራን እና ወላጆች (Both Parents & Teachers)</option>
                  <option value="Parents">ለወላጆች ብቻ (Parents Only)</option>
                  <option value="Teachers">ለመምህራን ብቻ (Teachers Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 mb-1">ዝርዝር መግለጫ (Notice Description):</label>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl border border-stone-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-stone-50/50"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { playInteractiveSound('click'); setEditingAnn(null); }}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  ይቅር (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  💾 አስቀምጥ (Save Changes)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      {deletingAnn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="font-extrabold text-xs uppercase tracking-wider">የማስታወቂያ መዝገብ ማጥፊያ ማስጠንቀቂያ</span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-stone-800 text-xs font-semibold leading-relaxed">
                ⚠️ <strong className="text-rose-700">ማስጠንቀቂያ፡</strong> ማስታወቂያ <strong className="text-stone-950 font-black">"{deletingAnn.title}"</strong>ን በቋሚነት ከሲስተሙ ማጥፋት ይፈልጋሉ?
              </p>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                ይህንን ማስታወቂያ ሲያጠፉ ከወላጆችና መምህራን ሰሌዳ ላይ ሙሉ በሙሉ ይወገዳል። ይህ ተግባር ወደ ነበረበት ሊመለስ አይችልም።
              </p>
              
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { playInteractiveSound('click'); setDeletingAnn(null); }}
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
