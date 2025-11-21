'use client';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { createRoot, cleanupNode } from '@/lib/knowledge-graph';

type Tab = 'library' | 'navigator' | 'backpack';

interface SidebarProps {
  activeRootId: string | null;
  activeNodeId: string | null;
  setActiveRootId: (id: string) => void;
  setActiveNodeId: (id: string) => void;
  onResetDB: () => void;
}

export default function Sidebar({ 
  activeRootId, 
  activeNodeId, 
  setActiveRootId, 
  setActiveNodeId,
  onResetDB 
}: SidebarProps) {
  const [currentTab, setCurrentTab] = useState<Tab>('library');
  
  // Switch to Navigator automatically when a root is active
  useEffect(() => {
    if (activeRootId) setCurrentTab('navigator');
  }, [activeRootId]);

  return (
    <aside className="flex h-screen w-[300px] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] text-[var(--text-secondary)]">
      {/* Tabs Header */}
      <div className="flex border-b border-[var(--border-subtle)] p-2">
        <TabButton label="Library" isActive={currentTab === 'library'} onClick={() => setCurrentTab('library')} />
        <TabButton label="Navigator" isActive={currentTab === 'navigator'} onClick={() => setCurrentTab('navigator')} disabled={!activeRootId} />
        <TabButton label="Backpack" isActive={currentTab === 'backpack'} onClick={() => setCurrentTab('backpack')} disabled={!activeRootId} />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {currentTab === 'library' && (
          <LibraryTab activeRootId={activeRootId} onSelect={setActiveRootId} />
        )}
        {currentTab === 'navigator' && activeRootId && activeNodeId && (
          <NavigatorTab 
            activeNodeId={activeNodeId} 
            onNavigate={(id) => setActiveNodeId(id)} 
          />
        )}
        {currentTab === 'backpack' && activeRootId && (
          <BackpackTab activeRootId={activeRootId} />
        )}
      </div>

      {/* Task 1: Sticky Footer & Actions */}
      <div className="mt-auto border-t border-[var(--border-subtle)] p-4">
        <div className="flex flex-col gap-2">
          <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-[var(--text-secondary)] hover:bg-black/5 hover:text-[var(--text-primary)] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M5 5L12 12"></path>
              <path d="M19 5L12 12"></path>
              <path d="M5 19L12 12"></path>
              <path d="M19 19L12 12"></path>
            </svg>
            View Full Graph
          </button>
          <button 
            onClick={onResetDB}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Settings / Reset
          </button>
        </div>
      </div>
    </aside>
  );
}

function TabButton({ label, isActive, onClick, disabled }: { label: string; isActive: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors
        ${isActive ? 'bg-white text-[var(--accent)] shadow-sm dark:bg-[#333]' : 'hover:bg-black/5 disabled:opacity-30'}
      `}
    >
      {label}
    </button>
  );
}

function LibraryTab({ activeRootId, onSelect }: { activeRootId: string | null, onSelect: (id: string) => void }) {
  const roots = useLiveQuery(() => db.roots.toArray());
  const handleCreate = async () => {
    const title = prompt("Topic Name:");
    if (title) {
      const id = await createRoot(title);
      onSelect(id);
    }
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={handleCreate}
        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
      >
        + New Topic
      </button>
      <div className="space-y-1">
        {roots?.map(root => (
          <div 
            key={root.id}
            onClick={() => onSelect(root.id)}
            className={`cursor-pointer rounded-lg p-3 text-sm transition-colors ${activeRootId === root.id ? 'bg-[var(--border-subtle)] font-medium text-[var(--text-primary)]' : 'hover:bg-[var(--border-subtle)]'}`}
          >
            {root.title}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavigatorTab({ activeNodeId, onNavigate }: { activeNodeId: string, onNavigate: (id: string) => void }) {
  const currentNode = useLiveQuery(() => db.nodes.get(activeNodeId), [activeNodeId]);
  
  const siblings = useLiveQuery(async () => {
    if (!currentNode || !currentNode.parentId) return [];
    return db.nodes.where('parentId').equals(currentNode.parentId).toArray();
  }, [currentNode]);
  
  const children = useLiveQuery(async () => {
    return db.nodes.where('parentId').equals(activeNodeId).toArray();
  }, [activeNodeId]);

  if (!currentNode) return <div className="p-4 text-xs">Loading node...</div>;

  const handleGoUp = async () => {
    if (currentNode.parentId) {
      await cleanupNode(currentNode.id); 
      onNavigate(currentNode.parentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Task 4: Depth Indicator Moved Here */}
      <div className="flex items-center justify-between text-xs font-medium text-[var(--accent)] opacity-80">
         <span>Current Level</span>
         <span className="rounded-full bg-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-primary)]">Depth: {currentNode.depth}</span>
      </div>

      {/* Go Up Section */}
      <div>
        <button 
          onClick={handleGoUp}
          disabled={!currentNode.parentId}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-30"
        >
          ⬆️ Go Up
        </button>
      </div>

      {/* Siblings Section */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider opacity-50">Siblings</h3>
        <div className="flex flex-wrap gap-2">
          {siblings?.map(sib => (
            <button
              key={sib.id}
              onClick={() => onNavigate(sib.id)}
              className={`rounded-full px-3 py-1 text-xs border ${sib.id === activeNodeId ? 'border-[var(--accent)] bg-blue-50 text-[var(--accent)]' : 'border-transparent bg-white shadow-sm'}`}
            >
              {sib.title}
            </button>
          ))}
          {siblings?.length === 0 && <p className="text-xs italic opacity-50">No siblings.</p>}
        </div>
      </div>

      {/* Children Section */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider opacity-50">Children / Branches</h3>
        <div className="space-y-1">
          {children?.map(child => (
             <button
             key={child.id}
             onClick={() => onNavigate(child.id)}
             className="block w-full rounded-lg bg-white p-2 text-left text-sm shadow-sm hover:bg-gray-50 dark:bg-[#2a2a2a]"
           >
             ↳ {child.title}
           </button>
          ))}
          {children?.length === 0 && <p className="text-xs italic opacity-50">No branches yet.</p>}
        </div>
      </div>
    </div>
  );
}

function BackpackTab({ activeRootId }: { activeRootId: string }) {
  const root = useLiveQuery(() => db.roots.get(activeRootId), [activeRootId]);
  
  if (!root) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    db.roots.update(activeRootId, { backpack: e.target.value });
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider opacity-50">Global Context</h3>
      <textarea 
        className="flex-1 resize-none rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3 text-sm focus:border-[var(--accent)] focus:outline-none"
        value={root.backpack}
        onChange={handleChange}
        placeholder="Notes stored here are visible to the model across all branches..."
      />
    </div>
  );
}