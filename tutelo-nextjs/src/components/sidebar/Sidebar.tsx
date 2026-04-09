'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  WorkflowCircle01Icon,
  InboxIcon,
  Link01Icon,
  Logout01Icon,
  ArrowDown01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';
import { useAuth } from '@/contexts/AuthContext';
import styles from './sidebar.module.scss';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, userInitials, userEmail, logout } = useAuth();
  const [convOpen, setConvOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetch('/api/messages')
      .then((r) => r.json())
      .then((data) => {
        if (data.conversations) setConversations(data.conversations);
      })
      .catch(() => {});
  }, [pathname]); // refetch when navigating

  const isAssistantActive = pathname === '/assistente' || pathname.startsWith('/assistente/');

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <div>
          <div className={styles.logoName}>
            tutelo<span className={styles.logoAi}>.ai</span>
          </div>
          <div className={styles.logoTagline}>INTELLIGENZA ASSICURATIVA</div>
        </div>
      </div>

      <div className={styles.sidebarSection}>
        <button
          className={styles.newChatBtn}
          onClick={() => router.push('/assistente')}
          title="Nuova chat"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" strokeWidth={2} />
          <span>Nuova chat</span>
        </button>

        <div className={styles.sidebarSectionLabel}>Principale</div>

        {/* Assistant with collapsable conversations */}
        <div className={styles.navGroup}>
          <Link
            href="/assistente"
            className={`${styles.navItem} ${styles.navItemExpandable} ${isAssistantActive ? styles.active : ''}`}
          >
            <HugeiconsIcon icon={AiChat02Icon} size={18} color="currentColor" strokeWidth={1.5} />
            <span className={styles.navItemLabel}>Assistant</span>
            {conversations.length > 0 && (
              <button
                className={`${styles.collapseBtn} ${convOpen ? styles.open : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConvOpen((v) => !v); }}
                title={convOpen ? 'Nascondi chat' : 'Mostra chat'}
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={12}
                  color="currentColor"
                  strokeWidth={2}
                />
              </button>
            )}
          </Link>

          {conversations.length > 0 && (
            <div className={`${styles.convListWrapper} ${convOpen ? styles.open : ''}`}>
              <div className={styles.convListInner}>
                <div className={styles.convList}>
                  {conversations.slice(0, 15).map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/assistente/${conv.id}`}
                      className={`${styles.convItem} ${pathname === `/assistente/${conv.id}` ? styles.active : ''}`}
                      title={conv.title || 'Chat senza titolo'}
                    >
                      <span className={styles.convItemText}>{conv.title || 'Chat senza titolo'}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/agenti"
          className={`${styles.navItem} ${pathname === '/agenti' || pathname.startsWith('/agenti/') ? styles.active : ''}`}
        >
          <HugeiconsIcon icon={WorkflowCircle01Icon} size={18} color="currentColor" strokeWidth={1.5} />
          Workflows
        </Link>
      </div>

      <div className={styles.sidebarSection}>
        <div className={styles.sidebarSectionLabel}>Collegamenti</div>
        <Link
          href="/dashboard"
          className={`${styles.navItem} ${pathname === '/dashboard' || pathname.startsWith('/dashboard/') ? styles.active : ''}`}
        >
          <HugeiconsIcon icon={InboxIcon} size={18} color="currentColor" strokeWidth={1.5} />
          Inbox
        </Link>
        <Link
          href="/canali"
          className={`${styles.navItem} ${pathname === '/canali' || pathname.startsWith('/canali/') ? styles.active : ''}`}
        >
          <HugeiconsIcon icon={Link01Icon} size={18} color="currentColor" strokeWidth={1.5} />
          Canali collegati
        </Link>
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{userInitials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{profile?.full_name || 'Agenzia Raso'}</div>
            <div className={styles.userEmail}>{userEmail}</div>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Esci">
            <HugeiconsIcon icon={Logout01Icon} size={16} color="currentColor" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
