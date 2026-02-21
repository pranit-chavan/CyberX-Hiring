"use client";

import Image from "next/image";
import { Presentation, ExternalLink, FileText, Video, Play } from "lucide-react";

/* ──────────────────────────────────────────────
   MEDIA / TALKS DATA
   ────────────────────────────────────────────── */
const TALKS = [
    {
        year: 2025,
        type: "Conference Talk",
        title: "IT SecX 2025",
        description: "Taranis AI – Advanced OSINT-Analyse with NLP and AI",
        resources: [
            { label: "English slides", icon: "slides" },
            { label: "German video", icon: "video" },
        ],
        buttons: [
            { label: "Slides (EN)", icon: "pdf", href: "#" },
            { label: "Watch Video (DE)", icon: "play", href: "#" },
        ],
    },
    {
        year: 2025,
        type: "Conference Talk",
        title: "DevConf 2025",
        description: "Taranis AI: Pioneering AI-Driven OSINT",
        resources: [
            { label: "English slides", icon: "slides" },
            { label: "English recording", icon: "video" },
        ],
        buttons: [
            { label: "Slides (EN)", icon: "pdf", href: "#" },
            { label: "Watch Video (EN)", icon: "play", href: "#" },
        ],
    },
    {
        year: 2024,
        type: "Invited Talk",
        title: "On the Application of NLP for Advanced OSINT Analysis",
        description:
            "Invited talk at the 16th International Conference on Cyber Conflict (CyCon), Tallinn, Estonia.",
        resources: [
            { label: "Slides (PDF)", icon: "slides" },
            { label: "Recording", icon: "video" },
        ],
        buttons: [
            { label: "Slides (PDF)", icon: "pdf", href: "#" },
            { label: "Watch Video (EN)", icon: "play", href: "#" },
        ],
    },
    {
        year: 2023,
        type: "Conference Talk",
        title: "IKT Sicherheitskonferenz 2023",
        description:
            "Advanced OSINT Analysis for NIS Authorities, CSIRT Teams and Organizations",
        resources: [{ label: "English slides", icon: "slides" }],
        buttons: [{ label: "Slides (EN)", icon: "pdf", href: "#" }],
    },
];

/* ──────────────────────────────────────────────
   RESOURCE ICON COMPONENT
   ────────────────────────────────────────────── */
function ResourceIcon({ type }) {
    if (type === "slides") {
        return (
            <FileText
                size={14}
                className="text-[var(--color-cyber-yellow)] shrink-0"
            />
        );
    }
    return (
        <Video
            size={14}
            className="text-[var(--color-cyber-yellow)] shrink-0"
        />
    );
}

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */
export default function MediaPage() {
    return (
        <div className="min-h-screen bg-[var(--color-cyber-black)] text-[var(--color-cyber-text)] font-[var(--font-inter)] selection:bg-[var(--color-cyber-yellow)] selection:text-black">
            {/* ═══ Inline Styles ═══ */}
            <style jsx global>{`
                .media-hero-grid {
                    background-image: linear-gradient(
                            rgba(255, 255, 255, 0.015) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(255, 255, 255, 0.015) 1px,
                            transparent 1px
                        );
                    background-size: 60px 60px;
                }
                @keyframes mediaFadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(18px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .media-card {
                    opacity: 0;
                    animation: mediaFadeUp 0.5s ease-out forwards;
                }
                .text-glow-yellow {
                    text-shadow: 0 0 30px rgba(230, 194, 0, 0.2);
                }
                .media-pro-card {
                    background: rgba(24, 24, 27, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    transition: border-color 0.3s, box-shadow 0.3s;
                }
                .media-pro-card:hover {
                    border-color: rgba(230, 194, 0, 0.25);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 30px rgba(230, 194, 0, 0.05);
                }
            `}</style>

            {/* ═══════════ HERO ═══════════ */}
            <header className="relative border-b border-[var(--color-cyber-border)] overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 media-hero-grid pointer-events-none" />

                {/* Ambient Glow */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-cyber-yellow)] rounded-full blur-[200px] opacity-[0.035] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16 lg:pb-24">
                    {/* Navigation */}
                    <nav className="flex items-center justify-between mb-16">
                        <a
                            href="/"
                            className="text-sm text-[var(--color-cyber-text-muted)] hover:text-white transition-colors flex items-center gap-1.5"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            Home
                        </a>
                        <div className="relative w-28 h-9">
                            <Image
                                src="/assets/logo.png"
                                alt="CyberX"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </nav>

                    {/* Title Area */}
                    <div className="text-center max-w-3xl mx-auto mt-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-cyber-yellow)]/15 bg-[var(--color-cyber-yellow)]/5 mb-6">
                            <Presentation
                                size={14}
                                className="text-[var(--color-cyber-yellow)]"
                            />
                            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-cyber-yellow)]">
                                Talks & Media
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-glow-yellow">
                            Featured{" "}
                            <span className="text-[var(--color-cyber-yellow)] relative">
                                Talks & Media
                                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--color-cyber-yellow)] to-transparent" />
                            </span>
                        </h1>

                        <p className="text-[var(--color-cyber-text-secondary)] text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
                            Explore our recent conference appearances and access
                            the slide decks and recordings.
                        </p>
                    </div>
                </div>
            </header>

            {/* ═══════════ TALKS GRID ═══════════ */}
            <section className="py-20 px-6 relative">
                {/* Subtle ambient glow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[600px] bg-[var(--color-cyber-yellow)] rounded-full blur-[250px] opacity-[0.02] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                                Conference Appearances
                            </h2>
                            <p className="text-[var(--color-cyber-text-muted)] mt-2">
                                Presentations, invited talks, and workshop
                                recordings.
                            </p>
                        </div>
                        <div className="text-sm text-[var(--color-cyber-text-muted)] font-mono">
                            {TALKS.length} talks
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TALKS.map((talk, index) => (
                            <div
                                key={index}
                                className={`media-pro-card media-card rounded-2xl flex flex-col ${index === TALKS.length - 1 &&
                                        TALKS.length % 3 !== 0
                                        ? ""
                                        : ""
                                    }`}
                                style={{
                                    animationDelay: `${index * 120}ms`,
                                }}
                            >
                                {/* Card Header: Year + Type */}
                                <div className="px-6 pt-6 pb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[var(--color-cyber-yellow)]/15 text-[var(--color-cyber-yellow)] text-xs font-bold tracking-wide">
                                            {talk.year}
                                        </span>
                                        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--color-cyber-text-muted)]">
                                            {talk.type}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                                        {talk.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-[var(--color-cyber-text-secondary)] leading-relaxed mb-4">
                                        {talk.description}
                                    </p>

                                    {/* Resource Links */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-2">
                                        {talk.resources.map((res, ri) => (
                                            <div
                                                key={ri}
                                                className="flex items-center gap-1.5 text-xs text-[var(--color-cyber-text-secondary)]"
                                            >
                                                <ResourceIcon
                                                    type={res.icon}
                                                />
                                                <span>{res.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mt-auto border-t border-[var(--color-cyber-border)]/50" />

                                {/* Action Buttons */}
                                <div className="px-6 py-4 flex flex-wrap gap-3">
                                    {talk.buttons.map((btn, bi) => (
                                        <a
                                            key={bi}
                                            href={btn.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${btn.icon === "pdf"
                                                    ? "bg-[var(--color-cyber-yellow)]/10 text-[var(--color-cyber-yellow)] border border-[var(--color-cyber-yellow)]/25 hover:bg-[var(--color-cyber-yellow)]/20 hover:border-[var(--color-cyber-yellow)]/50"
                                                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20"
                                                }`}
                                        >
                                            {btn.icon === "pdf" ? (
                                                <FileText size={14} />
                                            ) : (
                                                <Play size={14} />
                                            )}
                                            {btn.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-[var(--color-cyber-border)] py-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs text-[var(--color-cyber-text-muted)] mt-4">
                        © 2026 CyberX Community — All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
