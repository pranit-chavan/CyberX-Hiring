"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ChapterDashboard() {
    const [chapter, setChapter] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [message, setMessage] = useState({ text: '', type: '' });
    const router = useRouter();

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        const stored = localStorage.getItem('chapter-user');
        if (!stored) { router.push('/chapters/login'); return; }
        const userData = JSON.parse(stored);
        setUser(userData);
        if (userData.role === 'super_admin') { router.push('/chapters/admin'); return; }
        if (!userData.chapterId) { setLoading(false); return; }
        fetchChapter(userData.chapterId);
    }, [router]);

    const fetchChapter = async (id) => {
        try {
            const res = await fetch(`/api/chapters/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setChapter(data.chapter);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const saveField = async (updates) => {
        try {
            const res = await fetch(`/api/chapters/${chapter._id}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(updates) });
            const data = await res.json();
            if (res.ok) { setChapter(data.chapter); showMsg('Saved!'); }
            else showMsg(data.error || 'Failed', 'error');
        } catch { showMsg('Network error', 'error'); }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('auth-token');
        localStorage.removeItem('chapter-user');
        router.push('/chapters/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-cyber-yellow border-t-transparent rounded-full"></div></div>;

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <div className="border-b border-cyber-border px-6 md:px-16 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative w-32 h-10"><Image src="/assets/logo.png" alt="CyberX" fill className="object-contain" priority /></div>
                    <span className="text-cyber-text-muted text-sm hidden sm:inline">/ Chapter Dashboard</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-cyber-text-secondary hidden sm:inline">{user?.username}</span>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm border border-cyber-border rounded-lg text-cyber-text-secondary hover:text-white hover:border-cyber-yellow/40 transition-all cursor-pointer">Logout</button>
                </div>
            </div>

            <main className="px-6 md:px-16 lg:px-24 py-10">
                {!chapter ? (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-poppins font-semibold text-white mb-2">No Chapter Assigned</h2>
                        <p className="text-cyber-text-secondary text-sm">Contact your super admin to get assigned to a chapter.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-poppins font-bold text-white">CyberX <span className="text-cyber-yellow">{chapter.city}</span></h1>
                                <p className="text-cyber-text-secondary text-sm mt-1">{chapter.state} • {chapter.status === 'active' ? '● Active' : 'Coming Soon'}</p>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`mb-6 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>{message.text}</div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-1 mb-8 bg-cyber-card rounded-lg p-1 w-fit border border-cyber-border">
                            {['details', 'events', 'sponsors'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer capitalize ${activeTab === tab ? 'bg-cyber-yellow text-black' : 'text-cyber-text-secondary hover:text-white'}`}>{tab}</button>
                            ))}
                        </div>

                        {activeTab === 'details' && <DetailsTab chapter={chapter} onSave={saveField} />}
                        {activeTab === 'events' && <EventsTab chapter={chapter} onSave={saveField} showMsg={showMsg} />}
                        {activeTab === 'sponsors' && <SponsorsTab chapter={chapter} onSave={saveField} showMsg={showMsg} />}
                    </>
                )}
            </main>
        </div>
    );
}

/* ─── Details Tab ─── */
function DetailsTab({ chapter, onSave }) {
    const [form, setForm] = useState({});
    const [editing, setEditing] = useState(false);

    useEffect(() => { setForm({ lead: chapter.lead || '', members: chapter.members || '', events: chapter.events ?? '', description: chapter.description || '', linkedin: chapter.linkedin || '', instagram: chapter.instagram || '', highlights: (chapter.highlights || []).join(', ') }); }, [chapter]);

    const save = () => {
        onSave({ ...form, events: form.events ? Number(form.events) : null, highlights: form.highlights.split(',').map(s => s.trim()).filter(Boolean) });
        setEditing(false);
    };

    return (
        <div className="pro-card rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-poppins font-semibold text-white">Chapter Details</h3>
                {!editing ? (
                    <button onClick={() => setEditing(true)} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">Edit</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="px-5 py-2 border border-cyber-border rounded-lg text-cyber-text-secondary text-sm cursor-pointer">Cancel</button>
                        <button onClick={save} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">Save</button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                    { key: 'lead', label: 'Chapter Lead' }, { key: 'members', label: 'Members' },
                    { key: 'events', label: 'Events Count', type: 'number' }, { key: 'linkedin', label: 'LinkedIn URL' },
                    { key: 'instagram', label: 'Instagram URL' }, { key: 'highlights', label: 'Highlights (comma-separated)' },
                ].map(f => (
                    <div key={f.key}>
                        <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">{f.label}</label>
                        {editing ? <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro" /> : <p className="text-sm text-white">{form[f.key] || '—'}</p>}
                    </div>
                ))}
            </div>
            <div className="mt-5">
                <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Description</label>
                {editing ? <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro resize-y" /> : <p className="text-sm text-cyber-text-secondary leading-relaxed">{form.description || '—'}</p>}
            </div>
        </div>
    );
}

/* ─── Events Tab ─── */
function EventsTab({ chapter, onSave, showMsg }) {
    const [events, setEvents] = useState(chapter.eventsList || []);
    const [showForm, setShowForm] = useState(false);
    const [editIdx, setEditIdx] = useState(null);
    const [form, setForm] = useState({ title: '', date: '', time: '', location: '', type: 'Event', description: '', status: 'upcoming' });

    useEffect(() => { setEvents(chapter.eventsList || []); }, [chapter]);

    const openNew = () => { setEditIdx(null); setForm({ title: '', date: '', time: '', location: '', type: 'Event', description: '', status: 'upcoming' }); setShowForm(true); };
    const openEdit = (i) => { setEditIdx(i); setForm({ ...events[i] }); setShowForm(true); };

    const save = () => {
        const updated = [...events];
        if (editIdx !== null) updated[editIdx] = form;
        else updated.push(form);
        onSave({ eventsList: updated });
        setEvents(updated);
        setShowForm(false);
    };

    const remove = (i) => {
        const updated = events.filter((_, idx) => idx !== i);
        onSave({ eventsList: updated });
        setEvents(updated);
        showMsg('Event removed');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-poppins font-semibold text-white">Events ({events.length})</h3>
                <button onClick={openNew} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">+ Add Event</button>
            </div>

            {events.length === 0 && <div className="pro-card rounded-xl p-10 text-center text-cyber-text-muted text-sm">No events yet. Add your first event.</div>}

            <div className="space-y-3">
                {events.map((ev, i) => (
                    <div key={i} className="pro-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${ev.status === 'upcoming' ? 'bg-cyber-yellow/15 text-cyber-yellow' : 'bg-white/5 text-white/40'}`}>{ev.status}</span>
                                <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">{ev.type}</span>
                            </div>
                            <h4 className="font-semibold text-white text-sm">{ev.title}</h4>
                            <p className="text-xs text-cyber-text-muted">{ev.date} {ev.time ? `· ${ev.time}` : ''} {ev.location ? `· ${ev.location}` : ''}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => openEdit(i)} className="px-3 py-1.5 text-xs border border-cyber-border rounded-lg text-cyber-text-secondary hover:text-white cursor-pointer">Edit</button>
                            <button onClick={() => remove(i)} className="px-3 py-1.5 text-xs border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer">Remove</button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <Modal title={editIdx !== null ? 'Edit Event' : 'Add Event'} onClose={() => setShowForm(false)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MField label="Title *" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} />
                        <MField label="Date *" value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} type="date" />
                        <MField label="Time" value={form.time} onChange={v => setForm(p => ({ ...p, time: v }))} placeholder="e.g. 6:00 PM IST" />
                        <MField label="Location" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Online / Nashik" />
                        <div>
                            <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Type</label>
                            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                                {['CTF', 'Workshop', 'Hack Night', 'Talk', 'Panel', 'Webinar', 'Event'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Status</label>
                            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Description</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro resize-y" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-cyber-border rounded-lg text-cyber-text-secondary text-sm cursor-pointer">Cancel</button>
                        <button onClick={save} disabled={!form.title || !form.date} className="px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm disabled:opacity-50 cursor-pointer">{editIdx !== null ? 'Update' : 'Add'}</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* ─── Sponsors Tab ─── */
function SponsorsTab({ chapter, onSave, showMsg }) {
    const [sponsors, setSponsors] = useState(chapter.sponsors || []);
    const [showForm, setShowForm] = useState(false);
    const [editIdx, setEditIdx] = useState(null);
    const [form, setForm] = useState({ name: '', url: '', initial: '', color: '#E6C200' });

    useEffect(() => { setSponsors(chapter.sponsors || []); }, [chapter]);

    const openNew = () => { setEditIdx(null); setForm({ name: '', url: '', initial: '', color: '#E6C200' }); setShowForm(true); };
    const openEdit = (i) => { setEditIdx(i); setForm({ ...sponsors[i] }); setShowForm(true); };

    const save = () => {
        const f = { ...form, initial: form.initial || form.name[0] || '' };
        const updated = [...sponsors];
        if (editIdx !== null) updated[editIdx] = f;
        else updated.push(f);
        onSave({ sponsors: updated });
        setSponsors(updated);
        setShowForm(false);
    };

    const remove = (i) => {
        const updated = sponsors.filter((_, idx) => idx !== i);
        onSave({ sponsors: updated });
        setSponsors(updated);
        showMsg('Sponsor removed');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-poppins font-semibold text-white">Sponsors ({sponsors.length})</h3>
                <button onClick={openNew} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">+ Add Sponsor</button>
            </div>

            {sponsors.length === 0 && <div className="pro-card rounded-xl p-10 text-center text-cyber-text-muted text-sm">No sponsors yet. Add your first sponsor.</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sponsors.map((s, i) => (
                    <div key={i} className="pro-card rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/5 bg-white/[0.02]">
                                <span className="text-lg font-bold" style={{ color: s.color || '#E6C200' }}>{s.initial || s.name[0]}</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{s.name}</p>
                                {s.url && <p className="text-[10px] text-cyber-text-muted truncate max-w-[140px]">{s.url}</p>}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => openEdit(i)} className="px-2 py-1 text-[10px] border border-cyber-border rounded text-cyber-text-secondary hover:text-white cursor-pointer">Edit</button>
                            <button onClick={() => remove(i)} className="px-2 py-1 text-[10px] border border-red-500/30 rounded text-red-400 hover:bg-red-500/10 cursor-pointer">✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <Modal title={editIdx !== null ? 'Edit Sponsor' : 'Add Sponsor'} onClose={() => setShowForm(false)}>
                    <div className="space-y-4">
                        <MField label="Sponsor Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                        <MField label="Website URL" value={form.url} onChange={v => setForm(p => ({ ...p, url: v }))} placeholder="https://..." />
                        <MField label="Initial (1 letter for logo)" value={form.initial} onChange={v => setForm(p => ({ ...p, initial: v.slice(0, 2) }))} placeholder="e.g. H" />
                        <div>
                            <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Brand Color</label>
                            <div className="flex items-center gap-3">
                                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                                <input type="text" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="flex-1 bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-cyber-border rounded-lg text-cyber-text-secondary text-sm cursor-pointer">Cancel</button>
                        <button onClick={save} disabled={!form.name} className="px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm disabled:opacity-50 cursor-pointer">{editIdx !== null ? 'Update' : 'Add'}</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* ─── Shared Components ─── */
function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-lg pro-card rounded-2xl p-6 md:p-8 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-poppins font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg border border-cyber-border flex items-center justify-center text-cyber-text-muted hover:text-white cursor-pointer">✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function MField({ label, value, onChange, type = 'text', placeholder = '' }) {
    return (
        <div>
            <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">{label}</label>
            <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro" />
        </div>
    );
}
