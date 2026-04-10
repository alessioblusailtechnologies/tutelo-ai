'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  SmartPhone01Icon,
  Calculator01Icon,
  Shield02Icon,
  ConstructionIcon,
} from '@hugeicons/core-free-icons';
import Topbar, { type BreadcrumbItem } from '@/components/topbar/Topbar';
import styles from './cliente-detail.module.scss';

interface Persona {
  id: string;
  nome: string;
  cognome: string;
  email: string | null;
  telefono: string | null;
  codice_fiscale: string | null;
  status: 'lead' | 'prospect' | 'cliente' | 'ex_cliente';
  fonte: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

interface Preventivo {
  id: string;
  contatto_id: string;
  tipo: string;
  stato: string;
  parametri: Record<string, unknown>;
  risultati: Array<{
    compagnia: string;
    premio_annuo: number;
    premio_semestrale?: number;
    franchigia?: number;
    coperture?: string[];
    rating?: number;
  }>;
  note: string | null;
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

const TIPO_LABELS: Record<string, string> = {
  rc_auto: 'RC Auto',
  casa: 'Casa',
  vita: 'Vita',
  infortuni: 'Infortuni',
  rc_professionale: 'RC Professionale',
  altro: 'Altro',
};

const STATO_LABELS: Record<string, string> = {
  bozza: 'Bozza',
  calcolato: 'Calcolato',
  inviato: 'Inviato',
  accettato: 'Accettato',
  rifiutato: 'Rifiutato',
};

const STATO_CLASSES: Record<string, string> = {
  bozza: 'statoBozza',
  calcolato: 'statoCalcolato',
  inviato: 'statoInviato',
  accettato: 'statoAccettato',
  rifiutato: 'statoRifiutato',
};

function initials(p: Persona | null): string {
  if (!p) return '?';
  const n = p.nome?.charAt(0) || '';
  const c = p.cognome?.charAt(0) || '';
  return (n + c).toUpperCase() || '?';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(n: number): string {
  return `€${n.toLocaleString('it-IT')}`;
}

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preventivi' | 'polizze'>('preventivi');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/persone/${id}`).then((r) => r.json()),
      fetch(`/api/persone/${id}/preventivi`).then((r) => r.json()),
    ])
      .then(([personaData, preventiviData]) => {
        if (personaData.persona) setPersona(personaData.persona);
        if (preventiviData.preventivi) setPreventivi(preventiviData.preventivi);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Viste', href: '/clienti' },
    { label: 'Clienti', href: '/clienti' },
    { label: persona ? `${persona.nome} ${persona.cognome}` : '...' },
  ];

  if (!loading && !persona) {
    return (
      <>
        <Topbar breadcrumbs={breadcrumbs} />
        <div className={styles.page}>
          <div className={styles.notFound}>
            <p>Persona non trovata.</p>
            <Link href="/clienti">← Torna alla lista clienti</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar breadcrumbs={breadcrumbs} />
      <div className={styles.page}>
        <div className={styles.content}>
          {/* Anagrafica header */}
          {persona && (
            <div className={styles.headerCard}>
              <div className={styles.bigAvatar}>{initials(persona)}</div>
              <div className={styles.headerMain}>
                <div className={styles.headerTop}>
                  <h1 className={styles.fullName}>
                    {persona.nome} {persona.cognome}
                  </h1>
                  <span className={`${styles.statusBadge} ${styles[STATUS_CLASSES[persona.status]]}`}>
                    <span className={styles.statusDot} />
                    {STATUS_LABELS[persona.status] || persona.status}
                  </span>
                </div>
                {persona.codice_fiscale && (
                  <div className={styles.cf}>CF: {persona.codice_fiscale}</div>
                )}
                <div className={styles.contactRow}>
                  {persona.email && (
                    <div className={styles.contactItem}>
                      <HugeiconsIcon icon={Mail01Icon} size={15} color="currentColor" strokeWidth={1.5} />
                      <a href={`mailto:${persona.email}`}>{persona.email}</a>
                    </div>
                  )}
                  {persona.telefono && (
                    <div className={styles.contactItem}>
                      <HugeiconsIcon icon={SmartPhone01Icon} size={15} color="currentColor" strokeWidth={1.5} />
                      <a href={`tel:${persona.telefono}`}>{persona.telefono}</a>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.headerMeta}>
                <span className={styles.fonteBadge}>{persona.fonte}</span>
                <div>Creato il {formatDate(persona.created_at)}</div>
                <div>Aggiornato il {formatDate(persona.updated_at)}</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabsCard}>
            <div className={styles.tabsBar}>
              <button
                className={`${styles.tab} ${activeTab === 'preventivi' ? styles.active : ''}`}
                onClick={() => setActiveTab('preventivi')}
              >
                <HugeiconsIcon icon={Calculator01Icon} size={15} color="currentColor" strokeWidth={1.5} />
                Preventivi
                {!loading && <span className={styles.tabBadge}>{preventivi.length}</span>}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'polizze' ? styles.active : ''}`}
                onClick={() => setActiveTab('polizze')}
              >
                <HugeiconsIcon icon={Shield02Icon} size={15} color="currentColor" strokeWidth={1.5} />
                Polizze
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'preventivi' && (
                <>
                  {loading ? (
                    <div className={styles.loader}>Caricamento preventivi...</div>
                  ) : preventivi.length === 0 ? (
                    <div className={styles.empty}>Nessun preventivo per questo cliente</div>
                  ) : (
                    <div className={styles.preventiviList}>
                      {preventivi.map((p) => {
                        const risultati = Array.isArray(p.risultati) ? p.risultati : [];
                        const sorted = [...risultati].sort(
                          (a, b) => (a.premio_annuo || 0) - (b.premio_annuo || 0),
                        );
                        const best = sorted[0];
                        return (
                          <div key={p.id} className={styles.preventivoCard}>
                            <div className={styles.preventivoIcon}>
                              <HugeiconsIcon icon={Calculator01Icon} size={22} color="currentColor" strokeWidth={1.5} />
                            </div>
                            <div className={styles.preventivoMain}>
                              <div className={styles.preventivoHeader}>
                                <span className={styles.preventivoTipo}>
                                  {TIPO_LABELS[p.tipo] || p.tipo}
                                </span>
                                <span className={`${styles.preventivoStato} ${styles[STATO_CLASSES[p.stato]]}`}>
                                  {STATO_LABELS[p.stato] || p.stato}
                                </span>
                              </div>
                              <div className={styles.preventivoMeta}>
                                <span>Creato il {formatDate(p.created_at)}</span>
                                {risultati.length > 0 && (
                                  <span>{risultati.length} compagnie a confronto</span>
                                )}
                                {Boolean(p.parametri?.marca && p.parametri?.modello) && (
                                  <span>
                                    {String(p.parametri.marca)} {String(p.parametri.modello)}
                                    {p.parametri.anno ? ` (${String(p.parametri.anno)})` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            {best && (
                              <div className={styles.preventivoStats}>
                                <div className={styles.statBlock}>
                                  <div className={styles.statLabel}>Migliore</div>
                                  <div className={styles.statValue}>
                                    {formatCurrency(best.premio_annuo)}
                                  </div>
                                  <div className={styles.statSub}>{best.compagnia} / anno</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'polizze' && (
                <div className={styles.wipBlock}>
                  <div className={styles.wipIcon}>
                    <HugeiconsIcon icon={ConstructionIcon} size={26} color="currentColor" strokeWidth={1.5} />
                  </div>
                  <div className={styles.wipTitle}>Work in progress</div>
                  <div className={styles.wipSub}>
                    La gestione delle polizze sarà disponibile a breve
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
