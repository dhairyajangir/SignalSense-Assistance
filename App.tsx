
import React, { useState, useCallback } from 'react';
import { Conversation } from './components/Conversation';
import { Transcription } from './components/Transcription';
import { ComplexQuery } from './components/ComplexQuery';
import { Resources } from './components/Resources';
import type { Tab } from './types';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';

// Inject Vercel Speed Insights and Analytics
injectSpeedInsights();
inject();

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('conversation');

    const TabButton = useCallback(<T extends Tab,>(
        // FIX: Changed JSX.Element to React.ReactElement to resolve namespace error.
        { tab, label, icon }: { tab: T; label: string; icon: React.ReactElement }
    ) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-sky-600'
            }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    ), [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'conversation':
                return <Conversation />;
            case 'transcribe':
                return <Transcription />;
            case 'query':
                return <ComplexQuery />;
            case 'resources':
                return <Resources />;
            default:
                return <Conversation />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <header className="bg-white shadow-sm p-4 border-b border-slate-200">
                <div className="max-w-7xl mx-auto flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">SignalSense Assistant</h1>
                        <p className="text-sm text-slate-500">Your guide for implementing the Signal Band system.</p>
                    </div>
                    <div className="ml-4 flex items-center">
                        <a
                            href="https://github.com/dhairyajangir/SignalSense-Assistance/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View project on GitHub"
                            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.867 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.238-.009-.868-.014-1.704-2.782.604-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.003.07 1.53 1.031 1.53 1.031.892 1.529 2.341 1.087 2.91.832.091-.647.35-1.087.637-1.337-2.22-.252-4.555-1.11-4.555-4.945 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.648 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.852.004 1.71.115 2.512.338 1.909-1.295 2.748-1.025 2.748-1.025.547 1.379.203 2.396.1 2.649.64.698 1.03 1.591 1.03 2.682 0 3.846-2.338 4.69-4.566 4.936.36.31.682.924.682 1.863 0 1.344-.012 2.429-.012 2.76 0 .268.18.58.688.482C19.135 20.165 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline text-sm">GitHub</span>
                        </a>
                    </div>
                </div>
            </header>
            <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-64">
                    <nav className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-col gap-2">
                         <TabButton tab="conversation" label="Conversation" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>} />
                         <TabButton tab="transcribe" label="Transcribe" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 4a.5.5 0 00-1 0v6a4.5 4.5 0 009 0V4a.5.5 0 00-1 0v6a3.5 3.5 0 01-7 0V4z" /></svg>} />
                         <TabButton tab="query" label="Thinking Mode" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>} />
                         <TabButton tab="resources" label="Resources" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0014.5 16c-1.255 0-2.443-.29-3.5-.804V4.804A7.968 7.968 0 0114.5 4z" /></svg>} />
                    </nav>
                </aside>
                <div className="flex-grow bg-white rounded-xl shadow-lg p-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;
