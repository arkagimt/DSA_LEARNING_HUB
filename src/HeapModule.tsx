import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Code, Server, RotateCcw, Activity,
    ArrowRight, ChevronDown, ChevronUp, Network,
    BookOpen, TrendingUp, AlertTriangle, Crown
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

// --- Types & Constants ---
interface Job {
    id: number;
    name: string;
    priority: 'Critical' | 'High' | 'Low';
    priorityValue: number;
}

const PRIORITY_VALUES = {
    'Critical': 3,
    'High': 2,
    'Low': 1
};

const PRIORITY_COLORS = {
    'Critical': 'bg-red-500/30 border-red-400 text-red-300',
    'High': 'bg-orange-500/30 border-orange-400 text-orange-300',
    'Low': 'bg-blue-500/30 border-blue-400 text-blue-300'
};

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

export const HeapModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
    // Python Heap State
    const [heap, setHeap] = useState<Job[]>([]);
    const [nextJobId, setNextJobId] = useState(1);
    const [bubblingIndex, setBubblingIndex] = useState<number | null>(null);

    // Distributed Top-K State
    const [workers, setWorkers] = useState<Job[][]>([]);
    const [workerTopK, setWorkerTopK] = useState<Job[][]>([[], [], []]);
    const [masterTopK, setMasterTopK] = useState<Job[]>([]);
    const [distributedPhase, setDistributedPhase] = useState(0);

    // UI State
    const [showTheoryDeck, setShowTheoryDeck] = useState(false);
    const [executionLog, setExecutionLog] = useState<string[]>([]);

    // Tree height data for O(log N) visualization
    const treeHeightData = useMemo(() => {
        const data = [];
        for (let n = 1; n <= 100; n += 10) {
            data.push({
                n,
                height: Math.ceil(Math.log2(n + 1))
            });
        }
        return data;
    }, []);

    // Add job to heap with bubble-up animation
    const addJob = (priority: 'Critical' | 'High' | 'Low') => {
        const job: Job = {
            id: nextJobId,
            name: `Job-${nextJobId}`,
            priority,
            priorityValue: PRIORITY_VALUES[priority]
        };

        const newHeap = [...heap, job];
        setHeap(newHeap);
        setNextJobId(prev => prev + 1);
        setExecutionLog(log => [...log, `➕ Added ${job.name} (${priority})`].slice(-5));

        // Simulate bubble-up
        let idx = newHeap.length - 1;
        const bubbleUp = () => {
            if (idx === 0) {
                setBubblingIndex(null);
                return;
            }

            const parentIdx = Math.floor((idx - 1) / 2);
            if (newHeap[idx].priorityValue > newHeap[parentIdx].priorityValue) {
                setBubblingIndex(idx);
                setTimeout(() => {
                    [newHeap[idx], newHeap[parentIdx]] = [newHeap[parentIdx], newHeap[idx]];
                    setHeap([...newHeap]);
                    idx = parentIdx;
                    bubbleUp();
                }, 500);
            } else {
                setBubblingIndex(null);
            }
        };

        setTimeout(bubbleUp, 300);
    };

    // Pop top priority job
    const popJob = () => {
        if (heap.length === 0) return;

        const popped = heap[0];
        setExecutionLog(log => [...log, `✓ Processed ${popped.name} (${popped.priority})`].slice(-5));

        if (heap.length === 1) {
            setHeap([]);
            return;
        }

        const newHeap = [...heap];
        newHeap[0] = newHeap[newHeap.length - 1];
        newHeap.pop();
        setHeap(newHeap);

        // Bubble down would happen here (simplified for demo)
    };

    // Run distributed Top-K simulation
    const runDistributedTopK = () => {
        setDistributedPhase(1);
        setExecutionLog(log => [...log, '🚀 Phase 1: Loading data on workers'].slice(-5));

        // Generate random jobs for 3 workers
        const generateWorkerJobs = () => {
            const priorities: ('Critical' | 'High' | 'Low')[] = ['Critical', 'High', 'Low'];
            const jobs: Job[] = [];
            for (let i = 0; i < 20; i++) {
                const priority = priorities[Math.floor(Math.random() * priorities.length)];
                jobs.push({
                    id: 1000 + i,
                    name: `J${1000 + i}`,
                    priority,
                    priorityValue: PRIORITY_VALUES[priority]
                });
            }
            return jobs;
        };

        const worker1 = generateWorkerJobs();
        const worker2 = generateWorkerJobs();
        const worker3 = generateWorkerJobs();
        setWorkers([worker1, worker2, worker3]);

        // Phase 2: Local Top-K computation
        setTimeout(() => {
            setDistributedPhase(2);
            setExecutionLog(log => [...log, '⚙️ Phase 2: Each worker finds local Top 3'].slice(-5));

            const getTop3 = (jobs: Job[]) => {
                return jobs.sort((a, b) => b.priorityValue - a.priorityValue).slice(0, 3);
            };

            const top1 = getTop3([...worker1]);
            const top2 = getTop3([...worker2]);
            const top3 = getTop3([...worker3]);
            setWorkerTopK([top1, top2, top3]);

            // Phase 3: Send to master
            setTimeout(() => {
                setDistributedPhase(3);
                setExecutionLog(log => [...log, '📤 Phase 3: Workers send Top 3 to master'].slice(-5));

                // Phase 4: Master merge
                setTimeout(() => {
                    setDistributedPhase(4);
                    const allTop = [...top1, ...top2, ...top3];
                    const finalTop3 = allTop.sort((a, b) => b.priorityValue - a.priorityValue).slice(0, 3);
                    setMasterTopK(finalTop3);
                    setExecutionLog(log => [...log, '✅ Phase 4: Master merged global Top 3'].slice(-5));
                }, 1500);
            }, 1500);
        }, 1500);
    };

    const reset = () => {
        setHeap([]);
        setNextJobId(1);
        setBubblingIndex(null);
        setWorkers([]);
        setWorkerTopK([[], [], []]);
        setMasterTopK([]);
        setDistributedPhase(0);
        setExecutionLog([]);
    };

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
                                HPC Job Scheduler (Priority Queue)
                            </h1>
                            <p className="text-sm text-slate-400 font-mono">
                                Heaps: VIP First, Not FIFO
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => addJob('Critical')}
                                className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-xs font-bold transition-all"
                            >
                                + Critical
                            </button>
                            <button
                                onClick={() => addJob('High')}
                                className="px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded text-xs font-bold transition-all"
                            >
                                + High
                            </button>
                            <button
                                onClick={() => addJob('Low')}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-all"
                            >
                                + Low
                            </button>
                            <button
                                onClick={popJob}
                                disabled={heap.length === 0}
                                className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 rounded text-xs font-bold transition-all"
                            >
                                Pop Top
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
                            <h3 className="text-xl font-bold text-white">Theory Deck: Heaps & Priority Queues</h3>
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

                                    {/* Top Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                        {/* Concept */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
                                                <Crown size={16} />
                                                The Concept: Priority Queue
                                            </h4>
                                            <div className="space-y-2 text-sm text-slate-300">
                                                <p>Not FIFO—it's <strong className="text-purple-400">"VIP First"</strong>!</p>
                                                <p className="text-xs text-slate-400">
                                                    Elements are served by <strong>priority</strong>, not arrival order.
                                                    Hospital ER: Critical patients before minor injuries.
                                                </p>
                                                <code className="bg-slate-800 px-2 py-1 rounded text-xs block mt-2">
                                                    heap.push(item, priority)<br />
                                                    top = heap.pop()  # Highest priority
                                                </code>
                                            </div>
                                        </div>

                                        {/* Data Structure */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-orange-300 mb-3 flex items-center gap-2">
                                                <Code size={16} />
                                                The Data Structure: Binary Heap
                                            </h4>
                                            <div className="text-sm text-slate-300">
                                                <p className="mb-2">A <strong className="text-orange-400">Complete Binary Tree</strong> stored as an array.</p>
                                                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-2 text-xs space-y-1">
                                                    <div><strong>Parent:</strong> index = (i - 1) // 2</div>
                                                    <div><strong>Left Child:</strong> index = 2*i + 1</div>
                                                    <div><strong>Right Child:</strong> index = 2*i + 2</div>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Max-Heap: Parent ≥ Children<br />
                                                    Min-Heap: Parent ≤ Children
                                                </p>
                                            </div>
                                        </div>

                                        {/* Big O */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                                                <TrendingUp size={16} />
                                                Big O Lesson
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <div className="text-green-400 font-bold">Insert: O(log N)</div>
                                                    <div className="text-xs text-slate-400">Bubble-up at most log N levels</div>
                                                </div>
                                                <div>
                                                    <div className="text-green-400 font-bold">Pop: O(log N)</div>
                                                    <div className="text-xs text-slate-400">Bubble-down at most log N levels</div>
                                                </div>
                                                <div>
                                                    <div className="text-cyan-400 font-bold">Peek: O(1)</div>
                                                    <div className="text-xs text-slate-400">Top element always at index 0</div>
                                                </div>
                                                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2 text-xs">
                                                    <strong>vs Full Sort:</strong> O(N log N) every time!
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Tree Height Chart */}
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                        <h4 className="font-bold text-cyan-300 mb-3">Tree Height vs Number of Elements (O(log N))</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={treeHeightData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis
                                                    dataKey="n"
                                                    stroke="#475569"
                                                    fontSize={10}
                                                    label={{ value: 'Number of Elements (N)', position: 'insideBottom', offset: -5, fill: '#64748b' }}
                                                />
                                                <YAxis
                                                    stroke="#475569"
                                                    fontSize={10}
                                                    label={{ value: 'Tree Height', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#0f172a',
                                                        borderColor: '#334155',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Bar dataKey="height" fill="#8b5cf6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Interview Tip */}
                                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            Interview Tip: Find K-th Largest Element
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-2">
                                            <strong className="text-red-400">DON'T</strong> sort the entire array → O(N log N)<br />
                                            <strong className="text-green-400">DO</strong> use a Min-Heap of size K → O(N log K)
                                        </p>
                                        <code className="bg-slate-800 px-2 py-1 rounded text-xs block text-slate-300">
                                            # Keep heap size = K<br />
                                            for num in nums:<br />
                                            &nbsp;&nbsp;heappush(heap, num)<br />
                                            &nbsp;&nbsp;if len(heap) &gt; K:<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;heappop(heap)<br />
                                            return heap[0]  # K-th largest
                                        </code>
                                    </div>

                                    {/* DE Insight */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                            <Database size={14} />
                                            DE Insight: Top-N Pushdown (Snowflake/Spark)
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                            Finding <strong className="text-blue-300">"Top 10"</strong> from 1TB of data doesn't require sorting everything!
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                            <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                                                <div className="font-bold text-red-400 mb-1">❌ Naive Approach</div>
                                                <div className="text-slate-400">
                                                    • Sort 1TB of data<br />
                                                    • Send ALL data to reducer<br />
                                                    • Massive network shuffle
                                                </div>
                                            </div>
                                            <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                                                <div className="font-bold text-green-400 mb-1">✅ Top-N Pushdown</div>
                                                <div className="text-slate-400">
                                                    • Each node finds local Top 10 (Heap)<br />
                                                    • Send only 10 records per node<br />
                                                    • Minimal network traffic
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            <strong className="text-orange-300">Example:</strong> 100 workers × 10 records = only 1,000 records to merge,
                                            instead of shuffling 1TB!
                                        </p>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Dual Engine Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[700px]">

                    {/* LEFT: Python Heap */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Python Heap"
                            icon={<Code size={14} />}
                            sub="heapq (Max-Heap)"
                            color="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Binary Tree Visualization */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 flex-1 min-h-[300px] relative">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                    Binary Heap (Array-based Tree)
                                </div>
                                {heap.length === 0 ? (
                                    <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
                                        Heap empty - add jobs to see the tree
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        {/* Level 0 */}
                                        {heap[0] && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`px-4 py-2 rounded-lg border-2 font-mono text-xs font-bold ${PRIORITY_COLORS[heap[0].priority]
                                                    } ${bubblingIndex === 0 ? 'ring-4 ring-purple-500' : ''}`}
                                            >
                                                {heap[0].name}<br />
                                                <span className="text-[10px]">{heap[0].priority}</span>
                                            </motion.div>
                                        )}

                                        {/* Level 1 */}
                                        {(heap[1] || heap[2]) && (
                                            <div className="flex gap-8">
                                                {heap[1] && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className={`px-3 py-2 rounded-lg border-2 font-mono text-xs font-bold ${PRIORITY_COLORS[heap[1].priority]
                                                            } ${bubblingIndex === 1 ? 'ring-4 ring-purple-500' : ''}`}
                                                    >
                                                        {heap[1].name}<br />
                                                        <span className="text-[10px]">{heap[1].priority}</span>
                                                    </motion.div>
                                                )}
                                                {heap[2] && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className={`px-3 py-2 rounded-lg border-2 font-mono text-xs font-bold ${PRIORITY_COLORS[heap[2].priority]
                                                            } ${bubblingIndex === 2 ? 'ring-4 ring-purple-500' : ''}`}
                                                    >
                                                        {heap[2].name}<br />
                                                        <span className="text-[10px]">{heap[2].priority}</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}

                                        {/* Level 2 */}
                                        {(heap[3] || heap[4] || heap[5] || heap[6]) && (
                                            <div className="flex gap-4">
                                                {[3, 4, 5, 6].map(idx => heap[idx] && (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className={`px-2 py-1 rounded border-2 font-mono text-[10px] font-bold ${PRIORITY_COLORS[heap[idx].priority]
                                                            } ${bubblingIndex === idx ? 'ring-4 ring-purple-500' : ''}`}
                                                    >
                                                        {heap[idx].name}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="text-xs text-slate-500 mt-4">
                                            Heap Size: {heap.length} | Height: {Math.ceil(Math.log2(heap.length + 1))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Python Code */}
                            <CodeBlock>
                                <div className="space-y-1 text-xs">
                                    <div className="text-slate-500"># Python heapq (Min-Heap)</div>
                                    <div className="text-purple-400">import heapq</div>
                                    <div className="text-green-400">heap = []</div>
                                    <div className="text-orange-400">heappush(heap, (-priority, job))  # Negate for max-heap</div>
                                    <div className="text-blue-400">top = heappop(heap)  # O(log N)</div>
                                    <div className="text-cyan-400">peek = heap[0]  # O(1)</div>
                                </div>
                            </CodeBlock>

                        </div>
                    </div>

                    {/* RIGHT: Distributed Top-K */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Distributed Top-K"
                            icon={<Network size={14} />}
                            sub="Top-N Pushdown"
                            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Distributed Visualization */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 flex-1">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                    Phase {distributedPhase}/4: {
                                        distributedPhase === 0 ? 'Ready' :
                                            distributedPhase === 1 ? 'Workers Loading Data' :
                                                distributedPhase === 2 ? 'Local Top-3 Computation' :
                                                    distributedPhase === 3 ? 'Send to Master' :
                                                        'Master Merge'
                                    }
                                </div>

                                {distributedPhase === 0 && (
                                    <div className="flex items-center justify-center h-48">
                                        <button
                                            onClick={runDistributedTopK}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all"
                                        >
                                            <Network className="inline mr-2" size={16} />
                                            Run Top-K Simulation
                                        </button>
                                    </div>
                                )}

                                {distributedPhase >= 1 && (
                                    <div className="space-y-4">
                                        {/* Worker Nodes */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[0, 1, 2].map(workerIdx => (
                                                <div key={workerIdx} className="bg-slate-800 border border-slate-700 rounded p-2">
                                                    <div className="text-[10px] font-bold text-blue-400 mb-1">Worker {workerIdx + 1}</div>
                                                    <div className="text-[9px] text-slate-500">
                                                        {workers[workerIdx]?.length || 0} jobs
                                                    </div>
                                                    {distributedPhase >= 2 && workerTopK[workerIdx].length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="mt-1 space-y-0.5"
                                                        >
                                                            {workerTopK[workerIdx].map(job => (
                                                                <div
                                                                    key={job.id}
                                                                    className={`text-[9px] px-1 py-0.5 rounded ${PRIORITY_COLORS[job.priority].replace('30', '20')}`}
                                                                >
                                                                    {job.name}
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Master Node */}
                                        {distributedPhase >= 3 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-800 border-2 border-green-500/50 rounded-lg p-3"
                                            >
                                                <div className="text-xs font-bold text-green-400 mb-2">Master Node</div>
                                                {distributedPhase === 4 && masterTopK.length > 0 && (
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] text-slate-500 mb-1">Global Top 3:</div>
                                                        {masterTopK.map((job, idx) => (
                                                            <motion.div
                                                                key={job.id}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: idx * 0.2 }}
                                                                className={`text-xs px-2 py-1 rounded border-2 font-bold ${PRIORITY_COLORS[job.priority]}`}
                                                            >
                                                                #{idx + 1}: {job.name} ({job.priority})
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* DE Insight Box */}
                            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                                <div className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1">
                                    <Database size={12} /> Network Savings
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Instead of shuffling 60 jobs (20 × 3 workers), we send only <strong className="text-green-300">9 jobs</strong> (3 × 3 workers) to the master.
                                    That's {distributedPhase === 4 ? <strong className="text-green-400">85% reduction!</strong> : '85% reduction!'}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Execution Log */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
                    <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Activity size={16} />
                        Execution Log
                    </div>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 min-h-[80px] max-h-[80px] overflow-y-auto">
                        <div className="space-y-1 font-mono text-xs">
                            {executionLog.length === 0 ? (
                                <div className="text-slate-600 italic">Waiting...</div>
                            ) : (
                                executionLog.map((log, idx) => (
                                    <motion.div
                                        key={`${log}-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-slate-400"
                                    >
                                        {log}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
