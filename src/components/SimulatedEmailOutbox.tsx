import React, { useState, useEffect } from 'react';
import { Mail, Trash2, ChevronDown, ChevronUp, CheckCircle, Clock, Info, Send } from 'lucide-react';
import { ParentNotificationService, SimulatedEmail } from '../lib/notificationService';
import { motion, AnimatePresence } from 'motion/react';

export const SimulatedEmailOutbox: React.FC = () => {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = ParentNotificationService.subscribe((updatedEmails) => {
      setEmails(updatedEmails);
    });
    return unsubscribe;
  }, []);

  const handleClear = () => {
    if (window.confirm('ሁሉንም የተላኩ የኢሜል ሲሙሌሽን ማሳወቂያዎችን ማጥፋት ይፈልጋሉ? (Are you sure you want to clear all simulated emails?)')) {
      ParentNotificationService.clearInbox();
      setExpandedId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('am-ET', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm animate-pulse">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-stone-900">
                📧 የወላጅ ኢሜል ማሳወቂያ ሲሙሌተር
              </h3>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-bounce">
                Simulation Active
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              ተማሪ ሲመዘገብ ለወላጅ በራስ-ሰር የሚላኩ የኢሜል ማሳወቂያዎች መከታተያ (Simulated automated outbox for parent notification triggers)
            </p>
          </div>
        </div>
        
        {emails.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl font-bold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ሲሙሌሽን አጽዳ (Clear Outbox)</span>
          </button>
        )}
      </div>

      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-indigo-100 rounded-xl bg-white/60">
          <div className="p-3 bg-stone-50 text-stone-400 rounded-full mb-3">
            <Send className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h4 className="text-sm font-bold text-stone-700">እስካሁን የተላከ የኢሜል ማሳወቂያ የለም</h4>
          <p className="text-xs text-stone-400 max-w-md mt-1.5 leading-relaxed">
            በPrincipal ወይም በTeacher ክፍል ውስጥ አዲስ ተማሪ በተሳካ ሁኔታ ሲመዘገብ፣ ለወላጅ በራስ-ሰር የሚላከው የኢሜል ማሳወቂያ እዚህ ላይ በቀጥታ ይፈጠራል!
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/40">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>የወላጅ ኢሜል ባይሞላም ሲስተሙ በራስ-ሰር አስመስሎ ይልካል። (Always simulates even if parent email is left blank!)</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {emails.map((email) => {
              const isExpanded = expandedId === email.id;
              return (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`border rounded-xl transition-all ${
                    isExpanded 
                      ? 'border-indigo-400 bg-white shadow-md' 
                      : 'border-stone-150 bg-white hover:border-indigo-200 hover:shadow-xs'
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : email.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-50 text-stone-500'}`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-black text-stone-900 truncate">
                            {email.studentName}
                          </span>
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                            {email.studentId}
                          </span>
                          <span className="text-[10px] text-stone-400 font-medium">
                            ወደ: {email.to}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-stone-700 mt-1 truncate">
                          {email.subject}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                      <span className="text-[10px] text-stone-400 font-mono">
                        ⏱️ {formatDate(email.timestamp)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {email.status === 'Delivered' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            ደርሷል (Delivered)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                            በመላክ ላይ... (Sending)
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Email Body Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-stone-150"
                      >
                        <div className="p-4 bg-slate-50/50 space-y-3">
                          {/* Simulated Email Client Header */}
                          <div className="bg-white border border-stone-200/60 rounded-lg p-3 text-xs space-y-1.5 shadow-2xs">
                            <div className="flex justify-between border-b border-stone-100 pb-1.5 mb-1.5 text-stone-400">
                              <span className="font-semibold uppercase tracking-wider text-[9px] text-indigo-600/80">Simulated Email Client (ኢሜይል ሲሙሌተር)</span>
                              <span className="font-mono text-[9px]">{email.id}</span>
                            </div>
                            <div>
                              <strong className="text-stone-500">ከ (From):</strong> <span className="text-stone-800 font-bold">office@kibrschool.edu (የክብር መካከለኛ ደረጃ ትምህርት ቤት)</span>
                            </div>
                            <div>
                              <strong className="text-stone-500">ለ (To):</strong> <span className="text-indigo-600 font-bold font-mono">{email.to}</span>
                            </div>
                            <div>
                              <strong className="text-stone-500">ርዕስ (Subject):</strong> <span className="text-stone-800 font-extrabold">{email.subject}</span>
                            </div>
                          </div>

                          {/* Email Content Box */}
                          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                            {/* Brand Header */}
                            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🏫</span>
                                <div>
                                  <h5 className="font-black text-stone-900 text-xs tracking-tight">ኪብር መካከለኛ ደረጃ ትምህርት ቤት</h5>
                                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Kibr Middle School</p>
                                </div>
                              </div>
                              <span className="text-[9px] text-stone-400 font-mono">{new Date(email.timestamp).toLocaleDateString('am-ET')}</span>
                            </div>

                            {/* Main Text Content */}
                            <div className="text-stone-700 text-xs leading-relaxed space-y-3 whitespace-pre-line font-medium border-l-2 border-indigo-500/30 pl-3">
                              {email.body}
                            </div>

                            {/* Footer Banner */}
                            <div className="border-t border-stone-100 pt-3 text-[10px] text-stone-400 text-center">
                              ይህ የኢሜል ማሳወቂያ ሲሙሌሽን ማሳያ ሲሆን ተማሪ ሲመዘገብ የሚላክበትን ትክክለኛ ሁኔታ ያሳያል።
                              <br />
                              <span className="font-mono text-[9px]">© 2026 Kibr School Management System. All rights reserved.</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
