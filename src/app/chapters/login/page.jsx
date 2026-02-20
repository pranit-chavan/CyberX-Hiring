"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ChapterLogin() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('auth-token', data.token);
                localStorage.setItem('chapter-user', JSON.stringify(data.admin));

                setTimeout(() => {
                    if (data.admin.role === 'super_admin') {
                        router.push('/chapters/admin');
                    } else {
                        router.push('/chapters/dashboard');
                    }
                }, 100);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 font-[var(--font-inter)]">

            {/* Logo */}
            <div className="mb-8 relative w-64 h-24 md:w-96 md:h-32">
                <a href="/chapters">
                    <Image src="/assets/logo.png" alt="CyberX Logo" fill className="object-contain" priority />
                </a>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md pro-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-yellow to-transparent opacity-50"></div>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-poppins font-semibold text-white mb-2 tracking-tight">
                        Chapter Login
                    </h2>
                    <p className="text-sm text-cyber-text-secondary">
                        Access your chapter dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-cyber-text-secondary block">Username</label>
                        <input
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                            required
                            className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-3 text-white placeholder-cyber-text-muted/60 focus:outline-none input-pro transition-all duration-200 text-sm"
                            placeholder="Enter username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-cyber-text-secondary block">Password</label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                            required
                            className="w-full bg-cyber-card border border-cyber-border rounded-lg px-4 py-3 text-white placeholder-cyber-text-muted/60 focus:outline-none input-pro transition-all duration-200 text-sm"
                            placeholder="Enter password"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cyber-yellow hover:bg-cyber-yellow-hover text-black font-semibold rounded-lg py-3 px-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-cyber-border pt-6">
                    <p className="text-xs text-cyber-text-muted">
                        No signup available. Contact your admin for access.
                    </p>
                </div>
            </div>
        </div>
    );
}
