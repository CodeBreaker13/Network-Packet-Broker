const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Serve static UI components if needed
app.use(express.static(path.join(__dirname, "public")));

// --- CORE BACKEND DSA MEMORY CHANNELS ---
let heap = [];
let processedCount = 0;
let droppedCount = 0;
let totalInjected = 0;
let totalBW = 0;
const BW_LIMIT = 100;

// --- CUSTOM ENGINE UTILITIES ---
function siftUp(i) {
  while (i > 0) {
    let par = Math.floor((i - 1) / 2);
    if (heap[par].priority < heap[i].priority) {
      let t = heap[par];
      heap[par] = heap[i];
      heap[i] = t;
      i = par;
    } else break;
  }
}

function siftDown(i) {
  let n = heap.length;
  while (true) {
    let l = 2 * i + 1,
      r = 2 * i + 2,
      best = i;
    if (l < n && heap[l].priority > heap[best].priority) best = l;
    if (r < n && heap[r].priority > heap[best].priority) best = r;
    if (best === i) break;
    let t = heap[best];
    heap[best] = heap[i];
    heap[i] = t;
    i = best;
  }
}

// --- STATE SYNC DISTRIBUTION STREAM ---
function emitSystemState() {
  io.emit("state_update", {
    heap,
    processedCount,
    droppedCount,
    totalInjected,
    totalBW,
    queueDepth: heap.length,
  });
}

// --- SOCKET ENGINE INTERFACE ---
io.on("connection", (socket) => {
  console.log("⚡ Console Node Linked to Processing Core:", socket.id);

  // Connect hot-reload data sync
  emitSystemState();

  // Packet Injection Core Handler
  socket.on("inject_packet", (packetData) => {
    totalInjected++;
    const newPacket = {
      id: `PKT-${String(totalInjected).padStart(4, "0")}`,
      name: packetData.name,
      size: parseInt(packetData.size),
      priority: parseInt(packetData.priority),
      timestamp: new Date().toLocaleTimeString("en-GB"),
    };

    heap.push(newPacket);
    siftUp(heap.length - 1);

    io.emit("log_message", {
      msg: `INJ ${newPacket.id} [${newPacket.name}] ${newPacket.size}MB Level-${newPacket.priority}`,
      type: "warn",
    });

    emitSystemState();
  });

  // Extract and Process Core Queue Engine Task
  socket.on("process_next", () => {
    if (heap.length === 0) {
      socket.emit("log_message", {
        msg: "Queue is empty. Execution aborted.",
        type: "warn",
      });
      return;
    }

    // Extract Max Priority Root Node
    const maxPkt = heap[0];
    if (heap.length === 1) {
      heap.pop();
    } else {
      heap[0] = heap.pop();
      siftDown(0);
    }

    // QoS Boundary Drop Logic Rules
    if (totalBW + maxPkt.size > BW_LIMIT && maxPkt.priority === 1) {
      droppedCount++;
      io.emit("log_message", {
        msg: `DROP ${maxPkt.id} [${maxPkt.name}] ${maxPkt.size}MB — Tail Drop (LOW Priority Blocked)`,
        type: "drop",
      });
    } else if (totalBW + maxPkt.size > BW_LIMIT && maxPkt.priority === 2) {
      if (Math.random() < 0.5) {
        droppedCount++;
        io.emit("log_message", {
          msg: `DROP ${maxPkt.id} [${maxPkt.name}] ${maxPkt.size}MB — Congestion Drop (MED Priority Blocked)`,
          type: "drop",
        });
      } else {
        totalBW += maxPkt.size;
        processedCount++;
        io.emit("log_message", {
          msg: `PROC ${maxPkt.id} [${maxPkt.name}] ${maxPkt.size}MB — MEDIUM Squeezed Thru`,
          type: "ok",
        });
      }
    } else {
      totalBW += maxPkt.size;
      processedCount++;
      io.emit("log_message", {
        msg: `PROC ${maxPkt.id} [${maxPkt.name}] ${maxPkt.size}MB — HIGH Level Cleared`,
        type: "ok",
      });
    }

    emitSystemState();
  });

  // Global Engine Flush (Reset)
  socket.on("reset_engine", () => {
    heap = [];
    processedCount = 0;
    droppedCount = 0;
    totalInjected = 0;
    totalBW = 0;
    io.emit("log_message", {
      msg: "System core flushed completely. Memories clear.",
      type: "drop",
    });
    emitSystemState();
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Network Packet Engine Running on Port: ${PORT}`);
});
