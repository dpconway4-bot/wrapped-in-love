import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

interface JournalPanelProps {
  day: number;
  prompt: string;
}

export function JournalPanel({ day, prompt }: JournalPanelProps) {
  const { session } = useAuth();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [initialized, setInitialized] = useState(false);
  const qc = useQueryClient();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: existing, isLoading } = useQuery<{ day: number; content: string } | null>({
    queryKey: ["/api/journal", day],
    queryFn: async () => {
      const token = session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/journal?day=${day}`, { headers });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // Reset state when navigating to a different day
  useEffect(() => {
    setText("");
    setInitialized(false);
    setSaved(false);
    setSaveError("");
  }, [day]);

  // Sync text state when existing entry loads (cross-device restore)
  useEffect(() => {
    if (!initialized && existing?.content) {
      setText(existing.content);
      setInitialized(true);
    } else if (!initialized && existing !== undefined) {
      setInitialized(true);
    }
  }, [existing, initialized]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (content: string) => {
      const token = session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ day, content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = [err.error, err.code, err.details].filter(Boolean).join(' | ');
        throw new Error(msg || `Save failed (${res.status})`);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/journal", day] });
      setSaved(true);
      setSaveError("");
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err: Error) => {
      setSaveError(err.message || "Not saved — try again");
      console.error('[JournalPanel] Save error:', err.message);
      setTimeout(() => setSaveError(""), 8000);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setText(newVal);
    setSaved(false);
    // Auto-save 2 seconds after user stops typing
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (newVal.trim()) mutate(newVal);
    }, 2000);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(214,154,45,0.12)";
    // Save immediately on blur if there's content
    if (text.trim()) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      mutate(text);
    }
  };

  const value = text;

  if (isLoading) {
    return (
      <div className="mt-8" data-testid="journal-panel">
        <div className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(25,59,137,0.15)" }} />
      </div>
    );
  }

  return (
    <div className="mt-8" data-testid="journal-panel">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1" style={{ background: "rgba(214,154,45,0.15)" }} />
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--color-rose)" }}>
          Write Something Down
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(214,154,45,0.15)" }} />
      </div>

      <p className="font-display text-base font-light italic mb-4 text-center" style={{ color: "var(--color-rose)" }}>
        {prompt}
      </p>

      <textarea
        value={value}
        onChange={handleChange}
        placeholder="This space is yours…"
        rows={4}
        data-testid="journal-textarea"
        className="w-full rounded-xl p-4 text-sm resize-none transition-all focus:outline-none"
        style={{
          background: "rgba(25,59,137,0.2)",
          border: "1px solid rgba(214,154,45,0.12)",
          color: "var(--color-cream)",
          fontFamily: "var(--font-body)",
          lineHeight: "1.7",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(214,154,45,0.35)"}
        onBlur={handleBlur}
      />

      <div className="flex justify-end mt-3">
        {saved && (
          <span className="text-xs mr-3 self-center" style={{ color: "var(--color-gold)" }}>
            Saved ✓
          </span>
        )}
        {saveError && (
          <span className="text-xs mr-3 self-center" style={{ color: "#C97B6B" }}>
            {saveError}
          </span>
        )}
        <button
          onClick={() => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); mutate(value); }}
          disabled={!value.trim() || isPending}
          data-testid="btn-save-journal"
          className="px-5 py-2 rounded-full text-xs tracking-[0.15em] uppercase font-medium transition-all"
          style={{
            background: value.trim() ? "rgba(214,154,45,0.15)" : "rgba(214,154,45,0.05)",
            color: value.trim() ? "var(--color-gold)" : "rgba(214,154,45,0.3)",
            border: "1px solid rgba(214,154,45,0.2)",
          }}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
