// import React, { useState, useEffect, useCallback } from "react";
// import "./index.css";

// export default function App() {
//   const [heap, setHeap] = useState([]);
//   const [processed, setProcessed] = useState([]);
//   const [dropped, setDropped] = useState([]);
//   const [logs, setLogs] = useState([]);
//   const [metrics, setMetrics] = useState({ injected: 0, totalBW: 0 });

//   const BW_LIMIT = 100;

//   // Helper functions
//   const priChar = (p) => (p === 3 ? "H" : p === 2 ? "M" : "L");

//   const addLog = (msg, type) => {
//     setLogs((prev) =>
//       [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(
//         0,
//         80,
//       ),
//     );
//   };

//   const heapInsert = (pkt) => {
//     setHeap((prev) => {
//       let newHeap = [...prev, pkt];
//       // Logic for siftUp would go here to maintain Max-Heap property
//       return newHeap.sort((a, b) => b.priority - a.priority);
//     });
//   };

//   const runStep = () => {
//     if (heap.length === 0) return;
//     const pkt = heap[0]; // Simple extract logic
//     setHeap((prev) => prev.slice(1));

//     if (metrics.totalBW + pkt.size > BW_LIMIT && pkt.priority === 1) {
//       setDropped((prev) => [...prev, pkt]);
//       addLog(`💥 TAIL DROP: ${pkt.id}`, "drop");
//     } else {
//       setMetrics((prev) => ({ ...prev, totalBW: prev.totalBW + pkt.size }));
//       setProcessed((prev) => [...prev, pkt]);
//       addLog(`✅ PROCESS: ${pkt.id}`, "ok");
//     }
//   };

//   return (
//     <div className="bg-[#05030a] text-gray-100 min-h-screen font-sans overflow-x-hidden">
//       {/* HEADER SECTION */}
//       <header className="border-b border-purple-900/40 bg-[#0b0817]/90 backdrop-blur-md sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//           <div className="font-mono text-xl font-black text-white">
//             NET<span className="text-purple-500">BROKER</span>
//           </div>
//           <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 px-4 py-1 rounded-full text-xs text-emerald-400">
//             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
//             LIVE SYSTEM ACTIVE
//           </div>
//         </div>
//       </header>

//       {/* MAIN CONTENT AREA */}
//       <main className="max-w-7xl mx-auto px-6 mt-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//           {/* Left Column */}
//           <div className="lg:col-span-7 space-y-6">
//             <div className="bg-[#0f0c1b]/95 border-2 border-purple-900/50 rounded-xl p-5 flex gap-4">
//               <button
//                 onClick={runStep}
//                 className="bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-6 rounded-lg"
//               >
//                 ▶ Process Next Node
//               </button>
//             </div>

//             {/* LOG TERMINAL */}
//             <div className="bg-[#0f0c1b]/95 border border-purple-900/40 rounded-xl p-6 h-44 overflow-y-auto font-mono text-xs">
//               {logs.map((log, i) => (
//                 <div
//                   key={i}
//                   className={
//                     log.type === "ok" ? "text-emerald-400" : "text-rose-400"
//                   }
//                 >
//                   [{log.time}] {log.msg}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right Column (Heap View) */}
//           <div className="lg:col-span-5 bg-[#0f0c1b]/95 border border-purple-900/40 rounded-xl p-6">
//             <h2 className="text-xs font-black text-gray-300 uppercase mb-4">
//               Max-Heap Array Map
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {heap.map((p, i) => (
//                 <span
//                   key={i}
//                   className="text-xs font-black px-2.5 py-1 border-2 border-purple-500 text-purple-400 rounded-lg"
//                 >
//                   {p.id} ({priChar(p.priority)})
//                 </span>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// import PacketBroker from "./components/PacketBroker";

// function App() {
//   return (
//     <div className="bg-[#05030a] min-h-screen">
//       <PacketBroker />
//     </div>
//   );
// }

// export default App;
import PacketBroker from "./components/PacketBroker";

function App() {
  return <PacketBroker />;
}

export default App;
