import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { marked, type Token, type Tokens } from 'marked';

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    color: '#1B3D6F',
    lineHeight: 1.5,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2563B0',
  },
  brandBlock: {
    flexDirection: 'column',
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0A1929',
  },
  brandAi: {
    color: '#2563B0',
  },
  tagline: {
    fontSize: 7,
    color: '#7A9CC0',
    letterSpacing: 1,
    marginTop: 2,
  },
  metaBlock: {
    fontSize: 8.5,
    color: '#7A9CC0',
    textAlign: 'right',
  },
  // Title
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0A1929',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: '#7A9CC0',
    marginBottom: 24,
  },
  // Content blocks
  h1: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0A1929',
    marginTop: 16,
    marginBottom: 8,
  },
  h2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0A1929',
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    fontSize: 11.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1B3D6F',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10.5,
    color: '#1B3D6F',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 8,
  },
  listBullet: {
    width: 12,
    fontSize: 10.5,
    color: '#2563B0',
  },
  listText: {
    flex: 1,
    fontSize: 10.5,
  },
  // Table
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#F4F7FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9.5,
  },
  tableCellHeader: {
    flex: 1,
    padding: 8,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#7A9CC0',
    textTransform: 'uppercase',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#A0B8CC',
  },
  hr: {
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
    marginVertical: 10,
  },
});

// ============================================================
// Inline rendering (bold, italic, plain text)
// ============================================================
function renderInline(text: string): React.ReactNode {
  // Simple parser for **bold**, *italic*, and plain text
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<Text key={key++} style={styles.bold}>{match[2]}</Text>);
    } else if (match[3]) {
      parts.push(<Text key={key++} style={styles.italic}>{match[3]}</Text>);
    } else if (match[4]) {
      parts.push(<Text key={key++} style={styles.italic}>{match[4]}</Text>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

// ============================================================
// Token → react-pdf component
// ============================================================
function renderToken(token: Token, key: number): React.ReactNode {
  switch (token.type) {
    case 'heading': {
      const t = token as Tokens.Heading;
      const style = t.depth === 1 ? styles.h1 : t.depth === 2 ? styles.h2 : styles.h3;
      return <Text key={key} style={style}>{renderInline(t.text)}</Text>;
    }
    case 'paragraph': {
      const t = token as Tokens.Paragraph;
      return <Text key={key} style={styles.paragraph}>{renderInline(t.text)}</Text>;
    }
    case 'list': {
      const t = token as Tokens.List;
      return (
        <View key={key} style={{ marginBottom: 8 }}>
          {t.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.listBullet}>{t.ordered ? `${i + 1}.` : '•'}</Text>
              <Text style={styles.listText}>{renderInline(item.text)}</Text>
            </View>
          ))}
        </View>
      );
    }
    case 'table': {
      const t = token as Tokens.Table;
      return (
        <View key={key} style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {t.header.map((cell, i) => (
              <Text key={i} style={styles.tableCellHeader}>{cell.text}</Text>
            ))}
          </View>
          {t.rows.map((row, ri) => {
            const isLast = ri === t.rows.length - 1;
            return (
              <View key={ri} style={isLast ? styles.tableRowLast : styles.tableRow}>
                {row.map((cell, ci) => (
                  <Text key={ci} style={styles.tableCell}>{renderInline(cell.text)}</Text>
                ))}
              </View>
            );
          })}
        </View>
      );
    }
    case 'hr':
      return <View key={key} style={styles.hr} />;
    case 'space':
      return <View key={key} style={{ height: 6 }} />;
    case 'blockquote': {
      const t = token as Tokens.Blockquote;
      return (
        <View key={key} style={{ borderLeftWidth: 3, borderLeftColor: '#3A82D4', paddingLeft: 10, marginVertical: 8 }}>
          {t.tokens?.map((tok, i) => renderToken(tok, i))}
        </View>
      );
    }
    default:
      // Fallback: show raw text if any
      if ('text' in token && typeof token.text === 'string') {
        return <Text key={key} style={styles.paragraph}>{token.text}</Text>;
      }
      return null;
  }
}

// ============================================================
// Document component
// ============================================================
interface PdfDocumentProps {
  title: string;
  subtitle?: string;
  contentMarkdown: string;
  meta?: { label: string; value: string }[];
}

export function PdfDocument({ title, subtitle, contentMarkdown, meta }: PdfDocumentProps) {
  const tokens = marked.lexer(contentMarkdown);
  const today = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>
              tutelo<Text style={styles.brandAi}>.ai</Text>
            </Text>
            <Text style={styles.tagline}>INTELLIGENZA ASSICURATIVA</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text>{today}</Text>
            {meta?.map((m, i) => (
              <Text key={i}>{m.label}: {m.value}</Text>
            ))}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Content */}
        {tokens.map((token, i) => renderToken(token, i))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Tutelo AI - Documento generato automaticamente</Text>
          <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} di ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
