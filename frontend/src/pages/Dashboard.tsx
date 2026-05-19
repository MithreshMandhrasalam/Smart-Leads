import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LeadModal } from '../components/LeadModal';
import {
  LogOut,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Filter,
  Eye,
  Loader2,
  Calendar,
} from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: 'Website' | 'Instagram' | 'Referral';
  createdAt: string;
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Debouncing Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms debounce limit
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Dark Mode Toggle Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/leads', {
        params: {
          page,
          limit: 10,
          status: statusFilter || undefined,
          source: sourceFilter || undefined,
          search: debouncedSearch || undefined,
          sort: sortOrder,
        },
      });
      setLeads(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setTotalLeads(response.data.meta.total);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sourceFilter, debouncedSearch, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle lead creation or updating
  const handleModalSubmit = async (leadData: any) => {
    setModalLoading(true);
    try {
      if (selectedLead) {
        // Edit lead
        await api.put(`/leads/${selectedLead._id}`, leadData);
      } else {
        // Create lead
        await api.post('/leads', leadData);
      }
      setIsModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error submitting lead form:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/leads/export', {
        params: {
          status: statusFilter || undefined,
          source: sourceFilter || undefined,
          search: debouncedSearch || undefined,
          sort: sortOrder,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smart_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Contacted':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Qualified':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Lost':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Smart Leads</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lead management dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>

          {/* User profile dropdown info */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 hover:text-rose-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Metric widgets / Cards summary */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{totalLeads}</h3>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">New Leads</p>
            <h3 className="text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">
              {leads.filter(l => l.status === 'New').length}
            </h3>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qualified</p>
            <h3 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
              {leads.filter(l => l.status === 'Qualified').length}
            </h3>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conversion Rate</p>
            <h3 className="text-3xl font-bold mt-1 text-purple-600 dark:text-purple-400">
              {totalLeads > 0 ? `${Math.round((leads.filter(l => l.status === 'Qualified').length / leads.length) * 100)}%` : '0%'}
            </h3>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name or email..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Lead
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 dark:bg-slate-900"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-2">
              <select
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 dark:bg-slate-900"
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
              <select
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 dark:bg-slate-900"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </section>

        {/* Data Table */}
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold text-slate-400">No leads found</p>
              <p className="text-sm text-slate-500 mt-1">Try relaxing your search query or filter values.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Lead Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">{lead.name}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{lead.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{lead.source}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button
                          onClick={() => setViewLead(lead)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors"
                          title="Edit Lead"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user?.role === 'Admin' && (
                          <button
                            onClick={() => handleDeleteLead(lead._id)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && leads.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing Page {page} of {totalPages} ({totalLeads} total records)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* View Lead Details Modal */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-4">Lead Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Name</p>
                <p className="text-base font-semibold text-slate-950 dark:text-white mt-0.5">{viewLead.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Email</p>
                <p className="text-sm font-medium mt-0.5">{viewLead.email}</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Status</p>
                  <span className={`inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(viewLead.status)}`}>
                    {viewLead.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Source</p>
                  <p className="text-sm font-semibold mt-1">{viewLead.source}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Created Date
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(viewLead.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewLead(null)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSubmit={handleModalSubmit}
        lead={selectedLead}
        loading={modalLoading}
      />
    </div>
  );
};
