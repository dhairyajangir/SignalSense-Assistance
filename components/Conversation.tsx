import React, { useEffect, useRef, memo } from 'react';
import { useLiveSession } from '../hooks/useLiveSession';
import { exportChatToPdf } from '../utils/exportPdf';
import type { TranscriptEntry } from '../types';

const TranscriptBubble = memo(({ entry }: { entry: TranscriptEntry }) => {
    const isUser = entry.speaker === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md rounded-2xl px-4 py-2 ${isUser ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                <p className="text-sm">{entry.text}</p>
            </div>
        </div>
    );
});

export const Conversation: React.FC = () => {
    const { isConnecting, isConnected, transcript, error, startSession, endSession, isMuted, toggleMute } = useLiveSession();
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Live Conversation</h2>
            <p className="text-sm text-slate-500 mb-4">
                Have a real-time conversation with the SignalSense Assistant. Press 'Start' and begin speaking.
            </p>
            <div className="flex justify-end mb-2">
                {transcript.length > 0 && (
                    <button
                        onClick={() => exportChatToPdf(transcript, 'signalsense_chat')}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                        aria-label="Export chat as PDF"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Export
                    </button>
                )}
            </div>
            <div className="flex-grow bg-slate-50 rounded-lg p-4 mb-4 overflow-y-auto min-h-[200px] flex flex-col gap-4">
                {transcript.length === 0 && !isConnected && !isConnecting && (
                    <div className="m-auto text-center text-slate-400">
                        <p>Your conversation will appear here.</p>
                    </div>
                )}
                 {transcript.map(entry => <TranscriptBubble key={entry.id} entry={entry} />)}
                <div ref={transcriptEndRef} />
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex items-center justify-center gap-4">
                {!isConnected ? (
                    <button
                        onClick={startSession}
                        disabled={isConnecting}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold shadow-lg hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isConnecting ? (
                           <>
                           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Connecting...
                           </>
                        ) : "Start Conversation"}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={endSession}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full font-semibold shadow-lg hover:bg-red-600 transition-all duration-200"
                        >
                            Stop Conversation
                        </button>
                        <button
                            onClick={toggleMute}
                            className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold shadow-lg transition-colors duration-200 text-white ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                            aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 18" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </button>
                    </>
                )}
            </div>
             {isConnected && (
                <div className="text-center mt-3 text-sm font-medium">
                    <span className={isMuted ? 'text-yellow-600' : 'text-green-600'}>
                        {isMuted ? 'Microphone is muted' : 'Microphone is active'}
                    </span>
                </div>
            )}
        </div>
    );
};
