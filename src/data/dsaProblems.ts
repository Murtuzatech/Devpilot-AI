export interface ProblemItem {
  id: string;
  trackId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: Record<string, string>;
}

export interface TrackItem {
  id: string;
  name: string;
  category: string;
}

export const TRACKS: TrackItem[] = [
  { id: 'algorithms', name: 'Algorithms (Core DSA)', category: 'Core CS' },
  { id: 'javascript', name: 'JavaScript Engine & DOM', category: 'Frontend' },
  { id: 'react', name: 'React (Machine Coding)', category: 'Frontend' },
  { id: 'typescript', name: 'TypeScript Advanced', category: 'Frontend' },
  { id: 'python', name: 'Python DSA & Scripting', category: 'Language' },
  { id: 'java', name: 'Java DSA & OOP', category: 'Backend' },
  { id: 'cpp', name: 'C++ STL & Competitive', category: 'Core CS' },
  { id: 'csharp', name: 'C# / .NET Collections', category: 'Backend' },
  { id: 'sql', name: 'SQL & Database Queries', category: 'Data' },
  { id: 'php', name: 'PHP / Backend Algorithms', category: 'Backend' },
];

// 10 Tracks Topic Patterns
const TRACK_TOPICS: Record<string, { prefix: string; concepts: string[]; defaultExt: string; sampleFunc: string }> = {
  algorithms: {
    prefix: 'ALGO',
    concepts: [
      'Two Sum Variations', 'Valid Palindrome & Substrings', 'Sliding Window Maximum', 'Container With Most Water',
      'Trapping Rain Water', 'Binary Search on Rotated Array', 'Merge Intervals', '3Sum & 4Sum Closest',
      'Reverse Linked List in K-Group', 'LRU Cache Design', 'Longest Consecutive Sequence', 'Pacific Atlantic Water Flow',
      'Course Schedule & Topological Sort', 'Word Ladder BFS', 'Median of Two Sorted Arrays', 'Serialize & Deserialize Binary Tree',
      'Edit Distance DP', 'Coin Change Combinations', 'Maximal Rectangle in Matrix', 'N-Queens Backtracking'
    ],
    defaultExt: 'js',
    sampleFunc: 'function solution(input) {\n  // Write optimal O(n) or O(log n) algorithm\n}'
  },
  javascript: {
    prefix: 'JS',
    concepts: [
      'Custom Promise.all Polyfill', 'Debounce with Cancel & Immediate', 'Throttle with Trailing Edge', 'Deep Clone with Circular WeakMap',
      'Currying with Placeholder Support', 'Custom Event Emitter PubSub', 'Flatten Nested Array Deeply', 'Auto-Retry Async Function with Exponential Backoff',
      'Object.assign Deep Merge Polyfill', 'DOM Tree Walker & Traversal', 'Custom Array.prototype.reduce', 'Memoize Function with TTL Cache',
      'Intersection Observer Lazy Loader', 'Virtual DOM Diffing Engine', 'Microtask Queue Simulation', 'Web Worker Task Runner Pool',
      'Pipe & Compose Utilities', 'Async Waterfall Execution', 'JSON Stringify Recursive Polyfill', 'Custom SetTimeout Drift Corrector'
    ],
    defaultExt: 'js',
    sampleFunc: 'function executeTask(...args) {\n  // Implement JS core runtime polyfill\n}'
  },
  react: {
    prefix: 'REACT',
    concepts: [
      'Custom useDebounce & useThrottle Hook', 'Virtualized 100k Items List Window', 'Modal Dialog with Portal & Trap Focus',
      'Multi-Step Wizard with Global State', 'Infinite Scroll with IntersectionObserver', 'Compound Tabs Component Pattern',
      'Custom Form Validator with Dynamic Rules', 'Light/Dark Theme Provider with Context', 'Toast Notification Manager Stack',
      'Data Table with Column Sort & Multi-Filter', 'Custom usePrevious State Hook', 'Star Rating Widget with Hover Effects',
      'Autocomplete Search with Cache & AbortController', 'Draggable Kanban Board Column', 'Accordion with Single & Multiple Expand',
      'Custom useLocalStorage with Cross-Tab Sync', 'Breadcrumbs with Dynamic Route Params', 'File Dropzone with Chunked Upload',
      'OTP 6-Digit Auto-Focus Input Field', 'Countdown Timer with Background Worker'
    ],
    defaultExt: 'jsx',
    sampleFunc: 'import React, { useState, useEffect } from "react";\n\nexport default function Component() {\n  // Write React UI Component\n  return <div>Component UI</div>;\n}'
  },
  typescript: {
    prefix: 'TS',
    concepts: [
      'Deep Readonly & Recursive Partial Type', 'Tuple to Union & Mapped Types', 'Strict Event Map Listener Type',
      'Path-Based Object Property Getter Type', 'Union to Intersection Converter', 'Parse Query String URL to Typed Object',
      'Curry Function Type Generator', 'Type-Safe Redux Dispatcher & Reducer', 'CamelCase to SnakeCase String Literal Type',
      'Exclude & Extract Reimplementation', 'JSON Schema to TypeScript Interface Validator', 'Template Literal Route Parameter Extractor',
      'PickByType and OmitByType Helpers', 'RequiredByKeys Utility Type', 'Tuple Split and Join Types',
      'Deep Flatten Object Keys Type', 'Strict Null & Undefined Type Guard Functions', 'Generic Factory Function Decorator Type',
      'Enforce Exhaustive Switch Case with Never', 'Custom Nominal Brand Type Utility'
    ],
    defaultExt: 'ts',
    sampleFunc: 'type MyType<T> = T extends object ? { [K in keyof T]: T[K] } : never;\n\nexport function run<T>(data: T): void {\n  // Write TypeScript Implementation\n}'
  },
  python: {
    prefix: 'PY',
    concepts: [
      'Merge K Sorted Linked Lists using Heapq', 'Serialize Binary Tree to String & Back', 'Trie Prefix Tree Implementation',
      'Word Search II with Backtracking', 'Shortest Path in Weighted Graph (Dijkstra)', 'Longest Increasing Subsequence DP',
      'Design Snake Game with Deque', 'Task Scheduler with Greedy Frequency Queue', 'Subarray Sum Equals K with Hashmap',
      'Clone Graph with BFS & Visited Dict', 'Find All Anagrams in a String', 'K Closest Points to Origin',
      'Next Greater Element using Monotonic Stack', 'Decode String with Nested Bracket Stack', 'Alien Dictionary Topological Order',
      'Word Break Problem Dynamic Programming', 'Minimum Window Substring Two-Pointers', 'Lowest Common Ancestor of Binary Tree',
      'Binary Tree Maximum Path Sum', 'Regular Expression Matching DP'
    ],
    defaultExt: 'py',
    sampleFunc: 'def solution(*args):\n    # Write Python 3 optimal solution\n    pass'
  },
  java: {
    prefix: 'JAVA',
    concepts: [
      'Thread-Safe Singleton Pattern', 'LRU Cache with LinkedHashMap & DoublyLinkedList', 'Custom BlockingQueue Implementation',
      'Find Median from Data Stream (Two PriorityQueues)', 'Kth Largest Element in an Array (QuickSelect)', 'Graph Valid Tree using Union-Find',
      'Binary Tree Level Order Traversal BFS', 'Merge Two Sorted Lists Recursively', 'Implement Stack using Queues',
      'Design Twitter NewsFeed System', 'Reorder List with Fast-Slow Pointers', 'Validate Binary Search Tree In-Order',
      'House Robber III Tree DP', 'Pacific Atlantic Flow Matrix Traversal', 'Search in 2D Matrix II (Step-wise search)',
      'Construct Tree from Preorder & Inorder', 'Copy List with Random Pointer', 'Top K Frequent Elements (Bucket Sort)',
      'Subsets & Power Set Backtracking', 'Combination Sum with Pruning'
    ],
    defaultExt: 'java',
    sampleFunc: 'class Solution {\n    public Object solve(Object input) {\n        // Write Java solution\n        return null;\n    }\n}'
  },
  cpp: {
    prefix: 'CPP',
    concepts: [
      'Segment Tree with Range Lazy Propagation', 'Fenwick Tree (Binary Indexed Tree) Point Update', 'Disjoint Set Union by Rank and Path Compression',
      'KMP String Matching Algorithm', 'Tarjan Algorithm for Strongly Connected Components', 'Dijkstra with std::priority_queue',
      'Floyd-Warshall All Pairs Shortest Path', 'Convex Hull Monotone Chain Algorithm', 'Heavy-Light Decomposition on Trees',
      'Max Flow with Edmonds-Karp & Dinic', 'Fast Fourier Transform Polynomial Multiplication', 'Bitmask DP on Traveling Salesman',
      'Lowest Common Ancestor with Binary Lifting', 'Eulerian Path in Directed Graph', 'Matrix Exponentiation for Nth Fibonacci',
      'Rolling Hash Rabin-Karp Search', '0/1 Knapsack with Space Optimization', 'Centroid Decomposition on Trees',
      'Aho-Corasick Multi-Pattern Automaton', 'Gaussian Elimination for Linear Systems'
    ],
    defaultExt: 'cpp',
    sampleFunc: '#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Competitive C++ Solution\n    }\n};'
  },
  csharp: {
    prefix: 'CSHARP',
    concepts: [
      'Async/Await Custom Task Scheduler', 'LINQ Custom GroupBy & SelectMany Polyfill', 'Design Cache with MemoryCache & Eviction',
      'ConcurrentQueue Producer-Consumer Pattern', 'Dependency Injection Container from Scratch', 'Expression Tree Dynamic Query Builder',
      'Binary Tree Serialization with Span<T>', 'Immutable Stack and Queue Structures', 'Reflection-Based Object Mapper',
      'Custom IEnumerable and IEnumerator Yield Return', 'Pattern Matching on Polymorphic Records', 'Channel<T> High-Throughput Pipeline',
      'Thread-Safe Circular Ring Buffer', 'PriorityQueue Min/Max Heap Operations', 'Disposal Pattern with IAsyncDisposable',
      'Generic Repository Pattern with EF Core Querying', 'ValueTask vs Task Benchmark Utility', 'BitArray Manipulation for Large Sets',
      'Actor Model Mailbox Dispatcher', 'AOT Friendly JSON Deserializer Pattern'
    ],
    defaultExt: 'cs',
    sampleFunc: 'using System;\n\npublic class Solution {\n    public void Solve() {\n        // C# .NET Core Logic\n    }\n}'
  },
  sql: {
    prefix: 'SQL',
    concepts: [
      'Second Highest Salary with Window Functions', 'Consecutive Numbers 3 Times in a Row', 'Department Top 3 Salaries using DENSE_RANK',
      'Monthly Active Users & Retention Cohort', 'Find Cumulative Sum without Window Functions', 'Delete Duplicate Emails keeping Smallest ID',
      'Managers with at Least 5 Direct Reports', 'Customers Who Bought All Products', 'Trips and Users Cancellation Rate',
      'Human Traffic of Stadium Window Filter', 'Rank Scores without Gaps', 'Exchange Adjacent Seats in Exam Hall',
      'Tree Node Classification (Root, Inner, Leaf)', 'Calculate Running Total of Orders by Date', 'Find Missing Sequential IDs in Gap Sequence',
      'Pivoting Rows to Columns (CrossTab Report)', 'Median Order Value per Product Category', 'Recursive CTE for Employee Hierarchy',
      'Identify Overlapping Room Bookings', 'Sessionize Clickstream Events with Lag/Lead'
    ],
    defaultExt: 'sql',
    sampleFunc: '-- Write standard SQL Query\nSELECT \n  id,\n  name\nFROM users;\n'
  },
  php: {
    prefix: 'PHP',
    concepts: [
      'LRU Cache in Pure PHP without Extensions', 'Custom Middleware Pipeline Runner', 'Rate Limiter Token Bucket Algorithm',
      'Recursive Array Flattener & Key Renamer', 'Design Service Container with Autowiring', 'JWT Token Generator & Verifier',
      'Binary Search on Massive In-Memory Array', 'Circular Linked List for Round-Robin Scheduling', 'Custom Stream Wrapper for S3/Blob Storage',
      'CSV Stream Parser with Low Memory Footprint', 'Graph BFS for Role-Based Permission Check', 'String Distance Levenshtein Matrix',
      'Event Dispatcher with Priority Listeners', 'Connection Pooling Simulator with Fibers', 'SQL Query Builder with Fluent API',
      'Two-Pointer String Compression (Run-Length)', 'Tree Traversal for Hierarchical Categories', 'Asynchronous Job Queue Worker Loop',
      'Hash Table Collisions with Separate Chaining', 'Fast Matrix Multiplication with Generator'
    ],
    defaultExt: 'php',
    sampleFunc: '<?php\n\nfunction solution($input) {\n    // Implement optimal PHP algorithm\n    return $input;\n}\n'
  }
};

// Generate exactly 100 problems for each of the 10 tracks (Total 1,000 Questions)
function generateFullProblemBank(): ProblemItem[] {
  const problems: ProblemItem[] = [];

  TRACKS.forEach((track) => {
    const config = TRACK_TOPICS[track.id];
    if (!config) return;

    for (let i = 1; i <= 100; i++) {
      const conceptIndex = (i - 1) % config.concepts.length;
      const conceptName = config.concepts[conceptIndex];
      const cycle = Math.floor((i - 1) / config.concepts.length) + 1;
      
      const difficulty: 'Easy' | 'Medium' | 'Hard' = 
        i % 5 === 0 ? 'Hard' : (i % 2 === 0 ? 'Medium' : 'Easy');

      const title = cycle > 1 ? `${conceptName} (Level ${cycle})` : conceptName;

      problems.push({
        id: `${track.id}-${i}`,
        trackId: track.id,
        title: `${i}. ${title}`,
        difficulty,
        description: `Given technical requirements for **${title}**, design and implement an optimal, production-grade algorithm adhering to time and space constraints.\n\nProblem Context:\nSolve the scenario efficiently handling all edge cases, empty values, boundary limits, and large datasets.`,
        examples: [
          {
            input: `TestCase 1 for ${track.name} [Problem #${i}]`,
            output: `Expected Valid Output #${i}`,
            explanation: `Standard expected evaluation for ${conceptName} under edge-case constraints.`
          },
          {
            input: `TestCase 2 (Boundary edge conditions)`,
            output: `Output (Boundary Passed)`,
            explanation: `Handling constraints properly avoids runtime errors and stack overflows.`
          }
        ],
        constraints: [
          'Time Complexity must be O(n) or better where applicable.',
          'Space Complexity must remain O(1) or minimal auxiliary space.',
          'Input boundary size up to 10^5 elements.'
        ],
        starterCode: {
          javascript: config.sampleFunc,
          python: `def solution(*args):\n    # Problem #${i}: ${title}\n    pass`,
          cpp: `#include <iostream>\nusing namespace std;\n\n// Problem #${i}: ${title}\nvoid solve() {\n}`,
          java: `class Solution {\n    // Problem #${i}: ${title}\n    public void solve() {\n    }\n}`
        }
      });
    }
  });

  return problems;
}

export const ALL_PROBLEMS: ProblemItem[] = generateFullProblemBank();