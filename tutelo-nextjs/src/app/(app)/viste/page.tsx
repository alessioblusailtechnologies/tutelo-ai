'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  ChartBarLineIcon,
  PieChartIcon,
  AnalyticsUpIcon,
  Delete02Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import Topbar from '@/components/topbar/Topbar';
import VisualizationRenderer from '@/components/viste/VisualizationRenderer';
import type { ViewDefinition, ViewResult } from '@/lib/viste/types';
import styles from './viste.module.scss';

interface Vista {
  id: string;
  name: string;
  description: string | null;
  prompt: string | null;
  definition: ViewDefinition;
  created_at: string;
  updated_at: string;
}

const EXAMPLES = [
  'Mostrami il numero di preventivi per cliente',
  'Quanti clienti attivi abbiamo',
  'Distribuzione degli stati dei preventivi',
  'Preventivi per tipologia',
  'Lista di tutti i lead',
];

const VIZ_ICON: Record<string, typeof ChartBarLineIcon> = {
  table: DashboardSquare01Icon,
  bar_chart: ChartBarLineIcon,
  pie_chart: PieChartIcon,
  kpi: AnalyticsUpIcon,
};

const VIZ_LABEL: Record<string, string> = {
  table: 'Tabella',
  bar_chart: 'Grafico',
  pie_chart: 'Torta',
  kpi: 'KPI',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function VistePage() {
  const router = useRouter();
  const [viste, setViste] = useState<Vista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchViste = useCallback(() => {
    setLoading(true);
    fetch('/api/viste')
      .then((r) => r.json())
      .then((data) => {
        if (data.viste) setViste(data.viste);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchViste();
  }, [fetchViste]);

  const deleteVista = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Eliminare questa vista?')) return;
    setViste((prev) => prev.filter((v) => v.id !== id));
    await fetch(`/api/viste/${id}`, { method: 'DELETE' });
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Viste personalizzate' }]} />
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>Viste personalizzate</h1>
              <p className={styles.subtitle}>
                Crea dashboard personalizzati descrivendo in linguaggio naturale cosa vuoi vedere.
                L&apos;AI genera automaticamente il grafico o la tabella più adatta.
              </p>
            </div>
            <button className={styles.primaryBtn} onClick={() => setModalOpen(true)}>
              <HugeiconsIcon icon={Add01Icon} size={15} color="currentColor" strokeWidth={2} />
              Nuova vista
            </button>
          </div>

          {loading ? (
            <div className={styles.loader}>Caricamento viste...</div>
          ) : viste.length === 0 ? (
            <div className={styles.vistePlaceholder}>
              <div className={styles.placeholderIcon}>
                <HugeiconsIcon icon={DashboardSquare01Icon} size={26} color="currentColor" strokeWidth={1.5} />
              </div>
              <div className={styles.placeholderTitle}>Nessuna vista salvata</div>
              <div className={styles.placeholderText}>
                Crea la tua prima vista personalizzata descrivendo cosa vuoi vedere
              </div>
              <button className={styles.primaryBtn} onClick={() => setModalOpen(true)}>
                <HugeiconsIcon icon={Add01Icon} size={15} color="currentColor" strokeWidth={2} />
                Crea prima vista
              </button>
            </div>
          ) : (
            <div className={styles.vistaGrid}>
              {viste.map((v) => {
                const vizType = v.definition?.visualization?.type || 'table';
                const Icon = VIZ_ICON[vizType] || DashboardSquare01Icon;
                return (
                  <div
                    key={v.id}
                    className={styles.vistaCard}
                    onClick={() => router.push(`/viste/${v.id}`)}
                  >
                    <div className={styles.vistaCardHeader}>
                      <div className={styles.vistaCardIcon}>
                        <HugeiconsIcon icon={Icon} size={18} color="currentColor" strokeWidth={1.5} />
                      </div>
                      <div className={styles.vistaCardTitleWrap}>
                        <div className={styles.vistaCardName}>{v.name}</div>
                        <span className={styles.vistaCardType}>{VIZ_LABEL[vizType] || vizType}</span>
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => deleteVista(v.id, e)}
                        title="Elimina"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={14} color="currentColor" strokeWidth={1.5} />
                      </button>
                    </div>
                    {v.prompt && <div className={styles.vistaCardPrompt}>{v.prompt}</div>}
                    <div className={styles.vistaCardFooter}>
                      Creata il {formatDate(v.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <NewVistaModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchViste();
          }}
        />
      )}
    </>
  );
}

// ============================================
// New Vista Modal
// ============================================
function NewVistaModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [definition, setDefinition] = useState<ViewDefinition | null>(null);
  const [result, setResult] = useState<ViewResult | null>(null);

  const onGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setDefinition(null);
    setResult(null);
    try {
      const res = await fetch('/api/viste/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Errore durante la generazione');
        return;
      }
      setDefinition(data.definition);
      setResult(data.result);
      // Auto-fill name from visualization title
      if (!name && data.definition?.visualization?.title) {
        setName(data.definition.visualization.title);
      }
    } catch (err: any) {
      setError(err?.message || 'Errore di rete');
    } finally {
      setGenerating(false);
    }
  };

  const onSave = async () => {
    if (!name.trim() || !definition) return;
    setSaving(true);
    try {
      const res = await fetch('/api/viste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          prompt: prompt.trim(),
          definition,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Errore salvataggio');
        return;
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message || 'Errore di rete');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nuova vista personalizzata</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} size={18} color="currentColor" strokeWidth={1.5} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div>
            <div className={styles.inputLabel}>Descrivi cosa vuoi vedere</div>
            <textarea
              className={styles.promptInput}
              placeholder="Es. Mostrami il numero di preventivi per cliente"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
            />
          </div>

          <div>
            <div className={styles.inputLabel}>Esempi</div>
            <div className={styles.examples}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  className={styles.exampleChip}
                  onClick={() => setPrompt(ex)}
                  type="button"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.modalError}>{error}</div>}

          {definition && result && (
            <div>
              <div className={styles.inputLabel}>Nome della vista</div>
              <input
                type="text"
                className={styles.nameInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Inserisci un nome descrittivo"
              />

              <div style={{ marginTop: 16 }}>
                <div className={styles.inputLabel}>Anteprima</div>
                <div className={styles.previewSection}>
                  <VisualizationRenderer definition={definition} result={result} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Annulla
          </button>
          {!definition ? (
            <button
              className={styles.btnPrimary}
              onClick={onGenerate}
              disabled={!prompt.trim() || generating}
            >
              {generating ? (
                <>
                  <span className={styles.spinner} />
                  Generazione...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} size={14} color="currentColor" strokeWidth={2} />
                  Genera con AI
                </>
              )}
            </button>
          ) : (
            <button
              className={styles.btnPrimary}
              onClick={onSave}
              disabled={!name.trim() || saving}
            >
              {saving ? 'Salvataggio...' : 'Salva vista'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
