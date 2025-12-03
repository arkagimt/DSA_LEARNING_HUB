import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Code, Cpu, Network, Server, Play,
  RotateCcw, Activity, ArrowRight, HardDrive, Pause, Search, Zap,
  ChevronRight, Hash, MoveHorizontal, Maximize2, GitBranch, AlertCircle,
  ChevronDown, ChevronUp, BookOpen, TrendingUp
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TwoPointersModule } from './TwoPointersModule';
import { SlidingWindowModule } from './SlidingWindowModule';
import { StacksQueuesModule } from './StacksQueuesModule';
import { RecursionModule } from './RecursionModule';
import { HeapModule } from './HeapModule';
import { BinarySearchModule } from './BinarySearchModule';

// --- Types & Constants ---
const SAMPLE_DATA = [101, 102, 103, 101, 104];
const ANIMATION_SPEED = 1200; // ms per step

type ModuleType = 'home' | 'arrays' | 'twopointers' | 'slidingwindow' | 'stacksqueues' | 'recursion' | 'heaps' | 'binarysearch';



// --- Helper Components ---

const PanelHeader = ({ title, icon, sub, color }: any) => (
  <div className={`absolute top-0 left-0 px-4 py-2 rounded-br-xl border-r border-b ${color} text-xs font-mono font-bold flex items-center gap-2 z-10 bg-slate-900/90 backdrop-blur-sm`}>
    {icon}
    <span className="uppercase tracking-wider">{title}</span>
    <span className="text-slate-500 font-normal normal-case border-l border-slate-700 pl-2 ml-2">{sub}</span>
  </div>
);



const CodeBlock = ({ children, highlight = false }: any) => (
  <div className={`bg-slate-950 p-4 rounded-lg border font-mono text-xs md:text-sm transition-all ${highlight ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-slate-800'
    }`}>
    {children}
  </div>
);

// --- Dashboard Home Component ---
const DashboardHome = ({ onModuleSelect }: { onModuleSelect: (module: ModuleType) => void }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950">
      <div className="p-8 w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">DSA for Data Engineers</h1>
          <p className="text-slate-400 text-lg">Master algorithms through the lens of distributed systems</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onModuleSelect('arrays')}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-left hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
          >
            <Hash size={32} className="text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Arrays & Hashing</h3>
            <p className="text-slate-400 text-sm mb-4">Compare in-memory hash sets vs distributed shuffling</p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
              <span>Start Learning</span>
              <ChevronRight size={14} />
            </div>
          </button>

          <button
            onClick={() => onModuleSelect('twopointers')}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-left hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all group"
          >
            <MoveHorizontal size={32} className="text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">Two Pointers</h3>
            <p className="text-slate-400 text-sm mb-4">Learn in-place deduplication with Read/Write pointers</p>
            <div className="flex items-center gap-2 text-xs text-green-400 font-mono">
              <span>Start Learning</span>
              <ChevronRight size={14} />
            </div>
          </button>

          <button
            onClick={() => onModuleSelect('slidingwindow')}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-left hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all group"
          >
            <Maximize2 size={32} className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Sliding Window</h3>
            <p className="text-slate-400 text-sm mb-4">Learn fixed-size window optimization with Server Health Monitor</p>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
              <span>Start Learning</span>
              <ChevronRight size={14} />
            </div>
          </button>

          <button
            onClick={() => onModuleSelect('recursion')}
            className="bg-slate-900 border border-orange-500/50 hover:border-orange-400 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
          >
            <GitBranch size={32} className="text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Recursion & Backtracking</h3>
            <p className="text-slate-400 text-sm mb-4">Explore BOM explosion with DFS vs SQL CTE</p>
            <div className="flex items-center gap-2 text-xs text-orange-400 font-mono">
              <span>Start Learning</span>
              <ChevronRight size={14} />
            </div>
          </button>

          <button
            onClick={() => onModuleSelect('stacksqueues')}
            className="bg-slate-900 border border-purple-500/50 hover:border-purple-400 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
          >
            <Server size={32} className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Stacks & Queues</h3>
            <p className="text-slate-400 text-sm mb-4">Learn LIFO vs FIFO with Kafka backpressure simulation</p>
            <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
              <span>Start Learning</span>
              <ChevronRight size={14} />
            </div>
          </button>

          <button
            onClick={() => onModuleSelect('heaps')}
            className="bg-slate-900 border border-pink-500/50 hover:border-pink-400 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
          >
            <TrendingUp size={32} className="text-pink-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Heaps & Priority Queues</h3>
            <p className="text-slate-400 text-sm mb-4">HPC job scheduler with Top-N pushdown optimization</p>
            <div className="flex items-center gap-2 text-xs text-pink-400 font-mono">
              <span>Start Learning</span>
              <ChevronRight size={14} />
            </div>
          </button>

          <button
            onClick={() => onModuleSelect('binarysearch')}
            className="bg-slate-900 border border-indigo-500/50 hover:border-indigo-400 rounded-xl p-6 text-left transition-all hover:scale-[1.02]"
          >
            <Search size={32} className="text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Binary Search</h3>
            <p className="text-slate-400 text-sm mb-4">O(log N) lookup with Snowflake partition pruning</p>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
              <span>Start Learning</span>
              <ChevronRight size={14} />
            </div>
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" /> Why This Matters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
            <div>
              <div className="font-bold text-blue-300 mb-1">🎯 Interview Prep</div>
              <p className="text-xs text-slate-400">Understand the "why" behind algorithm choices in production systems</p>
            </div>
            <div>
              <div className="font-bold text-green-300 mb-1">💰 Cost Optimization</div>
              <p className="text-xs text-slate-400">Learn when O(N) becomes expensive in cloud data warehouses</p>
            </div>
            <div>
              <div className="font-bold text-purple-300 mb-1">🚀 Scale Thinking</div>
              <p className="text-xs text-slate-400">Bridge the gap between local algorithms and distributed execution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Arrays & Hashing Module Component ---
const ArraysHashingModule = ({ onBackToDashboard }: { onBackToDashboard: () => void }) => {
  // Global State
  const [inputStr, setInputStr] = useState(SAMPLE_DATA.join(", "));
  const [data, setData] = useState<number[]>(SAMPLE_DATA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pythonStep, setPythonStep] = useState(0);
  const [pythonComplete, setPythonComplete] = useState(false);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);
  const [snowflakeTriggered, setSnowflakeTriggered] = useState(false);
  const [shufflePhase, setShufflePhase] = useState<'idle' | 'shuffling' | 'complete'>('idle');

  // Python Enhancement: CPU Cycle Counter & Execution Log
  const [cpuCycles, setCpuCycles] = useState(0);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  // Snowflake Enhancement: Network Bandwidth Meter
  const [networkBandwidth, setNetworkBandwidth] = useState(0);

  // Complexity State
  const [nValue, setNValue] = useState(1000);
  const [showSpaceComplexity, setShowSpaceComplexity] = useState(false);

  // UI State
  const [showDistinctTooltip, setShowDistinctTooltip] = useState(false);
  const [showTheoryDeck, setShowTheoryDeck] = useState(false);

  // Derived State - Python Hash Set
  const pythonHashSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i <= pythonStep && i < data.length; i++) {
      if (foundIndex !== null && i >= foundIndex) break;
      s.add(data[i]);
    }
    return Array.from(s);
  }, [pythonStep, data, foundIndex]);

  // Derived State - Snowflake Partitions
  const partitions = useMemo(() => {
    return [
      data.filter((_, i) => i % 2 === 0),
      data.filter((_, i) => i % 2 === 1)
    ];
  }, [data]);

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
      alert("Invalid format. Use: 101, 102, 103");
    }
  };

  const reset = () => {
    setPythonStep(0);
    setPythonComplete(false);
    setIsPlaying(false);
    setFoundIndex(null);
    setSnowflakeTriggered(false);
    setShufflePhase('idle');
    setCpuCycles(0);
    setExecutionLog([]);
    setNetworkBandwidth(0);
  };

  const runSnowflakeQuery = () => {
    setSnowflakeTriggered(true);
    setShufflePhase('shuffling');

    // Animate network bandwidth spike
    let bandwidthInterval: any;
    let elapsed = 0;
    const duration = 2500;

    bandwidthInterval = setInterval(() => {
      elapsed += 50;
      const progress = elapsed / duration;

      // Create a dramatic spike: ramp up quickly, sustain, then drop
      let bandwidth;
      if (progress < 0.2) {
        bandwidth = Math.floor((progress / 0.2) * 95); // Ramp up to 95%
      } else if (progress < 0.8) {
        bandwidth = 85 + Math.floor(Math.random() * 15); // Fluctuate 85-100%
      } else {
        bandwidth = Math.floor((1 - (progress - 0.8) / 0.2) * 95); // Drop to 0%
      }

      setNetworkBandwidth(Math.max(0, Math.min(100, bandwidth)));

      if (elapsed >= duration) {
        clearInterval(bandwidthInterval);
        setNetworkBandwidth(0);
      }
    }, 50);

    // Simulate shuffle duration
    setTimeout(() => {
      setShufflePhase('complete');
      // Find duplicate in Snowflake way
      const seen = new Set();
      for (let i = 0; i < data.length; i++) {
        if (seen.has(data[i])) {
          setFoundIndex(i);
          break;
        }
        seen.add(data[i]);
      }
    }, duration);
  };

  // Python Animation Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && !pythonComplete) {
      interval = setInterval(() => {
        setPythonStep(prev => {
          // Increment CPU Cycle
          setCpuCycles(c => c + 1);

          // Check if we've reached the end
          if (prev >= data.length - 1) {
            setIsPlaying(false);
            setPythonComplete(true);
            setExecutionLog(log => [...log, `✓ Scan complete. Total cycles: ${cpuCycles + 1}`]);
            return prev;
          }

          // Check if current value is a duplicate
          const currentVal = data[prev];
          const previousItems = data.slice(0, prev);
          const isInSet = previousItems.includes(currentVal);

          // Update execution log
          setExecutionLog(log => [
            ...log,
            `Checking index [${prev}]... Value ${currentVal} in Set? ${isInSet ? 'YES ⚠️' : 'NO'}`
          ].slice(-5)); // Keep only last 5 entries

          if (isInSet) {
            setFoundIndex(prev);
            setIsPlaying(false);
            setPythonComplete(true);
            setExecutionLog(log => [...log, `🔴 DUPLICATE FOUND! Terminating early.`].slice(-5));
            return prev;
          }

          return prev + 1;
        });
      }, ANIMATION_SPEED);
    }
    return () => clearInterval(interval);
  }, [isPlaying, pythonComplete, data, cpuCycles]);

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
        hashing: n, // O(N) time
        bruteforce: Math.floor((n * n) / 1000), // O(N^2) time - scaled for visibility
        hashingSpace: n, // O(N) space in RAM
        shuffleSpace: Math.floor(n * 0.3), // O(N) but with disk spill ~30% overhead
      });
    }
    return points;
  }, [nValue]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">

      {/* Top Controls */}
      <div className="p-6 border-b border-slate-800 bg-slate-950 sticky top-0 z-20 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 w-full">
          {/* Back to Dashboard Button */}
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all self-start shadow-sm"
          >
            <ArrowRight size={16} className="rotate-180" />
            <span className="text-sm">Back to Dashboard</span>
          </button>

          {/* Main Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                IoT Sensor Stream Deduplication
                {foundIndex !== null && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full font-mono"
                  >
                    DUPLICATE FOUND AT INDEX {foundIndex}
                  </motion.span>
                )}
              </h1>
              <p className="text-sm text-slate-400 font-mono">Scenario: Detect duplicate sensor_id in streaming data</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
              <input
                className="bg-transparent border-none text-white font-mono text-sm focus:ring-0 w-48"
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder="101, 102, 103..."
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
          className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl overflow-hidden"
          initial={false}
        >
          <button
            onClick={() => setShowTheoryDeck(!showTheoryDeck)}
            className="w-full flex items-center justify-between p-6 hover:bg-blue-900/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={24} className="text-blue-400" />
              <h3 className="text-xl font-bold text-white">Theory Deck: Arrays & Hashing Pattern</h3>
            </div>
            {showTheoryDeck ? <ChevronUp className="text-blue-400" /> : <ChevronDown className="text-blue-400" />}
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
                <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {/* Concept: RAM Direct Access */}
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-bold text-blue-300 mb-3 flex items-center gap-2">
                      <Code size={16} />
                      The Concept
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      <strong className="text-blue-400">RAM Direct Access:</strong> Using a hash set/dictionary allows us to check if an element exists in <strong className="text-green-400">O(1)</strong> time—instant lookup!
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      <strong className="text-red-400">Linear Scan:</strong> Without hashing, we'd need to check every element sequentially—<strong className="text-red-400">O(N)</strong> time.
                    </p>
                    <div className="text-xs text-slate-500 bg-slate-800/50 p-2 rounded font-mono">
                      seen = set()<br />
                      if val in seen:  # O(1) lookup<br />
                      &nbsp;&nbsp;return "duplicate"
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
                        <div className="text-green-400 font-bold">Hashing: O(1) per lookup</div>
                        <div className="text-xs text-slate-400">Direct memory access via hash function</div>
                      </div>
                      <div>
                        <div className="text-red-400 font-bold">Linear Search: O(N) per lookup</div>
                        <div className="text-xs text-slate-400">Must scan through entire array</div>
                      </div>
                      <div className="bg-orange-900/20 border border-orange-500/30 rounded p-2">
                        <div className="text-orange-300 font-bold mb-1">Overall Complexity</div>
                        <div className="text-xs text-slate-400">
                          Hashing: <strong className="text-green-300">O(N)</strong> total<br />
                          Brute Force: <strong className="text-red-300">O(N²)</strong> total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Visual: Array Direct Access */}
                  <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-2">
                      <Zap size={16} />
                      Interactive: Direct Access
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Accessing index[4] in an array is <strong className="text-cyan-300">instant</strong>—no matter the array size!
                    </p>
                    <div className="grid grid-cols-5 gap-1 mb-3">
                      {[10, 20, 30, 40, 50].map((val, idx) => (
                        <div
                          key={idx}
                          className={`h-10 flex items-center justify-center text-xs font-mono font-bold rounded transition-all ${idx === 4
                            ? 'bg-cyan-500/30 border-2 border-cyan-400 text-cyan-300 scale-110'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                            }`}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-center text-slate-500 font-mono mb-2">
                      [0] [1] [2] [3] [4] ← Direct jump to index 4
                    </div>
                    <div className="text-xs text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 rounded p-2">
                      <strong>Hash Table:</strong> Converts key → index instantly using a hash function.
                    </div>
                  </div>

                  {/* DE Insight: Data Skew */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 md:col-span-2 lg:col-span-3">
                    <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                      <AlertCircle size={14} />
                      DE Insight: Data Skew (Hot Partitions)
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      In distributed systems like <strong className="text-blue-300">Snowflake</strong> or <strong className="text-blue-300">Spark</strong>,
                      data is partitioned by hashing keys. If keys aren't distributed evenly, one node gets overloaded—this is called a <strong className="text-orange-300">"Hot Partition"</strong>.
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                        <div className="font-bold text-green-400 mb-1">Node 1 (20%)</div>
                        <div className="text-slate-400">Balanced load</div>
                      </div>
                      <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                        <div className="font-bold text-green-400 mb-1">Node 2 (25%)</div>
                        <div className="text-slate-400">Balanced load</div>
                      </div>
                      <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                        <div className="font-bold text-red-400 mb-1">Node 3 (55%) 🔥</div>
                        <div className="text-slate-400">Hot Partition!</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      <strong className="text-orange-300">Solution:</strong> Use composite keys or salting to distribute data more evenly across nodes.
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- The Dual Engine Visualization --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">

          {/* LEFT: Python / Single Node */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
            <PanelHeader
              title="Python Engine"
              icon={<Code size={14} />}
              sub="Sequential Iteration (CPU Bound)"
              color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            />

            <div className="p-8 mt-12 flex-1 flex flex-col gap-6">
              {/* CPU Cycle Counter */}
              <div className="flex items-center justify-between bg-emerald-900/20 border border-emerald-500/30 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300">CPU Cycles</span>
                </div>
                <motion.div
                  key={cpuCycles}
                  initial={{ scale: 1.3, color: '#10b981' }}
                  animate={{ scale: 1, color: '#a3e635' }}
                  className="text-2xl font-mono font-bold text-emerald-400"
                >
                  {cpuCycles}
                </motion.div>
              </div>

              {/* 1. The Array with Pointer */}
              <div className="relative pt-8">
                <div className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                  <ArrowRight size={12} /> Iterating Array (Left to Right)
                </div>
                <div className="flex justify-center gap-2">
                  {data.map((val, idx) => (
                    <div key={idx} className="relative">
                      <motion.div
                        animate={{
                          scale: idx === pythonStep && isPlaying ? 1.15 : 1,
                          backgroundColor:
                            foundIndex === idx ? 'rgba(239, 68, 68, 0.3)' :
                              idx === pythonStep ? 'rgba(16, 185, 129, 0.2)' :
                                idx < pythonStep ? 'rgba(30, 41, 59, 0.5)' :
                                  'rgba(30, 41, 59, 1)',
                          borderColor:
                            foundIndex === idx ? '#ef4444' :
                              idx === pythonStep ? '#10b981' :
                                '#334155'
                        }}
                        className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 text-lg font-mono font-bold transition-all
                          ${foundIndex === idx ? 'text-red-400 shadow-lg shadow-red-500/30' : 'text-slate-300'}
                        `}
                      >
                        {val}
                      </motion.div>

                      {/* Active Pointer */}
                      {idx === pythonStep && isPlaying && (
                        <motion.div
                          layoutId="python-ptr"
                          className="absolute -top-7 left-1/2 -translate-x-1/2 text-emerald-400 flex flex-col items-center"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                        >
                          <span className="text-[10px] font-mono font-bold bg-emerald-900/50 px-2 py-0.5 rounded">i={idx}</span>
                          <div className="w-0.5 h-3 bg-emerald-500 mt-1"></div>
                        </motion.div>
                      )}

                      {/* Index Label */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 font-mono">
                        [{idx}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. The Logic Trace */}
              <CodeBlock highlight={isPlaying}>
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px]"># Check if current value exists in hash set</div>
                  <div className={`transition-all ${pythonStep > 0 && foundIndex === null ? 'text-emerald-400 font-bold' : 'text-slate-600'
                    }`}>
                    if data[{pythonStep}] not in seen:
                  </div>
                  <div className={`pl-4 transition-all ${pythonStep > 0 && foundIndex === null ? 'text-emerald-300' : 'text-slate-600'
                    }`}>
                    seen.add({data[pythonStep]})  <span className="text-slate-600"># O(1) insertion</span>
                  </div>
                  <div className={`mt-2 transition-all ${foundIndex !== null ? 'text-red-400 font-bold bg-red-900/20 px-2 py-1 rounded border border-red-500/30' : 'text-slate-600'
                    }`}>
                    else:
                  </div>
                  <div className={`pl-4 transition-all ${foundIndex !== null ? 'text-red-300' : 'text-slate-600'
                    }`}>
                    return True  <span className="text-slate-600"># Duplicate detected!</span>
                  </div>
                </div>
              </CodeBlock>

              {/* Execution Log */}
              <div className="bg-slate-950 rounded-lg border border-emerald-500/30 p-3 min-h-[120px] max-h-[120px] overflow-y-auto">
                <div className="text-[10px] uppercase text-emerald-500 font-bold mb-2 flex items-center gap-2">
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
                        className={`${log.includes('YES') ? 'text-red-400' :
                          log.includes('DUPLICATE') ? 'text-red-500 font-bold' :
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

              {/* 3. The Hash Table (Memory) */}
              <div className="flex-1 bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 relative min-h-[180px]">
                <div className="absolute top-2 left-2 text-[10px] uppercase text-slate-500 font-bold flex items-center gap-2">
                  <Cpu size={12} className="animate-pulse text-purple-500" /> RAM - Hash Set (In-Memory)
                </div>
                <div className="mt-8 flex flex-wrap content-start gap-2">
                  <AnimatePresence>
                    {pythonHashSet.map((val, idx) => (
                      <motion.div
                        key={val}
                        initial={{ scale: 0, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                          delay: idx * 0.1
                        }}
                        className="px-3 py-2 bg-purple-900/40 border border-purple-500/40 text-purple-300 rounded-lg text-sm font-mono shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow"
                      >
                        <span className="text-[10px] text-purple-500 mr-2 opacity-70">hash({val}) →</span>
                        <span className="font-bold">{val}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-slate-500 font-mono">
                  Space: O(N) | Lookup: O(1)
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Snowflake / Distributed */}
          <div className="bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden flex flex-col shadow-2xl">
            <PanelHeader
              title="Snowflake Engine"
              icon={<Server size={14} />}
              sub="Distributed Set Operations (Network Bound)"
              color="bg-blue-500/10 text-blue-400 border-blue-500/20"
            />

            <div className="p-8 mt-12 flex-1 flex flex-col relative">

              {/* Network Bandwidth Meter */}
              <div className="mb-6 bg-blue-900/20 border border-blue-500/30 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Network size={16} className="text-blue-400" />
                    <span className="text-sm font-bold text-blue-300">Network Bandwidth</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-blue-400">
                    {networkBandwidth}%
                  </div>
                </div>
                <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    animate={{
                      width: `${networkBandwidth}%`,
                      backgroundColor: networkBandwidth > 80 ? '#ef4444' : networkBandwidth > 50 ? '#f59e0b' : '#3b82f6'
                    }}
                    transition={{ duration: 0.1 }}
                  />
                  {networkBandwidth > 70 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 italic">
                  💡 In distributed systems, compute is fast, but moving data (shuffle) is slow and costly
                </div>
              </div>

              {/* 1. Storage Layer - Micro-partitions */}
              <div className="mb-8">
                <div className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                  <HardDrive size={12} /> Cloud Storage Layer (S3/Azure Blob)
                </div>
                <div className="flex justify-around items-start">
                  {partitions.map((partition, pIdx) => (
                    <div key={pIdx} className="relative group">
                      <div className="text-[10px] text-slate-500 uppercase mb-2 text-center font-mono">
                        Partition-{pIdx + 1}.parquet
                      </div>
                      <motion.div
                        className={`w-32 h-24 bg-slate-800 border rounded-lg p-2 grid grid-cols-2 gap-1.5 ${shufflePhase === 'shuffling' ? 'border-blue-500/50' : 'border-slate-600'
                          }`}
                        animate={{
                          borderColor: shufflePhase === 'shuffling' ? '#3b82f6' : '#475569'
                        }}
                      >
                        {partition.map((val, i) => (
                          <div
                            key={i}
                            className={`h-8 bg-slate-700 rounded text-[10px] flex items-center justify-center text-slate-400 font-mono transition-all ${shufflePhase !== 'idle' ? 'opacity-30' : 'opacity-100'
                              }`}
                          >
                            {val}
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. The Network Exchange (Animation Zone) - FIXED HEIGHT */}
              <div className="flex-1 relative border-y border-dashed border-slate-700 bg-gradient-to-b from-slate-950/50 to-slate-900/50 flex items-center justify-center overflow-hidden min-h-[280px]">

                {/* Status Badge - FIXED POSITION */}
                <AnimatePresence mode="wait">
                  {shufflePhase === 'shuffling' && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="absolute left-1/2 top-8 -translate-x-1/2 text-xs text-blue-400 font-bold bg-blue-900/50 border border-blue-500/70 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/30 z-[70] backdrop-blur-sm"
                    >
                      <Network size={14} className="animate-pulse" />
                      NETWORK SHUFFLE IN PROGRESS
                      <Zap size={14} className="text-yellow-400 animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Flying Data Animation - FIXED SPACING */}
                <AnimatePresence>
                  {shufflePhase === 'shuffling' && (
                    <>
                      {/* Connection Lines showing data movement */}
                      {data.map((val, i) => {
                        const startX = i % 2 === 0 ? -35 : 35;


                        return (
                          <motion.div
                            key={`line-${val}-${i}`}
                            className="absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-blue-500/0 via-blue-400 to-blue-500/0"
                            initial={{
                              width: 0,
                              x: `${startX}%`,
                              opacity: 0
                            }}
                            animate={{
                              width: '60%',
                              x: `${startX}%`,
                              opacity: [0, 0.8, 0.8, 0],
                            }}
                            transition={{
                              duration: 1.8,
                              delay: i * 0.08,
                              ease: "easeInOut"
                            }}
                            style={{
                              transform: `translateY(${(i - data.length / 2) * 40}px)`,
                              zIndex: 5
                            }}
                          />
                        );
                      })}

                      {/* Data packets flying simultaneously - BETTER SPACING */}
                      {data.map((val, i) => {
                        const targetNode = val % 2;
                        const xStart = i % 2 === 0 ? -35 : 35;
                        const xEnd = targetNode === 0 ? -25 : 25;
                        // FIXED: Much more vertical spacing
                        const yStart = -60 + (i * 15); // Changed from -40 + (i * 5)
                        const yEnd = 60 - (i * 15); // Changed from 50 + (i % 3) * 10

                        return (
                          <motion.div
                            key={`shuffle-${val}-${i}`}
                            initial={{
                              x: `${xStart}%`,
                              y: yStart,
                              opacity: 0,
                              scale: 0.3
                            }}
                            animate={{
                              x: `${xEnd}%`,
                              y: yEnd,
                              opacity: [0, 1, 1, 0.9],
                              scale: [0.3, 1.2, 1],
                              rotate: [0, 180, 360]
                            }}
                            transition={{
                              duration: 1.8,
                              delay: i * 0.08,
                              ease: "easeInOut"
                            }}
                            className="absolute top-1/2 left-1/2 -mt-5 -ml-5 w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-[0_0_25px_rgba(59,130,246,0.8)] border-2 border-blue-300 z-20"
                          >
                            {val}
                            {/* Pulsing network trail */}
                            <motion.div
                              className="absolute inset-0 rounded-lg border-2 border-cyan-400"
                              animate={{
                                scale: [1, 1.8, 2.2],
                                opacity: [0.7, 0.3, 0]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                            />
                            {/* Data packet indicator */}
                            <motion.div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.6, 1]
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity
                              }}
                            />
                          </motion.div>
                        )
                      })}
                    </>
                  )}
                </AnimatePresence>

                {/* Completion Message - FIXED POSITION */}
                <AnimatePresence mode="wait">
                  {shufflePhase === 'complete' && foundIndex !== null && (
                    <motion.div
                      key="duplicate-message"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 border-2 border-red-500 px-6 py-3 rounded-lg text-red-400 font-bold text-sm z-[80] shadow-2xl shadow-red-500/50 backdrop-blur-sm"
                    >
                      ⚠️ Duplicate Detected During Merge Phase
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Idle State */}
                {shufflePhase === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-600 text-sm font-mono flex flex-col items-center gap-2"
                  >
                    <Server size={32} className="opacity-30" />
                    <span>Waiting for query execution...</span>
                  </motion.div>
                )}
              </div>

              {/* 3. Compute Nodes */}
              <div className="mt-8">
                <div className="text-xs text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                  <Cpu size={12} /> Virtual Warehouse (Compute Cluster)
                </div>
                <div className="flex justify-around items-start">
                  {[0, 1].map(n => (
                    <motion.div
                      key={n}
                      className="flex flex-col items-center gap-2"
                      animate={{
                        scale: shufflePhase === 'shuffling' ? 1.05 : 1
                      }}
                    >
                      <Server
                        size={24}
                        className={`transition-all ${shufflePhase === 'shuffling' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-slate-600'
                          }`}
                      />
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Worker-{n + 1}</div>
                      <div className="text-[9px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded font-mono">
                        hash(key) % 2 = {n}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- "Why not just use DISTINCT?" Educational Section --- */}
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-yellow-400" />
                <h3 className="text-xl font-bold text-white">The Critical Question: "Why not just use DISTINCT?"</h3>
              </div>
              <button
                onClick={() => setShowDistinctTooltip(!showDistinctTooltip)}
                className="text-xs bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-500/30 px-3 py-1.5 rounded text-yellow-300 transition-all"
              >
                {showDistinctTooltip ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            <AnimatePresence>
              {showDistinctTooltip && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code size={16} className="text-emerald-400" />
                        <h4 className="font-bold text-emerald-300">Python Hash Set</h4>
                      </div>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span><strong>Pros:</strong> Lightning fast O(1) lookups, minimal overhead</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">✗</span>
                          <span><strong>Cons:</strong> Limited by single machine RAM (~64GB typical)</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 font-mono bg-slate-800/50 p-2 rounded">
                          Max Dataset: ~100M rows before memory pressure
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={16} className="text-blue-400" />
                        <h4 className="font-bold text-blue-300">SQL DISTINCT</h4>
                      </div>
                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span><strong>Pros:</strong> Scalable to petabytes via distributed compute</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-red-400">✗</span>
                          <span><strong>Cons:</strong> ALWAYS triggers network shuffle (expensive!)</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 font-mono bg-slate-800/50 p-2 rounded">
                          Cost: $$$$ due to data movement across nodes
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-yellow-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-yellow-400" />
                        <h4 className="font-bold text-yellow-300">The Tradeoff</h4>
                      </div>
                      <div className="space-y-2 text-sm text-slate-300">
                        <p><strong>When to use Hash Set:</strong> Fits in memory, need speed</p>
                        <p><strong>When to use DISTINCT:</strong> Data {">"} RAM, need scale</p>
                        <div className="text-xs text-yellow-400 mt-2 bg-yellow-900/20 border border-yellow-500/30 p-2 rounded">
                          ⚠️ Interview Insight: Understanding this tradeoff separates senior engineers from juniors
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                      <Network size={16} />
                      The Hidden Cost of Network Shuffle
                    </h4>
                    <p className="text-sm text-slate-300 mb-3">
                      In distributed systems like Snowflake/Spark, <code className="bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-mono">DISTINCT</code> requires
                      moving data across the network to group identical values on the same node. This is called a <strong>"shuffle"</strong>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                        <div className="font-mono text-slate-500 mb-1">-- Snowflake Query Plan</div>
                        <div className="font-mono text-blue-300">
                          1. SCAN micro-partitions<br />
                          2. <span className="text-yellow-400 font-bold">SHUFFLE by hash(sensor_id)</span> ← Expensive!<br />
                          3. GROUP BY on each node<br />
                          4. MERGE results
                        </div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                        <div className="font-bold text-red-400 mb-2">Real Cost Example (1TB data):</div>
                        <div className="space-y-1 text-slate-300">
                          <div>• Network I/O: ~500GB transferred</div>
                          <div>• Time penalty: 10-100x slower</div>
                          <div>• $ Cost: 5-10x higher warehouse credits</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showDistinctTooltip && (
              <p className="text-slate-400 text-sm">
                Click "Show Details" to understand why <code className="bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-mono">DISTINCT</code> isn't
                always the answer, and how network shuffle costs impact production systems at scale.
              </p>
            )}
          </div>
        </div>

        {/* --- SQL Query Display --- */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database size={18} /> Snowflake SQL Query
            </h3>
            <button
              onClick={runSnowflakeQuery}
              disabled={shufflePhase !== 'idle' || !pythonComplete}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded font-bold text-sm transition-all"
            >
              <Play size={14} /> Run Snowflake Query
            </button>
          </div>
          <CodeBlock>
            <pre className="text-blue-300">
              {`-- Distributed deduplication using GROUP BY
-- This triggers a NETWORK SHUFFLE across compute nodes

SELECT sensor_id, COUNT(*) as cnt
FROM iot_stream
GROUP BY sensor_id
HAVING COUNT(*) > 1;

-- Behind the scenes:
-- 1. Read from micro-partitions (S3/Azure Blob)
-- 2. Hash partition by sensor_id → Network shuffle
-- 3. Each worker node groups its partition
-- 4. Merge results to find duplicates`}
            </pre>
          </CodeBlock>
        </div>

        {/* --- Bottom: The Math & Scale Dashboard --- */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Controls & Metrics */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {showSpaceComplexity ? 'Space' : 'Time'} Complexity Analysis
                  </h3>
                  <button
                    onClick={() => setShowSpaceComplexity(!showSpaceComplexity)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded font-bold text-white transition-all flex items-center gap-2"
                  >
                    <Database size={12} />
                    {showSpaceComplexity ? 'Show Time' : 'Show Space'}
                  </button>
                </div>
                <p className="text-sm text-slate-400">
                  {showSpaceComplexity
                    ? 'Compare memory/storage requirements'
                    : 'See how execution time scales with dataset size'}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <label className="text-xs text-slate-500 font-bold uppercase mb-3 block">
                  Dataset Size (N): {nValue.toLocaleString()} rows
                </label>
                <input
                  type="range" min="100" max="10000" step="100"
                  value={nValue} onChange={(e) => setNValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-mono">
                  <span>100</span>
                  <span>1K</span>
                  <span>5K</span>
                  <span>10K</span>
                </div>
              </div>

              <div className="space-y-3">
                {!showSpaceComplexity ? (
                  <>
                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                      <span className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
                        <span className="text-slate-300">Hashing (Python)</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">O(N)</span>
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
                        <span className="text-slate-300">Hash Set (RAM)</span>
                      </span>
                      <span className="font-mono font-bold text-purple-400">O(N)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-950 rounded border border-slate-800">
                      <span className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"></div>
                        <span className="text-slate-300">Shuffle (Disk)</span>
                      </span>
                      <span className="font-mono font-bold text-orange-400">O(N)</span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="text-xs font-bold text-blue-400 mb-1">💡 Key Insight</div>
                {!showSpaceComplexity ? (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    At N=10,000: Hashing does 10K ops, Brute Force does 100M ops.
                    That's a <strong className="text-blue-300">10,000x difference</strong>!
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Hash Set keeps data in <strong className="text-purple-300">RAM (fast)</strong>.
                    Shuffle writes to <strong className="text-orange-300">disk (slow)</strong> when memory is full—adding 30%+ overhead.
                  </p>
                )}
              </div>
            </div>

            {/* The Graph */}
            <div className="flex-1 h-80 bg-slate-950 rounded-lg border border-slate-800 p-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorHashing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBrute" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHashSpace" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorShuffleSpace" x1="0" y1="0" x2="0" y2="1">
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
                      value: showSpaceComplexity ? 'Storage (MB)' : 'Operations',
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
                        dataKey="hashing"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorHashing)"
                        name="O(N) - Hashing"
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
                        dataKey="hashingSpace"
                        stroke="#a855f7"
                        strokeWidth={3}
                        fill="url(#colorHashSpace)"
                        name="Hash Set (RAM) - O(N)"
                      />
                      <Area
                        type="monotone"
                        dataKey="shuffleSpace"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fill="url(#colorShuffleSpace)"
                        name="Shuffle (Disk Spill) - O(N)"
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
                {showSpaceComplexity
                  ? '💾 Hash Set uses RAM; Shuffle spills to disk when memory full'
                  : '⚡ Time complexity comparison'}
              </div>
            </div>
          </div>
        </div>

        {/* --- Theory Footer --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-purple-500/30 transition-all">
            <div className="flex items-start gap-3 mb-2">
              <Cpu size={16} className="text-purple-400 mt-0.5" />
              <strong className="text-slate-200">Why O(N) Space?</strong>
            </div>
            <p className="text-slate-400 leading-relaxed">
              To achieve O(1) lookup time, we trade memory. Each unique key must be stored in RAM.
              In Snowflake, if the hash table exceeds available memory, it <span className="text-red-400 font-semibold">"spills to disk"</span>,
              causing massive slowdowns (100-1000x).
            </p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-blue-500/30 transition-all">
            <div className="flex items-start gap-3 mb-2">
              <Network size={16} className="text-blue-400 mt-0.5" />
              <strong className="text-slate-200">The "Shuffle" Tax</strong>
            </div>
            <p className="text-slate-400 leading-relaxed">
              See those flying particles in the Snowflake panel? That's network I/O.
              In distributed systems, <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono text-[10px]">shuffling</code> data
              across nodes is often <span className="text-yellow-400 font-semibold">slower than processing it</span>. This is why partition pruning matters.
            </p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition-all">
            <div className="flex items-start gap-3 mb-2">
              <Activity size={16} className="text-emerald-400 mt-0.5" />
              <strong className="text-slate-200">Real World Impact</strong>
            </div>
            <p className="text-slate-400 leading-relaxed">
              For a 1TB dataset with O(N²) logic: <span className="text-red-400 font-semibold">~31,000 years</span> to complete.
              With O(N) hashing: <span className="text-emerald-400 font-semibold">~5 minutes</span>.
              This is why we interview for DSA—not for puzzles, but for <strong className="text-white">survival at scale</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Main App Component with Router ---
export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('home');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Main Content Area - Full Width */}
      <AnimatePresence mode="wait">
        {currentModule === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <DashboardHome onModuleSelect={setCurrentModule} />
          </motion.div>
        )}

        {currentModule === 'arrays' && (
          <motion.div
            key="arrays"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <ArraysHashingModule onBackToDashboard={() => setCurrentModule('home')} />
          </motion.div>
        )}

        {currentModule === 'twopointers' && (
          <motion.div
            key="twopointers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <TwoPointersModule onBackToDashboard={() => setCurrentModule('home')} />
          </motion.div>
        )}

        {currentModule === 'slidingwindow' && (
          <motion.div
            key="slidingwindow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <SlidingWindowModule onBackToDashboard={() => setCurrentModule('home')} />
          </motion.div>
        )}

        {currentModule === 'stacksqueues' && (
          <motion.div
            key="stacksqueues"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StacksQueuesModule onBackToDashboard={() => setCurrentModule('home')} />
          </motion.div>
        )}

        {currentModule === 'recursion' && (
          <motion.div
            key="recursion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <RecursionModule onBackToDashboard={() => setCurrentModule('home')} />
          </motion.div>
        )}

        {currentModule === 'heaps' && (
          <motion.div
            key="heaps"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HeapModule onBackToDashboard={() => setCurrentModule('home')} />
          </motion.div>
        )}

        {currentModule === 'binarysearch' && (
          <motion.div
            key="binarysearch"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BinarySearchModule onBackToDashboard={() => setCurrentModule('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}