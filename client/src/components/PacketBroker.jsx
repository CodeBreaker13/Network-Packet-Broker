import { useState, useEffect, useRef, useCallback } from "react";

// ─── Pure DSA: Max-Heap ───────────────────────────────────────────────────────
function siftUp(heap, i) {
  while (i > 0) {
    const par = Math.floor((i - 1) / 2);
    if (heap[par].priority < heap[i].priority) {
      [heap[par], heap[i]] = [heap[i], heap[par]];
      i = par;
    } else break;
  }
}

function siftDown(heap, i) {
  const n = heap.length;
  while (true) {
    let best = i;
    const l = 2 * i + 1,
      r = 2 * i + 2;
    if (l < n && heap[l].priority > heap[best].priority) best = l;
    if (r < n && heap[r].priority > heap[best].priority) best = r;
    if (best === i) break;
    [heap[best], heap[i]] = [heap[i], heap[best]];
    i = best;
  }
}

function heapInsert(heap, pkt) {
  const h = [...heap, pkt];
  siftUp(h, h.length - 1);
  return h;
}

function heapExtract(heap) {
  if (!heap.length) return [heap, null];
  if (heap.length === 1) return [[], heap[0]];
  const h = [...heap];
  const max = h[0];
  h[0] = h[h.length - 1];
  h.pop();
  siftDown(h, 0);
  return [h, max];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BW_LIMIT = 100;
const NAMES = [
  "DNS_QUERY",
  "TCP_SYN",
  "HTTP_GET",
  "BGP_UPDATE",
  "ICMP_PING",
  "OSPF_HELLO",
  "ARP_REQUEST",
  "TLS_HANDSHAKE",
  "UDP_STREAM",
  "SSH_SESSION",
];
const priLabel = ["", "LOW", "MEDIUM", "HIGH"];
const priChar = (p) => (p === 3 ? "H" : p === 2 ? "M" : "L");
const rndName = () => NAMES[Math.floor(Math.random() * NAMES.length)];
let _pktCounter = 0;

function makePkt(name, size, pri) {
  _pktCounter++;
  return {
    id: "PKT-" + String(_pktCounter).padStart(4, "0"),
    name,
    size: parseInt(size),
    priority: parseInt(pri),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Ticker({ injected, processed, dropped, heapLen }) {
  const items = [
    { color: "text-emerald-400", text: "CORE_STATUS: NOMINAL" },
    { color: "text-emerald-400", text: "MAX_HEAP_COMPLEXITY: O(log n)" },
    { color: "text-purple-400", text: "QUEUE_POLICY: TAIL-DROP ALGORITHM" },
    { color: "text-amber-400", text: "SHAPING_THRESHOLD: 70MB ACTIVATED" },
    {
      color: "text-white",
      text: `[ INJECTED: ${injected} | PROCESSED: ${processed} | DROPPED: ${dropped} | ACTIVE_HEAP: ${heapLen} ]`,
    },
  ];
  const doubled = [...items, ...items];

  return (
    <div className="w-full bg-emerald-950/60 border-t border-b border-emerald-500/30 overflow-hidden py-1 h-7 flex items-center">
      <div
        className="flex whitespace-nowrap animate-marquee text-[10px] font-mono font-extrabold tracking-widest text-emerald-400 uppercase"
        style={{ animation: "marquee 25s linear infinite" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`mx-4 flex items-center gap-1.5 ${item.color}`}
          >
            <span className="w-1.5 h-1.5 bg-current rounded-full" />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, colorClass, borderClass }) {
  return (
    <div
      className={`bg-[#0f0c1b]/95 border-2 border-purple-900/40 rounded-xl p-5 shadow-lg ${borderClass || ""}`}
    >
      <div
        className={`text-xs font-black uppercase tracking-wider mb-2 ${colorClass || "text-gray-400"}`}
      >
        {label}
      </div>
      <div
        className={`font-mono text-3xl md:text-4xl font-black ${colorClass || "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}

function HeapVis({ heap }) {
  const visible = heap.slice(0, 12);
  const extra = heap.length - 12;
  const nodeColor = (p) =>
    p === 3
      ? "border-rose-500 text-rose-400 bg-rose-950/40"
      : p === 2
        ? "border-amber-500 text-amber-400 bg-amber-950/40"
        : "border-blue-500 text-blue-400 bg-blue-950/40";

  return (
    <div className="bg-[#0f0c1b]/95 border border-purple-900/40 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs font-black text-gray-300 uppercase tracking-widest">
          In-Memory Max-Heap Array Map
        </div>
        <span className="text-xs text-purple-400 font-mono font-extrabold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-900/50">
          index [0] = root
        </span>
      </div>
      <div className="text-xs font-bold text-purple-300/70 mb-4 font-mono tracking-wide">
        Heap Balance Complexity Matrix: O(log n)
      </div>
      <div className="flex flex-wrap gap-2.5 p-4 bg-[#08060f] border-2 border-purple-900/30 rounded-lg min-h-[70px] items-center">
        {visible.length === 0 && (
          <span className="text-xs text-gray-600 italic">Heap empty</span>
        )}
        {visible.map((p, i) => (
          <span
            key={p.id + i}
            className={`text-xs font-black px-2.5 py-1 border-2 rounded-lg font-mono ${nodeColor(p.priority)}`}
          >
            [{i}]={p.id.split("-")[1]}({priChar(p.priority)})
          </span>
        ))}
        {extra > 0 && (
          <span className="text-xs font-black px-2.5 py-1 bg-zinc-900 border-2 border-zinc-700 text-gray-300 rounded-lg font-mono">
            +{extra} MORE
          </span>
        )}
      </div>
    </div>
  );
}

function QueueList({ heap }) {
  const sorted = [...heap].sort((a, b) => b.priority - a.priority);
  const badgeColor = (p) =>
    p === 3
      ? "bg-rose-500/20 text-rose-400 border border-rose-500/50"
      : p === 2
        ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
        : "bg-blue-500/20 text-blue-400 border border-blue-500/50";

  return (
    <div className="bg-[#0f0c1b]/95 border border-purple-900/40 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-black text-gray-300 uppercase tracking-widest">
          Active Queue Content Tree
        </div>
        <span className="font-mono text-xs font-black bg-purple-500/20 border-2 border-purple-500/50 text-purple-300 px-3 py-1 rounded-lg">
          {heap.length} PACKETS
        </span>
      </div>
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scroll">
        {heap.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-8 font-bold italic bg-[#08060f] border border-purple-900/20 rounded-lg">
            Queue stack clear. Inject frame streams to trigger tree.
          </div>
        ) : (
          sorted.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 bg-[#120e24]/95 border-2 border-purple-900/30 rounded-lg text-xs font-bold"
            >
              <span className="text-purple-400/80 text-xs font-black font-mono">
                {p.id}
              </span>
              <span className="text-white font-sans font-extrabold flex-1 px-4 truncate">
                {p.name}
              </span>
              <span className="text-purple-300 mr-4 font-black font-mono">
                {p.size} MB
              </span>
              <span
                className={`px-2.5 py-1 text-[10px] font-black rounded-md tracking-wider ${badgeColor(p.priority)}`}
              >
                {["", "LOW", "MED", "HIGH"][p.priority]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LogEntry({ entry }) {
  const colorClass =
    entry.type === "ok"
      ? "text-emerald-400 font-extrabold"
      : entry.type === "drop"
        ? "text-rose-400 font-extrabold tracking-wide uppercase"
        : "text-amber-400 font-black";

  return (
    <div className="text-xs font-mono font-bold">
      <span className="text-purple-500 font-bold mr-2">[{entry.ts}]</span>
      <span className={colorClass}>{entry.msg}</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [heap, setHeap] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [dropped, setDropped] = useState([]);
  const [totalBW, setTotalBW] = useState(0);
  const [logs, setLogs] = useState([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoTimer = useRef(null);

  // form state
  const [fName, setFName] = useState("DNS_QUERY_VECTOR");
  const [fSize, setFSize] = useState(8);
  const [fPri, setFPri] = useState(2);
  const [fCount, setFCount] = useState(1);

  const addLog = useCallback((msg, type) => {
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setLogs((prev) =>
      [{ msg, type, ts, key: Math.random() }, ...prev].slice(0, 80),
    );
  }, []);

  const runStep = useCallback(() => {
    setHeap((prevHeap) => {
      if (!prevHeap.length) {
        addLog(
          "Queue buffer exhausted. Waiting for new parameter matrices.",
          "warn",
        );
        return prevHeap;
      }
      const [newHeap, pkt] = heapExtract(prevHeap);

      setTotalBW((prevBW) => {
        if (prevBW + pkt.size > BW_LIMIT && pkt.priority === 1) {
          setDropped((d) => [...d, pkt]);
          addLog(
            `💥 TAIL DROP: ${pkt.id} [${pkt.name}] — Low priority bandwidth saturation overflow`,
            "drop",
          );
          // return Math.min(prevBW + pkt.size, 115);
          return prevBW;
        } else if (prevBW + pkt.size > BW_LIMIT && pkt.priority === 2) {
          if (Math.random() < 0.5) {
            setDropped((d) => [...d, pkt]);
            addLog(
              `💥 TAIL DROP: ${pkt.id} [${pkt.name}] — Medium priority critical threshold dropped`,
              "drop",
            );
            return prevBW;
          } else {
            setProcessed((p) => [...p, pkt]);
            addLog(
              `✅ PROCESS: ${pkt.id} [${pkt.name}] ${pkt.size}MB MEDIUM priority accepted`,
              "ok",
            );
            //return Math.min(prevBW + pkt.size, 115);
            return prevBW + pkt.size;
          }
        } else {
          setProcessed((p) => [...p, pkt]);
          addLog(
            `✅ PROCESS: ${pkt.id} [${pkt.name}] ${pkt.size}MB ${priLabel[pkt.priority]} priority cleared`,
            "ok",
          );
          // return Math.min(prevBW + pkt.size, 115);
          return prevBW + pkt.size;
        }
      });

      return newHeap;
    });
  }, [addLog]);

  const inject = useCallback(
    (pkt) => {
      setHeap((prev) => heapInsert(prev, pkt));
      addLog(
        `📥 INJECT: ${pkt.id} [${pkt.name}] ${pkt.size}MB ${priLabel[pkt.priority]} priority queued`,
        "warn",
      );
    },
    [addLog],
  );

  const injectCustom = () => {
    for (let i = 0; i < fCount; i++) {
      inject(makePkt(fName + (fCount > 1 ? `_${i}` : ""), fSize, fPri));
    }
  };

  const simulateBurst = (type) => {
    if (type === "high") {
      for (let i = 0; i < 5; i++)
        inject(makePkt(rndName(), Math.floor(Math.random() * 10 + 2), 3));
    }
    if (type === "mixed") {
      [3, 3, 2, 2, 2, 1, 1, 3].forEach((pri) =>
        inject(makePkt(rndName(), Math.floor(Math.random() * 12 + 1), pri)),
      );
    }
    if (type === "flood") {
      for (let i = 0; i < 15; i++)
        inject(
          makePkt(
            `SATURATION_FLOOD_${i}`,
            Math.floor(Math.random() * 8 + 1),
            1,
          ),
        );
    }
  };

  const resetAll = () => {
    _pktCounter = 0;
    setHeap([]);
    setProcessed([]);
    setDropped([]);
    setTotalBW(0);
    setLogs([]);
    if (autoRunning) {
      clearInterval(autoTimer.current);
      setAutoRunning(false);
    }
    addLog("System reset complete. All memory buffers flushed.", "warn");
  };

  const toggleAuto = () => {
    if (autoRunning) {
      clearInterval(autoTimer.current);
      setAutoRunning(false);
    } else {
      setAutoRunning(true);
      autoTimer.current = setInterval(() => {
        setHeap((prev) => {
          if (prev.length === 0) {
            clearInterval(autoTimer.current);
            setAutoRunning(false);
            return prev;
          }
          return prev; // runStep handles its own setHeap
        });
        runStep();
      }, 600);
    }
  };

  // Cleanup on unmount
  useEffect(() => () => clearInterval(autoTimer.current), []);

  // Initial burst
  useEffect(() => {
    [3, 3, 2, 2, 2, 1, 1, 3].forEach((pri) =>
      setHeap((prev) =>
        heapInsert(
          prev,
          makePkt(rndName(), Math.floor(Math.random() * 12 + 1), pri),
        ),
      ),
    );
    addLog("Algorithmic engine core initiated. Max-Heap pipeline ready.", "ok");
  }, []); // eslint-disable-line

  const bwPct = Math.min(100, Math.round((totalBW / BW_LIMIT) * 100));
  const bwBarColor =
    bwPct > 90
      ? "bg-rose-500"
      : bwPct >= 70
        ? "bg-amber-500"
        : "bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600";

  return (
    <div
      className="text-gray-100 min-h-screen relative overflow-x-hidden pb-12 tracking-wide"
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: "#05030a",
        backgroundImage:
          "url('https://images.pexels.com/photos/10050570/pexels-photo-10050570.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* CSS keyframes injected */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@600;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(31,23,53,0.4); }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.5); border-radius: 4px; }
        .font-mono-jet { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Glow blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-950/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-950/20 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── Header ── */}
      <header className="border-b border-purple-900/40 bg-[#0b0817]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            style={{ fontFamily: "'Orbitron', monospace" }}
            className="text-xl font-black tracking-widest text-white"
          >
            NET<span className="text-purple-500">BROKER</span>
            <span className="text-xs font-sans text-purple-300 font-bold tracking-wider ml-2 bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">
              DSA ENGINE CORE
            </span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/20 border-2 border-emerald-500/50 px-4 py-1 rounded-full text-xs text-emerald-400 font-black tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE SYSTEM ACTIVE
          </div>
        </div>
        <Ticker
          injected={_pktCounter}
          processed={processed.length}
          dropped={dropped.length}
          heapLen={heap.length}
        />
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-6 mt-10 relative z-10">
        {/* Title */}
        <div className="mb-10 border-l-4 border-purple-600 pl-4">
          <h1
            style={{ fontFamily: "'Orbitron', monospace" }}
            className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none mb-3 uppercase"
          >
            Network Packet
            <br />
            <span className="text-purple-400 drop-shadow-[0_0_30px_rgba(147,51,234,0.4)]">
              Broker Engine
            </span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed font-medium">
            High-throughput network traffic simulator dashboard. Built using
            pure{" "}
            <span className="text-white font-bold underline decoration-purple-500">
              Max-Heap Data Structures
            </span>
            , rate limiters, and tail-drop policy routing.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left col ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Action buttons */}
            <div
              className="bg-[#0f0c1b]/95 border-2 border-purple-900/50 rounded-xl p-5 flex flex-wrap gap-4 shadow-xl"
              style={{ boxShadow: "0 0 50px -5px rgba(124,58,237,0.25)" }}
            >
              <button
                onClick={runStep}
                className="flex-1 min-w-[160px] bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-sm py-3.5 px-5 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 uppercase tracking-wider"
              >
                <span>▶</span> Process Next Node
              </button>
              <button
                onClick={toggleAuto}
                className={`flex-1 min-w-[160px] font-black text-sm py-3.5 px-5 rounded-lg transition active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider ${
                  autoRunning
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
                    : "bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/50 text-amber-400"
                }`}
              >
                <span>{autoRunning ? "⏹" : "⚡"}</span>
                {autoRunning ? "Stop Auto Engine" : "Auto Run Engine"}
              </button>
              <button
                onClick={resetAll}
                className="bg-rose-950/60 hover:bg-rose-900/60 border-2 border-rose-500/40 text-rose-400 text-xs font-bold py-3.5 px-4 rounded-lg transition active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>↺</span> Flush Core
              </button>
            </div>

            {/* Inject form */}
            <div className="bg-[#0f0c1b]/95 border border-purple-900/40 rounded-xl p-6 shadow-xl">
              <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>⚙️</span> Inject Packet Frame Matrix Configuration
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-4">
                  <label className="text-xs text-gray-300 block mb-2 font-bold uppercase tracking-wider">
                    Packet ID / Spec
                  </label>
                  <input
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    className="w-full h-11 bg-[#161229] border-2 border-purple-900/50 rounded-lg px-3 text-sm text-white font-bold outline-none focus:border-purple-500 transition font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-300 block mb-2 font-bold uppercase tracking-wider">
                    Size (MB)
                  </label>
                  <input
                    type="number"
                    value={fSize}
                    onChange={(e) => setFSize(e.target.value)}
                    min={1}
                    max={50}
                    className="w-full h-11 bg-[#161229] border-2 border-purple-900/50 rounded-lg px-3 text-sm text-white font-bold outline-none focus:border-purple-500 transition font-mono"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-xs text-gray-300 block mb-2 font-bold uppercase tracking-wider">
                    Priority Tier
                  </label>
                  <select
                    value={fPri}
                    onChange={(e) => setFPri(parseInt(e.target.value))}
                    className="w-full h-11 bg-[#161229] border-2 border-purple-900/50 rounded-lg px-2 text-xs text-white font-bold outline-none focus:border-purple-500 transition uppercase tracking-wide"
                  >
                    <option value={3}>🔴 HIGH Priority Core</option>
                    <option value={2}>🟡 MEDIUM Priority Shape</option>
                    <option value={1}>🔵 LOW Priority Tail</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-300 block mb-2 font-bold uppercase tracking-wider">
                    Count
                  </label>
                  <input
                    type="number"
                    value={fCount}
                    onChange={(e) => setFCount(parseInt(e.target.value))}
                    min={1}
                    max={20}
                    className="w-full h-11 bg-[#161229] border-2 border-purple-900/50 rounded-lg px-3 text-sm text-white font-bold outline-none focus:border-purple-500 transition font-mono"
                  />
                </div>
              </div>
              <button
                onClick={injectCustom}
                className="w-full mt-5 bg-purple-600/20 hover:bg-purple-600/30 border-2 border-purple-500/50 text-purple-200 text-xs font-black py-3 rounded-lg transition active:scale-[0.99] uppercase tracking-widest"
              >
                Inject Parameters Into Tree Vector
              </button>
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-purple-900/30">
                <button
                  onClick={() => simulateBurst("high")}
                  className="bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-orange-400 py-2.5 px-2 rounded-lg border border-zinc-800 transition uppercase tracking-wider"
                >
                  💥 Burst HIGH (5x)
                </button>
                <button
                  onClick={() => simulateBurst("mixed")}
                  className="bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-purple-400 py-2.5 px-2 rounded-lg border border-zinc-800 transition uppercase tracking-wider"
                >
                  🔀 Balanced Mix (10x)
                </button>
                <button
                  onClick={() => simulateBurst("flood")}
                  className="bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-blue-400 py-2.5 px-2 rounded-lg border border-zinc-800 transition uppercase tracking-wider"
                >
                  🌊 Flood LOW (15x)
                </button>
              </div>
            </div>

            {/* Bandwidth bar */}
            <div className="bg-[#0f0c1b]/95 border border-purple-900/40 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center text-xs font-black text-gray-300 uppercase tracking-widest mb-3">
                <span>Bandwidth Usage Capacity Headroom</span>
                <span className="font-mono text-sm text-white font-extrabold bg-purple-950 px-2.5 py-0.5 rounded border border-purple-900">
                  {totalBW} / {BW_LIMIT} MB
                </span>
              </div>
              <div className="w-full h-4 bg-[#161229] border border-purple-900/30 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${bwBarColor}`}
                  style={{ width: `${bwPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold font-mono mt-2.5">
                <span className="text-gray-500">0 MB</span>
                <span className="text-amber-400">⚠️ 70 MB THRESHOLD</span>
                <span className="text-rose-500">🔴 100 MB DROP BOUNDARY</span>
              </div>
            </div>

            {/* Log terminal */}
            <div className="bg-[#0f0c1b]/95 border border-purple-900/40 rounded-xl p-6 shadow-xl">
              <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                Live Activity Stream Terminal Shell
              </div>
              <div className="bg-[#08060f] border-2 border-purple-900/30 rounded-lg p-4 h-44 overflow-y-auto font-mono text-xs space-y-2.5 custom-scroll font-bold">
                {logs.length === 0 && (
                  <span className="text-gray-600 italic">
                    Awaiting events...
                  </span>
                )}
                {logs.map((e) => (
                  <LogEntry key={e.key} entry={e} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Right col ── */}
          <div className="lg:col-span-5 space-y-6">
            <HeapVis heap={heap} />
            <QueueList heap={heap} />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10">
          <MetricCard
            label="Total Injected"
            value={_pktCounter}
            colorClass="text-white"
          />
          <MetricCard
            label="Processed (Cleared)"
            value={processed.length}
            colorClass="text-emerald-400"
            borderClass="border-l-4 border-l-emerald-500"
          />
          <MetricCard
            label="Dropped Overflows"
            value={dropped.length}
            colorClass="text-rose-500"
            borderClass="border-l-4 border-l-rose-500"
          />
          <MetricCard
            label="Current Heap Depth"
            value={heap.length}
            colorClass="text-amber-400"
            borderClass="border-l-4 border-l-amber-500"
          />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 mt-14 pt-6 border-t border-purple-900/30 text-center text-xs text-gray-500 font-mono font-bold tracking-wider uppercase relative z-10">
        System Core Pipeline · Pure DSA Architecture Engine Execution || Made by
        Gourav Ved · Instrumentation & Control Engineering · NSUT'2028
      </footer>
    </div>
  );
}
