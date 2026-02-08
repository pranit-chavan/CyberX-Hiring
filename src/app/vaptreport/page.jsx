"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Terminal, Loader2, X, ChevronRight, Hash, FileText, Trash2, Edit, Save, Image as ImageIcon, Upload, Settings as SettingsIcon, Palette, Cpu, User } from "lucide-react";

export default function VAPTReport() {
    const [targets, setTargets] = useState([]);
    const [activeTarget, setActiveTarget] = useState(null);
    const [notes, setNotes] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [isCreatingTarget, setIsCreatingTarget] = useState(false);
    const [newTargetName, setNewTargetName] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isProcessingNote, setIsProcessingNote] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    // Image Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Edit State
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [editFile, setEditFile] = useState(null);
    const [editPreviewUrl, setEditPreviewUrl] = useState(null);
    const [isUpdatingNote, setIsUpdatingNote] = useState(false);
    const editFileInputRef = useRef(null);

    // Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState("ai");
    const [settings, setSettings] = useState({
        apiKey: "",
        model: "gemini-2.0-flash",
        theme: "cyber"
    });

    useEffect(() => {
        fetchTargets();
        const savedSettings = localStorage.getItem("vapt_settings");
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("vapt_settings", JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        if (activeTarget) {
            fetchNotes(activeTarget._id);
        } else if (targets.length > 0) {
            setActiveTarget(targets[0]);
        }
    }, [activeTarget, targets]);

    useEffect(() => {
        if (selectedNote) {
            setEditContent(selectedNote.content);
            setIsEditingNote(false);
            setEditFile(null);
            setEditPreviewUrl(null);
        }
    }, [selectedNote]);

    const fetchTargets = async () => {
        try {
            const res = await fetch("/api/targets");
            const data = await res.json();
            if (data.success) {
                setTargets(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch targets", error);
        }
    };

    const fetchNotes = async (targetId) => {
        setIsLoadingNotes(true);
        try {
            const res = await fetch(`/api/notes?targetId=${targetId}`);
            const data = await res.json();
            if (data.success) {
                setNotes(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch notes", error);
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleEditFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditFile(file);
            const url = URL.createObjectURL(file);
            setEditPreviewUrl(url);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreateTarget = async (e) => {
        e.preventDefault();
        if (!newTargetName.trim()) return;

        try {
            const res = await fetch("/api/targets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newTargetName }),
            });
            const data = await res.json();
            if (data.success) {
                setTargets((prev) => [data.data, ...prev]);
                setActiveTarget(data.data);
                setNewTargetName("");
                setIsCreatingTarget(false);
            }
        } catch (error) {
            console.error("Failed to create target", error);
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if ((!newNoteContent.trim() && !selectedFile) || !activeTarget) return;

        setIsProcessingNote(true);
        try {
            const formData = new FormData();
            formData.append("targetId", activeTarget._id);
            formData.append("content", newNoteContent || "Image uploaded without description.");
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            const headers = {};
            if (settings.apiKey) headers['x-gemini-api-key'] = settings.apiKey;
            if (settings.model) headers['x-gemini-model'] = settings.model;

            const res = await fetch("/api/notes", {
                method: "POST",
                headers: headers,
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setNotes((prev) => [data.data, ...prev]);
                setNewNoteContent("");
                clearFile();
            }
        } catch (error) {
            console.error("Failed to create note", error);
        } finally {
            setIsProcessingNote(false);
        }
    };

    const handleDeleteNote = async (e, noteId) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            const res = await fetch(`/api/notes?noteId=${noteId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setNotes((prev) => prev.filter((n) => n._id !== noteId));
                if (selectedNote?._id === noteId) {
                    setSelectedNote(null);
                }
            }
        } catch (error) {
            console.error("Failed to delete note", error);
        }
    };

    const handleUpdateNote = async () => {
        if (!editContent.trim() || !selectedNote) return;

        setIsUpdatingNote(true);
        try {
            const formData = new FormData();
            formData.append("noteId", selectedNote._id);
            formData.append("content", editContent);
            if (editFile) {
                formData.append("file", editFile);
            }

            const headers = {};
            if (settings.apiKey) headers['x-gemini-api-key'] = settings.apiKey;
            if (settings.model) headers['x-gemini-model'] = settings.model;

            const res = await fetch("/api/notes", {
                method: "PUT",
                headers: headers,
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setNotes((prev) =>
                    prev.map((n) => (n._id === selectedNote._id ? data.data : n))
                );
                setSelectedNote(data.data);
                setIsEditingNote(false);
                setEditFile(null);
                setEditPreviewUrl(null);
            }
        } catch (error) {
            console.error("Failed to update note", error);
        } finally {
            setIsUpdatingNote(false);
        }
    };

    const SettingsModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--color-cyber-card)] w-full max-w-2xl h-[500px] rounded-lg border border-[var(--color-cyber-border)] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Left Sidebar */}
                <div className="w-1/3 bg-[var(--color-cyber-dark)] border-r border-[var(--color-cyber-border)] p-4">
                    <h2 className="text-lg font-bold text-[var(--color-cyber-text)] mb-6 flex items-center gap-2">
                        <SettingsIcon size={18} className="text-[var(--color-cyber-yellow)]" />
                        Settings
                    </h2>
                    <nav className="space-y-1">
                        {[
                            { id: "appearance", label: "Appearance", icon: Palette },
                            { id: "ai", label: "AI Configuration", icon: Cpu },
                            { id: "account", label: "Account", icon: User },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSettingsTab(item.id)}
                                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-all ${activeSettingsTab === item.id
                                    ? "bg-[var(--color-cyber-yellow)]/10 text-[var(--color-cyber-yellow)] font-medium"
                                    : "hover:bg-[var(--color-cyber-border)]/50 text-[var(--color-cyber-text-muted)]"
                                    }`}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col">
                    <div className="p-6 flex-1 overflow-y-auto">
                        {activeSettingsTab === "ai" && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-[var(--color-cyber-text)] mb-4">AI Configuration</h3>
                                    <p className="text-sm text-[var(--color-cyber-text-muted)] mb-6">
                                        Configure the AI model and API key used for note analysis.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[var(--color-cyber-text-secondary)] mb-1">
                                                Gemini API Key (Optional)
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter your API Key to override default"
                                                value={settings.apiKey}
                                                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                                                className="w-full bg-[var(--color-cyber-black)] border border-[var(--color-cyber-border)] rounded px-3 py-2 text-sm focus:border-[var(--color-cyber-yellow)] outline-none text-[var(--color-cyber-text)]"
                                            />
                                            <p className="text-[10px] text-[var(--color-cyber-text-muted)] mt-1">
                                                Leave empty to use the server-configured API key.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-[var(--color-cyber-text-secondary)] mb-1">
                                                AI Model
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={settings.model}
                                                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                                                    className="w-full bg-[var(--color-cyber-black)] border border-[var(--color-cyber-border)] rounded px-3 py-2 text-sm focus:border-[var(--color-cyber-yellow)] outline-none text-[var(--color-cyber-text)] appearance-none cursor-pointer"
                                                >
                                                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
                                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (More Capable)</option>
                                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                                </select>
                                                <ChevronRight className="absolute right-3 top-2.5 text-[var(--color-cyber-text-muted)] rotate-90 pointer-events-none" size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSettingsTab === "appearance" && (
                            <div className="text-center py-12 text-[var(--color-cyber-text-muted)]">
                                <Palette size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Appearance settings coming soon.</p>
                            </div>
                        )}

                        {activeSettingsTab === "account" && (
                            <div className="text-center py-12 text-[var(--color-cyber-text-muted)]">
                                <User size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Account management coming soon.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-[var(--color-cyber-border)] bg-[var(--color-cyber-dark)] flex justify-end">
                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className="px-4 py-2 bg-[var(--color-cyber-yellow)] text-black rounded font-medium text-sm hover:bg-[var(--color-cyber-yellow-hover)]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[var(--color-cyber-black)] text-[var(--color-cyber-text)] font-sans overflow-hidden">
            {/* Sidebar - Target Management */}
            <aside className="w-64 border-r border-[var(--color-cyber-border)] bg-[var(--color-cyber-dark)] flex flex-col">
                <div className="p-6 border-b border-[var(--color-cyber-border)]">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Terminal className="text-[var(--color-cyber-yellow)]" size={24} />
                        VAPT Notes
                    </h1>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-semibold text-[var(--color-cyber-text-muted)] uppercase tracking-wider">
                            Targets
                        </h2>
                        <button
                            onClick={() => setIsCreatingTarget(true)}
                            className="p-1 hover:bg-[var(--color-cyber-border)] rounded transition-colors text-[var(--color-cyber-yellow)]"
                            title="Add Target"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {isCreatingTarget && (
                        <form onSubmit={handleCreateTarget} className="mb-4">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Target Name..."
                                value={newTargetName}
                                onChange={(e) => setNewTargetName(e.target.value)}
                                className="w-full bg-[var(--color-cyber-black)] border border-[var(--color-cyber-border)] rounded px-3 py-2 text-sm focus:border-[var(--color-cyber-yellow)] outline-none"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingTarget(false)}
                                    className="text-xs text-[var(--color-cyber-text-muted)] hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="text-xs bg-[var(--color-cyber-yellow)] text-black px-2 py-1 rounded font-medium hover:bg-[var(--color-cyber-yellow-hover)]"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-1">
                        {targets.map((target) => (
                            <button
                                key={target._id}
                                onClick={() => setActiveTarget(target)}
                                className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-all ${activeTarget?._id === target._id
                                    ? "bg-[var(--color-cyber-yellow)]/10 text-[var(--color-cyber-yellow)] border-l-2 border-[var(--color-cyber-yellow)]"
                                    : "hover:bg-[var(--color-cyber-border)]/50 text-[var(--color-cyber-text-secondary)] border-l-2 border-transparent"
                                    }`}
                            >
                                <Hash size={14} />
                                <span className="truncate">{target.name}</span>
                                {activeTarget?._id === target._id && (
                                    <ChevronRight size={14} className="ml-auto opacity-50" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Button (Bottom of Sidebar) */}
                <div className="p-4 border-t border-[var(--color-cyber-border)]">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-[var(--color-cyber-text-muted)] hover:text-[var(--color-cyber-text)] hover:bg-[var(--color-cyber-border)]/50 transition-colors"
                    >
                        <SettingsIcon size={16} />
                        Settings
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative">
                {activeTarget ? (
                    <>
                        {/* Header */}
                        <header className="px-8 py-6 border-b border-[var(--color-cyber-border)] bg-[var(--color-cyber-black)]/50 backdrop-blur-sm z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <span className="text-[var(--color-cyber-yellow)]">#</span>
                                {activeTarget.name}
                            </h2>
                        </header>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                            {/* Input Area */}
                            <div className="mb-10 max-w-4xl mx-auto">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-cyber-yellow)] to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative bg-[var(--color-cyber-card)] rounded-lg p-1">
                                        <form onSubmit={handleCreateNote}>
                                            <textarea
                                                value={newNoteContent}
                                                onChange={(e) => setNewNoteContent(e.target.value)}
                                                placeholder="Paste terminal output here or attach an image..."
                                                className="w-full bg-[var(--color-cyber-black)] text-[var(--color-cyber-text)] p-4 rounded-md min-h-[120px] outline-none font-mono text-sm resize-y border border-transparent focus:border-[var(--color-cyber-border)] placeholder-[var(--color-cyber-text-muted)]"
                                            />
                                            {previewUrl && (
                                                <div className="px-4 pb-2">
                                                    <div className="relative inline-block">
                                                        <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded border border-[var(--color-cyber-border)]" />
                                                        <button
                                                            type="button"
                                                            onClick={clearFile}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center px-4 py-3 bg-[var(--color-cyber-card)] rounded-b-md">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-[var(--color-cyber-text-muted)] flex items-center gap-1">
                                                        <Terminal size={12} />
                                                        AI-Powered Analysis
                                                    </span>
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleFileSelect}
                                                            className="hidden"
                                                            accept="image/*"
                                                            id="file-upload"
                                                        />
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="text-xs flex items-center gap-1 text-[var(--color-cyber-text-muted)] hover:text-[var(--color-cyber-yellow)] cursor-pointer transition-colors"
                                                        >
                                                            <ImageIcon size={14} />
                                                            Add Image
                                                        </label>
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isProcessingNote || (!newNoteContent.trim() && !selectedFile)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${isProcessingNote || (!newNoteContent.trim() && !selectedFile)
                                                        ? "bg-[var(--color-cyber-border)] text-[var(--color-cyber-text-muted)] cursor-not-allowed"
                                                        : "bg-[var(--color-cyber-yellow)] text-black hover:bg-[var(--color-cyber-yellow-hover)] shadow-lg shadow-[var(--color-cyber-yellow)]/20"
                                                        }`}
                                                >
                                                    {isProcessingNote ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Analyze & Save
                                                            <Plus size={16} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Grid */}
                            {isLoadingNotes ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 size={40} className="text-[var(--color-cyber-yellow)] animate-spin" />
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-20 text-[var(--color-cyber-text-muted)]">
                                    <Terminal size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No notes found for this target.</p>
                                    <p className="text-sm mt-2">Paste some terminal output above or upload an image to get started.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {notes.map((note) => (
                                        <div
                                            key={note._id}
                                            onClick={() => setSelectedNote(note)}
                                            className="group bg-[var(--color-cyber-card)] border border-[var(--color-cyber-border)] hover:border-[var(--color-cyber-yellow)]/50 rounded-lg p-5 cursor-pointer transition-all hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-cyber-yellow)]/5 flex flex-col h-64 relative"
                                        >
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button
                                                    onClick={(e) => handleDeleteNote(e, note._id)}
                                                    className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-full transition-colors bg-[var(--color-cyber-card)]/50 backdrop-blur"
                                                    title="Delete Note"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-start mb-3 pr-6">
                                                <h3 className="font-bold text-lg text-[var(--color-cyber-text)] line-clamp-2 group-hover:text-[var(--color-cyber-yellow)] transition-colors">
                                                    {note.title}
                                                </h3>
                                                {note.isAiProcessed && (
                                                    <span className="text-[10px] bg-[var(--color-cyber-yellow)]/10 text-[var(--color-cyber-yellow)] px-2 py-0.5 rounded-full border border-[var(--color-cyber-yellow)]/20 whitespace-nowrap ml-2">
                                                        AI
                                                    </span>
                                                )}
                                            </div>
                                            {note.imageUrl && (
                                                <div className="h-24 mb-3 rounded overflow-hidden border border-[var(--color-cyber-border)] bg-black/50">
                                                    <img src={note.imageUrl} alt="Attachment" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            )}
                                            <p className="text-sm text-[var(--color-cyber-text-secondary)] line-clamp-3 mb-4 flex-1">
                                                {note.summary}
                                            </p>
                                            <div className="mt-auto flex justify-between items-end border-t border-[var(--color-cyber-border)] pt-3">
                                                <span className="text-[10px] text-[var(--color-cyber-text-muted)] font-mono">
                                                    {new Date(note.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="text-xs text-[var(--color-cyber-yellow)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    View Log <ChevronRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-cyber-text-muted)]">
                        <div className="w-16 h-16 bg-[var(--color-cyber-card)] rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Hash size={32} className="text-[var(--color-cyber-yellow)]" />
                        </div>
                        <h2 className="text-xl font-medium text-[var(--color-cyber-text)] mb-2">No Target Selected</h2>
                        <p>Select a target from the sidebar or create a new one to start hacking.</p>
                    </div>
                )}
            </main>

            {/* Note Details Modal */}
            {selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--color-cyber-card)] w-full max-w-4xl h-[80vh] rounded-lg border border-[var(--color-cyber-border)] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--color-cyber-border)] bg-[var(--color-cyber-black)]/50">
                            <div className="flex-1 mr-4">
                                {isEditingNote ? (
                                    <div className="text-sm text-[var(--color-cyber-yellow)] font-medium flex items-center gap-2">
                                        <Loader2 size={16} className={isUpdatingNote ? "animate-spin" : "hidden"} />
                                        {isUpdatingNote ? "Re-analyzing and saving..." : "Editing Mode"}
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold text-[var(--color-cyber-text)]">{selectedNote.title}</h2>
                                        <p className="text-sm text-[var(--color-cyber-text-secondary)] mt-1">{selectedNote.summary}</p>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditingNote && (
                                    <>
                                        <button
                                            onClick={() => setIsEditingNote(true)}
                                            className="p-2 hover:bg-[var(--color-cyber-border)] rounded-full text-[var(--color-cyber-text-muted)] hover:text-white transition-colors"
                                            title="Edit Note"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteNote(e, selectedNote._id)}
                                            className="p-2 hover:bg-red-500/10 rounded-full text-[var(--color-cyber-text-muted)] hover:text-red-500 transition-colors"
                                            title="Delete Note"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedNote(null)}
                                    className="p-2 hover:bg-[var(--color-cyber-border)] rounded-full text-[var(--color-cyber-text-muted)] hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden p-0 relative group flex flex-col">
                            {/* Image Section */}
                            {(selectedNote.imageUrl || editPreviewUrl) && (
                                <div className={`border-b border-[var(--color-cyber-border)] bg-[var(--color-cyber-black)]/30 ${isEditingNote ? 'p-4' : 'max-h-64 overflow-hidden'}`}>
                                    {isEditingNote ? (
                                        <div className="flex items-center gap-4">
                                            {(editPreviewUrl || selectedNote.imageUrl) && (
                                                <img
                                                    src={editPreviewUrl || selectedNote.imageUrl}
                                                    alt="Preview"
                                                    className="h-24 w-auto rounded border border-[var(--color-cyber-border)]"
                                                />
                                            )}
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="file"
                                                    ref={editFileInputRef}
                                                    onChange={handleEditFileSelect}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <button
                                                    onClick={() => editFileInputRef.current?.click()}
                                                    className="text-xs flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--color-cyber-border)]/50 hover:bg-[var(--color-cyber-border)] transition-colors"
                                                >
                                                    <Upload size={14} /> {selectedNote.imageUrl ? "Change Image" : "Add Image"}
                                                </button>
                                                <span className="text-xs text-[var(--color-cyber-text-muted)]">
                                                    New image will be processed by AI on save.
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex justify-center bg-black/20">
                                            <img src={selectedNote.imageUrl} alt="Attached Evidence" className="max-h-64 object-contain" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content Section */}
                            <div className="flex-1 relative overflow-hidden">
                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs bg-[var(--color-cyber-yellow)] text-black px-2 py-1 rounded font-mono font-bold">RAW OUTPUT</span>
                                </div>
                                {isEditingNote ? (
                                    <textarea
                                        className="w-full h-full p-6 text-sm font-mono text-[var(--color-cyber-text-secondary)] bg-[#0d0d0d] whitespace-pre-wrap outline-none resize-none focus:bg-black/50 transition-colors"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        disabled={isUpdatingNote}
                                        placeholder="Enter terminal output or notes detailed description..."
                                    />
                                ) : (
                                    <pre className="h-full overflow-auto p-6 text-sm font-mono text-[var(--color-cyber-text-secondary)] bg-[#0d0d0d] whitespace-pre-wrap">
                                        {selectedNote.content}
                                    </pre>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-[var(--color-cyber-border)] bg-[var(--color-cyber-black)]/50 flex justify-between items-center">
                            <span className="text-xs text-[var(--color-cyber-text-muted)]">
                                Captured on {new Date(selectedNote.createdAt).toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                                {isEditingNote ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsEditingNote(false);
                                                setEditContent(selectedNote.content);
                                                setEditFile(null);
                                                setEditPreviewUrl(null);
                                            }}
                                            className="text-xs flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-cyber-border)] hover:bg-[var(--color-cyber-border)] transition-colors"
                                            disabled={isUpdatingNote}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdateNote}
                                            className="text-xs flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--color-cyber-yellow)] text-black font-medium hover:bg-[var(--color-cyber-yellow-hover)] transition-colors"
                                            disabled={isUpdatingNote}
                                        >
                                            {isUpdatingNote ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedNote.content);
                                            // Optional: Show toast
                                        }}
                                        className="text-xs flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-cyber-border)] hover:bg-[var(--color-cyber-border)] transition-colors"
                                    >
                                        <FileText size={14} /> Copy Raw Content
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {isSettingsOpen && <SettingsModal />}
        </div>
    );
}
