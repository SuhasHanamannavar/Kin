import Groq from 'groq-sdk';
import type { AIClassificationResult, ScraperConfig } from '@/types';

// ============================================================
// AI Provider Configuration
// 
// Priority:
// 1. Direct Zen API (if key provided and endpoint reachable)
// 2. Groq Cloud (Production ultra-fast inference with fallback models)
// ============================================================

const ZEN_API_KEY = process.env.ZEN_API_KEY || '';
const ZEN_API_BASE_URL = process.env.ZEN_API_BASE_URL || 'https://opencode.ai/zen/v1';
const ZEN_MODEL = process.env.ZEN_MODEL || 'mimo-v2.5-free';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// Verified active production Groq models in prioritized order
const GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'allam-2-7b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
];

// ============================================================
// Unified AI Chat Completion
// Tries Zen API first, then Groq
// ============================================================

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function createChatCompletion(params: {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}): Promise<string> {
  const { messages, temperature = 0.3, max_tokens = 800, response_format } = params;

  // --- Option 1: Direct Zen Mimo API ---
  if (ZEN_API_KEY) {
    try {
      const response = await fetch(`${ZEN_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ZEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: ZEN_MODEL,
          messages,
          temperature,
          max_tokens,
          ...(response_format ? { response_format } : {}),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && typeof content === 'string' && content.trim()) {
          return content;
        }
      } else {
        const errorText = await response.text().catch(() => '');
        console.warn(`Zen API ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (err: any) {
      console.warn('Zen API call failed:', err.message);
      // Fall through to Groq
    }
  }

  // --- Option 2: Groq API ---
  if (groq) {
    for (const model of GROQ_MODELS) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens,
          ...(response_format ? { response_format } : {}),
        });
        
        const msg = response.choices?.[0]?.message;
        let content = msg?.content;
        
        // Handle models with reasoning tokens if content was empty
        if ((!content || !content.trim()) && (msg as any)?.reasoning) {
          content = (msg as any).reasoning;
        }
        
        if (content && typeof content === 'string' && content.trim()) {
          return content.trim();
        }
      } catch (err: any) {
        console.warn(`Groq model ${model} failed:`, err.message);
      }
    }
  }

  throw new Error('All AI providers (Zen & Groq) are currently unavailable.');
}

// ============================================================
// Change Classification
// ============================================================

const CLASSIFICATION_SYSTEM_PROMPT = `You are Kin, a helpful AI monitoring agent shaped like a penguin.
Your job: Look at website changes and explain them clearly in plain English.

Rules for your output:
1. Be simple. Anyone should understand.
2. Be specific. Name what actually changed.
3. Be useful. Say why it matters in one short sentence.
4. Always output valid JSON only — no extra text, no markdown, no explanations.

JSON format:
{
  "category": "content|pricing|policy|feature|announce|deadline",
  "category_name": "Short readable name like 'Content Update' or 'Price Change'",
  "importance": "high|med|low",
  "title": "Short clear title (max 80 chars)",
  "summary": "1-2 simple sentences saying what changed",
  "why_it_matters": "One short sentence: why should the user care?",
  "evidence": [{"label": "What changed", "value": "specific detail"}]
}

Categories:
- deadline: dates, deadlines, timelines changed
- pricing: costs, prices, plans changed
- policy: terms, rules, policies updated
- feature: new features or capabilities added
- announce: announcements, news, roadmaps
- content: new articles, posts, general content updates

Importance:
- high: Affects goals, deadlines, money, or compliance
- med: Interesting and relevant but not urgent
- low: Minor or cosmetic changes only`;

export async function analyzeChangeWithAI(params: {
  url: string;
  oldText: string;
  newText: string;
  rawDiff: string;
  changeRatio: number;
}): Promise<AIClassificationResult> {
  const { url, oldText, newText, rawDiff, changeRatio } = params;

  const userPrompt = `Website: ${url}
About ${(changeRatio * 100).toFixed(0)}% of the page changed.

What was different:
${rawDiff || 'The page text was updated.'}

OLD text sample:
${oldText.substring(0, 1800)}

---

NEW text sample:
${newText.substring(0, 1800)}

---

Explain this change in simple English. Output JSON only.`;

  try {
    const content = await createChatCompletion({
      messages: [
        { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.15,
      max_tokens: 700,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(content);
    return {
      category: parsed.category || 'content',
      category_name: parsed.category_name || 'Content Update',
      importance: parsed.importance || 'med',
      title: parsed.title || 'Page content updated',
      summary: parsed.summary || 'Something changed on the page.',
      why_it_matters: parsed.why_it_matters || 'Check the page to see what is new.',
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
    };
  } catch (err: any) {
    console.warn('All AI providers failed for classification:', err.message);
  }

  // Simple fallback if all AI providers fail
  return {
    category: 'content',
    category_name: 'Content Update',
    importance: 'med',
    title: 'Website content updated',
    summary: `The page at ${url} has changed since the last check.`,
    why_it_matters: 'You may want to visit the page to see what is different.',
    evidence: rawDiff ? [{ label: 'Change snippet', value: rawDiff.substring(0, 120) }] : [],
  };
}

// ============================================================
// Kin Chat
// ============================================================

const CHAT_SYSTEM_PROMPT = `You are Kin, a friendly penguin AI companion who watches websites for people.
Keep your answers:
- Simple and clear — no jargon
- Short when possible, detailed when needed
- Grounded in the user's actual data
- Action-oriented — suggest what to do next
- Warm, polite, and helpful, like a loyal penguin companion 🐧

Use markdown for clarity: **bold** for key items, bullet points for lists.`;

export async function chatWithKinAI(params: {
  message: string;
  watchlistContext?: any[];
  signalsContext?: any[];
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
  userId: string;
}): Promise<string> {
  const { message, watchlistContext = [], signalsContext = [], conversationHistory = [] } = params;

  const contextParts: string[] = [];

  if (watchlistContext.length > 0) {
    contextParts.push(`Websites this user watches (${watchlistContext.length}):`);
    watchlistContext.forEach((u, i) => {
      contextParts.push(`${i + 1}. ${u.name || u.url} — ${u.url}`);
      contextParts.push(`   Status: ${u.status || 'watching'} | Signals: ${u.signal_count || 0}`);
    });
  }

  if (signalsContext.length > 0) {
    contextParts.push(`\nRecent changes found (${signalsContext.length}):`);
    signalsContext.forEach((s, i) => {
      contextParts.push(`${i + 1}. **${s.title}**`);
      contextParts.push(`   Site: ${s.site || '—'} | Importance: ${(s.importance || 'med').toUpperCase()}`);
      contextParts.push(`   ${s.summary}`);
    });
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
  ];

  if (contextParts.length > 0) {
    messages.push({
      role: 'system',
      content: `User's data:\n${contextParts.join('\n')}`,
    });
  }

  const recentHistory = conversationHistory.slice(-8);
  for (const turn of recentHistory) {
    messages.push({ role: turn.role, content: turn.content });
  }

  messages.push({ role: 'user', content: message });

  try {
    return await createChatCompletion({
      messages,
      temperature: 0.4,
      max_tokens: 900,
    });
  } catch (err: any) {
    console.warn('All AI providers failed for chat:', err.message);
  }

  // Smart contextual fallback response if AI provider is temporarily unavailable
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
    if (watchlistContext.length === 0) {
      return "Hello! 🐧 I'm Kin, your web monitoring companion! I watch web pages 24/7 so you never miss critical updates, pricing changes, or deadlines. You don't have any websites in your watchlist yet—head over to the **Watchlist** tab to add your first URL!";
    }
    return `Hello! 🐧 I'm Kin, your web monitoring companion! I'm currently monitoring **${watchlistContext.length} website${watchlistContext.length > 1 ? 's' : ''}** for you. How can I help you today?`;
  }

  if (lowerMsg.includes('watchlist') || lowerMsg.includes('monitor') || lowerMsg.includes('website')) {
    if (watchlistContext.length === 0) {
      return "You haven't added any websites to your watchlist yet. Click **Watchlist** in the sidebar and paste any URL you want me to track!";
    }
    const siteList = watchlistContext.slice(0, 5).map((w, i) => `${i + 1}. **${w.name || w.url}** (${w.url})`).join('\n');
    return `Here are the websites I'm currently monitoring for you:\n\n${siteList}\n\nAsk me about any of these, or let me know if you want to scan one right now!`;
  }

  if (lowerMsg.includes('signal') || lowerMsg.includes('change') || lowerMsg.includes('update')) {
    if (signalsContext.length === 0) {
      return "No new changes or signals detected yet. As soon as I detect updates, deadlines, or pricing adjustments on your monitored pages, they will appear right here!";
    }
    const signalList = signalsContext.slice(0, 3).map((s, i) => `${i + 1}. **${s.title}**\n   ${s.summary}`).join('\n\n');
    return `Here are your recent signals:\n\n${signalList}`;
  }

  return "I'm Kin, your penguin AI companion! 🐧 I'm actively monitoring your watchlist for price changes, deadlines, content updates, and important announcements. Ask me to check your sites, summarize signals, or configure a new monitor!";
}

// ============================================================
// Build with Kin — Natural language to scraper configuration
// ============================================================

const BUILD_SCRAPER_SYSTEM_PROMPT = `You are Kin, an AI that builds website scrapers from plain English.
The user will describe what they want to monitor on a website.
Your job: Turn that description into a clear scraper configuration.

Output valid JSON only with this exact format:
{
  "website_url": "https://example.com",
  "name": "Short friendly name for this monitor",
  "content_type": "prices|news|deadlines|products|jobs|docs|general",
  "key_elements": ["list of things to watch for"],
  "suggested_selectors": ["CSS selector hints"],
  "scan_frequency": "1min|5min|15min|hourly|12h|daily|weekly",
  "noise_sensitivity": "balanced|conservative|aggressive",
  "summary": "One sentence explaining what this scraper will watch"
}

Rules:
- If the user doesn't specify a URL, leave website_url as an empty string ""
- If they don't specify frequency, default to "daily"
- If they don't specify sensitivity, default to "balanced"
- Be practical and specific about what to monitor
- Keep key_elements simple and actionable`;

export async function buildScraperFromPrompt(
  userPrompt: string,
  userId: string
): Promise<ScraperConfig & { name: string; summary: string; key_elements: string[] }> {
  try {
    const content = await createChatCompletion({
      messages: [
        { role: 'system', content: BUILD_SCRAPER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(content);
    return {
      url: parsed.website_url || '',
      name: parsed.name || 'New Monitor',
      content_type: parsed.content_type || 'general',
      selectors: parsed.suggested_selectors || [],
      frequency: parsed.scan_frequency || 'daily',
      noise_sensitivity: parsed.noise_sensitivity || 'balanced',
      summary: parsed.summary || 'Monitor this website for changes.',
      key_elements: parsed.key_elements || [],
    };
  } catch (err: any) {
    console.warn('All AI providers failed for build scraper:', err.message);
  }

  // Fallback
  return {
    url: '',
    name: 'New Monitor',
    content_type: 'general',
    selectors: [],
    frequency: 'daily',
    noise_sensitivity: 'balanced',
    summary: 'I need a website URL to build this scraper. Please tell me which site to watch.',
    key_elements: ['General page content'],
  };
}
