import { useEffect, useState, useRef } from 'react';
import { Terminal, RefreshCw, Pause, Play, Download } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export const Logs = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        try {
            const data = await api.getLogs();
            setLogs(data.logs);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const handleCopyLogs = () => {
        navigator.clipboard.writeText(logs.join('\n'));
        toast.success("Logs copied to clipboard");
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Terminal className="text-emerald-600" />
                        System Logs
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Real-time execution logs from the agent backend.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                            autoScroll ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        )}
                    >
                        {autoScroll ? <Pause size={14} /> : <Play size={14} />}
                        {autoScroll ? 'Auto-scroll On' : 'Auto-scroll Off'}
                    </button>
                    <button
                        onClick={handleCopyLogs}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Download size={14} />
                        Copy
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-white border border-slate-200 rounded-lg"
                        title="Refresh Logs"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl shadow-inner border border-slate-800 p-4 overflow-hidden flex flex-col font-mono text-xs md:text-sm relative group">
                <div className="absolute top-2 right-4 text-xs text-slate-600 font-mono bg-slate-800/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    tail -f bbrc_agent.log
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {logs.length === 0 ? (
                        <div className="text-slate-500 italic p-4 text-center">Waiting for log stream...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="text-slate-300 break-words border-b border-slate-800/50 pb-0.5 last:border-0 hover:bg-slate-800/30 transition-colors px-1 rounded">
                                <span className="text-slate-600 inline-block w-8 mr-2 select-none text-right">{index + 1}</span>
                                <span className={cn(
                                    log.includes('ERROR') ? 'text-red-400' :
                                        log.includes('WARNING') ? 'text-amber-400' :
                                            log.includes('SUCCESS') ? 'text-emerald-400' :
                                                'text-slate-300'
                                )}>{log}</span>
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};
