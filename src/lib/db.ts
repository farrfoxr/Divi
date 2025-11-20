import Dexie, { type EntityTable } from 'dexie';
import { Root, Node } from '@/types';

// Define the Database Class
class DiviDatabase extends Dexie {
  // Declare tables with strong typing
  roots!: EntityTable<Root, 'id'>;
  nodes!: EntityTable<Node, 'id'>;

  constructor() {
    super('DiviDatabase');

    // DEFINING THE SCHEMA
    // We only list attributes that need to be INDEXED (searched/sorted).
    // Non-indexed attributes (like 'messages', 'backpack') are stored but not searchable directly.
    this.version(1).stores({
      roots: 'id, title, createdAt', 
      // id: Primary Key
      // createdAt: For sorting "Recent Topics" in Sidebar

      nodes: 'id, rootId, parentId, depth, createdAt'
      // id: Primary Key
      // rootId: Critical for "Get Entire Graph" (Graph View)
      // parentId: Critical for "Traverse Tree" (Back/Forward)
      // depth: Useful for filtering levels in visualization
      // createdAt: For sorting siblings
    });
  }
}

// Export a single instance of the DB
export const db = new DiviDatabase();

// Helper to reset DB (Useful for debugging Phase 1)
export const resetDatabase = async () => {
  await db.delete();
  await db.open();
};