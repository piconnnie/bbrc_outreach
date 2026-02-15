import { useEffect, useState } from 'react';
import { Save, Settings, Hash, Clock, Mail, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { api, Config } from '../services/api';
import toast from 'react-hot-toast';

export const ConfigurationForm = () => {
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await api.getConfig();
            setConfig(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        setSaving(true);
        const toastId = toast.loading("Saving changes...");

        try {
            await api.updateConfig(config);
            toast.success("Settings saved successfully", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (section: keyof Config, key: string, value: any) => {
        if (!config) return;
        // Handle array inputs (keywords) by splitting comma-separated strings
        const finalValue = key === 'keywords' && typeof value === 'string'
            ? value.split(',').map(s => s.trim())
            : value;

        setConfig({
            ...config,
            [section]: {
                ...config[section],
                [key]: finalValue
            }
        });
    };

    if (loading) return <div className="text-center p-12 text-slate-400 flex flex-col items-center gap-4"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />Loading settings...</div>;
    if (!config) return <div className="text-center p-12 text-red-500">Error loading configuration.</div>;

    return (
        <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="text-emerald-600" />
                    System Configuration
                </h2>
                <p className="text-slate-500 text-sm mt-1">Adjust agent parameters and operational limits.</p>
            </div>

            {/* Discovery Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Hash size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Discovery Agent</h3>
                        <p className="text-xs text-slate-500">Parameters for PubMed paper profiling</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Search Keywords</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm min-h-[100px]"
                            value={config.discovery?.keywords?.join(', ') || ''}
                            onChange={(e) => updateConfig('discovery', 'keywords', e.target.value)}
                            placeholder="e.g. microbiology, gene editing, crispr"
                        />
                        <p className="text-xs text-slate-400 mt-2">Separate multiple keywords with commas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Lookback Period (Days)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                                value={config.discovery.days_back}
                                onChange={(e) => updateConfig('discovery', 'days_back', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Max Results</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                                value={config.discovery.max_results}
                                onChange={(e) => updateConfig('discovery', 'max_results', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Outreach Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Outreach Agent</h3>
                        <p className="text-xs text-slate-500">Email rate limits and safety settings</p>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <span className="flex items-center gap-2"><Clock size={16} /> Daily Email Limit</span>
                        </label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                            value={config.outreach.max_daily_emails}
                            onChange={(e) => updateConfig('outreach', 'max_daily_emails', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            <span className="flex items-center gap-2"><RotateCw size={16} /> Retry Attempts</span>
                        </label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                            value={config.outreach.retry_attempts}
                            onChange={(e) => updateConfig('outreach', 'retry_attempts', parseInt(e.target.value))}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Subject Line</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm"
                            defaultValue="Invitation to submit research to Bioscience Biotechnology Research Communications (BBRC)"
                        />
                        <p className="text-xs text-slate-400 mt-2">Currently updated directly in email templates (v2 feature).</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 disabled:opacity-50 transition-all"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
            </div>
        </form>
    );
};
