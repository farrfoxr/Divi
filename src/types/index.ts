export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Root {
  id: string;              // UUID
  title: string;
  backpack: string;        // Global "System Prompt" context for this topic
  lastActiveNodeId: string | null;
  createdAt: number;
}

export interface Node {
  id: string;              // UUID
  rootId: string;          // FK: Which Topic does this belong to?
  parentId: string | null; // FK: Who is my parent? (null = I am the start)
  title: string;           // "Untitled" until committed
  messages: Message[];     // Array of messages for THIS session only
  depth: number;           // Visualization helper (0, 1, 2...)
  siblingIndex: number;    // Ordering helper
  createdAt: number;
}