import { useEffect, useState } from 'react';
import { Download, RefreshCw, Database, Search, ChevronLeft, ChevronRight, Mail, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import toast from 'react-hot-toast';


export const Authors = () => {
    const [authors, setAuthors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadAuthors = async () => {
        setLoading(true);
        try {
            const data = await api.getAuthors();
            setAuthors(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load authors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuthors();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        const toastId = toast.loading("Syncing database...");
        try {
            const res = await api.syncAuthors();
            if (res.status === 'synced') {
                await loadAuthors();
                toast.success(`Synced ${res.added} new authors`, { id: toastId });
            } else {
                toast.error(res.message || "Sync failed", { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error during sync", { id: toastId });
        } finally {
            setSyncing(false);
        }
    };

    const handleExport = () => {
        window.location.href = 'http://localhost:5000/api/authors/export';
        toast.success("Export started");
    };

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter and Sort
    const filteredAuthors = authors.filter(author =>
        author.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.journal?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedAuthors = [...filteredAuthors].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) {
            return direction === 'asc' ? -1 : 1;
        }
        if (a[key] > b[key]) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const totalPages = Math.ceil(sortedAuthors.length / itemsPerPage);
    const currentAuthors = sortedAuthors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Database className="text-emerald-600" />
                        Author Database
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Manage and view discovered researchers.</p>
                </div>

                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCw size={18} className={syncing ? "animate-spin text-emerald-600" : ""} />
                        {syncing ? 'Syncing...' : 'Sync Data'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/10"
                    >
                        <Download size={18} />
                        Export CSV
                    </motion.button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, email, or journal..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    {filteredAuthors.length} found
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th
                                    className="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        Researcher
                                        {sortConfig?.key === 'name' && (
                                            <span className="text-xs text-emerald-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Contact</th>
                                <th
                                    className="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('journal')}
                                >
                                    <div className="flex items-center gap-2">
                                        Publication
                                        {sortConfig?.key === 'journal' && (
                                            <span className="text-xs text-emerald-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 font-semibold text-slate-700 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => handleSort('paper_id')}
                                >
                                    <div className="flex items-center justify-end gap-2">
                                        Paper ID
                                        {sortConfig?.key === 'paper_id' && (
                                            <span className="text-xs text-emerald-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                                            <p>Loading records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAuthors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        No authors found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                currentAuthors.map((author, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={author.id || i}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{author.name}</p>
                                                    <p className="text-xs text-slate-400 truncate max-w-[200px]">
                                                        {JSON.parse(author.affiliations || '[]')[0] || 'Unknown Affiliation'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md text-xs font-medium">
                                                <Mail size={12} />
                                                {author.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="truncate max-w-[250px] font-medium text-slate-700">{author.journal}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[250px] pl-6">{author.paper_title}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                                            PMID: {author.paper_id}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAuthors.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAuthors.length)}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredAuthors.length)}</span> of <span className="font-medium text-slate-900">{filteredAuthors.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-medium text-slate-600 px-2">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
