
import React, { useState } from 'react';
import { askComplexQuestion } from '../services/gemini';

export const ComplexQuery: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');
        try {
            const result = await askComplexQuestion(query);
            setResponse(result);
        } catch (err) {
            setError('Failed to get a response. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4 text-slate-700">Thinking Mode</h2>
            <p className="text-sm text-slate-500 mb-4">
                For complex questions or trend analysis. The assistant will use advanced reasoning to provide a detailed, anonymized response.
            </p>
            <form onSubmit={handleSubmit} className="mb-4">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your complex, anonymized query here..."
                    className="w-full p-3 border border-slate-300 rounded-lg resize-y focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    rows={4}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:bg-slate-400 transition-colors"
                >
                    {isLoading ? (
                         <>
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Thinking...
                         </>
                    ) : "Submit Query"}
                </button>
            </form>
            
            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
            
            <div className="flex-grow bg-slate-50 rounded-lg p-4 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800">
                    {response || "The response will appear here."}
                </pre>
            </div>
        </div>
    );
};
