import React from 'react';
import { Users, Mail, Play, Activity, FileText, TrendingUp, MoreHorizontal } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Types ---
interface StatCardProps {
    label: string;
    value: string | number;
    icon: any;
    trend?: string;
    color: 'emerald' | 'blue' | 'violet' | 'orange';
    className?: string;
}

// --- Components ---

const StatCard = ({ label, value, icon: Icon, trend, color, className }: StatCardProps) => {
    // Mantis uses specific shades for these stats, usually a bit more subtle
    const colorStyles = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-primary-50 text-primary-500", // Updated to use Primary token
        violet: "bg-violet-50 text-violet-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <div className={cn(
            "bg-white p-5 rounded-lg border border-secondary-200 shadow-card hover:shadow-lg transition-all duration-300",
            className
        )}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-sm font-medium text-slate-500">{label}</h4>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
                </div>
                <div className={cn("p-2 rounded-md", colorStyles[color])}>
                    <Icon size={20} />
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp size={12} /> {trend}
                    </span>
                    <span className="text-xs text-slate-400">vs last week</span>
                </div>
            )}
        </div>
    );
};

// --- Chart Component ---
const data = [
    { name: 'Mon', papers: 40, emails: 24 },
    { name: 'Tue', papers: 30, emails: 13 },
    { name: 'Wed', papers: 20, emails: 58 },
    { name: 'Thu', papers: 27, emails: 39 },
    { name: 'Fri', papers: 18, emails: 48 },
    { name: 'Sat', papers: 23, emails: 38 },
    { name: 'Sun', papers: 34, emails: 43 },
];

const ActivityChart = () => (
    <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="papers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPapers)" />
                <Area type="monotone" dataKey="emails" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// --- Agent List Item ---
const AgentRow = ({ name, status, onStart, loading }: { name: string, status: string, onStart: () => void, loading: boolean }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-all">
        <div className="flex items-center gap-3">
            <div className={cn("w-2.5 h-2.5 rounded-full ring-2 ring-white", status === 'running' ? "bg-emerald-500 shadow-sm" : "bg-slate-300")} />
            <div>
                <span className="font-semibold text-slate-700 text-sm block">{name}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{status}</span>
            </div>
        </div>
        <button
            onClick={onStart}
            disabled={status === 'running' || loading}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-blue-100 transition-all disabled:opacity-50"
        >
            <Play size={16} fill={status === 'running' ? "currentColor" : "none"} />
        </button>
    </div>
);

// --- Main Dashboard ---

export const Dashboard = () => {
    const [stats, setStats] = React.useState({ papers_found: 0, authors_profiled: 0, emails_sent: 0 });
    const [loading, setLoading] = React.useState(true);
    const [agentStatus, setAgentStatus] = React.useState<Record<string, string>>({});

    const fetchStats = async () => {
        try {
            const data = await api.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleStartAgent = async (name: string, id: string) => {
        setAgentStatus(prev => ({ ...prev, [id]: 'running' }));
        const toastId = toast.loading(`Starting ${name}...`);

        try {
            const res = await api.startAgent(id);
            if (res.status === 'started') {
                toast.success(`${name} started`, { id: toastId });
                setTimeout(() => setAgentStatus(prev => ({ ...prev, [id]: 'idle' })), 5000);
            } else {
                setAgentStatus(prev => ({ ...prev, [id]: 'error' }));
                toast.error(`Failed: ${res.message}`, { id: toastId });
            }
        } catch (error) {
            setAgentStatus(prev => ({ ...prev, [id]: 'error' }));
            toast.error("Network error", { id: toastId });
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6 pb-6 animate-in fade-in zoom-in-95 duration-500">

            {/* Header with Breadcrumb-like feel */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dashboard Sidebar</h2>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, Administrator.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-colors">
                        + New Campaign
                    </button>
                </div>
            </div>

            {/* Mantis Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard
                    label="Total Papers"
                    value={stats.papers_found}
                    icon={FileText}
                    trend="12%"
                    color="blue"
                />

                <StatCard
                    label="Total Authors"
                    value={stats.authors_profiled}
                    icon={Users}
                    trend="5%"
                    color="violet"
                />

                <StatCard
                    label="Emails Sent"
                    value={stats.emails_sent}
                    icon={Mail}
                    color="orange"
                />

                <StatCard
                    label="Engagement Rate"
                    value="24.5%"
                    icon={Activity}
                    trend="2.1%"
                    color="emerald"
                />

                {/* Main Chart Card */}
                <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Outreach Analytics</h3>
                            <p className="text-xs text-slate-400">Papers found vs Emails sent</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                    <div className="h-[300px]">
                        <ActivityChart />
                    </div>
                </div>

                {/* Agents Card */}
                <div className="md:col-span-2 lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Active Agents</h3>
                        <div className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">
                            3 Running
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <AgentRow
                            name="Discovery Agent"
                            status={agentStatus['discovery'] || 'idle'}
                            onStart={() => handleStartAgent('Discovery Agent', 'discovery')}
                            loading={!!agentStatus['discovery'] && agentStatus['discovery'] !== 'idle'}
                        />
                        <AgentRow
                            name="Profiling Agent"
                            status={agentStatus['profiling'] || 'idle'}
                            onStart={() => handleStartAgent('Profiling Agent', 'profiling')}
                            loading={!!agentStatus['profiling'] && agentStatus['profiling'] !== 'idle'}
                        />
                        <AgentRow
                            name="Outreach Agent"
                            status={agentStatus['outreach'] || 'idle'}
                            onStart={() => handleStartAgent('Outreach Agent', 'outreach')}
                            loading={!!agentStatus['outreach'] && agentStatus['outreach'] !== 'idle'}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};
