'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedApps, setSelectedApps] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0, priority: 0, pending: 0, shortlisted: 0, selected: 0, rejected: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchApplications();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.exportDropdown')) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');

      if (response.status === 401) {
        router.push('/hot_admin');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setApplications(data.applications || []);
        setStats({
          total: data.total || 0,
          pending: data.applications?.filter(app => app.status === 'pending').length || 0,
          shortlisted: data.applications?.filter(app => app.status === 'shortlisted').length || 0,
          selected: data.applications?.filter(app => app.status === 'selected').length || 0,
          rejected: data.applications?.filter(app => app.status === 'rejected').length || 0,
          approved: data.applications?.filter(app => app.status === 'approved').length || 0,
        });
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setApplications(prev => prev.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
        if (selectedApp && selectedApp._id === applicationId) {
          setSelectedApp(prev => ({ ...prev, status: newStatus }));
        }
        fetchApplications();
      } else {
        setError('Failed to update application status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    try {
      const response = await fetch(`/api/applications/${applicationId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchApplications();
        if (selectedApp?._id === applicationId) setSelectedApp(null);
      } else {
        setError('Failed to delete application');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (error) { }
    localStorage.removeItem('auth-token');
    router.push('/hot_admin');
    router.refresh();
  };

  const handleSelectApp = (applicationId) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApps(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApps.size === filteredApplications.length && filteredApplications.length > 0) {
      setSelectedApps(new Set());
    } else {
      setSelectedApps(new Set(filteredApplications.map(app => app._id)));
    }
  };

  useEffect(() => {
    setSelectedApps(new Set());
  }, [searchTerm, statusFilter, experienceFilter]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === '' ||
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.whatsappNumber && app.whatsappNumber.includes(searchTerm)) ||
        (app.organizationName && app.organizationName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchesExperience = experienceFilter === 'All' || app.skillLevel === experienceFilter; // Changed from metadata
      return matchesSearch && matchesStatus && matchesExperience;
    });
  }, [applications, searchTerm, statusFilter, experienceFilter]);

  const exportToCSV = (onlySelected = false) => {
    const appsToExport = onlySelected
      ? filteredApplications.filter(app => selectedApps.has(app._id))
      : filteredApplications;

    if (appsToExport.length === 0) return;

    // Updated Headers and Fields matching new schema
    const headers = ['Name', 'Email', 'Phone', 'Status Description', 'Organization', 'Status', 'Interested Domains'];
    const csvData = appsToExport.map(app => [
      app.fullName,
      app.email,
      app.whatsappNumber || '',
      app.statusDescription || 'N/A',
      app.organizationName || 'N/A',
      app.status,
      (app.domainInterests || []).join(', ')
    ]);
    const csvContent = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'shortlisted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'selected': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'approved': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-[#9A9A9A]"><span className="text-xl animate-pulse">⚡ Loading...</span></div>;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#F2F2F2] font-sans selection:bg-[#E6C200] selection:text-black">
      <header className="sticky top-0 z-30 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6C200] rounded-md h-8 w-8 flex items-center justify-center text-black font-bold text-xs">CX</div>
            <h1 className="text-lg font-semibold tracking-tight text-[#F2F2F2]">CyberX <span className="text-[#9A9A9A] font-normal">Admin</span></h1>
          </div>
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <input type="text" placeholder="Search applications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg py-2 px-4 text-sm text-[#F2F2F2] placeholder-[#555] focus:outline-none focus:border-[#E6C200]/50 transition-colors" />
          </div>
          <button onClick={handleLogout} className="text-sm text-[#9A9A9A] hover:text-[#F2F2F2] transition-colors cursor-pointer">Sign out</button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#F2F2F2]">Applicants Management</h2>
          <p className="text-[#9A9A9A] text-sm mt-1">Screening and managing potential CyberX candidates.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total', value: stats.total, color: 'text-[#F2F2F2]' },
            { label: 'Pending', value: stats.pending, color: 'text-[#E6C200]' },
            { label: 'Shortlisted', value: stats.shortlisted, color: 'text-purple-400' },
            { label: 'Selected', value: stats.selected, color: 'text-green-400' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl p-4">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs font-medium text-[#777] uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {error && <div className="mb-6 bg-red-900/20 border border-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="md:hidden w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg py-2 px-4 text-sm text-[#F2F2F2]" />

          <div className="flex items-center gap-3 ml-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1C1C1C] border border-[#2A2A2A] text-[#9A9A9A] text-sm rounded-lg px-3 py-2 focus:outline-none">
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            {/* Experience filter removed or needs update if skillLevel is not used for primary filtering needed by user? - Keeping it basic */}
            {/* <select value={experienceFilter} ... > optional if needed based on skillLevel </select> */}

            <div className="relative exportDropdown">
              <button onClick={() => setShowExportDropdown(!showExportDropdown)} className="bg-[#E6C200] text-black text-sm font-medium px-4 py-2 rounded-lg">Export</button>
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#202020] border border-[#2A2A2A] rounded-lg shadow-xl z-20 py-1">
                  <button onClick={() => exportToCSV(false)} className="block w-full text-left px-4 py-2 text-xs text-[#F2F2F2] hover:bg-[#2A2A2A]">Export All (CSV)</button>
                  <button onClick={() => exportToCSV(true)} disabled={selectedApps.size === 0} className={`block w-full text-left px-4 py-2 text-xs ${selectedApps.size > 0 ? 'text-[#F2F2F2] hover:bg-[#2A2A2A]' : 'text-[#666] cursor-not-allowed'}`}>Export Selected (CSV)</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="py-20 text-center text-[#666] border border-dashed border-[#2A2A2A] rounded-xl">No applications found.</div>
        ) : (
          <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#151515] border-b border-[#2A2A2A] text-[#666] text-xs uppercase font-semibold tracking-wider">
                    <th className="py-4 px-6 w-12">
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer accent-[#E6C200]"
                        checked={filteredApplications.length > 0 && selectedApps.size === filteredApplications.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-4 px-6 w-1/5">Applicant</th>
                    <th className="py-4 px-6 w-1/5">Organization / Status</th>
                    <th className="py-4 px-6">Interested Domains</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Applied Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {filteredApplications.map((app) => (
                    <tr key={app._id} className={`hover:bg-white/[0.02] transition-colors ${selectedApps.has(app._id) ? 'bg-[#E6C200]/5' : ''}`}>
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          className="rounded cursor-pointer accent-[#E6C200]"
                          checked={selectedApps.has(app._id)}
                          onChange={() => handleSelectApp(app._id)}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[#F2F2F2] font-medium text-sm">{app.fullName}</div>
                        <div className="text-[#666] text-xs mt-0.5">{app.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[#F2F2F2] font-medium text-sm">{app.organizationName || 'N/A'}</div>
                        <div className="text-[#666] text-xs mt-0.5">{app.statusDescription}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {(app.domainInterests || []).slice(0, 3).map((d, i) => (
                            <span key={i} className="text-[10px] bg-[#2A2A2A] text-[#ccc] px-1.5 py-0.5 rounded">{d}</span>
                          ))}
                          {(app.domainInterests?.length || 0) > 3 && <span className="text-[10px] text-[#555]">+{app.domainInterests.length - 3}</span>}
                          {(app.domainInterests?.length === 0) && <span className="text-[10px] text-[#444]">-</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(app.status)} capitalize`}>{app.status}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[#666] text-xs">{formatDate(app.submittedAt || app.createdAt)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedApp(app)} className="bg-[#E6C200]/10 hover:bg-[#E6C200]/20 text-[#E6C200] border border-[#E6C200]/50 px-2.5 py-1.5 rounded text-xs font-medium transition-colors">
                            View
                          </button>
                          <button onClick={() => handleDeleteApplication(app._id)} className="text-[#9A9A9A] hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {selectedApp && (
        <ApplicationDetailsModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateStatus={updateApplicationStatus}
        />
      )}
    </div>
  );
}

function ApplicationDetailsModal({ app, onClose, onUpdateStatus }) {
  const [status, setStatus] = useState(app.status);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    await onUpdateStatus(app._id, status);
    setSaving(false);
    onClose();
  };

  // Safe accessor updated for flat schema
  const val = (key) => app[key] !== undefined && app[key] !== null && app[key] !== '' ? app[key] : 'Not Provided';
  const valArr = (key) => (Array.isArray(app[key]) && app[key].length > 0) ? app[key] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#151515] border border-[#2A2A2A] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] bg-[#1C1C1C]">
          <div><h2 className="text-xl font-bold text-[#F2F2F2]">{app.fullName}</h2><p className="text-sm text-[#9A9A9A]">Application Details</p></div>
          <button onClick={onClose} className="text-[#666] hover:text-[#F2F2F2] text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          <section>
            <h3 className="text-sm font-bold text-[#E6C200] uppercase tracking-wider mb-3">1. Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <InfoItem label="Full Name" value={app.fullName} />
              <InfoItem label="Email" value={app.email} />
              <InfoItem label="Mobile / WhatsApp" value={app.whatsappNumber} />
              <InfoItem label="LinkedIn Profile" value={val('linkedinProfile')} />
              <InfoItem label="Current Status" value={val('statusDescription')} highlight />
              <InfoItem label="Organization / College" value={val('organizationName')} />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#E6C200] uppercase tracking-wider mb-2">2. Interested Domains</h3>
            {/* Show Level for each domain if available */}
            <div className="flex flex-col gap-2">
              {valArr('domainInterests').length ? valArr('domainInterests').map((d, i) => {
                const level = app.domainLevels && app.domainLevels[d] ? app.domainLevels[d] : 'N/A';
                return (
                  <div key={i} className="flex justify-between items-center bg-[#1C1C1C] p-2 rounded border border-[#333]">
                    <span className="text-[#ccc] text-sm">{d}</span>
                    <span className="text-xs text-[#E6C200] font-mono border border-[#E6C200]/30 px-2 rounded">{level}</span>
                  </div>
                );
              }) : <span className="text-[#666] italic">None Selected</span>}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#E6C200] uppercase tracking-wider mb-3">3. Practical Exposure</h3>
            <div className="bg-[#1C1C1C] p-4 rounded-lg space-y-3 text-sm border border-[#2A2A2A]">
              <div><span className="text-[#555] text-xs uppercase block mb-1">Learning Platforms Used</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {valArr('platformsUsed').map((p, i) => <span key={i} className="text-xs bg-[#333] px-2 py-1 rounded">{p}</span>)}
                  {valArr('platformsUsed').length === 0 && <span className="text-[#666] italic">None</span>}
                </div>
              </div>
              <div><span className="text-[#555] text-xs uppercase block mb-1">Platform Profile Link (THM/HTB)</span>
                <div className="text-blue-400 break-all">{val('platformProfileLink')}</div>
              </div>
              <div><span className="text-[#555] text-xs uppercase block mb-1">Certifications</span> <span className="text-[#ccc] whitespace-pre-wrap">{val('certificationDetails')}</span></div>
              <div><span className="text-[#555] text-xs uppercase block mb-1">CTF Participation</span> <span className="text-[#ccc]">{val('ctfParticipation')}</span></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#E6C200] uppercase tracking-wider mb-3">4. Motivation</h3>
            <div className="bg-[#1C1C1C] p-4 rounded-lg border border-[#2A2A2A] text-sm text-[#ccc] leading-relaxed italic">
              "{val('whyJoinCyberX')}"
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#E6C200] uppercase tracking-wider mb-3">5. Declaration</h3>
            <div className="text-sm text-[#ccc]">
              <span className="text-[#555] uppercase font-semibold mr-2">Accepted:</span>
              {app.declarationAccepted ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-[#E6C200] uppercase tracking-wider mb-3">6. Resume</h3>
            {app.resumePath ? (
              <a href={app.resumePath} target="_blank" className="inline-flex items-center gap-2 bg-[#E6C200] hover:bg-[#CCAD00] text-black px-4 py-2 rounded font-medium transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                View Resume PDF
              </a>
            ) : (
              <span className="text-[#666] italic">No resume uploaded.</span>
            )}
          </section>
        </div>
        <div className="p-6 border-t border-[#2A2A2A] bg-[#1C1C1C] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm text-[#9A9A9A]">Application Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="bg-[#151515] border border-[#333] text-[#F2F2F2] rounded px-3 py-2 text-sm focus:border-[#E6C200] outline-none">
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[#9A9A9A] hover:text-[#F2F2F2]">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#E6C200] hover:bg-[#CCAD00] text-black rounded font-medium text-sm disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, highlight }) {
  return (
    <div className="break-words">
      <span className="block text-[#555] text-xs uppercase font-semibold mb-1">{label}</span>
      <span className={`block ${highlight ? 'text-[#E6C200] font-medium' : 'text-[#ccc]'}`}>{value}</span>
    </div>
  );
}
