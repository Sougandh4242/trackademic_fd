import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Sparkles, X, Loader2 } from "lucide-react";
import { aiApi } from "@/lib/services";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Trackademic AI. Ask me to find students by skill, project, or hackathon — or anything about your profile.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const el = document.getElementById("chat-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await aiApi.chat(text, messages);
      const reply: string =
        res?.reply || res?.message || res?.response || JSON.stringify(res);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Sorry — I couldn't reach the AI service. (${e?.message ?? "network error"})`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-accent text-accent-foreground shadow-glow grid place-items-center hover:scale-105 transition-transform"
        aria-label="Open AI chat"
      >
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(560px,70vh)] glass-strong rounded-3xl shadow-elevated flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 rounded-lg gradient-accent grid place-items-center text-accent-foreground">
                  <Sparkles size={14} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Trackademic AI
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Always online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div
              id="chat-scroll"
              className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm gradient-accent text-accent-foreground px-3.5 py-2 text-sm"
                      : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary/60 border border-border px-3.5 py-2 text-sm text-foreground"
                  }
                >
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {busy && (
                <div className="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary/60 border border-border px-3.5 py-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2 rounded-2xl bg-secondary/50 border border-border px-3 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Ask anything…"
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={send}
                  disabled={busy || !input.trim()}
                  className="h-8 w-8 rounded-lg gradient-accent text-accent-foreground grid place-items-center disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
