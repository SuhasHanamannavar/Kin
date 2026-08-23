import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = 'Kin <notifications@kin.example.com>';
const FROM_NAME = 'Kin';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export function isEmailEnabled(): boolean {
  return !!resend;
}

// ============================================================
// High-importance signal alert email
// ============================================================
export async function sendSignalAlert(params: {
  toEmail: string;
  signal: {
    title: string;
    site: string;
    summary: string;
    why_it_matters: string;
    importance: string;
    category_name: string;
    detected_at: string;
  };
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.log('[EMAIL] Resend not configured — would send signal alert to:', params.toEmail);
    return { success: true };
  }

  const { toEmail, signal } = params;
  const importanceColor = signal.importance === 'high' ? '#DC2626' : '#D97706';
  const importanceBg = signal.importance === 'high' ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)';

  const detectedDate = new Date(signal.detected_at).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="font-size: 28px; margin-bottom: 8px;">🐧</div>
        <div style="font-size: 20px; font-weight: 700; color: #1A1A1E; letter-spacing: -0.02em;">Kin found something important</div>
        <div style="color: #8A8D9A; font-size: 13px; margin-top: 4px;">${detectedDate}</div>
      </div>

      <!-- Signal card -->
      <div style="background: white; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); border-left: 3px solid ${importanceColor}; padding: 22px; margin-bottom: 20px;">
        
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; background: rgba(45,95,138,0.1); color: #1E40AF;">
            ${signal.category_name}
          </span>
          <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; background: ${importanceBg}; color: ${importanceColor};">
            ${signal.importance.toUpperCase()} IMPORTANCE
          </span>
          <span style="margin-left: auto; color: #8A8D9A; font-size: 12px;">${signal.site}</span>
        </div>

        <div style="font-size: 17px; font-weight: 600; color: #1A1A1E; margin-bottom: 8px; line-height: 1.4;">
          ${signal.title}
        </div>

        <div style="font-size: 14px; color: #5A5D6B; line-height: 1.6; margin-bottom: 14px;">
          ${signal.summary}
        </div>

        <div style="background: ${importanceBg}; border: 1px solid ${importanceColor}22; border-radius: 10px; padding: 12px 14px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${importanceColor}; margin-bottom: 4px;">
            Why it matters
          </div>
          <div style="font-size: 13.5px; color: ${signal.importance === 'high' ? '#7F1D1D' : '#78350F'}; line-height: 1.5;">
            ${signal.why_it_matters}
          </div>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${APP_URL}/app/signals" style="display: inline-block; background: #1A1A1E; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
          View in Kin →
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; color: #8A8D9A; font-size: 12px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.06);">
        Sent by Kin · Your AI website monitoring companion<br>
        <a href="${APP_URL}/app/settings" style="color: #2D5F8A; text-decoration: none;">Manage notification preferences</a>
      </div>
    </div>
  `;

  const text = `
🐧 Kin found something important

${signal.title}
${signal.site}

${signal.summary}

Why it matters: ${signal.why_it_matters}

View in Kin: ${APP_URL}/app/signals
`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `⚠️ ${signal.title} — Kin Alert`,
      html,
      text,
    });
    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('[EMAIL] Failed to send signal alert:', err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================
// Weekly digest email
// ============================================================
export async function sendWeeklyDigest(params: {
  toEmail: string;
  userName?: string;
  signals: {
    title: string;
    site: string;
    summary: string;
    importance: string;
    category_name: string;
    detected_at: string;
    why_it_matters?: string;
  }[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.log('[EMAIL] Resend not configured — would send digest to:', params.toEmail);
    return { success: true };
  }

  const { toEmail, userName, signals } = params;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const highSignals = signals.filter(s => s.importance === 'high');
  const mediumSignals = signals.filter(s => s.importance === 'med');
  const lowSignals = signals.filter(s => s.importance === 'low');
  const sitesCovered = new Set(signals.map(s => s.site)).size;

  function renderSignalCard(s: any, showWhy: boolean = false) {
    const color = s.importance === 'high' ? '#DC2626' : s.importance === 'med' ? '#D97706' : '#6B7280';
    return `
      <div style="background: white; border-radius: 10px; border: 1px solid rgba(0,0,0,0.08); padding: 14px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
          <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 6px; border-radius: 4px; background: rgba(45,95,138,0.1); color: #1E40AF;">${s.category_name}</span>
          <span style="color: #8A8D9A; font-size: 11.5px; margin-left: auto;">${s.site}</span>
        </div>
        <div style="font-size: 14px; font-weight: 600; color: #1A1A1E; margin-bottom: 4px;">${s.title}</div>
        <div style="font-size: 13px; color: #5A5D6B; line-height: 1.5;">${s.summary}</div>
        ${showWhy && s.why_it_matters ? `<div style="font-size: 12.5px; color: ${color}; margin-top: 6px;">→ ${s.why_it_matters}</div>` : ''}
      </div>
    `;
  }

  let signalsHtml = '';
  
  if (signals.length === 0) {
    signalsHtml = `
      <div style="background: white; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); padding: 32px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 10px;">🐧✨</div>
        <div style="font-size: 16px; font-weight: 600; color: #1A1A1E; margin-bottom: 4px;">All quiet this week</div>
        <div style="font-size: 13.5px; color: #5A5D6B;">Kin hasn't detected any meaningful changes. Everything is stable.</div>
      </div>
    `;
  } else {
    if (highSignals.length > 0) {
      signalsHtml += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #DC2626; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; background: #DC2626; border-radius: 50%;"></span>
            Important updates (${highSignals.length})
          </div>
          ${highSignals.map(s => renderSignalCard(s, true)).join('')}
        </div>
      `;
    }
    
    if (mediumSignals.length > 0) {
      signalsHtml += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #D97706; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; background: #D97706; border-radius: 50%;"></span>
            Notable changes (${mediumSignals.length})
          </div>
          ${mediumSignals.map(s => renderSignalCard(s)).join('')}
        </div>
      `;
    }
    
    if (lowSignals.length > 0) {
      signalsHtml += `
        <div style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: #6B7280; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; background: #6B7280; border-radius: 50%;"></span>
            Minor updates (${lowSignals.length})
          </div>
          ${lowSignals.slice(0, 5).map(s => `
            <div style="background: white; border-radius: 10px; border: 1px solid rgba(0,0,0,0.06); padding: 10px 14px; margin-bottom: 6px; font-size: 13px; color: #5A5D6B;">
              <span style="font-weight: 500; color: #1A1A1E;">${s.title}</span>
              <span style="color: #8A8D9A; font-size: 11.5px; margin-left: 6px;">— ${s.site}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="font-size: 32px; margin-bottom: 10px;">🐧📋</div>
        <div style="font-size: 22px; font-weight: 700; color: #1A1A1E; letter-spacing: -0.02em;">Your Kin Weekly Digest</div>
        <div style="color: #8A8D9A; font-size: 13px; margin-top: 4px;">${today}</div>
      </div>

      <!-- Greeting & summary -->
      <div style="background: white; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); padding: 18px; margin-bottom: 24px;">
        <div style="font-size: 15px; color: #1A1A1E; margin-bottom: 6px;">
          ${greeting}
        </div>
        <div style="font-size: 14px; color: #5A5D6B; line-height: 1.6;">
          ${signals.length === 0 
            ? 'It\'s been a quiet week — Kin didn\'t find any meaningful changes on your watchlist. Everything is running smoothly.'
            : `Kin found <strong>${signals.length}</strong> change${signals.length > 1 ? 's' : ''} across <strong>${sitesCovered}</strong> site${sitesCovered > 1 ? 's' : ''} this week.`}
        </div>
        ${signals.length > 0 ? `
          <div style="display: flex; gap: 12px; margin-top: 14px;">
            <div style="flex: 1; text-align: center; padding: 10px; background: rgba(220,38,38,0.06); border-radius: 8px;">
              <div style="font-size: 18px; font-weight: 700; color: #DC2626;">${highSignals.length}</div>
              <div style="font-size: 11px; color: #991B1B; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">High</div>
            </div>
            <div style="flex: 1; text-align: center; padding: 10px; background: rgba(217,119,6,0.06); border-radius: 8px;">
              <div style="font-size: 18px; font-weight: 700; color: #D97706;">${mediumSignals.length}</div>
              <div style="font-size: 11px; color: #92400E; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">Medium</div>
            </div>
            <div style="flex: 1; text-align: center; padding: 10px; background: rgba(107,114,128,0.06); border-radius: 8px;">
              <div style="font-size: 18px; font-weight: 700; color: #4B5563;">${lowSignals.length}</div>
              <div style="font-size: 11px; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;">Low</div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Signals -->
      ${signalsHtml}

      <!-- CTA -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${APP_URL}/app/digest" style="display: inline-block; background: #1A1A1E; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Open full digest in Kin →
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; color: #8A8D9A; font-size: 12px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.06);">
        Sent by Kin · Your AI website monitoring companion<br>
        <a href="${APP_URL}/app/settings" style="color: #2D5F8A; text-decoration: none;">Manage notification preferences</a>
      </div>
    </div>
  `;

  const text = `
🐧 Kin Weekly Digest — ${today}

${greeting}

${signals.length === 0 
  ? 'It\'s been a quiet week — Kin didn\'t find any meaningful changes.'
  : `Kin found ${signals.length} change${signals.length > 1 ? 's' : ''} across ${sitesCovered} site${sitesCovered > 1 ? 's' : ''}.`}

${signals.map((s, i) => `
${i + 1}. ${s.title} [${s.importance.toUpperCase()}]
   ${s.site}
   ${s.summary}
`).join('')}

View full digest: ${APP_URL}/app/digest
`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `🐧 Your Kin Weekly Digest — ${signals.length} update${signals.length !== 1 ? 's' : ''}`,
      html,
      text,
    });
    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('[EMAIL] Failed to send digest:', err.message);
    return { success: false, error: err.message };
  }
}

// ============================================================
// Welcome email
// ============================================================
export async function sendWelcomeEmail(params: {
  toEmail: string;
  userName?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.log('[EMAIL] Resend not configured — would send welcome to:', params.toEmail);
    return { success: true };
  }

  const { toEmail, userName } = params;
  const greeting = userName ? `Hi ${userName},` : 'Hi there,';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="font-size: 48px; margin-bottom: 12px;">🐧</div>
        <div style="font-size: 24px; font-weight: 700; color: #1A1A1E; letter-spacing: -0.02em;">Welcome to Kin</div>
        <div style="color: #5A5D6B; font-size: 14px; margin-top: 6px;">Your AI website monitoring companion</div>
      </div>

      <div style="background: white; border-radius: 14px; border: 1px solid rgba(0,0,0,0.08); padding: 24px; margin-bottom: 24px;">
        <div style="font-size: 15px; color: #1A1A1E; margin-bottom: 14px; line-height: 1.6;">
          ${greeting} I'm Kin — your penguin AI who quietly watches websites and tells you when something meaningful changes.
        </div>

        <div style="font-size: 14px; color: #5A5D6B; line-height: 1.7; margin-bottom: 18px;">
          Here's how to get started:
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(45,95,138,0.1); color: #2D5F8A; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;">1</div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #1A1A1E;">Add your first URL</div>
              <div style="font-size: 13px; color: #5A5D6B; margin-top: 2px;">Paste any website you want to monitor</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(45,95,138,0.1); color: #2D5F8A; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;">2</div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #1A1A1E;">Kin does the rest</div>
              <div style="font-size: 13px; color: #5A5D6B; margin-top: 2px;">Automatic checks, AI analysis, plain-English alerts</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(45,95,138,0.1); color: #2D5F8A; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0;">3</div>
            <div>
              <div style="font-size: 14px; font-weight: 600; color: #1A1A1E;">Try Build with Kin</div>
              <div style="font-size: 13px; color: #5A5D6B; margin-top: 2px;">Type plain English, Kin builds the scraper</div>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${APP_URL}/app/watchlist" style="display: inline-block; background: #1A1A1E; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Add your first URL →
        </a>
      </div>

      <div style="text-align: center; color: #8A8D9A; font-size: 12px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.06);">
        Sent by Kin · Powered by MiMo V2.5 AI
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: '🐧 Welcome to Kin — your AI website monitor',
      html,
    });
    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error('[EMAIL] Failed to send welcome:', err.message);
    return { success: false, error: err.message };
  }
}
