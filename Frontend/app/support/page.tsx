"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  RotateCcw, 
  Truck, 
  Package, 
  ShieldCheck, 
  CreditCard, 
  Mail, 
  HelpCircle,
  Sun,
  Moon,
  ShoppingBag
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessageContent from "@/components/ChatMessageContent";

type Message = {
  role: "user" | "assistant";
  content: string;
  time?: string;
};

const FAQ_ITEMS = [
  {
    icon: Truck,
    title: "Shipping & Delivery",
    desc: "Free standard shipping over $50. Arrives in 2-4 business days.",
    prompt: "What is your shipping policy and delivery timeline?"
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    desc: "Hassle-free returns with complimentary prepaid labels.",
    prompt: "How does the 30-day return and refund policy work?"
  },
  {
    icon: ShieldCheck,
    title: "Product Authenticity",
    desc: "100% genuine goods direct from verified brand vendors.",
    prompt: "Are all products guaranteed genuine from verified vendors?"
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    desc: "Encrypted 256-bit SSL checkout. Visa, MC, Amex, Apple Pay.",
    prompt: "What payment methods do you accept at checkout?"
  }
];

export default function SupportPage() {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to FISTA Customer Care! I am your dedicated AI Shopping Concierge.\n\nI have complete real-time access to our product catalog, inventory levels, shipping timelines, and return policies. How may I assist you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = { role: "user", content: text, time: currentTime };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(
        text,
        updatedHistory.map((m) => ({ role: m.role, content: m.content }))
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm temporarily having trouble accessing the server. Please try asking again in a moment, or email us at support@fistamarketplace.com.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversation refreshed. How else can I assist your FISTA shopping experience today?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Marketplace
            </Link>
            <span className="text-border">|</span>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold">FISTA</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                Support
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#F8CB4F]" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#F8CB4F] text-[#241E28] text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Support Center */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Support Directory & FAQ */}
        <div className="lg:w-80 shrink-0 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <h2 className="font-serif font-bold text-base">AI Support Hub</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Instant answers to any question regarding our marketplace products and orders.
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Common Topics:
              </p>
              {FAQ_ITEMS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.prompt)}
                    className="w-full text-left p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 transition-colors flex items-start gap-2.5 group"
                  >
                    <IconComponent className="w-4 h-4 text-amber-600 dark:text-[#F8CB4F] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground group-hover:underline">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Human Escalation Notice */}
            <div className="pt-3 border-t border-border text-xs space-y-2">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Human Team Escalation
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Need specialized assistance with custom orders or billing? Contact our support staff directly:
              </p>
              <a
                href="mailto:support@fistamarketplace.com"
                className="text-xs font-semibold text-[#4C4556] dark:text-[#F8CB4F] hover:underline block truncate"
              >
                support@fistamarketplace.com
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Full-Height Chat Canvas */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-[680px]">
          {/* Canvas Header */}
          <div className="px-6 py-4 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm flex items-center gap-2">
                  <span>FISTA AI Concierge</span>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                    Online
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Grounded in live database inventory & store knowledge
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChat}
              className="text-xs h-8 gap-1.5 rounded-lg"
            >
              <RotateCcw className="w-3 h-3" /> Reset Chat
            </Button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] shrink-0 flex items-center justify-center mt-1 text-xs font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-1 max-w-[85%] sm:max-w-xl">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] rounded-br-xs font-medium shadow-xs"
                        : "bg-secondary text-foreground rounded-bl-xs border border-border/80 shadow-xs"
                    }`}
                  >
                    <ChatMessageContent content={msg.content} isUser={msg.role === "user"} />
                  </div>
                  {msg.time && (
                    <p
                      className={`text-[10px] text-muted-foreground px-1 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.time}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4C4556] text-white dark:bg-[#F8CB4F] dark:text-[#241E28] shrink-0 flex items-center justify-center text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-secondary text-foreground p-4 rounded-2xl rounded-bl-xs text-xs flex gap-1.5 items-center border border-border">
                  <span className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce delay-150" />
                  <span className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Message Input Footer */}
          <div className="p-4 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2.5 items-center"
            >
              <Input
                placeholder="Ask anything about products, return window, shipping speeds, or checkout..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-grow h-11 text-xs sm:text-sm bg-secondary/50 border-border focus:bg-background"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-11 px-5 rounded-xl bg-[#4C4556] hover:bg-[#583F52] text-white dark:bg-[#F8CB4F] dark:hover:bg-[#f6c236] dark:text-[#241E28] font-semibold text-xs gap-2 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
