import { useState, useEffect, useRef, useCallback } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MODELS_LIBRARY = [
  { id: "llama3-8b-q4", name: "Llama 3.1 8B", family: "Meta Llama", params: "8B", quant: "Q4_K_M", size: "4.7 GB", speed: "18 tok/s", ctx: "128K", tags: ["general", "coding"], status: "downloaded", rating: 4.8, description: "Meta's flagship open model. Excellent general reasoning and coding." },
  { id: "mistral-7b-q4", name: "Mistral 7B v0.3", family: "Mistral AI", params: "7B", quant: "Q4_K_M", size: "4.1 GB", speed: "21 tok/s", ctx: "32K", tags: ["general", "fast"], status: "downloaded", rating: 4.7, description: "Fast, efficient, great instruction following. Best tok/s per GB." },
  { id: "phi3-mini-q4", name: "Phi-3 Mini", family: "Microsoft", params: "3.8B", quant: "Q4_K_M", size: "2.2 GB", speed: "34 tok/s", ctx: "128K", tags: ["fast", "mobile"], status: "downloaded", rating: 4.5, description: "Surprisingly capable tiny model. Best for low-RAM devices." },
  { id: "gemma2-9b-q4", name: "Gemma 2 9B", family: "Google", params: "9B", quant: "Q4_K_M", size: "5.4 GB", speed: "14 tok/s", ctx: "8K", tags: ["general", "reasoning"], status: "available", rating: 4.6, description: "Google's refined open model. Strong at reasoning and analysis." },
  { id: "qwen25-7b-q4", name: "Qwen 2.5 7B", family: "Alibaba", params: "7B", quant: "Q4_K_M", size: "4.4 GB", speed: "19 tok/s", ctx: "128K", tags: ["multilingual", "coding"], status: "available", rating: 4.6, description: "Exceptional multilingual support. Strong Tamil/Hindi language capability." },
  { id: "deepseek-r1-7b", name: "DeepSeek R1 7B", family: "DeepSeek", params: "7B", quant: "Q4_K_M", size: "4.3 GB", speed: "16 tok/s", ctx: "64K", tags: ["reasoning", "coding"], status: "available", rating: 4.9, description: "Reasoning model with chain-of-thought. Best for complex problem solving." },
  { id: "codellama-7b", name: "CodeLlama 7B", family: "Meta Llama", params: "7B", quant: "Q4_K_M", size: "4.0 GB", speed: "22 tok/s", ctx: "16K", tags: ["coding"], status: "available", rating: 4.4, description: "Fine-tuned for code generation. Supports Python, SQL, JS, and more." },
  { id: "llama3-70b-q2", name: "Llama 3.1 70B", family: "Meta Llama", params: "70B", quant: "Q2_K", size: "26.1 GB", speed: "4 tok/s", ctx: "128K", tags: ["general", "large"], status: "available", rating: 4.9, description: "The big one. Near GPT-4 quality. Requires 12GB+ RAM device." },
];

const AGENTS_DATA = [
  { id: "a1", name: "Telegram Summarizer", icon: "✈️", color: "#2196F3", status: "active", model: "Mistral 7B v0.3", trigger: "Schedule: 9 AM daily", lastRun: "2 hrs ago", runs: 47, description: "Reads your Telegram chats and sends a daily summary notification.", tools: ["http_post", "notification"] },
  { id: "a2", name: "Code Reviewer", icon: "🔍", color: "#4CAF50", status: "idle", model: "Llama 3.1 8B", trigger: "On demand", lastRun: "Yesterday", runs: 12, description: "Reviews code snippets shared from any app. Returns quality analysis.", tools: ["clipboard_write", "notification"] },
  { id: "a3", name: "Tamil Translator", icon: "🌐", color: "#FF9800", status: "active", model: "Qwen 2.5 7B", trigger: "Share sheet", lastRun: "1 day ago", runs: 89, description: "Instantly translates any shared text to/from Tamil.", tools: ["clipboard_write"] },
  { id: "a4", name: "Stock Watcher", icon: "📈", color: "#9C27B0", status: "idle", model: "Phi-3 Mini", trigger: "Schedule: 3:30 PM", lastRun: "3 days ago", runs: 23, description: "Fetches MANAPPURAM, SOUTHBANK, NATCOPHARM prices and sends briefing.", tools: ["http_get", "notification"] },
];

const SAMPLE_RESPONSES = [
  "I'm LocalMind AI running entirely on your device using llama.cpp — no data leaves your phone. How can I help you today?",
  "Great question! Here's what I found:\n\nFor on-device inference on Android, expected speeds are:\n\n• **Phi-3 Mini (3.8B)**: ~34 tokens/sec\n• **Mistral 7B**: ~21 tokens/sec\n• **Llama 3.1 8B**: ~18 tokens/sec\n\nAll running completely offline once downloaded.",
  "Sure! As a locally-running model, I keep your conversations private — stored only in the app's SQLite database on your device.",
  "Great PL/SQL question! Here's the difference:\n\n**BULK COLLECT**\n- Fetches multiple rows into a collection at once\n- Reduces context switches between SQL and PL/SQL engines\n- Use LIMIT clause for large datasets\n\n**FORALL**\n- Sends DML in bulk to the SQL engine\n- Much faster than row-by-row processing\n- Combined with BULK COLLECT gives 10-100x speedup",
  "The Thirukkural (திருக்குறள்) has 1,330 couplets across 133 chapters organized into three books:\n\n1. **Aram (அறம்)** — Virtue (38 chapters)\n2. **Porul (பொருள்)** — Wealth (70 chapters)\n3. **Inbam (இன்பம்)** — Love (25 chapters)\n\nEach kural is a masterpiece of compression — profound wisdom in just 7 words.",
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    chat: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    cpu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
    bot: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    chevron: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  };
  return icons[name] || null;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const renderMarkdown = (text) => {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("• ") || line.startsWith("- ")) {
      const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
      return <div key={i} style={{ display: "flex", gap: 8, marginTop: 4 }}><span style={{ color: "#10a37f", fontWeight: 700 }}>•</span><span>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#e2e8f0" }}>{p}</strong> : p)}</span></div>;
    }
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <div key={i} style={{ lineHeight: 1.7 }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#e2e8f0" }}>{p}</strong> : p)}</div>;
  });
};

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#10a37f", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
    ))}
    <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-7px);opacity:1}}`}</style>
  </div>
);

const StreamingText = ({ text, onDone }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const speed = Math.max(6, Math.min(20, Math.floor(2500 / text.length)));
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)); }
      else { clearInterval(iv); setDone(true); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return <div>{done ? renderMarkdown(text) : <span style={{ whiteSpace: "pre-wrap" }}>{displayed}<span style={{ animation: "blink 1s step-end infinite" }}>▋</span></span>}<style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style></div>;
};

const DownloadProgress = ({ model, onComplete }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(iv); onComplete(); return 100; } return Math.min(100, p + Math.random() * 3.5); }), 100);
    return () => clearInterval(iv);
  }, []);
  const pct = Math.min(100, Math.round(progress));
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>
        <span>Downloading…</span><span>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#10a37f,#0ea5e9)", transition: "width 0.1s" }} />
      </div>
      <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>{((pct / 100) * parseFloat(model.size)).toFixed(1)} GB / {model.size}</div>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)", background: type === "error" ? "#ef4444" : "#10a37f", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", whiteSpace: "nowrap", animation: "toastIn 0.25s ease" }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {message}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS_LIBRARY[0]);
  const [conversations, setConversations] = useState([
    { id: "c1", title: "Getting started", messages: [{ role: "assistant", content: "Hello Suresh! I'm LocalMind AI running Llama 3.1 8B entirely on-device. Your conversations are stored in local SQLite and never leave your phone. How can I help?", id: "m0" }] },
    { id: "c2", title: "PL/SQL BULK COLLECT", messages: [] },
    { id: "c3", title: "Stock analysis", messages: [] },
  ]);
  const [activeConvId, setActiveConvId] = useState("c1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [models, setModels] = useState(MODELS_LIBRARY);
  const [agents, setAgents] = useState(AGENTS_DATA);
  const [modelSearch, setModelSearch] = useState("");
  const [modelFilter, setModelFilter] = useState("all");
  const [downloading, setDownloading] = useState({});
  const [toast, setToast] = useState(null);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [newAgent, setNewAgent] = useState({ name: "", description: "", icon: "🤖", model: "llama3-8b-q4", trigger: "on-demand", tools: [] });
  const [testResults, setTestResults] = useState({});
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeConv = conversations.find(c => c.id === activeConvId);
  const downloaded = models.filter(m => m.status === "downloaded");

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConv?.messages, isTyping]);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping) return;
    const userMsg = { role: "user", content: input.trim(), id: `u${Date.now()}` };
    const botId = `b${Date.now()}`;
    setInput("");
    setIsTyping(true);
    setConversations(prev => prev.map(c => c.id === activeConvId
      ? { ...c, title: c.messages.length <= 1 ? input.trim().slice(0, 28) + "…" : c.title, messages: [...c.messages, userMsg] } : c));
    setTimeout(() => {
      const resp = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];
      setIsTyping(false);
      setStreamingId(botId);
      setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, messages: [...c.messages, { role: "assistant", content: resp, id: botId, streaming: true }] } : c));
    }, 700 + Math.random() * 900);
  }, [input, isTyping, activeConvId]);

  const newChat = () => {
    const id = `c${Date.now()}`;
    setConversations(prev => [...prev, { id, title: "New chat", messages: [{ role: "assistant", content: `Hi! Running **${selectedModel.name}** on-device. What can I help with?`, id: `m${Date.now()}` }] }]);
    setActiveConvId(id);
    setSidebarOpen(false);
  };

  const filteredModels = models.filter(m => {
    const q = modelSearch.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.family.toLowerCase().includes(q) || m.tags.some(t => t.includes(q));
    const matchFilter = modelFilter === "all" || (modelFilter === "downloaded" && m.status === "downloaded") || (modelFilter === "available" && m.status === "available") || m.tags.includes(modelFilter);
    return matchSearch && matchFilter;
  });

  const c = {
    bg: "#0d1117", surface: "#161b22", card: "#1c2128", border: "#21262d",
    border2: "#30363d", text: "#c9d1d9", textDim: "#6e7681", textMid: "#8b949e",
    textBright: "#e6edf3", green: "#10a37f", blue: "#0ea5e9", accent: "linear-gradient(135deg,#10a37f,#0ea5e9)",
    purple: "linear-gradient(135deg,#667eea,#764ba2)"
  };

  const WIZARD_STEPS = ["Basic Info", "Model", "Prompt", "Tools", "Trigger", "Review"];

  // ─── SCREENS ────────────────────────────────────────────────────────────────

  const ChatScreen = () => (
    <>
      {/* Sidebar overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 99 }} />}
      {/* Sidebar */}
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "76%", background: c.surface, zIndex: 100, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)", borderRight: `1px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>LocalMind AI</span>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: c.textDim, cursor: "pointer" }}><Icon name="x" size={18} /></button>
          </div>
          <button onClick={newChat} style={{ width: "100%", background: c.accent, border: "none", borderRadius: 12, padding: "10px", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 14 }}>
            <Icon name="plus" size={16} /> New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
          <div style={{ padding: "4px 16px 8px", fontSize: 10, fontWeight: 700, color: c.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent</div>
          {conversations.map(conv => (
            <div key={conv.id} onClick={() => { setActiveConvId(conv.id); setSidebarOpen(false); }}
              style={{ padding: "10px 16px", cursor: "pointer", background: conv.id === activeConvId ? c.card : "transparent", borderLeft: `3px solid ${conv.id === activeConvId ? c.green : "transparent"}`, display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
              <Icon name="chat" size={14} color={conv.id === activeConvId ? c.green : c.textDim} />
              <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: conv.id === activeConvId ? c.textBright : c.text }}>{conv.title}</span>
              <button onClick={e => { e.stopPropagation(); setConversations(p => p.filter(x => x.id !== conv.id)); if (activeConvId === conv.id) setActiveConvId(conversations.find(x => x.id !== conv.id)?.id); }}
                style={{ background: "none", border: "none", color: c.textDim, cursor: "pointer", padding: 2, opacity: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <Icon name="trash" size={12} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: c.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>S</div>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Suresh Kumar T</div><div style={{ fontSize: 11, color: c.textDim }}>TCS · Chennai</div></div>
        </div>
      </div>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: c.surface, borderBottom: `1px solid ${c.border}`, gap: 10, flexShrink: 0 }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: c.textDim, cursor: "pointer", padding: 4 }}><Icon name="menu" size={20} /></button>
        <button onClick={() => setShowModelPicker(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, background: c.card, border: `1px solid ${c.border2}`, borderRadius: 20, padding: "6px 12px 6px 8px", cursor: "pointer" }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="cpu" size={11} color="#fff" /></div>
          <span style={{ fontSize: 12, fontWeight: 600, color: c.textBright, flex: 1, textAlign: "left" }}>{selectedModel.name}</span>
          <span style={{ fontSize: 10, color: c.textDim }}>{selectedModel.params}</span>
          <Icon name="chevron" size={13} color={c.textDim} />
        </button>
        <button onClick={newChat} style={{ background: "none", border: "none", color: c.textDim, cursor: "pointer", padding: 4 }}><Icon name="edit" size={18} /></button>
      </div>

      {/* Model picker sheet */}
      {showModelPicker && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)" }} onClick={() => setShowModelPicker(false)} />
          <div style={{ position: "relative", background: c.surface, borderRadius: "22px 22px 0 0", maxHeight: "65%", overflow: "auto", border: `1px solid ${c.border}`, borderBottom: "none", animation: "sheetUp 0.25s ease" }}>
            <style>{`@keyframes sheetUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Switch Model</span>
              <button onClick={() => setShowModelPicker(false)} style={{ background: "none", border: "none", color: c.textDim, cursor: "pointer" }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ padding: "12px 16px" }}>
              {downloaded.map(m => (
                <div key={m.id} onClick={() => { setSelectedModel(m); setShowModelPicker(false); showToast(`Switched to ${m.name}`); }}
                  style={{ background: m.id === selectedModel.id ? "#10a37f11" : c.card, border: `1px solid ${m.id === selectedModel.id ? "#10a37f44" : c.border2}`, borderRadius: 14, padding: 14, marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#10a37f1a", border: "1px solid #10a37f33", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="cpu" size={18} color={c.green} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div><div style={{ fontSize: 11, color: c.textDim }}>{m.params} · {m.quant} · {m.speed}</div></div>
                  {m.id === selectedModel.id && <Icon name="check" size={18} color={c.green} />}
                </div>
              ))}
              <button onClick={() => { setShowModelPicker(false); setTab("models"); }} style={{ width: "100%", background: c.card, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "12px", color: c.green, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ Browse All Models</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 0" }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        {activeConv?.messages.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: c.accent, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="bot" size={26} color="#fff" /></div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>How can I help?</div>
            <div style={{ color: c.textDim, fontSize: 13 }}>{selectedModel.name} · On-device</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 20 }}>
              {["Explain BULK COLLECT", "Translate to Tamil", "Review my code", "Stock analysis"].map(s => (
                <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  style={{ background: c.card, border: `1px solid ${c.border2}`, borderRadius: 20, padding: "8px 14px", color: c.text, cursor: "pointer", fontSize: 12 }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {activeConv?.messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", gap: 10, padding: "6px 14px", flexDirection: msg.role === "user" ? "row-reverse" : "row", animation: "fadeUp 0.25s ease" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: msg.role === "user" ? c.purple : c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0 }}>{msg.role === "user" ? "S" : "AI"}</div>
            <div style={{ maxWidth: "80%" }}>
              <div style={{ padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 3px 16px" : "16px 16px 16px 3px", background: msg.role === "user" ? "linear-gradient(135deg,#667eea,#764ba2)" : c.card, color: msg.role === "user" ? "#fff" : c.text, fontSize: 14, border: msg.role === "user" ? "none" : `1px solid ${c.border}`, boxShadow: msg.role === "user" ? "0 4px 12px rgba(102,126,234,0.3)" : "0 2px 8px rgba(0,0,0,0.3)" }}>
                {msg.streaming && msg.id === streamingId
                  ? <StreamingText text={msg.content} onDone={() => setStreamingId(null)} />
                  : <div>{renderMarkdown(msg.content)}</div>}
              </div>
              {msg.role === "assistant" && msg.id !== streamingId && (
                <div style={{ display: "flex", gap: 10, marginTop: 5, paddingLeft: 4 }}>
                  {[["copy", "Copy"], ["refresh", "Retry"]].map(([ic, lb]) => (
                    <button key={ic} onClick={() => ic === "copy" && showToast("Copied!")} style={{ background: "none", border: "none", color: c.textDim, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                      <Icon name={ic} size={11} />{lb}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", gap: 10, padding: "6px 14px" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0 }}>AI</div>
            <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 3px", background: c.card, border: `1px solid ${c.border}` }}><TypingIndicator /></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px 6px", background: c.surface, borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: c.card, borderRadius: 16, padding: "8px 8px 8px 14px", border: `1px solid ${c.border2}` }}>
          <textarea ref={inputRef} value={input} onChange={e => { setInput(e.target.value); e.target.style.height = "22px"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Message LocalMind AI…" rows={1}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: c.textBright, fontSize: 14, resize: "none", lineHeight: 1.5, maxHeight: 110, minHeight: 22, fontFamily: "inherit" }} />
          <button onClick={sendMessage} disabled={!input.trim() || isTyping}
            style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: input.trim() && !isTyping ? "pointer" : "default", background: input.trim() && !isTyping ? c.accent : c.border2, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
            <Icon name="send" size={15} color="#fff" />
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: c.textDim, marginTop: 6 }}>🔒 100% on-device · {selectedModel.speed} · SQLite memory</div>
      </div>
    </>
  );

  const ModelsScreen = () => (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${c.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Model Library</div>
        <div style={{ display: "flex", gap: 8, background: c.card, borderRadius: 12, padding: "8px 12px", marginBottom: 10, alignItems: "center", border: `1px solid ${c.border}` }}>
          <Icon name="search" size={15} color={c.textDim} />
          <input value={modelSearch} onChange={e => setModelSearch(e.target.value)} placeholder="Search models…"
            style={{ background: "none", border: "none", outline: "none", color: c.textBright, fontSize: 14, flex: 1, fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 7, overflow: "auto", paddingBottom: 2 }}>
          {["all", "downloaded", "general", "coding", "fast", "reasoning", "multilingual"].map(f => (
            <button key={f} onClick={() => setModelFilter(f)}
              style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, border: `1px solid ${modelFilter === f ? c.green : c.border2}`, color: modelFilter === f ? c.green : c.textDim, cursor: "pointer", background: modelFilter === f ? "#10a37f11" : "transparent", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}>
              {f === "all" ? "All" : f === "downloaded" ? "✓ Downloaded" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 14px" }}>
        <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: c.textDim }}>Storage Used</span><span style={{ fontSize: 12, fontWeight: 600, color: c.green }}>11.0 GB / 128 GB</span></div>
          <div style={{ height: 5, background: c.card, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: "8.6%", background: c.accent, borderRadius: 4 }} /></div>
          <div style={{ fontSize: 11, color: c.textDim, marginTop: 5 }}>{downloaded.length} downloaded · {MODELS_LIBRARY.length - downloaded.length} available</div>
        </div>
        {filteredModels.map(model => (
          <div key={model.id} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: model.status === "downloaded" ? "#10a37f1a" : c.card, border: `1px solid ${model.status === "downloaded" ? "#10a37f44" : c.border2}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="cpu" size={19} color={model.status === "downloaded" ? c.green : c.textDim} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{model.name}</span>
                  {model.status === "downloaded" && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: "#10a37f22", color: c.green, border: "1px solid #10a37f44" }}>✓ Local</span>}
                  {selectedModel.id === model.id && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: "#0ea5e922", color: c.blue, border: "1px solid #0ea5e944" }}>Active</span>}
                </div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{model.family} · {model.params} · {model.quant}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {model.tags.map(t => <span key={t} style={{ fontSize: 10, background: c.card, border: `1px solid ${c.border2}`, borderRadius: 20, padding: "1px 7px", color: c.textMid }}>{t}</span>)}
                </div>
                <div style={{ fontSize: 12, color: c.textMid, marginTop: 7, lineHeight: 1.5 }}>{model.description}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                  {[["📦", model.size], ["⚡", model.speed], ["📝", model.ctx], ["⭐", model.rating]].map(([ic, val]) => (
                    <span key={ic} style={{ fontSize: 11, color: c.textDim }}>{ic} {val}</span>
                  ))}
                </div>
                {downloading[model.id]
                  ? <DownloadProgress model={model} onComplete={() => { setModels(p => p.map(m => m.id === model.id ? { ...m, status: "downloaded" } : m)); setDownloading(d => { const n = { ...d }; delete n[model.id]; return n; }); showToast(`${model.name} ready!`); }} />
                  : (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      {model.status === "downloaded" ? (
                        <>
                          <button onClick={() => { if (selectedModel.id !== model.id) { setSelectedModel(model); showToast(`Switched to ${model.name}`); setTab("chat"); } }}
                            style={{ flex: 1, background: selectedModel.id === model.id ? c.card : c.accent, border: "none", borderRadius: 10, padding: "8px 0", color: "#fff", fontWeight: 700, cursor: selectedModel.id === model.id ? "default" : "pointer", fontSize: 12 }}>
                            {selectedModel.id === model.id ? "✓ Active" : "Use Model"}
                          </button>
                          <button onClick={() => { setModels(p => p.map(m => m.id === model.id ? { ...m, status: "available" } : m)); if (selectedModel.id === model.id) setSelectedModel(downloaded.find(m => m.id !== model.id) || MODELS_LIBRARY[0]); showToast("Removed", "error"); }}
                            style={{ background: c.card, border: `1px solid ${c.border2}`, borderRadius: 10, padding: "8px 12px", color: "#ef4444", cursor: "pointer" }}>
                            <Icon name="trash" size={13} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setDownloading(d => ({ ...d, [model.id]: true }))}
                          style={{ flex: 1, background: c.card, border: `1px solid #10a37f44`, borderRadius: 10, padding: "8px 0", color: c.green, fontWeight: 700, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <Icon name="download" size={13} /> Download {model.size}
                        </button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AgentWizard = () => (
    <div style={{ position: "absolute", inset: 0, background: c.bg, zIndex: 300, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => { setShowWizard(false); setWizardStep(0); }} style={{ background: "none", border: "none", color: c.textDim, cursor: "pointer" }}><Icon name="x" size={20} /></button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Create Agent</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: c.textDim }}>{wizardStep + 1} / {WIZARD_STEPS.length}</span>
      </div>
      {/* Step dots */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 4 }}>
        {WIZARD_STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= wizardStep ? c.green : c.border2, transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 16px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>{WIZARD_STEPS[wizardStep]}</div>
        {wizardStep === 0 && (
          <div>
            <label style={{ fontSize: 12, color: c.textDim, display: "block", marginBottom: 6 }}>Agent Name *</label>
            <input value={newAgent.name} onChange={e => setNewAgent(a => ({ ...a, name: e.target.value }))} placeholder="e.g. Daily Stock Briefer"
              style={{ width: "100%", background: c.card, border: `1px solid ${c.border2}`, borderRadius: 10, padding: "10px 14px", color: c.textBright, fontSize: 14, outline: "none", fontFamily: "inherit", marginBottom: 16, boxSizing: "border-box" }} />
            <label style={{ fontSize: 12, color: c.textDim, display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={newAgent.description} onChange={e => setNewAgent(a => ({ ...a, description: e.target.value }))} placeholder="What does this agent do?"
              style={{ width: "100%", background: c.card, border: `1px solid ${c.border2}`, borderRadius: 10, padding: "10px 14px", color: c.textBright, fontSize: 14, outline: "none", fontFamily: "inherit", resize: "none", height: 80, marginBottom: 16, boxSizing: "border-box" }} />
            <label style={{ fontSize: 12, color: c.textDim, display: "block", marginBottom: 8 }}>Icon</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["🤖", "🔍", "📊", "✈️", "🌐", "📝", "⚡", "🎯", "🔔", "📈", "🧠", "🔧"].map(em => (
                <button key={em} onClick={() => setNewAgent(a => ({ ...a, icon: em }))}
                  style={{ fontSize: 20, background: newAgent.icon === em ? "#10a37f22" : c.card, border: `2px solid ${newAgent.icon === em ? c.green : c.border2}`, borderRadius: 10, width: 44, height: 44, cursor: "pointer" }}>{em}</button>
              ))}
            </div>
          </div>
        )}
        {wizardStep === 1 && (
          <div>
            <div style={{ fontSize: 13, color: c.textDim, marginBottom: 12 }}>Select the local model this agent uses for inference.</div>
            {downloaded.map(m => (
              <div key={m.id} onClick={() => setNewAgent(a => ({ ...a, model: m.id }))}
                style={{ background: newAgent.model === m.id ? "#10a37f11" : c.card, border: `1px solid ${newAgent.model === m.id ? "#10a37f44" : c.border2}`, borderRadius: 14, padding: 14, marginBottom: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
                <Icon name="cpu" size={18} color={newAgent.model === m.id ? c.green : c.textDim} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div><div style={{ fontSize: 11, color: c.textDim }}>{m.params} · {m.speed} · {m.ctx} context</div></div>
                {newAgent.model === m.id && <Icon name="check" size={18} color={c.green} />}
              </div>
            ))}
          </div>
        )}
        {wizardStep === 2 && (
          <div>
            <div style={{ fontSize: 13, color: c.textDim, marginBottom: 12 }}>Define the agent's role and behavior instructions.</div>
            <textarea placeholder="You are a helpful assistant that specializes in..."
              style={{ width: "100%", background: c.card, border: `1px solid ${c.border2}`, borderRadius: 10, padding: "12px 14px", color: c.textBright, fontSize: 13, outline: "none", fontFamily: "inherit", resize: "none", height: 160, boxSizing: "border-box", lineHeight: 1.6 }} />
            <div style={{ marginTop: 12, fontSize: 11, color: c.textDim, marginBottom: 8 }}>Quick templates:</div>
            {["Summarize the input in 3 bullet points.", "Translate input text to Tamil.", "Review code and suggest improvements."].map(t => (
              <button key={t} style={{ display: "block", width: "100%", textAlign: "left", background: c.card, border: `1px solid ${c.border2}`, borderRadius: 8, padding: "8px 12px", color: c.textMid, fontSize: 12, cursor: "pointer", marginBottom: 6 }}>{t}</button>
            ))}
          </div>
        )}
        {wizardStep === 3 && (
          <div>
            <div style={{ fontSize: 13, color: c.textDim, marginBottom: 12 }}>Choose tools this agent can use.</div>
            {[["http_get", "HTTP GET", "Fetch data from APIs or URLs"], ["http_post", "HTTP POST", "Send data to APIs or webhooks"], ["clipboard_write", "Clipboard", "Write output to clipboard"], ["notification", "Notifications", "Send push notifications"], ["calendar_read", "Calendar", "Read calendar events"], ["file_write", "File Write", "Save output to a file"], ["send_intent", "App Intent", "Interact with other apps"]].map(([id, name, desc]) => (
              <div key={id} onClick={() => setNewAgent(a => ({ ...a, tools: a.tools.includes(id) ? a.tools.filter(t => t !== id) : [...a.tools, id] }))}
                style={{ background: c.surface, border: `1px solid ${newAgent.tools.includes(id) ? "#10a37f44" : c.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: newAgent.tools.includes(id) ? "#10a37f22" : c.card, border: `1px solid ${newAgent.tools.includes(id) ? "#10a37f44" : c.border2}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="zap" size={15} color={newAgent.tools.includes(id) ? c.green : c.textDim} />
                </div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div><div style={{ fontSize: 11, color: c.textDim }}>{desc}</div></div>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: newAgent.tools.includes(id) ? c.green : c.card, border: `2px solid ${newAgent.tools.includes(id) ? c.green : c.border2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {newAgent.tools.includes(id) && <Icon name="check" size={11} color="#fff" />}
                </div>
              </div>
            ))}
          </div>
        )}
        {wizardStep === 4 && (
          <div>
            <div style={{ fontSize: 13, color: c.textDim, marginBottom: 12 }}>When should this agent activate?</div>
            {[["on-demand", "On Demand", "Tap Run to execute manually"], ["share", "Share Sheet", "Activates when content is shared to it"], ["schedule", "Schedule (Cron)", "Runs automatically on a time schedule"], ["lan", "LAN REST Endpoint", "Exposed as HTTP API on local network"]].map(([val, label, desc]) => (
              <div key={val} onClick={() => setNewAgent(a => ({ ...a, trigger: val }))}
                style={{ background: newAgent.trigger === val ? "#10a37f0d" : c.surface, border: `1px solid ${newAgent.trigger === val ? "#10a37f44" : c.border}`, borderRadius: 12, padding: "14px", marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, transition: "all 0.15s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${newAgent.trigger === val ? c.green : c.border2}`, background: newAgent.trigger === val ? c.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 }}>
                  {newAgent.trigger === val && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                </div>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div><div style={{ fontSize: 12, color: c.textDim, marginTop: 2 }}>{desc}</div></div>
              </div>
            ))}
          </div>
        )}
        {wizardStep === 5 && (
          <div>
            <div style={{ background: "#10a37f0d", border: "1px solid #10a37f33", borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{newAgent.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{newAgent.name || "Unnamed Agent"}</div>
              <div style={{ fontSize: 13, color: c.textDim, marginTop: 4 }}>{newAgent.description || "No description set"}</div>
            </div>
            {[["Model", downloaded.find(m => m.id === newAgent.model)?.name || "—"], ["Trigger", newAgent.trigger], ["Tools", newAgent.tools.length > 0 ? newAgent.tools.join(", ") : "None selected"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${c.border}`, fontSize: 13 }}>
                <span style={{ color: c.textDim }}>{k}</span><span style={{ fontWeight: 500, maxWidth: "60%", textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: 14, borderTop: `1px solid ${c.border}`, display: "flex", gap: 10 }}>
        {wizardStep > 0 && <button onClick={() => setWizardStep(s => s - 1)} style={{ flex: 1, background: c.card, border: `1px solid ${c.border2}`, borderRadius: 12, padding: "12px 0", color: c.text, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Back</button>}
        <button onClick={() => {
          if (wizardStep < WIZARD_STEPS.length - 1) { setWizardStep(s => s + 1); }
          else {
            const agent = { id: `a${Date.now()}`, name: newAgent.name || "New Agent", description: newAgent.description || "", icon: newAgent.icon, color: "#10a37f", status: "idle", model: downloaded.find(m => m.id === newAgent.model)?.name || "—", trigger: newAgent.trigger, tools: newAgent.tools, lastRun: "Never", runs: 0 };
            setAgents(p => [...p, agent]);
            setShowWizard(false); setWizardStep(0);
            setNewAgent({ name: "", description: "", icon: "🤖", model: "llama3-8b-q4", trigger: "on-demand", tools: [] });
            showToast(`Agent "${agent.name}" created!`);
          }
        }} style={{ flex: 2, background: c.accent, border: "none", borderRadius: 12, padding: "12px 0", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          {wizardStep < WIZARD_STEPS.length - 1 ? "Continue →" : "✓ Create Agent"}
        </button>
      </div>
    </div>
  );

  const AgentsScreen = () => (
    <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
      {showWizard && <AgentWizard />}
      <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Agents</div>
        <button onClick={() => { setShowWizard(true); setWizardStep(0); }}
          style={{ background: c.accent, border: "none", borderRadius: 20, padding: "7px 14px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="plus" size={14} /> New Agent
        </button>
      </div>
      <div style={{ padding: "12px 14px" }}>
        {agents.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: c.textDim }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🤖</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>No agents yet</div>
            <div style={{ fontSize: 13 }}>Tap New Agent to create one</div>
          </div>
        )}
        {agents.map(agent => (
          <div key={agent.id} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: agent.color + "22", border: `1px solid ${agent.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{agent.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{agent.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: agent.status === "active" ? "#10a37f22" : "#30363d", color: agent.status === "active" ? c.green : c.textDim, border: `1px solid ${agent.status === "active" ? "#10a37f44" : c.border2}` }}>
                    {agent.status === "active" ? "● Active" : "○ Idle"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: c.textDim, marginTop: 3 }}>{agent.model} · {agent.trigger}</div>
                <div style={{ fontSize: 12, color: c.textMid, marginTop: 6, lineHeight: 1.5 }}>{agent.description}</div>
                {agent.tools?.length > 0 && (
                  <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                    {agent.tools.map(t => <span key={t} style={{ fontSize: 10, background: c.card, border: `1px solid ${c.border2}`, borderRadius: 20, padding: "2px 7px", color: c.textMid }}>{t}</span>)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => {
                    setAgents(p => p.map(a => a.id === agent.id ? { ...a, status: "active", lastRun: "Just now", runs: a.runs + 1 } : a));
                    showToast(`${agent.name} running…`);
                    setTimeout(() => setAgents(p => p.map(a => a.id === agent.id ? { ...a, status: "idle" } : a)), 3000);
                  }} style={{ flex: 1, background: c.accent, border: "none", borderRadius: 10, padding: "9px 0", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>▶ Run Now</button>
                  <button style={{ background: c.card, border: `1px solid ${c.border2}`, borderRadius: 10, padding: "9px 12px", color: c.textDim, cursor: "pointer" }}><Icon name="edit" size={13} /></button>
                  <button onClick={() => { setAgents(p => p.filter(a => a.id !== agent.id)); showToast("Agent deleted", "error"); }}
                    style={{ background: c.card, border: `1px solid ${c.border2}`, borderRadius: 10, padding: "9px 12px", color: "#ef4444", cursor: "pointer" }}><Icon name="trash" size={13} /></button>
                </div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 8 }}>Last run: {agent.lastRun} · {agent.runs} total runs</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Toggle = ({ defaultOn = false }) => {
    const [on, setOn] = useState(defaultOn);
    return (
      <div onClick={() => setOn(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? c.green : c.border2, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </div>
    );
  };

  const runTest = (id) => {
    setTestResults(p => ({ ...p, [id]: "running" }));
    setTimeout(() => setTestResults(p => ({ ...p, [id]: "passed" })), 1200 + Math.random() * 1200);
  };

  const SettingsScreen = () => {
    const allPassed = Object.values(testResults).filter(v => v === "passed").length === 6;
    return (
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${c.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Settings & Testing</div>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Active Model</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
            {[["Name", selectedModel.name], ["Params", selectedModel.params], ["Quant", selectedModel.quant], ["Speed", selectedModel.speed], ["Context", selectedModel.ctx], ["Storage", "SQLite / Room DB"], ["Privacy", "100% On-device"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${c.border}`, fontSize: 13 }}>
                <span style={{ color: c.textDim }}>{k}</span><span style={{ fontWeight: 600, color: c.green }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: c.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>E2E Test Suite</div>
          {[["chat", "Chat & Streaming", "Message send, token streaming, history"], ["models", "Model Manager", "Download flow, model switching, storage"], ["agents", "Agent System", "Create, run, output delivery"], ["db", "SQLite Memory", "Room DB read/write, indexing"], ["integration", "App Integration", "Intent dispatch, clipboard, HTTP tools"], ["privacy", "Privacy Audit", "Zero network calls during inference"]].map(([id, label, desc]) => {
            const status = testResults[id];
            return (
              <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: status === "passed" ? "#10a37f0d" : status === "running" ? "#f59e0b0d" : c.surface, borderRadius: 10, marginBottom: 8, border: `1px solid ${status === "passed" ? "#10a37f33" : status === "running" ? "#f59e0b33" : c.border}`, transition: "all 0.3s" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
                  <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{desc}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {status === "running" && <div style={{ width: 15, height: 15, border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
                  {status === "passed" && <div style={{ width: 20, height: 20, borderRadius: "50%", background: c.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="check" size={10} color="#fff" /></div>}
                  <button onClick={() => runTest(id)} style={{ background: status === "passed" ? c.card : c.accent, border: "none", borderRadius: 8, padding: "5px 12px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 11 }}>
                    {status === "passed" ? "Re-run" : "Run"}
                  </button>
                </div>
              </div>
            );
          })}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <button onClick={() => { ["chat", "models", "agents", "db", "integration", "privacy"].forEach((id, i) => setTimeout(() => runTest(id), i * 350)); showToast("Running all tests…"); }}
            style={{ width: "100%", background: c.accent, border: "none", borderRadius: 12, padding: "13px 0", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 4 }}>
            ▶ Run All Tests
          </button>
          {allPassed && (
            <div style={{ background: "#10a37f0d", border: "1px solid #10a37f33", borderRadius: 12, padding: 16, marginTop: 12, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
              <div style={{ fontWeight: 700, color: c.green }}>All tests passed!</div>
              <div style={{ fontSize: 12, color: c.textDim, marginTop: 4 }}>LocalMind AI is fully operational</div>
            </div>
          )}

          <div style={{ fontSize: 10, fontWeight: 700, color: c.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, marginTop: 20 }}>Preferences</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: "0 14px", marginBottom: 16 }}>
            {[["GPU Acceleration", true], ["Developer Mode", false], ["LAN Endpoint", false], ["Auto-update models", false]].map(([label, def]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${c.border}` }}>
                <span style={{ fontSize: 13 }}>{label}</span>
                <Toggle defaultOn={def} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: c.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>About</div>
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, padding: 14 }}>
            {[["App", "LocalMind AI"], ["Version", "1.0.0"], ["Build", "2026.04"], ["Engine", "llama.cpp (JNI)"], ["Developer", "Suresh Kumar T"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${c.border}`, fontSize: 13 }}>
                <span style={{ color: c.textDim }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: c.bg, color: c.text, fontFamily: "'DM Sans', system-ui, sans-serif", overflow: "hidden", maxWidth: 430, margin: "0 auto", position: "relative", boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}>

      {/* Screen */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {tab === "chat" && <ChatScreen />}
        {tab === "models" && <ModelsScreen />}
        {tab === "agents" && <AgentsScreen />}
        {tab === "settings" && <SettingsScreen />}
      </div>

      {/* Bottom Nav */}
      <div style={{ display: "flex", background: c.surface, borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
        {[["chat", "chat", "Chat"], ["cpu", "models", "Models"], ["bot", "agents", "Agents"], ["settings", "settings", "Settings"]].map(([icon, id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 8px", gap: 3, cursor: "pointer", background: "none", border: "none", color: tab === id ? c.green : c.textDim, transition: "color 0.2s", position: "relative" }}>
            <Icon name={icon} size={21} color={tab === id ? c.green : c.textDim} />
            <span style={{ fontSize: 10, fontWeight: tab === id ? 700 : 400 }}>{label}</span>
            {tab === id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: c.green, position: "absolute", bottom: 3 }} />}
          </button>
        ))}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
