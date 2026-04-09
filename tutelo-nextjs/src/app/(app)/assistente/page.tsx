'use client';

import { useState, useMemo, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './assistant.module.scss';

// Inline SVG icons
function AttachmentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5,12 12,5 19,12" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h8l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0" />
    </svg>
  );
}

function FileSearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <circle cx="11.5" cy="14.5" r="2.5" />
      <line x1="13.3" y1="16.3" x2="15" y2="18" />
    </svg>
  );
}

function SearchDocIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <path d="M8 8h6M8 11h4" />
    </svg>
  );
}

interface QuickAction {
  label: string;
  icon: () => React.ReactNode;
}

interface SuggestionCard {
  iconType: 'document' | 'note';
  title: string;
  description: string;
}

const quickActions: QuickAction[] = [
  { label: 'Preventivi', icon: CalculatorIcon },
  { label: 'Sinistri', icon: CarIcon },
  { label: 'Analisi Pratiche', icon: FileSearchIcon },
  { label: 'Ricerca Documenti', icon: SearchDocIcon },
];

const suggestions: SuggestionCard[] = [
  {
    iconType: 'document',
    title: 'Analizza Polizza',
    description: 'Carica un documento di polizza per ottenere un riepilogo delle coperture, massimali e scadenze.',
  },
  {
    iconType: 'note',
    title: 'Gestisci Sinistro',
    description: 'Avvia la gestione di un nuovo sinistro con raccolta automatica dei dati e suggerimenti operativi.',
  },
];

export default function AssistantPage() {
  const { profile } = useAuth();
  const [message, setMessage] = useState('');

  const userName = useMemo(() => {
    const name = profile?.full_name;
    if (name) return name.split(' ')[0];
    return 'Marco';
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

  const onSend = useCallback(() => {
    if (!message.trim()) return;
    setMessage('');
  }, [message]);

  const onKeydown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const onQuickAction = useCallback((action: QuickAction) => {
    setMessage(action.label + ': ');
  }, []);

  const onSuggestion = useCallback((suggestion: SuggestionCard) => {
    setMessage(suggestion.title);
  }, []);

  return (
    <div className={styles.assistantPage}>
      <div className={styles.assistantContainer}>
        <div className={styles.greetingSection}>
          <h1 className={styles.greetingTitle}>
            {greeting}, {userName}
          </h1>
          <p className={styles.greetingSubtitle}>
            Il tuo assistente assicurativo è pronto. Come posso aiutarti oggi?
          </p>
        </div>

        <div className={styles.inputSection}>
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
                  <AttachmentIcon />
                  <span>Allega</span>
                </button>
                <button className={styles.actionBtn}>
                  <GlobeIcon />
                  <span>Ricerca Web</span>
                </button>
              </div>
              <button
                className={`${styles.sendBtn} ${message.trim().length > 0 ? styles.active : ''}`}
                onClick={onSend}
              >
                <ArrowUpIcon />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.quickActions}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} className={styles.chip} onClick={() => onQuickAction(action)}>
                <Icon />
                {action.label}
              </button>
            );
          })}
        </div>

        <div className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              className={styles.suggestionCard}
              onClick={() => onSuggestion(suggestion)}
            >
              <div className={styles.suggestionIcon}>
                {suggestion.iconType === 'document' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
                    <polyline points="9,12 11,14 15,10" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <polyline points="14,2 14,8 20,8" />
                    <path d="M12 18v-6" />
                    <path d="M12 9h.01" />
                  </svg>
                )}
              </div>
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionTitle}>{suggestion.title}</div>
                <div className={styles.suggestionDesc}>{suggestion.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
