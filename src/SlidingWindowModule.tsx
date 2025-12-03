import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Code, Server, Play, RotateCcw, Activity,
    ArrowRight, Pause, ChevronDown, ChevronUp, Zap, Network,
    BookOpen, TrendingUp, Minus, Plus, AlertTriangle
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// --- Types & Constants ---
const SAMPLE_DATA = [40, 30, 60, 70, 50, 80, 90, 40, 50];
const WINDOW_SIZE = 3;
const THRESHOLD = 150; // CPU load threshold
const ANIMATION_SPEED = 1600; // ms per step

// --- Helper Components ---
const PanelHeader = ({ title, icon, sub, color }: any) => (
    <div className={`absolute top-0 left-0 px-4 py-2 rounded-br-xl border-r border-b ${color} text-xs font-mono font-bold flex items-center gap-2 z-10 bg-slate-900/90 backdrop-blur-sm`}>
        {icon}
        <span className="uppercase tracking-wider">{title}</span>
        <span className="text-slate-500 font-normal normal-case border-l border-slate-700 pl-2 ml-2">{sub}</span>
    </div>
);

const CodeBlock = ({ children, highlight = false }: any) => (
    <div className={`bg-slate-950 p-4 rounded-lg border font-mono text-xs md:text-sm transition-all ${highlight ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-800'
        }`}>
        {children}
    </div>
);

export const SlidingWindowModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
    // Global State
    const [inputStr, setInputStr] = useState(SAMPLE_DATA.join(", "));
    const [data, setData] = useState<number[]>(SAMPLE_DATA);
    const [isPlaying, setIsPlaying] = useState(false);
    const [pythonComplete, setPythonComplete] = useState(false);

    // Sliding Window State
    const [windowStart, setWindowStart] = useState(0);
    const [currentSum, setCurrentSum] = useState(0);
    const [alertWindow, setAlertWindow] = useState<number | null>(null);
    const [highlightOperation, setHighlightOperation] = useState<'subtract' | 'add' | null>(null);

    // Snowflake State
    const [snowflakeTriggered, setSnowflakeTriggered] = useState(false);
    const [processingRow, setProcessingRow] = useState<number | null>(null);

    // UI State
    const [showTheoryDeck, setShowTheoryDeck] = useState(true);
    const [nValue, setNValue] = useState(1000);
    const [executionLog, setExecutionLog] = useState<string[]>([]);

    // Handlers
    const handleParse = () => {
        try {
            const arr = inputStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            if (arr.length === 0) {
                alert("Please enter valid numbers");
                return;
            }
            setData(arr);
            reset();
        } catch (e) {
            alert("Invalid format. Use: 40, 30, 60");
        }
    };

    const reset = () => {
        setPythonComplete(false);
        setIsPlaying(false);
        setWindowStart(0);
        setCurrentSum(0);
        setAlertWindow(null);
        setHighlightOperation(null);
        setSnowflakeTriggered(false);
        setProcessingRow(null);
        setExecutionLog([]);
    };

    const runSnowflakeQuery = () => {
        setSnowflakeTriggered(true);

        let currentRow = WINDOW_SIZE - 1;
        const interval = setInterval(() => {
            if (currentRow >= data.length) {
                clearInterval(interval);
                return;
            }
            setProcessingRow(currentRow);
            currentRow++;
        }, 800);
    };

    // Python Animation Loop
    useEffect(() => {
        let interval: any;
        if (isPlaying && !pythonComplete) {
            interval = setInterval(() => {
                setWindowStart(prev => {
                    const windowEnd = prev + WINDOW_SIZE - 1;

                    if (windowEnd >= data.length) {
                        setIsPlaying(false);
                        setPythonComplete(true);
                        setExecutionLog(log => [...log, `✓ Scan complete. Checked ${data.length - WINDOW_SIZE + 1} windows`]);
                        return prev;
                    }

                    // Calculate window sum
                    let sum = 0;
                    if (prev === 0) {
                        // First window: calculate from scratch
                        for (let i = prev; i <= windowEnd; i++) {
                            sum += data[i];
                        }
                        setExecutionLog(log => [
                            ...log,
                            `Window [${prev}-${windowEnd}]: Initial sum = ${sum}`
                        ].slice(-4));
                    } else {
                        // Sliding window: subtract left, add right
                        const leavingVal = data[prev - 1];
                        const enteringVal = data[windowEnd];

                        sum = currentSum - leavingVal + enteringVal;

                        // Highlight operations
                        setHighlightOperation('subtract');
                        setTimeout(() => setHighlightOperation('add'), 400);
                        setTimeout(() => setHighlightOperation(null), 800);

                        setExecutionLog(log => [
                            ...log,
                            `Window [${prev}-${windowEnd}]: ${currentSum} - ${leavingVal} + ${enteringVal} = ${sum}`
                        ].slice(-4));
                    }

                    setCurrentSum(sum);

                    // Check threshold
                    if (sum > THRESHOLD) {
                        setAlertWindow(prev);
                        setExecutionLog(log => [...log, `⚠️ ALERT: Window [${prev}-${windowEnd}] exceeds threshold (${sum} > ${THRESHOLD})`].slice(-4));
                    }

                    return prev + 1;
                });
            }, ANIMATION_SPEED);
        }
        return () => clearInterval(interval);
    }, [isPlaying, pythonComplete, data, currentSum]);

    // Auto-trigger Snowflake when Python completes
    useEffect(() => {
        if (pythonComplete && !snowflakeTriggered) {
            setTimeout(() => runSnowflakeQuery(), 800);
        }
    }, [pythonComplete, snowflakeTriggered]);

    // Generate Chart Data for Big O comparison
    const chartData = useMemo(() => {
        const points = [];
        const stepSize = nValue / 20;
        const k = WINDOW_SIZE;
        for (let i = 1; i <= 20; i++) {
            const n = Math.floor(i * stepSize);
            points.push({
                n,
                slidingWindow: n,
                bruteForce: n * k,
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
                                Server Health Monitor (Sliding Window)
                                {alertWindow !== null && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-sm bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full font-mono"
                                    >
                                        ⚠️ ALERT AT WINDOW [{alertWindow}-{alertWindow + WINDOW_SIZE - 1}]
                                    </motion.span>
                                )}
                            </h1>
                            <p className="text-sm text-slate-400 font-mono">Scenario: Find any {WINDOW_SIZE}-second window with total CPU load {'>'} {THRESHOLD}%</p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <input
                                className="bg-transparent border-none text-white font-mono text-sm focus:ring-0 w-64"
                                value={inputStr}
                                onChange={(e) => setInputStr(e.target.value)}
                                placeholder="40, 30, 60..."
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
                                        : 'bg-purple-600 hover:bg-purple-500'
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
                    className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl overflow-hidden"
                    initial={false}
                >
                    <button
                        onClick={() => setShowTheoryDeck(!showTheoryDeck)}
                        className="w-full flex items-center justify-between p-6 hover:bg-purple-900/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={24} className="text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Theory Deck: Sliding Window Pattern</h3>
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

                                    {/* Concept & Big O Lesson */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Concept */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
                                                <Code size={16} />
                                                The Concept
                                            </h4>
                                            <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                                Instead of recalculating the entire window sum every time, we <strong className="text-purple-400">slide</strong> the window:
                                                <br />• <strong>Subtract</strong> the element leaving the window
                                                <br />• <strong>Add</strong> the element entering the window
                                            </p>
                                            <div className="text-xs text-slate-500 bg-slate-800/50 p-2 rounded font-mono">
                                                for i in range(k, n):<br />
                                                &nbsp;&nbsp;sum = sum - arr[i-k] + arr[i]
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
                                                    <div className="text-purple-400 font-bold">Sliding Window: O(N)</div>
                                                    <div className="text-xs text-slate-400">Single pass, constant work per window</div>
                                                </div>
                                                <div>
                                                    <div className="text-red-400 font-bold">Brute Force: O(N·K)</div>
                                                    <div className="text-xs text-slate-400">N windows × K elements to sum</div>
                                                </div>
                                                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-2">
                                                    <div className="text-orange-300 font-bold mb-1">Why It Matters</div>
                                                    <div className="text-xs text-slate-400">
                                                        Avoiding nested loops saves <strong className="text-orange-300">CPU cycles</strong>.
                                                        For N=10K, K=100: Brute Force = 1M ops, Sliding Window = 10K ops!
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Formula */}
                                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg p-6">
                                        <h4 className="font-bold text-purple-300 mb-4 flex items-center gap-2">
                                            <Zap size={18} />
                                            Interactive Formula: How Sliding Window Works
                                        </h4>
                                        <div className="flex items-center justify-center gap-4 text-lg font-mono text-white">
                                            <div className="flex items-center gap-2 bg-purple-900/50 px-4 py-2 rounded border border-purple-500/50">
                                                <span className="text-slate-400">NewSum =</span>
                                                <span className="text-purple-300">OldSum</span>
                                            </div>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="flex items-center gap-2 bg-red-900/50 px-4 py-2 rounded border border-red-500/50"
                                            >
                                                <Minus size={16} className="text-red-400" />
                                                <span className="text-red-300">Leaving</span>
                                            </motion.div>
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                                                className="flex items-center gap-2 bg-green-900/50 px-4 py-2 rounded border border-green-500/50"
                                            >
                                                <Plus size={16} className="text-green-400" />
                                                <span className="text-green-300">Entering</span>
                                            </motion.div>
                                        </div>
                                        <div className="text-xs text-slate-400 text-center mt-3">
                                            This is the core insight: only 2 operations per slide, regardless of window size!
                                        </div>
                                    </div>

                                    {/* Interview Tip */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                            💡 Interview Tip
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            Use Sliding Window for problems involving <strong className="text-blue-300">"Contiguous Subarrays"</strong> or
                                            <strong className="text-blue-300">"Rolling Averages"</strong>. Keywords to watch: "consecutive", "window of size K", "subarray sum".
                                        </p>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Dual Engine Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

                    {/* LEFT: Python / Sliding Window */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Python Engine"
                            icon={<Code size={14} />}
                            sub="Sliding Window (Fixed Size)"
                            color="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* The Array with Sliding Window */}
                            <div className="relative pt-8">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                    <ArrowRight size={12} /> Sliding Window (Size = {WINDOW_SIZE})
                                </div>
                                <div className="flex justify-center gap-2 flex-wrap relative">
                                    {data.map((val, idx) => (
                                        <div key={idx} className="relative">
                                            <motion.div
                                                animate={{
                                                    scale: idx >= windowStart && idx < windowStart + WINDOW_SIZE && isPlaying ? 1.05 : 1,
                                                    backgroundColor:
                                                        alertWindow !== null && idx >= alertWindow && idx < alertWindow + WINDOW_SIZE
                                                            ? 'rgba(239, 68, 68, 0.3)'
                                                            : idx >= windowStart && idx < windowStart + WINDOW_SIZE
                                                                ? 'rgba(168, 85, 247, 0.2)'
                                                                : 'rgba(30, 41, 59, 1)',
                                                    borderColor:
                                                        alertWindow !== null && idx >= alertWindow && idx < alertWindow + WINDOW_SIZE
                                                            ? '#ef4444'
                                                            : idx >= windowStart && idx < windowStart + WINDOW_SIZE
                                                                ? '#a855f7'
                                                                : '#334155'
                                                }}
                                                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 text-sm font-mono font-bold transition-all
                                                    ${alertWindow !== null && idx >= alertWindow && idx < alertWindow + WINDOW_SIZE ? 'text-red-300' : 'text-slate-300'}
                                                `}
                                            >
                                                {val}
                                            </motion.div>

                                            {/* Highlight Leaving (Subtract) */}
                                            {idx === windowStart - 1 && highlightOperation === 'subtract' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-400 flex flex-col items-center"
                                                >
                                                    <Minus size={16} className="bg-red-900/50 p-1 rounded" />
                                                </motion.div>
                                            )}

                                            {/* Highlight Entering (Add) */}
                                            {idx === windowStart + WINDOW_SIZE - 1 && highlightOperation === 'add' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-green-400 flex flex-col items-center"
                                                >
                                                    <Plus size={16} className="bg-green-900/50 p-1 rounded" />
                                                </motion.div>
                                            )}

                                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 font-mono">
                                                [{idx}]
                                            </div>
                                        </div>
                                    ))}

                                    {/* Translucent Sliding Box */}
                                    {isPlaying && windowStart + WINDOW_SIZE <= data.length && (
                                        <motion.div
                                            className="absolute top-0 h-14 bg-purple-500/20 border-2 border-purple-500 rounded-lg pointer-events-none"
                                            animate={{
                                                left: `${windowStart * (56 + 8)}px`,
                                                width: `${WINDOW_SIZE * 56 + (WINDOW_SIZE - 1) * 8}px`
                                            }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Current Sum Display */}
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-purple-300">Current Window Sum</span>
                                    <motion.div
                                        key={currentSum}
                                        initial={{ scale: 1.3, color: '#a855f7' }}
                                        animate={{ scale: 1, color: currentSum > THRESHOLD ? '#ef4444' : '#c084fc' }}
                                        className="text-2xl font-mono font-bold"
                                    >
                                        {currentSum}
                                    </motion.div>
                                </div>
                                {currentSum > THRESHOLD && (
                                    <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        Exceeds threshold ({THRESHOLD})
                                    </div>
                                )}
                            </div>

                            {/* Logic Trace */}
                            <CodeBlock highlight={isPlaying}>
                                <div className="space-y-1">
                                    <div className="text-slate-500 text-[10px]"># Sliding window optimization</div>
                                    <div className={`transition-all ${windowStart === 0 ? 'text-purple-400 font-bold' : 'text-slate-600'
                                        }`}>
                                        sum = sum(arr[0:k])  <span className="text-slate-600"># Initial window</span>
                                    </div>
                                    <div className={`transition-all ${windowStart > 0 && isPlaying ? 'text-purple-400 font-bold' : 'text-slate-600'
                                        }`}>
                                        for i in range(k, n):
                                    </div>
                                    <div className={`pl-4 transition-all ${highlightOperation === 'subtract' ? 'text-red-300 font-bold' : 'text-slate-600'
                                        }`}>
                                        sum -= arr[i-k]  <span className="text-slate-600"># Remove left</span>
                                    </div>
                                    <div className={`pl-4 transition-all ${highlightOperation === 'add' ? 'text-green-300 font-bold' : 'text-slate-600'
                                        }`}>
                                        sum += arr[i]     <span className="text-slate-600"># Add right</span>
                                    </div>
                                </div>
                            </CodeBlock>

                            {/* Execution Log */}
                            <div className="bg-slate-950 rounded-lg border border-purple-500/30 p-3 min-h-[100px] max-h-[100px] overflow-y-auto">
                                <div className="text-[10px] uppercase text-purple-500 font-bold mb-2 flex items-center gap-2">
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
                                                className={`${log.includes('ALERT') ? 'text-red-400 font-bold' :
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

                    {/* RIGHT: Snowflake / Window Function */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Snowflake Engine"
                            icon={<Server size={14} />}
                            sub="Window Function (ROWS BETWEEN)"
                            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Window Function Table */}
                            <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 p-4 overflow-auto">
                                <table className="w-full text-xs font-mono">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-slate-800">
                                            <th className="p-2 text-left">time</th>
                                            <th className="p-2 text-left">cpu_load</th>
                                            <th className="p-2 text-left">window_sum</th>
                                            <th className="p-2 text-left">alert</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((val, idx) => {
                                            const windowSum = idx < WINDOW_SIZE - 1
                                                ? null
                                                : data.slice(idx - WINDOW_SIZE + 1, idx + 1).reduce((a, b) => a + b, 0);

                                            return (
                                                <motion.tr
                                                    key={idx}
                                                    className={`border-b border-slate-800/50 transition-all ${processingRow === idx ? 'bg-blue-500/20' :
                                                        processingRow !== null && processingRow > idx ? 'bg-slate-800/30' :
                                                            ''
                                                        }`}
                                                    initial={{ opacity: 0.3 }}
                                                    animate={{
                                                        opacity: snowflakeTriggered && processingRow !== null && processingRow >= idx ? 1 : 0.3
                                                    }}
                                                >
                                                    <td className="p-2 text-slate-500">{idx}s</td>
                                                    <td className="p-2 text-white font-bold">{val}%</td>
                                                    <td className="p-2 text-slate-400">
                                                        {windowSum !== null ? windowSum : '—'}
                                                    </td>
                                                    <td className="p-2">
                                                        {windowSum !== null && snowflakeTriggered && processingRow !== null && processingRow >= idx ? (
                                                            windowSum > THRESHOLD ? (
                                                                <span className="text-red-400 font-bold">TRUE</span>
                                                            ) : (
                                                                <span className="text-green-400">FALSE</span>
                                                            )
                                                        ) : (
                                                            <span className="text-slate-600">—</span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* SQL Query */}
                            <CodeBlock>
                                <pre className="text-blue-300 text-xs">
                                    {`-- Window function for rolling sum
SELECT 
  time,
  cpu_load,
  SUM(cpu_load) OVER (
    ORDER BY time
    ROWS BETWEEN 2 PRECEDING 
    AND CURRENT ROW
  ) as window_sum,
  CASE 
    WHEN window_sum > ${THRESHOLD} THEN TRUE 
    ELSE FALSE 
  END as alert
FROM server_metrics;`}
                                </pre>
                            </CodeBlock>

                            {/* DE Insight */}
                            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                                <div className="text-xs font-bold text-orange-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={12} />
                                    DE Insight: Memory Buffering
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Window functions require <strong className="text-orange-300">memory buffering</strong> to hold the current window.
                                    If the window is too large (e.g., <code className="bg-slate-800 px-1 rounded">UNBOUNDED</code>), Snowflake may spill to disk, causing
                                    <strong className="text-red-300"> 100-1000x slowdowns</strong>. Always use bounded windows when possible!
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom: Run Snowflake Query */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Database size={18} /> Snowflake Query Execution
                        </h3>
                        <button
                            onClick={runSnowflakeQuery}
                            disabled={snowflakeTriggered || !pythonComplete}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-bold text-sm transition-all"
                        >
                            <Play size={14} /> Run Snowflake Query
                        </button>
                    </div>
                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-xs text-blue-400 font-bold mb-2">💡 Behind the Scenes</div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            The window function processes data in order, maintaining a buffer of the last {WINDOW_SIZE} rows.
                            This is similar to the Python sliding window but operates in a distributed environment with memory management.
                        </p>
                    </div>
                </div>

                {/* Bottom: Big O Comparison Chart */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Time Complexity: Sliding Window vs Brute Force</h3>
                    <div className="flex flex-col lg:flex-row gap-8">

                        <div className="w-full lg:w-1/3 space-y-4">
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                <label className="text-xs text-slate-500 font-bold uppercase mb-3 block">
                                    Dataset Size (N): {nValue.toLocaleString()} items
                                </label>
                                <input
                                    type="range" min="100" max="10000" step="100"
                                    value={nValue} onChange={(e) => setNValue(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                    <span className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
                                        <span className="text-slate-300">Sliding Window</span>
                                    </span>
                                    <span className="font-mono font-bold text-purple-400">O(N)</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                                    <span className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
                                        <span className="text-slate-300">Brute Force</span>
                                    </span>
                                    <span className="font-mono font-bold text-red-400">O(N·K)</span>
                                </div>
                            </div>

                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                                <div className="text-xs font-bold text-purple-400 mb-1">💡 Key Insight</div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    At N={nValue.toLocaleString()}, K={WINDOW_SIZE}: Sliding Window does <strong className="text-purple-300">{nValue.toLocaleString()} operations</strong>.
                                    Brute Force does <strong className="text-red-300">{(nValue * WINDOW_SIZE).toLocaleString()} operations</strong>. That's {WINDOW_SIZE}x faster!
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 h-80 bg-slate-950 rounded-lg border border-slate-800 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorSlidingWindow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorBruteForce" x1="0" y1="0" x2="0" y2="1">
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
                                        dataKey="slidingWindow"
                                        stroke="#a855f7"
                                        strokeWidth={3}
                                        fill="url(#colorSlidingWindow)"
                                        name="O(N) - Sliding Window"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="bruteForce"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fill="url(#colorBruteForce)"
                                        name="O(N·K) - Brute Force"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Theory Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-purple-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Zap size={16} className="text-purple-400 mt-0.5" />
                            <strong className="text-slate-200">Fixed vs Variable Window</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            This module shows <span className="text-purple-400 font-semibold">Fixed-Size Window</span> (size = K).
                            There's also Variable-Size Window (e.g., "smallest window with sum ≥ X"), which uses two pointers and is slightly more complex.
                        </p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-blue-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Network size={16} className="text-blue-400 mt-0.5" />
                            <strong className="text-slate-200">Distributed Implementation</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            In Snowflake, <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[10px]">ROWS BETWEEN</code> creates a sliding window.
                            The engine buffers rows in memory. If the window is too large, it spills to disk—avoid <code className="bg-slate-800 px-1 rounded">UNBOUNDED</code>!
                        </p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-orange-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Activity size={16} className="text-orange-400 mt-0.5" />
                            <strong className="text-slate-200">Real-World Use Cases</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            <strong className="text-orange-300">Rolling averages</strong> (stock prices, metrics),
                            <strong className="text-orange-300"> time-series anomaly detection</strong> (server load, network traffic),
                            <strong className="text-orange-300"> DNA sequence analysis</strong> (bioinformatics).
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
