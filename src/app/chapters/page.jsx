"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const STATS_TEMPLATE = [
    { label: 'Active Chapters', icon: '🏛️', key: 'active' },
    { label: 'Cities Planned', icon: '🗺️', key: 'total' },
    { label: 'Community Members', icon: '👥', key: 'members' },
    { label: 'Events Hosted', icon: '🎯', key: 'events' },
];

/* ---------- Page Component ---------- */
export default function ChaptersPage() {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/chapters')
            .then(res => res.json())
            .then(data => {
                if (data.chapters) setChapters(data.chapters);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Compute stats from live data
    const stats = {
        active: chapters.filter(c => c.status === 'active').length.toString(),
        total: chapters.length.toString(),
        members: chapters.reduce((sum, c) => sum + (parseInt(c.members) || 0), 0) + '+',
        events: chapters.reduce((sum, c) => sum + (c.events || 0), 0) + '+',
    };

    return (
        <div className="min-h-screen">
            <main className="w-full px-6 md:px-16 lg:px-24">

                {/* Top bar: Logo + Login */}
                <div className="flex items-center justify-between pt-8 pb-4">
                    <div className="relative w-48 h-14 md:w-72 md:h-20">
                        <a href="/">
                            <Image
                                src="/assets/logo.png"
                                alt="CyberX Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </a>
                    </div>
                    <a
                        href="/chapters/login"
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-cyber-border rounded-lg text-sm font-medium text-cyber-text-secondary hover:text-white hover:border-cyber-yellow/40 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login
                    </a>
                </div>

                {/* Page Header */}
                <div className="flex flex-col items-center mb-16 pt-4 md:pt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyber-border bg-cyber-card/50 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-xs font-medium text-cyber-text-secondary tracking-wide uppercase">Expanding Nationwide</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-poppins font-extrabold text-white text-center mb-4 tracking-tight">
                        Our <DecryptedText text="Chapters" />
                    </h1>
                    <p className="text-[#B3B3B3] text-center max-w-xl text-sm md:text-base font-medium leading-relaxed">
                        CyberX chapters are city-based communities bringing cybersecurity enthusiasts together for local meetups, workshops, and CTF competitions.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {STATS_TEMPLATE.map((stat) => (
                        <div
                            key={stat.label}
                            className="pro-card rounded-xl p-5 text-center group hover:border-cyber-yellow/30 transition-all duration-300"
                        >
                            <div className="text-2xl mb-2">{stat.icon}</div>
                            <div className="text-2xl md:text-3xl font-poppins font-bold text-white mb-1">
                                {loading ? '—' : stats[stat.key]}
                            </div>
                            <div className="text-xs text-cyber-text-secondary font-medium uppercase tracking-wider">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chapters Grid */}
                <div className="mb-16">
                    <div className="flex items-center mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyber-yellow mr-3"></div>
                        <h2 className="text-xl font-poppins font-semibold text-white tracking-tight">
                            All Chapters
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-8 w-8 border-2 border-cyber-yellow border-t-transparent rounded-full"></div>
                        </div>
                    ) : chapters.length === 0 ? (
                        <div className="text-center py-20 text-cyber-text-secondary">No chapters found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {chapters.map((chapter) => (
                                <ChapterCard key={chapter._id} chapter={chapter} />
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="pro-card rounded-2xl p-8 md:p-12 mb-20 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-yellow to-transparent opacity-50"></div>

                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(230,194,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(230,194,0,0.3) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    ></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-cyber-yellow/10 flex items-center justify-center border border-cyber-yellow/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyber-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-4">
                            Your Chapter <span className="text-cyber-yellow">Not Listed?</span>
                        </h3>
                        <p className="text-cyber-text-secondary max-w-lg mx-auto mb-8 text-sm md:text-base leading-relaxed">
                            Don&apos;t see your city? You can be the one to bring CyberX to your community.
                        </p>

                        <a
                            href="mailto:community@cyberx.org.in?subject=Start%20a%20CyberX%20Chapter"
                            className="inline-flex items-center px-8 py-3.5 bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg transition-all duration-200 text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            How to Start a Chapter
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center pb-8">
                    <p className="text-cyber-text-muted text-sm">
                        © 2026 CyberX Community — All rights reserved.
                    </p>
                </footer>

            </main>
        </div>
    );
}

/* ---------- Chapter Card Component ---------- */
function ChapterCard({ chapter }) {
    const isActive = chapter.status === 'active';

    return (
        <Link href={`/chapters/${chapter._id}`} className="block">
            <div className={`pro-card rounded-xl overflow-hidden transition-all duration-300 group hover:translate-y-[-4px] cursor-pointer ${isActive ? 'hover:border-cyber-yellow/40' : 'hover:border-cyber-border-hover'
                }`}>
                {/* Card Top Accent */}
                {isActive && (
                    <div className="h-0.5 bg-gradient-to-r from-cyber-yellow via-cyber-yellow/60 to-transparent"></div>
                )}

                <div className="p-6">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-poppins font-bold text-white group-hover:text-cyber-yellow transition-colors">
                                {chapter.city}
                            </h3>
                            <p className="text-xs text-cyber-text-muted font-medium">{chapter.state}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${isActive
                            ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                            : 'bg-cyber-card text-cyber-text-muted border border-cyber-border'
                            }`}>
                            {isActive ? '● Active' : 'Coming Soon'}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-cyber-text-secondary leading-relaxed mb-5">
                        {chapter.description}
                    </p>

                    {/* Highlights */}
                    {chapter.highlights && chapter.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {chapter.highlights.map((tag) => (
                                <span
                                    key={tag}
                                    className={`px-2.5 py-1 text-xs rounded-md font-medium ${isActive
                                        ? 'bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/15'
                                        : 'bg-cyber-card text-cyber-text-muted border border-cyber-border'
                                        }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Stats Row (active chapters only) */}
                    {isActive && (
                        <div className="grid grid-cols-3 gap-3 mb-5 pt-4 border-t border-cyber-border">
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{chapter.members || '—'}</div>
                                <div className="text-[10px] text-cyber-text-muted uppercase tracking-wider">Members</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{chapter.events ?? '—'}</div>
                                <div className="text-[10px] text-cyber-text-muted uppercase tracking-wider">Events</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{chapter.founded || '—'}</div>
                                <div className="text-[10px] text-cyber-text-muted uppercase tracking-wider">Founded</div>
                            </div>
                        </div>
                    )}

                    {/* Chapter Lead / CTA */}
                    {isActive && chapter.lead ? (
                        <div className="flex items-center justify-between pt-4 border-t border-cyber-border">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-cyber-yellow/15 flex items-center justify-center mr-3">
                                    <span className="text-xs font-bold text-cyber-yellow">
                                        {chapter.lead.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{chapter.lead}</p>
                                    <p className="text-[10px] text-cyber-text-muted uppercase tracking-wider">Chapter Lead</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {chapter.linkedin && (
                                    <a href={chapter.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-cyber-card border border-cyber-border flex items-center justify-center hover:border-cyber-yellow/40 transition-all" aria-label="LinkedIn">
                                        <svg className="w-3.5 h-3.5 text-cyber-text-secondary hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    </a>
                                )}
                                {chapter.instagram && (
                                    <a href={chapter.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-cyber-card border border-cyber-border flex items-center justify-center hover:border-cyber-yellow/40 transition-all" aria-label="Instagram">
                                        <svg className="w-3.5 h-3.5 text-cyber-text-secondary hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 border-t border-cyber-border">
                            <button
                                className="w-full py-2.5 rounded-lg border border-dashed border-cyber-border text-cyber-text-muted text-sm font-medium hover:border-cyber-yellow/40 hover:text-cyber-yellow transition-all duration-200 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = 'mailto:community@cyberx.org.in?subject=Lead%20CyberX%20' + chapter.city;
                                }}
                            >
                                Interested? Apply to Lead →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

/* ---------- DecryptedText Animation ---------- */
function DecryptedText({ text, className = '' }) {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(
                text
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'[Math.floor(Math.random() * 50)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text]);

    return <span className={`text-cyber-yellow ${className}`}>{displayText}</span>;
}
