<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Insights Analyzer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white">
    <div id="root"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <script type="text/babel">
        const { useState } = React;

        function App() {
            const [mode, setMode] = useState('search');
            const [links, setLinks] = useState(['', '', '', '', '']);
            const [topic, setTopic] = useState('');
            const [count, setCount] = useState(2);
            const [results, setResults] = useState('');
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState('');

            const analyzeLinks = async () => {
                const valid = links.filter(l => l.trim());
                if (valid.length === 0) {
                    setError('Enter at least one link');
                    return;
                }

                setError('');
                setResults('');
                setLoading(true);

                try {
                    const transcripts = valid.map((l, i) => 
                        `VIDEO ${i+1}: ${l}\n\nDemo transcript for video analysis...`
                    ).join('\n\n---\n\n');

                    const prompt = valid.length === 1
                        ? `Analyze this YouTube video:\n\n## Key Insights\n## Actionable Takeaways\n## Best Quotes\n\n${transcripts}`
                        : `Compare these ${valid.length} YouTube videos:\n\n## Consensus Views\n## Unique Perspectives\n## Comparative Analysis\n## Best Practices\n\n${transcripts}`;

                    const response = await fetch('/.netlify/functions/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [{ role: 'user', content: prompt }]
                        })
                    });

                    const data = await response.json();
                    setResults(data.content[0]?.text || 'Error analyzing videos');
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            const searchAndAnalyze = async () => {
                if (!topic.trim()) {
                    setError('Enter a topic');
                    return;
                }

                setError('');
                setResults('');
                setLoading(true);

                try {
                    const mockData = {
                        'trading psychology': [
                            { title: 'Mark Douglas - Psychology Mastery', content: 'Accept uncertainty, probability mindset...' },
                            { title: 'Daily Trading Routine', content: 'Morning journal, meditation, risk management...' },
                            { title: 'FOMO & Revenge Trading', content: 'Break emotional cycles, position sizing...' }
                        ],
                        'avaloq migration': [
                            { title: 'Avaloq Best Practices', content: 'Data mapping foundation, timeline 18-24 months...' },
                            { title: 'RBC Case Study', content: 'Legacy consolidation, regulatory compliance...' },
                            { title: 'Avaloq vs FNZ', content: 'Platform comparison, cost analysis...' }
                        ]
                    };

                    const videos = (mockData[topic.toLowerCase()] || [
                        { title: `${topic} - Video 1`, content: 'Key insights...' },
                        { title: `${topic} - Video 2`, content: 'Expert analysis...' }
                    ]).slice(0, count);

                    const transcripts = videos.map((v, i) => 
                        `VIDEO ${i+1}: "${v.title}"\n\n${v.content}`
                    ).join('\n\n---\n\n');

                    const prompt = count === 1
                        ? `Analyze this video on "${topic}":\n\n## Key Insights\n## Actionable Takeaways\n\n${transcripts}`
                        : `Compare ${count} videos on "${topic}":\n\n## Consensus Views\n## Unique Perspectives\n## Best Practices\n\n${transcripts}`;

                    const response = await fetch('/.netlify/functions/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [{ role: 'user', content: prompt }]
                        })
                    });

                    const data = await response.json();
                    setResults(data.content[0]?.text || 'Error analyzing videos');
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className="min-h-screen p-8">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            YouTube Insights Analyzer
                        </h1>
                        <p className="text-center text-gray-300 mb-8">Compare videos or search by topic</p>

                        <div className="flex gap-4 mb-8">
                            <button onClick={() => setMode('links')}
                                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition ${
                                    mode === 'links' 
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-105' 
                                    : 'bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40'
                                }`}>
                                <div className="text-3xl mb-2">🔗</div>
                                <div>Paste YouTube Links</div>
                                <div className="text-xs text-gray-400 mt-1">1-5 links</div>
                            </button>
                            <button onClick={() => setMode('search')}
                                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition ${
                                    mode === 'search' 
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-105' 
                                    : 'bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40'
                                }`}>
                                <div className="text-3xl mb-2">🔍</div>
                                <div>Search by Topic</div>
                                <div className="text-xs text-gray-400 mt-1">1-3 videos</div>
                            </button>
                        </div>

                        {mode === 'links' && (
                            <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-purple-500/20">
                                <h2 className="text-xl font-bold text-purple-300 mb-4">Paste YouTube Links (1-5)</h2>
                                {links.map((l, i) => (
                                    <div key={i} className="flex gap-3 mb-3">
                                        <span className="text-purple-400 w-8">{i+1}.</span>
                                        <input type="text" value={l} 
                                            onChange={e => setLinks(links.map((link, idx) => idx === i ? e.target.value : link))}
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="flex-1 px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500" />
                                    </div>
                                ))}
                                <button onClick={analyzeLinks} disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 py-4 rounded-lg font-semibold mt-4">
                                    {loading ? 'Analyzing...' : 'Analyze Videos'}
                                </button>
                            </div>
                        )}

                        {mode === 'search' && (
                            <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-purple-500/20">
                                <h2 className="text-xl font-bold text-purple-300 mb-4">Search YouTube by Topic</h2>
                                <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g., 'trading psychology', 'Avaloq migration'"
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 mb-4" />
                                <div className="mb-4">
                                    <label className="block text-sm mb-2 text-purple-300">Number of videos</label>
                                    <div className="flex gap-3">
                                        {[1,2,3].map(n => (
                                            <button key={n} onClick={() => setCount(n)}
                                                className={`flex-1 py-3 rounded-lg font-semibold ${
                                                    count === n ? 'bg-purple-600' : 'bg-slate-700/50 hover:bg-slate-700'
                                                }`}>
                                                {n} video{n > 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                    <p className="text-xs text-gray-300">💡 Try: "trading psychology" or "Avaloq migration"</p>
                                </div>
                                <button onClick={searchAndAnalyze} disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 py-4 rounded-lg font-semibold">
                                    {loading ? 'Analyzing...' : `Find & Analyze ${count} Video${count > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        )}

                        {loading && (
                            <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 text-center border border-purple-500/20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                <p className="text-purple-300">Analyzing with Claude AI...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900/30 rounded-2xl p-6 mb-8 border border-red-500/30">
                                <h3 className="font-semibold text-red-300 mb-2">Error</h3>
                                <p className="text-red-200">{error}</p>
                            </div>
                        )}

                        {results && (
                            <div className="bg-slate-800/50 rounded-2xl p-8 border border-purple-500/20">
                                <div className="flex justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-purple-300">📊 Results</h2>
                                    <button onClick={() => navigator.clipboard.writeText(results)}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">
                                        Copy
                                    </button>
                                </div>
                                <pre className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">{results}</pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
</body>
</html>
