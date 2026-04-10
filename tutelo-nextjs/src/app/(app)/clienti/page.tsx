'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import Topbar from '@/components/topbar/Topbar';
import styles from './clienti.module.scss';

interface Persona {
  id: string;
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  codice_fiscale: string | null;
  status: 'lead' | 'prospect' | 'cliente' | 'ex_cliente';
  fonte: string;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  cliente: 'Cliente',
  ex_cliente: 'Ex Cliente',
};

const STATUS_CLASSES: Record<string, string> = {
  lead: 'statusLead',
  prospect: 'statusProspect',
  cliente: 'statusCliente',
  ex_cliente: 'statusExCliente',
};

function initials(p: Persona): string {
  const n = p.nome?.charAt(0) || '';
  const c = p.cognome?.charAt(0) || '';
  return (n + c).toUpperCase() || '?';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ClientiPage() {
  const router = useRouter();
  const [persone, setPersone] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/persone')
      .then((r) => r.json())
      .then((data) => {
        if (data.persone) setPersone(data.persone);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return persone;
    const q = search.toLowerCase();
    return persone.filter(
      (p) =>
        p.nome?.toLowerCase().includes(q) ||
        p.cognome?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.telefono?.toLowerCase().includes(q),
    );
  }, [persone, search]);

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Viste', href: '/clienti' }, { label: 'Clienti' }]} />
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>
                Clienti
                {!loading && <span className={styles.countBadge}>{filtered.length}</span>}
              </h1>
              <p className={styles.subtitle}>
                Anagrafica completa delle persone gestite dal sistema
              </p>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <HugeiconsIcon icon={Search01Icon} size={15} color="currentColor" strokeWidth={1.5} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Cerca per nome, email, telefono..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Nome</th>
                    <th className={styles.th}>Email</th>
                    <th className={styles.th}>Telefono</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Fonte</th>
                    <th className={styles.th}>Creato</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className={styles.loader}>
                        Caricamento...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.empty}>
                        {search
                          ? 'Nessun risultato per la ricerca'
                          : 'Nessuna persona registrata nel sistema'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr
                        key={p.id}
                        className={styles.tr}
                        onClick={() => router.push(`/clienti/${p.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className={styles.td}>
                          <div className={styles.nameCell}>
                            <div className={styles.avatar}>{initials(p)}</div>
                            <div className={styles.nameText}>
                              <div className={styles.fullName}>
                                {p.nome} {p.cognome}
                              </div>
                              {p.codice_fiscale && (
                                <div className={styles.cf}>{p.codice_fiscale}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}>
                          {p.email || <span className={styles.muted}>—</span>}
                        </td>
                        <td className={styles.td}>
                          {p.telefono || <span className={styles.muted}>—</span>}
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${styles[STATUS_CLASSES[p.status]]}`}>
                            <span className={styles.statusDot} />
                            {STATUS_LABELS[p.status] || p.status}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={styles.fonteBadge}>{p.fonte}</span>
                        </td>
                        <td className={`${styles.td} ${styles.dateCell}`}>
                          {formatDate(p.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
