import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { callAgnesStream } from '@/lib/agnes-api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Menu,
  Sparkles,
  Loader2,
  Mountain,
  ChevronRight,
  StopCircle,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedQuestions?: string[];
}

interface IChatSession {
  id: string;
  title: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */

const STORAGE_KEY = '__wanshan_chat_history';

const TERM_GLOSSARY: Record<string, string> = {
  '花岗岩地貌': '由岩浆侵入地壳深处缓慢冷却结晶形成的花岗岩体，经地壳抬升、风化剥蚀和重力崩塌后形成的独特地貌。安徽黄山、九华山、天柱山均为典型代表。',
  '丹霞地貌': '由红色陆相碎屑岩（红层）经地壳抬升、流水侵蚀、风化剥落形成的赤壁丹崖地貌。安徽齐云山是江南丹霞地貌的代表。',
  '火山地貌': '由岩浆喷发、熔岩流动、火山灰沉积等火山活动形成的地貌。安徽浮山、大蜀山、女山保存有完整的古火山遗迹。',
  '燕山期': '距今约2亿至6500万年前的地质时期，是东亚地区重要的构造-岩浆活动期。安徽黄山、九华山等花岗岩体均形成于燕山期。',
  '垂直节理': '岩石中垂直于地面的裂隙系统，是花岗岩地貌形成的关键因素。黄山奇峰怪石的形成与垂直节理密切相关。',
  '风化剥蚀': '地表岩石在阳光、水、风、生物等作用下发生物理和化学分解，并被搬运移走的过程。',
  '红层': '白垩纪至古近纪沉积的红色陆相碎屑岩系，富含氧化铁而呈红色，是丹霞地貌的物质基础。',
  '柱状节理': '火山岩冷却收缩形成的规则六边形柱状裂隙，常见于玄武岩中。浮山古火山可见柱状节理发育。',
  '峰林地貌': '由密集的柱状或锥状山峰组成的地貌景观，黄山花岗岩峰林是世界级的典型代表。',
  '世界地质公园': '由联合国教科文组织认定的具有国际意义的地质遗产区域。安徽天柱山、黄山均为世界地质公园。',
  '白垩系': '距今约1.45亿至6600万年前的地层系统，是丹霞地貌红层的主要沉积时期。',
  '地质构造': '地壳中岩层或岩体在内外力地质作用下发生的变形、变位现象，包括褶皱、断裂、节理等。',
};

const SUGGESTED_QUESTIONS = [
  '黄山为什么被称为"天下第一奇山"？',
  '安徽三大地貌类型各有什么特点？',
  '天柱山为什么是安徽简称"皖"的来源？',
  '九华山的地质成因是什么？',
  '浮山的古火山地貌是怎么形成的？',
  '大别山主峰在哪里？有什么特色？',
];

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadSessions(): IChatSession[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IChatSession[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: IChatSession[]): void {
  scopedStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function highlightTerms(text: string): { html: string; terms: string[] } {
  const terms = Object.keys(TERM_GLOSSARY).filter((t) => text.includes(t));
  if (terms.length === 0) return { html: text, terms: [] };

  let result = text;
  terms.forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(escaped, 'g'),
      `<span class="term-highlight" data-term="${term}">${term}</span>`,
    );
  });
  return { html: result, terms };
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function TermTooltip({ term }: { term: string }) {
  const explanation = TERM_GLOSSARY[term];
  if (!explanation) return <span>{term}</span>;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-primary/60 text-primary font-medium hover:text-primary/80 transition-colors">
            {term}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px] p-3 text-sm leading-relaxed">
          <p className="font-semibold mb-1 text-xs text-muted-foreground">📖 术语解释</p>
          {explanation}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RenderedContent({ text }: { text: string }) {
  const { html, terms } = highlightTerms(text);
  if (terms.length === 0) {
    return <p className="whitespace-pre-line leading-relaxed">{text}</p>;
  }

  const parts = html.split(/(<span class="term-highlight" data-term="[^"]*">[^<]*<\/span>)/g);

  return (
    <p className="whitespace-pre-line leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/<span class="term-highlight" data-term="([^"]*)">([^<]*)<\/span>/);
        if (match) {
          return <TermTooltip key={i} term={match[1]} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-1 py-1"
    >
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="size-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="size-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-muted-foreground">AI 正在思考...</span>
    </motion.div>
  );
}

function EmptyState({ onQuestionClick }: { onQuestionClick: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 ink-texture-bg" />
      <div className="absolute bottom-0 left-0 right-0 h-40 mountain-silhouette opacity-50" />
      <div className="absolute top-1/4 right-10 w-32 h-32 ink-wash rounded-full opacity-60 blur-2xl" />
      <div className="absolute bottom-1/3 left-10 w-24 h-24 bg-gradient-to-br from-accent/30 to-primary/10 rounded-full opacity-40 blur-xl" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center mb-8 shadow-md backdrop-blur-sm border border-primary/10">
          <div className="size-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Mountain className="size-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3 font-serif">你好！我是皖山智探AI助手</h2>
        <p className="text-muted-foreground text-center max-w-lg mb-10 leading-relaxed text-base">
          你可以问我任何关于安徽山脉的问题——地质地貌、地理气候、生态生物、历史文化、旅游攻略，我都能为你解答。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <motion.button
              key={q}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
              onClick={() => onQuestionClick(q)}
              className="flex items-center gap-2 text-left p-4 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/30 hover:shadow-md transition-all text-sm group"
            >
              <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-foreground/80 group-hover:text-foreground">{q}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */

export default function AiChatPage() {
  const [sessions, setSessions] = useState<IChatSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const loaded = loadSessions();
    return loaded.length > 0 ? loaded[0].id : '';
  });
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  /* ── Persist ── */
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  /* ── Create new session ── */
  const newSession = useCallback(() => {
    const session: IChatSession = {
      id: genId(),
      title: '新对话',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setHistoryOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  /* ── Delete session ── */
  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setSessions((prev) => {
          if (prev.length > 0) {
            setActiveSessionId(prev[0].id);
          } else {
            setActiveSessionId('');
          }
          return prev;
        });
      }
      toast.success('对话已删除');
    },
    [activeSessionId],
  );

  /* ── Update session messages ── */
  const updateSessionMessages = useCallback(
    (sessionId: string, updater: (prev: IChatMessage[]) => IChatMessage[]) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: updater(s.messages), updatedAt: new Date().toISOString() }
            : s,
        ),
      );
    },
    [],
  );

  /* ── Auto-title ── */
  const autoTitle = useCallback(
    (sessionId: string, firstUserMsg: string) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId && s.title === '新对话'
            ? { ...s, title: firstUserMsg.length > 20 ? firstUserMsg.slice(0, 20) + '...' : firstUserMsg }
            : s,
        ),
      );
    },
    [],
  );

  /* ── Send message ── */
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      let sessionId = activeSessionId;
      if (!sessionId) {
        const session: IChatSession = {
          id: genId(),
          title: '新对话',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSessions((prev) => [session, ...prev]);
        sessionId = session.id;
        setActiveSessionId(sessionId);
      }

      const userMsg: IChatMessage = {
        id: genId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      updateSessionMessages(sessionId, (prev) => [...prev, userMsg]);
      autoTitle(sessionId, trimmed);
      setInputValue('');
      setIsStreaming(true);

      const assistantId = genId();
      updateSessionMessages(sessionId, (prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const stream = callAgnesStream(trimmed);

        let fullContent = '';
        for await (const chunk of stream) {
          if (controller.signal.aborted) break;
          fullContent += chunk;
          updateSessionMessages(sessionId, (prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m)),
          );
        }

        if (fullContent && !controller.signal.aborted) {
          const relatedQuestions = generateRelatedQuestions(trimmed);
          updateSessionMessages(sessionId, (prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, relatedQuestions } : m)),
          );
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
        const errorMsg = `抱歉，AI 回答生成失败：${String(err)}`;
        updateSessionMessages(sessionId, (prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: errorMsg } : m)),
        );
        toast.error('AI 回答生成失败，请重试');
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [activeSessionId, isStreaming, updateSessionMessages, autoTitle],
  );

  /* ── Stop streaming ── */
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /* ── Submit handler ── */
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      sendMessage(inputValue);
    },
    [inputValue, sendMessage],
  );

  /* ── Keyboard handler ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage],
  );

  /* ── Generate related questions ── */
  function generateRelatedQuestions(_userQuestion: string): string[] {
    const pool = [
      '安徽有哪些著名的花岗岩地貌山峰？',
      '丹霞地貌和火山地貌有什么区别？',
      '黄山四绝分别是什么？',
      '天柱山为什么被称为"古南岳"？',
      '九华山有哪些著名的寺庙？',
      '大别山脉横跨哪些省份？',
      '齐云山的道教文化有哪些特色？',
      '浮山的火山地貌距今多少年？',
      '安徽最高峰是哪座山？',
      '敬亭山与李白有什么关系？',
      '琅琊山醉翁亭的历史故事是什么？',
      '天堂寨的瀑布群有什么特色？',
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  /* ───────────────────────────────────────────
     Render
     ─────────────────────────────────────────── */

  return (
    <div className="flex h-full w-full">
      {/* ── Desktop History Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border/40 bg-card/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <span className="text-sm font-semibold text-foreground">对话历史</span>
          <Button variant="ghost" size="icon" className="size-8" onClick={newSession} aria-label="新对话">
            <Plus className="size-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">暂无对话记录</p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                  s.id === activeSessionId
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'hover:bg-accent/50 text-foreground/70'
                }`}
              >
                <MessageSquare className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{s.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                  aria-label="删除对话"
                >
                  <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden size-9" aria-label="对话历史">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="px-4 py-3 border-b border-border/30">
                  <SheetTitle className="text-sm">对话历史</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={newSession}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-primary font-medium hover:bg-accent/50 transition-colors"
                    >
                      <Plus className="size-4" /> 新对话
                    </button>
                    {sessions.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">暂无对话记录</p>
                    )}
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          setHistoryOpen(false);
                        }}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors ${
                          s.id === activeSessionId
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'hover:bg-accent/50 text-foreground/70'
                        }`}
                      >
                        <MessageSquare className="size-3.5 shrink-0" />
                        <span className="flex-1 truncate">{s.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(s.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                          aria-label="删除对话"
                        >
                          <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h1 className="text-base font-semibold text-foreground">AI 智能问答</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={newSession} className="gap-1.5">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">新对话</span>
          </Button>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 ? (
              <EmptyState onQuestionClick={(q) => sendMessage(q)} />
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="size-8 rounded-full bg-gradient-to-br from-primary/15 to-accent/20 flex items-center justify-center shrink-0 mt-1">
                          <Sparkles className="size-4 text-primary" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md shadow-sm'
                            : 'bg-card border border-border/40 rounded-bl-md shadow-sm'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-line leading-relaxed text-sm">{msg.content}</p>
                        ) : msg.content ? (
                          <div className="text-sm">
                            <RenderedContent text={msg.content} />
                          </div>
                        ) : (
                          <TypingIndicator />
                        )}

                        {msg.role === 'assistant' && msg.relatedQuestions && msg.relatedQuestions.length > 0 && msg.content && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-2">💡 你可能还想问：</p>
                            <div className="flex flex-wrap gap-2">
                              {msg.relatedQuestions.map((q) => (
                                <Badge
                                  key={q}
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-accent transition-colors text-xs font-normal"
                                  onClick={() => sendMessage(q)}
                                >
                                  {q}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="size-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
                          <span className="text-xs font-semibold text-accent-foreground">我</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="shrink-0 border-t border-border/30 bg-card/80 backdrop-blur-sm px-4 py-3">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题，按 Enter 发送..."
                disabled={isStreaming}
                className="pr-10 min-h-[44px] bg-background border-border/60 focus-visible:ring-primary/30"
              />
            </div>
            {isStreaming ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stopStreaming}
                className="shrink-0 size-[44px] border-destructive/30 text-destructive hover:bg-destructive/10"
                aria-label="停止生成"
              >
                <StopCircle className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim()}
                className="shrink-0 size-[44px]"
                aria-label="发送"
              >
                <Send className="size-4" />
              </Button>
            )}
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
            皖山智探 AI 助手基于安徽山脉专业知识库，回答仅供参考。按 Enter 发送，Shift+Enter 换行。
          </p>
        </div>
      </div>
    </div>
  );
}
