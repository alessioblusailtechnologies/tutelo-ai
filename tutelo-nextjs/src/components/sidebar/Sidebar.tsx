'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './sidebar.module.scss';

// Inline SVG icons to replace Hugeicons
function AiChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453.178.356.237.763.134 1.148l-.595 2.226a1.3 1.3 0 0 0 1.591 1.591l2.226-.595a1.634 1.634 0 0 1 1.148.134A9.958 9.958 0 0 0 12 22Z" />
      <path d="M8 10.5h8M8 14h5" />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
      <circle cx="16" cy="16" r="2" />
      <path d="M12 10v2M10.5 14.5 11 13M13.5 14.5 13 13" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 13h4.5a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v0a1.5 1.5 0 0 1 1.5-1.5H21" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const NAV_ITEMS = [
  { section: 'Principale', items: [
    { href: '/assistente', label: 'Assistant', icon: AiChatIcon },
    { href: '/agenti', label: 'Workflows', icon: WorkflowIcon },
  ]},
  { section: 'Collegamenti', items: [
    { href: '/dashboard', label: 'Inbox', icon: InboxIcon },
    { href: '/canali', label: 'Canali collegati', icon: LinkIcon },
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
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon />
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
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
