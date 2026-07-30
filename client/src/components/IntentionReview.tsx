import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

interface StepProps {
  number: string;
  label: string;
  content: string;
  isLoading: boolean;
}

function IntentionStep({ number, label, content, isLoading }: StepProps) {
  return (
    <div
      style={{
        borderRadius: "14px",
        border: "1px solid rgba(214,154,45,0.15)",
        background: "rgba(25,59,137,0.15)",
        padding: "18px 20px",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <span
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
            opacity: 0.7,
          }}
        >
          Step {number}
        </span>
        <div style={{ height: "1px", flex: 1, background: "rgba(214,154,45,0.1)" }} />
      </div>
      <p
        style={{
          fontFamily: "Jost, sans-serif",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-rose)",
          marginBottom: "10px",
          opacity: 0.85,
        }}
      >
        {label}
      </p>
      {isLoading ? (
        <div
          style={{
            height: "20px",
            borderRadius: "6px",
            background: "rgba(214,154,45,0.06)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ) : content ? (
        <p
          style={{
            fontFamily: "var(--font-body, Georgia, serif)",
            fontSize: "0.95rem",
            lineHeight: "1.7",
            color: "rgba(245,239,230,0.9)",
            fontStyle: "italic",
          }}
        >
          "{content}"
        </p>
      ) : (
        <p
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "0.82rem",
            color: "rgba(201,123,107,0.45)",
            fontStyle: "italic",
          }}
        >
          Nothing written yet — go back and add your reflection.
        </p>
      )}
    </div>
  );
}

export function IntentionReview() {
  const { session } = useAuth();

  const fetchEntry = async (day: number): Promise<string> => {
    const token = session?.access_token;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`/api/journal?day=${day}`, { headers });
    if (!res.ok) return "";
    const data = await res.json();
    return data?.content || "";
  };

  const { data: entry1, isLoading: l1 } = useQuery({
    queryKey: ["/api/journal?day", -6, !!session],
    queryFn: () => fetchEntry(-6),
    enabled: !!session,
  });
  const { data: entry2, isLoading: l2 } = useQuery({
    queryKey: ["/api/journal?day", -4, !!session],
    queryFn: () => fetchEntry(-4),
    enabled: !!session,
  });
  const { data: entry3, isLoading: l3 } = useQuery({
    queryKey: ["/api/journal?day", -3, !!session],
    queryFn: () => fetchEntry(-3),
    enabled: !!session,
  });

  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{ height: "1px", flex: 1, background: "rgba(214,154,45,0.15)" }} />
        <span
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--color-rose)",
          }}
        >
          Your Intention
        </span>
        <div style={{ height: "1px", flex: 1, background: "rgba(214,154,45,0.15)" }} />
      </div>

      <p
        style={{
          fontFamily: "Jost, sans-serif",
          fontSize: "0.88rem",
          lineHeight: "1.7",
          color: "rgba(245,239,230,0.7)",
          marginBottom: "20px",
        }}
      >
        Before you begin the 100 days, here is what you have already written. This is your starting point — the person, the pattern, and the prayer.
      </p>

      <IntentionStep
        number="One"
        label="The person you are bringing into this study"
        content={entry1 || ""}
        isLoading={l1}
      />
      <IntentionStep
        number="Two"
        label="One honest thing about yourself in that relationship"
        content={entry2 || ""}
        isLoading={l2}
      />
      <IntentionStep
        number="Three"
        label="What you are asking God to do in you"
        content={entry3 || ""}
        isLoading={l3}
      />

      {/* Closing call */}
      <p
        style={{
          fontFamily: "Jost, sans-serif",
          fontSize: "0.88rem",
          lineHeight: "1.7",
          color: "rgba(245,239,230,0.75)",
          marginTop: "8px",
        }}
      >
        God will do the rest as you show up, day by day, characteristic by characteristic.
      </p>

      {/* Prayer transition */}
      <div
        style={{
          marginTop: "28px",
          padding: "18px 20px",
          borderRadius: "14px",
          border: "1px solid rgba(214,154,45,0.2)",
          background: "rgba(214,154,45,0.04)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "0.72rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--color-gold)",
          }}
        >
          A prayer before you begin
        </p>
        <p
          style={{
            fontFamily: "Jost, sans-serif",
            fontSize: "0.82rem",
            color: "rgba(245,239,230,0.6)",
            marginTop: "6px",
          }}
        >
          The next page is your prayer before Day 1.
        </p>
      </div>
    </div>
  );
}
