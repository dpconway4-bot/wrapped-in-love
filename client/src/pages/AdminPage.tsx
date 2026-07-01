import React, { useEffect, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PostStatus = 'pending_review' | 'approved' | 'rejected' | 'published';
type EngagementStatus = 'pending' | 'approved' | 'rejected' | 'escalated';
type Classification = 'encouragement' | 'question' | 'sensitive' | 'hostile';

interface PostQueueRow {
  id: string;
  quality_name: string;
  pillar: string;
  post_day: number;
  caption: string;
  visual_direction: string;
  post_date: string;
  status: PostStatus;
  updated_at: string;
}

interface EngagementQueueRow {
  id: string;
  sender_name: string;
  source: string;
  classification: Classification;
  message_text: string;
  suggested_reply: string;
  crisis_flag: boolean;
  status: EngagementStatus;
  updated_at: string;
}

type HistoryItem =
  | (PostQueueRow & { _type: 'post' })
  | (EngagementQueueRow & { _type: 'engagement' });

type Tab = 'queue' | 'replies' | 'history';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const classificationConfig: Record<
  Classification,
  { label: string; tw: string }
> = {
  encouragement: { label: 'Encouragement', tw: 'bg-green-100 text-green-800' },
  question: { label: 'Question', tw: 'bg-blue-100 text-blue-800' },
  sensitive: { label: 'Sensitive', tw: 'bg-orange-100 text-orange-800' },
  hostile: { label: 'Hostile', tw: 'bg-red-100 text-red-800' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders(): HeadersInit {
  // Supabase session token is expected to be stored in localStorage by the
  // Supabase Auth client under the key `sb-<project>-auth-token`.
  const raw = Object.entries(localStorage).find(([k]) =>
    k.includes('-auth-token'),
  );
  const token = raw ? JSON.parse(raw[1])?.access_token : null;
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function apiFetch<T>(
  url: string,
  opts?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, { ...opts, headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error ?? 'Request failed' };
    return { data: json as T, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
        active
          ? 'text-white'
          : 'text-gray-500 hover:text-gray-700 bg-white border border-b-0 border-gray-200'
      }`}
      style={active ? { backgroundColor: NAVY, borderColor: NAVY } : {}}
    >
      {children}
    </button>
  );
}

function Badge({ text, tw }: { text: string; tw: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${tw}`}>
      {text}
    </span>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
      {message}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: `${GOLD} transparent ${GOLD} ${GOLD}` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1 — Post Queue
// ---------------------------------------------------------------------------

function PostQueueTab() {
  const [posts, setPosts] = useState<PostQueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiFetch<PostQueueRow[]>(
      '/api/admin/post-queue',
    );
    setLoading(false);
    if (error) { setError(error); return; }
    setPosts(data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: string, caption?: string) {
    setBusy(id);
    const body: Record<string, unknown> = { id, action: 'approve' };
    if (caption !== undefined) body.caption = caption;
    const { error } = await apiFetch('/api/admin/post-queue', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (error) { setError(error); return; }
    setEditingId(null);
    await load();
  }

  async function handleReject(id: string) {
    const note = window.prompt('Rejection note (optional):') ?? '';
    setBusy(id);
    const { error } = await apiFetch('/api/admin/post-queue', {
      method: 'PATCH',
      body: JSON.stringify({ id, action: 'reject', note }),
    });
    setBusy(null);
    if (error) { setError(error); return; }
    await load();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {error && <ErrorBanner message={error} />}
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">
          No posts pending review.
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{ color: NAVY }}
                  >
                    {post.quality_name}
                  </h3>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge
                      text={post.pillar}
                      tw="bg-purple-100 text-purple-800"
                    />
                    <Badge
                      text={`Day ${post.post_day}`}
                      tw="bg-gray-100 text-gray-700"
                    />
                    <Badge
                      text={new Date(post.post_date).toLocaleDateString()}
                      tw="bg-yellow-50 text-yellow-800"
                    />
                  </div>
                </div>
              </div>

              {/* Caption */}
              {editingId === post.id ? (
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 resize-y"
                  style={{ '--tw-ring-color': GOLD } as React.CSSProperties}
                  rows={5}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  {post.caption.slice(0, 200)}
                  {post.caption.length > 200 ? '…' : ''}
                </p>
              )}

              {post.visual_direction && (
                <p className="text-xs text-gray-400 italic mb-3">
                  Visual: {post.visual_direction}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap pt-1">
                {editingId === post.id ? (
                  <>
                    <button
                      disabled={busy === post.id}
                      onClick={() => handleApprove(post.id, editCaption)}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: GOLD }}
                    >
                      {busy === post.id ? 'Saving…' : 'Save & Approve'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled={busy === post.id}
                      onClick={() => handleApprove(post.id)}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: '#16a34a' }}
                    >
                      {busy === post.id ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                      disabled={busy === post.id}
                      onClick={() => {
                        setEditingId(post.id);
                        setEditCaption(post.caption);
                      }}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg border text-white transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: NAVY }}
                    >
                      Edit & Approve
                    </button>
                    <button
                      disabled={busy === post.id}
                      onClick={() => handleReject(post.id)}
                      className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2 — Message Replies
// ---------------------------------------------------------------------------

function MessageRepliesTab() {
  const [items, setItems] = useState<EngagementQueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiFetch<EngagementQueueRow[]>(
      '/api/admin/engagement-queue',
    );
    setLoading(false);
    if (error) { setError(error); return; }
    const rows = data ?? [];
    setItems(rows);
    // Pre-fill reply text areas with suggested replies
    const initial: Record<string, string> = {};
    rows.forEach((r) => { initial[r.id] = r.suggested_reply ?? ''; });
    setReplies(initial);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSend(id: string) {
    setBusy(id);
    const { error } = await apiFetch('/api/admin/engagement-queue', {
      method: 'PATCH',
      body: JSON.stringify({ id, action: 'approve', reply_text: replies[id] }),
    });
    setBusy(null);
    if (error) { setError(error); return; }
    await load();
  }

  async function handleReject(id: string) {
    setBusy(id);
    const { error } = await apiFetch('/api/admin/engagement-queue', {
      method: 'PATCH',
      body: JSON.stringify({ id, action: 'reject' }),
    });
    setBusy(null);
    if (error) { setError(error); return; }
    await load();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {error && <ErrorBanner message={error} />}
      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">
          No messages pending review.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const cc = classificationConfig[item.classification] ?? {
              label: item.classification,
              tw: 'bg-gray-100 text-gray-700',
            };
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border p-5 ${
                  item.crisis_flag ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-100'
                }`}
              >
                {item.crisis_flag && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                      Crisis Flagged
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: NAVY }}>
                    {item.sender_name}
                  </span>
                  <Badge text={item.source} tw="bg-indigo-100 text-indigo-800" />
                  <Badge text={cc.label} tw={cc.tw} />
                </div>

                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {item.message_text}
                </p>

                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Reply
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 resize-y mb-3"
                  style={{ '--tw-ring-color': GOLD } as React.CSSProperties}
                  rows={4}
                  value={replies[item.id] ?? ''}
                  onChange={(e) =>
                    setReplies((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                />

                <div className="flex gap-2">
                  <button
                    disabled={busy === item.id || !replies[item.id]?.trim()}
                    onClick={() => handleSend(item.id)}
                    className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: GOLD }}
                  >
                    {busy === item.id ? 'Sending…' : 'Send Reply'}
                  </button>
                  <button
                    disabled={busy === item.id}
                    onClick={() => handleReject(item.id)}
                    className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Reject (No Response)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3 — History
// ---------------------------------------------------------------------------

function HistoryTab() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await apiFetch<HistoryItem[]>(
        '/api/admin/history',
      );
      setLoading(false);
      if (error) { setError(error); return; }
      setItems(data ?? []);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {error && <ErrorBanner message={error} />}
      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">
          No history yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isPost = item._type === 'post';
            const post = isPost ? (item as PostQueueRow & { _type: 'post' }) : null;
            const eng = !isPost
              ? (item as EngagementQueueRow & { _type: 'engagement' })
              : null;

            const statusColors: Record<string, string> = {
              approved: 'bg-green-100 text-green-800',
              rejected: 'bg-red-100 text-red-800',
              published: 'bg-blue-100 text-blue-800',
              escalated: 'bg-orange-100 text-orange-800',
            };

            return (
              <div
                key={`${item._type}-${item.id}`}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3"
              >
                <div
                  className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isPost ? GOLD : '#6366f1' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge
                      text={isPost ? 'Post' : 'Message'}
                      tw={
                        isPost
                          ? 'bg-yellow-50 text-yellow-800'
                          : 'bg-indigo-50 text-indigo-800'
                      }
                    />
                    <Badge
                      text={item.status}
                      tw={statusColors[item.status] ?? 'bg-gray-100 text-gray-700'}
                    />
                    <span className="text-xs text-gray-400">
                      {new Date(item.updated_at).toLocaleString()}
                    </span>
                  </div>

                  {post && (
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {post.quality_name} — Day {post.post_day}
                    </p>
                  )}
                  {eng && (
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {eng.sender_name}: {eng.message_text?.slice(0, 80)}…
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdminPage component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('queue');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f7f4' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm"
        style={{ backgroundColor: NAVY }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: GOLD }}
          >
            Wrapped In Love
          </span>
          <span className="text-white text-sm opacity-60">/ Admin</span>
        </div>
        <span className="text-xs text-white opacity-40">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </header>

      {/* Tab bar */}
      <div
        className="px-6 pt-5 flex gap-1 border-b border-gray-200"
        style={{ backgroundColor: '#f8f7f4' }}
      >
        <TabButton active={tab === 'queue'} onClick={() => setTab('queue')}>
          Post Queue
        </TabButton>
        <TabButton active={tab === 'replies'} onClick={() => setTab('replies')}>
          Message Replies
        </TabButton>
        <TabButton active={tab === 'history'} onClick={() => setTab('history')}>
          History
        </TabButton>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {tab === 'queue' && <PostQueueTab />}
        {tab === 'replies' && <MessageRepliesTab />}
        {tab === 'history' && <HistoryTab />}
      </main>
    </div>
  );
}
