
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { SIGNAL_SENSE_SYSTEM_PROMPT } from '../constants';

if (!import.meta.env.VITE_API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const transcribeAudio = async (base64Audio: string, mimeType: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
                parts: [
                    { text: 'Transcribe this audio recording precisely and clearly.' },
                    { inlineData: { mimeType: mimeType, data: base64Audio } }
                ]
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error during transcription:", error);
        throw new Error("Failed to transcribe audio.");
    }
};

export const generateSpeech = async (textToSpeak: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
};

export const askComplexQuestion = async (query: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: query,
            config: {
                systemInstruction: SIGNAL_SENSE_SYSTEM_PROMPT,
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error with complex query:", error);
        throw new Error("Failed to process complex query.");
    }
};

// FIX: Refactored to accept callbacks for ai.live.connect, following Gemini API guidelines.
export const getLiveSession = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (event: ErrorEvent) => void;
    onclose: (event: CloseEvent) => void;
}) => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: SIGNAL_SENSE_SYSTEM_PROMPT,
        },
    });
};