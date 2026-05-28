 <p align="center">
  <img src="./demo.gif" width="100%" />
</p>

<h1 align="center"> NETBROKER — Network Packet Broker Engine</h1>
<h3 align="center">
Realtime Network Packet Broker Simulation powered by a hand-built Max Heap
</h3>

> A real-time network traffic simulator built with pure Data Structures & Algorithms in React.  
> No libraries. No shortcuts. Just a hand-rolled Max-Heap doing actual work.

---

## 📌 What is this project?

NetBroker is a **visual, interactive simulation** of how real network routers prioritize and manage internet traffic. Every time you stream Netflix, play an online game, or send a message — routers have to decide _which packet gets processed first_ when thousands arrive at once.

This project simulates exactly that decision-making process using a **Max-Heap priority queue** built from scratch, with a live dashboard showing every inject, process, and drop in real time scenario.

---

## 🧠 The Real DSA — What's Actually Happening

The core scheduling engine is powered by a manually implemented Max-Heap priority queue. The core algorithm is a genuine **Max-Heap** (binary heap), and it's doing real work.

### Max-Heap: The Heart of the Engine

A Max-Heap is a **complete binary tree** where every parent node has a higher priority than its children. In this project, the heap is stored as a flat array (not a tree with pointers — exactly how real systems implement it).

Two core operations are implemented manually:

**`siftUp(heap, i)`** — called after inserting a new packet. Bubbles up the new element until heap property is restored.  
**Time complexity: O(log n)**

**`siftDown(heap, i)`** — called after extracting the top (highest priority) packet. Sinks down the replacement element to its correct position.  
**Time complexity: O(log n)**

### Why not just sort the array?

Sorting gives you O(n log n) every time. A heap gives you O(log n) per operation. For a router handling millions of packets per second, that difference is the line between working and crashing.

---

## 🗂️ Project Breakdown

### `siftUp` / `siftDown` — Pure DSA Core

Written with zero dependencies. Just array index math:

- Parent of node `i` → `Math.floor((i - 1) / 2)`
- Left child of `i` → `2 * i + 1`
- Right child of `i` → `2 * i + 2`

### `heapInsert` / `heapExtract` — Queue Operations

- **Insert**: Appends to end of array, then calls `siftUp` to restore order
- **Extract**: Swaps root with last item, removes it, calls `siftDown`

### Packet Model

```js
{ id: "PKT-0001", name: "HTTP_GET", size: 8, priority: 3 }
```

Priority tiers: `3 = HIGH`, `2 = MEDIUM`, `1 = LOW`

### Tail-Drop Policy

When bandwidth crosses 100 MB:

- **LOW priority** packets are **always dropped.**
- **MEDIUM priority** packets have a **50% chance** of being dropped.
- **HIGH priority** packets are **always processed** regardless.

---

## ⚙️ Features

- **Manual step** — Process one packet at a time, watch the heap restructure
- **Auto Run** — Engine processes at 600ms intervals automatically
- **Custom Inject** — Define your own packet name, size, priority, and batch count
- **Burst Scenarios**:
  - 💥 _HIGH Burst_ — 5 high-priority packets
  - 🔀 _Balanced Mix_ — 10 packets across all tiers
  - 🌊 _LOW Flood_ — 15 low-priority packets to trigger drops
- **Bandwidth meter** — Visual bar with threshold markers at 70 MB and 100 MB
- **Live terminal log** — Every event timestamped, color-coded, scrollable

---

## 🏗️ Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Framework | React 18 (Hooks)                        |
| Styling   | Tailwind CSS                            |
| Fonts     | Orbitron, Space Grotesk, JetBrains Mono |
| DSA       | Vanilla JS — no heap library used       |
| State     | `useState`, `useCallback`, `useRef`     |

---

## 📚 Concepts Implemented

- Binary Heap (Max-Heap) — insert and extract in O(log n)
- Priority Queue ADT built on top of a heap
- QoS / Tail-Drop packet scheduling (real networking)
- Bandwidth rate limiting with threshold tiers
- React functional components with hooks
- Event-driven simulation loop with `setInterval`

---

## 👤 Author — GOURAV VED

Built by me exploring how data structures power real infrastructure.  
This project started as a DSA assignment and became a full interactive visualization.

🔗 [Project Link Deployed on Vercel](https://network-packet-broker.vercel.app)
