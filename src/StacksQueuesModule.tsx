import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Code, Server, Play, RotateCcw, Activity,
    ArrowRight, Pause, ChevronDown, ChevronUp, Zap, Network,
    BookOpen, TrendingUp, Layers, AlertTriangle, ArrowDown, ArrowUp
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Line, LineChart
} from 'recharts';

// --- Types & Constants ---
const MAX_QUEUE_SIZE = 8;
const PROCESSING_SPEED = 1500; // ms per job
const BACKPRESSURE_THRESHOLD = 6;

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

export const StacksQueuesModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
    // Global State
    const [mode, setMode] = useState<'stack' | 'queue'>('queue');
    const [jobs, setJobs] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedJobs, setProcessedJobs] = useState<number[]>([]);
    const [nextJobId, setNextJobId] = useState(1);

    // Queue Depth Tracking
    const [queueDepthHistory, setQueueDepthHistory] = useState<{ time: number; depth: number }[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [backpressureAlert, setBackpressureAlert] = useState(false);

    // Distributed State
    const [kafkaTriggered, setKafkaTriggered] = useState(false);
    const [consumerSpeed, setConsumerSpeed] = useState(1);
    const [producerBurst, setProducerBurst] = useState(false);

    // UI State
    const [showTheoryDeck, setShowTheoryDeck] = useState(false);
    const [executionLog, setExecutionLog] = useState<string[]>([]);

    // Handlers
    const addJob = () => {
        if (jobs.length >= MAX_QUEUE_SIZE) {
            setBackpressureAlert(true);
            setExecutionLog(log => [...log, `⚠️ BACKPRESSURE! Queue full (${MAX_QUEUE_SIZE})`].slice(-4));
            setTimeout(() => setBackpressureAlert(false), 2000);
            return;
        }

        setJobs(prev => mode === 'stack' ? [...prev, nextJobId] : [...prev, nextJobId]);
        setExecutionLog(log => [...log, `➕ Job #${nextJobId} added (${mode.toUpperCase()})`].slice(-4));
        setNextJobId(prev => prev + 1);
        setBackpressureAlert(false);
    };

    const processJob = () => {
        if (jobs.length === 0) return;

        let processed: number;
        if (mode === 'stack') {
            // LIFO: pop from end
            processed = jobs[jobs.length - 1];
            setJobs(prev => prev.slice(0, -1));
        } else {
            // FIFO: pop from front
            processed = jobs[0];
            setJobs(prev => prev.slice(1));
        }

        setProcessedJobs(prev => [...prev, processed]);
        setExecutionLog(log => [...log, `✓ Job #${processed} processed (${mode.toUpperCase()})`].slice(-4));
    };

    const reset = () => {
        setJobs([]);
        setProcessedJobs([]);
        setNextJobId(1);
        setIsProcessing(false);
        setKafkaTriggered(false);
        setBackpressureAlert(false);
        setExecutionLog([]);
        setQueueDepthHistory([]);
        setCurrentTime(0);
    };

    const toggleMode = () => {
        setMode(prev => prev === 'stack' ? 'queue' : 'stack');
        reset();
    };

    const runKafkaSimulation = () => {
        setKafkaTriggered(true);
        setExecutionLog(log => [...log, `🚀 Kafka simulation started`].slice(-4));

        // Simulate producer bursts
        const produceInterval = setInterval(() => {
            if (Math.random() > 0.5) {
                addJob();
            }
        }, 800);

        setTimeout(() => {
            clearInterval(produceInterval);
        }, 6000);
    };

    // Auto-process jobs
    useEffect(() => {
        let interval: any;
        if (isProcessing && jobs.length > 0) {
            interval = setInterval(() => {
                processJob();
            }, PROCESSING_SPEED / consumerSpeed);
        }
        return () => clearInterval(interval);
    }, [isProcessing, jobs, mode, consumerSpeed]);

    // Track queue depth over time
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(prev => prev + 1);
            setQueueDepthHistory(prev => [
                ...prev,
                { time: currentTime + 1, depth: jobs.length }
            ].slice(-20));

            // Check backpressure
            if (jobs.length >= BACKPRESSURE_THRESHOLD) {
                setBackpressureAlert(true);
            } else {
                setBackpressureAlert(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [jobs.length, currentTime]);

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
                                Job Processing System ({mode.toUpperCase()})
                                {backpressureAlert && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-sm bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full font-mono"
                                    >
                                        ⚠️ BACKPRESSURE!
                                    </motion.span>
                                )}
                            </h1>
                            <p className="text-sm text-slate-400 font-mono">
                                {mode === 'stack' ? 'LIFO: Last-In, First-Out (Stack)' : 'FIFO: First-In, First-Out (Queue)'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Mode Toggle */}
                            <button
                                onClick={toggleMode}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-all"
                            >
                                <Layers size={14} />
                                Switch to {mode === 'stack' ? 'Queue' : 'Stack'}
                            </button>

                            <button
                                onClick={addJob}
                                disabled={jobs.length >= MAX_QUEUE_SIZE}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-bold text-sm transition-all"
                            >
                                ➕ Add Job
                            </button>

                            <button
                                onClick={() => setIsProcessing(!isProcessing)}
                                className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-all ${isProcessing ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-blue-600 hover:bg-blue-500'
                                    }`}
                            >
                                {isProcessing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start Processing</>}
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
                            <h3 className="text-xl font-bold text-white">Theory Deck: Stacks & Queues</h3>
                        </div>
                        {showTheoryDeck ? <ChevronUp className="text-purple-400" /> : <ChevronDown className="text-purple-400" />}
                    </button>

                    <AnimatePresence mode="wait" initial={false}>
                        {showTheoryDeck && (
                            <motion.div
                                key="theory-deck-content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0 space-y-6">

                                    {/* Top Row: Concept, Big O Lesson, Visual */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                        {/* Concept: LIFO vs FIFO */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
                                                <Code size={16} />
                                                The Concept
                                            </h4>
                                            <div className="space-y-3 text-sm text-slate-300">
                                                <div>
                                                    <div className="font-bold text-orange-400">Stack (LIFO)</div>
                                                    <div className="text-xs text-slate-400">Last-In, First-Out</div>
                                                    <code className="bg-slate-800 px-2 py-0.5 rounded text-xs mt-1 block">
                                                        stack.append(item)<br />
                                                        stack.pop()
                                                    </code>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-blue-400">Queue (FIFO)</div>
                                                    <div className="text-xs text-slate-400">First-In, First-Out</div>
                                                    <code className="bg-slate-800 px-2 py-0.5 rounded text-xs mt-1 block">
                                                        queue.append(item)<br />
                                                        queue.popleft()
                                                    </code>
                                                </div>
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
                                                    <div className="text-green-400 font-bold">Push: O(1)</div>
                                                    <div className="text-xs text-slate-400">Add to end (constant time)</div>
                                                </div>
                                                <div>
                                                    <div className="text-green-400 font-bold">Pop: O(1)</div>
                                                    <div className="text-xs text-slate-400">Remove from end/front (constant time)</div>
                                                </div>
                                                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2">
                                                    <div className="text-purple-300 font-bold mb-1">Why O(1)?</div>
                                                    <div className="text-xs text-slate-400">
                                                        Direct memory access—no searching or shifting required!
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visual Aid */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
                                                <Zap size={16} />
                                                Visual Analogy
                                            </h4>
                                            <div className="space-y-3 text-xs">
                                                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-2">
                                                    <div className="font-bold text-orange-400 mb-1">🥞 Stack of Plates</div>
                                                    <div className="text-slate-400">
                                                        Last plate added is the first removed (LIFO)
                                                    </div>
                                                </div>
                                                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                                                    <div className="font-bold text-blue-400 mb-1">🎫 Ticket Counter Line</div>
                                                    <div className="text-slate-400">
                                                        First person in line is served first (FIFO)
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* DE Insight: Backpressure */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            DE Insight: Backpressure in Distributed Systems
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                            In systems like <strong className="text-blue-300">Kafka</strong> or <strong className="text-blue-300">Snowpipe</strong>,
                                            if the Producer pushes data faster than Consumers can process, the queue fills up. This is called <strong className="text-orange-300">Backpressure</strong>.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                            <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                                                <div className="font-bold text-green-400 mb-1">✅ Healthy System</div>
                                                <div className="text-slate-400">
                                                    Producer Rate ≈ Consumer Rate<br />
                                                    Queue depth stays low
                                                </div>
                                            </div>
                                            <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                                                <div className="font-bold text-red-400 mb-1">⚠️ Backpressure</div>
                                                <div className="text-slate-400">
                                                    Producer Rate &gt; Consumer Rate<br />
                                                    Queue fills → system crashes/throttles
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            <strong className="text-orange-300">Solution:</strong> Add more consumers (scale horizontally) or increase consumer speed (optimize processing).
                                            In Kafka, monitor the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">lag</code> metric.
                                        </p>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Dual Engine Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

                    {/* LEFT: Python / Local RAM */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title={`Python Engine (${mode.toUpperCase()})`}
                            icon={<Code size={14} />}
                            sub={mode === 'stack' ? 'list.pop()' : 'deque.popleft()'}
                            color="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Visual Stack/Queue */}
                            <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 p-6 flex flex-col items-center justify-center">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-4">
                                    {mode === 'stack' ? '📚 Stack (LIFO)' : '➡️ Queue (FIFO)'}
                                </div>

                                {jobs.length === 0 ? (
                                    <div className="text-slate-600 text-sm">Empty {mode}</div>
                                ) : (
                                    <div className={`flex ${mode === 'stack' ? 'flex-col-reverse' : 'flex-row'} gap-2 items-center`}>
                                        {mode === 'queue' && (
                                            <div className="text-xs text-blue-400 font-bold">
                                                OUT →
                                            </div>
                                        )}
                                        {jobs.map((job, idx) => (
                                            <motion.div
                                                key={`${job}-${idx}`}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 text-sm font-mono font-bold transition-all ${idx === (mode === 'stack' ? jobs.length - 1 : 0)
                                                    ? 'bg-purple-500/30 border-purple-400 text-purple-300'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                                    }`}
                                            >
                                                #{job}
                                            </motion.div>
                                        ))}
                                        {mode === 'stack' && (
                                            <div className="text-xs text-purple-400 font-bold">
                                                ↑ TOP
                                            </div>
                                        )}
                                        {mode === 'queue' && (
                                            <div className="text-xs text-purple-400 font-bold">
                                                ← IN
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 text-xs text-slate-500">
                                    Queue Size: {jobs.length} / {MAX_QUEUE_SIZE}
                                </div>
                            </div>

                            {/* Code Logic */}
                            <CodeBlock highlight={isProcessing}>
                                <div className="space-y-1">
                                    {mode === 'stack' ? (
                                        <>
                                            <div className="text-slate-500 text-[10px]"># Stack (LIFO) - Python list</div>
                                            <div className="text-purple-400">stack = []</div>
                                            <div className="text-green-400">stack.append(job)  # Push</div>
                                            <div className="text-orange-400">stack.pop()        # Pop (last)</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-slate-500 text-[10px]"># Queue (FIFO) - Python deque</div>
                                            <div className="text-purple-400">from collections import deque</div>
                                            <div className="text-purple-400">queue = deque()</div>
                                            <div className="text-green-400">queue.append(job)   # Enqueue</div>
                                            <div className="text-blue-400">queue.popleft()     # Dequeue (first)</div>
                                        </>
                                    )}
                                </div>
                            </CodeBlock>

                            {/* Execution Log */}
                            <div className="bg-slate-950 rounded-lg border border-purple-500/30 p-3 min-h-[80px] max-h-[80px] overflow-y-auto">
                                <div className="text-[10px] uppercase text-purple-500 font-bold mb-2 flex items-center gap-2">
                                    <Activity size={10} /> Execution Log
                                </div>
                                <div className="space-y-1 font-mono text-xs">
                                    {executionLog.length === 0 ? (
                                        <div className="text-slate-600 italic">Waiting...</div>
                                    ) : (
                                        executionLog.map((log, idx) => (
                                            <motion.div
                                                key={`${log}-${idx}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`${log.includes('BACKPRESSURE') ? 'text-red-400 font-bold' : 'text-slate-400'
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

                    {/* RIGHT: Kafka / Message Broker */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Kafka / Message Broker"
                            icon={<Server size={14} />}
                            sub="Distributed Queue"
                            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Queue Depth Chart */}
                            <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 p-4">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-2">
                                    📊 Queue Depth (Lag) Over Time
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={queueDepthHistory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis
                                            dataKey="time"
                                            stroke="#475569"
                                            fontSize={10}
                                            label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#64748b' }}
                                        />
                                        <YAxis
                                            stroke="#475569"
                                            fontSize={10}
                                            domain={[0, MAX_QUEUE_SIZE]}
                                            label={{ value: 'Queue Depth', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                borderColor: '#334155',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="depth"
                                            stroke={backpressureAlert ? '#ef4444' : '#3b82f6'}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>

                                {backpressureAlert && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded p-2"
                                    >
                                        <AlertTriangle size={12} className="inline mr-1" />
                                        Backpressure detected! Queue depth &gt; {BACKPRESSURE_THRESHOLD}
                                    </motion.div>
                                )}
                            </div>

                            {/* Kafka Controls */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">Kafka Controls</div>
                                <div className="space-y-2">
                                    <button
                                        onClick={runKafkaSimulation}
                                        disabled={kafkaTriggered}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-bold text-sm transition-all"
                                    >
                                        <Network size={14} />
                                        Simulate Producer Bursts
                                    </button>

                                    <div className="text-xs text-slate-400 bg-blue-900/10 border border-blue-500/30 rounded p-2">
                                        <strong className="text-blue-300">Consumer Speed:</strong> {consumerSpeed}x
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="3"
                                            step="0.5"
                                            value={consumerSpeed}
                                            onChange={(e) => setConsumerSpeed(parseFloat(e.target.value))}
                                            className="w-full mt-2 accent-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* DE Insight */}
                            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                                <div className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1">
                                    <Database size={12} /> DE Insight: Kafka Lag
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    In Kafka, <strong className="text-orange-300">lag</strong> measures how far behind consumers are.
                                    High lag = backpressure. Monitor with <code className="bg-slate-800 px-1 rounded">kafka-consumer-groups</code>.
                                    Add partitions or consumers to scale.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Bottom: Real-World Use Cases */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-purple-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Layers size={16} className="text-purple-400 mt-0.5" />
                            <strong className="text-slate-200">Stack Use Cases</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            <strong className="text-purple-400">Browser History</strong> (back button),
                            <strong className="text-purple-400"> Undo/Redo</strong> in editors,
                            <strong className="text-purple-400"> Function Call Stack</strong> (recursion),
                            <strong className="text-purple-400"> DFS</strong> (Depth-First Search).
                        </p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-blue-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Network size={16} className="text-blue-400 mt-0.5" />
                            <strong className="text-slate-200">Queue Use Cases</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            <strong className="text-blue-400">Message Brokers</strong> (Kafka, RabbitMQ),
                            <strong className="text-blue-400"> Task Scheduling</strong> (Celery, Airflow),
                            <strong className="text-blue-400"> BFS</strong> (Breadth-First Search),
                            <strong className="text-blue-400"> Rate Limiting</strong>.
                        </p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-orange-500/30 transition-all">
                        <div className="flex items-start gap-3 mb-2">
                            <Activity size={16} className="text-orange-400 mt-0.5" />
                            <strong className="text-slate-200">Distributed Insight</strong>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Stacks are rare in distributed systems (no LIFO streams).
                            <strong className="text-orange-300"> Queues dominate</strong>: Kafka, Kinesis, SQS all use FIFO for reliable, ordered processing.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
