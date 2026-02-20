"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function formatDateParts(dateStr) {
    const d = new Date(dateStr);
    return { day: d.getDate(), month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() };
}

export default function ChapterDetailPage() {
    const params = useParams();
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeEventTab, setActiveEventTab] = useState('upcoming');

    useEffect(() => {
        if (!params.id) return;
        fetch(`/api/chapters/${params.id}`)
            .then(res => res.json())
            .then(data => { if (data.chapter) setChapter(data.chapter); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-cyber-yellow border-t-transparent rounded-full"></div></div>;
    if (!chapter) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h1 className="text-2xl font-poppins font-bold text-white">Chapter Not Found</h1><Link href="/chapters" className="text-cyber-yellow hover:underline text-sm">← Back to Chapters</Link></div>;

    const isActive = chapter.status === 'active';
    const allEvents = chapter.eventsList || [];
    const events = allEvents.filter(e => e.status === activeEventTab);

    return (
        <div className="min-h-screen">

            {/* ─── Hero Banner ─── */}
            <div className="relative w-full h-72 md:h-80 lg:h-[420px] overflow-hidden">
                <Image src="/assets/chapter_banner.png" alt={`CyberX ${chapter.city}`} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-[#0F0F0F]/20"></div>

                <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 md:px-16 py-5">
                    <Link href="/chapters" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        All Chapters
                    </Link>
                    {isActive && <span className="px-3 py-1 text-[11px] font-semibold rounded-full bg-green-500/15 text-green-400 border border-green-500/20 backdrop-blur-sm">● Active Chapter</span>}
                </nav>

                <div className="absolute bottom-10 left-6 md:left-16 z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-extrabold text-white leading-[1.1] tracking-tight mb-3">
                        CyberX <span className="text-cyber-yellow">{chapter.city}</span>
                    </h1>
                    <p className="text-white/60 text-base md:text-lg font-medium">{chapter.state}, India {chapter.founded ? ` · Est. ${chapter.founded}` : ''}</p>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <main className="px-6 md:px-16 lg:px-24">

                {/* Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-12 border-b border-cyber-border">
                    <div className="lg:col-span-7">
                        <p className="text-[15px] text-white/80 leading-[1.75]">{chapter.description}</p>
                        {chapter.highlights?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-5">
                                {chapter.highlights.map(tag => <span key={tag} className="px-3 py-1 text-xs font-medium rounded-md bg-white/5 text-white/60 border border-white/8">{tag}</span>)}
                            </div>
                        )}
                    </div>
                    {isActive && (
                        <div className="lg:col-span-5 grid grid-cols-3 gap-4">
                            {[
                                { label: 'Members', value: chapter.members || '—' },
                                { label: 'Events', value: chapter.events ?? '—' },
                                { label: 'Founded', value: chapter.founded || '—' },
                            ].map(s => (
                                <div key={s.label} className="text-center py-4 px-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="text-2xl font-poppins font-bold text-white">{s.value}</div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-[0.1em] mt-1 font-medium">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Events + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-12">
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-poppins font-semibold text-white tracking-tight">Events</h2>
                            <div className="flex bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
                                {['upcoming', 'past'].map(tab => (
                                    <button key={tab} onClick={() => setActiveEventTab(tab)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize cursor-pointer ${activeEventTab === tab ? 'bg-cyber-yellow text-black' : 'text-white/50 hover:text-white/80'}`}>{tab}</button>
                                ))}
                            </div>
                        </div>

                        {events.length > 0 ? (
                            <div className="space-y-0">
                                {events.map((ev, i) => {
                                    const dp = formatDateParts(ev.date);
                                    return (
                                        <div key={ev._id || i} className={`flex gap-5 py-6 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                                            <div className="flex-shrink-0 w-14 text-center pt-0.5">
                                                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">{dp.month}</div>
                                                <div className="text-2xl font-poppins font-bold text-white leading-tight">{dp.day}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded bg-white/5 text-white/50">{ev.type}</span>
                                                    {ev.time && <span className="text-[11px] text-white/30">{ev.time}</span>}
                                                    {ev.location && <><span className="text-[11px] text-white/30">·</span><span className="text-[11px] text-white/30">{ev.location}</span></>}
                                                </div>
                                                <h3 className="text-[15px] font-semibold text-white mb-1 leading-snug">{ev.title}</h3>
                                                <p className="text-sm text-white/50 leading-relaxed">{ev.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-16 text-center"><p className="text-sm text-white/30">{activeEventTab === 'upcoming' ? 'No upcoming events scheduled.' : 'No past events yet.'}</p></div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-6">
                        {chapter.lead && (
                            <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Chapter Lead</div>
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-cyber-yellow/12 flex items-center justify-center flex-shrink-0 border border-cyber-yellow/15">
                                        <span className="text-sm font-bold text-cyber-yellow">{chapter.lead.split(' ').map(n => n[0]).join('')}</span>
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-semibold text-white">{chapter.lead}</p>
                                        <p className="text-[11px] text-white/35">Community Lead</p>
                                    </div>
                                </div>
                                {(chapter.linkedin || chapter.instagram) && (
                                    <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
                                        {chapter.linkedin && <a href={chapter.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] text-white/40 hover:text-white/80 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>LinkedIn</a>}
                                        {chapter.instagram && <a href={chapter.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] text-white/40 hover:text-white/80 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>Instagram</a>}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-3">Get Involved</div>
                            <h3 className="text-base font-poppins font-semibold text-white mb-2">Call for Speakers</h3>
                            <p className="text-sm text-white/45 leading-relaxed mb-5">Share your cybersecurity expertise with the {chapter.city} community. We host talks, workshops, and panels.</p>
                            <a href={`mailto:community@cyberx.org.in?subject=Speaker%20Application%20-%20CyberX%20${chapter.city}`} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg transition-all text-sm">Apply as Speaker</a>
                        </div>

                        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-4">Quick Links</div>
                            <div className="space-y-2">
                                <a href="/" className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.03] transition-all">Join CyberX Community<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></a>
                                <a href="/chapters" className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.03] transition-all">View All Chapters<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></a>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Sponsors — Full Width Bottom */}
                {(chapter.sponsors?.length > 0) && (
                    <section className="py-12 border-t border-white/5">
                        <div className="text-center mb-8">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25 mb-2">Supported By</div>
                            <h2 className="text-lg font-poppins font-semibold text-white tracking-tight">Chapter Sponsors</h2>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
                            {chapter.sponsors.map((s, i) => (
                                <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3 transition-all hover:opacity-100 opacity-40" title={s.name}>
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border border-white/5 bg-white/[0.02] group-hover:border-white/10 transition-all">
                                        <span className="text-2xl md:text-3xl font-poppins font-bold" style={{ color: s.color || '#E6C200' }}>{s.initial || s.name[0]}</span>
                                    </div>
                                    <span className="text-[11px] text-white/40 group-hover:text-white/70 font-medium transition-colors">{s.name}</span>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="border-t border-white/5 mx-6 md:mx-16 py-8">
                <p className="text-center text-white/20 text-xs">© 2026 CyberX Community — All rights reserved.</p>
            </footer>
        </div>
    );
}
