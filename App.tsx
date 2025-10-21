
import React, { useState, useCallback } from 'react';
import { Conversation } from './components/Conversation';
import { Transcription } from './components/Transcription';
import { ComplexQuery } from './components/ComplexQuery';
import { Resources } from './components/Resources';
import type { Tab } from './types';

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
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800">SignalSense Assistant</h1>
                    <p className="text-sm text-slate-500">Your guide for implementing the Signal Band system.</p>
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
