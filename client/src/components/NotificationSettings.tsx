import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const TIMEZONES = [
  { label: 'Eastern (ET)',  value: 'America/New_York' },
  { label: 'Central (CT)',  value: 'America/Chicago' },
  { label: 'Mountain (MT)', value: 'America/Denver' },
  { label: 'Pacific (PT)',  value: 'America/Los_Angeles' },
  { label: 'Hawaii (HT)',   value: 'Pacific/Honolulu' },
  { label: 'London (GMT)',  value: 'Europe/London' },
];

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/Chicago';
  }
}

interface Props {
  userId: string;
  userEmail: string;
  onClose: () => void;
}

export function NotificationSettings({ userId, userEmail, onClose }: Props) {
  const [enabled,  setEnabled]  = useState(false);
  const [timezone, setTimezone] = useState(detectTimezone());
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    supabase
      .from('user_preferences')
      .select('email_notifications, timezone')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEnabled(data.email_notifications ?? true);
          setTimezone(data.timezone || detectTimezone());
        } else {
          // No record yet — default to ON for new users
          setEnabled(true);
        }
        setLoading(false);
      });
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('user_preferences')
      .upsert({
        user_id:             userId,
        email:               userEmail,
        email_notifications: enabled,
        timezone,
      }, { onConflict: 'user_id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const rowStyle: React.CSSProperties = {
    display:       'flex',
    alignItems:    'center',
    justifyContent:'space-between',
    padding:       '14px 16px',
    borderBottom:  '1px solid rgba(250,178,77,0.08)',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily:  'Jost, sans-serif',
    fontSize:    '0.8rem',
    letterSpacing:'0.05em',
    color:       'var(--color-cream)',
  };

  const subStyle: React.CSSProperties = {
    fontFamily:  'Jost, sans-serif',
    fontSize:    '0.7rem',
    color:       'rgba(207,150,153,0.55)',
    marginTop:   '2px',
  };

  if (loading) return (
    <div style={{ padding: '20px 16px', textAlign: 'center' }}>
      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.75rem', color: 'rgba(207,150,153,0.5)' }}>Loading…</span>
    </div>
  );

  return (
    <div>
      {/* Email notifications toggle */}
      <div style={rowStyle}>
        <div>
          <p style={labelStyle}>Email Reminders</p>
          <p style={subStyle}>Every 3 days · 5:30am ET</p>
        </div>
        <button
          onClick={() => setEnabled(e => !e)}
          style={{
            width:        '44px',
            height:       '24px',
            borderRadius: '12px',
            border:       'none',
            cursor:       'pointer',
            background:   enabled ? '#FAB24D' : 'rgba(255,255,255,0.1)',
            position:     'relative',
            transition:   'background 0.2s',
            flexShrink:   0,
          }}
          aria-label={enabled ? 'Disable email reminders' : 'Enable email reminders'}
        >
          <div style={{
            position:     'absolute',
            top:          '3px',
            left:         enabled ? '23px' : '3px',
            width:        '18px',
            height:       '18px',
            borderRadius: '50%',
            background:   '#ffffff',
            transition:   'left 0.2s',
            boxShadow:    '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>

      {/* Save button */}
      <div style={{ padding: '12px 16px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width:        '100%',
            background:   saved ? 'rgba(250,178,77,0.3)' : 'rgba(250,178,77,0.15)',
            border:       '1px solid rgba(250,178,77,0.3)',
            borderRadius: '8px',
            padding:      '10px',
            color:        saved ? '#FAB24D' : 'var(--color-gold)',
            fontFamily:   'Jost, sans-serif',
            fontSize:     '0.8rem',
            letterSpacing:'0.1em',
            textTransform:'uppercase',
            cursor:       saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
