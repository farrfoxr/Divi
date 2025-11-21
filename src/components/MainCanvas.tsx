'use client';
import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { addMessage, createBranch } from '@/lib/knowledge-graph';

interface MainCanvasProps {
  activeRootId: string | null;
  activeNodeId: string | null;
  setActiveNodeId: (id: string) => void;
}

export default function MainCanvas({ activeRootId, activeNodeId, setActiveNodeId }: MainCanvasProps) {
  const [input, setInput] = useState('');
  const [isBranching, setIsBranching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeNode = useLiveQuery(async () => {
    if (activeNodeId) {
      return await db.nodes.get(activeNodeId);
    }
    return undefined;
  }, [activeNodeId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeNode?.messages]);

  if (!activeRootId || !activeNodeId || !activeNode) {
    return <div className="flex h-screen items-center justify-center text-[var(--text-secondary)]">Select a topic to begin</div>;
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (isBranching) {
      // Branch Logic
      const newNodeId = await createBranch(activeRootId, activeNodeId, input.slice(0, 20) + "...");
      await addMessage(newNodeId, 'user', input);
      // Simulate Model Response (Mock)
      setTimeout(() => addMessage(newNodeId, 'model', `I've started a new branch focus on "${input}".`), 500);
      setActiveNodeId(newNodeId);
      setIsBranching(false);
    } else {
      // Normal Chat Logic
      await addMessage(activeNodeId, 'user', input);
      // Simulate Model Response (Mock)
      setTimeout(() => addMessage(activeNodeId, 'model', `Echo: ${input}`), 500);
    }
    setInput('');
  };

  return (
    <main className="flex h-screen flex-1 flex-col bg-[var(--bg-app)]">
      {/* Task 3: Polished Header */}
      <header className="flex h-16 items-center justify-center px-8 relative">
        <h1 className="text-lg font-medium text-[var(--text-primary)]">
          {activeNode.title}
        </h1>
        {/* Depth removed from here */}
      </header>

      {/* Message Area - Clean Slate */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {activeNode.messages.length === 0 && (
            <div className="mt-20 text-center text-[var(--text-secondary)]">
              <p>This is the start of a new thought branch.</p>
            </div>
          )}
          
          {activeNode.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-[1.2rem] px-5 py-3 leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-[var(--bg-user-bubble)] text-[var(--text-primary)]' 
                  : 'text-[var(--text-primary)]'
                }
              `}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-[1.5rem] bg-[var(--bg-sidebar)] p-2 transition-colors focus-within:bg-white focus-within:shadow-md dark:focus-within:bg-[#1e1f20]">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isBranching ? "Name your new branch..." : "Ask a follow up..."}
            className="max-h-48 min-h-[3rem] w-full resize-none bg-transparent px-4 py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
          
          <div className="flex items-center justify-between px-2 pb-1">
            <button
              onClick={() => setIsBranching(!isBranching)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors
                ${isBranching 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                  : 'bg-transparent text-[var(--text-secondary)] hover:bg-black/5'
                }
              `}
            >
              <span className="text-lg">Lr</span> {/* Fractal Icon Placeholder */}
              {isBranching ? 'Mode: Branching' : 'Branch / Focus'}
            </button>

            <button 
              onClick={handleSend}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--bg-app)] transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-[var(--text-secondary)]">
          Divi can make mistakes. Check important info.
        </div>
      </div>
    </main>
  );
}