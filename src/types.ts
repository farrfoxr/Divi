export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Root {
  id: string; // UUID
  title: string;
  backpack: string; // Global "System Prompt" context
  lastActiveNodeId: string | null;
  createdAt: number;
}

export interface Node {
  id: string; // UUID
  rootId: string;
  parentId: string | null; // FK: null = Root Start
  title: string;
  messages: Message[]; // Array of messages for THIS session
  depth: number;
  siblingIndex: number;
  createdAt: number;
}