import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  bg: "#0A0C10",
  surface: "#0F1218",
  surfaceAlt: "#141820",
  border: "#1E2530",
  borderBright: "#2A3545",
  accent: "#00D4FF",
  accentDim: "#0088AA",
  accentGlow: "rgba(0,212,255,0.15)",
  green: "#00FF88",
  greenDim: "#00AA55",
  amber: "#FFB700",
  red: "#FF4466",
  purple: "#9D4EDD",
  text: "#E8EDF5",
  textMuted: "#6B7A8D",
  textDim: "#3D4A5C",
};

const style = (obj) => obj;

// ─── DATA ───────────────────────────────────────────────────────────────────

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    content: "Personal AI OS online. I'm routing through Claude via OpenRouter. Memory engine active. How can I help, Suresh?",
    model: "claude-3-haiku",
    ts: "09:41",
    memory: false,
  },
];

const MEMORIES = [
  { id: 1, type: "semantic", icon: "⚡", text: "Snowflake + dbt Data Engineer at TCS Chennai", confidence: 0.98, age: "3d" },
  { id: 2, type: "episodic", icon: "📅", text: "Completed Snowflake interview prep session on streams & tasks", confidence: 0.95, age: "1d" },
  { id: 3, type: "semantic", icon: "🎯", text: "Actively job hunting for Snowflake/dbt roles on Naukri", confidence: 0.97, age: "2d" },
  { id: 4, type: "procedural", icon: "🔄", text: "Interview prep workflow: notes → questions → evaluate → report", confidence: 0.91, age: "5d" },
  { id: 5, type: "semantic", icon: "🍓", text: "Raspberry Pi Zero 2W running DietPi aarch64 for AI agent", confidence: 0.99, age: "7d" },
  { id: 6, type: "episodic", icon: "🦀", text: "Built Tommy-v4 in Rust: Telegram bot with multi-provider LLM fallback", confidence: 0.96, age: "14d" },
  { id: 7, type: "semantic", icon: "📈", text: "Tracks Manappuram Finance, South Indian Bank, Natco Pharma (NSE)", confidence: 0.88, age: "10d" },
  { id: 8, type: "semantic", icon: "📚", text: "Interested in Tamil literature — Thirukkural", confidence: 0.92, age: "21d" },
];

const AGENTS = [
  { id: "chat", name: "Chat Agent", icon: "💬", status: "active", desc: "General conversations & Q&A", tasks: 12, model: "claude-haiku" },
  { id: "research", name: "Research Agent", icon: "🔍", status: "active", desc: "Web search, doc analysis, summaries", tasks: 4, model: "claude-sonnet" },
  { id: "coding", name: "Coding Agent", icon: "💻", status: "idle", desc: "Code gen, debug, review", tasks: 0, model: "gpt-4o" },
  { id: "database", name: "Database Agent", icon: "🗄️", status: "active", desc: "Snowflake, SQL, dbt, data engineering", tasks: 7, model: "claude-haiku" },
  { id: "memory", name: "Memory Agent", icon: "🧠", status: "active", desc: "Memory mgmt, context retrieval, fact extraction", tasks: 31, model: "local" },
  { id: "automation", name: "Automation Agent", icon: "⚙️", status: "idle", desc: "Tasks, schedules, device actions", tasks: 0, model: "local" },
];

const DEVICES = [
  { id: "android", name: "Pixel 7a", icon: "📱", type: "Android", status: "online", role: "Primary Client", cpu: 34, ram: 58, sync: "live" },
  { id: "pi", name: "Pi Zero 2W", icon: "🍓", type: "Raspberry Pi", status: "online", role: "Sync + Cache + Bot", cpu: 67, ram: 71, sync: "live" },
  { id: "laptop", name: "ThinkPad", icon: "💻", type: "Windows 11", status: "online", role: "GPU Inference", cpu: 22, ram: 44, sync: "2m ago" },
  { id: "server", name: "VPS", icon: "🖥️", type: "Linux / FastAPI", status: "online", role: "Backend + ChromaDB", cpu: 18, ram: 39, sync: "live" },
];

const TASKS = [
  { id: 1, title: "Naukri profile optimization", agent: "Research", status: "done", priority: "high", created: "Today" },
  { id: 2, title: "SnowPro Core cert study plan", agent: "Database", status: "active", priority: "high", created: "Today" },
  { id: 3, title: "ZeroClaw SmolLM2-360M integration", agent: "Coding", status: "pending", priority: "medium", created: "Yesterday" },
  { id: 4, title: "Stock alerts: MANAPPURAM < ₹180", agent: "Automation", status: "active", priority: "medium", created: "3d ago" },
  { id: 5, title: "Resume dbt skills reframe", agent: "Research", status: "done", priority: "high", created: "4d ago" },
  { id: 6, title: "Thirukkural daily quote scheduler", agent: "Automation", status: "active", priority: "low", created: "7d ago" },
];

const MODELS = [
  { id: "claude-haiku", name: "Claude Haiku", provider: "Anthropic", type: "cloud", status: "active", latency: "~800ms", cost: "$$" },
  { id: "claude-sonnet", name: "Claude Sonnet", provider: "Anthropic", type: "cloud", status: "active", latency: "~1.5s", cost: "$$$" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", type: "cloud", status: "active", latency: "~1.2s", cost: "$$$" },
  { id: "gemma-2b", name: "Gemma 2B Q4", provider: "Local / llama.cpp", type: "local", status: "running", latency: "~2s", cost: "free", size: "1.5GB" },
  { id: "smollm2", name: "SmolLM2-360M", provider: "Local / Pi Zero", type: "local", status: "idle", latency: "~5s", cost: "free", size: "220MB" },
  { id: "phi3-mini", name: "Phi-3 Mini Q4", provider: "Local / Ollama", type: "local", status: "idle", latency: "~3s", cost: "free", size: "2.2GB" },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Syne', sans-serif;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.borderBright}; border-radius: 2px; }

  .mono { font-family: 'JetBrains Mono', monospace; }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 6px ${COLORS.accentGlow}; }
    50% { box-shadow: 0 0 18px rgba(0,212,255,0.35); }
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  .fade-in { animation: fadeInUp 0.3s ease forwards; }

  input, textarea {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }

  button { cursor: pointer; font-family: 'Syne', sans-serif; }
`;

// ─── StatusDot ───
const StatusDot = ({ status }) => {
  const colors = { active: COLORS.green, online: COLORS.green, running: COLORS.accent, idle: COLORS.amber, done: COLORS.textMuted, pending: COLORS.amber, offline: COLORS.red };
  const c = colors[status] || COLORS.textMuted;
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7, borderRadius: "50%",
      background: c, boxShadow: `0 0 6px ${c}`,
      animation: (status === "active" || status === "online" || status === "running") ? "pulse-glow 2s infinite" : "none",
      flexShrink: 0,
    }} />
  );
};

// ─── MiniBar ───
const MiniBar = ({ val, color = COLORS.accent }) => (
  <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden", width: "100%" }}>
    <div style={{ height: "100%", width: `${val}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
  </div>
);

// ─── Tag ───
const Tag = ({ children, color = COLORS.accent }) => (
  <span style={{
    fontSize: 10, fontFamily: "JetBrains Mono", fontWeight: 500,
    color, border: `1px solid ${color}33`, background: `${color}11`,
    padding: "2px 6px", borderRadius: 3, letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  }}>{children}</span>
);

// ─── SideNav ───
const NAV_ITEMS = [
  { id: "chat", icon: "⬡", label: "CHAT" },
  { id: "memory", icon: "◈", label: "MEMORY" },
  { id: "agents", icon: "◉", label: "AGENTS" },
  { id: "tasks", icon: "▦", label: "TASKS" },
  { id: "devices", icon: "⬡", label: "SERVICES" },
  { id: "models", icon: "◈", label: "MODELS" },
];

const SideNav = ({ active, onNav }) => (
  <div style={{
    width: 64, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`,
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "16px 0", gap: 4, flexShrink: 0,
  }}>
    {/* Logo */}
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, marginBottom: 20,
      boxShadow: `0 0 20px ${COLORS.accentGlow}`,
    }}>⬡</div>

    {NAV_ITEMS.map(n => (
      <button key={n.id} onClick={() => onNav(n.id)} title={n.label} style={{
        width: 44, height: 44, borderRadius: 10, border: "none",
        background: active === n.id ? `${COLORS.accent}18` : "transparent",
        color: active === n.id ? COLORS.accent : COLORS.textMuted,
        fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
        outline: active === n.id ? `1px solid ${COLORS.accent}40` : "none",
        transition: "all 0.2s",
        position: "relative",
      }}>
        {n.icon}
        {active === n.id && (
          <div style={{
            position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)",
            width: 2, height: 20, background: COLORS.accent, borderRadius: 1,
          }} />
        )}
      </button>
    ))}

    <div style={{ flex: 1 }} />
    <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
      TS
    </div>
  </div>
);

// ─── CHAT VIEW ───────────────────────────────────────────────────────────────

const ChatView = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("claude-haiku");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const bottomRef = useRef(null);
  const conversationRef = useRef([...INITIAL_MESSAGES]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const SYSTEM_PROMPT = `You are Personal AI OS — a private, cross-platform AI assistant built for Suresh Kumar T (also known as "ts"), a Snowflake + dbt Data Engineer at TCS Chennai with ~6 years IT experience. 

Key context about Suresh:
- Works on ASOS and Croma client projects using Snowflake, dbt, Airflow
- Actively job hunting for Snowflake/dbt Data Engineer roles
- Runs a Raspberry Pi Zero 2W with DietPi for AI agents (project: ZeroClaw/Tommy-v4 in Rust)
- Tracks NSE stocks: Manappuram Finance, South Indian Bank, Natco Pharma
- Interested in Tamil literature (Thirukkural) and IEMs
- Prefers concise, direct, actionable responses

You are the chat interface of his Personal AI OS. Be helpful, concise, and personal. Reference his context naturally when relevant. You route simple chats to local models, coding to GPT, research to Claude. Memory engine is ${memoryEnabled ? "ACTIVE" : "DISABLED"}.

Keep responses reasonably short (2-4 sentences for conversational messages, longer for technical). This is a mobile-friendly chat interface.`;

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), role: "user", content: input.trim(), ts: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    conversationRef.current = newMessages;
    setInput("");
    setLoading(true);

    try {
      const apiMessages = conversationRef.current.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "Error: no response";
      const assistantMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: text,
        model,
        ts: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        memory: memoryEnabled,
      };
      const updated = [...newMessages, assistantMsg];
      setMessages(updated);
      conversationRef.current = updated;
    } catch (e) {
      const errMsg = {
        id: Date.now() + 1, role: "assistant",
        content: `⚠️ API error: ${e.message}. Check your Anthropic connection.`,
        model, ts: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), memory: false,
      };
      setMessages(prev => [...prev, errMsg]);
    }
    setLoading(false);
  }, [input, loading, messages, model, memoryEnabled]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const QUICK = ["SnowPro study plan", "Thirukkural verse", "My Pi Zero status", "Job hunt tips"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Chat Interface</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>Model Router → {model}</div>
        </div>
        <div style={{ flex: 1 }} />
        {/* Controls */}
        <button onClick={() => setMemoryEnabled(m => !m)} style={{
          fontSize: 11, fontFamily: "JetBrains Mono", color: memoryEnabled ? COLORS.green : COLORS.textMuted,
          background: memoryEnabled ? `${COLORS.green}12` : COLORS.surfaceAlt,
          border: `1px solid ${memoryEnabled ? COLORS.green + "40" : COLORS.border}`,
          borderRadius: 6, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5,
        }}>
          <StatusDot status={memoryEnabled ? "active" : "idle"} /> MEM
        </button>
        <select value={model} onChange={e => setModel(e.target.value)} style={{
          background: COLORS.surfaceAlt, color: COLORS.text, border: `1px solid ${COLORS.border}`,
          borderRadius: 6, padding: "4px 8px", fontSize: 11, fontFamily: "JetBrains Mono",
        }}>
          <option value="claude-haiku">claude-haiku</option>
          <option value="claude-sonnet">claude-sonnet</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gemma-2b">gemma-2b [local]</option>
        </select>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg) => (
          <div key={msg.id} className="fade-in" style={{
            display: "flex", flexDirection: "column",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "78%",
              background: msg.role === "user" ? `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.purple}22)` : COLORS.surfaceAlt,
              border: `1px solid ${msg.role === "user" ? COLORS.accent + "30" : COLORS.border}`,
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              padding: "10px 14px",
              fontSize: 13.5, lineHeight: 1.6,
            }}>
              {msg.content}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 10, color: COLORS.textDim, fontFamily: "JetBrains Mono" }}>
              {msg.role === "assistant" && <><span style={{ color: COLORS.accentDim }}>{msg.model}</span> · </>}
              {msg.ts}
              {msg.memory && <><span>·</span><span style={{ color: COLORS.green }}>⧫ mem</span></>}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              borderRadius: "16px 16px 16px 4px", padding: "12px 16px",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: COLORS.accent,
                  animation: `blink 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length < 3 && (
        <div style={{ padding: "0 20px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => setInput(q)} style={{
              fontSize: 11, fontFamily: "JetBrains Mono", color: COLORS.textMuted,
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "5px 10px",
            }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{
          display: "flex", gap: 8, background: COLORS.surfaceAlt,
          border: `1px solid ${COLORS.borderBright}`, borderRadius: 12,
          padding: "8px 12px", alignItems: "flex-end",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message... (Enter to send)"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: COLORS.text, resize: "none", fontSize: 13, lineHeight: 1.5,
              maxHeight: 100, overflowY: "auto",
            }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading} style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: input.trim() && !loading ? COLORS.accent : COLORS.border,
            color: input.trim() && !loading ? COLORS.bg : COLORS.textMuted,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, flexShrink: 0, transition: "all 0.2s",
          }}>→</button>
        </div>
      </div>
    </div>
  );
};

// ─── MEMORY VIEW ─────────────────────────────────────────────────────────────

const MemoryView = () => {
  const [filter, setFilter] = useState("all");
  const types = ["all", "semantic", "episodic", "procedural"];
  const filtered = filter === "all" ? MEMORIES : MEMORIES.filter(m => m.type === filter);

  const typeColor = { semantic: COLORS.accent, episodic: COLORS.green, procedural: COLORS.purple };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Memory Engine</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>ChromaDB · {MEMORIES.length} memories · RAG active</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, padding: "16px 20px", flexShrink: 0 }}>
        {[
          { label: "Semantic", count: MEMORIES.filter(m => m.type === "semantic").length, color: COLORS.accent },
          { label: "Episodic", count: MEMORIES.filter(m => m.type === "episodic").length, color: COLORS.green },
          { label: "Procedural", count: MEMORIES.filter(m => m.type === "procedural").length, color: COLORS.purple },
        ].map(s => (
          <div key={s.label} style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ padding: "0 20px 12px", display: "flex", gap: 6, flexShrink: 0 }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            fontSize: 11, fontFamily: "JetBrains Mono", textTransform: "uppercase",
            color: filter === t ? COLORS.accent : COLORS.textMuted,
            background: filter === t ? `${COLORS.accent}15` : "transparent",
            border: `1px solid ${filter === t ? COLORS.accent + "40" : COLORS.border}`,
            borderRadius: 6, padding: "4px 10px",
          }}>{t}</button>
        ))}
      </div>

      {/* Memory list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(mem => (
          <div key={mem.id} className="fade-in" style={{
            background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
            borderRadius: 10, padding: "12px 14px",
            borderLeft: `3px solid ${typeColor[mem.type]}`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 20 }}>{mem.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>{mem.text}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <Tag color={typeColor[mem.type]}>{mem.type}</Tag>
                <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textDim }}>{mem.age} ago · {Math.round(mem.confidence * 100)}% conf</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ fontSize: 12, color: COLORS.textMuted, background: "none", border: "none", padding: 4 }}>✏</button>
              <button style={{ fontSize: 12, color: COLORS.red, background: "none", border: "none", padding: 4 }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── AGENTS VIEW ─────────────────────────────────────────────────────────────

const AGENT_PROMPTS = {
  chat: `You are the Chat Agent of Personal AI OS. You handle general conversations for Suresh Kumar T (ts), a Snowflake+dbt Data Engineer at TCS Chennai. Be concise, warm, direct.`,
  research: `You are the Research Agent of Personal AI OS. You help Suresh (ts) research topics, summarize information, find answers. Structure your responses clearly. He is a Snowflake+dbt Data Engineer actively job hunting.`,
  coding: `You are the Coding Agent of Personal AI OS. You help Suresh (ts) write, debug, and review code. He works with Rust, Python, SQL, dbt, Snowflake. Always give working code. Be concise.`,
  database: `You are the Database Agent of Personal AI OS, specialized in Snowflake, dbt, SQL, and data engineering. Suresh (ts) works at TCS on ASOS and Croma projects. Give precise, production-ready SQL and dbt code. Use Snowflake syntax.`,
  memory: `You are the Memory Agent of Personal AI OS. You help Suresh (ts) manage, recall, and organize information from his memory store. When asked to recall something, respond as if you have access to his memory database. Be precise.`,
  automation: `You are the Automation Agent of Personal AI OS. You help Suresh (ts) plan and execute automated workflows, schedules, and system tasks. He runs a Pi Zero 2W with DietPi and a Rust Telegram bot (Tommy-v4). Give actionable steps.`,
};

const AGENT_HINTS = {
  chat: ["What should I do this weekend?", "Explain Zero Trust architecture", "Help me think through a decision"],
  research: ["Research SnowPro Core exam topics", "Summarize latest dbt Cloud features", "Compare Airflow vs Prefect"],
  coding: ["Write a Rust async HTTP client", "dbt macro for surrogate key", "Snowflake MERGE INTO example"],
  database: ["Write a Snowflake stream + task pipeline", "dbt incremental model for ASOS orders", "Optimize this slow Snowflake query"],
  memory: ["What do you know about my Pi Zero project?", "Recall my interview prep workflow", "What stocks am I tracking?"],
  automation: ["Schedule daily Thirukkural quote at 7am", "Script to restart Tommy bot if it crashes", "Auto-backup SQLite to Google Drive"],
};

const AgentChat = ({ agent, onBack }) => {
  const initMsg = { id: 1, role: "assistant", content: `${agent.icon} ${agent.name} online. ${agent.desc}. What do you need?`, ts: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
  const [messages, setMessages] = useState([initMsg]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const convRef = useRef([initMsg]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const txt = text || input.trim();
    if (!txt || loading) return;
    const userMsg = { id: Date.now(), role: "user", content: txt, ts: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
    const updated = [...convRef.current, userMsg];
    setMessages(updated); convRef.current = updated;
    setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: AGENT_PROMPTS[agent.id] || AGENT_PROMPTS.chat,
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "No response.";
      const aMsg = { id: Date.now() + 1, role: "assistant", content: reply, ts: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
      const final = [...updated, aMsg];
      setMessages(final); convRef.current = final;
    } catch (e) {
      const err = { id: Date.now() + 1, role: "assistant", content: `⚠️ ${e.message}`, ts: "" };
      setMessages(p => [...p, err]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 18, padding: "0 4px" }}>←</button>
        <span style={{ fontSize: 20 }}>{agent.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{agent.name}</div>
          <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textMuted }}>{agent.model}</div>
        </div>
        <div style={{ flex: 1 }} />
        <StatusDot status="active" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              background: msg.role === "user" ? `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.purple}22)` : COLORS.surfaceAlt,
              border: `1px solid ${msg.role === "user" ? COLORS.accent + "30" : COLORS.border}`,
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              padding: "10px 13px", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
            }}>{msg.content}</div>
            {msg.ts && <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "JetBrains Mono", marginTop: 3 }}>{msg.ts}</div>}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: "14px 14px 14px 4px", padding: "12px 16px", display: "flex", gap: 5 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Hints */}
      {messages.length < 3 && (
        <div style={{ padding: "0 20px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(AGENT_HINTS[agent.id] || []).map(h => (
            <button key={h} onClick={() => send(h)} style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: COLORS.textMuted, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 9px" }}>{h}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "10px 20px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderBright}`, borderRadius: 10, padding: "7px 10px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`Ask ${agent.name}…`}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: COLORS.text, fontSize: 13 }} />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            width: 30, height: 30, borderRadius: 7, border: "none",
            background: input.trim() && !loading ? COLORS.accent : COLORS.border,
            color: input.trim() && !loading ? COLORS.bg : COLORS.textMuted, fontSize: 13, flexShrink: 0,
          }}>→</button>
        </div>
      </div>
    </div>
  );
};

const AgentsView = () => {
  const [activeAgent, setActiveAgent] = useState(null);

  if (activeAgent) return <AgentChat agent={activeAgent} onBack={() => setActiveAgent(null)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Agent Framework</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>
          {AGENTS.filter(a => a.status === "active").length} active · tap to chat
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {AGENTS.map(agent => (
          <div key={agent.id} style={{
            background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
            borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s",
          }}
            onClick={() => setActiveAgent(agent)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, fontSize: 20,
                background: agent.status === "active" ? `${COLORS.accent}18` : COLORS.border,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{agent.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{agent.name}</span>
                  <StatusDot status={agent.status} />
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{agent.desc}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <Tag color={COLORS.accent}>{agent.model}</Tag>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent }}>{agent.tasks}</div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>tasks</div>
                <div style={{ fontSize: 16, color: COLORS.textDim, marginTop: 4 }}>→</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── TASKS VIEW ──────────────────────────────────────────────────────────────

const TasksView = () => {
  const [tasks, setTasks] = useState(TASKS);
  const [newTask, setNewTask] = useState("");

  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "done" ? "pending" : "done" } : t));

  const statusColor = { done: COLORS.green, active: COLORS.accent, pending: COLORS.amber };
  const priorityColor = { high: COLORS.red, medium: COLORS.amber, low: COLORS.textMuted };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), title: newTask.trim(), agent: "Chat", status: "pending", priority: "medium", created: "Now" }]);
    setNewTask("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Task Tracker</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>
          {tasks.filter(t => t.status === "done").length}/{tasks.length} complete
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
        <MiniBar val={Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)} color={COLORS.green} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map(task => (
          <div key={task.id} className="fade-in" style={{
            background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
            borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
            opacity: task.status === "done" ? 0.6 : 1, transition: "opacity 0.2s",
          }}>
            <button onClick={() => toggle(task.id)} style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
              border: `2px solid ${task.status === "done" ? COLORS.green : COLORS.borderBright}`,
              background: task.status === "done" ? COLORS.green : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: COLORS.bg,
            }}>{task.status === "done" ? "✓" : ""}</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? COLORS.textMuted : COLORS.text }}>
                {task.title}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center" }}>
                <Tag color={statusColor[task.status]}>{task.status}</Tag>
                <Tag color={priorityColor[task.priority]}>{task.priority}</Tag>
                <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textDim }}>{task.agent} · {task.created}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
        <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask()}
          placeholder="New task... (Enter to add)"
          style={{
            flex: 1, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderBright}`,
            borderRadius: 8, padding: "8px 12px", color: COLORS.text, outline: "none", fontSize: 13,
          }} />
        <button onClick={addTask} style={{
          background: COLORS.accent, color: COLORS.bg, border: "none", borderRadius: 8,
          padding: "8px 16px", fontWeight: 700, fontSize: 13,
        }}>+</button>
      </div>
    </div>
  );
};

// ─── SERVICE MESH VIEW ───────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "gcal", name: "Google Calendar", icon: "📅", color: "#4285F4",
    status: "connected", desc: "Schedule meetings, reminders, events",
    actions: ["Create event", "Check availability", "List today"],
    examples: ["Schedule a meet with Ravi tomorrow 3pm", "What's on my calendar today?", "Block 2 hours for SnowPro study"],
  },
  {
    id: "gmail", name: "Gmail", icon: "✉️", color: "#EA4335",
    status: "connected", desc: "Read, send, search emails",
    actions: ["Send email", "Read inbox", "Search"],
    examples: ["Send interview follow-up to HR", "Any recruiter mails today?", "Draft apology mail to manager"],
  },
  {
    id: "alarm", name: "Alarms & Reminders", icon: "⏰", color: COLORS.amber,
    status: "connected", desc: "Set alarms, recurring reminders, countdowns",
    actions: ["Set alarm", "Recurring reminder", "Countdown"],
    examples: ["Remind me to take meds at 9pm", "Wake me at 6:30 tomorrow", "Daily standup reminder at 9:45am"],
  },
  {
    id: "telegram", name: "Telegram (Tommy Bot)", icon: "🤖", color: "#229ED9",
    status: "connected", desc: "Send messages via @Dt96_bot on Pi Zero",
    actions: ["Send message", "Stock alert", "Thirukkural"],
    examples: ["Send Thirukkural quote to Tommy", "Alert me when MANAPPURAM < ₹180", "Message myself: buy groceries"],
  },
  {
    id: "drive", name: "Google Drive", icon: "📁", color: COLORS.green,
    status: "connected", desc: "Search, upload, read documents",
    actions: ["Upload doc", "Search files", "Read file"],
    examples: ["Upload my resume to Drive", "Find my Snowflake notes", "Read the latest dbt cheatsheet"],
  },
  {
    id: "nse", name: "NSE Stock Feed", icon: "📈", color: "#FF6B00",
    status: "connected", desc: "Live prices, alerts, portfolio tracking",
    actions: ["Get price", "Set alert", "Portfolio summary"],
    examples: ["MANAPPURAM current price?", "Alert when South Indian Bank > ₹32", "My portfolio today"],
  },
  {
    id: "notion", name: "Notion", icon: "📓", color: COLORS.textMuted,
    status: "disconnected", desc: "Notes, databases, pages",
    actions: ["Create page", "Search notes", "Append block"],
    examples: [],
  },
  {
    id: "github", name: "GitHub", icon: "🐙", color: COLORS.purple,
    status: "disconnected", desc: "Repos, issues, commits — ZeroClaw, Tommy-v4",
    actions: ["Open issue", "Check PR", "Commit summary"],
    examples: [],
  },
];

const NL_LOG = [
  { id: 1, input: "Schedule a meet with Ravi tomorrow 3pm", service: "Google Calendar", action: "Created: Meet with Ravi · Jun 8, 3:00 PM", status: "done", ts: "10:12" },
  { id: 2, input: "Remind me to take meds at 9pm daily", service: "Alarms", action: "Recurring alarm set · 9:00 PM daily", status: "done", ts: "09:45" },
  { id: 3, input: "Any recruiter mails today?", service: "Gmail", action: "Found 2 recruiter emails · showing preview", status: "done", ts: "09:30" },
  { id: 4, input: "MANAPPURAM current price?", service: "NSE Feed", action: "₹176.40 · ↓ 1.2% today", status: "done", ts: "09:10" },
];

const ServiceMeshView = () => {
  const [tab, setTab] = useState("services"); // services | nl | devices
  const [nlInput, setNlInput] = useState("");
  const [nlLog, setNlLog] = useState(NL_LOG);
  const [nlLoading, setNlLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const connectedCount = SERVICES.filter(s => s.status === "connected").length;

  const runNL = async () => {
    if (!nlInput.trim() || nlLoading) return;
    const userInput = nlInput.trim();
    setNlInput("");
    setNlLoading(true);

    // Detect which service to route to
    const pending = {
      id: Date.now(), input: userInput, service: "Routing…",
      action: "Analyzing intent…", status: "active", ts: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setNlLog(prev => [pending, ...prev]);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the Service Mesh router for Personal AI OS. The user gives a natural language command. You must:
1. Identify which service handles it: Google Calendar, Gmail, Alarms & Reminders, Telegram (Tommy Bot), Google Drive, NSE Stock Feed
2. Describe exactly what action would be taken (as if it was executed)
3. Be concise and specific — e.g. "Created event: Team sync · June 9, 2:00 PM – 3:00 PM"

Respond ONLY in this JSON format (no markdown, no preamble):
{"service": "Google Calendar", "action": "Created event: Meet with Ravi · June 8, 3:00 PM – 4:00 PM", "status": "done"}

Services available: Google Calendar, Gmail, Alarms & Reminders, Telegram (Tommy Bot), Google Drive, NSE Stock Feed
If nothing matches: {"service": "Chat Agent", "action": "<helpful response>", "status": "done"}`,
          messages: [{ role: "user", content: userInput }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "{}";
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
      catch { parsed = { service: "Chat Agent", action: raw, status: "done" }; }

      setNlLog(prev => prev.map(l =>
        l.id === pending.id ? { ...l, service: parsed.service, action: parsed.action, status: parsed.status || "done" } : l
      ));
    } catch (e) {
      setNlLog(prev => prev.map(l =>
        l.id === pending.id ? { ...l, service: "Error", action: e.message, status: "error" } : l
      ));
    }
    setNlLoading(false);
  };

  const statusColor = { done: COLORS.green, active: COLORS.accent, error: COLORS.red };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Service Mesh</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>
          {connectedCount}/{SERVICES.length} connected · NL routing active
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        {[["services", "Services"], ["nl", "NL Console"], ["devices", "Devices"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: "10px", fontSize: 12, fontWeight: 600, border: "none",
            background: tab === id ? `${COLORS.accent}12` : "transparent",
            color: tab === id ? COLORS.accent : COLORS.textMuted,
            borderBottom: tab === id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* ── SERVICES TAB ── */}
      {tab === "services" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {SERVICES.map(svc => (
            <div key={svc.id} onClick={() => setExpanded(expanded === svc.id ? null : svc.id)} style={{
              background: COLORS.surfaceAlt,
              border: `1px solid ${expanded === svc.id ? svc.color + "50" : COLORS.border}`,
              borderRadius: 12, padding: "12px 14px", cursor: "pointer",
              borderLeft: `3px solid ${svc.status === "connected" ? svc.color : COLORS.border}`,
              transition: "all 0.2s", opacity: svc.status === "disconnected" ? 0.55 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{svc.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{svc.name}</span>
                    <StatusDot status={svc.status === "connected" ? "active" : "idle"} />
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{svc.desc}</div>
                </div>
                {svc.status === "disconnected" ? (
                  <button style={{
                    fontSize: 11, fontFamily: "JetBrains Mono", color: COLORS.accent,
                    background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}40`,
                    borderRadius: 6, padding: "4px 10px",
                  }}>Connect</button>
                ) : (
                  <Tag color={svc.color}>live</Tag>
                )}
              </div>

              {expanded === svc.id && svc.status === "connected" && (
                <div className="fade-in" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textDim, marginBottom: 6, letterSpacing: "0.08em" }}>EXAMPLE COMMANDS</div>
                  {svc.examples.map((ex, i) => (
                    <div key={i} style={{
                      fontSize: 12, fontFamily: "JetBrains Mono", color: COLORS.textMuted,
                      background: COLORS.border, borderRadius: 6, padding: "6px 10px",
                      marginBottom: 5, cursor: "default",
                    }}>
                      <span style={{ color: COLORS.accent }}>→ </span>{ex}
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {svc.actions.map(a => <Tag key={a} color={svc.color}>{a}</Tag>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── NL CONSOLE TAB ── */}
      {tab === "nl" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 20px 8px", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono", marginBottom: 10 }}>
              Type anything naturally — the mesh routes it to the right service.
            </div>
            {/* Quick examples */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Schedule a meet with Ravi tomorrow 3pm", "Remind me meds at 9pm", "MANAPPURAM price?", "Any recruiter mails?"].map(ex => (
                <button key={ex} onClick={() => setNlInput(ex)} style={{
                  fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textMuted,
                  background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                  borderRadius: 6, padding: "4px 8px",
                }}>{ex}</button>
              ))}
            </div>
          </div>

          {/* Log */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {nlLog.map(log => (
              <div key={log.id} className="fade-in" style={{
                background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                borderRadius: 10, padding: "12px 14px",
                borderLeft: `3px solid ${statusColor[log.status] || COLORS.accent}`,
              }}>
                <div style={{ fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: COLORS.textMuted, fontFamily: "JetBrains Mono", fontSize: 10 }}>YOU → </span>
                  {log.input}
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <StatusDot status={log.status === "active" ? "running" : log.status === "done" ? "active" : "idle"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: statusColor[log.status] || COLORS.accent }}>
                      {log.action}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Tag color={COLORS.purple}>{log.service}</Tag>
                    <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textDim }}>{log.ts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
            <div style={{
              display: "flex", gap: 8, background: COLORS.surfaceAlt,
              border: `1px solid ${COLORS.borderBright}`, borderRadius: 12, padding: "8px 12px",
            }}>
              <input
                value={nlInput}
                onChange={e => setNlInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && runNL()}
                placeholder="Schedule a meet / Send mail / Set alarm / Get stock price…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: COLORS.text, fontSize: 13,
                }}
              />
              <button onClick={runNL} disabled={!nlInput.trim() || nlLoading} style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: nlInput.trim() && !nlLoading ? COLORS.accent : COLORS.border,
                color: nlInput.trim() && !nlLoading ? COLORS.bg : COLORS.textMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0, transition: "all 0.2s",
              }}>
                {nlLoading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : "→"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEVICES TAB ── */}
      {tab === "devices" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {DEVICES.map(dev => (
            <div key={dev.id} style={{
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              borderRadius: 12, padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{dev.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>{dev.name}</span>
                    <StatusDot status={dev.status} />
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>{dev.type}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Tag color={dev.sync === "live" ? COLORS.green : COLORS.amber}>{dev.sync}</Tag>
                  <div style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "JetBrains Mono", marginTop: 3 }}>{dev.role}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textMuted, marginBottom: 4 }}>
                    <span>CPU</span><span style={{ color: dev.cpu > 60 ? COLORS.amber : COLORS.accent }}>{dev.cpu}%</span>
                  </div>
                  <MiniBar val={dev.cpu} color={dev.cpu > 60 ? COLORS.amber : COLORS.accent} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textMuted, marginBottom: 4 }}>
                    <span>RAM</span><span style={{ color: dev.ram > 65 ? COLORS.red : COLORS.green }}>{dev.ram}%</span>
                  </div>
                  <MiniBar val={dev.ram} color={dev.ram > 65 ? COLORS.red : COLORS.green} />
                </div>
              </div>
            </div>
          ))}
          <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: COLORS.textMuted, letterSpacing: "0.1em" }}>MESH TOPOLOGY</div>
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: COLORS.textMuted, lineHeight: 2 }}>
              <span style={{ color: COLORS.accent }}>Android</span> ─── <span style={{ color: COLORS.green }}>VPS</span> ─── <span style={{ color: COLORS.purple }}>ThinkPad</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──── <span style={{ color: COLORS.amber }}>Pi Zero 2W</span>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <Tag color={COLORS.green}>AES-256</Tag>
              <Tag color={COLORS.accent}>WebSocket</Tag>
              <Tag color={COLORS.purple}>Auto-Discover</Tag>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MODELS VIEW ─────────────────────────────────────────────────────────────

const BROWSE_CATALOG = [
  // HuggingFace / Ollama library
  { id: "b1", name: "Llama 3.2 3B", family: "Llama", source: "HuggingFace", format: "GGUF", size: "2.0GB", ram: "3GB", quant: "Q4_K_M", license: "Meta", tags: ["general", "chat"], pi: false },
  { id: "b2", name: "SmolLM2 360M", family: "SmolLM", source: "HuggingFace", format: "GGUF", size: "220MB", ram: "512MB", quant: "Q4_K_M", license: "Apache 2.0", tags: ["tiny", "pi-zero"], pi: true },
  { id: "b3", name: "SmolLM2 1.7B", family: "SmolLM", source: "HuggingFace", format: "GGUF", size: "1.1GB", ram: "2GB", quant: "Q4_K_M", license: "Apache 2.0", tags: ["tiny", "chat"], pi: false },
  { id: "b4", name: "Gemma 2 2B", family: "Gemma", source: "Ollama", format: "GGUF", size: "1.6GB", ram: "3GB", quant: "Q4_K_S", license: "Gemma", tags: ["general", "google"], pi: false },
  { id: "b5", name: "Phi-3.5 Mini", family: "Phi", source: "Ollama", format: "GGUF", size: "2.2GB", ram: "4GB", quant: "Q4_K_M", license: "MIT", tags: ["reasoning", "microsoft"], pi: false },
  { id: "b6", name: "Qwen2.5 0.5B", family: "Qwen", source: "HuggingFace", format: "GGUF", size: "390MB", ram: "768MB", quant: "Q4_K_M", license: "Apache 2.0", tags: ["tiny", "multilingual", "pi-zero"], pi: true },
  { id: "b7", name: "Qwen2.5 1.5B", family: "Qwen", source: "HuggingFace", format: "GGUF", size: "940MB", ram: "1.5GB", quant: "Q4_K_M", license: "Apache 2.0", tags: ["small", "multilingual"], pi: false },
  { id: "b8", name: "TinyLlama 1.1B", family: "Llama", source: "HuggingFace", format: "GGUF", size: "670MB", ram: "1GB", quant: "Q4_K_M", license: "Apache 2.0", tags: ["tiny", "fast"], pi: true },
  { id: "b9", name: "Mistral 7B", family: "Mistral", source: "Ollama", format: "GGUF", size: "4.1GB", ram: "8GB", quant: "Q4_K_M", license: "Apache 2.0", tags: ["general", "coding"], pi: false },
  { id: "b10", name: "DeepSeek-R1 1.5B", family: "DeepSeek", source: "HuggingFace", format: "GGUF", size: "1.0GB", ram: "2GB", quant: "Q4_K_M", license: "MIT", tags: ["reasoning", "r1"], pi: false },
  { id: "b11", name: "Phi-4 Mini", family: "Phi", source: "Ollama", format: "GGUF", size: "2.5GB", ram: "4GB", quant: "Q4_K_M", license: "MIT", tags: ["reasoning", "microsoft"], pi: false },
  { id: "b12", name: "Gemma 3 1B", family: "Gemma", source: "HuggingFace", format: "GGUF", size: "700MB", ram: "1.5GB", quant: "Q4_K_M", license: "Gemma", tags: ["small", "google"], pi: true },
];

const FAMILIES = ["All", "Llama", "Gemma", "Phi", "Qwen", "SmolLM", "Mistral", "DeepSeek"];
const SOURCES = ["All", "HuggingFace", "Ollama"];

const ModelsView = () => {
  const [tab, setTab] = useState("installed"); // installed | browse
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("All");
  const [source, setSource] = useState("All");
  const [piOnly, setPiOnly] = useState(false);
  const [downloading] = useState({});

  const filtered = BROWSE_CATALOG.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.family.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.includes(search.toLowerCase()));
    const matchFamily = family === "All" || m.family === family;
    const matchSource = source === "All" || m.source === source;
    const matchPi = !piOnly || m.pi;
    return matchSearch && matchFamily && matchSource && matchPi;
  });

const sourceColor = { HuggingFace: "#FF9D00", Ollama: COLORS.accent };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Model Marketplace</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono" }}>
          OpenRouter · llama.cpp · Ollama · HuggingFace
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        {[["installed", "Installed"], ["browse", "Browse Library"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: "10px", fontSize: 12, fontWeight: 600, border: "none",
            background: tab === id ? `${COLORS.accent}12` : "transparent",
            color: tab === id ? COLORS.accent : COLORS.textMuted,
            borderBottom: tab === id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* ── INSTALLED TAB ── */}
      {tab === "installed" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: COLORS.textMuted, letterSpacing: "0.1em", marginBottom: 2 }}>☁ CLOUD (via OpenRouter)</div>
          {MODELS.filter(m => m.type === "cloud").map(model => (
            <div key={model.id} style={{
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{model.name}</span>
                  <StatusDot status={model.status} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono", marginTop: 3 }}>{model.provider}</div>
              </div>
              <Tag color={COLORS.accent}>{model.latency}</Tag>
              <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.amber }}>{model.cost}</span>
            </div>
          ))}

          <div style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: COLORS.textMuted, letterSpacing: "0.1em", marginTop: 8, marginBottom: 2 }}>⬡ LOCAL (on-device)</div>
          {MODELS.filter(m => m.type === "local").map(model => (
            <div key={model.id} style={{
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{model.name}</span>
                  <StatusDot status={model.status} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "JetBrains Mono", marginTop: 3 }}>{model.provider} · {model.size}</div>
              </div>
              <Tag color={COLORS.green}>{model.latency}</Tag>
              {model.status === "idle" && (
                <button style={{
                  fontSize: 11, fontFamily: "JetBrains Mono", color: COLORS.accent,
                  background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}40`,
                  borderRadius: 6, padding: "4px 10px",
                }}>Load</button>
              )}
              <button style={{
                fontSize: 11, fontFamily: "JetBrains Mono", color: COLORS.red,
                background: `${COLORS.red}10`, border: `1px solid ${COLORS.red}30`,
                borderRadius: 6, padding: "4px 8px",
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* ── BROWSE TAB ── */}
      {tab === "browse" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Filters */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search models… (name, family, tag)"
              style={{
                background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderBright}`,
                borderRadius: 8, padding: "7px 12px", color: COLORS.text, outline: "none", fontSize: 12, width: "100%",
              }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              {/* Family filter */}
              <select value={family} onChange={e => setFamily(e.target.value)} style={{
                background: COLORS.surfaceAlt, color: COLORS.text, border: `1px solid ${COLORS.border}`,
                borderRadius: 6, padding: "4px 8px", fontSize: 11, fontFamily: "JetBrains Mono",
              }}>
                {FAMILIES.map(f => <option key={f}>{f}</option>)}
              </select>
              {/* Source filter */}
              <select value={source} onChange={e => setSource(e.target.value)} style={{
                background: COLORS.surfaceAlt, color: COLORS.text, border: `1px solid ${COLORS.border}`,
                borderRadius: 6, padding: "4px 8px", fontSize: 11, fontFamily: "JetBrains Mono",
              }}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
              {/* Pi filter */}
              <button onClick={() => setPiOnly(p => !p)} style={{
                fontSize: 11, fontFamily: "JetBrains Mono",
                color: piOnly ? COLORS.amber : COLORS.textMuted,
                background: piOnly ? `${COLORS.amber}15` : COLORS.surfaceAlt,
                border: `1px solid ${piOnly ? COLORS.amber + "50" : COLORS.border}`,
                borderRadius: 6, padding: "4px 10px",
              }}>🍓 Pi Zero</button>
              <span style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textDim, marginLeft: "auto" }}>
                {filtered.length} model{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Model list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(model => {
              return (
                <div key={model.id} className="fade-in" style={{
                  background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{model.name}</span>
                        {model.pi && <Tag color={COLORS.amber}>🍓 Pi Zero</Tag>}
                      </div>
                      <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: COLORS.textMuted, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ color: sourceColor[model.source] || COLORS.textMuted }}>{model.source}</span>
                        <span>{model.format} · {model.quant}</span>
                        <span>{model.size}</span>
                        <span>RAM: {model.ram}</span>
                        <span style={{ color: COLORS.textDim }}>{model.license}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                        {model.tags.map(t => <Tag key={t} color={COLORS.textDim}>{t}</Tag>)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: COLORS.textDim, fontSize: 13, fontFamily: "JetBrains Mono", padding: "40px 0" }}>
                No models match your filters
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [nav, setNav] = useState("chat");

  const VIEWS = {
    chat: ChatView,
    memory: MemoryView,
    agents: AgentsView,
    tasks: TasksView,
    devices: ServiceMeshView,
    models: ModelsView,
  };

  const View = VIEWS[nav] || ChatView;

  return (
    <>
      <style>{css}</style>

      {/* Scanline effect */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />

      <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
        <SideNav active={nav} onNav={setNav} />

        {/* Main panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: COLORS.bg }}>
          {/* Top bar */}
          <div style={{
            height: 36, borderBottom: `1px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", paddingInline: 16, gap: 8,
            flexShrink: 0, background: COLORS.surface,
          }}>
            <div style={{ display: "flex", gap: 5 }}>
              {[COLORS.red, COLORS.amber, COLORS.green].map((c, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: COLORS.textDim }}>
              Personal AI OS · v1.0 · ts@TCS
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <StatusDot status="active" />
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: COLORS.green }}>sys online</span>
            </div>
          </div>

          {/* View */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            <View />
          </div>
        </div>
      </div>
    </>
  );
}
