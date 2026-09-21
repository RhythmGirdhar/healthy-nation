"use client";

import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from "react";
import { EMPTY_DRAFT, parseDraft, reconcileDraft } from "@/lib/inquiry";
import { parsePublicCatalog } from "@/lib/catalog-client";
import type { ContactSettings, InquiryDraft, PublicCatalog, Reconciliation } from "@/lib/types";

const STORAGE_KEY = "healthy-nation:request:v2";
type Update = (draft: InquiryDraft) => InquiryDraft;
type State = {
  draft: InquiryDraft;
  snapshot: PublicCatalog;
  ready: boolean;
  storageWarning: string;
  status: string;
  error: string;
  issues: string[];
  needsReview: boolean;
  refreshing: boolean;
  checkedAt: number | null;
  change: number;
  undo: InquiryDraft | null;
};
type Action =
  | { type: "restore"; draft: InquiryDraft; warning: string }
  | { type: "storage-error"; message: string }
  | { type: "update"; update: Update; message: string; reversible: boolean }
  | { type: "undo" }
  | { type: "dismiss-undo" }
  | { type: "refresh-start" }
  | { type: "refresh-success"; result: Reconciliation; snapshot: PublicCatalog; change: number; checkedAt: number }
  | { type: "refresh-error"; message: string }
  | { type: "acknowledge" };

function emptyDraft(snapshot: PublicCatalog): InquiryDraft {
  return { ...EMPTY_DRAFT, items: [], catalogRevision: snapshot.publication.revision };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "restore": {
      const changed = action.draft.catalogRevision !== state.snapshot.publication.revision;
      return {
        ...state, ready: true, draft: action.draft, storageWarning: action.warning,
        needsReview: changed,
        issues: changed ? ["This saved draft refers to a different catalog revision. Check the current catalog and review your selections before handoff."] : [],
      };
    }
    case "storage-error":
      return { ...state, storageWarning: action.message };
    case "update":
      if (!state.ready) return state;
      try {
        const draft = parseDraft(action.update(state.draft));
        return {
          ...state, draft, change: state.change + 1, checkedAt: null,
          undo: action.reversible ? state.draft : null,
          status: action.message, error: "",
        };
      } catch (failure) {
        return { ...state, error: failure instanceof Error ? failure.message : "That change could not be saved. Check the quantity, date, and selected option, then try again." };
      }
    case "undo":
      return state.undo ? {
        ...state, draft: state.undo, undo: null, change: state.change + 1, checkedAt: null,
        status: "Your previous selection has been restored.", error: "",
      } : state;
    case "dismiss-undo":
      return { ...state, undo: null };
    case "refresh-start":
      return { ...state, refreshing: true, checkedAt: null, error: "", status: "Checking the current catalog…" };
    case "refresh-success":
      if (state.change !== action.change) {
        return { ...state, refreshing: false, checkedAt: null, status: "", error: "Your draft changed during the catalog check. Check again to review the latest selections." };
      }
      return {
        ...state, snapshot: action.snapshot,
        draft: action.result.needsReview
          ? { ...action.result.draft, catalogRevision: state.draft.catalogRevision }
          : action.result.draft,
        issues: action.result.issues, needsReview: action.result.needsReview,
        checkedAt: action.checkedAt, refreshing: false, undo: null,
        status: action.result.needsReview ? "Catalog changes need your review." : "The current catalog has been checked. Availability still needs team confirmation.",
      };
    case "refresh-error":
      return { ...state, refreshing: false, checkedAt: null, status: "", error: action.message };
    case "acknowledge":
      return {
        ...state,
        draft: { ...state.draft, catalogRevision: state.snapshot.publication.revision },
        needsReview: false, undo: null, change: state.change + 1,
        status: "Catalog changes acknowledged. Invalid or unavailable selections still need correction.",
      };
  }
}

type RequestContextValue = State & {
  contact: ContactSettings;
  updateDraft: (update: Update, message: string, reversible?: boolean) => void;
  undoChange: () => void;
  dismissUndo: () => void;
  refreshCatalog: () => Promise<void>;
  acknowledgeCatalog: () => void;
  rememberMenu: (query: string, position: number) => void;
  takeMenuPosition: (query: string) => number | null;
};
const RequestContext = createContext<RequestContextValue | null>(null);

export function RequestProvider({ catalog, contact, children }: {
  catalog: PublicCatalog; contact: ContactSettings; children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, {
    draft: emptyDraft(catalog), snapshot: catalog, ready: false,
    storageWarning: "", status: "", error: "", issues: [], needsReview: false,
    refreshing: false, checkedAt: null, change: 0, undo: null,
  });
  const menuPosition = useRef<{ query: string; position: number } | null>(null);
  const fetchController = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      let draft = emptyDraft(catalog);
      let warning = "";
      try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          try {
            draft = parseDraft(JSON.parse(stored));
          } catch {
            warning = "Your saved draft was invalid or from an unsupported version. It was not restored; this request starts empty.";
          }
        }
      } catch {
        warning = "Session storage is unavailable. Your request works in this tab, but may be lost when you reload or leave.";
      }
      dispatch({ type: "restore", draft, warning });
    });
    return () => { cancelled = true; };
  }, [catalog]);

  useEffect(() => {
    if (!state.ready) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.draft));
    } catch {
      dispatch({ type: "storage-error", message: "This draft could not be saved in session storage. Keep this tab open; reloading may lose these changes." });
    }
  }, [state.draft, state.ready]);

  useEffect(() => () => fetchController.current?.abort(), []);

  async function refreshCatalog() {
    if (state.refreshing || !state.ready) return;
    fetchController.current?.abort();
    const controller = new AbortController();
    fetchController.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 12000);
    dispatch({ type: "refresh-start" });
    try {
      const response = await fetch("/catalog.json", { cache: "no-store", signal: controller.signal, credentials: "same-origin" });
      if (!response.ok) throw new Error("unavailable");
      const current = parsePublicCatalog(await response.json());
      const result = reconcileDraft(state.draft, state.snapshot, current);
      dispatch({ type: "refresh-success", snapshot: current, result, change: state.change, checkedAt: Date.now() });
    } catch {
      dispatch({ type: "refresh-error", message: "We could not verify the current catalog. Your draft is safe here, but meal or plan handoff stays blocked. Retry, copy a local draft, or ask the team about the current menu." });
    } finally {
      window.clearTimeout(timer);
    }
  }

  return (
    <RequestContext.Provider value={{
      ...state, contact,
      updateDraft: (update, message, reversible = false) => dispatch({ type: "update", update, message, reversible }),
      undoChange: () => dispatch({ type: "undo" }),
      dismissUndo: () => dispatch({ type: "dismiss-undo" }),
      acknowledgeCatalog: () => dispatch({ type: "acknowledge" }),
      refreshCatalog,
      rememberMenu: (query, position) => { menuPosition.current = { query, position }; },
      takeMenuPosition: (query) => {
        const saved = menuPosition.current;
        menuPosition.current = null;
        return saved?.query === query ? saved.position : null;
      },
    }}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.status}</div>
    </RequestContext.Provider>
  );
}

export function useRequest() {
  const context = useContext(RequestContext);
  if (!context) throw new Error("Request components must be inside RequestProvider.");
  return context;
}
