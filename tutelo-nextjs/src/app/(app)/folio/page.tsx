'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  SparklesIcon,
  ArrowUp02Icon,
  FolderLibraryIcon,
  File02Icon,
} from '@hugeicons/core-free-icons';
import Topbar from '@/components/topbar/Topbar';
import styles from './folio.module.scss';

interface FolioFile {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
}

function formatSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Adesso';
  if (diffMin < 60) return `${diffMin}m fa`;
  if (diffHrs < 24) return `${diffHrs}h fa`;
  if (diffDays < 7) return `${diffDays}g fa`;
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function prettifyFilename(filename: string): string {
  // Remove timestamp suffix and .pdf extension, replace dashes with spaces
  return filename
    .replace(/-\d{13}\.pdf$/, '')
    .replace(/\.pdf$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FolioPage() {
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<FolioFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/folio')
      .then((r) => r.json())
      .then((data) => {
        if (data.files) setFiles(data.files);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Folio' }]} />
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Folio</h1>
            <p className={styles.subtitle}>
              Gestione documentale intelligente. Cerca semanticamente nei tuoi documenti con l&apos;AI.
            </p>
          </div>

          {/* AI Search input */}
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cerca nei tuoi documenti... es. polizze in scadenza, sinistri auto, condizioni RC..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className={styles.searchActions}>
                <span className={styles.aiBadge}>
                  <HugeiconsIcon icon={SparklesIcon} size={11} color="currentColor" strokeWidth={2} />
                  Ricerca semantica AI
                </span>
                <button
                  className={styles.searchSendBtn}
                  disabled
                  title="Ricerca semantica in arrivo"
                >
                  <HugeiconsIcon icon={ArrowUp02Icon} size={18} color="currentColor" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className={styles.searchHint}>
              La ricerca semantica sarà disponibile a breve
            </div>
          </div>

          {/* Recent uploads */}
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <HugeiconsIcon icon={FolderLibraryIcon} size={16} color="currentColor" strokeWidth={1.5} />
                Caricamenti recenti
                {!loading && <span className={styles.countBadge}>{files.length}</span>}
              </h2>
            </div>

            {loading ? (
              <div className={styles.loader}>Caricamento documenti...</div>
            ) : files.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <HugeiconsIcon icon={FolderLibraryIcon} size={26} color="currentColor" strokeWidth={1.5} />
                </div>
                Nessun documento ancora caricato
              </div>
            ) : (
              <div className={styles.filesGrid}>
                {files.map((f) => (
                  <a
                    key={f.path}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileCard}
                  >
                    <div className={styles.fileIcon}>
                      <HugeiconsIcon icon={File02Icon} size={22} color="currentColor" strokeWidth={1.5} />
                    </div>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName} title={f.name}>
                        {prettifyFilename(f.name)}
                      </div>
                      <div className={styles.fileMeta}>
                        <span>{formatDate(f.created_at)}</span>
                        <span className={styles.metaSep}>·</span>
                        <span>{formatSize(f.size)}</span>
                        <span className={styles.metaSep}>·</span>
                        <span>PDF</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
