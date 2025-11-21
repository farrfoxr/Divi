'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import Sidebar from './Sidebar';
import MainCanvas from './MainCanvas';

export default function AppShell() {
  const [activeRootId, setActiveRootId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Sync logic: When activeRootId changes, update activeNodeId to the root's last state
  useEffect(() => {
    if (activeRootId) {
      db.roots.get(activeRootId).then(root => {
        if (root && root.lastActiveNodeId) {
          setActiveNodeId(root.lastActiveNodeId);
        }
      });
    } else {
      setActiveNodeId(null);
    }
  }, [activeRootId]);

  // Sync logic: When activeNodeId changes, update the root's tracker
  useEffect(() => {
    if (activeRootId && activeNodeId) {
      db.roots.update(activeRootId, { lastActiveNodeId: activeNodeId });
    }
  }, [activeNodeId, activeRootId]);

  // Task 2: Debug Nuke Logic
  const handleResetDB = async () => {
    if (window.confirm("⚠️ WARNING: This will wipe all data and reset the app. Are you sure?")) {
      await db.delete();
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-app)]">
      <Sidebar 
        activeRootId={activeRootId}
        activeNodeId={activeNodeId}
        setActiveRootId={setActiveRootId}
        setActiveNodeId={setActiveNodeId}
        onResetDB={handleResetDB}
      />
      <MainCanvas 
        activeRootId={activeRootId}
        activeNodeId={activeNodeId}
        setActiveNodeId={setActiveNodeId}
      />
    </div>
  );
}