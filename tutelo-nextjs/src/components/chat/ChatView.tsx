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

// --- Bot replies ---

const BOT_REPLIES_BY_TOPIC: Record<string, string[]> = {
  preventiv: [
    'Ho trovato 3 compagnie con tariffe competitive per questo profilo. La migliore è Generali con un premio annuo di €420. Vuoi che prepari il preventivo dettagliato?',
    'Sto elaborando il preventivo. In base ai dati forniti, la classe di merito e il tipo di veicolo, il range stimato è tra €380 e €520 annui. Procedo con il confronto tra compagnie?',
    'Preventivo generato! RC Auto base: €395/anno con Unipol. Posso aggiungere coperture accessorie come furto/incendio o kasko?',
  ],
  sinistro: [
    'Ho registrato l\'apertura del sinistro. Ti servono i moduli CID/CAI da compilare? Posso anche verificare la copertura della polizza coinvolta.',
    'Per procedere con la gestione del sinistro ho bisogno di: data dell\'evento, luogo, descrizione dinamica e dati della controparte. Vuoi che ti guidi passo passo?',
    'Sinistro registrato con numero pratica #SIN-2024-0847. Ho già avviato la verifica delle coperture attive. Ti aggiorno appena ho riscontro dalla compagnia.',
  ],
  polizza: [
    'Ho analizzato il documento. La polizza copre RC con massimale €6M, include tutela legale e assistenza stradale. Scadenza: 15/09/2025. Vuoi un riepilogo completo?',
    'Dalla polizza emergono le seguenti coperture: RC obbligatoria, furto/incendio (franchigia €500), cristalli. Manca la copertura kasko. Vuoi che verifichi alternative?',
  ],
  document: [
    'Ho trovato 12 documenti corrispondenti ai criteri di ricerca. I più recenti sono: polizza auto n. 4521, quietanza di rinnovo e certificato di rischio. Quale vuoi aprire?',
    'Ricerca completata. Trovati 5 documenti per il cliente richiesto: 2 polizze attive, 1 sinistro chiuso, 2 quietanze. Vuoi il dettaglio di uno specifico?',
  ],
  analisi: [
    'Ho analizzato le pratiche in corso. Ci sono 4 pratiche con scadenza entro 30 giorni e 2 sinistri in attesa di documentazione. Vuoi che ti prepari un riepilogo prioritario?',
    'L\'analisi delle pratiche mostra: 15 polizze in scadenza questo mese, 3 sinistri aperti, 7 rinnovi automatici confermati. Posso generare il report dettagliato.',
  ],
};

const BOT_REPLIES_GENERIC = [
  'Certo, posso aiutarti con questo. Dammi un momento per verificare le informazioni nel sistema.',
  'Ho preso in carico la tua richiesta. Sto consultando l\'archivio per fornirti le informazioni più aggiornate.',
  'Ottima domanda! Lascami controllare i dati disponibili e ti rispondo subito con tutti i dettagli.',
  'Sto elaborando la tua richiesta. Nel frattempo, hai bisogno di altre informazioni su polizze o pratiche in corso?',
  'Ricevuto! Ho verificato nel sistema e posso procedere. Vuoi che ti invii anche un riepilogo via email?',
];

function pickBotReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const [keyword, replies] of Object.entries(BOT_REPLIES_BY_TOPIC)) {
    if (lower.includes(keyword)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return BOT_REPLIES_GENERIC[Math.floor(Math.random() * BOT_REPLIES_GENERIC.length)];
}

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

    const tempMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);
    setMessage('');

    let activeConvId = conversationId;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: content.trim(),
          role: 'user',
          user_id: profile?.id || null,
        }),
      });
      const data = await res.json();
      if (data.conversation_id) {
        activeConvId = data.conversation_id;
        setConversationId(data.conversation_id);
        if (!initialConversationId) {
          router.replace(`/assistente/${data.conversation_id}`);
        }
      }
      if (data.message) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? data.message : m)),
        );
      }
    } catch {
      // Keep the optimistic message
    }

    setTimeout(async () => {
      const botReply = pickBotReply(content.trim());
      const tempBot: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: botReply,
        created_at: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, tempBot]);

      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: activeConvId,
            content: botReply,
            role: 'assistant',
          }),
        });
        const data = await res.json();
        if (data.message) {
          setChatMessages((prev) =>
            prev.map((m) => (m.id === tempBot.id ? data.message : m)),
          );
        }
      } catch {
        // Keep optimistic bot message
      } finally {
        setSending(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    }, 800 + Math.random() * 700);
  }, [sending, conversationId, profile]);

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
                  <div className={styles.chatBubbleContent}>{msg.content}</div>
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
