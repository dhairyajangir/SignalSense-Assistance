
import React, { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/gemini';
import { blobToBase64 } from '../utils/audio';
import { exportTranscriptionToPdf } from '../utils/exportPdf';

export const Transcription: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        setError(null);
        setTranscribedText('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = [];
                
                setIsLoading(true);
                try {
                    const base64Audio = await blobToBase64(audioBlob);
                    const text = await transcribeAudio(base64Audio, 'audio/webm');
                    setTranscribedText(text);
                } catch (err) {
                    setError('Failed to transcribe audio. Please try again.');
                } finally {
                    setIsLoading(false);
                }

                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            setError("Could not access microphone. Please check permissions.");
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Transcribe Audio</h2>
            <p className="text-sm text-slate-500 mb-4">
                Record your voice to transcribe notes or log observations. Remember not to include any personally identifiable information.
            </p>
            <div className="flex justify-end mb-2">
                {transcribedText && (
                    <button
                        onClick={() => exportTranscriptionToPdf(transcribedText, 'signalsense_transcription')}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                        aria-label="Export transcription as PDF"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Export
                    </button>
                )}
            </div>
            <div className="flex items-center justify-center gap-4 mb-6">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center justify-center w-20 h-20 rounded-full text-white font-semibold shadow-lg transition-colors duration-200 ${
                        isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'
                    }`}
                >
                    {isRecording ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 4a.5.5 0 00-1 0v6a4.5 4.5 0 009 0V4a.5.5 0 00-1 0v6a3.5 3.5 0 01-7 0V4z" /></svg>
                    )}
                </button>
            </div>
            {isRecording && <p className="text-center text-red-500 font-medium animate-pulse">Recording...</p>}
            
            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
            
            <div className="flex-grow bg-slate-50 rounded-lg p-4 relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                        <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                )}
                <textarea
                    value={transcribedText}
                    readOnly
                    placeholder={!isLoading ? "Your transcribed text will appear here." : "Transcribing audio..."}
                    className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-slate-700"
                />
            </div>
        </div>
    );
};
