'use client';

import { useState, useRef, useEffect, useMemo, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Attachment01Icon,
  Globe02Icon,
  ArrowUp02Icon,
  Calculator01Icon,
  Car01Icon,
  FileSearchIcon,
  FolderSearchIcon,
} from '@hugeicons/core-free-icons';
import { useAuth } from '@/contexts/AuthContext';
import MarkdownRenderer from './MarkdownRenderer';
import Topbar, { type BreadcrumbItem } from '@/components/topbar/Topbar';
import styles from './chat.module.scss';

// --- Data ---

interface QuickAction {
  label: string;
  icon: typeof Calculator01Icon;
}

const quickActions: QuickAction[] = [
  { label: 'Preventivi', icon: Calculator01Icon },
  { label: 'Sinistri', icon: Car01Icon },
  { label: 'Analisi Pratiche', icon: FileSearchIcon },
  { label: 'Ricerca Documenti', icon: FolderSearchIcon },
];

interface ExampleCard {
  icon: typeof Calculator01Icon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  prompt: string;
}

const examples: ExampleCard[] = [
  {
    icon: Calculator01Icon,
    iconBg: '#E8F6EF',
    iconColor: '#1A7A4A',
    title: 'Creazione Preventivo',
    description: 'Genera un preventivo auto completo partendo dai dati del cliente e del veicolo, con calcolo automatico dei premi.',
    prompt: 'Crea un preventivo RC Auto per Mario Rossi, Fiat Panda 2021, classe di merito 5',
  },
  {
    icon: FolderSearchIcon,
    iconBg: '#EBF2FF',
    iconColor: '#2563B0',
    title: 'Ricerca Documentale',
    description: 'Cerca tra polizze, sinistri e documenti archiviati utilizzando criteri come nome cliente, numero polizza o data.',
    prompt: 'Cerca tutti i documenti relativi al cliente Bianchi Luigi degli ultimi 6 mesi',
  },
];

// --- Types ---

interface MessageAttachment {
  type: 'pdf';
  filename: string;
  url: string;
  pdf_id: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: MessageAttachment[];
}

const TOOL_LABELS: Record<string, string> = {
  cercaPersona: 'Sto cercando la persona nel sistema',
  getPersona: 'Sto recuperando i dettagli della persona',
  creaPersona: 'Sto creando la nuova persona',
  aggiornaPersona: 'Sto aggiornando i dati della persona',
  creaPreventivo: 'Sto creando il preventivo',
  getPreventivo: 'Sto recuperando il preventivo',
  cercaPreventivi: 'Sto cercando i preventivi',
  aggiornaPreventivo: 'Sto aggiornando il preventivo',
  scrapaPreventivi: 'Sto interrogando le compagnie assicurative',
  generaPdf: 'Sto generando il documento PDF',
  inviaMail: 'Sto inviando l\'email',
};

function describeTool(toolName: string): string {
  return TOOL_LABELS[toolName] || `Sto eseguendo ${toolName}`;
}

interface ChatViewProps {
  initialConversationId?: string;
}

// --- Component ---

export default function ChatView({ initialConversationId }: ChatViewProps) {
  const { profile } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!initialConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing conversation messages
  useEffect(() => {
    if (!initialConversationId) return;
    setLoading(true);
    fetch(`/api/messages?conversation_id=${initialConversationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages) setChatMessages(data.messages);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
  }, [initialConversationId]);

  const userName = useMemo(() => {
    const name = profile?.full_name;
    if (name) return name.split(' ')[0];
    return 'Alessio';
  }, [profile]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 13 ? 'Buongiorno' : 'Buonasera';
  }, []);

  const onInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setMessage(target.value);
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setMessage('');
    setThinkingStatus('Sto pensando');

    const botId = crypto.randomUUID();
    setChatMessages((prev) => [
      ...prev,
      { id: botId, role: 'assistant', content: '', created_at: new Date().toISOString() },
    ]);
    setStreaming(true);

    // 3-layer streaming:
    // Layer 1: SSE chunks → accumulate in receivedText (no React)
    // Layer 2: Typewriter → consumes receivedText char-by-char at steady speed into displayedText
    // Layer 3: Flush → pushes displayedText to React state every 150ms for markdown rendering
    let receivedText = '';
    let displayedText = '';
    let streamDone = false;
    let doneConvId: string | null = null;

    // Layer 2: Typewriter loop — steady character consumption
    let lastTime = performance.now();
    const CHARS_PER_MS = 0.4; // ~400 chars/sec — fast but smooth
    let rafId = 0;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (displayedText.length < receivedText.length) {
        const charsToAdd = Math.max(1, Math.floor(delta * CHARS_PER_MS));
        const end = Math.min(displayedText.length + charsToAdd, receivedText.length);
        displayedText = receivedText.slice(0, end);
      }

      if (!streamDone || displayedText.length < receivedText.length) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    // Layer 3: Flush to React state at throttled interval
    let lastFlushedLen = 0;
    const flushTimer = setInterval(() => {
      if (displayedText.length > lastFlushedLen) {
        lastFlushedLen = displayedText.length;
        const snapshot = displayedText;
        setChatMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: snapshot } : m)),
        );
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      // Check if completely done
      if (streamDone && displayedText.length >= receivedText.length && displayedText.length === lastFlushedLen) {
        clearInterval(flushTimer);
        cancelAnimationFrame(rafId);
        setChatMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: receivedText } : m)),
        );
        setStreaming(false);
        setSending(false);
        setThinkingStatus(null);
        if (doneConvId && !conversationId) {
          setConversationId(doneConvId);
          if (!initialConversationId) {
            router.replace(`/assistente/${doneConvId}`);
          }
        }
        // Notify sidebar to refetch conversations (for updated title)
        window.dispatchEvent(new CustomEvent('tutelo:conversations-updated'));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);

    // Layer 1: SSE reader — just accumulates text
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: content.trim(),
          user_id: profile?.id || null,
        }),
      });

      if (!res.ok) throw new Error('Errore nella risposta');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let sseBuffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n\n');
          sseBuffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'text') {
                receivedText += data.content;
                if (receivedText.length > 0) setThinkingStatus(null);
              } else if (data.type === 'tool_call') {
                setThinkingStatus(describeTool(data.tool_name || ''));
              } else if (data.type === 'tool_result') {
                // Keep the status visible briefly, will be cleared by next tool_call or text
              } else if (data.type === 'attachment') {
                setChatMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId
                      ? { ...m, attachments: [...(m.attachments || []), data.attachment] }
                      : m,
                  ),
                );
              } else if (data.type === 'done' && data.conversation_id) {
                doneConvId = data.conversation_id;
              } else if (data.type === 'error') {
                receivedText += `\n\nErrore: ${data.content}`;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch {
      receivedText = receivedText || 'Mi dispiace, si è verificato un errore. Riprova.';
    } finally {
      streamDone = true;
    }
  }, [sending, conversationId, profile, initialConversationId, router]);

  const onSend = useCallback(() => {
    sendMessage(message);
  }, [message, sendMessage]);

  const onKeydown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const onQuickAction = useCallback((action: QuickAction) => {
    setMessage(action.label + ': ');
  }, []);

  const onExample = useCallback((example: ExampleCard) => {
    sendMessage(example.prompt);
  }, [sendMessage]);

  const hasMessages = chatMessages.length > 0 || loading;

  const chatTitle = useMemo(() => {
    const first = chatMessages.find((m) => m.role === 'user');
    if (!first) return 'Nuova chat';
    return first.content.length > 50 ? first.content.slice(0, 50) + '...' : first.content;
  }, [chatMessages]);

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: 'Assistant', href: '/assistente' }];
    if (hasMessages) items.push({ label: chatTitle });
    return items;
  }, [hasMessages, chatTitle]);

  return (
    <>
      <Topbar breadcrumbs={breadcrumbs} />
      <div className={`${styles.assistantPage} ${hasMessages ? styles.chatMode : ''}`}>
        <div className={styles.assistantContainer}>
          {!hasMessages && (
            <div className={styles.greetingSection}>
              <h1 className={styles.greetingTitle}>
                {greeting}, {userName}
              </h1>
              <p className={styles.greetingSubtitle}>
                Il tuo assistente assicurativo è pronto. Come posso aiutarti oggi?
              </p>
            </div>
          )}

          {hasMessages && (
            <div className={styles.chatArea}>
              {chatMessages.map((msg, idx) => {
                const isActiveStream = streaming && msg.role === 'assistant' && idx === chatMessages.length - 1;
                return (
                  <div key={msg.id} className={`${styles.chatBubble} ${styles[msg.role]}`}>
                    {msg.role === 'user' ? (
                      <div className={`${styles.chatBubbleContent} ${styles.chatBubbleContentUser}`}>
                        {msg.content}
                      </div>
                    ) : (
                      <div className={styles.chatBubbleContent}>
                        {msg.content ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : null}
                        {isActiveStream && thinkingStatus && (
                          <div className={styles.thinkingStatus}>
                            <span className={styles.thinkingDot} />
                            <span className={styles.thinkingText}>{thinkingStatus}</span>
                          </div>
                        )}
                        {isActiveStream && msg.content && !thinkingStatus && (
                          <span className={styles.streamCursor} />
                        )}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={styles.attachmentsList}>
                            {msg.attachments.map((att, i) => (
                              <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.filename}
                                className={styles.attachmentItem}
                              >
                                <div className={styles.attachmentIcon}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                </div>
                                <div className={styles.attachmentInfo}>
                                  <div className={styles.attachmentName}>{att.filename}</div>
                                  <div className={styles.attachmentMeta}>PDF · Clicca per scaricare</div>
                                </div>
                                <div className={styles.attachmentDownload}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                  </svg>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className={`${styles.inputSection} ${hasMessages ? styles.inputSectionChat : ''}`}>
            <div className={styles.inputBox}>
              <textarea
                className={styles.chatInput}
                placeholder="Come posso aiutarti oggi?"
                value={message}
                onChange={onInput}
                onKeyDown={onKeydown}
                rows={1}
              />
              <div className={styles.inputActions}>
                <div className={styles.inputActionsLeft}>
                  <button className={styles.actionBtn}>
                    <HugeiconsIcon icon={Attachment01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>Allega</span>
                  </button>
                  <button className={styles.actionBtn}>
                    <HugeiconsIcon icon={Globe02Icon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>Ricerca Web</span>
                  </button>
                </div>
                <button
                  className={`${styles.sendBtn} ${message.trim().length > 0 ? styles.active : ''}`}
                  onClick={onSend}
                  disabled={sending}
                >
                  <HugeiconsIcon icon={ArrowUp02Icon} size={18} color="currentColor" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {!hasMessages && (
            <>
              <div className={styles.quickActions}>
                {quickActions.map((action) => (
                  <button key={action.label} className={styles.chip} onClick={() => onQuickAction(action)}>
                    <HugeiconsIcon icon={action.icon} size={15} color="currentColor" strokeWidth={1.5} />
                    {action.label}
                  </button>
                ))}
              </div>

              <div className={styles.examples}>
                {examples.map((example) => (
                  <button
                    key={example.title}
                    className={styles.exampleCard}
                    onClick={() => onExample(example)}
                  >
                    <div className={styles.exampleIcon} style={{ background: example.iconBg, color: example.iconColor }}>
                      <HugeiconsIcon icon={example.icon} size={22} color="currentColor" strokeWidth={1.5} />
                    </div>
                    <div className={styles.exampleContent}>
                      <div className={styles.exampleTitle}>{example.title}</div>
                      <div className={styles.exampleDesc}>{example.description}</div>
                      <div className={styles.examplePrompt}>
                        <span className={styles.examplePromptLabel}>Prova:</span> &ldquo;{example.prompt}&rdquo;
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
