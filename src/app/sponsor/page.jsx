"use client";

import Image from "next/image";
import { Handshake, Target, Users, Zap, Award, BookOpen, Lightbulb, MapPin, Mail, ArrowRight, ShieldCheck } from "lucide-react";

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */
const REASONS = [
    {
        icon: <Users size={24} className="text-[var(--color-cyber-yellow)]" />,
        title: "Access Top Talent",
        description: "Connect directly with passionate ethical hackers, developers, and cybersecurity enthusiasts looking for their next big career opportunity."
    },
    {
        icon: <Target size={24} className="text-[var(--color-cyber-yellow)]" />,
        title: "Brand Visibility",
        description: "Showcase your brand to a niche, highly engaged community of security professionals and students across multiple technical events."
    },
    {
        icon: <Zap size={24} className="text-[var(--color-cyber-yellow)]" />,
        title: "Thought Leadership",
        description: "Position your company as an industry leader driving cybersecurity education, awareness, and community growth."
    },
    {
        icon: <Award size={24} className="text-[var(--color-cyber-yellow)]" />,
        title: "Support Education",
        description: "Directly contribute to building the next generation of security professionals through hands-on workshops and CTFs."
    },
    {
        icon: <Lightbulb size={24} className="text-[var(--color-cyber-yellow)]" />,
        title: "Product Feedback",
        description: "Get your tools and platforms into the hands of real security researchers and gather invaluable, unfiltered technical feedback."
    }
];

const WHAT_IT_LOOKS_LIKE = [
    {
        title: "Event Branding & Booths",
        description: "Prominent logo placement on event banners, digital materials, CTF platforms, and physical booth space at our localized chapters to interact with attendees."
    },
    {
        title: "Speaker Slots & Workshops",
        description: "Dedicated time for your technical team to present research, host a workshop, or demonstrate your product to our community."
    },
    {
        title: "Hiring & Resumes",
        description: "Direct access to the opt-in resume database of event attendees and CTF top performers for your talent acquisition pipeline."
    },
    {
        title: "Custom CTF Challenges",
        description: "Collaborate with our team to design custom CTF challenges that highlight your technology or emulate your specific threat landscape."
    }
];

/* ──────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────── */
export default function SponsorPage() {
    return (
        <div className="min-h-screen bg-[var(--color-cyber-black)] text-[var(--color-cyber-text)] font-[var(--font-inter)] selection:bg-[var(--color-cyber-yellow)] selection:text-black">
            {/* ═══ Inline Styles for Animations & Glows ═══ */}
            <style jsx global>{`
        .sponsor-hero-grid {
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
        .sharp-input { border-radius: 0 !important; }
      `}</style>

            {/* ═══════════ HERO ═══════════ */}
            <header className="relative border-b border-[var(--color-cyber-border)] overflow-hidden">
                {/* Ambient Grid Context */}
                <div className="absolute inset-0 sponsor-hero-grid pointer-events-none" />

                {/* Glow Effects */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-cyber-yellow)] rounded-full blur-[200px] opacity-[0.035] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-16 lg:pb-24">
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
                    <div className="text-center max-w-3xl mx-auto mt-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-cyber-yellow)]/15 bg-[var(--color-cyber-yellow)]/5 mb-6">
                            <Handshake size={14} className="text-[var(--color-cyber-yellow)]" />
                            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--color-cyber-yellow)]">
                                Partnerships
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-glow-yellow">
                            Sponsor <span className="text-[var(--color-cyber-yellow)] relative">CyberX
                                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--color-cyber-yellow)] to-transparent" />
                            </span>
                        </h1>

                        <p className="text-[var(--color-cyber-text-secondary)] text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
                            Partner with the fastest-growing cybersecurity community. Reach top talent, increase brand awareness, and help us shape the next generation of security professionals.
                        </p>

                        <a href="#contact" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-cyber-yellow)] hover:bg-yellow-400 text-black font-bold uppercase tracking-wider text-sm sharp-input transition-all duration-300 hover:shadow-[0_0_20px_rgba(230,194,0,0.4)]">
                            Become a Sponsor <ArrowRight size={16} />
                        </a>
                    </div>
                </div>
            </header>

            {/* ═══════════ REASONS TO SPONSOR ═══════════ */}
            <section className="py-20 px-6 border-b border-[var(--color-cyber-border)]/50 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                                5 Reasons to Sponsor
                            </h2>
                            <p className="text-[var(--color-cyber-text-muted)] mt-2">Why partnering with CyberX is a strategic win.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {REASONS.map((reason, index) => (
                            <div
                                key={index}
                                className={`pro-card p-8 rounded-2xl flex flex-col anim-card group hover:border-[var(--color-cyber-yellow)]/30 transition-colors ${index === 3 ? "lg:col-span-1 lg:col-start-1" : ""} ${index === 4 ? "lg:col-span-2" : ""}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-12 h-12 bg-[var(--color-cyber-black)] border border-[var(--color-cyber-border)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[var(--color-cyber-yellow)]/10 transition-all duration-300">
                                    {reason.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{reason.title}</h3>
                                <p className="text-[var(--color-cyber-text-secondary)] leading-relaxed italic border-l-2 border-[var(--color-cyber-border)] pl-4">"{reason.description}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ═══════════ WHAT DOES IT LOOK LIKE ═══════════ */}
            < section className="py-20 px-6 bg-[var(--color-cyber-card)]/30 border-b border-[var(--color-cyber-border)]/50" >
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-cyber-yellow)]/10 text-[var(--color-cyber-yellow)] mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            What Does Sponsoring Look Like?
                        </h2>
                        <p className="text-[var(--color-cyber-text-secondary)]">Depending on the tier, your sponsorship integrates deeply into our community ecosystem, much like leading industry conferences.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {WHAT_IT_LOOKS_LIKE.map((item, index) => (
                            <div key={index} className="flex gap-4 p-6 border border-[var(--color-cyber-border)]/50 bg-[var(--color-cyber-black)]/30 rounded-xl hover:bg-[var(--color-cyber-card)]/50 transition-colors">
                                <div className="text-[var(--color-cyber-yellow)] font-mono font-bold text-2xl opacity-50">0{index + 1}</div>
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                                    <p className="text-sm text-[var(--color-cyber-text-secondary)] leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* ═══════════ SPONSORSHIP CONTACT ═══════════ */}
            < section id="contact" className="py-24 px-6 relative overflow-hidden" >
                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[var(--color-cyber-yellow)] rounded-full blur-[250px] opacity-[0.02] pointer-events-none" />

                <div className="max-w-4xl mx-auto pro-card rounded-2xl p-8 md:p-12 relative z-10 border-[var(--color-cyber-yellow)]/20 shadow-2xl shadow-[var(--color-cyber-yellow)]/5">
                    <div className="flex flex-col md:flex-row gap-12 items-center">

                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Partner?</h2>
                            <p className="text-[var(--color-cyber-text-secondary)] leading-relaxed mb-8">
                                Whether you are looking for brand awareness, talent acquisition, or you simply want to support the cybersecurity community, we have customized sponsorship tiers to fit your goals.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-white">
                                    <Mail className="text-[var(--color-cyber-yellow)]" size={18} />
                                    <a href="mailto:contact@cyberx.org.in" className="hover:text-[var(--color-cyber-yellow)] transition-colors">sponsor@cyberx.org.in</a>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[var(--color-cyber-text-secondary)]">
                                    <MapPin className="text-[var(--color-cyber-yellow)]" size={18} />
                                    <span>Nashik, Maharashtra HQ</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 bg-[var(--color-cyber-black)] p-6 md:p-8 rounded-xl border border-[var(--color-cyber-border)]">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-cyber-yellow)] mb-6">Contact Form</h3>

                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <input type="text" placeholder="Company Name" className="w-full bg-black/50 border border-[var(--color-cyber-border)] text-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-cyber-yellow)] sharp-input transition-colors" />
                                </div>
                                <div>
                                    <input type="email" placeholder="Work Email" className="w-full bg-black/50 border border-[var(--color-cyber-border)] text-white px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-cyber-yellow)] sharp-input transition-colors" />
                                </div>
                                <div>
                                    <select className="w-full bg-black/50 border border-[var(--color-cyber-border)] text-[var(--color-cyber-text-secondary)] px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-cyber-yellow)] sharp-input transition-colors appearance-none">
                                        <option value="" disabled selected>Interested in...</option>
                                        <option value="ctf">Sponsoring a CTF</option>
                                        <option value="chapter">Chapter Sponsorship</option>
                                        <option value="hiring">Hiring / Resume Access</option>
                                        <option value="other">Other Partnership</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-[var(--color-cyber-white)] text-black font-bold uppercase tracking-wider text-sm py-3 sharp-input transition-colors hover:bg-[var(--color-cyber-yellow)] mt-2">
                                    Request Deck
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </section >

            {/* ═══════════ FOOTER ═══════════ */}
            < footer className="border-t border-[var(--color-cyber-border)] py-10" >
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-xs text-[var(--color-cyber-text-muted)] mt-4">
                        © 2026 CyberX Community — All rights reserved.
                    </p>
                </div>
            </footer >
        </div >
    );
}
