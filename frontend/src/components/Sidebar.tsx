import { LayoutDashboard, Users, Mail, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Users, label: 'Authors', id: 'authors' },
    { icon: Mail, label: 'Outreach', id: 'outreach' },
    { icon: Activity, label: 'Logs', id: 'logs' },
    { icon: Settings, label: 'Settings', id: 'settings' },
];

interface SidebarProps {
    activeTab: string;
    setActiveTab: (id: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="h-full w-72 flex flex-col bg-white border-r border-dashed border-gray-200 relative z-20"
        >
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 px-2 mb-6">
                    {/* Logo */}
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        B
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">BBRC <span className="font-normal text-slate-400">Agent</span></span>
                </div>
            </div>

            <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar py-4">
                <div className="text-xs font-bold text-slate-400 px-4 py-2 uppercase tracking-wider mb-2">Menu</div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <div key={item.id} className="relative">
                            {isActive && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-500 rounded-l-full" />
                            )}
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg text-sm transition-all duration-200",
                                    isActive
                                        ? "bg-primary-50 text-primary-500 font-medium"
                                        : "text-slate-600 hover:text-primary-500 hover:bg-slate-50"
                                )}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2 : 2} />
                                <span>{item.label}</span>
                            </button>
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-dashed border-gray-200">
                <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3 border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">Admin User</p>
                        <p className="text-xs text-slate-400">admin@bbrc.com</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
