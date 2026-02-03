'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TrackApplication() {
    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/applications/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: search.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data.application);
            } else {
                setError(data.error || 'Failed to fetch status');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'shortlisted': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'selected': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'approved': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0E0E0E] font-inter text-[#F2F2F2]">

            {/* Brand Logo */}
            <div className="mb-8 relative w-64 h-24 md:w-80 md:h-28">
                <Image
                    src="/assets/logo.png"
                    alt="CyberX Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="w-full max-w-md bg-[#1E1E1E] rounded-[14px] shadow-2xl p-8 border border-white/5 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6C200]/5 blur-[60px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Track Application</h2>
                    <p className="text-sm text-[#A0A0A0]">Enter your registered Email or WhatsApp number</p>
                </div>

                <form onSubmit={handleTrack} className="space-y-4 relative z-10">
                    <div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="e.g. name@example.com or +919000..."
                            className="w-full bg-[#181818] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#E6C200] transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !search.trim()}
                        className="w-full bg-[#E6C200] hover:bg-[#d4b200] text-black font-semibold rounded-lg py-3 px-4 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Checking...' : 'Check Status'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center animate-fadeIn">
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-8 p-5 bg-[#151515] border border-[#333] rounded-xl animate-fadeIn">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-white font-medium text-lg">{result.fullName}</h3>
                                    <p className="text-xs text-[#777] mt-0.5">{result.organizationName}</p>
                                </div>
                                <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border ${getStatusColor(result.status)}`}>
                                    {result.status}
                                </div>
                            </div>

                            <div className="h-px bg-[#333] w-full my-1"></div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[#666] uppercase font-semibold">Submitted On</span>
                                <span className="text-[#ccc]">{formatDate(result.submittedAt)}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-[#666] uppercase font-semibold">Last Updated</span>
                                <span className="text-[#ccc]">{formatDate(result.lastUpdated)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center border-t border-white/5 pt-6 relative z-10">
                    <Link href="/" className="text-sm text-[#777] hover:text-[#E6C200] transition-colors flex items-center justify-center gap-2 group">
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
