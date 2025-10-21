
export type Tab = 'conversation' | 'transcribe' | 'query' | 'resources';

export interface TranscriptEntry {
    id: string;
    speaker: 'user' | 'model';
    text: string;
}
