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
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
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

    // Add user message optimistically
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setMessage('');

    // Add empty assistant message for streaming
    const botId = crypto.randomUUID();
    setChatMessages((prev) => [
      ...prev,
      { id: botId, role: 'assistant', content: '', created_at: new Date().toISOString() },
    ]);

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
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'text') {
                setChatMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId ? { ...m, content: m.content + data.content } : m,
                  ),
                );
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              } else if (data.type === 'done' && data.conversation_id) {
                if (!conversationId) {
                  setConversationId(data.conversation_id);
                  if (!initialConversationId) {
                    router.replace(`/assistente/${data.conversation_id}`);
                  }
                }
              } else if (data.type === 'error') {
                setChatMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId ? { ...m, content: `⚠ ${data.content}` } : m,
                  ),
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, content: 'Mi dispiace, si è verificato un errore. Riprova.' }
            : m,
        ),
      );
    } finally {
      setSending(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
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
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`${styles.chatBubble} ${styles[msg.role]}`}>
                  <div className={styles.chatBubbleContent}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
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
