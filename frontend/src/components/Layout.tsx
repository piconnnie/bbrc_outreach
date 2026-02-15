import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Authors } from './Authors';
import { Logs } from './Logs';
import { Outreach } from './Outreach';
import { ConfigurationForm } from './ConfigurationForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Menu, Bell, Search } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#fafafb] font-sans text-slate-900">
            <div className="relative z-10 flex h-full">
                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} />
                </div>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 w-full bg-secondary-50">
                    {/* Header */}
                    <header className="h-16 flex items-center justify-between px-6 lg:px-8 bg-white border-b border-secondary-200 sticky top-0 z-30 shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-2 -ml-2 rounded-lg hover:bg-secondary-200 text-slate-500 lg:hidden"
                            >
                                <Menu size={20} />
                            </button>

                            {/* Search bar simulation */}
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-md w-64 text-slate-500 text-sm focus-within:ring-2 focus-within:ring-primary-100 transition-all">
                                <Search size={14} />
                                <span className="opacity-50 text-xs">Ctrl+K to search...</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-md bg-secondary-50 text-slate-500 hover:text-primary-500 hover:bg-primary-50 transition-colors relative">
                                <Bell size={18} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
                            </button>
                            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-secondary-200">
                                <div className="text-right hidden md:block">
                                    <p className="text-xs font-bold text-slate-700">v1.2.0</p>
                                    <p className="text-[10px] text-success font-medium">Stable</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                        <div className="w-full h-full max-w-[1600px] mx-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    {activeTab === 'dashboard' && children}
                                    {activeTab === 'authors' && <Authors />}
                                    {activeTab === 'outreach' && <Outreach />}
                                    {activeTab === 'logs' && <Logs />}
                                    {activeTab === 'settings' && <ConfigurationForm />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>

            <Toaster position="bottom-right" toastOptions={{
                className: 'text-sm font-medium text-slate-700',
                style: {
                    background: '#fff',
                    color: '#334155',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e2e8f0'
                },
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: 'white',
                    },
                },
            }} />
        </div>
    );
};
