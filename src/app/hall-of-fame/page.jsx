"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ──────────────────────────────────────────────
   HALL OF FAME DATA
   ────────────────────────────────────────────── */
const HALL_OF_FAME = [
    {
        year: 2026,
        entries: [
            {
                name: "Pranit Chavan",
                description: "Reported Stored XSS vulnerability on examplecorp.com",
                date: "15 January 2026",
            },
            {
                name: "Aarav Mehta",
                description: "Reported IDOR vulnerability on finsecure.io",
                date: "3 February 2026",
            },
            {
                name: "Sneha Patil",
                description: "Reported Rate Limiting Bypass on quickpay.in",
                date: "28 January 2026",
            },
        ],
    },
    {
        year: 2025,
        entries: [
            {
                name: "Rohit Sharma",
                description: "Reported SQL Injection vulnerability on eduportal.com",
                date: "20 November 2025",
            },
            {
                name: "Pranit Chavan",
                description: "Reported Authentication Bypass vulnerability on cloudstack.io",
                date: "14 September 2025",
            },
            {
                name: "Priya Deshmukh",
                description: "Reported SSRF vulnerability on docgen.com",
                date: "30 July 2025",
            },
            {
                name: "Vikram Singh",
                description: "Reported Privilege Escalation vulnerability on teamflow.app",
                date: "12 June 2025",
            },
            {
                name: "Ananya Kulkarni",
                description: "Reported CSRF vulnerability on healthtrack.org",
                date: "22 April 2025",
            },
            {
                name: "Aarav Mehta",
                description: "Reported Information Disclosure vulnerability on retailmax.com",
                date: "8 March 2025",
            },
        ],
    },
    {
        year: 2024,
        entries: [
            {
                name: "Rohit Sharma",
                description: "Reported Remote Code Execution vulnerability on logmanager.io",
                date: "5 December 2024",
            },
            {
                name: "Priya Deshmukh",
                description: "Reported XXE Injection vulnerability on datavault.com",
                date: "18 October 2024",
            },
            {
                name: "Sneha Patil",
                description: "Reported Open Redirect vulnerability on socialhub.com",
                date: "25 August 2024",
            },
            {
                name: "Vikram Singh",
                description: "Reported Subdomain Takeover vulnerability on techstart.co",
                date: "14 May 2024",
            },
        ],
    },
];

/* ──────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────── */
export default function HallOfFame() {
    return (
        <div className="min-h-screen bg-[var(--color-cyber-black)] text-[var(--color-cyber-text)]">
            <style jsx global>{`
        .hof-entry {
          opacity: 0;
          transform: translateY(8px);
          animation: hofFadeIn 0.4s ease-out forwards;
        }
        @keyframes hofFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }
        .hof-hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 80px 80px;
        }
      `}</style>

            {/* ═══ HERO ═══ */}
            <header className="relative border-b border-[var(--color-cyber-border)] overflow-hidden">
                <div className="absolute inset-0 hof-hero-grid pointer-events-none" />
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-[var(--color-cyber-yellow)] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />

                <div className="relative max-w-3xl mx-auto px-6 pt-8 pb-14">
                    {/* Nav */}
                    <nav className="flex items-center justify-between mb-20">
                        <a href="/" className="text-sm text-[var(--color-cyber-text-muted)] hover:text-white transition-colors flex items-center gap-1.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            Home
                        </a>
                        <div className="relative w-28 h-9">
                            <Image src="/assets/logo.png" alt="CyberX" fill className="object-contain" priority />
                        </div>
                    </nav>

                    {/* Title */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-cyber-yellow)]/15 bg-[var(--color-cyber-yellow)]/5 mb-5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-cyber-yellow)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-cyber-yellow)]">
                                Security Research
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                            Hall of <span className="text-[var(--color-cyber-yellow)]">Fame</span>
                        </h1>

                        <p className="text-[var(--color-cyber-text-secondary)] text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                            We would like to thank the following security researchers for responsibly disclosing vulnerabilities and helping us improve security.
                        </p>
                    </div>
                </div>
            </header>

            {/* ═══ ENTRIES BY YEAR ═══ */}
            <main className="max-w-3xl mx-auto px-6 py-14">
                {HALL_OF_FAME.map((yearGroup, yi) => (
                    <section key={yearGroup.year} className={yi > 0 ? "mt-14" : ""}>
                        {/* Year */}
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-cyber-yellow)] tracking-tight">
                                {yearGroup.year}
                            </h2>
                            <div className="flex-1 h-px bg-[var(--color-cyber-border)]" />
                        </div>

                        {/* Entries */}
                        <div className="space-y-8 pl-1">
                            {yearGroup.entries.map((entry, i) => (
                                <div
                                    key={`${yearGroup.year}-${i}`}
                                    className="hof-entry"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                                        {entry.name}
                                    </h3>
                                    <p className="text-sm text-[var(--color-cyber-text-secondary)] mb-1.5 leading-relaxed">
                                        {entry.description}
                                    </p>
                                    <time className="text-xs text-[var(--color-cyber-text-muted)] font-mono">
                                        {entry.date}
                                    </time>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* ═══ FOOTER ═══ */}
            <footer className="border-t border-[var(--color-cyber-border)] mt-4">
                <div className="max-w-3xl mx-auto px-6 py-10 text-center">
                    <p className="text-sm text-[var(--color-cyber-text-secondary)] mb-1">
                        Found a vulnerability?{" "}
                        <a href="mailto:security@cyberx.org.in" className="text-[var(--color-cyber-yellow)] hover:underline">
                            Report it responsibly
                        </a>
                    </p>
                    <p className="text-xs text-[var(--color-cyber-text-muted)] mt-4">
                        © 2026 CyberX Community — All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
