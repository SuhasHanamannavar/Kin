import Groq from 'groq-sdk';
import type { AIClassificationResult, ScraperConfig } from '@/types';

// ============================================================
// AI Provider Configuration
// 
// Priority:
// 1. ZEN_API_KEY → Direct Zen Mimo V2.5 API call
// 2. GROQ_API_KEY → Zen Mimo V2.5 via Groq marketplace
// ============================================================

const ZEN_API_KEY = process.env.ZEN_API_KEY || '';
const ZEN_API_BASE_URL = process.env.ZEN_API_BASE_URL || 'https://opencode.ai/zen/v1';
const ZEN_MODEL = process.env.ZEN_MODEL || 'mimo-v2.5-free';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// Model identifiers for Groq fallback
const GROQ_PRIMARY_MODEL = 'zenith-ai/zen-mimo-2.5';
const GROQ_FALLBACK_MODEL = 'llama-3.1-70b-versatile';
const GROQ_FALLBACK_MODEL_2 = 'mixtral-8x7b-32768';

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

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Zen API ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from Zen API');
      }
      
      return content;
    } catch (err: any) {
      console.warn('Zen API call failed:', err.message);
      // Fall through to Groq if available
    }
  }

  // --- Option 2: Groq API ---
  if (groq) {
    const modelsToTry = [GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODEL, GROQ_FALLBACK_MODEL_2];
    
    for (const model of modelsToTry) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens,
          ...(response_format ? { response_format } : {}),
        });
        
        const content = response.choices[0]?.message?.content;
        if (content) return content;
      } catch (err) {
        console.warn(`Groq model ${model} failed, trying next...`);
      }
    }
  }

  throw new Error('No AI provider available. Set either ZEN_API_KEY or GROQ_API_KEY.');
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

const CHAT_SYSTEM_PROMPT = `You are Kin, a friendly penguin AI who watches websites for people.
Keep your answers:
- Simple and clear — no jargon
- Short when possible, detailed when needed
- Grounded in the user's actual data
- Action-oriented — suggest what to do next
- Warm and helpful, like a smart friend

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

  return "I'm having a little trouble connecting right now, but I'm still watching your websites!";
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
