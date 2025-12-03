import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Code, Server, Play, RotateCcw, Activity,
    ArrowRight, Pause, ChevronDown, ChevronUp, Zap, Network,
    ArrowRightLeft, BookOpen, TrendingUp
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// --- Types & Constants ---
const SAMPLE_DATA = [1001, 1001, 1002, 1003, 1003, 1003, 1004, 1005, 1005];
const ANIMATION_SPEED = 1400; // ms per step

// --- Helper Components ---
const PanelHeader = ({ title, icon, sub, color }: any) => (
    <div className={`absolute top-0 left-0 px-4 py-2 rounded-br-xl border-r border-b ${color} text-xs font-mono font-bold flex items-center gap-2 z-10 bg-slate-900/90 backdrop-blur-sm`}>
        {icon}
        <span className="uppercase tracking-wider">{title}</span>
        <span className="text-slate-500 font-normal normal-case border-l border-slate-700 pl-2 ml-2">{sub}</span>
    </div>
);

const CodeBlock = ({ children, highlight = false }: any) => (
    <div className={`bg-slate-950 p-4 rounded-lg border font-mono text-xs md:text-sm transition-all ${highlight ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-slate-800'
        }`}>
        {children}
    </div>
);

export const TwoPointersModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
    // Global State
    const [inputStr, setInputStr] = useState(SAMPLE_DATA.join(", "));
    const [data, setData] = useState<number[]>(SAMPLE_DATA);
    const [isPlaying, setIsPlaying] = useState(false);
    const [pythonComplete, setPythonComplete] = useState(false);

    // Two Pointers State
    const [readPointer, setReadPointer] = useState(1);
    const [writePointer, setWritePointer] = useState(1);
    const [processedArray, setProcessedArray] = useState<number[]>([]);

    // Snowflake State
    const [snowflakeTriggered, setSnowflakeTriggered] = useState(false);
    const [sortPhase, setSortPhase] = useState<'idle' | 'sorting' | 'processing' | 'complete'>('idle');
    const [lagComparison, setLagComparison] = useState<number | null>(null);

    // UI State
    const [showTheoryDeck, setShowTheoryDeck] = useState(true);
    const [nValue, setNValue] = useState(1000);
    const [showSpaceComplexity, setShowSpaceComplexity] = useState(false);
    const [executionLog, setExecutionLog] = useState<string[]>([]);

    // Handlers
    const handleParse = () => {
        try {
            const arr = inputStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            if (arr.length === 0) {
                alert("Please enter valid numbers");
                return;
            }
            const sorted = [...arr].sort((a, b) => a - b);
            setData(sorted);
            reset();
        } catch (e) {
            alert("Invalid format. Use: 1001, 1001, 1002");
        }
    };

    const reset = () => {
        setPythonComplete(false);
        setIsPlaying(false);
        setReadPointer(1);
        setWritePointer(1);
        setProcessedArray([]);
        setSnowflakeTriggered(false);
        setSortPhase('idle');
        setLagComparison(null);
        setExecutionLog([]);
    };

    const runSnowflakeQuery = () => {
        setSnowflakeTriggered(true);
        setSortPhase('sorting');

        setTimeout(() => {
            setSortPhase('processing');

            let currentRow = 0;
            const lagInterval = setInterval(() => {
                if (currentRow >= data.length) {
                    clearInterval(lagInterval);
                    setSortPhase('complete');
                    return;
                }
                setLagComparison(currentRow);
                currentRow++;
            }, 800);
        }, 1500);
    };

    // Python Animation Loop
    useEffect(() => {
        let interval: any;
        if (isPlaying && !pythonComplete) {
            interval = setInterval(() => {
                setReadPointer(prev => {
                    if (prev >= data.length) {
                        setIsPlaying(false);
                        setPythonComplete(true);
                        setExecutionLog(log => [...log, `✓ Deduplication complete. New length: ${writePointer}`]);
                        return prev;
                    }

                    const currentVal = data[prev];
                    const lastUniqueVal = processedArray[writePointer - 1];

                    if (currentVal !== lastUniqueVal) {
                        // Found a new unique value
                        setProcessedArray(arr => {
                            const newArr = [...arr];
                            newArr[writePointer] = currentVal;
                            return newArr;
                        });
                        setWritePointer(w => w + 1);
                        setExecutionLog(log => [
                            ...log,
                            `Read[${prev}]=${currentVal} ≠ Write[${writePointer - 1}]=${lastUniqueVal} → Copy to Write[${writePointer}]`
                        ].slice(-4));
                    } else {
                        setExecutionLog(log => [
                            ...log,
                            `Read[${prev}]=${currentVal} = Write[${writePointer - 1}]=${lastUniqueVal} → Skip (duplicate)`
                        ].slice(-4));
                    }

                    return prev + 1;
                });
            }, ANIMATION_SPEED);
        }
        return () => clearInterval(interval);
    }, [isPlaying, pythonComplete, data, writePointer, processedArray]);

    // Initialize processed array
    useEffect(() => {
        if (data.length > 0) {
            setProcessedArray([data[0], ...Array(data.length - 1).fill(0)]);
        }
    }, [data]);

    // Auto-trigger Snowflake when Python completes
    useEffect(() => {
        if (pythonComplete && !snowflakeTriggered) {
            setTimeout(() => runSnowflakeQuery(), 800);
        }
    }, [pythonComplete, snowflakeTriggered]);

    // Generate Chart Data
    const chartData = useMemo(() => {
        const points = [];
        const stepSize = nValue / 20;
        for (let i = 1; i <= 20; i++) {
            const n = Math.floor(i * stepSize);
            points.push({
                n,
                twopointers: n,
                bruteforce: Math.floor((n * n) / 1000),
                spaceTwoPointers: 1,
                spaceBruteForce: n,
            });
        }
        return points;
    }, [nValue]);

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto">

            {/* Top Controls */}
            <div className="p-6 border-b border-slate-800 bg-slate-950 sticky top-0 z-20 shadow-xl shadow-black/20">
                <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={onBackToDashboard}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all self-start shadow-sm"
                    >
                        <ArrowRight size={16} className="rotate-180" />
                        <span className="text-sm">Back to Dashboard</span>
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                                Log Stream Deduplication (In-Place)
                                {pythonComplete && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-sm bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1 rounded-full font-mono"
                                    >
                                        UNIQUE COUNT: {writePointer}
                                    </motion.span>
                                )}
                            </h1>
                            <p className="text-sm text-slate-400 font-mono">Scenario: Remove duplicate timestamps from sorted logs to save storage</p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <input
                                className="bg-transparent border-none text-white font-mono text-sm focus:ring-0 w-64"
                                value={inputStr}
                                onChange={(e) => setInputStr(e.target.value)}
                                placeholder="1001, 1002, 1003..."
                            />
                            <button
                                onClick={handleParse}
                                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-slate-300 transition-all"
                            >
                                Set Data
                            </button>
                            <div className="h-6 w-px bg-slate-700 mx-2"></div>
                            <button
                                onClick={() => isPlaying ? setIsPlaying(false) : setIsPlaying(true)}
                                disabled={pythonComplete}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isPlaying
                                    ? 'bg-yellow-600 hover:bg-yellow-500'
                                    : pythonComplete
                                        ? 'bg-slate-700'
                                        : 'bg-green-600 hover:bg-green-500'
                                    }`}
                            >
                                {isPlaying ? <><Pause size={14} /> PAUSE</> : <><Play size={14} /> RUN PYTHON</>}
                            </button>
                            <button onClick={reset} className="p-2 hover:bg-slate-800 rounded text-slate-400 transition-colors">
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 w-full space-y-6">

                {/* Theory Deck (Collapsible) */}
                <motion.div
                    className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl overflow-hidden"
                    initial={false}
                >
                    <button
                        onClick={() => setShowTheoryDeck(!showTheoryDeck)}
                        className="w-full flex items-center justify-between p-6 hover:bg-purple-900/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={24} className="text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Theory Deck: Two Pointers Pattern</h3>
                        </div>
                        {showTheoryDeck ? <ChevronUp className="text-purple-400" /> : <ChevronDown className="text-purple-400" />}
                    </button>

                    <AnimatePresence>
                        {showTheoryDeck && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0 space-y-6">

                                    {/* Top Row: Concept, Big O Lesson, Visual */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                        {/* Concept */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
                                                <Code size={16} />
                                                The Concept
                                            </h4>
                                            <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                                Use <strong className="text-purple-400">two pointers</strong> moving at different speeds:
                                                <code className="bg-slate-800 px-2 py-0.5 rounded text-green-400 ml-1">Read</code> (fast) scans ahead,
                                                <code className="bg-slate-800 px-2 py-0.5 rounded text-blue-400 ml-1">Write</code> (slow) tracks the position for unique values.
                                            </p>
                                            <div className="text-xs text-slate-500 bg-slate-800/50 p-2 rounded font-mono">
                                                if arr[read] != arr[write-1]:<br />
                                                &nbsp;&nbsp;arr[write] = arr[read]<br />
                                                &nbsp;&nbsp;write += 1
                                            </div>
                                        </div>

                                        {/* Big O Lesson */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-orange-300 mb-3 flex items-center gap-2">
                                                <TrendingUp size={16} />
                                                The Big O Lesson
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <div className="text-green-400 font-bold">Two Pointers: O(N)</div>
                                                    <div className="text-xs text-slate-400">Single pass—each element touched once</div>
                                                </div>
                                                <div>
                                                    <div className="text-red-400 font-bold">Brute Force: O(N²)</div>
                                                    <div className="text-xs text-slate-400">Nested loops comparing each pair</div>
                                                </div>
                                                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2">
                                                    <div className="text-purple-300 font-bold mb-1">Space: O(1)</div>
                                                    <div className="text-xs text-slate-400">In-place modification—no extra array!</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visual Aid */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
                                                <ArrowRightLeft size={16} />
                                                Visual Concept
                                            </h4>
                                            <div className="relative h-16 flex items-center justify-center bg-slate-950 rounded border border-slate-800 mb-3">
                                                {/* Looping animation of two arrows */}
                                                <motion.div
                                                    className="absolute left-2"
                                                    animate={{ x: [0, 120, 120, 0], opacity: [1, 1, 0, 0, 1] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    <ArrowRight size={20} className="text-green-400" />
                                                </motion.div>
                                                <motion.div
                                                    className="absolute left-2"
                                                    animate={{ x: [0, 60, 60, 0], opacity: [1, 1, 0, 0, 1] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                                                >
                                                    <ArrowRight size={20} className="text-blue-400" />
                                                </motion.div>
                                                <div className="text-xs text-slate-600 absolute right-2">Converging pointers</div>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Fast pointer explores, slow pointer builds the result.
                                            </p>
                                        </div>

                                    </div>

                                    {/* Interview Trap Warning Box */}
                                    <div className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="text-yellow-400 text-2xl">⚠️</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-yellow-300 mb-2">Interview Trap: Sorted Array Required!</div>
                                                <p className="text-sm text-slate-300 leading-relaxed">
                                                    The Two Pointers technique for deduplication <strong className="text-yellow-300">only works on SORTED arrays</strong>.
                                                    If the input isn't sorted, you must sort it first (O(N log N)) or use a different approach like a hash set.
                                                    Don't assume the array is sorted—always ask the interviewer!
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DE Insight: Sort-Merge Join */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                            <Database size={14} />
                                            DE Insight: Sort-Merge Join in Distributed Systems
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                            In <strong className="text-blue-300">Snowflake</strong> and <strong className="text-blue-300">Spark</strong>,
                                            the Two Pointers pattern appears in <strong className="text-purple-300">Sort-Merge Joins</strong>. Both tables are sorted by join key,
                                            then pointers scan through each table in parallel, merging matching rows.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                            <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                                                <div className="font-bold text-green-400 mb-1">✅ Efficient When:</div>
                                                <div className="text-slate-400">
                                                    • Data already sorted<br />
                                                    • Streaming sequential reads<br />
                                                    • Low memory pressure
                                                </div>
                                            </div>
                                            <div className="bg-orange-900/20 border border-orange-500/30 rounded p-2">
                                                <div className="font-bold text-orange-400 mb-1">⚠️ Expensive When:</div>
                                                <div className="text-slate-400">
                                                    • Unsorted data (must sort)<br />
                                                    • Network shuffle required<br />
                                                    • Hash join would be faster
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            <strong className="text-blue-300">Window functions</strong> like <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">LAG()</code> also
                                            use this pattern internally—they compare each row with neighbors after sorting, which is why they're efficient for sequential operations.
                                        </p>
                                    </div>

                                    {/* Big O Comparison Chart */}
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                                        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                            <TrendingUp size={18} />
                                            Time Complexity: Two Pointers vs Nested Loops
                                        </h4>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                            {/* Chart Controls */}
                                            <div className="space-y-4">
                                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                                    <label className="text-xs text-slate-500 font-bold uppercase mb-3 block">
                                                        Array Size (N): {nValue.toLocaleString()} items
                                                    </label>
                                                    <input
                                                        type="range" min="100" max="5000" step="100"
                                                        value={nValue} onChange={(e) => setNValue(parseInt(e.target.value))}
                                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                                        <span className="flex items-center gap-2 text-sm">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                                                            <span className="text-slate-300">Two Pointers</span>
                                                        </span>
                                                        <span className="font-mono font-bold text-green-400">O(N)</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                                        <span className="flex items-center gap-2 text-sm">
                                                            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                                                            <span className="text-slate-300">Nested Loops</span>
                                                        </span>
                                                        <span className="font-mono font-bold text-red-400">O(N²)</span>
                                                    </div>
                                                </div>

                                                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                                                    <div className="text-xs font-bold text-purple-400 mb-1">💡 Key Insight</div>
                                                    <p className="text-xs text-slate-400 leading-relaxed">
                                                        At N={nValue.toLocaleString()}: Two Pointers does <strong className="text-green-300">{nValue.toLocaleString()} operations</strong>.
                                                        Nested loops does <strong className="text-red-300">{(nValue * nValue / 1000).toLocaleString()}K operations</strong>!
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Chart */}
                                            <div className="lg:col-span-2 h-64 bg-slate-950 rounded-lg border border-slate-800 p-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={useMemo(() => {
                                                        const points = [];
                                                        const stepSize = nValue / 20;
                                                        for (let i = 1; i <= 20; i++) {
                                                            const n = Math.floor(i * stepSize);
                                                            points.push({
                                                                n,
                                                                twoPointers: n,
                                                                nestedLoops: Math.floor((n * n) / 1000), // Scaled for visibility
                                                            });
                                                        }
                                                        return points;
                                                    }, [nValue])} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                                        <defs>
                                                            <linearGradient id="colorTwoPointers" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorNestedLoops" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                        <XAxis
                                                            dataKey="n"
                                                            stroke="#475569"
                                                            fontSize={11}
                                                            label={{ value: 'Input Size (N)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                                                        />
                                                        <YAxis
                                                            stroke="#475569"
                                                            fontSize={11}
                                                            label={{
                                                                value: 'Operations',
                                                                angle: -90,
                                                                position: 'insideLeft',
                                                                fill: '#64748b'
                                                            }}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: '#0f172a',
                                                                borderColor: '#334155',
                                                                borderRadius: '8px',
                                                                fontSize: '12px'
                                                            }}
                                                            labelStyle={{ color: '#cbd5e1' }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="twoPointers"
                                                            stroke="#22c55e"
                                                            strokeWidth={3}
                                                            fill="url(#colorTwoPointers)"
                                                            name="O(N) - Two Pointers"
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="nestedLoops"
                                                            stroke="#ef4444"
                                                            strokeWidth={3}
                                                            fill="url(#colorNestedLoops)"
                                                            name="O(N²) - Nested Loops"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Dual Engine Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

                    {/* LEFT: Python / Two Pointers */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Python Engine"
                            icon={<Code size={14} />}
                            sub="Two Pointers (In-Place)"
                            color="bg-green-500/10 text-green-400 border-green-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* The Array with Two Pointers */}
                            <div className="relative pt-8">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                    <ArrowRight size={12} /> Read (Fast) & Write (Slow) Pointers
                                </div>
                                <div className="flex justify-center gap-2 flex-wrap">
                                    {data.map((val, idx) => (
                                        <div key={idx} className="relative">
                                            <motion.div
                                                animate={{
                                                    scale: idx === readPointer && isPlaying ? 1.15 : 1,
                                                    backgroundColor:
                                                        idx < writePointer ? 'rgba(34, 197, 94, 0.2)' :
                                                            idx === readPointer ? 'rgba(34, 197, 94, 0.4)' :
                                                                'rgba(30, 41, 59, 1)',
                                                    borderColor:
                                                        idx === readPointer ? '#22c55e' :
                                                            idx === writePointer ? '#3b82f6' :
                                                                '#334155'
                                                }}
                                                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 text-sm font-mono font-bold transition-all
                          ${idx < writePointer ? 'text-green-300' : 'text-slate-400'}
                        `}
                                            >
                                                {processedArray[idx] || val}
                                            </motion.div>

                                            {/* Read Pointer */}
                                            {idx === readPointer && isPlaying && (
                                                <motion.div
                                                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 flex flex-col items-center"
                                                    initial={{ y: -10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                >
                                                    <span className="text-[10px] font-mono font-bold bg-green-900/50 px-2 py-0.5 rounded">Read={idx}</span>
                                                    <div className="w-0.5 h-3 bg-green-500 mt-1"></div>
                                                </motion.div>
                                            )}

                                            {/* Write Pointer */}
                                            {idx === writePointer && isPlaying && (
                                                <motion.div
                                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-blue-400 flex flex-col-reverse items-center"
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                >
                                                    <span className="text-[10px] font-mono font-bold bg-blue-900/50 px-2 py-0.5 rounded">Write={idx}</span>
                                                    <div className="w-0.5 h-3 bg-blue-500 mb-1"></div>
                                                </motion.div>
                                            )}

                                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 font-mono">
                                                [{idx}]
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Logic Trace */}
                            <CodeBlock highlight={isPlaying}>
                                <div className="space-y-1">
                                    <div className="text-slate-500 text-[10px]"># Remove duplicates in-place</div>
                                    <div className={`transition-all ${isPlaying ? 'text-green-400 font-bold' : 'text-slate-600'
                                        }`}>
                                        if arr[read] != arr[write-1]:
                                    </div>
                                    <div className={`pl-4 transition-all ${isPlaying ? 'text-green-300' : 'text-slate-600'
                                        }`}>
                                        arr[write] = arr[read]
                                    </div>
                                    <div className={`pl-4 transition-all ${isPlaying ? 'text-green-300' : 'text-slate-600'
                                        }`}>
                                        write += 1
                                    </div>
                                    <div className="text-slate-600 mt-2">read += 1</div>
                                </div>
                            </CodeBlock>

                            {/* Execution Log */}
                            <div className="bg-slate-950 rounded-lg border border-green-500/30 p-3 min-h-[100px] max-h-[100px] overflow-y-auto">
                                <div className="text-[10px] uppercase text-green-500 font-bold mb-2 flex items-center gap-2">
                                    <Activity size={10} /> Live Execution Log
                                </div>
                                <div className="space-y-1 font-mono text-xs">
                                    {executionLog.length === 0 ? (
                                        <div className="text-slate-600 italic">Waiting for execution...</div>
                                    ) : (
                                        executionLog.map((log, idx) => (
                                            <motion.div
                                                key={`${log}-${idx}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`${log.includes('Skip') ? 'text-yellow-400' :
                                                    log.includes('Copy') ? 'text-green-400' :
                                                        log.includes('complete') ? 'text-blue-400' :
                                                            'text-slate-400'
                                                    }`}
                                            >
                                                {log}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* RIGHT: Snowflake / LAG Window Function */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Snowflake Engine"
                            icon={<Server size={14} />}
                            sub="LAG() Window Function"
                            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Sort Phase Indicator */}
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Network size={16} className="text-blue-400" />
                                        <span className="text-sm font-bold text-blue-300">Query Phase</span>
                                    </div>
                                    <div className="text-sm font-mono font-bold text-blue-400">
                                        {sortPhase === 'idle' && 'IDLE'}
                                        {sortPhase === 'sorting' && 'SORTING...'}
                                        {sortPhase === 'processing' && 'PROCESSING LAG()'}
                                        {sortPhase === 'complete' && 'COMPLETE'}
                                    </div>
                                </div>
                                {sortPhase !== 'idle' && (
                                    <div className="mt-2 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            initial={{ width: '0%' }}
                                            animate={{
                                                width: sortPhase === 'sorting' ? '30%' :
                                                    sortPhase === 'processing' ? '80%' : '100%'
                                            }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* LAG Visualization - Table View with Shuffle Animation */}
                            <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 p-4 overflow-hidden">
                                {/* Sorting Phase: Show Shuffling Blocks */}
                                {sortPhase === 'sorting' && (
                                    <div className="h-full flex flex-col items-center justify-center gap-4">
                                        <div className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                                            <Network size={16} className="animate-pulse" />
                                            ORDER BY timestamp (Network Shuffle)
                                        </div>
                                        <div className="flex gap-2 flex-wrap justify-center">
                                            {[...data].map((val, idx) => (
                                                <motion.div
                                                    key={`shuffle-${idx}`}
                                                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
                                                    animate={{
                                                        x: [0, Math.random() * 40 - 20, 0],
                                                        y: [0, Math.random() * 40 - 20, 0],
                                                        rotate: [0, Math.random() * 20 - 10, 0],
                                                        scale: [1, 1.1, 1]
                                                    }}
                                                    transition={{
                                                        duration: 0.8,
                                                        repeat: Infinity,
                                                        delay: idx * 0.1
                                                    }}
                                                >
                                                    {val}
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-slate-400 text-center max-w-md">
                                            💰 <strong className="text-yellow-400">Expensive Operation:</strong> Data is being redistributed across compute nodes based on hash(timestamp). This network shuffle is the hidden cost of distributed sorting.
                                        </div>
                                    </div>
                                )}

                                {/* Processing/Complete: Show Sorted Table */}
                                {(sortPhase === 'processing' || sortPhase === 'complete') && (
                                    <div className="h-full overflow-auto">
                                        <table className="w-full text-xs font-mono">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-800">
                                                    <th className="p-2 text-left">ROW</th>
                                                    <th className="p-2 text-left">timestamp</th>
                                                    <th className="p-2 text-left">LAG(timestamp)</th>
                                                    <th className="p-2 text-left">is_duplicate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.map((val, idx) => (
                                                    <motion.tr
                                                        key={idx}
                                                        className={`border-b border-slate-800/50 transition-all ${lagComparison === idx ? 'bg-blue-500/20' :
                                                            lagComparison !== null && lagComparison > idx ? 'bg-green-900/10' :
                                                                ''
                                                            }`}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{
                                                            opacity: sortPhase === 'processing' && lagComparison !== null && lagComparison >= idx ? 1 : 0.3,
                                                            x: 0
                                                        }}
                                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                    >
                                                        <td className="p-2 text-slate-500">{idx + 1}</td>
                                                        <td className="p-2 text-white font-bold">{val}</td>
                                                        <td className="p-2 text-slate-400">
                                                            {idx === 0 ? 'NULL' : data[idx - 1]}
                                                        </td>
                                                        <td className="p-2">
                                                            {sortPhase === 'processing' && lagComparison !== null && lagComparison >= idx ? (
                                                                idx === 0 ? (
                                                                    <span className="text-green-400">FALSE</span>
                                                                ) : val === data[idx - 1] ? (
                                                                    <span className="text-red-400 font-bold">TRUE</span>
                                                                ) : (
                                                                    <span className="text-green-400">FALSE</span>
                                                                )
                                                            ) : (
                                                                <span className="text-slate-600">—</span>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Idle State */}
                                {sortPhase === 'idle' && (
                                    <div className="h-full flex items-center justify-center text-sm text-slate-600">
                                        Click "Run Snowflake Query" to see ORDER BY + LAG() in action
                                    </div>
                                )}
                            </div>

                            {/* SQL Query */}
                            <CodeBlock>
                                <pre className="text-blue-300 text-xs">
                                    {`-- Use LAG to find duplicates
SELECT 
  timestamp,
  LAG(timestamp) OVER (ORDER BY timestamp) as prev,
  CASE 
    WHEN timestamp = LAG(timestamp) OVER (ORDER BY timestamp)
    THEN TRUE 
    ELSE FALSE 
  END as is_duplicate
FROM log_stream
WHERE is_duplicate = FALSE;`}
                                </pre>
                            </CodeBlock>

                        </div>
                    </div>
                </div>

                {/* Bottom: SQL Query Display */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Database size={18} /> Snowflake Query Execution
                        </h3>
                        <button
                            onClick={runSnowflakeQuery}
                            disabled={sortPhase !== 'idle' || !pythonComplete}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-bold text-sm transition-all"
                        >
                            <Play size={14} /> Run Snowflake Query
                        </button>
                    </div>
                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-xs text-blue-400 font-bold mb-2">💡 Behind the Scenes</div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Snowflake first performs a <strong className="text-blue-300">SORT</strong> operation (expensive network shuffle),
                            then uses <code className="bg-slate-800 px-1.5 py-0.5 rounded">LAG()</code> window function to compare each row with its predecessor.
                            This is functionally equivalent to Two Pointers but operates in a distributed environment.
                        </p>
                    </div>
                </div>

                {/* Bottom: Complexity Analysis */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
                    <div className="flex flex-col lg:flex-row gap-8">

                        <div className="w-full lg:w-1/3 space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">
                                        {showSpaceComplexity ? 'Space' : 'Time'} Complexity
                                    </h3>
                                    <button
                                        onClick={() => setShowSpaceComplexity(!showSpaceComplexity)}
                                        className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded font-bold text-white transition-all flex items-center gap-2"
                                    >
                                        <Database size={12} />
                                        {showSpaceComplexity ? 'Show Time' : 'Show Space'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                <label className="text-xs text-slate-500 font-bold uppercase mb-3 block">
                                    Dataset Size (N): {nValue.toLocaleString()} items
                                </label>
                                <input
                                    type="range" min="100" max="10000" step="100"
                                    value={nValue} onChange={(e) => setNValue(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                            </div>

                            <div className="space-y-3">
                                {!showSpaceComplexity ? (
                                    <>
                                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                            <span className="flex items-center gap-2 text-sm">
                                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                                                <span className="text-slate-300">Two Pointers</span>
                                            </span>
                                            <span className="font-mono font-bold text-green-400">O(N)</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                            <span className="flex items-center gap-2 text-sm">
                                                <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                                                <span className="text-slate-300">Brute Force</span>
                                            </span>
                                            <span className="font-mono font-bold text-red-400">O(N²)</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                            <span className="flex items-center gap-2 text-sm">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
                                                <span className="text-slate-300">Two Pointers (In-Place)</span>
                                            </span>
                                            <span className="font-mono font-bold text-purple-400">O(1)</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                            <span className="flex items-center gap-2 text-sm">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
                                                <span className="text-slate-300">Brute Force (Extra Array)</span>
                                            </span>
                                            <span className="font-mono font-bold text-orange-400">O(N)</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                                <div className="text-xs font-bold text-green-400 mb-1">💡 Key Insight</div>
                                {!showSpaceComplexity ? (
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        At N=10,000: Two Pointers does <strong className="text-green-300">10K operations</strong>.
                                        Brute Force does <strong className="text-red-300">100M operations</strong>. That's 10,000x faster!
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Two Pointers modifies <strong className="text-purple-300">in-place</strong>, using only O(1) extra space.
                                        This is critical for large datasets that barely fit in memory.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 h-80 bg-slate-950 rounded-lg border border-slate-800 p-4 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorTwoPointers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBrute" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSpaceTwoPointers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSpaceBruteForce" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="n"
                                        stroke="#475569"
                                        fontSize={11}
                                        label={{ value: 'Input Size (N)', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        fontSize={11}
                                        label={{
                                            value: showSpaceComplexity ? 'Memory (units)' : 'Operations',
                                            angle: -90,
                                            position: 'insideLeft',
                                            fill: '#64748b'
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#334155',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                    />
                                    {!showSpaceComplexity ? (
                                        <>
                                            <Area
                                                type="monotone"
                                                dataKey="twopointers"
                                                stroke="#22c55e"
                                                strokeWidth={3}
                                                fill="url(#colorTwoPointers)"
                                                name="O(N) - Two Pointers"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="bruteforce"
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                fill="url(#colorBrute)"
                                                name="O(N²) - Brute Force"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Area
                                                type="monotone"
                                                dataKey="spaceTwoPointers"
                                                stroke="#a855f7"
                                                strokeWidth={3}
                                                fill="url(#colorSpaceTwoPointers)"
                                                name="Two Pointers (In-Place) - O(1)"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="spaceBruteForce"
                                                stroke="#f59e0b"
                                                strokeWidth={3}
                                                fill="url(#colorSpaceBruteForce)"
                                                name="Brute Force (Extra Array) - O(N)"
                                            />
                                        </>
                                    )}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Theory Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-green-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Zap size={16} className="text-green-400 mt-0.5" />
                            <strong className="text-slate-200">Why In-Place Matters</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Modifying the array in-place uses <span className="text-green-400 font-semibold">O(1) extra space</span>.
                            For a 1TB dataset, creating a copy would require another 1TB of memory/disk—often impossible or extremely expensive.
                        </p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-blue-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Network size={16} className="text-blue-400 mt-0.5" />
                            <strong className="text-slate-200">Distributed Equivalent</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            In Snowflake, <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[10px]">LAG()</code> requires
                            sorting data first (network shuffle). Then each worker compares rows locally—functionally the same as Two Pointers.
                        </p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-purple-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Activity size={16} className="text-purple-400 mt-0.5" />
                            <strong className="text-slate-200">Interview Trap</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Many candidates forget the <strong className="text-purple-300">"sorted" precondition</strong>.
                            Two Pointers only works on sorted arrays! If unsorted, you must sort first (O(N log N)) or use hashing.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
