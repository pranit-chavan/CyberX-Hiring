"use client";

import { useState } from "react";
import Image from "next/image";

export default function ScholarshipPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        college: "",
        course: "",
        year: "",
        reason: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const next = () => setStep((s) => Math.min(s + 1, 4));
    const prev = () => setStep((s) => Math.max(s - 1, 1));
    const submit = (e) => {
        e.preventDefault();
        setStep(4);
    };

    return (
        <div className="min-h-screen bg-[var(--color-cyber-black)] text-[var(--color-cyber-text)] font-[var(--font-inter)] flex flex-col relative overflow-hidden selection:bg-[var(--color-cyber-yellow)] selection:text-black">
            <style jsx global>{`
                @keyframes sch-slide-in {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes sch-pop {
                    0% { opacity: 0; transform: scale(0.9); }
                    60% { transform: scale(1.03); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .sch-slide { animation: sch-slide-in 0.4s ease-out; }
                .sch-pop { animation: sch-pop 0.5s ease-out; }
                .sch-grid {
                    background-image:
                        linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>

            {/* Background grid texture */}
            <div className="absolute inset-0 sch-grid pointer-events-none" />

            {/* Accent line left */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-purple-600 to-transparent opacity-50" />

            {/* Ambient glow */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[var(--color-cyber-yellow)] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />

            {/* ── NAV ── */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
                <a href="/" className="text-sm text-[var(--color-cyber-text-muted)] hover:text-white transition-colors flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    back
                </a>
                <div className="relative w-28 h-9">
                    <Image src="/assets/logo.png" alt="CyberX" fill className="object-contain" priority />
                </div>
            </nav>

            {/* ── CENTER ── */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 pb-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-[var(--font-poppins)] font-semibold tracking-tight text-center mb-14" style={{ textShadow: '0 0 40px rgba(230,194,0,0.12)' }}>
                    Cyberx <span className="text-[var(--color-cyber-yellow)]">Scholarship</span>
                </h1>

                <div className="w-full max-w-md">

                    {/* ═══ STEP 1: Name ═══ */}
                    {step === 1 && (
                        <form className="sch-slide" onSubmit={(e) => { e.preventDefault(); next(); }}>
                            <div>
                                <label className="block text-base text-[var(--color-cyber-text-secondary)] mb-2 font-medium">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b-2 border-[var(--color-cyber-yellow)] text-[var(--color-cyber-text)] text-lg py-2.5 outline-none font-[var(--font-inter)] placeholder:text-[var(--color-cyber-text-muted)] focus:border-[var(--color-cyber-yellow-hover)] transition-colors"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex justify-end mt-12">
                                <button type="submit" className="bg-[var(--color-cyber-yellow)] hover:bg-[var(--color-cyber-yellow-hover)] text-black font-semibold px-8 py-2.5 text-sm tracking-wide transition-all duration-200 hover:shadow-[0_0_20px_rgba(230,194,0,0.3)]">
                                    Next
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ═══ STEP 2: Contact + College ═══ */}
                    {step === 2 && (
                        <form className="sch-slide" onSubmit={(e) => { e.preventDefault(); next(); }}>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-base text-[var(--color-cyber-text-secondary)] mb-2 font-medium">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-[var(--color-cyber-yellow)] text-[var(--color-cyber-text)] text-lg py-2.5 outline-none font-[var(--font-inter)] placeholder:text-[var(--color-cyber-text-muted)] focus:border-[var(--color-cyber-yellow-hover)] transition-colors"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-base text-[var(--color-cyber-text-secondary)] mb-2 font-medium">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-[var(--color-cyber-yellow)] text-[var(--color-cyber-text)] text-lg py-2.5 outline-none font-[var(--font-inter)] placeholder:text-[var(--color-cyber-text-muted)] focus:border-[var(--color-cyber-yellow-hover)] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-base text-[var(--color-cyber-text-secondary)] mb-2 font-medium">College / Institution</label>
                                    <input
                                        type="text"
                                        name="college"
                                        value={formData.college}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-[var(--color-cyber-yellow)] text-[var(--color-cyber-text)] text-lg py-2.5 outline-none font-[var(--font-inter)] placeholder:text-[var(--color-cyber-text-muted)] focus:border-[var(--color-cyber-yellow-hover)] transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-12">
                                <button type="button" onClick={prev} className="text-sm text-[var(--color-cyber-text-muted)] hover:text-white border border-[var(--color-cyber-border)] hover:border-[var(--color-cyber-border-hover)] px-7 py-2.5 transition-all duration-200">
                                    Back
                                </button>
                                <button type="submit" className="bg-[var(--color-cyber-yellow)] hover:bg-[var(--color-cyber-yellow-hover)] text-black font-semibold px-8 py-2.5 text-sm tracking-wide transition-all duration-200 hover:shadow-[0_0_20px_rgba(230,194,0,0.3)]">
                                    Next
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ═══ STEP 3: Academic + Why ═══ */}
                    {step === 3 && (
                        <form className="sch-slide" onSubmit={submit}>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-base text-[var(--color-cyber-text-secondary)] mb-2 font-medium">Course / Degree</label>
                                    <input
                                        type="text"
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-[var(--color-cyber-yellow)] text-[var(--color-cyber-text)] text-lg py-2.5 outline-none font-[var(--font-inter)] placeholder:text-[var(--color-cyber-text-muted)] focus:border-[var(--color-cyber-yellow-hover)] transition-colors"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-base text-[var(--color-cyber-text-secondary)] mb-2 font-medium">Year of Study</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-[var(--color-cyber-yellow)] text-[var(--color-cyber-text)] text-lg py-2.5 outline-none font-[var(--font-inter)] appearance-none cursor-pointer focus:border-[var(--color-cyber-yellow-hover)] transition-colors [&>option]:bg-[var(--color-cyber-dark)] [&>option]:text-white"
                                        required
                                    >
                                        <option value="" disabled className="text-[var(--color-cyber-text-muted)]">Select year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                        <option value="Postgraduate">Postgraduate</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-base text-[var(--color-cyber-text-secondary)] mb-2 font-medium">Why do you deserve this scholarship?</label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-b-2 border-[var(--color-cyber-yellow)] text-[var(--color-cyber-text)] text-lg py-2.5 outline-none font-[var(--font-inter)] placeholder:text-[var(--color-cyber-text-muted)] focus:border-[var(--color-cyber-yellow-hover)] transition-colors resize-none min-h-[80px]"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-12">
                                <button type="button" onClick={prev} className="text-sm text-[var(--color-cyber-text-muted)] hover:text-white border border-[var(--color-cyber-border)] hover:border-[var(--color-cyber-border-hover)] px-7 py-2.5 transition-all duration-200">
                                    Back
                                </button>
                                <button type="submit" className="bg-[var(--color-cyber-yellow)] hover:bg-[var(--color-cyber-yellow-hover)] text-black font-semibold px-8 py-2.5 text-sm tracking-wide transition-all duration-200 hover:shadow-[0_0_20px_rgba(230,194,0,0.3)]">
                                    Submit
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ═══ STEP 4: Success ═══ */}
                    {step === 4 && (
                        <div className="sch-pop text-center">
                            <div className="w-20 h-20 rounded-full border-2 border-green-500/50 flex items-center justify-center mx-auto mb-8">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-[var(--font-poppins)] font-semibold text-white mb-4">Application Submitted</h2>
                            <p className="text-[var(--color-cyber-text-secondary)] text-lg leading-relaxed mb-10">
                                Thank you, <span className="text-[var(--color-cyber-yellow)] font-semibold">{formData.name || "Applicant"}</span>.<br />
                                Your scholarship application has been received.
                            </p>
                            <a href="/" className="inline-block bg-[var(--color-cyber-yellow)] hover:bg-[var(--color-cyber-yellow-hover)] text-black font-semibold px-8 py-3 text-sm tracking-wide transition-all duration-200 hover:shadow-[0_0_20px_rgba(230,194,0,0.3)]">
                                Back to Home
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
