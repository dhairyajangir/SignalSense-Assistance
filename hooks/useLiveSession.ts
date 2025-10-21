
import { useState, useRef, useCallback } from 'react';
import { getLiveSession } from '../services/gemini';
import { encode, decode, decodeAudioData } from '../utils/audio';
import type { LiveServerMessage, LiveSession } from "@google/genai";
import type { TranscriptEntry } from '../types';

export const useLiveSession = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionRef = useRef<LiveSession | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const nextStartTimeRef = useRef(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const endSession = useCallback(() => {
        if (!isConnecting && !isConnected) return;
        
        setIsConnecting(false);
        setIsConnected(false);

        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        
        outputSourcesRef.current.clear();
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';
    }, [isConnected, isConnecting]);

    const startSession = useCallback(async () => {
        if (isConnected || isConnecting) return;

        setIsConnecting(true);
        setError(null);
        setTranscript([]);

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            // FIX: Cast window to `any` to access legacy `webkitAudioContext` for broader browser compatibility.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // FIX: Cast window to `any` to access legacy `webkitAudioContext` for broader browser compatibility.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = outputAudioContextRef.current.currentTime;

            const sessionPromise = getLiveSession({
                onopen: () => {
                    setIsConnecting(false);
                    setIsConnected(true);
                    
                    const inputCtx = inputAudioContextRef.current!;
                    sourceNodeRef.current = inputCtx.createMediaStreamSource(streamRef.current!);
                    scriptProcessorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);

                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };

                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    sourceNodeRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputCtx.destination);
                },
                onmessage: async (serverMessage: LiveServerMessage) => {
                    const outputCtx = outputAudioContextRef.current!;

                    const base64Audio = serverMessage.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.addEventListener('ended', () => {
                            outputSourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                    }
                    
                    if (serverMessage.serverContent?.interrupted) {
                        for (const source of outputSourcesRef.current.values()) {
                            source.stop();
                        }
                        outputSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }

                    if (serverMessage.serverContent?.outputTranscription) {
                        currentOutputTranscriptionRef.current += serverMessage.serverContent.outputTranscription.text;
                    } else if (serverMessage.serverContent?.inputTranscription) {
                        currentInputTranscriptionRef.current += serverMessage.serverContent.inputTranscription.text;
                    }

                    if (serverMessage.serverContent?.turnComplete) {
                        const fullInput = currentInputTranscriptionRef.current.trim();
                        const fullOutput = currentOutputTranscriptionRef.current.trim();
                        if (fullInput) {
                            setTranscript(prev => [...prev, { id: `user-${Date.now()}`, speaker: 'user', text: fullInput }]);
                        }
                        if (fullOutput) {
                            setTranscript(prev => [...prev, { id: `model-${Date.now()}`, speaker: 'model', text: fullOutput }]);
                        }
                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                    }
                },
                onerror: (event: ErrorEvent) => {
                    console.error("Live session error:", event);
                    setError("An error occurred with the live session.");
                    endSession();
                },
                onclose: () => {
                    endSession();
                },
            });
            sessionRef.current = await sessionPromise;

        } catch (err) {
            console.error("Failed to start session:", err);
            setError("Could not start session. Please check microphone permissions.");
            setIsConnecting(false);
        }
    }, [isConnected, isConnecting, endSession]);


    return { isConnecting, isConnected, transcript, error, startSession, endSession };
};