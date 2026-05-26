/*
 * NetBroker — Network Packet Broker Engine
 * Core DSA: Max-Heap Priority Queue (C++ Implementation)
 *
 * Same logic as App.jsx — just pure C++, no UI.
 * Priority: 3 = HIGH, 2 = MEDIUM, 1 = LOW
 * Bandwidth limit: 100 MB (tail-drop policy kicks in after this)
 */

// #include <iostream>
// #include <vector>
// #include <string>
// #include <cstdlib>
// #include <ctime>

#include<bits/stdc++.h>
using namespace std;

// ─── Packet Structure ─────────────────────────────────────────────────────────

struct Packet {
    string id;
    string name;
    int size;       // in MB
    int priority;   // 1 = LOW, 2 = MEDIUM, 3 = HIGH
};

// ─── Helper ──────────────────────────────────────────────────────────────────

string priorityLabel(int p) {
    if (p == 3) return "HIGH";
    if (p == 2) return "MEDIUM";
    return "LOW";
}

int packetCounter = 0;

Packet makePacket(string name, int size, int priority) {
    packetCounter++;
    string id = "PKT-";
    // zero-pad to 4 digits
    string num = to_string(packetCounter);
    while (num.length() < 4) num = "0" + num;
    id += num;
    return {id, name, size, priority};
}

// ─── Max-Heap Core ───────────────────────────────────────────────────────────

/*
 * siftUp: After inserting at end, bubble up until heap property restored.
 * Parent of index i = (i - 1) / 2
 * Time complexity: O(log n)
 */
void siftUp(vector<Packet>& heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent].priority < heap[i].priority) {
            swap(heap[parent], heap[i]);
            i = parent;
        } else {
            break;
        }
    }
}

/*
 * siftDown: After extracting root, sink the replacement down.
 * Left child  = 2*i + 1
 * Right child = 2*i + 2
 * Time complexity: O(log n)
 */
void siftDown(vector<Packet>& heap, int i) {
    int n = heap.size();
    while (true) {
        int best = i;
        int left  = 2 * i + 1;
        int right = 2 * i + 2;

        if (left  < n && heap[left].priority  > heap[best].priority) best = left;
        if (right < n && heap[right].priority > heap[best].priority) best = right;

        if (best == i) break;

        swap(heap[best], heap[i]);
        i = best;
    }
}

// Insert a packet into the heap
void heapInsert(vector<Packet>& heap, Packet pkt) {
    heap.push_back(pkt);
    siftUp(heap, heap.size() - 1);
    cout << "[INJECT]  " << pkt.id << " | " << pkt.name
         << " | " << pkt.size << "MB | " << priorityLabel(pkt.priority) << "\n";
}

// Extract highest priority packet from heap
Packet heapExtract(vector<Packet>& heap) {
    Packet top = heap[0];
    heap[0] = heap[heap.size() - 1];
    heap.pop_back();
    if (!heap.empty()) siftDown(heap, 0);
    return top;
}

// ─── Print Heap Array (like HeapVis in UI) ───────────────────────────────────

void printHeap(const vector<Packet>& heap) {
    cout << "\n--- Heap Array State ---\n";
    for (int i = 0; i < (int)heap.size(); i++) {
        cout << "[" << i << "] " << heap[i].id
             << " (" << priorityLabel(heap[i].priority)[0] << ") ";
    }
    cout << "\n------------------------\n\n";
}

// ─── Tail-Drop Policy (same as App.jsx) ──────────────────────────────────────

void processNext(vector<Packet>& heap, int& totalBW,
                 int& processed, int& dropped) {
    if (heap.empty()) {
        cout << "[WARN]    Queue empty. Nothing to process.\n";
        return;
    }

    Packet pkt = heapExtract(heap);

    if (totalBW + pkt.size > 100 && pkt.priority == 1) {
        // LOW priority — always drop when over limit
        dropped++;
        cout << "[DROP]    " << pkt.id << " | " << pkt.name
             << " | LOW priority - bandwidth saturated. TAIL DROP.\n";

    } else if (totalBW + pkt.size > 100 && pkt.priority == 2) {
        // MEDIUM priority — 50% chance of drop
        if (rand() % 2 == 0) {
            dropped++;
            cout << "[DROP]    " << pkt.id << " | " << pkt.name
                 << " | MEDIUM priority — probabilistic drop.\n";
        } else {
            processed++;
            totalBW += pkt.size;
            cout << "[PROCESS] " << pkt.id << " | " << pkt.name
                 << " | " << pkt.size << "MB MEDIUM - accepted.\n";
        }

    } else {
        // HIGH priority or under limit — always process
        processed++;
        totalBW += pkt.size;
        cout << "[PROCESS] " << pkt.id << " | " << pkt.name
             << " | " << pkt.size << "MB " << priorityLabel(pkt.priority)
             << " — cleared.\n";
    }
}

// ─── Main Simulation ─────────────────────────────────────────────────────────

int main() {
    srand(time(0));

    vector<Packet> heap;
    int totalBW  = 0;
    int processed = 0;
    int dropped   = 0;

    cout << "========================================\n";
    cout << "  NetBroker — Max-Heap DSA Engine (C++)\n";
    cout << "  Bandwidth Limit: 100 MB | Tail-Drop Policy\n";
    cout << "========================================\n\n";

    // ── Same initial burst as App.jsx useEffect ──
    cout << "--- Injecting initial packet burst ---\n";
    heapInsert(heap, makePacket("BGP_UPDATE",    10, 3));
    heapInsert(heap, makePacket("TLS_HANDSHAKE",  5, 3));
    heapInsert(heap, makePacket("HTTP_GET",        8, 2));
    heapInsert(heap, makePacket("UDP_STREAM",      6, 2));
    heapInsert(heap, makePacket("OSPF_HELLO",      3, 2));
    heapInsert(heap, makePacket("ARP_REQUEST",     4, 1));
    heapInsert(heap, makePacket("ICMP_PING",       2, 1));
    heapInsert(heap, makePacket("DNS_QUERY",       7, 3));

    printHeap(heap);

    // ── Simulate flood to trigger tail-drop ──
    cout << "--- Flood inject (LOW priority) ---\n";
    for (int i = 0; i < 5; i++) {
        heapInsert(heap, makePacket("SATURATION_FLOOD_" + to_string(i), 12, 1));
    }

    printHeap(heap);

    // ── Process all packets one by one ──
    cout << "--- Processing all packets ---\n\n";
    while (!heap.empty()) {
        processNext(heap, totalBW, processed, dropped);
    }

    // ── Final stats (same as MetricCard in UI) ──
    cout << "\n========================================\n";
    cout << "  FINAL STATS\n";
    cout << "========================================\n";
    cout << "  Total Injected  : " << packetCounter  << "\n";
    cout << "  Processed       : " << processed       << "\n";
    cout << "  Dropped         : " << dropped         << "\n";
    cout << "  Bandwidth Used  : " << totalBW << " MB\n";
    cout << "========================================\n";

    return 0;
}