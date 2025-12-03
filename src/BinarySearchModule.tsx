import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, RotateCcw, Activity,
    ArrowRight, ChevronDown, ChevronUp, Zap,
    BookOpen, TrendingUp, AlertTriangle, Search, Filter, Check, X
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

// --- Types & Constants ---
interface MicroPartition {
    id: string;
    name: string;
    minId: number;
    maxId: number;
    status: 'idle' | 'pruned' | 'scanned';
}

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

export const BinarySearchModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
    // Python Binary Search State
    const [sortedArray] = useState([10, 25, 38, 45, 52, 67, 78, 89, 95, 110, 125, 140, 155, 170, 185, 200]);
    const [target, setTarget] = useState(67);
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(15);
    const [mid, setMid] = useState<number | null>(null);
    const [found, setFound] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [steps, setSteps] = useState(0);

    // Snowflake Partition Pruning State
    const [partitions, setPartitions] = useState<MicroPartition[]>([
        { id: 'A', name: 'Block A', minId: 1, maxId: 100, status: 'idle' },
        { id: 'B', name: 'Block B', minId: 101, maxId: 200, status: 'idle' },
        { id: 'C', name: 'Block C', minId: 201, maxId: 300, status: 'idle' }
    ]);
    const [queryId, setQueryId] = useState(150);
    const [snowflakeTriggered, setSnowflakeTriggered] = useState(false);

    // UI State
    const [showTheoryDeck, setShowTheoryDeck] = useState(false);
    const [executionLog, setExecutionLog] = useState<string[]>([]);

    // O(log N) chart data
    const logNData = useMemo(() => {
        const data = [];
        for (let n = 10; n <= 10000; n *= 2) {
            data.push({
                n,
                logN: Math.ceil(Math.log2(n)),
                linearN: n / 100 // scaled down for visibility
            });
        }
        return data;
    }, []);

    // Python Binary Search Animation
    const runBinarySearch = () => {
        setIsSearching(true);
        setFound(false);
        setLow(0);
        setHigh(sortedArray.length - 1);
        setMid(null);
        setSteps(0);
        setExecutionLog([`🔍 Searching for ${target} in sorted array`]);

        let l = 0;
        let h = sortedArray.length - 1;
        let stepCount = 0;

        const search = () => {
            if (l > h) {
                setExecutionLog(log => [...log, `❌ Not found after ${stepCount} steps`].slice(-6));
                setIsSearching(false);
                return;
            }

            stepCount++;
            setSteps(stepCount);

            // Calculate mid (safe from overflow)
            const m = l + Math.floor((h - l) / 2);
            setMid(m);
            setLow(l);
            setHigh(h);

            setExecutionLog(log => [...log, `Step ${stepCount}: L=${l}, H=${h}, M=${m} (arr[${m}]=${sortedArray[m]})`].slice(-6));

            if (sortedArray[m] === target) {
                setFound(true);
                setExecutionLog(log => [...log, `✅ Found ${target} at index ${m} in ${stepCount} steps!`].slice(-6));
                setIsSearching(false);
                return;
            }

            setTimeout(() => {
                if (sortedArray[m] < target) {
                    l = m + 1;
                    setExecutionLog(log => [...log, `arr[${m}] < target, search right half`].slice(-6));
                } else {
                    h = m - 1;
                    setExecutionLog(log => [...log, `arr[${m}] > target, search left half`].slice(-6));
                }
                search();
            }, 1000);
        };

        setTimeout(search, 500);
    };

    // Snowflake Partition Pruning
    const runPartitionPruning = () => {
        setSnowflakeTriggered(true);
        setExecutionLog([`🔍 Query: SELECT * WHERE id = ${queryId}`]);

        // Reset partitions
        const resetPartitions = partitions.map(p => ({ ...p, status: 'idle' as const }));
        setPartitions(resetPartitions);

        setTimeout(() => {
            setExecutionLog(log => [...log, `📊 Checking partition headers...`].slice(-6));

            setTimeout(() => {
                const newPartitions = resetPartitions.map(p => {
                    if (queryId >= p.minId && queryId <= p.maxId) {
                        setExecutionLog(log => [...log, `✅ ${p.name}: ID in range [${p.minId}-${p.maxId}] → SCAN`].slice(-6));
                        return { ...p, status: 'scanned' as const };
                    } else {
                        setExecutionLog(log => [...log, `❌ ${p.name}: ID out of range [${p.minId}-${p.maxId}] → PRUNE`].slice(-6));
                        return { ...p, status: 'pruned' as const };
                    }
                });

                setPartitions(newPartitions);

                setTimeout(() => {
                    const scannedCount = newPartitions.filter(p => p.status === 'scanned').length;
                    const prunedCount = newPartitions.filter(p => p.status === 'pruned').length;
                    setExecutionLog(log => [...log, `📈 Scanned: ${scannedCount} | Pruned: ${prunedCount} | Saved ${Math.round(prunedCount / 3 * 100)}% I/O!`].slice(-6));
                }, 1500);
            }, 1000);
        }, 500);
    };

    const reset = () => {
        setLow(0);
        setHigh(sortedArray.length - 1);
        setMid(null);
        setFound(false);
        setIsSearching(false);
        setSteps(0);
        setPartitions(partitions.map(p => ({ ...p, status: 'idle' })));
        setSnowflakeTriggered(false);
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
                                Database Lookup (Binary Search)
                            </h1>
                            <p className="text-sm text-slate-400 font-mono">
                                O(log N): Divide and Conquer
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-400">Target:</label>
                                <input
                                    type="number"
                                    value={target}
                                    onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm text-white"
                                    disabled={isSearching}
                                />
                            </div>
                            <button
                                onClick={runBinarySearch}
                                disabled={isSearching}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 rounded font-bold text-sm transition-all"
                            >
                                <Search size={14} />
                                Run Search
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
                    className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl overflow-hidden"
                    initial={false}
                >
                    <button
                        onClick={() => setShowTheoryDeck(!showTheoryDeck)}
                        className="w-full flex items-center justify-between p-6 hover:bg-purple-900/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={24} className="text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Theory Deck: Binary Search</h3>
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
                                                <Search size={16} />
                                                The Concept: Divide & Conquer
                                            </h4>
                                            <div className="space-y-2 text-sm text-slate-300">
                                                <p>Finding a page in a dictionary: <strong className="text-purple-400">open the middle</strong>, not flip every page!</p>
                                                <code className="bg-slate-800 px-2 py-1 rounded text-xs block mt-2">
                                                    if mid &lt; target:<br />
                                                    &nbsp;&nbsp;search_right_half()<br />
                                                    else:<br />
                                                    &nbsp;&nbsp;search_left_half()
                                                </code>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Each step <strong>eliminates half</strong> of the search space!
                                                </p>
                                            </div>
                                        </div>

                                        {/* Big O */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                                                <TrendingUp size={16} />
                                                Big O: Logarithmic Time
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <div className="text-green-400 font-bold">Time: O(log N)</div>
                                                    <div className="text-xs text-slate-400">Halves search space each step</div>
                                                </div>
                                                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2 text-xs space-y-1">
                                                    <div><strong>N=100:</strong> ~7 steps</div>
                                                    <div><strong>N=1,000,000:</strong> ~20 steps</div>
                                                    <div><strong>N=1,000,000,000:</strong> ~30 steps!</div>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    Scales beautifully! Even for huge data.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Visual */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
                                                <Zap size={16} />
                                                Visual: Search Space Shrinks
                                            </h4>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full h-4 bg-purple-500/50 rounded"></div>
                                                    <span className="text-slate-400">Step 0: N</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1/2 h-4 bg-purple-500/50 rounded"></div>
                                                    <span className="text-slate-400">Step 1: N/2</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1/4 h-4 bg-purple-500/50 rounded"></div>
                                                    <span className="text-slate-400">Step 2: N/4</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-[12.5%] h-4 bg-purple-500/50 rounded"></div>
                                                    <span className="text-slate-400">Step 3: N/8</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* O(log N) Chart */}
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                        <h4 className="font-bold text-cyan-300 mb-3">O(log N) vs O(N) - Growth Comparison</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={logNData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                <XAxis
                                                    dataKey="n"
                                                    stroke="#475569"
                                                    fontSize={10}
                                                    label={{ value: 'Array Size (N)', position: 'insideBottom', offset: -5, fill: '#64748b' }}
                                                    scale="log"
                                                    domain={['auto', 'auto']}
                                                />
                                                <YAxis
                                                    stroke="#475569"
                                                    fontSize={10}
                                                    label={{ value: 'Steps / Operations', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#0f172a',
                                                        borderColor: '#334155',
                                                        borderRadius: '8px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Line type="monotone" dataKey="logN" stroke="#22c55e" strokeWidth={3} name="O(log N)" />
                                                <Line type="monotone" dataKey="linearN" stroke="#ef4444" strokeWidth={3} name="O(N) scaled" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Interview Traps */}
                                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            Interview Traps: Bugs to Avoid
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                            <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                                                <div className="font-bold text-red-400 mb-2">❌ The Overflow Bug</div>
                                                <code className="bg-slate-800 px-2 py-1 rounded block text-red-300 mb-2">
                                                    mid = (low + high) / 2
                                                </code>
                                                <p className="text-slate-400">
                                                    If <code className="bg-slate-800 px-1 rounded">low + high</code> exceeds max int, it overflows!
                                                </p>
                                            </div>
                                            <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
                                                <div className="font-bold text-green-400 mb-2">✅ Safe Calculation</div>
                                                <code className="bg-slate-800 px-2 py-1 rounded block text-green-300 mb-2">
                                                    mid = low + (high - low) / 2
                                                </code>
                                                <p className="text-slate-400">
                                                    No overflow risk. Always use this!
                                                </p>
                                            </div>
                                            <div className="bg-red-900/20 border border-red-500/30 rounded p-3">
                                                <div className="font-bold text-red-400 mb-2">❌ Infinite Loop</div>
                                                <code className="bg-slate-800 px-2 py-1 rounded block text-red-300 mb-2">
                                                    if arr[mid] &lt; target:<br />
                                                    &nbsp;&nbsp;low = mid  # WRONG!
                                                </code>
                                                <p className="text-slate-400">
                                                    If <code className="bg-slate-800 px-1 rounded">low == mid</code>, loop never exits!
                                                </p>
                                            </div>
                                            <div className="bg-green-900/20 border border-green-500/30 rounded p-3">
                                                <div className="font-bold text-green-400 mb-2">✅ Correct Update</div>
                                                <code className="bg-slate-800 px-2 py-1 rounded block text-green-300 mb-2">
                                                    if arr[mid] &lt; target:<br />
                                                    &nbsp;&nbsp;low = mid + 1  # ✓
                                                </code>
                                                <p className="text-slate-400">
                                                    Always <code className="bg-slate-800 px-1 rounded">mid ± 1</code> to guarantee progress.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DE Insight */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                            <Database size={14} />
                                            DE Insight: Partition Pruning (Snowflake/Spark)
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                            Snowflake doesn't scan every row! Each <strong className="text-blue-300">micro-partition</strong> (file block) has a <strong>header</strong> with Min/Max values.
                                            When you query <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">WHERE id = 150</code>, it checks headers and <strong className="text-orange-300">prunes</strong> (skips) blocks outside that range.
                                        </p>
                                        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                                            <div className="bg-slate-800 border border-slate-700 rounded p-2">
                                                <div className="font-bold text-slate-400 mb-1">Block A</div>
                                                <div className="text-xs text-slate-500">IDs: 1-100</div>
                                                <div className="text-red-400 font-bold mt-1">PRUNED ❌</div>
                                            </div>
                                            <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                                                <div className="font-bold text-green-400 mb-1">Block B</div>
                                                <div className="text-xs text-slate-300">IDs: 101-200</div>
                                                <div className="text-green-400 font-bold mt-1">SCANNED ✓</div>
                                            </div>
                                            <div className="bg-slate-800 border border-slate-700 rounded p-2">
                                                <div className="font-bold text-slate-400 mb-1">Block C</div>
                                                <div className="text-xs text-slate-500">IDs: 201-300</div>
                                                <div className="text-red-400 font-bold mt-1">PRUNED ❌</div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            <strong className="text-orange-300">This is Binary Search applied to storage!</strong> Clustering (sorting data) enables this.
                                            Without clustering, all blocks must be scanned.
                                        </p>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Dual Engine Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

                    {/* LEFT: Python Binary Search */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Python Binary Search"
                            icon={<Search size={14} />}
                            sub="Sorted Array"
                            color="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Array Visualization */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 flex-1">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                    Sorted Array | Target: {target} | Steps: {steps}
                                </div>
                                <div className="grid grid-cols-8 gap-1">
                                    {sortedArray.map((num, idx) => {
                                        const isDiscarded = (mid !== null && ((idx < low && low !== 0) || (idx > high && high !== sortedArray.length - 1)));
                                        const isMid = mid === idx;
                                        const isInRange = idx >= low && idx <= high && mid !== null;
                                        const isFound = found && mid === idx;

                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ scale: 1 }}
                                                animate={{
                                                    scale: isMid ? 1.1 : 1,
                                                    opacity: isDiscarded ? 0.3 : 1
                                                }}
                                                className={`
                                                    px-2 py-3 rounded text-center text-xs font-mono font-bold border-2 transition-all
                                                    ${isFound ? 'bg-green-500/50 border-green-400 ring-4 ring-green-500' :
                                                        isMid ? 'bg-purple-500/50 border-purple-400 ring-4 ring-purple-500' :
                                                            isInRange ? 'bg-blue-500/20 border-blue-600' :
                                                                isDiscarded ? 'bg-slate-800 border-slate-700 text-slate-600' :
                                                                    'bg-slate-800 border-slate-700'
                                                    }
                                                `}
                                            >
                                                {num}
                                                {isMid && <div className="text-[8px] text-purple-300 mt-0.5">MID</div>}
                                                {idx === low && !isMid && <div className="text-[8px] text-blue-300 mt-0.5">L</div>}
                                                {idx === high && !isMid && <div className="text-[8px] text-blue-300 mt-0.5">H</div>}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                {mid !== null && (
                                    <div className="mt-4 text-xs text-slate-400 space-y-1">
                                        <div>Low (L): index {low} | High (H): index {high} | Mid (M): index {mid}</div>
                                        <div className="text-slate-500">arr[{mid}] = {sortedArray[mid]} {sortedArray[mid] === target ? '==' : sortedArray[mid] < target ? '<' : '>'} {target}</div>
                                    </div>
                                )}
                            </div>

                            {/* Python Code */}
                            <CodeBlock highlight={isSearching}>
                                <div className="space-y-1 text-xs">
                                    <div className="text-slate-500"># Binary Search (O(log N))</div>
                                    <div className="text-purple-400">def binary_search(arr, target):</div>
                                    <div className="pl-4 text-green-400">low, high = 0, len(arr) - 1</div>
                                    <div className="pl-4 text-blue-400">while low &lt;= high:</div>
                                    <div className="pl-8 text-orange-400">mid = low + (high - low) // 2  # Safe!</div>
                                    <div className="pl-8 text-cyan-400">if arr[mid] == target:</div>
                                    <div className="pl-12 text-slate-400">return mid</div>
                                    <div className="pl-8 text-cyan-400">elif arr[mid] &lt; target:</div>
                                    <div className="pl-12 text-slate-400">low = mid + 1</div>
                                    <div className="pl-8 text-cyan-400">else:</div>
                                    <div className="pl-12 text-slate-400">high = mid - 1</div>
                                    <div className="pl-4 text-red-400">return -1  # Not found</div>
                                </div>
                            </CodeBlock>

                        </div>
                    </div>

                    {/* RIGHT: Snowflake Partition Pruning */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Snowflake Storage"
                            icon={<Filter size={14} />}
                            sub="Partition Pruning"
                            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* Query Input */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                    Query Configuration
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-sm text-slate-400">WHERE id =</label>
                                    <input
                                        type="number"
                                        value={queryId}
                                        onChange={(e) => setQueryId(parseInt(e.target.value) || 0)}
                                        className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                                        disabled={snowflakeTriggered}
                                    />
                                    <button
                                        onClick={runPartitionPruning}
                                        disabled={snowflakeTriggered}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded font-bold text-sm transition-all"
                                    >
                                        <Filter size={14} />
                                        Run Pruning
                                    </button>
                                </div>
                            </div>

                            {/* Micro-Partitions Visualization */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 flex-1">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-4">
                                    Micro-Partitions (Storage Blocks)
                                </div>
                                <div className="space-y-4">
                                    {partitions.map(partition => (
                                        <motion.div
                                            key={partition.id}
                                            initial={{ scale: 1 }}
                                            animate={{
                                                scale: partition.status === 'scanned' ? 1.05 : 1,
                                                borderColor: partition.status === 'scanned' ? '#22c55e' :
                                                    partition.status === 'pruned' ? '#ef4444' : '#334155'
                                            }}
                                            className={`
                                                p-4 rounded-lg border-2 transition-all
                                                ${partition.status === 'scanned' ? 'bg-green-900/30 border-green-500' :
                                                    partition.status === 'pruned' ? 'bg-red-900/20 border-red-500' :
                                                        'bg-slate-800 border-slate-700'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold text-white">{partition.name}</div>
                                                {partition.status === 'scanned' && (
                                                    <div className="flex items-center gap-1 text-xs text-green-400 font-bold">
                                                        <Check size={12} /> SCANNED
                                                    </div>
                                                )}
                                                {partition.status === 'pruned' && (
                                                    <div className="flex items-center gap-1 text-xs text-red-400 font-bold">
                                                        <X size={12} /> PRUNED
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Header: MIN_ID = {partition.minId}, MAX_ID = {partition.maxId}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {queryId >= partition.minId && queryId <= partition.maxId ? (
                                                    <span className="text-green-400">✓ ID {queryId} in range</span>
                                                ) : (
                                                    <span className="text-red-400">✗ ID {queryId} out of range</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* DE Insight */}
                            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                                <div className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1">
                                    <Database size={12} /> Storage Optimization
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    By checking headers (Min/Max), Snowflake prunes entire files without reading them.
                                    <strong className="text-green-300"> Clustering Keys</strong> (sorting data) make this possible!
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
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 min-h-[100px] max-h-[100px] overflow-y-auto">
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
