"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Shared voice-conversation store.
//
// Split into TWO contexts on purpose:
//  - ActionsContext: stable function identities (never changes) →
//    VoiceMode consumes only this, so transcript updates never
//    re-render VoiceMode (and therefore never re-render the heavy 3D
//    orb). This is the core of the smoothness fix.
//  - StateContext: the reactive transcript → only the lightweight
//    Sidebar consumes this and re-renders on it.

export type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: boolean;
};

type ConvoState = {
  turns: Turn[];
  partial: string; // live words being spoken (pre-commit)
  revealId: string | null; // assistant turn currently being revealed
  reveal: number; // chars of that turn to show
};

type ConvoActions = {
  setPartial: (t: string) => void;
  commitUser: (t: string) => void;
  startAssistant: () => string; // pushes a thinking turn, returns id
  setAssistantContent: (id: string, content: string) => void;
  setReveal: (id: string, n: number) => void;
  endAssistant: (id: string) => void;
  clearConversation: () => void;
};

const StateCtx = createContext<ConvoState | null>(null);
const ActionsCtx = createContext<ConvoActions | null>(null);

let idSeq = 0;
const nextId = () => `t${Date.now()}_${idSeq++}`;

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [partial, setPartialState] = useState("");
  const [revealId, setRevealId] = useState<string | null>(null);
  const [reveal, setRevealN] = useState(0);

  // All actions use functional updates → stable identity for the life
  // of the provider.
  const actions = useMemo<ConvoActions>(() => {
    return {
      setPartial: (t) => setPartialState(t),
      commitUser: (t) => {
        const trimmed = t.trim();
        if (!trimmed) return;
        setTurns((p) => [
          ...p,
          { id: nextId(), role: "user", content: trimmed },
        ]);
        setPartialState("");
      },
      startAssistant: () => {
        const id = nextId();
        setTurns((p) => [
          ...p,
          { id, role: "assistant", content: "", thinking: true },
        ]);
        setRevealId(id);
        setRevealN(0);
        return id;
      },
      setAssistantContent: (id, content) =>
        setTurns((p) =>
          p.map((t) =>
            t.id === id ? { ...t, content, thinking: false } : t
          )
        ),
      setReveal: (id, n) => {
        setRevealId(id);
        setRevealN(n);
      },
      endAssistant: (id) => {
        setTurns((p) =>
          p.map((t) => (t.id === id ? { ...t, thinking: false } : t))
        );
        setRevealId(null);
        setRevealN(0);
      },
      clearConversation: () => {
        setTurns([]);
        setPartialState("");
        setRevealId(null);
        setRevealN(0);
      },
    };
  }, []);

  const state = useMemo<ConvoState>(
    () => ({ turns, partial, revealId, reveal }),
    [turns, partial, revealId, reveal]
  );

  return (
    <ActionsCtx.Provider value={actions}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </ActionsCtx.Provider>
  );
}

export function useConvoActions(): ConvoActions {
  const c = useContext(ActionsCtx);
  if (!c) throw new Error("useConvoActions outside ConversationProvider");
  return c;
}

export function useConvoState(): ConvoState {
  const c = useContext(StateCtx);
  if (!c) throw new Error("useConvoState outside ConversationProvider");
  return c;
}
