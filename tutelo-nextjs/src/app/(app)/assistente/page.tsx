'use client';

import { useState, useMemo, useCallback, KeyboardEvent, ChangeEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Attachment01Icon,
  Globe02Icon,
  ArrowUp02Icon,
  Calculator01Icon,
  Car01Icon,
  FileSearchIcon,
  FolderSearchIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { useAuth } from '@/contexts/AuthContext';
import styles from './assistant.module.scss';

interface QuickAction {
  label: string;
  icon: typeof Calculator01Icon;
}

interface SuggestionCard {
  iconType: 'document' | 'note';
  title: string;
  description: string;
}

const quickActions: QuickAction[] = [
  { label: 'Preventivi', icon: Calculator01Icon },
  { label: 'Sinistri', icon: Car01Icon },
  { label: 'Analisi Pratiche', icon: FileSearchIcon },
  { label: 'Ricerca Documenti', icon: FolderSearchIcon },
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

export default function AssistantPage() {
  const { profile } = useAuth();
  const [message, setMessage] = useState('');

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

  const onExample = useCallback((example: ExampleCard) => {
    setMessage(example.prompt);
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
              >
                <HugeiconsIcon icon={ArrowUp02Icon} size={18} color="currentColor" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <button key={action.label} className={styles.chip} onClick={() => onQuickAction(action)}>
              <HugeiconsIcon icon={action.icon} size={15} color="currentColor" strokeWidth={1.5} />
              {action.label}
            </button>
          ))}
        </div>

        <div className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              className={styles.suggestionCard}
              onClick={() => onSuggestion(suggestion)}
            >
              <div className={styles.suggestionIcon}>
                <HugeiconsIcon
                  icon={suggestion.iconType === 'document' ? Shield01Icon : FileSearchIcon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </div>
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionTitle}>{suggestion.title}</div>
                <div className={styles.suggestionDesc}>{suggestion.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className={styles.examplesSection}>
          <div className={styles.examplesSectionLabel}>Esempi</div>
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
        </div>
      </div>
    </div>
  );
}
