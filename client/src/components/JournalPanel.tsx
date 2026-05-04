import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { JournalEntry } from "@shared/schema";

interface JournalPanelProps {
  day: number;
  prompt: string;
}

export function JournalPanel({ day, prompt }: JournalPanelProps) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const { data: existing } = useQuery<JournalEntry | null>({
    queryKey: ["/api/journal", day],
    queryFn: () => apiRequest("GET", `/api/journal/${day}`).then(r => r.json()),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", "/api/journal", {
        day,
        content,
        createdAt: new Date().toISOString(),
      }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/journal", day] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const value = text || existing?.content || "";

  return (
    <div className="mt-8" data-testid="journal-panel">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1" style={{ background: "rgba(250,178,77,0.15)" }} />
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--color-rose)" }}>
          Write Something Down
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(250,178,77,0.15)" }} />
      </div>

      <p className="font-display text-base font-light italic mb-4 text-center" style={{ color: "var(--color-rose)" }}>
        {prompt}
      </p>

      <textarea
        value={value}
        onChange={e => { setText(e.target.value); setSaved(false); }}
        placeholder="This space is yours…"
        rows={4}
        data-testid="journal-textarea"
        className="w-full rounded-xl p-4 text-sm resize-none transition-all focus:outline-none"
        style={{
          background: "rgba(25,59,137,0.2)",
          border: "1px solid rgba(250,178,77,0.12)",
          color: "var(--color-cream)",
          fontFamily: "var(--font-body)",
          lineHeight: "1.7",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(250,178,77,0.35)"}
        onBlur={e => e.target.style.borderColor = "rgba(250,178,77,0.12)"}
      />

      <div className="flex justify-end mt-3">
        {saved && (
          <span className="text-xs mr-3 self-center" style={{ color: "var(--color-gold)" }}>
            Saved ✓
          </span>
        )}
        <button
          onClick={() => mutate(value)}
          disabled={!value.trim() || isPending}
          data-testid="btn-save-journal"
          className="px-5 py-2 rounded-full text-xs tracking-[0.15em] uppercase font-medium transition-all"
          style={{
            background: value.trim() ? "rgba(250,178,77,0.15)" : "rgba(250,178,77,0.05)",
            color: value.trim() ? "var(--color-gold)" : "rgba(250,178,77,0.3)",
            border: "1px solid rgba(250,178,77,0.2)",
          }}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
