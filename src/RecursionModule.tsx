import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Code, Server, RotateCcw, Activity,
    ArrowRight, ChevronDown, ChevronUp, Zap,
    BookOpen, TrendingUp, GitBranch, Layers, AlertTriangle
} from 'lucide-react';

// --- Types & Constants ---
interface BOMNode {
    id: string;
    name: string;
    children?: string[];
}

const BOM_DATA: Record<string, BOMNode> = {
    'Engine': { id: 'Engine', name: 'Engine', children: ['Block', 'Piston'] },
    'Block': { id: 'Block', name: 'Block', children: ['Liner', 'Bearing'] },
    'Piston': { id: 'Piston', name: 'Piston', children: ['Ring', 'Pin'] },
    'Liner': { id: 'Liner', name: 'Liner' },
    'Bearing': { id: 'Bearing', name: 'Bearing' },
    'Ring': { id: 'Ring', name: 'Ring' },
    'Pin': { id: 'Pin', name: 'Pin' }
};

interface StackFrame {
    node: string;
    depth: number;
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

export const RecursionModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
    // Python DFS State
    const [callStack, setCallStack] = useState<StackFrame[]>([]);
    const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentDepth, setCurrentDepth] = useState(0);

    // Snowflake CTE State
    const [sqlLevel, setSqlLevel] = useState(0);
    const [sqlResults, setSqlResults] = useState<Array<{ level: number; node: string; parent: string | null }>>([]);
    const [sqlTriggered, setSqlTriggered] = useState(false);

    // UI State
    const [showTheoryDeck, setShowTheoryDeck] = useState(false);
    const [executionLog, setExecutionLog] = useState<string[]>([]);
    const [maxDepth, setMaxDepth] = useState(0);

    // DFS Recursive Traversal Simulation
    const simulateDFS = async (node: string, depth: number, stack: StackFrame[], visited: string[]): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Enter phase
                const newStack = [...stack, { node, depth }];
                setCallStack(newStack);
                setVisitedNodes([...visited, node]);
                setCurrentDepth(depth);
                setMaxDepth(prev => Math.max(prev, depth));
                setExecutionLog(log => [...log, `${'  '.repeat(depth)}→ Enter ${node} (depth ${depth})`].slice(-6));

                // Process children
                const children = BOM_DATA[node]?.children || [];

                let childPromises: Promise<void>[] = [];
                children.forEach((child, idx) => {
                    childPromises.push(
                        new Promise<void>((childResolve) => {
                            setTimeout(() => {
                                simulateDFS(child, depth + 1, newStack, [...visited, node]).then(childResolve);
                            }, (idx + 1) * 1000);
                        })
                    );
                });

                Promise.all(childPromises).then(() => {
                    setTimeout(() => {
                        // Exit phase
                        setCallStack(stack);
                        setExecutionLog(log => [...log, `${'  '.repeat(depth)}← Exit ${node}`].slice(-6));
                        resolve();
                    }, 500);
                });
            }, 500);
        });
    };

    const runPythonDFS = () => {
        setIsPlaying(true);
        setCallStack([]);
        setVisitedNodes([]);
        setExecutionLog([]);
        setMaxDepth(0);

        simulateDFS('Engine', 0, [], []).then(() => {
            setIsPlaying(false);
            setCallStack([]);
            setExecutionLog(log => [...log, '✓ DFS Complete'].slice(-6));
        });
    };

    const runSnowflakeCTE = () => {
        setSqlTriggered(true);
        setSqlLevel(0);
        setSqlResults([]);
        setExecutionLog([]);

        // Simulate CTE level-by-level processing
        const levels: Array<{ level: number; node: string; parent: string | null }> = [
            { level: 0, node: 'Engine', parent: null }
        ];

        let currentLevel = 0;
        const interval = setInterval(() => {
            setSqlLevel(currentLevel);

            // Get nodes at current level
            const currentLevelNodes = levels.filter(r => r.level === currentLevel);

            if (currentLevelNodes.length === 0) {
                clearInterval(interval);
                setExecutionLog(log => [...log, '✓ CTE Complete'].slice(-6));
                return;
            }

            // Add to results
            setSqlResults([...levels.slice(0, levels.length)]);
            setExecutionLog(log => [...log, `Level ${currentLevel}: Found ${currentLevelNodes.length} node(s)`].slice(-6));

            // Find children for next level
            currentLevelNodes.forEach(node => {
                const children = BOM_DATA[node.node]?.children || [];
                children.forEach(child => {
                    levels.push({ level: currentLevel + 1, node: child, parent: node.node });
                });
            });

            currentLevel++;
        }, 1500);
    };

    const reset = () => {
        setCallStack([]);
        setVisitedNodes([]);
        setIsPlaying(false);
        setSqlTriggered(false);
        setSqlLevel(0);
        setSqlResults([]);
        setExecutionLog([]);
        setMaxDepth(0);
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
                                BOM (Bill of Materials) Explorer
                            </h1>
                            <p className="text-sm text-slate-400 font-mono">
                                Recursion: Depth-First (Python) vs Level-by-Level (SQL CTE)
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={runPythonDFS}
                                disabled={isPlaying}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-bold text-sm transition-all"
                            >
                                <GitBranch size={14} />
                                Run Python DFS
                            </button>

                            <button
                                onClick={runSnowflakeCTE}
                                disabled={sqlTriggered}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-bold text-sm transition-all"
                            >
                                <Layers size={14} />
                                Run Snowflake CTE
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
                    className="bg-gradient-to-br from-purple-900/20 to-orange-900/20 border border-purple-500/30 rounded-xl overflow-hidden"
                    initial={false}
                >
                    <button
                        onClick={() => setShowTheoryDeck(!showTheoryDeck)}
                        className="w-full flex items-center justify-between p-6 hover:bg-purple-900/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={24} className="text-purple-400" />
                            <h3 className="text-xl font-bold text-white">Theory Deck: Recursion & Call Stack</h3>
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
                                                <Code size={16} />
                                                The Concept
                                            </h4>
                                            <div className="space-y-3 text-sm text-slate-300">
                                                <div>
                                                    <div className="font-bold text-purple-400">Recursion Formula</div>
                                                    <code className="bg-slate-800 px-2 py-0.5 rounded text-xs mt-1 block">
                                                        if base_case:<br />
                                                        &nbsp;&nbsp;return result<br />
                                                        return recursive_call()
                                                    </code>
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    A function calls itself until it hits a <strong className="text-orange-300">base case</strong>.
                                                </div>
                                            </div>
                                        </div>

                                        {/* Data Structure */}
                                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                            <h4 className="font-bold text-orange-300 mb-3 flex items-center gap-2">
                                                <Layers size={16} />
                                                The Data Structure
                                            </h4>
                                            <div className="text-sm text-slate-300">
                                                <p className="mb-2">Recursion implicitly uses a <strong className="text-orange-400">STACK</strong> (LIFO).</p>
                                                <div className="bg-orange-900/20 border border-orange-500/30 rounded p-2 text-xs">
                                                    Each function call creates a <strong>stack frame</strong> containing:
                                                    <ul className="list-disc list-inside mt-1 text-slate-400">
                                                        <li>Local variables</li>
                                                        <li>Return address</li>
                                                        <li>Parameters</li>
                                                    </ul>
                                                </div>
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
                                                    <div className="text-green-400 font-bold">Time: O(N)</div>
                                                    <div className="text-xs text-slate-400">Visit each node once</div>
                                                </div>
                                                <div>
                                                    <div className="text-orange-400 font-bold">Space: O(Depth)</div>
                                                    <div className="text-xs text-slate-400">Stack frames proportional to max depth</div>
                                                </div>
                                                <div className="bg-red-900/20 border border-red-500/30 rounded p-2 text-xs">
                                                    <strong className="text-red-400">Stack Overflow!</strong> Deep recursion = lots of memory.
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Visual Aid: Call Stack Animation */}
                                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                                        <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
                                            <Zap size={16} />
                                            Visual: Call Stack Growing & Shrinking
                                        </h4>
                                        <div className="flex items-center justify-center gap-4 h-32 bg-slate-950 rounded border border-slate-800">
                                            <div className="flex flex-col-reverse gap-1">
                                                {[0, 1, 2, 3].map(depth => (
                                                    <motion.div
                                                        key={depth}
                                                        initial={{ scaleY: 0 }}
                                                        animate={{ scaleY: depth <= maxDepth ? 1 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className={`w-24 h-8 flex items-center justify-center rounded text-xs font-bold ${depth === currentDepth ? 'bg-purple-500/50 border-2 border-purple-400' : 'bg-slate-700 border border-slate-600'
                                                            }`}
                                                    >
                                                        Depth {depth}
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Max Depth: {maxDepth}
                                            </div>
                                        </div>
                                    </div>

                                    {/* DE Insight */}
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                                        <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                                            <AlertTriangle size={14} />
                                            DE Insight: Recursion in SQL vs Python
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                            <strong className="text-orange-300">Python</strong> uses <strong>Depth-First</strong> recursion (call stack).
                                            Risk: <code className="bg-slate-800 px-1 rounded">RecursionError: maximum recursion depth exceeded</code> (default ~1000 levels).
                                        </p>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-3">
                                            <strong className="text-blue-300">Snowflake SQL</strong> uses <strong>Recursive CTEs</strong> which process <strong>level-by-level</strong> (Breadth-First).
                                            This is <strong className="text-green-300">set-based</strong>, not stack-based. No recursion depth limit—processes all nodes at Level 1, then all at Level 2, etc.
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2">
                                                <div className="font-bold text-purple-400 mb-1">Python DFS</div>
                                                <div className="text-slate-400">
                                                    • Goes deep fast<br />
                                                    • Limited by stack size<br />
                                                    • Good for single-path traversal
                                                </div>
                                            </div>
                                            <div className="bg-blue-900/20 border border-blue-500/30 rounded p-2">
                                                <div className="font-bold text-blue-400 mb-1">SQL CTE (BFS)</div>
                                                <div className="text-slate-400">
                                                    • Processes by level<br />
                                                    • No depth limit<br />
                                                    • Great for hierarchies (BOM, Org Charts)
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

                    {/* LEFT: Python DFS */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Python DFS"
                            icon={<GitBranch size={14} />}
                            sub="Depth-First (Recursive)"
                            color="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* BOM Tree with DFS Highlighting */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 flex-1">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                    BOM Hierarchy (DFS Traversal)
                                </div>
                                <div className="space-y-1 font-mono text-xs">
                                    <div className={visitedNodes.includes('Engine') ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                                        Engine {visitedNodes.includes('Engine') && '✓'}
                                    </div>
                                    <div className="ml-4">
                                        <div className={visitedNodes.includes('Block') ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                                            ├─ Block {visitedNodes.includes('Block') && '✓'}
                                        </div>
                                        <div className="ml-4">
                                            <div className={visitedNodes.includes('Liner') ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                                                ├─ Liner {visitedNodes.includes('Liner') && '✓'}
                                            </div>
                                            <div className={visitedNodes.includes('Bearing') ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                                                └─ Bearing {visitedNodes.includes('Bearing') && '✓'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className={visitedNodes.includes('Piston') ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                                            └─ Piston {visitedNodes.includes('Piston') && '✓'}
                                        </div>
                                        <div className="ml-8">
                                            <div className={visitedNodes.includes('Ring') ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                                                ├─ Ring {visitedNodes.includes('Ring') && '✓'}
                                            </div>
                                            <div className={visitedNodes.includes('Pin') ? 'text-purple-400 font-bold' : 'text-slate-600'}>
                                                └─ Pin {visitedNodes.includes('Pin') && '✓'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Call Stack Visualization */}
                            <div className="bg-slate-950 rounded-lg border border-purple-500/30 p-4 min-h-[150px]">
                                <div className="text-xs text-purple-500 uppercase font-bold mb-3 flex items-center gap-2">
                                    <Layers size={12} /> Call Stack (LIFO)
                                </div>
                                <div className="flex flex-col-reverse gap-1">
                                    {callStack.length === 0 ? (
                                        <div className="text-slate-600 text-xs italic">Stack empty</div>
                                    ) : (
                                        callStack.map((frame, idx) => (
                                            <motion.div
                                                key={`${frame.node}-${idx}`}
                                                initial={{ scaleY: 0, opacity: 0 }}
                                                animate={{ scaleY: 1, opacity: 1 }}
                                                className={`px-3 py-2 rounded font-mono text-xs ${idx === callStack.length - 1
                                                    ? 'bg-purple-500/30 border-2 border-purple-400 font-bold'
                                                    : 'bg-slate-800 border border-slate-700'
                                                    }`}
                                            >
                                                {frame.node} (depth {frame.depth})
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Python Code */}
                            <CodeBlock highlight={isPlaying}>
                                <div className="space-y-1 text-xs">
                                    <div className="text-slate-500"># Recursive DFS</div>
                                    <div className="text-purple-400">def explode_bom(part):</div>
                                    <div className="pl-4 text-orange-400">if part not in bom:</div>
                                    <div className="pl-8 text-slate-400">return  # Base case</div>
                                    <div className="pl-4 text-green-400">for child in bom[part]:</div>
                                    <div className="pl-8 text-blue-400">explode_bom(child)  # Recursive call</div>
                                </div>
                            </CodeBlock>

                        </div>
                    </div>

                    {/* RIGHT: Snowflake CTE */}
                    <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
                        <PanelHeader
                            title="Snowflake CTE"
                            icon={<Server size={14} />}
                            sub="Level-by-Level (BFS)"
                            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        />

                        <div className="p-8 mt-12 flex-1 flex flex-col gap-6">

                            {/* CTE Results by Level */}
                            <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 flex-1 overflow-auto">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                                    Recursive CTE Results (Level {sqlLevel})
                                </div>
                                <table className="w-full text-xs font-mono">
                                    <thead>
                                        <tr className="text-slate-500 border-b border-slate-800">
                                            <th className="p-2 text-left">Level</th>
                                            <th className="p-2 text-left">Part</th>
                                            <th className="p-2 text-left">Parent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sqlResults.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-2 text-slate-600 italic">No results yet</td>
                                            </tr>
                                        ) : (
                                            sqlResults.map((row, idx) => (
                                                <motion.tr
                                                    key={idx}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: row.level <= sqlLevel ? 1 : 0.3 }}
                                                    className={`border-b border-slate-800/50 ${row.level === sqlLevel ? 'bg-blue-500/20' : ''
                                                        }`}
                                                >
                                                    <td className="p-2 text-blue-400">{row.level}</td>
                                                    <td className="p-2 text-white font-bold">{row.node}</td>
                                                    <td className="p-2 text-slate-400">{row.parent || '—'}</td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* SQL CTE Code */}
                            <CodeBlock>
                                <pre className="text-blue-300 text-xs">
                                    {`-- Recursive CTE (Level-by-Level)
WITH RECURSIVE bom_explosion AS (
  -- Anchor: Start with Engine
  SELECT 'Engine' as part, 
         NULL as parent, 
         0 as level
  
  UNION ALL
  
  -- Recursive: Get children
  SELECT c.child, 
         c.parent, 
         b.level + 1
  FROM bom_explosion b
  JOIN bom_table c 
    ON b.part = c.parent
)
SELECT * FROM bom_explosion;`}
                                </pre>
                            </CodeBlock>

                            {/* DE Insight */}
                            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                                <div className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1">
                                    <Database size={12} /> DE Insight: Set-Based Processing
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    SQL CTEs process <strong className="text-blue-300">ALL nodes at Level N</strong> before moving to Level N+1.
                                    This is <strong className="text-green-300">Breadth-First</strong>, not Depth-First. No call stack = no stack overflow!
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
                                <div className="text-slate-600 italic">Waiting for execution...</div>
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
