'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Topbar from '@/components/topbar/Topbar';
import VisualizationRenderer from '@/components/viste/VisualizationRenderer';
import type { ViewDefinition, ViewResult } from '@/lib/viste/types';
import styles from '../viste.module.scss';

interface Vista {
  id: string;
  name: string;
  description: string | null;
  prompt: string | null;
  definition: ViewDefinition;
  created_at: string;
  updated_at: string;
}

export default function VistaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [vista, setVista] = useState<Vista | null>(null);
  const [result, setResult] = useState<ViewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/viste/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.vista) setVista(data.vista);
        if (data.result) setResult(data.result);
        if (data.error) setError(data.error);
      })
      .catch((err) => setError(err?.message || 'Errore'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Viste personalizzate', href: '/viste' },
          { label: vista?.name || '...' },
        ]}
      />
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{vista?.name || 'Caricamento...'}</h1>
              {vista?.prompt && <p className={styles.subtitle}>{vista.prompt}</p>}
            </div>
            <Link href="/viste" className={styles.btnSecondary}>
              ← Tutte le viste
            </Link>
          </div>

          {loading ? (
            <div className={styles.loader}>Caricamento dati...</div>
          ) : error ? (
            <div className={styles.error}>Errore: {error}</div>
          ) : vista && result ? (
            <div className={styles.detailCard}>
              <VisualizationRenderer definition={vista.definition} result={result} />
            </div>
          ) : (
            <div className={styles.error}>Vista non trovata</div>
          )}
        </div>
      </div>
    </>
  );
}
