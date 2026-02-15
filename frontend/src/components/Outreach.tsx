import { useState, useEffect } from 'react';
import { Send, Mail, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export const Outreach = () => {
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [stats, setStats] = useState({ sent: 0, pending: 0, failed: 0 });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const s = await api.getStats();
                setStats({ sent: s.emails_sent, pending: 0, failed: 0 });
            } catch (e) {
                console.error(e);
            }
        };
        loadStats();
    }, []);

    const startOutreach = async () => {
        setStatus('running');
        const toastId = toast.loading("Starting outreach campaign...");

        try {
            const res = await api.startAgent('outreach');
            if (res.status === 'started') {
                setStatus('completed');
                toast.success("Outreach campaign started!", { id: toastId });
                // Refresh stats
                const s = await api.getStats();
                setStats({ ...stats, sent: s.emails_sent });
            } else {
                setStatus('error');
                toast.error(`Failed: ${res.message}`, { id: toastId });
            }
        } catch (err: any) {
            setStatus('error');
            toast.error("Network error", { id: toastId });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Mail className="text-emerald-600" />
                    Email Outreach Campaign
                </h2>
                <p className="text-slate-500 text-sm mt-1">Manage automated email sending to discovered authors.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3 opacity-5">
                        <Send size={100} />
                    </div>
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Send size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Emails Sent</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.sent}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Pending</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.pending}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Bounced / Failed</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.failed}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 md:w-2/3 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Campaign Control</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Start the automated outreach process. The agent will iterate through the validated mailing list and send emails using the configured SMTP server.
                            Uses strict rate limiting to ensure delivery.
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
                        <div className="mt-1">
                            <CheckCircle size={16} className="text-emerald-600" />
                        </div>
                        <div className="text-sm text-slate-600">
                            <p className="font-semibold text-slate-800">Ready to start</p>
                            <p>System checks passed. SMTP server is online. Template is loaded.</p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={startOutreach}
                            disabled={status === 'running'}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all w-full md:w-auto justify-center",
                                status === 'running'
                                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
                            )}
                        >
                            {status === 'running' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Launch Campaign
                                </>
                            )}
                        </motion.button>
                        {status === 'running' && <p className="text-center text-xs text-slate-400 mt-2">This may take a while. You can leave this page.</p>}
                    </div>
                </div>

                <div className="bg-slate-900 md:w-1/3 p-8 text-slate-300 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />

                    <div className="space-y-4 relative z-10">
                        <h4 className="font-bold text-white mb-4">Configuration Summary</h4>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span>Daily Limit</span>
                                <span className="text-white font-mono">50</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span>Delay</span>
                                <span className="text-white font-mono">120s</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span>Subject</span>
                                <span className="text-white font-mono truncate max-w-[150px]">Call for Paper...</span>
                            </div>
                        </div>
                    </div>

                    <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors mt-8 flex items-center gap-2">
                        Edit Configuration <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Start Icon helper
function ArrowUpRight({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
    );
}

