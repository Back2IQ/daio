import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useGovernanceStore } from "@/store/governance";

const API = "/api/chat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getUserContext(): string {
  try {
    const store = useGovernanceStore.getState();
    const score = store.getDaiScore();
    const bens = store.beneficiaries.length;
    const frags = store.keyFragments.length;
    const dms = store.deadManSwitch.enabled;
    const level = store.inheritanceContainer.level;
    const lastUpdate = store.inheritanceContainer.lastUpdated;

    let assetsCount = 0;
    try {
      const raw = localStorage.getItem("daio-digital-estate-assets");
      if (raw) assetsCount = JSON.parse(raw).length;
    } catch { /* */ }

    if (score === 0 && bens === 0 && assetsCount === 0) return "";

    return `[User context: Governance Score ${score}/100, ${assetsCount} digital assets inventoried, ${bens} beneficiaries, ${frags} key fragments, DMS ${dms ? "active" : "inactive"}, Inheritance Container Level ${level}${lastUpdate ? "" : " (not started)"}]`;
  } catch {
    return "";
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello \u2014 I can answer questions about DAIO and digital asset succession planning. I also speak German \u2014 fragen Sie gerne auf Deutsch." },
  ]);
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const origin = window.location.origin;
      const base = origin.includes("localhost") ? "https://daio-back2iq-static.d77kiran.workers.dev" : "";
      const res = await fetch(base + API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: [...messages.slice(-6), userMsg],
          context: getUserContext(),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "Sorry, I could not process that." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#c9a54e] text-[#0a0f1a] shadow-lg hover:scale-108 transition-transform flex items-center justify-center"
        style={{ boxShadow: "0 4px 20px rgba(201,165,78,0.4)" }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden border border-[#1e2638] shadow-2xl flex flex-col" style={{ background: "#141a2a", maxHeight: "500px" }}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#1e2638] flex items-center justify-between" style={{ background: "#0a0f1a" }}>
            <div>
              <div className="text-sm font-semibold text-[#c9a54e]">DAIO Assistant</div>
              <div className="text-[11px] text-[#9ca3af]">Ask about digital estate planning</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#9ca3af] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={msgsRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: 200, maxHeight: 350 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "self-end bg-[#c9a54e] text-[#0a0f1a] font-medium rounded-br-sm"
                    : "self-start bg-[#1e2638] text-[#e5e7eb] rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-[#1e2638] text-[#9ca3af] italic px-3 py-2 rounded-xl text-[13px] rounded-bl-sm">
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-[#1e2638]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask a question..."
              maxLength={500}
              className="flex-1 bg-[#0a0f1a] border border-[#1e2638] rounded-lg px-3 py-2 text-[13px] text-[#e5e7eb] placeholder-[#6b7280] outline-none focus:border-[#c9a54e]"
              style={{ fontFamily: "inherit" }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-[#c9a54e] text-[#0a0f1a] rounded-lg px-3 py-2 font-semibold text-[13px] hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
