'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit3, Plus, Check, X, Circle, AlertCircle, RefreshCw } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      setErrorMsg(`Database Error: ${error.message}`);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setErrorMsg(null);
    const newNoteObj = { title: title.trim(), content: content.trim() };

    const { data, error } = await supabase
      .from('notes')
      .insert([newNoteObj])
      .select();

    if (error) {
      setErrorMsg(`Save Error: ${error.message}`);
    } else {
      setTitle('');
      setContent('');
      if (data && data.length > 0) {
        setNotes((prev) => [data[0], ...prev]);
      } else {
        fetchNotes();
      }
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const saveEdit = async (id: number) => {
    setErrorMsg(null);
    const { error } = await supabase
      .from('notes')
      .update({ title: editTitle, content: editContent })
      .eq('id', id);

    if (error) {
      setErrorMsg(`Update Error: ${error.message}`);
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title: editTitle, content: editContent } : n))
      );
      setEditingId(null);
    }
  };

  const deleteNote = async (id: number) => {
    setErrorMsg(null);
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      setErrorMsg(`Delete Error: ${error.message}`);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Microsoft To Do Blue Header */}
      <header className="bg-blue-600 text-white shadow-md py-6 px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cloud Notes & Tasks</h1>
            <p className="text-blue-100 text-xs mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={fetchNotes}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Sync
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm flex items-center gap-3">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Microsoft To Do Task Input Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <form onSubmit={addNote} className="space-y-3">
            <div className="flex items-center gap-3">
              <Plus className="text-blue-600 shrink-0" size={22} />
              <input
                type="text"
                placeholder="Add a note or task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-medium text-base focus:outline-none placeholder-slate-400"
                required
              />
            </div>
            {title && (
              <div className="pl-9 space-y-3 pt-2 border-t border-slate-100">
                <textarea
                  placeholder="Add description / details (optional)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Task Item List */}
        <div className="space-y-3">
          {loading && notes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
              <p className="font-semibold text-base text-slate-600">No notes yet</p>
              <p className="text-xs mt-1">Type in the box above to add your first note.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition p-4 flex flex-col gap-2"
              >
                {editingId === note.id ? (
                  /* Inline Editing View */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(note.id)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        <Check size={14} /> Save Changes
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Main View Item */
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Circle className="text-blue-500 shrink-0 mt-1" size={18} />
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-slate-900 leading-snug">
                          {note.title}
                        </h3>
                        {note.content && (
                          <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </p>
                        )}
                        <span className="inline-block text-[10px] text-slate-400 font-medium pt-1">
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Note"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}