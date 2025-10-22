
import React, { useState, useEffect } from 'react';
import { generateSpeech } from '../services/gemini';
import { decode, decodeAudioData } from '../utils/audio';

const resources = [
    {
        title: "5-Minute Breathing Exercise",
        content: "Find a comfortable position. Close your eyes gently. Inhale slowly through your nose for four counts. Hold your breath for four counts. Exhale slowly through your mouth for six counts. Repeat this for five minutes, focusing only on your breath."
    },
    {
        title: "Grounding Technique: 5-4-3-2-1",
        content: "When you feel overwhelmed, try this: Name 5 things you can see around you. Name 4 things you can touch. Name 3 things you can hear. Name 2 things you can smell. Name 1 thing you can taste. This brings you back to the present moment and helps calm your mind."
    },
    {
        title: "Understanding the Signal Band System",
        content: "The Signal Band System uses colored wristbands to communicate emotional state non-verbally. Green means you are open to interaction or feeling stable. Red means you need space, support, or de-escalation. Respect these signals without judgment. They help restore personal agency in crowded, stressful environments."
    },
    {
        title: "De-escalation Tips for Aid Workers",
        content: "When someone shows a red band or signs of distress: Approach calmly and non-threateningly. Speak in a low, steady voice. Offer choices, not demands. Give them physical space. Listen without interrupting. Validate their feelings. Ask how you can help. Remember, your calm presence can help them feel safe."
    },
    {
        title: "Story of Hope: The Little Seed",
        content: "Once, there was a tiny seed that dreamed of becoming a great tree. It faced harsh winds and cold nights, but it held onto its hope. With a little rain and sunshine, it began to sprout. Slowly, day by day, it grew stronger, reaching for the sky. It reminds us that even in difficult times, with patience and hope, we can grow."
    },
    {
        title: "Activity for Children: Cloud Gazing",
        content: "Find a safe spot to lie down and look at the sky. Watch the clouds as they drift by. What shapes do you see? A dragon? A boat? A fluffy sheep? Let your imagination wander. It's a peaceful way to spend time together."
    },
    {
        title: "Progressive Muscle Relaxation",
        content: "Sit or lie down comfortably. Starting with your toes, tense the muscles for five seconds, then release. Move up to your calves, thighs, stomach, hands, arms, shoulders, and face. Notice how your body feels lighter and more relaxed with each release. This helps reduce physical tension from stress."
    },
    {
        title: "Creating a Safe Space for Children",
        content: "Children in crisis need predictability and safety. Establish routines, even simple ones like morning circle time. Create a quiet corner with soft items where they can go when overwhelmed. Use art, play, and storytelling to help them express feelings. Remember, your calm presence is their anchor."
    },
    {
        title: "Self-Care for Caregivers",
        content: "You cannot pour from an empty cup. Take breaks when possible. Connect with other aid workers for support. Practice the breathing exercises you teach others. Acknowledge your own emotions. Seek supervision or debriefing. Remember, caring for yourself is part of caring for others."
    },
    {
        title: "Building Trust in Crisis Settings",
        content: "Trust takes time, especially after trauma. Be consistent in your words and actions. Follow through on promises. Respect boundaries and privacy. Listen more than you speak. Show empathy without pity. Small, reliable gestures build safety. Trust is the foundation of all healing."
    },
    {
        title: "Simple Mindfulness for Stressful Moments",
        content: "Pause. Take three slow breaths. Notice your feet on the ground. Feel the air on your skin. Observe one thing you can see right now without judgment. This brief reset can help you respond rather than react in difficult moments."
    },
    {
        title: "Activity: Gratitude Circle",
        content: "Gather in a circle. Each person shares one small thing they are grateful for today. It could be a kind word, a meal, the sun, a friend. This simple practice shifts focus to positive moments and builds community connection, even in hardship."
    }
];

export const Resources: React.FC = () => {
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [playingTitle, setPlayingTitle] = useState<string | null>(null);
    const [loadingTitle, setLoadingTitle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const currentSource = React.useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        // FIX: Cast window to `any` to access legacy `webkitAudioContext` for broader browser compatibility.
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        setAudioContext(ctx);
        return () => {
            ctx.close();
        };
    }, []);

    const playAudio = async (text: string, title: string) => {
        if (!audioContext) return;
        
        if (currentSource.current) {
            currentSource.current.stop();
            currentSource.current = null;
        }

        if (playingTitle === title) {
            setPlayingTitle(null);
            return;
        }

        setError(null);
        setLoadingTitle(title);
        setPlayingTitle(null);

        try {
            const base64Audio = await generateSpeech(text);
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.onended = () => {
                setPlayingTitle(null);
                currentSource.current = null;
            };
            source.start();
            currentSource.current = source;
            setPlayingTitle(title);
        } catch (err) {
            setError("Could not play audio. Please try again.");
            console.error(err);
        } finally {
            setLoadingTitle(null);
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Resource Library</h2>
            <p className="text-sm text-slate-500 mb-4">
                Access guided exercises, stories, and activities. Click the play button to listen.
            </p>
            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
            <div className="space-y-4 overflow-y-auto">
                {resources.map((res) => (
                    <div key={res.title} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start gap-4">
                           <div>
                            <h3 className="font-semibold text-slate-800">{res.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{res.content}</p>
                           </div>
                           <button onClick={() => playAudio(res.content, res.title)} disabled={loadingTitle === res.title} className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-sky-500 text-white rounded-full hover:bg-sky-600 disabled:bg-slate-300 transition-colors">
                            {loadingTitle === res.title ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : playingTitle === res.title ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            )}
                           </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
