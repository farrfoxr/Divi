import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { Role, Message, Node } from '../types';

export async function createRoot(title: string): Promise<string> {
  const rootId = uuidv4();
  
  // Create the Root container
  await db.roots.add({
    id: rootId,
    title,
    backpack: "",
    lastActiveNodeId: null,
    createdAt: Date.now(),
  });

  // Create the initial "Start" node for this root
  const startNodeId = await createBranch(rootId, null, "Start");
  
  // Update root to point to this start node
  await db.roots.update(rootId, { lastActiveNodeId: startNodeId });

  return rootId;
}

// In src/lib/knowledge-graph.ts

export async function createBranch(
  rootId: string,
  parentId: string | null,
  title: string = "New Branch"
): Promise<string> {
  const nodeId = uuidv4();
  
  // FIX 1: Handle null parentId (Root Start Node)
  // IndexedDB cannot query indexes with 'null', so we skip the DB check if parentId is null.
  let siblings = 0;
  if (parentId) {
    // FIX 2: Use explicit string syntax for the where clause
    siblings = await db.nodes.where('parentId').equals(parentId).count();
  }
  
  // Calculate depth
  let depth = 0;
  if (parentId) {
    const parent = await db.nodes.get(parentId);
    if (parent) depth = parent.depth + 1;
  }

  await db.nodes.add({
    id: nodeId,
    rootId,
    parentId,
    title,
    messages: [],
    depth,
    siblingIndex: siblings,
    createdAt: Date.now(),
  });

  // Update global tracker
  await db.roots.update(rootId, { lastActiveNodeId: nodeId });

  return nodeId;
}

export async function addMessage(nodeId: string, role: Role, content: string): Promise<void> {
  const node = await db.nodes.get(nodeId);
  if (!node) throw new Error("Node not found");

  const newMessage: Message = {
    id: uuidv4(),
    role,
    content,
    timestamp: Date.now(),
  };

  const updatedMessages = [...node.messages, newMessage];
  
  await db.nodes.update(nodeId, { messages: updatedMessages });
}

export async function cleanupNode(nodeId: string): Promise<void> {
  const node = await db.nodes.get(nodeId);
  if (!node) return;

  // If node has no messages and no children, delete it
  const childCount = await db.nodes.where('parentId').equals(nodeId).count();
  
  if (node.messages.length === 0 && childCount === 0) {
    await db.nodes.delete(nodeId);
  }
}

export async function getHistoryChain(nodeId: string): Promise<Message[]> {
  const chain: Message[] = [];
  let currentId: string | null = nodeId;

  while (currentId) {
    const node: Node | undefined = await db.nodes.get(currentId);
    if (!node) break;
    // Prepend messages
    chain.unshift(...node.messages);
    currentId = node.parentId;
  }
  return chain;
}