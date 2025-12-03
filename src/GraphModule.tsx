import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Server, Play, RotateCcw, Activity,
    ArrowRight, ChevronDown, ChevronUp,
    BookOpen, TrendingUp, AlertTriangle, GitCommit, Network, Layers
} from 'lucide-react';

// --- Types & Constants ---
interface GraphNode {
    id: string;
    name: string;
    x: number;
    y: number;
    status: 'idle' | 'visited' | 'current' | 'failed';
}

interface GraphEdge {
    from: string;
    to: string;
}

const DAG_NODES: GraphNode[] = [
    { id: 'A', name: 'Task A (Extract)', x: 150, y: 80, status: 'idle' },
    { id: 'B', name: 'Task B (Transform)', x: 80, y: 200, status: 'idle' },
    { id: 'C', name: 'Task C (Transform)', x: 220, y: 200, status: 'idle' },
    { id: 'D', name: 'Task D (Load)', x: 150, y: 320, status: 'idle' }
];

const DAG_EDGES: GraphEdge[] = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'D' }
];

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

export const GraphModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
    // Traversal State
    const [mode, setMode] = useState<'BFS' | 'DFS'>('BFS');
    const [nodes, setNodes] = useState<GraphNode[]>(DAG_NODES.map(n => ({ ...n, status: 'idle' })));
    const [queue, setQueue] = useState<string[]>([]);
    const [stack, setStack] = useState<string[]>([]);
    const [isTraversing, setIsTraversing] = useState(false);

    // Metadata Crawler State
    const [crawlerActive, setCrawlerActive] = useState(false);
    const [crawlerNode, setCrawlerNode] = useState<string | null>(null);
    const [networkCalls, setNetworkCalls] = useState(0);

    // UI State
    const [showTheoryDeck, setShowTheoryDeck] = useState(false);
    const [executionLog, setExecutionLog] = useState<string[]>([]);

    // Build adjacency list
    const buildGraph = () => {
        const graph: Record<string, string[]> = {};
        DAG_NODES.forEach(node => graph[node.id] = []);
        DAG_EDGES.forEach(edge => {
            if (!graph[edge.from]) graph[edge.from] = [];
            graph[edge.from].push(edge.to);
        });
        return graph;
    };

    // BFS Traversal
    const runBFS = async () => {
        setIsTraversing(true);
        setExecutionLog([`🔍 Starting BFS from failed Task A`]);

        const graph = buildGraph();
        const q: string[] = ['A'];
        const vis = new Set<string>();
        setQueue(q);
        n.id === current ? { ...n, status: current === 'A' ? 'failed' : 'current' } : n
                ));

await new Promise(resolve => setTimeout(resolve, 1000));

// Mark as visited
setNodes(prev => prev.map(n =>
    n.id === current ? { ...n, status: current === 'A' ? 'failed' : 'visited' } : n
));

// Add neighbors to queue
const neighbors = graph[current] || [];
neighbors.forEach(neighbor => {
    if (!vis.has(neighbor) && !q.includes(neighbor)) {
        q.push(neighbor);
        setExecutionLog(log => [...log, `➕ Queue: ${neighbor} (impacted)`].slice(-6));
    }
});
setQueue([...q]);

await new Promise(resolve => setTimeout(resolve, 500));
            }

setExecutionLog(log => [...log, `✅ BFS Complete - All impacted tasks identified`].slice(-6));
setIsTraversing(false);
        };

traverse();
    };

// DFS Traversal
const runDFS = async () => {
    setIsTraversing(true);
    setExecutionLog([`🔍 Starting DFS from failed Task A`]);

    const graph = buildGraph();
    const stk: string[] = ['A'];
    const vis = new Set<string>();
    setStack(stk);
            ));

await new Promise(resolve => setTimeout(resolve, 1000));

// Mark as visited
setNodes(prev => prev.map(n =>
    n.id === current ? { ...n, status: current === 'A' ? 'failed' : 'visited' } : n
));

// Add neighbors to stack (reverse order for consistent traversal)
const neighbors = graph[current] || [];
[...neighbors].reverse().forEach(neighbor => {
    if (!vis.has(neighbor)) {
        stk.push(neighbor);
        setExecutionLog(log => [...log, `➕ Stack: ${neighbor} (deep path)`].slice(-6));
    }
});
setStack([...stk]);

await new Promise(resolve => setTimeout(resolve, 500));
        }

setExecutionLog(log => [...log, `✅ DFS Complete - All paths explored`].slice(-6));
setIsTraversing(false);
    };

traverse();
};

// Metadata Crawler Simulation
const runCrawler = async () => {
    setCrawlerActive(true);
    setNetworkCalls(0);
    setExecutionLog([`🕷️ Metadata Crawler: Starting from Task A`]);

    const graph = buildGraph();
    const toVisit = ['A'];
    const visited = new Set<string>();

    while (toVisit.length > 0) {
        const current = toVisit.shift()!;
        if (visited.has(current)) continue;

        setCrawlerNode(current);
        setNetworkCalls(prev => prev + 1);
        setExecutionLog(log => [...log, `🌐 Network Call #${networkCalls + 1}: Fetch metadata for ${current}`].slice(-6));

        await new Promise(resolve => setTimeout(resolve, 1200));

        visited.add(current);

        // Fetch dependencies (edges)
        const deps = graph[current] || [];
        if (deps.length > 0) {
            setExecutionLog(log => [...log, `📦 Found ${deps.length} dependencies: ${deps.join(', ')}`].slice(-6));
            toVisit.push(...deps.filter(d => !visited.has(d)));
        }

        await new Promise(resolve => setTimeout(resolve, 800));
    }

    setCrawlerNode(null);
    setExecutionLog(log => [...log, `✅ Crawler Complete - Total Network Calls: ${networkCalls + 4}`].slice(-6));
    setCrawlerActive(false);
};

const reset = () => {
    setNodes(DAG_NODES.map(n => ({ ...n, status: 'idle' })));
    setQueue([]);
    setStack([]);
    setIsTraversing(false);
    setCrawlerActive(false);
    setCrawlerNode(null);
    setNetworkCalls(0);
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
                            Airflow DAG Failure (Graph Traversal)
                        </h1>
                        <p className="text-sm text-slate-400 font-mono">
                            BFS vs DFS: Impact Analysis
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setMode('BFS')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${mode === 'BFS' ? 'bg-blue-600' : 'bg-transparent text-slate-400'
                                    }`}
                            >
                                BFS (Queue)
                            </button>
                            <button
                                onClick={() => setMode('DFS')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${mode === 'DFS' ? 'bg-purple-600' : 'bg-transparent text-slate-400'
                                    }`}
                            >
                                DFS (Stack)
                            </button>
                        </div>
                        <button
                            onClick={mode === 'BFS' ? runBFS : runDFS}
                            disabled={isTraversing}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 rounded font-bold text-sm transition-all"
                        >
                            <Play size={14} />
                            Run {mode}
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
                className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-xl overflow-hidden"
                initial={false}
            >
                <button
                    onClick={() => setShowTheoryDeck(!showTheoryDeck)}
                    className="w-full flex items-center justify-between p-6 hover:bg-purple-900/10 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <BookOpen size={24} className="text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Theory Deck: Graph Traversal (BFS & DFS)</h3>
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
                                            <Network size={16} />
                                            The Concept: Graphs (DAGs)
                                        </h4>
                                        <div className="space-y-2 text-sm text-slate-300">
                                            <p><strong className="text-purple-400">Graph</strong> = Nodes (Vertices) + Edges (Connections)</p>
                                            <p className="text-xs text-slate-400">
                                                <strong className="text-cyan-300">DAG</strong> = Directed Acyclic Graph (no cycles)
                                            </p>
                                            <div className="bg-slate-800 p-2 rounded text-xs mt-2">
                                                Use Cases:<br />
                                                • Airflow/Dagster pipelines<br />
                                                • Data lineage<br />
                                                • Dependency trees
                                            </div>
                                        </div>
                                    </div>

                                    {/* Algorithms */}
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                        <h4 className="font-bold text-orange-300 mb-3 flex items-center gap-2">
                                            <Layers size={16} />
                                            BFS vs DFS
                                        </h4>
                                        <div className="text-sm text-slate-300 space-y-2">
                                            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                                                <div className="font-bold text-blue-400 text-xs mb-1">BFS (Breadth-First)</div>
                                                <div className="text-xs text-slate-400">
                                                    • Uses Queue (FIFO)<br />
                                                    • Level-by-level<br />
                                                    • Shortest path
                                                </div>
                                            </div>
                                            <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2">
                                                <div className="font-bold text-purple-400 text-xs mb-1">DFS (Depth-First)</div>
                                                <div className="text-xs text-slate-400">
                                                    • Uses Stack/Recursion<br />
                                                    • Deep path first<br />
                                                    • Explores all branches
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Big O */}
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                        <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                                            <TrendingUp size={16} />
                                            Big O: O(V + E)
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <div className="text-green-400 font-bold">Time: O(V + E)</div>
                                                <div className="text-xs text-slate-400">Visit all vertices & edges</div>
                                            </div>
                                            <div>
                                                <div className="text-orange-400 font-bold">Why count edges?</div>
                                                <div className="text-xs text-slate-400">
                                                    Each edge requires a traversal step. Dense graph (E ≈ V²) is slower than sparse.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Interview Tips */}
                                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                    <div className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                                        <AlertTriangle size={14} />
                                        Interview Tips
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
                                            <div className="font-bold text-blue-400 mb-2">✅ Use BFS For:</div>
                                            <ul className="text-slate-400 space-y-1 list-disc list-inside">
                                                <li><strong>Shortest Path</strong> (graph, grid)</li>
                                                <li><strong>Level Order</strong> traversal</li>
                                                <li>Finding <strong>nearest neighbor</strong></li>
                                            </ul>
                                        </div>
                                        <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3">
                                            <div className="font-bold text-purple-400 mb-2">✅ Use DFS For:</div>
                                            <ul className="text-slate-400 space-y-1 list-disc list-inside">
                                                <li><strong>Maze solving</strong> (backtracking)</li>
                                                <li><strong>Cycle detection</strong></li>
                                                <li>Finding <strong>all paths</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* DE Insight */}
                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                    <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                        <Database size={14} />
                                        DE Insight: Data Lineage & Impact Analysis
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                        If <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">Raw_Table_A</code> is corrupted, which downstream dashboards break?
                                        This requires <strong className="text-blue-300">Graph Traversal</strong> (BFS) through your data catalog.
                                    </p>
                                    <div className="text-xs space-y-2">
                                        <div className="bg-slate-800 border border-slate-700 rounded p-2">
                                            <div className="font-bold text-cyan-400 mb-1">Example Lineage:</div>
                                            <code className="text-slate-300">
                                                Raw_Table_A → [Transform_B, Transform_C] → Analytics_D → Dashboard_E
                                            </code>
                                        </div>
                                        <p className="text-slate-400">
                                            <strong className="text-orange-300">BFS</strong> finds all impacted assets level-by-level.
                                            Tools: Amundsen, Atlan, DataHub.
                                        </p>
                                    </div>
                                </div>

                                {/* Distributed Graphs */}
                                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                                    <div className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                                        <Network size={14} />
                                        The N+1 Problem (Distributed Graphs)
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                        In distributed systems (Social Networks, Microservices), traversing edges often means <strong className="text-red-400">Network Calls</strong>.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                                            <div className="font-bold text-red-400 mb-1">❌ Naive Approach</div>
                                            <div className="text-slate-400">
                                                • 1 call per node<br />
                                                • 1 call per edge<br />
                                                • = N+1 network calls!
                                            </div>
                                        </div>
                                        <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                                            <div className="font-bold text-green-400 mb-1">✅ Optimization</div>
                                            <div className="text-slate-400">
                                                • Batch fetching<br />
                                                • GraphQL (resolver)<br />
                                                • Caching metadata
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Dual Engine Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[700px]">

                {/* LEFT: Python BFS/DFS */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                    <PanelHeader
                        title={`Python ${mode}`}
                        icon={<GitCommit size={14} />}
                        sub={mode === 'BFS' ? 'Queue (FIFO)' : 'Stack (LIFO)'}
                        color={mode === 'BFS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}
                    />

                    <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                        {/* DAG Visualization */}
                        <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 flex-1">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                Airflow DAG (Task A Failed)
                            </div>
                            <svg className="w-full h-[400px]" viewBox="0 0 300 400">
                                {/* Edges */}
                                {DAG_EDGES.map((edge, idx) => {
                                    const fromNode = nodes.find(n => n.id === edge.from)!;
                                    const toNode = nodes.find(n => n.id === edge.to)!;
                                    return (
                                        <line
                                            key={idx}
                                            x1={fromNode.x}
                                            y1={fromNode.y}
                                            x2={toNode.x}
                                            y2={toNode.y}
                                            stroke="#475569"
                                            strokeWidth="2"
                                            markerEnd="url(#arrowhead)"
                                        />
                                    );
                                })}

                                {/* Arrow marker */}
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                        <polygon points="0 0, 10 3, 0 6" fill="#475569" />
                                    </marker>
                                </defs>

                                {/* Nodes */}
                                {nodes.map(node => (
                                    <g key={node.id}>
                                        <motion.circle
                                            cx={node.x}
                                            cy={node.y}
                                            r="35"
                                            fill={
                                                node.status === 'failed' ? '#dc2626' :
                                                    node.status === 'current' ? (mode === 'BFS' ? '#3b82f6' : '#a855f7') :
                                                        node.status === 'visited' ? '#10b981' :
                                                            '#1e293b'
                                            }
                                            stroke={
                                                node.status === 'failed' ? '#ef4444' :
                                                    node.status === 'current' ? (mode === 'BFS' ? '#60a5fa' : '#c084fc') :
                                                        node.status === 'visited' ? '#34d399' :
                                                            '#334155'
                                            }
                                            strokeWidth="3"
                                            initial={{ scale: 1 }}
                                            animate={{
                                                scale: node.status === 'current' ? 1.15 : 1,
                                                opacity: node.status === 'idle' ? 0.6 : 1
                                            }}
                                        />
                                        <text
                                            x={node.x}
                                            y={node.y + 5}
                                            textAnchor="middle"
                                            fill="white"
                                            fontSize="14"
                                            fontWeight="bold"
                                        >
                                            {node.id}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>

                        {/* Queue/Stack Visualization */}
                        <div className={`bg-slate-950 rounded-lg border ${mode === 'BFS' ? 'border-blue-500/30' : 'border-purple-500/30'} p-4 min-h-[100px]`}>
                            <div className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                <Layers size={12} />
                                {mode === 'BFS' ? 'Queue (FIFO)' : 'Stack (LIFO)'}
                            </div>
                            <div className={`flex ${mode === 'BFS' ? 'flex-row' : 'flex-col-reverse'} gap-2`}>
                                {(mode === 'BFS' ? queue : stack).length === 0 ? (
                                    <div className="text-slate-600 text-xs italic">Empty</div>
                                ) : (
                                    (mode === 'BFS' ? queue : stack).map((item, idx) => (
                                        <motion.div
                                            key={`${item}-${idx}`}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`px-4 py-2 rounded font-mono text-sm font-bold ${mode === 'BFS' ? 'bg-blue-500/30 border-2 border-blue-400' : 'bg-purple-500/30 border-2 border-purple-400'
                                                }`}
                                        >
                                            {item}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                            {mode === 'BFS' && queue.length > 0 && (
                                <div className="text-xs text-blue-400 mt-2">← Front | Back →</div>
                            )}
                        </div>

                        {/* Python Code */}
                        <CodeBlock>
                            <div className="space-y-1 text-xs">
                                {mode === 'BFS' ? (
                                    <>
                                        <div className="text-slate-500"># BFS (Level-by-Level)</div>
                                        <div className="text-blue-400">from collections import deque</div>
                                        <div className="text-green-400">queue = deque([start])</div>
                                        <div className="text-orange-400">while queue:</div>
                                        <div className="pl-4 text-cyan-400">node = queue.popleft()  # FIFO</div>
                                        <div className="pl-4 text-purple-400">for neighbor in graph[node]:</div>
                                        <div className="pl-8 text-slate-400">queue.append(neighbor)</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-slate-500"># DFS (Deep Path)</div>
                                        <div className="text-purple-400">stack = [start]</div>
                                        <div className="text-orange-400">while stack:</div>
                                        <div className="pl-4 text-cyan-400">node = stack.pop()  # LIFO</div>
                                        <div className="pl-4 text-green-400">for neighbor in graph[node]:</div>
                                        <div className="pl-8 text-slate-400">stack.append(neighbor)</div>
                                    </>
                                )}
                            </div>
                        </CodeBlock>

                    </div>
                </div>

                {/* RIGHT: Metadata Crawler */}
                <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                    <PanelHeader
                        title="Metadata Crawler"
                        icon={<Server size={14} />}
                        sub="Distributed Graph"
                        color="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    />

                    <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                        {/* Crawler Control */}
                        <div className="bg-slate-950 rounded-lg border border-slate-700 p-4">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                Data Catalog Crawler Simulation
                            </div>
                            <button
                                onClick={runCrawler}
                                disabled={crawlerActive}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 rounded font-bold text-sm transition-all"
                            >
                                <Network size={14} />
                                {crawlerActive ? 'Crawling...' : 'Start Crawler'}
                            </button>
                        </div>

                        {/* Crawler Visualization */}
                        <div className="bg-slate-950 rounded-lg border border-cyan-500/30 p-4 flex-1">
                            <div className="text-xs text-cyan-500 uppercase font-bold mb-3">
                                Crawling Progress
                            </div>
                            <div className="space-y-3">
                                {DAG_NODES.map(node => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ opacity: 0.3 }}
                                        animate={{
                                            opacity: crawlerNode === node.id ? 1 : 0.5,
                                            scale: crawlerNode === node.id ? 1.05 : 1,
                                            borderColor: crawlerNode === node.id ? '#22d3ee' : '#334155'
                                        }}
                                        className={`p-3 rounded-lg border-2 transition-all ${crawlerNode === node.id ? 'bg-cyan-900/30' : 'bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Network size={12} className={crawlerNode === node.id ? 'text-cyan-400' : 'text-slate-500'} />
                                                <span className="text-sm font-mono">{node.name}</span>
                                            </div>
                                            {crawlerNode === node.id && (
                                                <div className="text-xs text-cyan-400 font-bold animate-pulse">
                                                    🌐 Fetching...
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Network Stats */}
                        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                            <div className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1">
                                <AlertTriangle size={12} /> Network Calls
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{networkCalls}</div>
                            <p className="text-xs text-slate-400">
                                Each node requires a <strong className="text-orange-300">separate network call</strong> to fetch metadata.
                                This is the <strong>N+1 problem</strong> in distributed graphs!
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
