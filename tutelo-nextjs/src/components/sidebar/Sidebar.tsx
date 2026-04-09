'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  WorkflowCircle01Icon,
  InboxIcon,
  Link01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import { useAuth } from '@/contexts/AuthContext';
import styles from './sidebar.module.scss';

const NAV_ITEMS = [
  { section: 'Principale', items: [
    { href: '/assistente', label: 'Assistant', icon: AiChat02Icon },
    { href: '/agenti', label: 'Workflows', icon: WorkflowCircle01Icon },
  ]},
  { section: 'Collegamenti', items: [
    { href: '/dashboard', label: 'Inbox', icon: InboxIcon },
    { href: '/canali', label: 'Canali collegati', icon: Link01Icon },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, userInitials, userEmail, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <svg width="26" height="26" viewBox="0 0 72 72" fill="none">
          <defs>
            <linearGradient id="sl1" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3A82D4" />
              <stop offset="100%" stopColor="#5BAAFF" />
            </linearGradient>
          </defs>
          <circle cx="17" cy="18" r="11" fill="url(#sl1)" />
          <circle cx="55" cy="18" r="11" fill="url(#sl1)" />
          <circle cx="17" cy="18" r="6" fill="white" opacity="0.15" />
          <circle cx="55" cy="18" r="6" fill="white" opacity="0.15" />
          <ellipse cx="36" cy="44" rx="28" ry="26" fill="url(#sl1)" />
          <circle cx="26" cy="40" r="5" fill="white" opacity="0.95" />
          <circle cx="46" cy="40" r="5" fill="white" opacity="0.95" />
          <circle cx="26" cy="40" r="2.5" fill="#1A3A6B" />
          <circle cx="46" cy="40" r="2.5" fill="#1A3A6B" />
          <circle cx="27.5" cy="38.5" r="1" fill="white" opacity="0.8" />
          <circle cx="47.5" cy="38.5" r="1" fill="white" opacity="0.8" />
          <ellipse cx="36" cy="51" rx="5.5" ry="4" fill="white" opacity="0.6" />
        </svg>
        <div>
          <div className={styles.logoName}>
            tutelo<span className={styles.logoAi}>.ai</span>
          </div>
          <div className={styles.logoTagline}>INTELLIGENZA ASSICURATIVA</div>
        </div>
      </div>

      {NAV_ITEMS.map((section) => (
        <div key={section.section} className={styles.sidebarSection}>
          <div className={styles.sidebarSectionLabel}>{section.section}</div>
          {section.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <HugeiconsIcon icon={item.icon} size={18} color="currentColor" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}

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
