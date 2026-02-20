"use client";

import { useState } from "react";
import Image from "next/image";
import { Flag, Shield, Terminal, Target, Code, CheckCircle2, X, Download, Server, Play, Link as LinkIcon, ArrowRight } from "lucide-react";

/* ──────────────────────────────────────────────
   CTF COLLECTION DATA
   ────────────────────────────────────────────── */
const CTF_CATEGORIES = [
    {
        category: "Jeopardy",
        description: "Mixed challenges testing a wide variety of skills including web, crypto, and forensics.",
        challenges: [
            {
                id: "ctf-cyberx-2026",
                title: "CyberX CTF v4.0",
                description: "Our flagship annual CTF. A jeopardy-style competition featuring advanced Web Exploitation, Cryptography, Reverse Engineering, and Forensics challenges. Focuses heavily on bypassing WAFs and modern exploit chains.",
                difficulty: "Advanced",
                completed: false,
                assets: [
                    { name: "challenge_binary.elf", type: "file" },
                    { name: "source_code.zip", type: "file" }
                ],
                urls: [
                    { name: "Target Instance", url: "http://target1.cyberx.local" }
                ]
            },
            {
                id: "ctf-cyberx-v3",
                title: "CyberX CTF v3.0",
                description: "The classic third edition. Intense binary exploitation (Pwn), shellcoding, and complex web architecture challenges that tested participants' deep technical understanding.",
                difficulty: "Advanced",
                completed: false,
                assets: [
                    { name: "pwn_challenge.tar.gz", type: "file" }
                ],
                urls: []
            },
        ]
    },
    {
        category: "Web Security",
        description: "Challenges focused purely on exploiting vulnerabilities in web applications.",
        challenges: [
            {
                id: "ctf-gdsc-2026",
                title: "Capture the Bug",
                description: "Collaborative event with GDSC focused heavily on web application security, bug hunting methodologies, and exploiting common web vulnerabilities like XSS, SQLi, and CSRF.",
                difficulty: "Intermediate",
                completed: true,
                assets: [],
                urls: [
                    { name: "Web App URL", url: "http://webapp.cyberx.local" }
                ]
            },
        ]
    },
    {
        category: "Attack & Defense",
        description: "Live combat scenarios where you must patch your own infrastructure while attacking others.",
        challenges: [
            {
                id: "ctf-hacknight-2025",
                title: "HackNight A/D",
                description: "An intense Attack and Defense competition. Teams simultaneously patch vulnerabilities in their own server infrastructure while writing exploits to attack opponents.",
                difficulty: "Expert",
                completed: true,
                assets: [
                    { name: "infrastructure_setup.sh", type: "file" }
                ],
                urls: []
            },
        ]
    },
    {
        category: "Introductory",
        description: "Perfect for beginners looking to learn the ropes of cybersecurity.",
        challenges: [
            {
                id: "ctf-bytebreach-2025",
                title: "ByteBreach Starter",
                description: "Designed specifically for absolute beginners. A gentle introduction to Linux fundamentals, basic web vulnerabilities, OSINT, and simple cryptography algorithms.",
                difficulty: "Beginner",
                completed: false,
                assets: [
                    { name: "beginner_guide.pdf", type: "file" },
                    { name: "basic_crypto.txt", type: "file" }
                ],
                urls: []
            },
        ]
    },
    {
        category: "Cryptography",
        description: "Math, codes, and ciphers. Test your ability to break encryption.",
        challenges: [
            {
                id: "ctf-crypto-crack",
                title: "Crack The Code",
                description: "Pure cryptography and puzzle-solving competition. Ranging from classical ciphers to breaking poorly implemented modern asymmetric encryption.",
                difficulty: "Intermediate",
                completed: false,
                assets: [
                    { name: "encrypted_message.enc", type: "file" },
                    { name: "public_key.pem", type: "file" }
                ],
                urls: []
            },
        ]
    }
];

const DIFFICULTY_MAP = {
    Beginner: { color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10", icon: <Shield size={12} /> },
    Intermediate: { color: "text-blue-400 border-blue-400/30 bg-blue-400/10", icon: <Terminal size={12} /> },
    Advanced: { color: "text-purple-400 border-purple-400/30 bg-purple-400/10", icon: <Code size={12} /> },
    Expert: { color: "text-red-400 border-red-400/30 bg-red-400/10", icon: <Target size={12} /> },
};

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function CTFsPage() {
    const [selectedChallenge, setSelectedChallenge] = useState(null);

    const openModal = (ctf) => {
        setSelectedChallenge(ctf);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedChallenge(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="min-h-screen bg-[var(--color-cyber-black)] text-[var(--color-cyber-text)] font-[var(--font-inter)] selection:bg-[var(--color-cyber-yellow)] selection:text-black">
            {/* ═══ Inline Styles for Animations & Glows ═══ */}
            <style jsx global>{`
        .ctf-hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        @keyframes hof-fade-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-card {
          animation: hof-fade-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .text-glow-yellow {
          text-shadow: 0 0 30px rgba(230, 194, 0, 0.2);
        }
        .pro-card {
           background: rgba(24, 24, 27, 0.6);
           backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.05);
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        /* Modal Animation */
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-scale-up {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-backdrop {
          animation: modal-fade-in 0.2s ease-out forwards;
        }
        .modal-content {
          animation: modal-scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Sharp Input Styles */
        .sharp-input {
          border-radius: 0 !important;
        }
      `}</style>

            {/* ═══════════ HERO ═══════════ */}
            <header className="relative border-b border-[var(--color-cyber-border)] overflow-hidden">
                {/* Ambient Grid Context */}
                <div className="absolute inset-0 ctf-hero-grid pointer-events-none" />

                {/* Glow Effects */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-cyber-yellow)] rounded-full blur-[200px] opacity-[0.035] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16">
                    {/* Navigation */}
                    <nav className="flex items-center justify-between mb-16">
                        <a href="/" className="text-sm text-[var(--color-cyber-text-muted)] hover:text-white transition-colors flex items-center gap-1.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            Home
                        </a>
                        <div className="relative w-28 h-9">
                            <Image src="/assets/logo.png" alt="CyberX" fill className="object-contain" priority />
                        </div>
                    </nav>

                    {/* Title Area */}
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-cyber-yellow)]/15 bg-[var(--color-cyber-yellow)]/5 mb-6">
                            <Flag size={14} className="text-[var(--color-cyber-yellow)]" />
                            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-cyber-yellow)]">
                                Cybersecurity Competitions
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5 text-glow-yellow">
                            Capture The <span className="text-[var(--color-cyber-yellow)] relative">Flag
                                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--color-cyber-yellow)] to-transparent" />
                            </span>
                        </h1>

                        <p className="text-[var(--color-cyber-text-secondary)] text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                            Explore our collection of Capture The Flag challenges. Test your hacking skills across web exploitation, cryptography, reverse engineering, and PWN.
                        </p>
                    </div>
                </div>
            </header>

            {/* ═══════════ CTF CATEGORY BLOCKS ═══════════ */}
            <main className="max-w-7xl mx-auto px-6 py-16 text-center">

                {CTF_CATEGORIES.map((catGroup, groupIndex) => (
                    <div key={catGroup.category} className={groupIndex > 0 ? "mt-16 text-left" : "text-left"}>

                        {/* Category Header */}
                        <div className="mb-8 border-b border-[var(--color-cyber-border)]/50 pb-4">
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-white">
                                {catGroup.category}
                            </h2>
                            <p className="text-sm text-[var(--color-cyber-text-muted)] mt-2">
                                {catGroup.description}
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {catGroup.challenges.map((ctf, index) => {
                                const diffStyle = DIFFICULTY_MAP[ctf.difficulty] || DIFFICULTY_MAP.Beginner;

                                return (
                                    <div
                                        key={ctf.id}
                                        onClick={() => openModal(ctf)}
                                        className="group cursor-pointer anim-card pro-card rounded-xl relative overflow-hidden flex flex-col transition-all duration-300 hover:border-[var(--color-cyber-yellow)]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-cyber-yellow)]/5"
                                        style={{ animationDelay: `${index * 80}ms` }}
                                    >
                                        {/* Decorative Top Line */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-cyber-yellow)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20" />

                                        {/* Card Content Area */}
                                        <div className="p-6 flex flex-col flex-1">

                                            {/* Top Meta Line: Difficulty & Completed Status */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${diffStyle.color}`}>
                                                    {diffStyle.icon}
                                                    {ctf.difficulty}
                                                </span>

                                                {/* Completed Badge (Only visible if solved) */}
                                                {ctf.completed && (
                                                    <span className="text-[10px] font-bold tracking-wider uppercase text-green-400 flex items-center gap-1.5 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
                                                        <CheckCircle2 size={12} />
                                                        Solved
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-cyber-yellow)] transition-colors">
                                                {ctf.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-[var(--color-cyber-text-secondary)] leading-relaxed mt-1 line-clamp-2">
                                                {ctf.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>

            {/* ═══════════ MODAL POPUP ═══════════ */}
            {selectedChallenge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm modal-backdrop"
                        onClick={closeModal}
                    />

                    {/* Modal Container */}
                    <div className="relative w-full max-w-5xl bg-[var(--color-cyber-card)] border border-[var(--color-cyber-border)] shadow-2xl shadow-[var(--color-cyber-yellow)]/10 overflow-hidden flex flex-col md:flex-row modal-content h-full max-h-[85vh] md:h-[600px] rounded-2xl">

                        {/* Ambient Background Grid for Modal */}
                        <div className="absolute inset-0 ctf-hero-grid opacity-30 pointer-events-none" />

                        {/* Left Pane (Submit Flag & Aesthetic visual) */}
                        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-[var(--color-cyber-border)]/50 bg-[var(--color-cyber-black)]/50 flex flex-col relative z-10">

                            {/* Submit Flag Area (Bottom Left) */}
                            <div className="p-8 border-t border-[var(--color-cyber-border)]/50 bg-black/40 mt-auto">
                                <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-[var(--color-cyber-yellow)] mb-4 flex items-center gap-2">
                                    <Flag size={14} /> Submit Flag
                                </h4>

                                <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
                                    {/* SHARP RECTANGLE INPUT */}
                                    <input
                                        type="text"
                                        placeholder="CyberX{...}"
                                        className="w-full bg-[var(--color-cyber-black)] border border-[var(--color-cyber-border)] text-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-cyber-yellow)] sharp-input font-mono placeholder:text-[var(--color-cyber-text-muted)] transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-[var(--color-cyber-yellow)] hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-sm py-3 sharp-input transition-colors flex items-center justify-center gap-2"
                                    >
                                        Submit <ArrowRight size={16} />
                                    </button>
                                </form>

                                {selectedChallenge.completed && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-2 border border-green-400/20 sharp-input">
                                        <CheckCircle2 size={14} />
                                        You have already solved this challenge.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Pane (Details, Assets, Start Instance) */}
                        <div className="w-full md:w-3/5 p-6 sm:p-10 flex flex-col relative z-10 overflow-y-auto custom-scrollbar">
                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-[var(--color-cyber-text-muted)] hover:text-white transition-colors p-2 bg-black/20 rounded-full"
                            >
                                <X size={20} />
                            </button>

                            {/* Header Data */}
                            <div className="mb-6">
                                {/* Difficulty Badge */}
                                <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border text-white/80 border-white/10 bg-white/5">
                                    {DIFFICULTY_MAP[selectedChallenge.difficulty]?.icon}
                                    {selectedChallenge.difficulty}
                                </div>

                                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                                    {selectedChallenge.title}
                                </h2>
                                <p className="text-[var(--color-cyber-text-secondary)] text-sm sm:text-base leading-relaxed">
                                    {selectedChallenge.description}
                                </p>
                            </div>

                            {/* Start Instance Button */}
                            <div className="mb-10">
                                <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold uppercase tracking-wider sharp-input transition-colors group">
                                    <Server size={16} className="text-[var(--color-cyber-yellow)] group-hover:animate-pulse" />
                                    Start Instance
                                    <Play size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <p className="text-xs text-[var(--color-cyber-text-muted)] mt-2 italic">
                                    Clicking this will spin up an isolated container for this challenge.
                                </p>
                            </div>

                            {/* Assets & Downloads */}
                            {((selectedChallenge.assets && selectedChallenge.assets.length > 0) || (selectedChallenge.urls && selectedChallenge.urls.length > 0)) && (
                                <div className="mt-auto pt-8 border-t border-[var(--color-cyber-border)]/50">
                                    <h4 className="text-xs uppercase tracking-[0.15em] font-bold text-white mb-4">
                                        Challenge Assets
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {/* Files */}
                                        {selectedChallenge.assets?.map((asset, idx) => (
                                            <a
                                                key={idx}
                                                href="#"
                                                className="flex items-center justify-between p-3 bg-black/40 border border-[var(--color-cyber-border)] hover:border-[var(--color-cyber-border-hover)] text-sm text-[var(--color-cyber-text-secondary)] hover:text-white transition-colors group sharp-input"
                                            >
                                                <span className="flex items-center gap-3 font-mono">
                                                    <Download size={16} className="text-[var(--color-cyber-yellow)]" />
                                                    {asset.name}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider text-[var(--color-cyber-text-muted)] group-hover:text-white transition-colors">
                                                    Download
                                                </span>
                                            </a>
                                        ))}

                                        {/* URLs */}
                                        {selectedChallenge.urls?.map((urlItem, idx) => (
                                            <a
                                                key={`url-${idx}`}
                                                href={urlItem.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 bg-black/40 border border-[var(--color-cyber-border)] hover:border-[var(--color-cyber-border-hover)] text-sm text-[var(--color-cyber-text-secondary)] hover:text-white transition-colors group sharp-input"
                                            >
                                                <span className="flex items-center gap-3 font-mono">
                                                    <LinkIcon size={16} className="text-blue-400" />
                                                    {urlItem.name}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wider text-[var(--color-cyber-text-muted)] group-hover:text-white transition-colors">
                                                    Open Link
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-[var(--color-cyber-border)] mt-8 py-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs text-[var(--color-cyber-text-muted)] mt-4">
                        © 2026 CyberX Community — All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
