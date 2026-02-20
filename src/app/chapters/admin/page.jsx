"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ChapterAdminPanel() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('chapters');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Chapter state
    const [chapters, setChapters] = useState([]);
    const [showChapterModal, setShowChapterModal] = useState(false);
    const [editingChapter, setEditingChapter] = useState(null);
    const [chapterForm, setChapterForm] = useState({ city: '', state: '', status: 'coming-soon', lead: '', members: '', events: '', description: '', founded: '', linkedin: '', instagram: '', highlights: '' });
    const [chapterSaving, setChapterSaving] = useState(false);

    // Chapter management (events/sponsors)
    const [managingChapter, setManagingChapter] = useState(null);
    const managingChapterRef = useRef(null);

    // User edit state
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editUserForm, setEditUserForm] = useState({ role: '', chapterId: '' });
    const [newPassword, setNewPassword] = useState('');
    const [generatedPwd, setGeneratedPwd] = useState('');
    const [manageTab, setManageTab] = useState('events');

    // User state
    const [users, setUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({ email: '', username: '', role: 'chapter_lead', chapterId: '' });
    const [userSaving, setUserSaving] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);

    const [message, setMessage] = useState({ text: '', type: '' });

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    const authHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    // Keep ref in sync
    useEffect(() => { managingChapterRef.current = managingChapter; }, [managingChapter]);

    useEffect(() => {
        const stored = localStorage.getItem('chapter-user');
        if (!stored) { router.push('/chapters/login'); return; }
        const userData = JSON.parse(stored);
        if (userData.role !== 'super_admin') { router.push('/chapters/dashboard'); return; }
        setUser(userData);
        setLoading(false);
    }, [router]);

    const fetchChapters = useCallback(async () => {
        try {
            const res = await fetch('/api/chapters/admin/all', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setChapters(data.chapters);
                // Update managing chapter if one is open
                const currentManaging = managingChapterRef.current;
                if (currentManaging) {
                    const updated = data.chapters.find(c => c._id === currentManaging._id);
                    if (updated) setManagingChapter(updated);
                }
            }
        } catch (err) { console.error(err); }
    }, [token]);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/chapters/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) setUsers(data.users);
        } catch (err) { console.error(err); }
    }, [token]);

    useEffect(() => { if (!loading && user) { fetchChapters(); fetchUsers(); } }, [loading, user, fetchChapters, fetchUsers]);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const saveChapterField = async (chapterId, updates) => {
        try {
            const res = await fetch(`/api/chapters/${chapterId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(updates) });
            const data = await res.json();
            if (res.ok) {
                showMsg('Saved!');
                // Directly update the managing chapter with fresh data
                if (data.chapter) {
                    setManagingChapter(data.chapter);
                    // Also update in the chapters list
                    setChapters(prev => prev.map(c => c._id === data.chapter._id ? data.chapter : c));
                }
                return data.chapter;
            } else {
                showMsg(data.error || 'Failed', 'error');
            }
        } catch { showMsg('Network error', 'error'); }
        return null;
    };

    // Chapter CRUD
    const openNewChapter = () => {
        setEditingChapter(null);
        setChapterForm({ city: '', state: '', status: 'coming-soon', lead: '', members: '', events: '', description: '', founded: '', linkedin: '', instagram: '', highlights: '' });
        setShowChapterModal(true);
    };

    const openEditChapter = (ch) => {
        setEditingChapter(ch);
        setChapterForm({ ...ch, highlights: (ch.highlights || []).join(', '), events: ch.events ?? '' });
        setShowChapterModal(true);
    };

    const saveChapter = async () => {
        setChapterSaving(true);
        const body = { ...chapterForm, highlights: chapterForm.highlights.split(',').map(s => s.trim()).filter(Boolean), events: chapterForm.events ? Number(chapterForm.events) : null };

        try {
            const url = editingChapter ? `/api/chapters/${editingChapter._id}` : '/api/chapters';
            const method = editingChapter ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) });
            if (res.ok) {
                showMsg(editingChapter ? 'Chapter updated!' : 'Chapter created!');
                setShowChapterModal(false);
                fetchChapters();
            } else {
                const data = await res.json();
                showMsg(data.error || 'Failed', 'error');
            }
        } catch (err) { showMsg('Network error', 'error'); }
        finally { setChapterSaving(false); }
    };

    const toggleArchive = async (ch) => {
        try {
            const res = await fetch(`/api/chapters/${ch._id}/archive`, { method: 'PUT', headers: authHeaders });
            if (res.ok) { fetchChapters(); showMsg(ch.isArchived ? 'Chapter unarchived' : 'Chapter archived'); }
        } catch (err) { showMsg('Failed to archive', 'error'); }
    };

    // User CRUD
    const createUser = async () => {
        setUserSaving(true);
        try {
            const res = await fetch('/api/chapters/admin/users', { method: 'POST', headers: authHeaders, body: JSON.stringify(userForm) });
            const data = await res.json();
            if (res.ok) {
                setCreatedUser({ ...data.user, generatedPassword: data.generatedPassword });
                fetchUsers();
                showMsg('User created!');
            } else {
                showMsg(data.error || 'Failed', 'error');
            }
        } catch (err) { showMsg('Network error', 'error'); }
        finally { setUserSaving(false); }
    };

    // User management
    const openEditUser = (u) => {
        setEditingUser(u);
        setEditUserForm({ role: u.role || 'chapter_lead', chapterId: u.chapterId?._id || u.chapterId || '' });
        setNewPassword('');
        setGeneratedPwd('');
        setShowEditUserModal(true);
    };

    const updateUser = async (userId, body) => {
        try {
            const res = await fetch(`/api/chapters/admin/users/${userId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify(body) });
            const data = await res.json();
            if (res.ok) {
                showMsg(data.message || 'Updated!');
                if (data.generatedPassword) setGeneratedPwd(data.generatedPassword);
                fetchUsers();
                return data;
            } else showMsg(data.error || 'Failed', 'error');
        } catch { showMsg('Network error', 'error'); }
        return null;
    };

    const toggleUserActive = async (u) => {
        try {
            const res = await fetch(`/api/chapters/admin/users/${u._id}`, { method: 'DELETE', headers: authHeaders });
            const data = await res.json();
            if (res.ok) { fetchUsers(); showMsg(data.message); }
        } catch { showMsg('Failed', 'error'); }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('auth-token');
        localStorage.removeItem('chapter-user');
        router.push('/chapters/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-cyber-yellow border-t-transparent rounded-full"></div></div>;

    // If managing a specific chapter, show the management view
    if (managingChapter) {
        return (
            <div className="min-h-screen">
                <TopBar user={user} onLogout={handleLogout} subtitle="/ Super Admin / Manage Chapter" />
                <main className="px-6 md:px-16 lg:px-24 py-10">
                    <button onClick={() => setManagingChapter(null)} className="inline-flex items-center gap-2 text-sm text-cyber-text-secondary hover:text-white mb-6 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to All Chapters
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-poppins font-bold text-white">CyberX <span className="text-cyber-yellow">{managingChapter.city}</span></h1>
                            <p className="text-cyber-text-secondary text-sm mt-1">{managingChapter.state} • Manage Events, Sponsors & Details</p>
                        </div>
                    </div>

                    {message.text && <div className={`mb-6 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>{message.text}</div>}

                    <div className="flex gap-1 mb-8 bg-cyber-card rounded-lg p-1 w-fit border border-cyber-border">
                        {['events', 'sponsors', 'details'].map(tab => (
                            <button key={tab} onClick={() => setManageTab(tab)} className={`px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer capitalize ${manageTab === tab ? 'bg-cyber-yellow text-black' : 'text-cyber-text-secondary hover:text-white'}`}>{tab}</button>
                        ))}
                    </div>

                    {manageTab === 'events' && <EventsManager chapter={managingChapter} onSave={(updates) => saveChapterField(managingChapter._id, updates)} showMsg={showMsg} />}
                    {manageTab === 'sponsors' && <SponsorsManager chapter={managingChapter} onSave={(updates) => saveChapterField(managingChapter._id, updates)} showMsg={showMsg} />}
                    {manageTab === 'details' && <DetailsManager chapter={managingChapter} onSave={(updates) => saveChapterField(managingChapter._id, updates)} />}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <TopBar user={user} onLogout={handleLogout} subtitle="/ Super Admin" />

            <main className="px-6 md:px-16 lg:px-24 py-10">
                <h1 className="text-3xl font-poppins font-bold text-white mb-2">Super Admin <span className="text-cyber-yellow">Panel</span></h1>
                <p className="text-cyber-text-secondary text-sm mb-8">Manage chapters, users, and access control.</p>

                {message.text && <div className={`mb-6 p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>{message.text}</div>}

                <div className="flex gap-1 mb-8 bg-cyber-card rounded-lg p-1 w-fit border border-cyber-border">
                    {['chapters', 'users'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer capitalize ${activeTab === tab ? 'bg-cyber-yellow text-black' : 'text-cyber-text-secondary hover:text-white'}`}>{tab}</button>
                    ))}
                </div>

                {/* Chapters Tab */}
                {activeTab === 'chapters' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-poppins font-semibold text-white flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyber-yellow mr-3"></div>
                                All Chapters ({chapters.length})
                            </h2>
                            <button onClick={openNewChapter} className="px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg transition-all text-sm cursor-pointer">+ New Chapter</button>
                        </div>

                        <div className="space-y-3">
                            {chapters.map(ch => (
                                <div key={ch._id} className={`pro-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${ch.isArchived ? 'opacity-50' : ''}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-poppins font-semibold text-white">{ch.city}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${ch.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-cyber-card text-cyber-text-muted border border-cyber-border'}`}>
                                                {ch.status === 'active' ? 'Active' : 'Coming Soon'}
                                            </span>
                                            {ch.isArchived && <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/15 text-red-400">Archived</span>}
                                        </div>
                                        <p className="text-xs text-cyber-text-muted">{ch.state} {ch.lead ? `• Lead: ${ch.lead}` : ''} {ch.members ? `• ${ch.members} members` : ''} • {(ch.eventsList || []).length} events • {(ch.sponsors || []).length} sponsors</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => setManagingChapter(ch)} className="px-4 py-2 text-xs bg-cyber-yellow/10 border border-cyber-yellow/20 rounded-lg text-cyber-yellow hover:bg-cyber-yellow/20 transition-all cursor-pointer">Manage</button>
                                        <button onClick={() => toggleArchive(ch)} className={`px-4 py-2 text-xs border rounded-lg transition-all cursor-pointer ${ch.isArchived ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}>
                                            {ch.isArchived ? 'Unarchive' : 'Archive'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-poppins font-semibold text-white flex items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyber-yellow mr-3"></div>
                                Users ({users.length})
                            </h2>
                            <button onClick={() => { setShowUserModal(true); setCreatedUser(null); setUserForm({ email: '', username: '', role: 'chapter_lead', chapterId: '' }); }} className="px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg transition-all text-sm cursor-pointer">+ New User</button>
                        </div>

                        <div className="space-y-3">
                            {users.map(u => (
                                <div key={u._id} className={`pro-card rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${!u.isActive ? 'opacity-50' : ''}`}>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-poppins font-semibold text-white">{u.username}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${u.role === 'super_admin' ? 'bg-cyber-yellow/15 text-cyber-yellow' : 'bg-blue-500/15 text-blue-400'}`}>
                                                {u.role === 'super_admin' ? 'Super Admin' : 'Chapter Lead'}
                                            </span>
                                            {!u.isActive && <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/15 text-red-400">Inactive</span>}
                                        </div>
                                        <p className="text-xs text-cyber-text-muted">{u.email} {u.chapterId ? `• Chapter: ${u.chapterId.city || u.chapterId}` : ''}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => openEditUser(u)} className="px-4 py-2 text-xs bg-cyber-yellow/10 border border-cyber-yellow/20 rounded-lg text-cyber-yellow hover:bg-cyber-yellow/20 transition-all cursor-pointer">Manage</button>
                                        <button onClick={() => toggleUserActive(u)} className={`px-4 py-2 text-xs border rounded-lg transition-all cursor-pointer ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                                            {u.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Chapter Modal */}
            {showChapterModal && (
                <Modal title={editingChapter ? 'Edit Chapter' : 'New Chapter'} onClose={() => setShowChapterModal(false)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MField label="City *" value={chapterForm.city} onChange={v => setChapterForm(p => ({ ...p, city: v }))} />
                        <MField label="State *" value={chapterForm.state} onChange={v => setChapterForm(p => ({ ...p, state: v }))} />
                        <div>
                            <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Status</label>
                            <select value={chapterForm.status} onChange={e => setChapterForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                                <option value="coming-soon">Coming Soon</option>
                                <option value="active">Active</option>
                            </select>
                        </div>
                        <MField label="Lead" value={chapterForm.lead} onChange={v => setChapterForm(p => ({ ...p, lead: v }))} />
                        <MField label="Members" value={chapterForm.members} onChange={v => setChapterForm(p => ({ ...p, members: v }))} />
                        <MField label="Events Count" value={chapterForm.events} onChange={v => setChapterForm(p => ({ ...p, events: v }))} type="number" />
                        <MField label="Founded" value={chapterForm.founded} onChange={v => setChapterForm(p => ({ ...p, founded: v }))} />
                        <MField label="LinkedIn" value={chapterForm.linkedin} onChange={v => setChapterForm(p => ({ ...p, linkedin: v }))} />
                        <MField label="Instagram" value={chapterForm.instagram} onChange={v => setChapterForm(p => ({ ...p, instagram: v }))} />
                        <MField label="Highlights (comma)" value={chapterForm.highlights} onChange={v => setChapterForm(p => ({ ...p, highlights: v }))} />
                    </div>
                    <div className="mt-4">
                        <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Description *</label>
                        <textarea value={chapterForm.description} onChange={e => setChapterForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro resize-y" />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setShowChapterModal(false)} className="px-5 py-2.5 border border-cyber-border rounded-lg text-cyber-text-secondary hover:text-white text-sm transition-all cursor-pointer">Cancel</button>
                        <button onClick={saveChapter} disabled={chapterSaving || !chapterForm.city || !chapterForm.state || !chapterForm.description} className="px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm transition-all disabled:opacity-50 cursor-pointer">
                            {chapterSaving ? 'Saving...' : (editingChapter ? 'Update' : 'Create')}
                        </button>
                    </div>
                </Modal>
            )}

            {/* User Modal */}
            {showUserModal && (
                <Modal title={createdUser ? 'User Created' : 'Create New User'} onClose={() => { setShowUserModal(false); setCreatedUser(null); }}>
                    {createdUser ? (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                                <p className="text-green-400 font-semibold mb-1">User created successfully!</p>
                                <p className="text-xs text-cyber-text-secondary">Share these credentials securely.</p>
                            </div>
                            <div className="pro-card rounded-lg p-4 space-y-3">
                                <div className="flex justify-between"><span className="text-xs text-cyber-text-muted">Username</span><span className="text-sm text-white font-medium">{createdUser.username}</span></div>
                                <div className="flex justify-between"><span className="text-xs text-cyber-text-muted">Email</span><span className="text-sm text-white font-medium">{createdUser.email}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs text-cyber-text-muted">Password</span><span className="text-sm text-cyber-yellow font-mono font-bold tracking-wide">{createdUser.generatedPassword}</span></div>
                                <div className="flex justify-between"><span className="text-xs text-cyber-text-muted">Role</span><span className="text-sm text-white font-medium capitalize">{createdUser.role?.replace('_', ' ')}</span></div>
                            </div>
                            <button onClick={() => { setShowUserModal(false); setCreatedUser(null); }} className="w-full px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm transition-all cursor-pointer">Done</button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <MField label="Email *" value={userForm.email} onChange={v => setUserForm(p => ({ ...p, email: v }))} type="email" />
                                <MField label="Username *" value={userForm.username} onChange={v => setUserForm(p => ({ ...p, username: v }))} />
                                <div>
                                    <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Role</label>
                                    <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                                        <option value="chapter_lead">Chapter Lead</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                {userForm.role === 'chapter_lead' && (
                                    <div>
                                        <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Assign to Chapter</label>
                                        <select value={userForm.chapterId} onChange={e => setUserForm(p => ({ ...p, chapterId: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                                            <option value="">Select a chapter</option>
                                            {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.city}, {ch.state}</option>)}
                                        </select>
                                    </div>
                                )}
                                <p className="text-xs text-cyber-text-muted">A password will be auto-generated and shown after creation.</p>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setShowUserModal(false)} className="px-5 py-2.5 border border-cyber-border rounded-lg text-cyber-text-secondary hover:text-white text-sm transition-all cursor-pointer">Cancel</button>
                                <button onClick={createUser} disabled={userSaving || !userForm.email || !userForm.username} className="px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm transition-all disabled:opacity-50 cursor-pointer">
                                    {userSaving ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {/* Edit User Modal */}
            {showEditUserModal && editingUser && (
                <Modal title={`Manage User — ${editingUser.username}`} onClose={() => { setShowEditUserModal(false); setGeneratedPwd(''); }}>
                    <div className="space-y-6">
                        {/* Role & Chapter */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">Role & Chapter</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Role</label>
                                    <select value={editUserForm.role} onChange={e => setEditUserForm(p => ({ ...p, role: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                                        <option value="chapter_lead">Chapter Lead</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                {editUserForm.role === 'chapter_lead' && (
                                    <div>
                                        <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Assigned Chapter</label>
                                        <select value={editUserForm.chapterId} onChange={e => setEditUserForm(p => ({ ...p, chapterId: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                                            <option value="">No chapter assigned</option>
                                            {chapters.map(ch => <option key={ch._id} value={ch._id}>{ch.city}, {ch.state}</option>)}
                                        </select>
                                    </div>
                                )}
                                <button onClick={() => updateUser(editingUser._id, { role: editUserForm.role, chapterId: editUserForm.chapterId })} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">Save Role & Chapter</button>
                            </div>
                        </div>

                        <div className="border-t border-cyber-border"></div>

                        {/* Change Password */}
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">Change Password</h4>
                            <div className="space-y-3">
                                <MField label="New Password (min 6 chars)" value={newPassword} onChange={v => setNewPassword(v)} type="password" placeholder="Enter new password" />
                                <div className="flex gap-2">
                                    <button onClick={() => { if (newPassword.length >= 6) updateUser(editingUser._id, { action: 'change_password', password: newPassword }); else showMsg('Password must be at least 6 characters', 'error'); }} disabled={!newPassword || newPassword.length < 6} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm disabled:opacity-50 cursor-pointer">Set Password</button>
                                    <button onClick={() => updateUser(editingUser._id, { action: 'generate_password' })} className="px-5 py-2 border border-cyber-border rounded-lg text-cyber-text-secondary hover:text-white text-sm cursor-pointer">Generate Random Password</button>
                                </div>
                            </div>
                        </div>

                        {/* Generated Password Display */}
                        {generatedPwd && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                                <p className="text-xs text-green-400 font-medium mb-2">New Generated Password:</p>
                                <p className="text-lg font-mono font-bold text-cyber-yellow tracking-wider text-center py-2">{generatedPwd}</p>
                                <p className="text-[10px] text-cyber-text-muted text-center mt-1">Copy and share this securely. It won't be shown again.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={() => { setShowEditUserModal(false); setGeneratedPwd(''); }} className="px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">Done</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/* ─── Top Bar ─── */
function TopBar({ user, onLogout, subtitle }) {
    return (
        <div className="border-b border-cyber-border px-6 md:px-16 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative w-32 h-10"><Image src="/assets/logo.png" alt="CyberX" fill className="object-contain" priority /></div>
                <span className="text-cyber-text-muted text-sm hidden sm:inline">{subtitle}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-cyber-text-secondary hidden sm:inline">{user?.username}</span>
                <button onClick={onLogout} className="px-4 py-2 text-sm border border-cyber-border rounded-lg text-cyber-text-secondary hover:text-white hover:border-cyber-yellow/40 transition-all cursor-pointer">Logout</button>
            </div>
        </div>
    );
}

/* ─── Events Manager ─── */
function EventsManager({ chapter, onSave, showMsg }) {
    const [events, setEvents] = useState(chapter.eventsList || []);
    const [showForm, setShowForm] = useState(false);
    const [editIdx, setEditIdx] = useState(null);
    const [form, setForm] = useState({ title: '', date: '', time: '', location: '', type: 'Event', description: '', status: 'upcoming' });

    useEffect(() => { setEvents(chapter.eventsList || []); }, [chapter]);

    const openNew = () => { setEditIdx(null); setForm({ title: '', date: '', time: '', location: '', type: 'Event', description: '', status: 'upcoming' }); setShowForm(true); };
    const openEdit = (i) => { setEditIdx(i); setForm({ ...events[i] }); setShowForm(true); };

    const save = async () => {
        const updated = [...events];
        if (editIdx !== null) updated[editIdx] = form;
        else updated.push(form);
        // Update local state immediately
        setEvents(updated);
        setShowForm(false);
        await onSave({ eventsList: updated });
    };

    const remove = async (i) => {
        const updated = events.filter((_, idx) => idx !== i);
        setEvents(updated);
        showMsg('Event removed');
        await onSave({ eventsList: updated });
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
                        <MField label="Location" value={form.location} onChange={v => setForm(p => ({ ...p, location: v }))} placeholder="e.g. Online" />
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

/* ─── Sponsors Manager ─── */
function SponsorsManager({ chapter, onSave, showMsg }) {
    const [sponsors, setSponsors] = useState(chapter.sponsors || []);
    const [showForm, setShowForm] = useState(false);
    const [editIdx, setEditIdx] = useState(null);
    const [form, setForm] = useState({ name: '', url: '', initial: '', color: '#E6C200' });

    useEffect(() => { setSponsors(chapter.sponsors || []); }, [chapter]);

    const openNew = () => { setEditIdx(null); setForm({ name: '', url: '', initial: '', color: '#E6C200' }); setShowForm(true); };
    const openEdit = (i) => { setEditIdx(i); setForm({ ...sponsors[i] }); setShowForm(true); };

    const save = async () => {
        const f = { ...form, initial: form.initial || form.name[0] || '' };
        const updated = [...sponsors];
        if (editIdx !== null) updated[editIdx] = f;
        else updated.push(f);
        setSponsors(updated);
        setShowForm(false);
        await onSave({ sponsors: updated });
    };

    const remove = async (i) => {
        const updated = sponsors.filter((_, idx) => idx !== i);
        setSponsors(updated);
        showMsg('Sponsor removed');
        await onSave({ sponsors: updated });
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
                        <MField label="Initial (1-2 letters)" value={form.initial} onChange={v => setForm(p => ({ ...p, initial: v.slice(0, 2) }))} placeholder="e.g. H" />
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

/* ─── Details Manager ─── */
function DetailsManager({ chapter, onSave }) {
    const [form, setForm] = useState({});
    const [editing, setEditing] = useState(false);

    useEffect(() => { setForm({ lead: chapter.lead || '', members: chapter.members || '', events: chapter.events ?? '', description: chapter.description || '', linkedin: chapter.linkedin || '', instagram: chapter.instagram || '', highlights: (chapter.highlights || []).join(', '), founded: chapter.founded || '', status: chapter.status || 'coming-soon' }); }, [chapter]);

    const save = () => { onSave({ ...form, events: form.events ? Number(form.events) : null, highlights: form.highlights.split(',').map(s => s.trim()).filter(Boolean) }); setEditing(false); };

    return (
        <div className="pro-card rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-poppins font-semibold text-white">Chapter Details</h3>
                {!editing ? <button onClick={() => setEditing(true)} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">Edit</button>
                    : <div className="flex gap-2"><button onClick={() => setEditing(false)} className="px-5 py-2 border border-cyber-border rounded-lg text-cyber-text-secondary text-sm cursor-pointer">Cancel</button><button onClick={save} className="px-5 py-2 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg text-sm cursor-pointer">Save</button></div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                    { key: 'lead', label: 'Chapter Lead' }, { key: 'members', label: 'Members' },
                    { key: 'events', label: 'Events Count', type: 'number' }, { key: 'founded', label: 'Founded' },
                    { key: 'linkedin', label: 'LinkedIn URL' }, { key: 'instagram', label: 'Instagram URL' },
                    { key: 'highlights', label: 'Highlights (comma-separated)' },
                ].map(f => (
                    <div key={f.key}>
                        <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">{f.label}</label>
                        {editing ? <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro" /> : <p className="text-sm text-white">{form[f.key] || '—'}</p>}
                    </div>
                ))}
                {editing && (
                    <div>
                        <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Status</label>
                        <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro cursor-pointer appearance-none">
                            <option value="coming-soon">Coming Soon</option>
                            <option value="active">Active</option>
                        </select>
                    </div>
                )}
            </div>
            <div className="mt-5">
                <label className="mb-1.5 text-xs font-medium text-cyber-text-secondary block">Description</label>
                {editing ? <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro resize-y" /> : <p className="text-sm text-cyber-text-secondary leading-relaxed">{form.description || '—'}</p>}
            </div>
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
                    <button onClick={onClose} className="w-8 h-8 rounded-lg border border-cyber-border flex items-center justify-center text-cyber-text-muted hover:text-white hover:border-cyber-yellow/40 transition-all cursor-pointer">✕</button>
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
            <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none input-pro transition-all" />
        </div>
    );
}
