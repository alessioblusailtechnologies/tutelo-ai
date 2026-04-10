'use client';

import { isValidElement, ReactNode } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './markdown.module.scss';

// Recursively extract plain text from React children
function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return extractText(props.children);
  }
  return '';
}

const COMPANY_LOGOS: Record<string, { color: string; abbr: string }> = {
  'generali': { color: '#C8102E', abbr: 'GE' },
  'unipol': { color: '#003DA5', abbr: 'UN' },
  'allianz': { color: '#003781', abbr: 'AL' },
  'axa': { color: '#00008F', abbr: 'AX' },
  'zurich': { color: '#2167AE', abbr: 'ZU' },
  'reale mutua': { color: '#00529B', abbr: 'RM' },
  'cattolica': { color: '#8B1A1A', abbr: 'CA' },
  'sara': { color: '#E30613', abbr: 'SA' },
  'vittoria': { color: '#006633', abbr: 'VI' },
  'helvetia': { color: '#E2001A', abbr: 'HE' },
  'groupama': { color: '#00A651', abbr: 'GR' },
  'linear': { color: '#FF6600', abbr: 'LI' },
  'directline': { color: '#E60000', abbr: 'DL' },
  'prima': { color: '#00C4B3', abbr: 'PR' },
  'genialloyd': { color: '#FF8C00', abbr: 'GL' },
};

function detectCompany(text: string): { color: string; abbr: string } | null {
  const lower = text.toLowerCase().trim();
  for (const [name, info] of Object.entries(COMPANY_LOGOS)) {
    if (lower.includes(name)) return info;
  }
  return null;
}

function isMoneyValue(text: string): boolean {
  return /\d+\s*(euro|€)/i.test(text.trim());
}

function formatCell(text: string): string {
  return text.replace(/(\d+)\s*euro/gi, '€$1').replace(/€\s*(\d+)/g, '€$1');
}

const components: Components = {
  table: ({ children }) => (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className={styles.thead}>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className={styles.tr}>{children}</tr>,
  th: ({ children }) => <th className={styles.th}>{children}</th>,
  td: ({ children }) => {
    const text = extractText(children);
    const company = detectCompany(text);
    const isMoney = isMoneyValue(text);

    if (company) {
      return (
        <td className={styles.td}>
          <div className={styles.companyCell}>
            <span className={styles.companyLogo} style={{ background: company.color }}>
              {company.abbr}
            </span>
            <span className={styles.companyName}>{text.trim()}</span>
          </div>
        </td>
      );
    }

    if (isMoney) {
      return (
        <td className={`${styles.td} ${styles.moneyCell}`}>
          {formatCell(text)}
        </td>
      );
    }

    return <td className={styles.td}>{children}</td>;
  },
  strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
  h1: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
  h2: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
  h3: ({ children }) => <h4 className={styles.h4}>{children}</h4>,
  ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
  ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
  li: ({ children }) => <li className={styles.li}>{children}</li>,
  blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return <code className={styles.codeBlock}>{children}</code>;
    }
    return <code className={styles.codeInline}>{children}</code>;
  },
  pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
  p: ({ children }) => <p className={styles.p}>{children}</p>,
  hr: () => <hr className={styles.hr} />,
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
    </div>
  );
}
