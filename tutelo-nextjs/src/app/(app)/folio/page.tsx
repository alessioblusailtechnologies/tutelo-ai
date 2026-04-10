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
                {files.slice(0, 3).map((f) => (
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

          {/* All documents list */}
          {!loading && files.length > 0 && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <HugeiconsIcon icon={File02Icon} size={16} color="currentColor" strokeWidth={1.5} />
                  Tutti i documenti
                  <span className={styles.countBadge}>{files.length}</span>
                </h2>
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Nome</th>
                        <th className={styles.th}>Tipo</th>
                        <th className={styles.th}>Dimensione</th>
                        <th className={styles.th}>Caricato</th>
                        <th className={styles.th} style={{ width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((f) => (
                        <tr
                          key={f.path}
                          className={styles.tr}
                          onClick={() => window.open(f.url, '_blank', 'noopener,noreferrer')}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className={styles.td}>
                            <div className={styles.rowNameCell}>
                              <div className={styles.rowFileIcon}>
                                <HugeiconsIcon icon={File02Icon} size={16} color="currentColor" strokeWidth={1.5} />
                              </div>
                              <span className={styles.rowFileName} title={f.name}>
                                {prettifyFilename(f.name)}
                              </span>
                            </div>
                          </td>
                          <td className={styles.td}>
                            <span className={styles.typeBadge}>PDF</span>
                          </td>
                          <td className={styles.td}>{formatSize(f.size)}</td>
                          <td className={styles.td}>{formatDate(f.created_at)}</td>
                          <td className={styles.td} style={{ textAlign: 'right' }}>
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={styles.downloadLink}
                              title="Apri"
                            >
                              <HugeiconsIcon icon={ArrowUp02Icon} size={14} color="currentColor" strokeWidth={2} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
